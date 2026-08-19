/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   PREMIUM CUSTOMER DASHBOARD — FINAL UI BUILD
   =====================================================

   RESPONSIBILITIES:
   - Customer identity rendering
   - Loyalty stamp UI
   - 40-day cycle display
   - Reward status UI
   - Profile section UI
   - QR section synchronization
   - History section UI
   - Feedback section UI
   - Announcements hooks
   - Special offer hooks
   - Bottom navigation
   - Notifications hook
   - Logout
   - Dashboard global APIs

   ARCHITECTURE:
   - ONE COMMON CUSTOMER DASHBOARD
   - CUSTOMER SIDE ONLY
   - NO ADMIN CODE
   - NO FIREBASE INITIALIZATION HERE
   - FIREBASE REMAINS CENTRALIZED
   - Uses centralized app.js

   IMPORTANT:
   - This file controls customer-side UI/state.
   - Loyalty authorization / anti-cheat MUST remain
     enforced by the secure backend/admin layer.
===================================================== */


// =====================================================
// CENTRAL APP IMPORTS
// =====================================================

import {
    auth,
    APP_CONFIG,
    waitForAuth
} from "./app.js";


import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// CONFIGURATION
// =====================================================

const STAMP_LIMIT =
    Number(APP_CONFIG?.loyaltyStampsRequired) || 6;


const CYCLE_DAYS =
    Number(APP_CONFIG?.loyaltyCycleDays) || 40;


const DEFAULT_AVATAR =
    "assets/avatars/default.png";


// =====================================================
// INTERNAL STATE
// =====================================================

let dashboardInitialized = false;

let navigationInitialized = false;

let logoutInitialized = false;

let notificationInitialized = false;

let currentCustomer = null;


// =====================================================
// DOM HELPER
// =====================================================

function getElement(id) {

    return document.getElementById(id);

}


// =====================================================
// DOM REFERENCES
// =====================================================

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


const logoutBtn =
    getElement("logoutBtn");


const notificationBtn =
    getElement("notificationBtn");


const stampBoxes = [

    getElement("stamp1"),

    getElement("stamp2"),

    getElement("stamp3"),

    getElement("stamp4"),

    getElement("stamp5"),

    getElement("stamp6")

];


// =====================================================
// OTHER DASHBOARD REFERENCES
// =====================================================

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


// =====================================================
// SAFE NUMBER
// =====================================================

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


// =====================================================
// NORMALIZE STAMP COUNT
// =====================================================

