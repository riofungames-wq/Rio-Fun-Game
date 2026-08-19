/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   PREMIUM CUSTOMER DASHBOARD — FINAL CUSTOMER BUILD

   LOYALTY RULES:
   - 40-DAY LOYALTY CYCLE
   - 6 VALID STAMPS
   - 7TH VISUAL CIRCLE = FREE VEG MAGGI
   - 7TH CIRCLE IS NOT A STAMP
   - UNCLAIMED CYCLE EXPIRES AFTER 40 DAYS

   ARCHITECTURE:
   - ONE COMMON CUSTOMER DASHBOARD
   - CUSTOMER SIDE ONLY
   - NO ADMIN CODE
   - NO FIREBASE INITIALIZATION HERE
   - FIREBASE -> CENTRALIZED app.js
===================================================== */


/* =====================================================
   CENTRAL APP IMPORTS
===================================================== */

import {
    auth,
    db,
    APP_CONFIG,
    waitForAuth
} from "../app.js";


import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =====================================================
   CONFIGURATION
===================================================== */

const STAMP_LIMIT =
    Number(
        APP_CONFIG?.loyaltyStampsRequired
    ) || 6;


const CARD_SLOTS =
    Number(
        APP_CONFIG?.loyaltyCardSlots
    ) || 7;


const CYCLE_DAYS =
    Number(
        APP_CONFIG?.loyaltyCycleDays
    ) || 40;


const DEFAULT_AVATAR =
    "assets/avatars/default.png";


/* =====================================================
   INTERNAL STATE
===================================================== */

let dashboardInitialized = false;

let navigationInitialized = false;

let logoutInitialized = false;

let notificationInitialized = false;

let announcementsInitialized = false;

let feedbackInitialized = false;

let currentCustomer = null;

let selectedFeedbackRating = 0;


/* =====================================================
   DOM HELPER
===================================================== */

function getElement(id) {

    return document.getElementById(id);

}


/* =====================================================
   DOM REFERENCES
===================================================== */

const welcomeName =
    getElement("welcomeName");

const customerName =
    getElement("customerName");

const memberId =
    getElement("memberId");

const customerAvatar =
    getElement("customerAvatar");

const loyaltyAvatar =
    getElement("loyaltyAvatar");

const qrCustomerName =
    getElement("qrCustomerName");

const qrStampCount =
    getElement("qrStampCount");

const stampCountElement =
    getElement("stampCount");

const cycleDaysRemaining =
    getElement("cycleDaysRemaining");

const cycleStatus =
    getElement("cycleStatus");

const rewardStatus =
    getElement("rewardStatus");

const loyaltyProgress =
    getElement("loyaltyProgress");

const loyaltyProgressBar =
    getElement("loyaltyProgressBar");

const logoutBtn =
    getElement("logoutBtn");

const notificationBtn =
    getElement("notificationBtn");

const profileContent =
    getElement("profileContent");

const historyList =
    getElement("historyList");

const feedbackContent =
    getElement("feedbackContent");

const specialOfferContainer =
    getElement("specialOfferContainer");

const announcementList =
    getElement("announcementList");

const customerQrCode =
    getElement("customerQrCode");

const viewAllAnnouncements =
    getElement("viewAllAnnouncements");

const stampBoxes = [

    getElement("stamp1"),

    getElement("stamp2"),

    getElement("stamp3"),

    getElement("stamp4"),

    getElement("stamp5"),

    getElement("stamp6"),

    getElement("stamp7")

];


/* =====================================================
   SAFE NUMBER
===================================================== */

function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


/* =====================================================
   NORMALIZE STAMP COUNT

   IMPORTANT:
   Only 6 valid stamps are counted.
   stamp7 is reward only.
===================================================== */

function normalizeStampCount(value) {

    const number =
        safeNumber(
            value,
            0
        );

    return Math.max(
        0,
        Math.min(
            Math.floor(number),
            STAMP_LIMIT
        )
    );

}


/* =====================================================
   CUSTOMER DISPLAY NAME
===================================================== */

function getCustomerDisplayName(customer) {

    if (!customer) {

        return "Premium Member";

    }

    const name =
        customer.name ||
        customer.displayName ||
        customer.fullName ||
        "Premium Member";

    return (
        String(name).trim() ||
        "Premium Member"
    );

}


/* =====================================================
   CUSTOMER AVATAR
===================================================== */

function getCustomerAvatar(customer) {

    if (!customer) {

        return DEFAULT_AVATAR;

    }

    return (
        customer.photoURL ||
        customer.avatar ||
        customer.profilePhoto ||
        DEFAULT_AVATAR
    );

}


/* =====================================================
   SAFE AVATAR
===================================================== */

function setAvatar(
    element,
    source
) {

    if (!element) {

        return;

    }

    element.onerror =
        function () {

            this.onerror =
                null;

            this.src =
                DEFAULT_AVATAR;

        };

    element.src =
        source ||
        DEFAULT_AVATAR;

}


/* =====================================================
   BUILD MEMBER ID FALLBACK
===================================================== */

function buildMemberId(uid) {

    const cleanUid =
        String(uid || "");

    if (!cleanUid) {

        return "RIO-000000";

    }

    return (
        "RIO-" +
        cleanUid
            .substring(
                0,
                8
            )
            .toUpperCase()
    );

}


