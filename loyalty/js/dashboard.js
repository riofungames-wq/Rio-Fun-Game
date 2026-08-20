/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   FINAL CUSTOMER DASHBOARD BUILD

   CUSTOMER ONLY
   NO ADMIN LOGIC
   NO FIREBASE INITIALIZATION

   LOYALTY:
   - 40 DAYS
   - 6 VALID STAMPS
   - 7TH VISUAL CIRCLE = FREE VEG MAGGI
===================================================== */


/* =====================================================
   CENTRAL APP
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
   CONFIG
===================================================== */

const STAMP_LIMIT =
    Number(APP_CONFIG?.loyaltyStampsRequired) || 6;

const CARD_SLOTS =
    Number(APP_CONFIG?.loyaltyCardSlots) || 7;

const CYCLE_DAYS =
    Number(APP_CONFIG?.loyaltyCycleDays) || 40;

const DEFAULT_AVATAR =
    "assets/avatars/default.png";


/* =====================================================
   STATE
===================================================== */

let dashboardInitialized = false;
let navigationInitialized = false;
let logoutInitialized = false;
let notificationInitialized = false;
let announcementsInitialized = false;

let currentCustomer = null;
let selectedFeedbackRating = 0;

let heroTimer = null;
let currentHeroIndex = 0;


/* =====================================================
   HELPERS
===================================================== */

function getElement(id) {
    return document.getElementById(id);
}