function normalizeStampCount(
    value
) {

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


// =====================================================
// CUSTOMER DISPLAY NAME
// =====================================================

function getCustomerDisplayName(
    customer
) {

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


// =====================================================
// CUSTOMER AVATAR
// =====================================================

function getCustomerAvatar(
    customer
) {

    if (!customer) {

        return DEFAULT_AVATAR;

    }


    return (

        customer.avatar ||

        customer.photoURL ||

        customer.profilePhoto ||

        DEFAULT_AVATAR

    );

}


// =====================================================
// SAFE AVATAR
// =====================================================

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


// =====================================================
// UPDATE CUSTOMER NAME
// =====================================================

function updateCustomerNames(
    customer
) {

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


// =====================================================
// UPDATE MEMBER ID
// =====================================================

function getCustomerMemberId(
    customer
) {

    return (

        customer?.memberId ||

        customer?.memberID ||

        customer?.customerId ||

        customer?.customerID ||

        "RIO-000000"

    );

}


function updateMemberId(
    customer
) {

    if (!memberId) {

        return;

    }


    const id =
        getCustomerMemberId(
            customer
        );


    memberId.textContent =
        `Member ID : ${String(id)}`;

}


// =====================================================
// UPDATE AVATARS
// =====================================================

function updateCustomerAvatars(
    customer
) {

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


// =====================================================
// GET STAMP COUNT
// =====================================================

function getCustomerStampCount(
    customer
) {

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


// =====================================================
// REWARD CLAIMED STATE
// =====================================================

function isRewardClaimed(
    customer
) {

    if (!customer) {

        return false;

    }


    return (

        customer.rewardClaimed === true ||

        customer.rewardRedeemed === true ||

        customer.rewardStatus === "claimed" ||

        customer.rewardStatus === "redeemed"

    );

}


// =====================================================
// UPDATE STAMP COUNT
// =====================================================

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


// =====================================================
// UPDATE STAMP BOXES
// =====================================================

function updateStampBoxes(
    count
) {

    const total =
        normalizeStampCount(
            count
        );


    stampBoxes.forEach(
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

            } else {

                box.classList.add(
                    "locked"
                );

            }

        }
    );

}


// =====================================================
// UPDATE PROGRESS BAR
// =====================================================

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


    const progressBar =
        loyaltyProgress.parentElement;


    if (
        progressBar &&
        progressBar.getAttribute(
            "role"
        ) === "progressbar"
    ) {

        progressBar.setAttribute(

            "aria-valuenow",

            String(total)

        );


        progressBar.setAttribute(

            "aria-valuemin",

            "0"

        );


        progressBar.setAttribute(

            "aria-valuemax",

            String(STAMP_LIMIT)

        );

    }

}


// =====================================================
// GET CYCLE START DATE
// =====================================================

function getCycleStartDate(
    customer
) {

    if (!customer) {

        return null;

    }


    const value =

        customer.cycleStartDate ||

        customer.loyaltyCycleStart ||

        customer.stampCycleStart ||

        customer.cycleStartedAt ||

        null;


    if (!value) {

        return null;

    }


    if (

        typeof value === "object" &&

        typeof value.toDate === "function"

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

        typeof value.seconds === "number"

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


// =====================================================
// CALCULATE CYCLE DAYS
// =====================================================

function calculateCycleDaysRemaining(
    customer
) {

    if (!customer) {

        return CYCLE_DAYS;

    }


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

            Math.floor(
                explicitRemaining
            )

        );

    }


    const daysRemaining =
        Number(
            customer.daysRemaining
        );


    if (
        Number.isFinite(
            daysRemaining
        )
    ) {

        return Math.max(

            0,

            Math.floor(
                daysRemaining
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


    const effectiveStart =
        cycleStart.getTime() >
        now.getTime()

            ? now

            : cycleStart;


    const elapsedMilliseconds =

        now.getTime() -

        effectiveStart.getTime();


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


// =====================================================
// UPDATE CYCLE DISPLAY
// =====================================================

function updateCycleDays(
    customer
) {

    if (!cycleDaysRemaining) {

        return;

    }


    const remaining =
        calculateCycleDaysRemaining(
            customer
        );


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


    if (remaining <= 0) {

        cycleStatus.classList.add(
            "expired"
        );


        cycleStatus.textContent =
            "Your loyalty cycle has expired.";

    }

    else if (remaining <= 7) {

        cycleStatus.classList.add(
            "warning"
        );


        cycleStatus.textContent =

            `Your loyalty cycle expires in ${remaining} day${
                remaining === 1
                    ? ""
                    : "s"
            }.`;

    }

    else {

        cycleStatus.classList.add(
            "active"
        );


        cycleStatus.textContent =

            `Your ${CYCLE_DAYS}-day loyalty cycle is active.`;

    }

}


// =====================================================
// UPDATE REWARD STATUS
// =====================================================

function updateRewardStatus(
    stampCount,
    rewardClaimed = false
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

        "reward-locked"

    );


    if (rewardClaimed === true) {

        rewardStatus.classList.add(
            "reward-used"
        );


        rewardStatus.innerHTML = `

            <strong>
                🎉 Reward Claimed
            </strong>

            <span>
                Your reward has been redeemed.
                Your next loyalty cycle will begin from new valid stamps.
            </span>

        `;


        return;

    }


    if (total >= STAMP_LIMIT) {

        rewardStatus.classList.add(
            "reward-unlocked"
        );


        rewardStatus.innerHTML = `

            <strong>
                🎉 FREE Veg Maggi Unlocked!
            </strong>

            <span>
                Your ${STAMP_LIMIT} valid stamps are complete.
            </span>

        `;


        return;

    }


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


// =====================================================
// UPDATE ALL LOYALTY UI
// =====================================================

function updateStamps(
    count = 0,
    rewardClaimed = false
) {

    const total =
        normalizeStampCount(
            count
        );


    updateStampCountUI(
        total
    );


    updateStampBoxes(
        total
    );


    updateProgressBar(
        total
    );


    updateRewardStatus(
        total,
        rewardClaimed
    );

}


// =====================================================
// PROFILE VALUE HELPERS
// =====================================================

function formatDOB(
    value
) {

    if (!value) {

        return "";

    }


    let date;


    if (

        typeof value === "object" &&

        typeof value.toDate === "function"

    ) {

        date =
            value.toDate();

    }

    else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleDateString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}


// =====================================================
// RENDER PROFILE SECTION
// =====================================================

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
        formatDOB(
            dob
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
                        src="${escapeHTMLAttribute(photo)}"
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
                                    String(gender)
                                        .charAt(0)
                                        .toUpperCase() +
                                    String(gender)
                                        .slice(1)
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
                        Stamp Progress
                    </span>

                    <strong>
                        ${getCustomerStampCount(customer)}
                        /${STAMP_LIMIT}
                    </strong>

                </div>

            </div>


            <div class="dashboard-profile-note">

                <i class="fa-solid fa-shield-halved"></i>

                <span>
                    ${
                        dobLocked
                            ? "Date of Birth is locked. Future changes require admin approval."
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


// =====================================================
// RENDER HISTORY
// =====================================================

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

                <i
                    class="fa-solid fa-clock-rotate-left"
                ></i>

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


    const limitedHistory =
        history.slice(
            0,
            30
        );


    historyList.innerHTML =
        limitedHistory
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
                        (index + 1);


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
                                        String(text)
                                    )}
                                </strong>

                                <span>
                                    Stamp ${escapeHTML(
                                        String(stamp)
                                    )}
                                </span>

                            </div>

                            <time>
                                ${escapeHTML(
                                    formatDOB(date)
                                )}
                            </time>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// RENDER FEEDBACK
// =====================================================

function renderFeedbackSection(
    customer
) {

    if (!feedbackContent) {

        return;

    }


    const lastFeedback =
        customer?.lastFeedback ||
        customer?.feedback ||
        null;


    const existingMessage =
        lastFeedback?.message ||
        "";


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
                String(existingMessage)
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


// =====================================================
// FEEDBACK CONTROLS
// =====================================================

let selectedFeedbackRating =
    0;


function initializeFeedbackControls() {

    const ratingButtons =
        feedbackContent?.querySelectorAll(
            "[data-rating]"
        );


    if (
        ratingButtons &&
        ratingButtons.length
    ) {

        ratingButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        selectedFeedbackRating =
                            Number(
                                button.dataset.rating
                            );


                        ratingButtons.forEach(
                            (item) => {

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

    }


    const submitButton =
        getElement(
            "dashboardFeedbackSubmit"
        );


    const message =
        getElement(
            "dashboardFeedbackMessage"
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


            const text =
                textarea?.value
                    ?.trim() || "";


            if (
                selectedFeedbackRating < 1
            ) {

                if (message) {

                    message.textContent =
                        "Please select a rating.";

                    message.className =
                        "dashboard-feedback-message error";

                }

                return;

            }


            if (!text) {

                if (message) {

                    message.textContent =
                        "Please tell us what you enjoyed.";

                    message.className =
                        "dashboard-feedback-message error";

                }

                return;

            }


            /*
             * This UI intentionally does not write
             * to Firebase here.
             *
             * A secure feedback service/data layer
             * can listen for this event and submit it.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "rio-feedback-submit",
                    {
                        detail: {

                            rating:
                                selectedFeedbackRating,

                            message:
                                text

                        }
                    }
                )
            );


            if (message) {

                message.textContent =
                    "Thank you for your feedback! ❤️";

                message.className =
                    "dashboard-feedback-message success";

            }

        }
    );

}


// =====================================================
// RENDER SPECIAL OFFER
// =====================================================

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


// =====================================================
// RENDER ANNOUNCEMENTS
// =====================================================

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
            .slice(0, 5)
            .map(
                (
                    item
                ) => `

                    <article class="announcement-item">

                        <div class="announcement-icon">

                            <i class="fa-solid fa-bullhorn"></i>

                        </div>


                        <div class="announcement-content">

                            <span>
                                ${
                                    escapeHTML(
                                        item.type ||
                                        "RIO UPDATE"
                                    )
                                }
                            </span>

                            <h3>
                                ${
                                    escapeHTML(
                                        item.title ||
                                        "Rio Maggi Point Update"
                                    )
                                }
                            </h3>

                            <p>
                                ${
                                    escapeHTML(
                                        item.message ||
                                        item.description ||
                                        ""
                                    )
                                }
                            </p>

                        </div>

                    </article>

                `
            )
            .join("");

}


// =====================================================
// QR SECTION UPDATE
// =====================================================

function updateQRSection(
    customer
) {

    if (!customerQrCode) {

        return;

    }


    /*
     * Permanent QR generation remains delegated
     * to the dedicated QR layer.
     */

    if (
        customer?._authOnlyFallback === true
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


// =====================================================
// ESCAPE HTML
// =====================================================

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


function escapeHTMLAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


// =====================================================
// RENDER COMPLETE CUSTOMER
// =====================================================

function renderCustomer(
    customer
) {

    if (
        !customer ||
        typeof customer !== "object"
    ) {

        return;

    }


    const isAuthOnlyFallback =
        customer._authOnlyFallback === true;


    /*
     * Only the real customer object becomes
     * the permanent dashboard state.
     */

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


    const stamps =
        getCustomerStampCount(
            customer
        );


    const rewardClaimed =
        isRewardClaimed(
            customer
        );


    updateStamps(
        stamps,
        rewardClaimed
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

                    stamps,

                    rewardClaimed,

                    authOnlyFallback:
                        isAuthOnlyFallback

                }
            }
        )
    );

}


// =====================================================
// BOTTOM NAVIGATION
// =====================================================

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
        (item) => {

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
                        (section) => {

                            section.classList.toggle(
                                "active-section",
                                section.id ===
                                    targetId
                            );

                        }
                    );


                    navItems.forEach(
                        (navItem) => {

                            const isActive =
                                navItem ===
                                item;


                            navItem.classList.toggle(
                                "active",
                                isActive
                            );


                            if (isActive) {

                                navItem.setAttribute(
                                    "aria-current",
                                    "page"
                                );

                            } else {

                                navItem.removeAttribute(
                                    "aria-current"
                                );

                            }

                        }
                    );


                    window.scrollTo({

                        top: 0,

                        behavior: "smooth"

                    });


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


// =====================================================
// NOTIFICATIONS
// =====================================================

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


// =====================================================
// ANNOUNCEMENTS VIEW ALL
// =====================================================

function initializeAnnouncementButton() {

    if (!viewAllAnnouncements) {

        return;

    }


    viewAllAnnouncements.addEventListener(
        "click",
        () => {

            window.dispatchEvent(
                new CustomEvent(
                    "rio-announcements-view-all"
                )
            );

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

async function logoutCustomer() {

    if (!auth) {

        console.error(
            "Rio Dashboard: centralized auth object is unavailable."
        );


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


// =====================================================
// GLOBAL LOGOUT API
// =====================================================

window.logoutCustomer =
    logoutCustomer;


// =====================================================
// LOGOUT BUTTON
// =====================================================

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

                // User-facing error already shown.

            }

        }
    );

}


// =====================================================
// AUTH STATE EVENT
// =====================================================

window.addEventListener(
    "rio-auth-state-changed",
    (event) => {

        const user =
            event.detail?.user;


        if (!user) {

            return;

        }


        if (!currentCustomer) {

            renderCustomer({

                uid:
                    user.uid,

                email:
                    user.email || "",

                name:
                    user.displayName ||
                    "Premium Member",

                photoURL:
                    user.photoURL || "",

                _authOnlyFallback:
                    true

            });

        }

    }
);


// =====================================================
// DASHBOARD READY EVENT
// =====================================================

window.addEventListener(
    "dashboard-ready",
    (event) => {

        const customer =
            event.detail ||
            window.currentUser;


        if (!customer) {

            return;

        }


        renderCustomer(
            customer
        );

    }
);


// =====================================================
// CUSTOMER UPDATED EVENT
// =====================================================

window.addEventListener(
    "customer-updated",
    (event) => {

        const customer =
            event.detail;


        if (!customer) {

            return;

        }


        renderCustomer(
            customer
        );

    }
);


// =====================================================
// GLOBAL CUSTOMER UPDATE API
// =====================================================

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


// =====================================================
// EXTERNAL STAMP SYNC
// =====================================================

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


        updateStamps(
            total,
            claimed
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


// =====================================================
// REWARD STATUS REFRESH
// =====================================================

window.refreshRewardStatus =
    function (
        stampCount
    ) {

        const customer =
            currentCustomer ||
            window.currentUser ||
            {};


        updateRewardStatus(

            stampCount,

            isRewardClaimed(
                customer
            )

        );

    };


// =====================================================
// CUSTOMER DASHBOARD REFRESH
// =====================================================

window.refreshCustomerDashboard =
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


// =====================================================
// REFRESH LOYALTY UI
// =====================================================

window.refreshLoyaltyUI =
    function () {

        if (!currentCustomer) {

            return;

        }


        const stamps =
            getCustomerStampCount(
                currentCustomer
            );


        const rewardClaimed =
            isRewardClaimed(
                currentCustomer
            );


        updateStamps(

            stamps,

            rewardClaimed

        );


        updateCycleDays(
            currentCustomer
        );

    };


// =====================================================
// QR SYNC HOOK
// =====================================================

window.addEventListener(
    "rio-customer-rendered",
    (event) => {

        const customer =
            event.detail?.customer;


        if (!customer) {

            return;

        }


        if (
            customer._authOnlyFallback === true
        ) {

            return;

        }


        updateQRSection(
            customer
        );

    }
);


// =====================================================
// PUBLIC DASHBOARD API
// =====================================================

window.RioDashboard = {

    renderCustomer,

    updateStamps,

    updateRewardStatus,

    normalizeStampCount,

    updateCycleDays,

    updateProgressBar,

    getCustomerStampCount,

    isRewardClaimed,

    renderProfileSection,

    renderHistorySection,

    renderFeedbackSection,

    renderSpecialOffer,

    renderAnnouncements

};


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

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
         * If a real customer layer has already
         * populated window.currentUser,
         * render it immediately.
         */

        if (

            window.currentUser &&

            typeof window.currentUser ===
                "object"

        ) {

            renderCustomer(
                window.currentUser
            );

        }


        window.dispatchEvent(
            new CustomEvent(
                "dashboard-ui-ready",
                {
                    detail: {
                        user
                    }
                }
            )
        );


        console.log(
            "🍜 Rio Maggi Point Customer Dashboard UI Ready"
        );


    }

    catch (error) {

        console.error(
            "Rio Dashboard Initialization Error:",
            error
        );

    }

}


// =====================================================
// START
// =====================================================

initializeDashboard();
