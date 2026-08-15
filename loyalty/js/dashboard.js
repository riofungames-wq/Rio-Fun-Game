/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD.JS
   FINAL CLEAN BUILD

   CUSTOMER UI + LOYALTY DISPLAY + EVENTS + LOGOUT
===================================================== */


// =====================================================
// CONSTANTS
// =====================================================

const STAMP_LIMIT = 6;


// =====================================================
// DOM ELEMENTS
// =====================================================

const customerName =
    document.getElementById("customerName");

const memberId =
    document.getElementById("memberId");

const customerAvatar =
    document.getElementById("customerAvatar");

const infoName =
    document.getElementById("infoName");

const infoEmail =
    document.getElementById("infoEmail");

const infoMobile =
    document.getElementById("infoMobile");

const infoGender =
    document.getElementById("infoGender");

const infoStatus =
    document.getElementById("infoStatus");

const rewardStatus =
    document.getElementById("rewardStatus");

const stampCountElement =
    document.getElementById("stampCount");

const stamps = [
    document.getElementById("stamp1"),
    document.getElementById("stamp2"),
    document.getElementById("stamp3"),
    document.getElementById("stamp4"),
    document.getElementById("stamp5"),
    document.getElementById("stamp6")
];

const logoutBtn =
    document.getElementById("logoutBtn");


// =====================================================
// NORMALIZE STAMP COUNT
// =====================================================

function normalizeStampCount(value) {

    let count = Number(value) || 0;

    count = Math.max(
        0,
        Math.min(
            count,
            STAMP_LIMIT
        )
    );

    return count;
}


// =====================================================
// RENDER CUSTOMER
// =====================================================

function renderCustomer(customer) {

    if (!customer) {
        return;
    }


    // -------------------------------------------------
    // NAME
    // -------------------------------------------------

    if (customerName) {

        customerName.textContent =
            customer.name ||
            "Premium Member";

    }


    // -------------------------------------------------
    // MEMBER ID
    // -------------------------------------------------

    if (memberId) {

        memberId.textContent =
            "Member ID : " +
            (
                customer.memberId ||
                "RIO-000000"
            );

    }


    // -------------------------------------------------
    // AVATAR
    // -------------------------------------------------

    if (customerAvatar) {

        customerAvatar.src =
            customer.avatar ||
            customer.photoURL ||
            "assets/avatars/default.png";


        customerAvatar.onerror =
            function () {

                this.onerror = null;

                this.src =
                    "assets/avatars/default.png";

            };

    }


    // -------------------------------------------------
    // CUSTOMER DETAILS
    // -------------------------------------------------

    if (infoName) {

        infoName.textContent =
            customer.name || "-";

    }


    if (infoEmail) {

        infoEmail.textContent =
            customer.email || "-";

    }


    if (infoMobile) {

        infoMobile.textContent =
            customer.mobile ||
            customer.phone ||
            "-";

    }


    if (infoGender) {

        infoGender.textContent =
            customer.gender ||
            "-";

    }


    if (infoStatus) {

        infoStatus.textContent =
            customer.status ||
            "Active";

    }


    // -------------------------------------------------
    // LOYALTY
    // -------------------------------------------------

    updateStamps(
        customer.stamps,
        customer.rewardClaimed === true
    );

}


// =====================================================
// UPDATE STAMPS
// =====================================================