/* =====================================================
   CUSTOMER MEMBER ID
===================================================== */

function getCustomerMemberId(customer) {

    if (!customer) {

        return "RIO-000000";

    }

    return (
        customer.memberId ||
        customer.memberID ||
        customer.customerId ||
        customer.customerID ||
        buildMemberId(
            customer.uid
        )
    );

}


/* =====================================================
   GET CUSTOMER STAMPS
===================================================== */

function getCustomerStampCount(customer) {

    if (!customer) {

        return 0;

    }

    return normalizeStampCount(

        customer.stamps ??
        customer.stampCount ??
        customer.validStamps ??
        0

    );

}


/* =====================================================
   REWARD CLAIMED STATE
===================================================== */

function isRewardClaimed(customer) {

    if (!customer) {

        return false;

    }

    return (

        customer.rewardClaimed === true ||

        customer.rewardRedeemed === true ||

        customer.rewardStatus ===
            "claimed" ||

        customer.rewardStatus ===
            "redeemed"

    );

}


/* =====================================================
   DATE NORMALIZER
===================================================== */

function toDateValue(value) {

    if (!value) {

        return null;

    }

    if (
        typeof value === "object" &&
        typeof value.toDate ===
            "function"
    ) {

        const date =
            value.toDate();

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }

    if (
        typeof value === "object" &&
        typeof value.seconds ===
            "number"
    ) {

        const date =
            new Date(
                value.seconds * 1000
            );

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(value) {

    const date =
        toDateValue(
            value
        );

    if (!date) {

        return "";

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    );

}


/* =====================================================
   UPDATE CUSTOMER NAMES
===================================================== */

function updateCustomerNames(customer) {

    const name =
        getCustomerDisplayName(
            customer
        );

    if (welcomeName) {

        welcomeName.textContent =
            `Hello, ${name} 👋`;

    }

    if (customerName) {

        customerName.textContent =
            name;

    }

    if (qrCustomerName) {

        qrCustomerName.textContent =
            name;

    }

}


/* =====================================================
   UPDATE MEMBER ID
===================================================== */

function updateMemberId(customer) {

    if (!memberId) {

        return;

    }

    const id =
        getCustomerMemberId(
            customer
        );

    memberId.textContent =
        `Member ID : ${id}`;

}


/* =====================================================
   UPDATE CUSTOMER AVATARS
===================================================== */

function updateCustomerAvatars(customer) {

    const avatar =
        getCustomerAvatar(
            customer
        );

    setAvatar(
        customerAvatar,
        avatar
    );

    setAvatar(
        loyaltyAvatar,
        avatar
    );

}


/* =====================================================
   UPDATE STAMP COUNT
===================================================== */

function updateStampCountUI(
    count
) {

    const total =
        normalizeStampCount(
            count
        );

    if (stampCountElement) {

        stampCountElement.textContent =
            String(total);

    }

    if (qrStampCount) {

        qrStampCount.textContent =
            String(total);

    }

}


/* =====================================================
   UPDATE STAMP / REWARD CIRCLES

   1-6 -> actual stamps
   7   -> FREE reward
===================================================== */

function updateStampBoxes(
    count,
    rewardUnlocked = false,
    rewardClaimed = false
) {

    const total =
        normalizeStampCount(
            count
        );


    /*
     * ---------------------------------------------
     * STAMP CIRCLES 1-6
     * ---------------------------------------------
     */

    stampBoxes
        .slice(
            0,
            STAMP_LIMIT
        )
        .forEach(
            (
                box,
                index
            ) => {

                if (!box) {

                    return;

                }

                box.classList.remove(
                    "active",
                    "completed",
                    "locked"
                );


                if (index < total) {

                    box.classList.add(
                        "active",
                        "completed"
                    );

                }

                else {

                    box.classList.add(
                        "locked"
                    );

                }

            }
        );


    /*
     * ---------------------------------------------
     * 7TH REWARD CIRCLE
     * ---------------------------------------------
     */

    const rewardBox =
        stampBoxes[STAMP_LIMIT];


    if (!rewardBox) {

        return;

    }


    rewardBox.classList.remove(
        "active",
        "completed",
        "locked",
        "reward-unlocked",
        "reward-claimed"
    );


    if (rewardClaimed) {

        rewardBox.classList.add(
            "reward-claimed",
            "completed"
        );

        return;

    }


    if (rewardUnlocked) {

        rewardBox.classList.add(
            "reward-unlocked",
            "active"
        );

        return;

    }


    rewardBox.classList.add(
        "locked"
    );

}


/* =====================================================
   UPDATE PROGRESS BAR

   Progress is ALWAYS based on 6 stamps.
===================================================== */

function updateProgressBar(
    count
) {

    const total =
        normalizeStampCount(
            count
        );


    const percentage =
        Math.round(
            (
                total /
                STAMP_LIMIT
            ) * 100
        );


    if (!loyaltyProgress) {

        return;

    }


    loyaltyProgress.style.width =
        `${percentage}%`;


    if (
        loyaltyProgressBar
    ) {

        loyaltyProgressBar.setAttribute(
            "aria-valuenow",
            String(total)
        );


        loyaltyProgressBar.setAttribute(
            "aria-valuemin",
            "0"
        );


        loyaltyProgressBar.setAttribute(
            "aria-valuemax",
            String(STAMP_LIMIT)
        );

    }

}


/* =====================================================
   GET CYCLE START
===================================================== */

function getCycleStartDate(
    customer
) {

    if (!customer) {

        return null;

    }

    return toDateValue(

        customer.cycleStartDate ||

        customer.loyaltyCycleStart ||

        customer.stampCycleStart ||

        customer.cycleStartedAt ||

        null

    );

}


/* =====================================================
   CALCULATE CYCLE DAYS REMAINING
===================================================== */

function calculateCycleDaysRemaining(
    customer
) {

    if (!customer) {

        return CYCLE_DAYS;

    }


    /*
     * Prefer backend/server calculated value.
     */

    const explicitRemaining =
        Number(
            customer.cycleDaysRemaining
        );


    if (
        Number.isFinite(
            explicitRemaining
        )
    ) {

        return Math.max(
            0,
            Math.min(
                Math.floor(
                    explicitRemaining
                ),
                CYCLE_DAYS
            )
        );

    }


    const compatibilityRemaining =
        Number(
            customer.daysRemaining
        );


    if (
        Number.isFinite(
            compatibilityRemaining
        )
    ) {

        return Math.max(
            0,
            Math.min(
                Math.floor(
                    compatibilityRemaining
                ),
                CYCLE_DAYS
            )
        );

    }


    const cycleStart =
        getCycleStartDate(
            customer
        );


    if (!cycleStart) {

        return CYCLE_DAYS;

    }


    const now =
        new Date();


    const elapsedMilliseconds =
        Math.max(
            0,
            now.getTime() -
            cycleStart.getTime()
        );


    const elapsedDays =
        Math.floor(
            elapsedMilliseconds /
            86400000
        );


    return Math.max(
        0,
        CYCLE_DAYS -
        elapsedDays
    );

}


/* =====================================================
   GET LOYALTY CYCLE STATE
===================================================== */

function getLoyaltyCycleState(
    customer
) {

    const stamps =
        getCustomerStampCount(
            customer
        );


    const rewardClaimed =
        isRewardClaimed(
            customer
        );


    const daysRemaining =
        calculateCycleDaysRemaining(
            customer
        );


    const rewardUnlocked =
        stamps >= STAMP_LIMIT;


    const expired =
        daysRemaining <= 0;


    let status =
        "active";


    if (
        rewardClaimed
    ) {

        status =
            "claimed";

    }

    else if (
        rewardUnlocked &&
        !expired
    ) {

        status =
            "reward-unlocked";

    }

    else if (
        expired
    ) {

        status =
            "expired";

    }


    return {

        stamps,

        stampLimit:
            STAMP_LIMIT,

        cardSlots:
            CARD_SLOTS,

        daysRemaining,

        cycleDays:
            CYCLE_DAYS,

        rewardUnlocked,

        rewardClaimed,

        expired,

        status

    };

}


/* =====================================================
   UPDATE CYCLE DISPLAY
===================================================== */

function updateCycleDays(
    customer
) {

    if (!cycleDaysRemaining) {

        return;

    }


    const state =
        getLoyaltyCycleState(
            customer
        );


    const remaining =
        state.daysRemaining;


    cycleDaysRemaining.textContent =
        `${remaining} Day${
            remaining === 1
                ? ""
                : "s"
        }`;


    if (!cycleStatus) {

        return;

    }


    cycleStatus.classList.remove(
        "active",
        "warning",
        "expired"
    );


    /*
     * ---------------------------------------------
     * EXPIRED
     * ---------------------------------------------
     */

    if (
        state.expired &&
        !state.rewardClaimed
    ) {

        cycleStatus.classList.add(
            "expired"
        );


        cycleStatus.textContent =
            "Your 40-day loyalty cycle has expired.";

        return;

    }


    /*
     * ---------------------------------------------
     * REWARD UNLOCKED
     * ---------------------------------------------
     */

    if (
        state.rewardUnlocked &&
        !state.rewardClaimed
    ) {

        cycleStatus.classList.add(
            "active"
        );


        cycleStatus.textContent =
            "FREE Veg Maggi is unlocked. Claim your reward before the cycle expires.";

        return;

    }


    /*
     * ---------------------------------------------
     * WARNING
     * ---------------------------------------------
     */

    if (
        remaining <= 7
    ) {

        cycleStatus.classList.add(
            "warning"
        );


        cycleStatus.textContent =
            `Your 40-day loyalty cycle expires in ${remaining} day${
                remaining === 1
                    ? ""
                    : "s"
            }.`;

        return;

    }


    /*
     * ---------------------------------------------
     * ACTIVE
     * ---------------------------------------------
     */

    cycleStatus.classList.add(
        "active"
    );


    cycleStatus.textContent =
        "Your 40-day loyalty cycle is active.";

}


/* =====================================================
   UPDATE REWARD STATUS
===================================================== */

function updateRewardStatus(
    stampCount,
    rewardClaimed = false,
    cycleExpired = false
) {

    if (!rewardStatus) {

        return;

    }


    const total =
        normalizeStampCount(
            stampCount
        );


    rewardStatus.classList.remove(
        "reward-used",
        "reward-unlocked",
        "reward-locked",
        "reward-expired"
    );


    /*
     * CLAIMED
     */

    if (rewardClaimed) {

        rewardStatus.classList.add(
            "reward-used"
        );


        rewardStatus.innerHTML = `

            <strong>
                🎉 FREE Veg Maggi Claimed
            </strong>

            <span>
                Your reward has been redeemed.
            </span>

        `;


        return;

    }


    /*
     * EXPIRED
     */

    if (
        cycleExpired
    ) {

        rewardStatus.classList.add(
            "reward-expired"
        );


        rewardStatus.innerHTML = `

            <strong>
                ⏰ Loyalty Cycle Expired
            </strong>

            <span>
                Your ${total} stamp${
                    total === 1
                        ? ""
                        : "s"
                } were not completed and claimed within 40 days.
            </span>

        `;


        return;

    }


    /*
     * UNLOCKED
     */

    if (
        total >= STAMP_LIMIT
    ) {

        rewardStatus.classList.add(
            "reward-unlocked"
        );


        rewardStatus.innerHTML = `

            <strong>
                🎉 FREE Veg Maggi Unlocked!
            </strong>

            <span>
                All 6 valid stamps are complete.
                Claim your FREE Veg Maggi before the 40-day cycle expires.
            </span>

        `;


        return;

    }


    /*
     * LOCKED
     */

    rewardStatus.classList.add(
        "reward-locked"
    );


    const remaining =
        STAMP_LIMIT -
        total;


    rewardStatus.innerHTML = `

        <strong>
            Reward Locked
        </strong>

        <span>
            Collect ${remaining} more valid
            stamp${remaining === 1 ? "" : "s"}
            to unlock FREE Veg Maggi 🍜
        </span>

    `;

}


/* =====================================================
   UPDATE COMPLETE LOYALTY UI
===================================================== */

function updateStamps(
    count = 0,
    rewardClaimed = false,
    cycleExpired = false
) {

    const total =
        normalizeStampCount(
            count
        );


    const rewardUnlocked =
        total >= STAMP_LIMIT &&
        !cycleExpired &&
        !rewardClaimed;


    updateStampCountUI(
        total
    );


    updateStampBoxes(
        total,
        rewardUnlocked,
        rewardClaimed
    );


    updateProgressBar(
        total
    );


    updateRewardStatus(
        total,
        rewardClaimed,
        cycleExpired
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   RENDER PROFILE
===================================================== */

function renderProfileSection(
    customer
) {

    if (!profileContent) {

        return;

    }


    const name =
        getCustomerDisplayName(
            customer
        );


    const email =
        customer?.email ||
        auth.currentUser?.email ||
        "";


    const gender =
        customer?.gender ||
        "";


    const dob =
        customer?.dob ||
        customer?.dateOfBirth ||
        "";


    const member =
        getCustomerMemberId(
            customer
        );


    const photo =
        getCustomerAvatar(
            customer
        );


    const dobText =
        formatDate(
            dob
        );


    const stamps =
        getCustomerStampCount(
            customer
        );


    const dobLocked =
        Boolean(
            dob
        );


    profileContent.innerHTML = `

        <div class="dashboard-profile-card">

            <div class="dashboard-profile-top">

                <div class="dashboard-profile-avatar">

                    <img
                        src="${escapeHTML(photo)}"
                        alt="Customer profile"
                    >

                </div>


                <div class="dashboard-profile-identity">

                    <h3>
                        ${escapeHTML(name)}
                    </h3>


                    <p>
                        ${escapeHTML(email)}
                    </p>


                    <span class="dashboard-profile-member-badge">

                        <i class="fa-solid fa-crown"></i>

                        Premium Member

                    </span>

                </div>

            </div>


            <div class="dashboard-profile-info-grid">

                <div class="dashboard-profile-info-item">

                    <span>
                        Member ID
                    </span>

                    <strong>
                        ${escapeHTML(member)}
                    </strong>

                </div>


                <div class="dashboard-profile-info-item">

                    <span>
                        Gender
                    </span>

                    <strong>
                        ${
                            gender
                                ? escapeHTML(
                                    String(
                                        gender
                                    )
                                        .charAt(
                                            0
                                        )
                                        .toUpperCase() +
                                    String(
                                        gender
                                    )
                                        .slice(
                                            1
                                        )
                                )
                                : "Not Set"
                        }
                    </strong>

                </div>


                <div class="dashboard-profile-info-item">

                    <span>
                        Date of Birth
                    </span>

                    <strong>
                        ${
                            dobText ||
                            "Not Set"
                        }
                    </strong>

                </div>


                <div class="dashboard-profile-info-item">

                    <span>
                        Loyalty
                    </span>

                    <strong>
                        ${stamps}/${STAMP_LIMIT}
                    </strong>

                </div>

            </div>


            <div class="dashboard-profile-note">

                <i class="fa-solid fa-shield-halved"></i>

                <span>
                    ${
                        dobLocked

                            ? "Date of Birth is protected. Changes require admin approval."

                            : "Date of Birth can be set once. Future changes require admin approval."
                    }
                </span>

            </div>

        </div>

    `;


    const profileImage =
        profileContent.querySelector(
            ".dashboard-profile-avatar img"
        );


    if (profileImage) {

        profileImage.onerror =
            function () {

                this.onerror =
                    null;

                this.src =
                    DEFAULT_AVATAR;

            };

    }

}


/* =====================================================
   RENDER HISTORY
===================================================== */

function renderHistorySection(
    customer
) {

    if (!historyList) {

        return;

    }


    const history =

        Array.isArray(
            customer?.stampHistory
        )

            ? customer.stampHistory

            : Array.isArray(
                customer?.history
            )

                ? customer.history

                : [];


    if (!history.length) {

        historyList.innerHTML = `

            <div class="history-empty">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <h3>
                    No loyalty history yet
                </h3>

                <p>
                    Your valid stamp activity will appear here.
                </p>

            </div>

        `;


        return;

    }


    historyList.innerHTML =

        history
            .slice(
                0,
                30
            )
            .map(
                (
                    item,
                    index
                ) => {

                    const date =
                        item?.date ||
                        item?.createdAt ||
                        item?.timestamp ||
                        "";


                    const stamp =
                        item?.stamp ??
                        item?.stampNumber ??
                        item?.stamps ??
                        (
                            index + 1
                        );


                    const text =
                        item?.description ||
                        item?.action ||
                        "Loyalty stamp recorded";


                    return `

                        <div class="history-item">

                            <div class="history-item-icon">

                                <i class="fa-solid fa-star"></i>

                            </div>


                            <div class="history-item-content">

                                <strong>
                                    ${escapeHTML(
                                        text
                                    )}
                                </strong>


                                <span>
                                    Stamp ${
                                        escapeHTML(
                                            stamp
                                        )
                                    }
                                </span>

                            </div>


                            <time>
                                ${escapeHTML(
                                    formatDate(
                                        date
                                    ) ||
                                    "—"
                                )}
                            </time>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   RENDER FEEDBACK
===================================================== */

function renderFeedbackSection(
    customer
) {

    if (!feedbackContent) {

        return;

    }


    const existingFeedback =
        customer?.lastFeedback ||
        customer?.feedback ||
        null;


    feedbackContent.innerHTML = `

        <div class="dashboard-feedback-card">

            <div class="dashboard-feedback-icon">

                <i class="fa-solid fa-star"></i>

            </div>


            <h3>
                Tell Us About Your Experience
            </h3>


            <p>
                Share what you enjoyed at Rio Maggi Point.
            </p>


            <div class="dashboard-rating">

                <button
                    type="button"
                    data-rating="1"
                    aria-label="Rate 1 star"
                >
                    ★
                </button>


                <button
                    type="button"
                    data-rating="2"
                    aria-label="Rate 2 stars"
                >
                    ★
                </button>


                <button
                    type="button"
                    data-rating="3"
                    aria-label="Rate 3 stars"
                >
                    ★
                </button>


                <button
                    type="button"
                    data-rating="4"
                    aria-label="Rate 4 stars"
                >
                    ★
                </button>


                <button
                    type="button"
                    data-rating="5"
                    aria-label="Rate 5 stars"
                >
                    ★
                </button>

            </div>


            <textarea
                class="dashboard-feedback-textarea"
                id="dashboardFeedbackText"
                maxlength="500"
                placeholder="Tell us what you enjoyed..."
            >${escapeHTML(
                existingFeedback?.message ||
                ""
            )}</textarea>


            <button
                type="button"
                class="dashboard-feedback-submit"
                id="dashboardFeedbackSubmit"
            >

                <i class="fa-solid fa-paper-plane"></i>

                Submit Feedback

            </button>


            <div
                id="dashboardFeedbackMessage"
                class="dashboard-feedback-message"
                role="status"
                aria-live="polite"
            ></div>

        </div>

    `;


    initializeFeedbackControls();

}


/* =====================================================
   FEEDBACK CONTROLS
===================================================== */

function initializeFeedbackControls() {

    if (feedbackInitialized) {

        return;

    }


    feedbackInitialized =
        true;


    selectedFeedbackRating =
        0;


    const ratingButtons =
        feedbackContent?.querySelectorAll(
            "[data-rating]"
        );


    ratingButtons?.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedFeedbackRating =
                        Number(
                            button.dataset.rating
                        );


                    ratingButtons.forEach(
                        item => {

                            item.classList.toggle(
                                "selected",
                                Number(
                                    item.dataset.rating
                                ) <=
                                selectedFeedbackRating
                            );

                        }
                    );

                }
            );

        }
    );


    const submitButton =
        getElement(
            "dashboardFeedbackSubmit"
        );


    if (!submitButton) {

        return;

    }


    submitButton.addEventListener(
        "click",
        () => {

            const textarea =
                getElement(
                    "dashboardFeedbackText"
                );


            const messageBox =
                getElement(
                    "dashboardFeedbackMessage"
                );


            const text =
                textarea?.value
                    ?.trim() ||
                "";


            if (
                selectedFeedbackRating <
                1
            ) {

                if (messageBox) {

                    messageBox.textContent =
                        "Please select a rating.";

                    messageBox.className =
                        "dashboard-feedback-message error";

                }

                return;

            }


            if (!text) {

                if (messageBox) {

                    messageBox.textContent =
                        "Please tell us what you enjoyed.";

                    messageBox.className =
                        "dashboard-feedback-message error";

                }

                return;

            }


            window.dispatchEvent(
                new CustomEvent(
                    "rio-feedback-submit",
                    {
                        detail: {

                            rating:
                                selectedFeedbackRating,

                            message:
                                text,

                            customer:
                                currentCustomer

                        }
                    }
                )
            );


            if (messageBox) {

                messageBox.textContent =
                    "Thank you for your feedback! ❤️";

                messageBox.className =
                    "dashboard-feedback-message success";

            }

        }
    );

}


/* =====================================================
   RENDER SPECIAL OFFER
===================================================== */

function renderSpecialOffer(
    customer
) {

    if (!specialOfferContainer) {

        return;

    }


    const offer =
        customer?.specialOffer ||
        customer?.activeOffer ||
        null;


    if (
        !offer ||
        offer.active === false
    ) {

        specialOfferContainer.innerHTML = `

            <div class="empty-offer">

                <i class="fa-solid fa-gift"></i>

                <h3>
                    No active offer
                </h3>

                <p>
                    Your special offers will appear here.
                </p>

            </div>

        `;


        return;

    }


    specialOfferContainer.innerHTML = `

        <article class="special-offer-card">

            <div class="special-offer-icon">

                <i class="fa-solid fa-gift"></i>

            </div>


            <div class="special-offer-content">

                <span>
                    SPECIAL FOR YOU
                </span>


                <h3>
                    ${escapeHTML(
                        offer.title ||
                        "Special Offer"
                    )}
                </h3>


                <p>
                    ${escapeHTML(
                        offer.description ||
                        ""
                    )}
                </p>

            </div>

        </article>

    `;

}


/* =====================================================
   RENDER ANNOUNCEMENTS
===================================================== */

function renderAnnouncements(
    customer
) {

    if (!announcementList) {

        return;

    }


    const announcements =
        Array.isArray(
            customer?.announcements
        )
            ? customer.announcements
            : [];


    if (!announcements.length) {

        announcementList.innerHTML = `

            <div class="announcement-empty">

                <i class="fa-solid fa-bullhorn"></i>

                <p>
                    No new announcements.
                </p>

            </div>

        `;


        return;

    }


    announcementList.innerHTML =

        announcements
            .slice(
                0,
                5
            )
            .map(
                item => `

                    <article class="announcement-item">

                        <div class="announcement-icon">

                            <i class="fa-solid fa-bullhorn"></i>

                        </div>


                        <div class="announcement-content">

                            <span>
                                ${escapeHTML(
                                    item.type ||
                                    "RIO UPDATE"
                                )}
                            </span>


                            <h3>
                                ${escapeHTML(
                                    item.title ||
                                    "Rio Maggi Point Update"
                                )}
                            </h3>


                            <p>
                                ${escapeHTML(
                                    item.message ||
                                    item.description ||
                                    ""
                                )}
                            </p>

                        </div>

                    </article>

                `
            )
            .join("");

}


/* =====================================================
   QR SECTION HOOK
===================================================== */

function updateQRSection(
    customer
) {

    if (!customerQrCode) {

        return;

    }


    if (
        customer?._authOnlyFallback ===
        true
    ) {

        return;

    }


    window.dispatchEvent(
        new CustomEvent(
            "rio-dashboard-customer-ready-for-qr",
            {
                detail: {
                    customer
                }
            }
        )
    );

}


/* =====================================================
   RENDER COMPLETE CUSTOMER
===================================================== */

function renderCustomer(
    customer
) {

    if (
        !customer ||
        typeof customer !==
            "object"
    ) {

        return;

    }


    const isAuthOnlyFallback =
        customer._authOnlyFallback ===
        true;


    if (!isAuthOnlyFallback) {

        currentCustomer =
            customer;

        window.currentUser =
            customer;

    }


    updateCustomerNames(
        customer
    );


    updateMemberId(
        customer
    );


    updateCustomerAvatars(
        customer
    );


    const state =
        getLoyaltyCycleState(
            customer
        );


    updateStamps(

        state.stamps,

        state.rewardClaimed,

        state.expired

    );


    updateCycleDays(
        customer
    );


    renderProfileSection(
        customer
    );


    renderHistorySection(
        customer
    );


    renderFeedbackSection(
        customer
    );


    renderSpecialOffer(
        customer
    );


    renderAnnouncements(
        customer
    );


    updateQRSection(
        customer
    );


    window.dispatchEvent(
        new CustomEvent(
            "rio-customer-rendered",
            {
                detail: {

                    customer,

                    stamps:
                        state.stamps,

                    rewardClaimed:
                        state.rewardClaimed,

                    rewardUnlocked:
                        state.rewardUnlocked,

                    cycleExpired:
                        state.expired,

                    daysRemaining:
                        state.daysRemaining,

                    authOnlyFallback:
                        isAuthOnlyFallback

                }
            }
        )
    );

}


/* =====================================================
   LOAD REAL FIRESTORE CUSTOMER PROFILE
===================================================== */

async function loadCustomerProfile(
    user
) {

    if (!user?.uid) {

        return null;

    }


    try {

        const customerRef =
            doc(
                db,
                "customers",
                user.uid
            );


        const customerSnap =
            await getDoc(
                customerRef
            );


        if (
            customerSnap.exists()
        ) {

            const firestoreData =
                customerSnap.data();


            return {

                ...firestoreData,

                uid:
                    user.uid,

                email:
                    firestoreData.email ||
                    user.email ||
                    "",

                displayName:
                    firestoreData.name ||
                    user.displayName ||
                    "",

                photoURL:
                    firestoreData.photoURL ||
                    user.photoURL ||
                    ""

            };

        }


        /*
         * Firestore customer document does not exist.
         * Keep auth fallback as UI-only state.
         */

        return {

            uid:
                user.uid,

            email:
                user.email ||
                "",

            name:
                user.displayName ||
                "Premium Member",

            displayName:
                user.displayName ||
                "",

            photoURL:
                user.photoURL ||
                "",

            memberId:
                buildMemberId(
                    user.uid
                ),

            stamps:
                0,

            rewardClaimed:
                false,

            _authOnlyFallback:
                true

        };

    }

    catch (error) {

        console.error(
            "Rio Dashboard Customer Load Error:",
            error
        );


        return {

            uid:
                user.uid,

            email:
                user.email ||
                "",

            name:
                user.displayName ||
                "Premium Member",

            displayName:
                user.displayName ||
                "",

            photoURL:
                user.photoURL ||
                "",

            memberId:
                buildMemberId(
                    user.uid
                ),

            stamps:
                0,

            rewardClaimed:
                false,

            _authOnlyFallback:
                true

        };

    }

}


/* =====================================================
   BOTTOM NAVIGATION
===================================================== */

function initializeBottomNavigation() {

    if (navigationInitialized) {

        return;

    }


    const navItems =
        document.querySelectorAll(
            ".bottom-nav-item"
        );


    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    if (!navItems.length) {

        return;

    }


    navigationInitialized =
        true;


    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    const targetId =
                        item.dataset.section;


                    if (!targetId) {

                        return;

                    }


                    const targetSection =
                        document.getElementById(
                            targetId
                        );


                    if (!targetSection) {

                        return;

                    }


                    sections.forEach(
                        section => {

                            section.classList.toggle(
                                "active-section",
                                section.id ===
                                    targetId
                            );

                        }
                    );


                    navItems.forEach(
                        navItem => {

                            const active =
                                navItem ===
                                item;


                            navItem.classList.toggle(
                                "active",
                                active
                            );


                            if (active) {

                                navItem.setAttribute(
                                    "aria-current",
                                    "page"
                                );

                            }

                            else {

                                navItem.removeAttribute(
                                    "aria-current"
                                );

                            }

                        }
                    );


                    window.scrollTo(
                        {
                            top:
                                0,

                            behavior:
                                "smooth"
                        }
                    );


                    window.dispatchEvent(
                        new CustomEvent(
                            "dashboard-section-changed",
                            {
                                detail: {
                                    section:
                                        targetId
                                }
                            }
                        )
                    );

                }
            );

        }
    );

}


/* =====================================================
   NOTIFICATION BUTTON
===================================================== */

function initializeNotificationButton() {

    if (
        notificationInitialized ||
        !notificationBtn
    ) {

        return;

    }


    notificationInitialized =
        true;


    notificationBtn.addEventListener(
        "click",
        () => {

            window.dispatchEvent(
                new CustomEvent(
                    "rio-notifications-open"
                )
            );

        }
    );

}


/* =====================================================
   ANNOUNCEMENT VIEW ALL
===================================================== */

function initializeAnnouncementButton() {

    if (
        announcementsInitialized ||
        !viewAllAnnouncements
    ) {

        return;

    }


    announcementsInitialized =
        true;


    viewAllAnnouncements.addEventListener(
        "click",
        () => {

            window.dispatchEvent(
                new CustomEvent(
                    "rio-announcements-view-all",
                    {
                        detail: {
                            customer:
                                currentCustomer
                        }
                    }
                )
            );

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutCustomer() {

    if (!auth) {

        throw new Error(
            "Firebase Auth is unavailable."
        );

    }


    try {

        await signOut(
            auth
        );


        currentCustomer =
            null;


        window.currentUser =
            null;


        window.location.replace(
            "login.html"
        );

    }

    catch (error) {

        console.error(
            "Rio Dashboard Logout Error:",
            error
        );


        alert(
            "Logout failed. Please try again."
        );


        throw error;

    }

}


/* =====================================================
   GLOBAL LOGOUT API
===================================================== */

window.logoutCustomer =
    logoutCustomer;


/* =====================================================
   LOGOUT BUTTON
===================================================== */

function initializeLogout() {

    if (
        logoutInitialized ||
        !logoutBtn
    ) {

        return;

    }


    logoutInitialized =
        true;


    logoutBtn.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;

            }


            try {

                await logoutCustomer();

            }

            catch {

                // Error already shown.

            }

        }
    );

}


/* =====================================================
   GLOBAL CUSTOMER UPDATE
===================================================== */

window.updateCustomerDashboard =
    function (
        customer
    ) {

        if (!customer) {

            return;

        }


        renderCustomer(
            customer
        );

    };


/* =====================================================
   STAMP SYNC
===================================================== */

window.syncDashboardStamps =
    function (
        count,
        rewardClaimed
    ) {

        const total =
            normalizeStampCount(
                count
            );


        const claimed =

            typeof rewardClaimed ===
            "boolean"

                ? rewardClaimed

                : isRewardClaimed(
                    currentCustomer
                );


        const state =
            getLoyaltyCycleState({

                ...(currentCustomer ||
                    {}),

                stamps:
                    total,

                rewardClaimed:
                    claimed

            });


        updateStamps(

            total,

            claimed,

            state.expired

        );


        if (currentCustomer) {

            currentCustomer = {

                ...currentCustomer,

                stamps:
                    total,

                stampCount:
                    total,

                rewardClaimed:
                    claimed

            };


            window.currentUser =
                currentCustomer;

        }

    };


/* =====================================================
   REFRESH LOYALTY UI
===================================================== */

window.refreshLoyaltyUI =
    function () {

        if (!currentCustomer) {

            return;

        }


        const state =
            getLoyaltyCycleState(
                currentCustomer
            );


        updateStamps(

            state.stamps,

            state.rewardClaimed,

            state.expired

        );


        updateCycleDays(
            currentCustomer
        );

    };


/* =====================================================
   REFRESH DASHBOARD
===================================================== */

window.refreshCustomerDashboard =
    function () {

        if (!currentCustomer) {

            return;

        }


        renderCustomer(
            currentCustomer
        );

    };


/* =====================================================
   REFRESH REWARD
===================================================== */

window.refreshRewardStatus =
    function (
        stampCount
    ) {

        const customer =
            currentCustomer ||
            {};


        const state =
            getLoyaltyCycleState({

                ...customer,

                stamps:
                    stampCount

            });


        updateRewardStatus(

            state.stamps,

            state.rewardClaimed,

            state.expired

        );

    };


/* =====================================================
   AUTH STATE EVENT
===================================================== */

window.addEventListener(
    "rio-auth-state-changed",
    event => {

        const user =
            event.detail?.user;


        if (!user) {

            return;

        }


        /*
         * Temporary UI fallback only.
         * Real Firestore customer data is loaded
         * during dashboard initialization.
         */

        if (!currentCustomer) {

            renderCustomer({

                uid:
                    user.uid,

                email:
                    user.email ||
                    "",

                name:
                    user.displayName ||
                    "Premium Member",

                photoURL:
                    user.photoURL ||
                    "",

                memberId:
                    buildMemberId(
                        user.uid
                    ),

                stamps:
                    0,

                rewardClaimed:
                    false,

                _authOnlyFallback:
                    true

            });

        }

    }
);


/* =====================================================
   EXTERNAL CUSTOMER EVENTS
===================================================== */

window.addEventListener(
    "dashboard-ready",
    event => {

        const customer =
            event.detail ||
            window.currentUser;


        if (customer) {

            renderCustomer(
                customer
            );

        }

    }
);


window.addEventListener(
    "customer-updated",
    event => {

        const customer =
            event.detail;


        if (customer) {

            renderCustomer(
                customer
            );

        }

    }
);


/* =====================================================
   QR CUSTOMER EVENT
===================================================== */

window.addEventListener(
    "rio-customer-rendered",
    event => {

        const customer =
            event.detail?.customer;


        if (
            !customer ||
            customer._authOnlyFallback ===
                true
        ) {

            return;

        }


        updateQRSection(
            customer
        );

    }
);


/* =====================================================
   PUBLIC DASHBOARD API
===================================================== */

window.RioDashboard = {

    renderCustomer,

    updateStamps,

    updateRewardStatus,

    normalizeStampCount,

    updateCycleDays,

    updateProgressBar,

    getCustomerStampCount,

    isRewardClaimed,

    getLoyaltyCycleState,

    renderProfileSection,

    renderHistorySection,

    renderFeedbackSection,

    renderSpecialOffer,

    renderAnnouncements,

    loadCustomerProfile

};


/* =====================================================
   INITIALIZE DASHBOARD
===================================================== */

async function initializeDashboard() {

    if (dashboardInitialized) {

        return;

    }


    dashboardInitialized =
        true;


    initializeBottomNavigation();

    initializeNotificationButton();

    initializeAnnouncementButton();

    initializeLogout();


    try {

        const user =
            await waitForAuth();


        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;

        }


        /*
         * Load REAL customer document.
         */

        const customer =
            await loadCustomerProfile(
                user
            );


        if (customer) {

            renderCustomer(
                customer
            );

        }


        window.dispatchEvent(
            new CustomEvent(
                "dashboard-ui-ready",
                {
                    detail: {

                        user,

                        customer

                    }
                }
            )
        );


        console.log(
            "🍜 Rio Maggi Point Dashboard Ready"
        );


        console.log(
            "Loyalty:",
            {
                cycleDays:
                    CYCLE_DAYS,

                stampsRequired:
                    STAMP_LIMIT,

                cardSlots:
                    CARD_SLOTS
            }
        );

    }

    catch (error) {

        console.error(
            "Rio Dashboard Initialization Error:",
            error
        );

    }

}


/* =====================================================
   START
===================================================== */

initializeDashboard();