function safeNumber(value, fallback = 0) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function normalizeStampCount(value) {

    return Math.max(
        0,
        Math.min(
            Math.floor(
                safeNumber(value, 0)
            ),
            STAMP_LIMIT
        )
    );

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   DATE
===================================================== */

function toDateValue(value) {

    if (!value) {
        return null;
    }

    try {

        if (
            typeof value === "object" &&
            typeof value.toDate === "function"
        ) {

            const date = value.toDate();

            return Number.isNaN(date.getTime())
                ? null
                : date;

        }


        if (
            typeof value === "object" &&
            value.seconds !== undefined
        ) {

            const seconds =
                Number(value.seconds);

            const nanos =
                Number(value.nanoseconds || 0);

            const date =
                new Date(
                    seconds * 1000 +
                    Math.floor(nanos / 1000000)
                );

            return Number.isNaN(date.getTime())
                ? null
                : date;

        }


        const date =
            value instanceof Date
                ? value
                : new Date(value);


        return Number.isNaN(date.getTime())
            ? null
            : date;

    }
    catch {

        return null;

    }

}


function formatDate(value) {

    const date = toDateValue(value);

    if (!date) {
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


/* =====================================================
   CUSTOMER
===================================================== */

function getCustomerDisplayName(customer) {

    if (!customer) {
        return "Premium Member";
    }

    return (
        String(
            customer.name ||
            customer.displayName ||
            customer.fullName ||
            "Premium Member"
        ).trim() ||
        "Premium Member"
    );

}


function getCustomerAvatar(customer) {

    return (
        customer?.photoURL ||
        customer?.avatar ||
        customer?.profilePhoto ||
        DEFAULT_AVATAR
    );

}


function buildMemberId(uid) {

    const cleanUid =
        String(uid || "").trim();

    return cleanUid
        ? `RIO-${cleanUid.substring(0, 8).toUpperCase()}`
        : "RIO-000000";

}


function getCustomerMemberId(customer) {

    return (
        customer?.memberId ||
        customer?.memberID ||
        customer?.customerId ||
        customer?.customerID ||
        buildMemberId(
            customer?.uid
        )
    );

}


function getCustomerStampCount(customer) {

    return normalizeStampCount(

        customer?.stamps ??
        customer?.stampCount ??
        customer?.validStamps ??
        customer?.currentStamps ??
        0

    );

}


function setAvatar(element, source) {

    if (!element) {
        return;
    }

    element.onerror = function () {

        this.onerror = null;
        this.src = DEFAULT_AVATAR;

    };

    element.src =
        source || DEFAULT_AVATAR;

}


/* =====================================================
   DOM REFERENCES
===================================================== */

const welcomeName = getElement("welcomeName");
const customerName = getElement("customerName");
const memberId = getElement("memberId");

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
   CUSTOMER HEADER/UI
===================================================== */

function updateCustomerNames(customer) {

    const name =
        getCustomerDisplayName(customer);

    if (welcomeName) {
        welcomeName.textContent =
            `Hello, ${name} 👋`;
    }

    if (customerName) {
        customerName.textContent = name;
    }

    if (qrCustomerName) {
        qrCustomerName.textContent = name;
    }

}


function updateMemberId(customer) {

    if (!memberId) {
        return;
    }

    memberId.textContent =
        `Member ID : ${getCustomerMemberId(customer)}`;

}


function updateCustomerAvatars(customer) {

    const avatar =
        getCustomerAvatar(customer);

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
   STAMPS
===================================================== */

function isRewardClaimed(customer) {

    return Boolean(

        customer?.rewardClaimed === true ||
        customer?.rewardRedeemed === true ||
        customer?.rewardStatus === "claimed" ||
        customer?.rewardStatus === "redeemed"

    );

}


function updateStampCountUI(count) {

    const total =
        normalizeStampCount(count);

    if (stampCountElement) {
        stampCountElement.textContent =
            String(total);
    }

    if (qrStampCount) {
        qrStampCount.textContent =
            String(total);
    }

}


function updateStampBoxes(
    count,
    rewardUnlocked = false,
    rewardClaimed = false
) {

    const total =
        normalizeStampCount(count);


    stampBoxes
        .slice(0, STAMP_LIMIT)
        .forEach((box, index) => {

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

                box.innerHTML =
                    `<i class="fa-solid fa-check" aria-hidden="true"></i>`;

            }
            else {

                box.classList.add(
                    "locked"
                );

                box.innerHTML =
                    `<span>${index + 1}</span>`;

            }

        });


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


    rewardBox.innerHTML = `
        <i class="fa-solid fa-gift" aria-hidden="true"></i>
        <span>FREE</span>
    `;


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


function updateProgressBar(count) {

    const total =
        normalizeStampCount(count);

    const percentage =
        Math.round(
            (total / STAMP_LIMIT) * 100
        );


    if (loyaltyProgress) {

        loyaltyProgress.style.width =
            `${percentage}%`;

    }


    if (loyaltyProgressBar) {

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
   CYCLE
===================================================== */

function getCycleStartDate(customer) {

    return toDateValue(

        customer?.cycleStartDate ||
        customer?.loyaltyCycleStart ||
        customer?.stampCycleStart ||
        customer?.cycleStartedAt ||
        null

    );

}


function calculateCycleDaysRemaining(customer) {

    if (!customer) {
        return CYCLE_DAYS;
    }


    const explicit =
        Number(
            customer.cycleDaysRemaining
        );


    if (Number.isFinite(explicit)) {

        return Math.max(
            0,
            Math.min(
                Math.floor(explicit),
                CYCLE_DAYS
            )
        );

    }


    const compatibility =
        Number(
            customer.daysRemaining
        );


    if (Number.isFinite(compatibility)) {

        return Math.max(
            0,
            Math.min(
                Math.floor(compatibility),
                CYCLE_DAYS
            )
        );

    }


    const cycleStart =
        getCycleStartDate(customer);


    if (!cycleStart) {
        return CYCLE_DAYS;
    }


    const now =
        new Date();


    const start =
        new Date(
            cycleStart.getFullYear(),
            cycleStart.getMonth(),
            cycleStart.getDate()
        );


    const today =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    const elapsed =
        Math.floor(
            (today - start) / 86400000
        );


    return Math.max(
        0,
        CYCLE_DAYS - elapsed
    );

}


function getLoyaltyCycleState(customer) {

    const stamps =
        getCustomerStampCount(customer);

    const rewardClaimed =
        isRewardClaimed(customer);

    const daysRemaining =
        calculateCycleDaysRemaining(
            customer
        );

    const rewardUnlocked =
        stamps >= STAMP_LIMIT &&
        !rewardClaimed;

    const expired =
        daysRemaining <= 0 &&
        stamps < STAMP_LIMIT &&
        !rewardClaimed;


    let status = "active";

    if (rewardClaimed) {
        status = "claimed";
    }
    else if (rewardUnlocked) {
        status = "reward-unlocked";
    }
    else if (expired) {
        status = "expired";
    }


    return {
        stamps,
        stampLimit: STAMP_LIMIT,
        cardSlots: CARD_SLOTS,
        daysRemaining,
        cycleDays: CYCLE_DAYS,
        rewardUnlocked,
        rewardClaimed,
        expired,
        status
    };

}


function updateCycleDays(customer) {

    if (!cycleDaysRemaining) {
        return;
    }


    const state =
        getLoyaltyCycleState(customer);


    const remaining =
        state.daysRemaining;


    cycleDaysRemaining.textContent =
        `${remaining} Day${remaining === 1 ? "" : "s"}`;


    if (!cycleStatus) {
        return;
    }


    cycleStatus.classList.remove(
        "active",
        "warning",
        "expired"
    );


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


    if (
        state.rewardUnlocked
    ) {

        cycleStatus.classList.add(
            "active"
        );

        cycleStatus.textContent =
            "FREE Veg Maggi is unlocked. Claim your reward.";

        return;

    }


    if (remaining <= 7) {

        cycleStatus.classList.add(
            "warning"
        );

        cycleStatus.textContent =
            `Your 40-day loyalty cycle expires in ${remaining} day${remaining === 1 ? "" : "s"}.`;

        return;

    }


    cycleStatus.classList.add(
        "active"
    );

    cycleStatus.textContent =
        "Your 40-day loyalty cycle is active.";

}


/* =====================================================
   REWARD
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


    if (rewardClaimed) {

        rewardStatus.classList.add(
            "reward-used"
        );

        rewardStatus.innerHTML = `
            <strong>🎉 FREE Veg Maggi Claimed</strong>
            <span>Your reward has been redeemed.</span>
        `;

        return;

    }


    if (cycleExpired) {

        rewardStatus.classList.add(
            "reward-expired"
        );

        rewardStatus.innerHTML = `
            <strong>⏰ Loyalty Cycle Expired</strong>
            <span>Your current cycle has expired.</span>
        `;

        return;

    }


    if (total >= STAMP_LIMIT) {

        rewardStatus.classList.add(
            "reward-unlocked"
        );

        rewardStatus.innerHTML = `
            <strong>🎉 FREE Veg Maggi Unlocked!</strong>
            <span>All 6 valid stamps are complete.</span>
        `;

        return;

    }


    rewardStatus.classList.add(
        "reward-locked"
    );

    const remaining =
        STAMP_LIMIT - total;

    rewardStatus.innerHTML = `
        <strong>Reward Locked</strong>
        <span>
            Collect ${remaining} more valid
            stamp${remaining === 1 ? "" : "s"}
            to unlock FREE Veg Maggi 🍜
        </span>
    `;

}


function updateStamps(
    count = 0,
    rewardClaimed = false,
    cycleExpired = false
) {

    const total =
        normalizeStampCount(count);

    const rewardUnlocked =
        total >= STAMP_LIMIT &&
        !cycleExpired &&
        !rewardClaimed;


    updateStampCountUI(total);

    updateStampBoxes(
        total,
        rewardUnlocked,
        rewardClaimed
    );

    updateProgressBar(total);

    updateRewardStatus(
        total,
        rewardClaimed,
        cycleExpired
    );

}


/* =====================================================
   PROFILE
===================================================== */

function renderProfileSection(customer) {

    if (!profileContent) {
        return;
    }


    const name =
        getCustomerDisplayName(customer);

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
        getCustomerMemberId(customer);

    const photo =
        getCustomerAvatar(customer);

    const dobText =
        formatDate(dob);

    const stamps =
        getCustomerStampCount(customer);


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
                    <span>Member ID</span>
                    <strong>${escapeHTML(member)}</strong>
                </div>

                <div class="dashboard-profile-info-item">
                    <span>Gender</span>
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
                    <span>Date of Birth</span>
                    <strong>${escapeHTML(dobText || "Not Set")}</strong>
                </div>

                <div class="dashboard-profile-info-item">
                    <span>Loyalty</span>
                    <strong>${stamps}/${STAMP_LIMIT}</strong>
                </div>

            </div>


            <div class="dashboard-profile-note">

                <i class="fa-solid fa-shield-halved"></i>

                <span>
                    ${
                        dob
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

                this.onerror = null;
                this.src = DEFAULT_AVATAR;

            };

    }

}


/* =====================================================
   HISTORY
===================================================== */

function renderHistorySection(customer) {

    if (!historyList) {
        return;
    }


    const history =
        Array.isArray(customer?.stampHistory)
            ? customer.stampHistory
            : Array.isArray(customer?.history)
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
            .slice(0, 30)
            .map((item, index) => {

                const date =
                    item?.date ||
                    item?.createdAt ||
                    item?.timestamp ||
                    "";

                const stamp =
                    item?.stamp ??
                    item?.stampNumber ??
                    item?.stamps ??
                    index + 1;

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
                                ${escapeHTML(text)}
                            </strong>

                            <span>
                                Stamp ${escapeHTML(stamp)}
                            </span>

                        </div>

                        <time>
                            ${escapeHTML(formatDate(date) || "—")}
                        </time>

                    </div>
                `;

            })
            .join("");

}


/* =====================================================
   FEEDBACK
===================================================== */

function renderFeedbackSection(customer) {

    if (!feedbackContent) {
        return;
    }


    const existingFeedback =
        customer?.lastFeedback ||
        customer?.feedback ||
        null;


    selectedFeedbackRating =
        safeNumber(
            existingFeedback?.rating,
            0
        );


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

                ${[1, 2, 3, 4, 5]
                    .map(
                        rating => `
                            <button
                                type="button"
                                data-rating="${rating}"
                                aria-label="Rate ${rating} star"
                                class="${
                                    rating <=
                                    selectedFeedbackRating
                                        ? "selected"
                                        : ""
                                }"
                            >
                                ★
                            </button>
                        `
                    )
                    .join("")
                }

            </div>


            <textarea
                class="dashboard-feedback-textarea"
                id="dashboardFeedbackText"
                maxlength="500"
                placeholder="Tell us what you enjoyed..."
            >${escapeHTML(
                existingFeedback?.message || ""
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


function initializeFeedbackControls() {

    if (!feedbackContent) {
        return;
    }


    const ratingButtons =
        feedbackContent.querySelectorAll(
            "[data-rating]"
        );


    ratingButtons.forEach(button => {

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

    });


    const submitButton =
        feedbackContent.querySelector(
            "#dashboardFeedbackSubmit"
        );


    if (!submitButton) {
        return;
    }


    submitButton.addEventListener(
        "click",
        () => {

            const textarea =
                feedbackContent.querySelector(
                    "#dashboardFeedbackText"
                );

            const messageBox =
                feedbackContent.querySelector(
                    "#dashboardFeedbackMessage"
                );


            const text =
                textarea?.value.trim() || "";


            if (selectedFeedbackRating < 1) {

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
   SPECIAL OFFER
===================================================== */

function renderSpecialOffer(customer) {

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
   ANNOUNCEMENTS
===================================================== */

function renderAnnouncements(customer) {

    if (!announcementList) {
        return;
    }


    const announcements =
        Array.isArray(customer?.announcements)
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
   QR HOOK
===================================================== */

function updateQRSection(customer) {

    if (!customerQrCode) {
        return;
    }


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


/* =====================================================
   COMPLETE RENDER
===================================================== */

function renderCustomer(customer) {

    if (
        !customer ||
        typeof customer !== "object"
    ) {
        return;
    }


    const isFallback =
        customer._authOnlyFallback === true;


    if (!isFallback) {

        currentCustomer = customer;

        window.currentUser = customer;

    }


    updateCustomerNames(customer);
    updateMemberId(customer);
    updateCustomerAvatars(customer);


    const state =
        getLoyaltyCycleState(customer);


    updateStamps(
        state.stamps,
        state.rewardClaimed,
        state.expired
    );


    updateCycleDays(customer);

    renderProfileSection(customer);
    renderHistorySection(customer);
    renderFeedbackSection(customer);
    renderSpecialOffer(customer);
    renderAnnouncements(customer);
    updateQRSection(customer);


    window.dispatchEvent(
        new CustomEvent(
            "rio-customer-rendered",
            {
                detail: {
                    customer,
                    stamps: state.stamps,
                    rewardClaimed:
                        state.rewardClaimed,
                    rewardUnlocked:
                        state.rewardUnlocked,
                    cycleExpired:
                        state.expired,
                    daysRemaining:
                        state.daysRemaining,
                    authOnlyFallback:
                        isFallback
                }
            }
        )
    );

}


/* =====================================================
   FIRESTORE CUSTOMER
===================================================== */

async function loadCustomerProfile(user) {

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


        if (customerSnap.exists()) {

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
                    firestoreData.avatar ||
                    user.photoURL ||
                    ""

            };

        }


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

            stamps: 0,

            rewardClaimed: false,

            _authOnlyFallback: true

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

            stamps: 0,

            rewardClaimed: false,

            _authOnlyFallback: true

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
            "#bottomNavigation .bottom-nav-item"
        );


    const sections =
        document.querySelectorAll(
            ".dashboard-section"
        );


    if (
        !navItems.length ||
        !sections.length
    ) {

        console.warn(
            "Dashboard navigation elements not found."
        );

        return;

    }


    navigationInitialized = true;


    function activateSection(targetId) {

        const targetSection =
            document.getElementById(
                targetId
            );


        if (!targetSection) {
            return false;
        }


        sections.forEach(section => {

            const active =
                section.id === targetId;

            section.classList.toggle(
                "active-section",
                active
            );

            section.setAttribute(
                "aria-hidden",
                active ? "false" : "true"
            );

        });


        navItems.forEach(item => {

            const active =
                item.dataset.section === targetId;

            item.classList.toggle(
                "active",
                active
            );


            if (active) {

                item.setAttribute(
                    "aria-current",
                    "page"
                );

            }
            else {

                item.removeAttribute(
                    "aria-current"
                );

            }

        });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        window.dispatchEvent(
            new CustomEvent(
                "dashboard-section-changed",
                {
                    detail: {
                        section: targetId
                    }
                }
            )
        );


        return true;

    }


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const targetId =
                    item.dataset.section;


                if (!targetId) {
                    return;
                }


                activateSection(
                    targetId
                );

            }
        );

    });


    const initiallyActive =
        document.querySelector(
            "#bottomNavigation .bottom-nav-item.active"
        );


    activateSection(
        initiallyActive?.dataset.section ||
        "homeSection"
    );

}


/* =====================================================
   NOTIFICATIONS
===================================================== */

function initializeNotificationButton() {

    if (
        notificationInitialized ||
        !notificationBtn
    ) {
        return;
    }


    notificationInitialized = true;


    notificationBtn.addEventListener(
        "click",
        () => {

            const announcementSection =
                document.querySelector(
                    "#homeSection .announcement-list"
                );


            if (announcementSection) {

                announcementSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }


            window.dispatchEvent(
                new CustomEvent(
                    "rio-notifications-open",
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
   ANNOUNCEMENT BUTTON
===================================================== */

function initializeAnnouncementButton() {

    if (
        announcementsInitialized ||
        !viewAllAnnouncements
    ) {
        return;
    }


    announcementsInitialized = true;


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


    await signOut(auth);

    currentCustomer = null;

    window.currentUser = null;

    window.location.replace(
        "login.html"
    );

}


window.logoutCustomer =
    logoutCustomer;


function initializeLogout() {

    if (
        logoutInitialized ||
        !logoutBtn
    ) {
        return;
    }


    logoutInitialized = true;


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
            catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );

                alert(
                    "Logout failed. Please try again."
                );

            }

        }
    );

}


/* =====================================================
   HERO
===================================================== */

const HERO_DATA = [
    {
        title: "EVERYDAY MAGIC MAGGI",
        subtitle: "Your favourite taste, made fresh for you.",
        link: "menu.html#everyday-maggi"
    },
    {
        title: "CHEESE MAGIC MAGGI",
        subtitle: "Extra cheesy. Extra delicious.",
        link: "menu.html#cheese-maggi"
    },
    {
        title: "CHEESE BUTTER MAGIC MAGGI",
        subtitle: "Rich butter with irresistible cheese.",
        link: "menu.html#cheese-butter-maggi"
    },
    {
        title: "UFO BURGER",
        subtitle: "Fresh vegetarian burgers, made with love.",
        link: "menu.html#ufo-burger"
    },
    {
        title: "DELICIOUS MOMOS",
        subtitle: "Hot, fresh and flavour-packed.",
        link: "menu.html#momos"
    },
    {
        title: "HOT SOUPS",
        subtitle: "Warm, comforting and flavourful.",
        link: "menu.html#soup"
    },
    {
        title: "CRISPY SWEET CORN",
        subtitle: "Perfectly seasoned and crispy.",
        link: "menu.html#sweet-corn"
    },
    {
        title: "CHIPS BHEL",
        subtitle: "Crunchy, chatpata and loaded with flavour.",
        link: "menu.html#chips-bhel"
    }
];


function initHeroSlider() {

    const track =
        getElement(
            "heroSliderTrack"
        );

    const dots =
        getElement(
            "sliderDots"
        );

    const prev =
        getElement(
            "sliderPrev"
        );

    const next =
        getElement(
            "sliderNext"
        );


    if (
        !track ||
        !dots
    ) {
        return;
    }


    track.innerHTML =
        HERO_DATA
            .map(
                (slide, index) => `

                    <article
                        class="hero-slide ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                        data-slide="${index}"
                    >

                        <div class="hero-slide-overlay"></div>

                        <div class="hero-slide-content">

                            <span>
                                RIO MAGGI POINT
                            </span>

                            <h2>
                                ${escapeHTML(
                                    slide.title
                                )}
                            </h2>

                            <p>
                                ${escapeHTML(
                                    slide.subtitle
                                )}
                            </p>

                            <a
                                href="${escapeHTML(
                                    slide.link
                                )}"
                                class="hero-action"
                            >
                                View Menu
                                <i class="fa-solid fa-arrow-right"></i>
                            </a>

                        </div>

                    </article>
                `
            )
            .join("");


    dots.innerHTML =
        HERO_DATA
            .map(
                (_, index) => `

                    <button
                        type="button"
                        class="slider-dot ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                        data-slide="${index}"
                        aria-label="Slide ${index + 1}"
                    ></button>

                `
            )
            .join("");


    const slides =
        Array.from(
            track.querySelectorAll(
                ".hero-slide"
            )
        );


    const dotButtons =
        Array.from(
            dots.querySelectorAll(
                ".slider-dot"
            )
        );


    function showSlide(index) {

        if (!slides.length) {
            return;
        }


        currentHeroIndex =
            (
                index +
                slides.length
            ) %
            slides.length;


        slides.forEach(
            (slide, slideIndex) => {

                slide.classList.toggle(
                    "active",
                    slideIndex ===
                        currentHeroIndex
                );

            }
        );


        dotButtons.forEach(
            (dot, dotIndex) => {

                dot.classList.toggle(
                    "active",
                    dotIndex ===
                        currentHeroIndex
                );

            }
        );

    }


    prev?.addEventListener(
        "click",
        () => {

            showSlide(
                currentHeroIndex - 1
            );

            restartHeroTimer();

        }
    );


    next?.addEventListener(
        "click",
        () => {

            showSlide(
                currentHeroIndex + 1
            );

            restartHeroTimer();

        }
    );


    dotButtons.forEach(
        dot => {

            dot.addEventListener(
                "click",
                () => {

                    showSlide(
                        Number(
                            dot.dataset.slide
                        )
                    );

                    restartHeroTimer();

                }
            );

        }
    );


    track.addEventListener(
        "mouseenter",
        stopHeroTimer
    );


    track.addEventListener(
        "mouseleave",
        startHeroTimer
    );


    showSlide(0);

    startHeroTimer();

}


function stopHeroTimer() {

    if (heroTimer) {

        clearInterval(
            heroTimer
        );

        heroTimer = null;

    }

}


function startHeroTimer() {

    stopHeroTimer();

    heroTimer =
        setInterval(
            () => {

                const slides =
                    document.querySelectorAll(
                        "#heroSliderTrack .hero-slide"
                    );

                if (!slides.length) {
                    return;
                }


                currentHeroIndex =
                    (
                        currentHeroIndex +
                        1
                    ) %
                    slides.length;


                slides.forEach(
                    (slide, index) => {

                        slide.classList.toggle(
                            "active",
                            index ===
                                currentHeroIndex
                        );

                    }
                );


                document
                    .querySelectorAll(
                        "#sliderDots .slider-dot"
                    )
                    .forEach(
                        (dot, index) => {

                            dot.classList.toggle(
                                "active",
                                index ===
                                    currentHeroIndex
                            );

                        }
                    );

            },
            5000
        );

}


function restartHeroTimer() {
    startHeroTimer();
}


/* =====================================================
   IMAGE FALLBACK
===================================================== */

function initializeImageFallbacks() {

    document
        .querySelectorAll(
            "img"
        )
        .forEach(
            image => {

                image.addEventListener(
                    "error",
                    () => {

                        if (
                            image.dataset.fallbackApplied ===
                            "true"
                        ) {
                            return;
                        }


                        image.dataset.fallbackApplied =
                            "true";


                        if (
                            image.dataset.fallback ===
                            "true"
                        ) {

                            image.style.display =
                                "none";

                            return;

                        }


                        image.src =
                            DEFAULT_AVATAR;

                    },
                    {
                        once: true
                    }
                );

            }
        );

}


/* =====================================================
   PUBLIC API
===================================================== */

window.updateCustomerDashboard =
    function(customer) {

        if (customer) {
            renderCustomer(customer);
        }

    };


window.syncDashboardStamps =
    function(
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
            claimed,
            false
        );

    };


window.refreshLoyaltyUI =
    function() {

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


window.refreshCustomerDashboard =
    function() {

        if (
            currentCustomer
        ) {

            renderCustomer(
                currentCustomer
            );

        }

    };


window.refreshRewardStatus =
    function(
        stampCount
    ) {

        const customer =
            currentCustomer || {};

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


window.getRioDashboardState =
    function() {

        const state =
            currentCustomer
                ? getLoyaltyCycleState(
                    currentCustomer
                )
                : null;


        return {
            customer:
                currentCustomer,
            loyalty:
                state
        };

    };


/* =====================================================
   EXTERNAL AUTH EVENT
===================================================== */

window.addEventListener(
    "rio-auth-state-changed",
    event => {

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

                memberId:
                    buildMemberId(
                        user.uid
                    ),

                stamps: 0,

                rewardClaimed:
                    false,

                _authOnlyFallback:
                    true

            });

        }

    }
);


/* =====================================================
   INITIALIZE
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

    initializeImageFallbacks();

    initHeroSlider();


    try {

        const user =
            await waitForAuth();


        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;

        }


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

        dashboardInitialized =
            false;

        console.error(
            "Rio Dashboard Initialization Error:",
            error
        );

    }

}


initializeDashboard();


console.log(
    "✅ dashboard.js FINAL CUSTOMER BUILD LOADED"
);