function updateStamps(
    count,
    rewardClaimed = false
) {

    const total =
        normalizeStampCount(count);


    // -------------------------------------------------
    // NUMBER
    // -------------------------------------------------

    if (stampCountElement) {

        stampCountElement.textContent =
            total;

    }


    // -------------------------------------------------
    // CLEAR CURRENT STAMP STATE
    // -------------------------------------------------

    stamps.forEach(function (box) {

        if (!box) {
            return;
        }

        box.classList.remove("active");

        box.classList.remove("completed");

    });


    // -------------------------------------------------
    // MARK COMPLETED STAMPS
    // -------------------------------------------------

    for (
        let i = 0;
        i < total;
        i++
    ) {

        if (!stamps[i]) {
            continue;
        }

        stamps[i].classList.add("active");

        stamps[i].classList.add("completed");

    }


    // -------------------------------------------------
    // REWARD STATUS
    // -------------------------------------------------

    updateRewardStatus(
        total,
        rewardClaimed
    );

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
        normalizeStampCount(stampCount);


    // -------------------------------------------------
    // REWARD CLAIMED
    // -------------------------------------------------

    if (rewardClaimed === true) {

        rewardStatus.innerHTML = `
            <strong>
                🎉 Reward Used
            </strong>

            <br><br>

            Start collecting stamps again 🍜
        `;

        rewardStatus.classList.remove(
            "reward-unlocked"
        );

        rewardStatus.classList.add(
            "reward-used"
        );

        return;
    }


    // -------------------------------------------------
    // 6 VALID STAMPS
    // -------------------------------------------------

    if (total >= STAMP_LIMIT) {

        rewardStatus.innerHTML = `
            <strong>
                🎉 Congratulations!
            </strong>

            <br><br>

            FREE Veg Maggi Unlocked 🍜
        `;

        rewardStatus.classList.remove(
            "reward-used"
        );

        rewardStatus.classList.add(
            "reward-unlocked"
        );

        return;
    }


    // -------------------------------------------------
    // REWARD LOCKED
    // -------------------------------------------------

    const remaining =
        STAMP_LIMIT - total;


    rewardStatus.innerHTML = `
        You have

        <strong>
            ${total}
        </strong>

        valid stamps

        <br><br>

        Collect

        <strong>
            ${remaining}
        </strong>

        more stamps

        to unlock FREE Veg Maggi 🍜
    `;


    rewardStatus.classList.remove(
        "reward-used"
    );

    rewardStatus.classList.remove(
        "reward-unlocked"
    );

}


// =====================================================
// DASHBOARD READY
// =====================================================

window.addEventListener(
    "dashboard-ready",
    function (event) {

        const customer =
            event.detail ||
            window.currentUser;


        if (!customer) {

            console.warn(
                "Customer data not available."
            );

            return;
        }


        window.currentUser =
            customer;


        renderCustomer(customer);

    }
);


// =====================================================
// CUSTOMER UPDATED
// =====================================================

window.addEventListener(
    "customer-updated",
    function (event) {

        const customer =
            event.detail;


        if (!customer) {
            return;
        }


        window.currentUser =
            customer;


        renderCustomer(customer);

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


        window.currentUser =
            customer;


        renderCustomer(customer);

    };


// =====================================================
// LOGOUT
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            const confirmLogout =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            try {

                /*
                 * Firebase signOut is handled by
                 * dashboard-firebase.js.
                 */

                if (
                    typeof window.logoutCustomer !==
                    "function"
                ) {

                    console.error(
                        "Firebase logout function unavailable."
                    );

                    alert(
                        "Logout system is not ready. Please try again."
                    );

                    return;
                }


                await window.logoutCustomer();

            }

            catch (error) {

                console.error(
                    "Dashboard Logout Error:",
                    error
                );

                alert(
                    "Logout failed. Please try again."
                );

            }

        }
    );

}


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


        window.currentUser =
            customer;


        renderCustomer(customer);

    };


// =====================================================
// INITIAL CUSTOMER CHECK
// =====================================================

function initDashboard() {

    if (window.currentUser) {

        renderCustomer(
            window.currentUser
        );

    }

}


initDashboard();


// =====================================================
// PUBLIC DASHBOARD API
// =====================================================

window.RioDashboard = {

    renderCustomer,
    updateStamps,
    updateRewardStatus,
    normalizeStampCount

};


// =====================================================
// FINAL LOG
// =====================================================

console.log(
    "🍜 Rio Maggi Point Customer Dashboard UI Loaded Successfully"
);
