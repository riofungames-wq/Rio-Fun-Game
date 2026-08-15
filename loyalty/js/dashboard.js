/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   FINAL MASTER BUILD

   RESPONSIBILITIES:
   - Customer UI rendering
   - Loyalty UI
   - QR UI sync
   - Cycle display
   - Bottom navigation
   - Logout
   - Dashboard events

   IMPORTANT:
   - NO Firebase initialization here
   - Uses centralized app.js
===================================================== */

import {
    auth,
    APP_CONFIG,
    waitForAuth
} from "./app.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================================
// CONFIG
// =====================================================

const STAMP_LIMIT =
    Number(APP_CONFIG?.loyaltyStampsRequired) || 6;

const CYCLE_DAYS =
    Number(APP_CONFIG?.loyaltyCycleDays) || 40;

const DEFAULT_AVATAR =
    "assets/avatars/default.png";


// =====================================================
// DOM HELPER
// =====================================================

function getElement(id) {
    return document.getElementById(id);
}


// =====================================================
// DOM ELEMENTS
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

const rewardStatus =
    getElement("rewardStatus");

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
// STAMP NORMALIZATION
// =====================================================

function normalizeStampCount(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

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

    return (
        customer.name ||
        customer.displayName ||
        customer.fullName ||
        "Premium Member"
    );

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
        DEFAULT_AVATAR
    );

}


// =====================================================
// SAFE AVATAR SET
// =====================================================

function setAvatar(element, source) {

    if (!element) {
        return;
    }

    element.onerror = function () {

        this.onerror = null;

        this.src =
            DEFAULT_AVATAR;

    };

    element.src =
        source || DEFAULT_AVATAR;

}


// =====================================================
// UPDATE CUSTOMER NAME UI
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
        "RIO-000000";

    memberId.textContent =
        `Member ID : ${id}`;

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
// UPDATE STAMP NUMBERS
// =====================================================

function updateStampCountUI(count) {

    const total =
        normalizeStampCount(count);


    if (stampCountElement) {

        stampCountElement.textContent =
            total;

    }


    if (qrStampCount) {

        qrStampCount.textContent =
            total;

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
                "completed"
            );


            if (index < total) {

                box.classList.add(
                    "active",
                    "completed"
                );

            }

        }
    );

}


// =====================================================
// GET CYCLE DAYS
// =====================================================

function getCycleDaysRemaining(customer) {

    const directValue =
        Number(
            customer?.cycleDaysRemaining
        );


    if (Number.isFinite(directValue)) {

        return Math.max(
            0,
            Math.floor(directValue)
        );

    }


    const daysValue =
        Number(
            customer?.daysRemaining
        );


    if (Number.isFinite(daysValue)) {

        return Math.max(
            0,
            Math.floor(daysValue)
        );

    }


    /*
     * If no calculated cycle value has been
     * supplied by the customer-data layer,
     * display the configured cycle length.
     */

    return CYCLE_DAYS;

}


// =====================================================
// UPDATE CYCLE DISPLAY
// =====================================================

function updateCycleDays(customer) {

    if (!cycleDaysRemaining) {
        return;
    }


    const remaining =
        getCycleDaysRemaining(
            customer
        );


    cycleDaysRemaining.textContent =
        `${remaining} Day${remaining === 1 ? "" : "s"}`;

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
        "reward-unlocked"
    );


    // -------------------------------------------------
    // REWARD ALREADY CLAIMED
    // -------------------------------------------------

    if (rewardClaimed === true) {

        rewardStatus.classList.add(
            "reward-used"
        );


        rewardStatus.innerHTML = `
            <strong>
                🎉 Reward Used
            </strong>

            <br><br>

            Start collecting stamps again 🍜
        `;

        return;

    }


    // -------------------------------------------------
    // REWARD UNLOCKED
    // -------------------------------------------------

    if (total >= STAMP_LIMIT) {

        rewardStatus.classList.add(
            "reward-unlocked"
        );


        rewardStatus.innerHTML = `
            <strong>
                🎉 Congratulations!
            </strong>

            <br><br>

            FREE Veg Maggi Unlocked 🍜
        `;

        return;

    }


    // -------------------------------------------------
    // REWARD LOCKED
    // -------------------------------------------------

    const remaining =
        STAMP_LIMIT - total;


    rewardStatus.innerHTML = `
        <strong>
            ${total}
        </strong>
        valid stamp${total === 1 ? "" : "s"}

        <br><br>

        Collect
        <strong>
            ${remaining}
        </strong>
        more stamp${remaining === 1 ? "" : "s"}

        to unlock FREE Veg Maggi 🍜
    `;

}


// =====================================================
// UPDATE LOYALTY UI
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


    updateRewardStatus(
        total,
        rewardClaimed
    );

}


// =====================================================
// RENDER CUSTOMER
// =====================================================

function renderCustomer(customer) {

    if (!customer) {
        return;
    }


    window.currentUser =
        customer;


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
        customer.stamps ??
        customer.stampCount ??
        0;


    updateStamps(
        stamps,
        customer.rewardClaimed === true
    );


    updateCycleDays(
        customer
    );

}


// =====================================================
// BOTTOM NAVIGATION
// =====================================================

function initializeBottomNavigation() {

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

    if (!notificationBtn) {
        return;
    }


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

    try {

        await signOut(
            auth
        );


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

    if (!logoutBtn) {
        return;
    }


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

                /*
                 * logoutCustomer already handles
                 * the user-facing error.
                 */

            }

        }
    );

}


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


        /*
         * Do not replace an existing Firestore
         * customer profile with Auth-only data.
         */

        if (!window.currentUser) {

            renderCustomer({

                uid:
                    user.uid,

                email:
                    user.email || "",

                name:
                    user.displayName ||
                    "Premium Member",

                photoURL:
                    user.photoURL || ""

            });

        }

    }
);


// =====================================================
// GLOBAL CUSTOMER UPDATE
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
        rewardClaimed = false
    ) {

        updateStamps(
            count,
            rewardClaimed
        );

    };


// =====================================================
// REWARD STATUS REFRESH
// =====================================================

window.refreshRewardStatus =
    function (stampCount) {

        const customer =
            window.currentUser || {};


        updateRewardStatus(
            stampCount,
            customer.rewardClaimed === true
        );

    };


// =====================================================
// CUSTOMER DASHBOARD REFRESH
// =====================================================

window.refreshCustomerDashboard =
    function (customer) {

        if (!customer) {
            return;
        }


        renderCustomer(
            customer
        );

    };


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

async function initializeDashboard() {

    initializeBottomNavigation();

    initializeNotificationButton();

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
         * If the customer-data layer has already
         * populated window.currentUser, render it.
         */

        if (window.currentUser) {

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
            "Dashboard initialization error:",
            error
        );

    }

}


// =====================================================
// PUBLIC DASHBOARD API
// =====================================================

window.RioDashboard = {

    renderCustomer,

    updateStamps,

    updateRewardStatus,

    normalizeStampCount,

    updateCycleDays

};


// =====================================================
// START
// =====================================================

initializeDashboard();
