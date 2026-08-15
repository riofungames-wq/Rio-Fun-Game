/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   FINAL MASTER BUILD
   =====================================================

   RESPONSIBILITIES:
   - Customer dashboard UI
   - Customer identity rendering
   - Loyalty stamp UI
   - 40-day cycle display
   - Reward status UI
   - QR rendering hook
   - Bottom navigation
   - Notifications hook
   - Logout
   - Dashboard global APIs
   - Customer update synchronization

   ARCHITECTURE:
   - ONE COMMON CUSTOMER DASHBOARD
   - NO Firebase initialization here
   - Firebase app/auth/db remain centralized
   - Uses centralized app.js
   - Firebase Auth version: 12.x

   IMPORTANT:
   - This file is UI/state synchronization only.
   - Loyalty anti-cheat and stamp authorization MUST
     remain enforced by the secure backend/admin layer.
===================================================== */

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
// SAFE NUMBER
// =====================================================

function safeNumber(value, fallback = 0) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


// =====================================================
// NORMALIZE STAMP COUNT
// =====================================================

function normalizeStampCount(value) {

    const number =
        safeNumber(value, 0);

    return Math.max(
        0,
        Math.min(
            Math.floor(number),
            STAMP_LIMIT
        )
    );
}


// =====================================================
// CUSTOMER NAME
// =====================================================

function getCustomerDisplayName(customer) {

    if (!customer) {
        return "Premium Member";
    }

    const name =
        customer.name ||
        customer.displayName ||
        customer.fullName ||
        "Premium Member";

    return String(name).trim() ||
        "Premium Member";
}


// =====================================================
// CUSTOMER AVATAR
// =====================================================

function getCustomerAvatar(customer) {

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


// =====================================================
// UPDATE CUSTOMER NAMES
// =====================================================

function updateCustomerNames(customer) {

    const name =
        getCustomerDisplayName(customer);

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

function updateMemberId(customer) {

    if (!memberId) {
        return;
    }

    const id =
        customer?.memberId ||
        customer?.memberID ||
        customer?.customerId ||
        customer?.customerID ||
        "RIO-000000";

    memberId.textContent =
        `Member ID : ${String(id)}`;
}


// =====================================================
// UPDATE AVATARS
// =====================================================

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


// =====================================================
// GET CUSTOMER STAMP COUNT
// =====================================================

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


// =====================================================
// GET REWARD CLAIMED STATE
// =====================================================

function isRewardClaimed(customer) {

    if (!customer) {
        return false;
    }

    return (
        customer.rewardClaimed === true ||
        customer.rewardStatus === "claimed"
    );
}


// =====================================================
// UPDATE STAMP COUNT
// =====================================================

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


// =====================================================
// UPDATE STAMP BOXES
// =====================================================

function updateStampBoxes(count) {

    const total =
        normalizeStampCount(count);

    stampBoxes.forEach(
        (box, index) => {

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

function updateProgressBar(count) {

    const total =
        normalizeStampCount(count);

    const percentage =
        Math.round(
            (total / STAMP_LIMIT) * 100
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
        progressBar.getAttribute("role") === "progressbar"
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

function getCycleStartDate(customer) {

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

    // Firestore Timestamp
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

    // Firestore timestamp-like object
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
// CALCULATE CYCLE DAYS REMAINING
// =====================================================

function calculateCycleDaysRemaining(customer) {

    if (!customer) {
        return CYCLE_DAYS;
    }

    // Prefer backend-calculated value.
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

    // Compatibility with existing data layer.
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

    /*
     * No cycle start means the customer-data
     * layer has not supplied an active cycle.
     */
    if (!cycleStart) {
        return CYCLE_DAYS;
    }

    const now =
        new Date();

    /*
     * Prevent invalid future timestamps from
     * producing more than the configured cycle.
     */
    const effectiveStart =
        cycleStart.getTime() > now.getTime()
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
        CYCLE_DAYS - elapsedDays
    );
}


// =====================================================
// UPDATE CYCLE DISPLAY
// =====================================================

function updateCycleDays(customer) {

    if (!cycleDaysRemaining) {
        return;
    }

    const remaining =
        calculateCycleDaysRemaining(
            customer
        );

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

    if (remaining <= 0) {

        cycleStatus.classList.add(
            "expired"
        );

        cycleStatus.textContent =
            "Your loyalty cycle has expired.";

    } else if (remaining <= 7) {

        cycleStatus.classList.add(
            "warning"
        );

        cycleStatus.textContent =
            `Your loyalty cycle expires in ${remaining} day${remaining === 1 ? "" : "s"}.`;

    } else {

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


    // -------------------------------------------------
    // CLAIMED
    // -------------------------------------------------

    if (rewardClaimed === true) {

        rewardStatus.classList.add(
            "reward-used"
        );

        rewardStatus.innerHTML = `
            <strong>
                🎉 Reward Used
            </strong>

            <span>
                Start collecting stamps again 🍜
            </span>
        `;

        return;
    }


    // -------------------------------------------------
    // UNLOCKED
    // -------------------------------------------------

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


    // -------------------------------------------------
    // LOCKED
    // -------------------------------------------------

    rewardStatus.classList.add(
        "reward-locked"
    );

    const remaining =
        STAMP_LIMIT - total;

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
// RENDER CUSTOMER
// =====================================================

function renderCustomer(customer) {

    if (
        !customer ||
        typeof customer !== "object"
    ) {
        return;
    }

    /*
     * IMPORTANT:
     * Auth-only fallback objects must NEVER
     * become the permanent customer state.
     */
    const isAuthOnlyFallback =
        customer._authOnlyFallback === true;

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

    /*
     * Notify other dashboard modules.
     */
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
                                section.id === targetId
                            );
                        }
                    );

                    navItems.forEach(
                        (navItem) => {

                            const isActive =
                                navItem === item;

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
// NOTIFICATION BUTTON
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

    } catch (error) {

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

            } catch {

                /*
                 * logoutCustomer already
                 * displays the user-facing error.
                 */
            }
        }
    );
}


// =====================================================
// AUTH EVENT
// =====================================================

window.addEventListener(
    "rio-auth-state-changed",
    (event) => {

        const user =
            event.detail?.user;

        if (!user) {
            return;
        }

        /*
         * IMPORTANT FIX:
         *
         * Auth data is only a temporary UI fallback.
         *
         * It must NOT populate currentCustomer
         * or window.currentUser.
         *
         * This prevents the Auth fallback from
         * interfering with the real Firestore
         * customer-data layer.
         */

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
    function (customer) {

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

        /*
         * If rewardClaimed was not supplied,
         * preserve current customer state.
         */
        const claimed =
            typeof rewardClaimed === "boolean"
                ? rewardClaimed
                : isRewardClaimed(
                    currentCustomer
                );

        updateStamps(
            total,
            claimed
        );

        /*
         * This is only a local UI synchronization.
         * It does NOT write anything to Firebase.
         */
        if (currentCustomer) {

            currentCustomer = {
                ...currentCustomer,
                stamps: total,
                stampCount: total,
                rewardClaimed: claimed
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
// REFRESH CURRENT LOYALTY UI
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

function notifyQRLayer(customer) {

    if (!customer) {
        return;
    }

    /*
     * Never send Auth-only fallback to the QR layer.
     * QR should use the real customer profile.
     */
    if (
        customer._authOnlyFallback === true
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
// CUSTOMER RENDER EVENT
// =====================================================

window.addEventListener(
    "rio-customer-rendered",
    (event) => {

        const customer =
            event.detail?.customer;

        if (!customer) {
            return;
        }

        notifyQRLayer(
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

    isRewardClaimed
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

    initializeLogout();

    try {

        const user =
            await waitForAuth();

        /*
         * No authenticated user:
         * return to login.
         */
        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;
        }

        /*
         * If a real customer-data layer has
         * already populated the global customer
         * object, render the complete profile.
         */
        if (
            window.currentUser &&
            typeof window.currentUser === "object"
        ) {

            renderCustomer(
                window.currentUser
            );
        }

        /*
         * Tell other dashboard modules
         * that the UI is ready.
         */
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

    } catch (error) {

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
