/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD-FIREBASE.JS
   FINAL CLEAN BUILD

   CUSTOMER AUTH
   CUSTOMER PROFILE
   CUSTOMER DATA REFRESH
   40-DAY LOYALTY CYCLE
   REWARD STATE
   CUSTOMER LOGOUT

   ARCHITECTURE:
   - Firebase initialization ONLY in app.js
   - No initializeApp() here
   - No duplicate Firebase initialization
   - No admin logic
   - No stamp-awarding logic

   LOYALTY:
   6 VALID STAMPS
   7TH CIRCLE = FREE VEG MAGGI REWARD
===================================================== */


// =====================================================
// CENTRAL FIREBASE APPLICATION
// =====================================================

import {
    auth,
    db,
    APP_CONFIG
} from "./app.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// DUPLICATE MODULE LOAD GUARD
// =====================================================

if (window.__RIO_DASHBOARD_FIREBASE_LOADED === true) {

    console.warn(
        "Rio Maggi Point: dashboard-firebase.js already loaded."
    );

} else {

    window.__RIO_DASHBOARD_FIREBASE_LOADED = true;


    // =================================================
    // LOYALTY CONSTANTS
    // =================================================

    const STAMP_LIMIT =
        Number(
            APP_CONFIG?.loyaltyStampsRequired
        ) || 6;


    const REWARD_CIRCLE =
        STAMP_LIMIT + 1;


    const CYCLE_LIMIT_DAYS =
        Number(
            APP_CONFIG?.loyaltyCycleDays
        ) || 40;


    // =================================================
    // DATE CONVERTER
    // =================================================

    function convertDate(value) {

        if (!value) {
            return null;
        }


        try {

            /*
             * Firestore Timestamp
             */

            if (
                value &&
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


            /*
             * JavaScript Date
             */

            if (
                value instanceof Date
            ) {

                return Number.isNaN(
                    value.getTime()
                )
                    ? null
                    : value;

            }


            /*
             * Firestore timestamp-like object
             */

            if (
                typeof value === "object" &&
                Number.isFinite(value.seconds)
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


            /*
             * String / number
             */

            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return null;

            }


            return date;

        }

        catch (error) {

            console.error(
                "Rio Dashboard: Date conversion failed.",
                error
            );

            return null;

        }

    }


    // =================================================
    // VALIDATE STAMP COUNT
    // =================================================

    function validateStampCount(value) {

        let count =
            Number(value);


        if (
            !Number.isFinite(count)
        ) {

            count = 0;

        }


        /*
         * Stamps are always whole numbers.
         */

        count =
            Math.floor(count);


        return Math.max(
            0,
            Math.min(
                count,
                STAMP_LIMIT
            )
        );

    }


    // =================================================
    // CHECK REWARD UNLOCK STATE
    // =================================================

    function isRewardUnlocked(
        stampCount,
        rewardClaimed = false
    ) {

        const count =
            validateStampCount(
                stampCount
            );


        return (
            count >= STAMP_LIMIT &&
            rewardClaimed !== true
        );

    }


    // =================================================
    // BUILD CUSTOMER STATE
    // =================================================

    function buildCustomer(
        user,
        profileData = {}
    ) {

        const stamps =
            validateStampCount(
                profileData.stamps
            );


        const rewardClaimed =
            profileData.rewardClaimed === true;


        const rewardUnlocked =
            isRewardUnlocked(
                stamps,
                rewardClaimed
            );


        return {

            ...profileData,

            uid:
                user.uid,

            stamps,

            rewardUnlocked,

            rewardClaimed

        };

    }


    // =================================================
    // CHECK 40-DAY CYCLE EXPIRY
    // =================================================

    function checkCycleExpired(
        customer
    ) {

        if (
            !customer ||
            !customer.cycleStartedAt
        ) {

            return false;

        }


        const cycleStart =
            convertDate(
                customer.cycleStartedAt
            );


        if (!cycleStart) {

            return false;

        }


        const elapsedMilliseconds =
            Date.now() -
            cycleStart.getTime();


        /*
         * Future timestamp is never considered expired.
         */

        if (
            elapsedMilliseconds < 0
        ) {

            return false;

        }


        const elapsedDays =
            elapsedMilliseconds /
            (1000 * 60 * 60 * 24);


        return (
            elapsedDays >=
            CYCLE_LIMIT_DAYS
        );

    }


    // =================================================
    // RESET EXPIRED INCOMPLETE CYCLE
    // =================================================

    async function resetExpiredCycle(
        customerRef,
        customer
    ) {

        if (
            !customerRef ||
            !customer
        ) {

            return customer;

        }


        const stamps =
            validateStampCount(
                customer.stamps
            );


        const rewardClaimed =
            customer.rewardClaimed === true;


        const rewardUnlocked =
            isRewardUnlocked(
                stamps,
                rewardClaimed
            );


        /*
         * Only an incomplete cycle can expire.
         *
         * If 6 stamps are already complete,
         * the reward must remain available.
         */

        if (
            !checkCycleExpired(customer) ||
            stamps >= STAMP_LIMIT ||
            rewardUnlocked ||
            rewardClaimed
        ) {

            return customer;

        }


        try {

            await updateDoc(
                customerRef,
                {

                    stamps: 0,

                    rewardUnlocked: false,

                    rewardClaimed: false,

                    lastStampDate: null,

                    cycleStartedAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            /*
             * Do not fake a JavaScript date for
             * serverTimestamp().
             *
             * The next Firestore read will provide
             * the real Timestamp.
             */

            return {

                ...customer,

                stamps: 0,

                rewardUnlocked: false,

                rewardClaimed: false,

                lastStampDate: null,

                cycleReset: true

            };

        }

        catch (error) {

            console.error(
                "Rio Dashboard: 40-day cycle reset failed.",
                error
            );


            /*
             * Never destroy the local customer state
             * if the Firestore reset fails.
             */

            return customer;

        }

    }


    // =================================================
    // LOAD CUSTOMER
    // =================================================

    async function loadCustomer(
        user
    ) {

        /*
         * No authenticated customer.
         */

        if (!user) {

            window.currentUser =
                null;


            /*
             * Avoid repeatedly redirecting if already
             * on login page.
             */

            const currentPage =
                window.location.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();


            if (
                currentPage !==
                "login.html"
            ) {

                window.location.replace(
                    "login.html"
                );

            }


            return null;

        }


        try {

            const customerRef =
                doc(
                    db,
                    "customers",
                    user.uid
                );


            const snapshot =
                await getDoc(
                    customerRef
                );


            if (
                !snapshot.exists()
            ) {

                console.error(
                    "Rio Dashboard: Customer profile not found."
                );


                window.currentUser =
                    null;


                alert(
                    "Customer profile not found."
                );


                return null;

            }


            /*
             * Build normalized customer object.
             */

            let customer =
                buildCustomer(
                    user,
                    snapshot.data()
                );


            /*
             * Check 40-day expiry.
             */

            customer =
                await resetExpiredCycle(
                    customerRef,
                    customer
                );


            /*
             * Recalculate reward state after
             * possible cycle reset.
             */

            customer =
                buildCustomer(
                    user,
                    customer
                );


            /*
             * Store globally.
             */

            window.currentUser =
                customer;


            /*
             * Notify dashboard.js.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "dashboard-ready",
                    {
                        detail:
                            customer
                    }
                )
            );


            return customer;

        }

        catch (error) {

            console.error(
                "Rio Dashboard Firebase Error:",
                error
            );


            alert(
                "Unable to load dashboard. Please try again."
            );


            return null;

        }

    }


    // =================================================
    // AUTH STATE LISTENER
    // =================================================

    const unsubscribeAuth =
        onAuthStateChanged(
            auth,
            loadCustomer
        );


    // =================================================
    // REFRESH CUSTOMER DATA
    // =================================================

    async function refreshCustomerData() {

        const user =
            auth.currentUser;


        if (!user) {

            return null;

        }


        try {

            const customerRef =
                doc(
                    db,
                    "customers",
                    user.uid
                );


            const snapshot =
                await getDoc(
                    customerRef
                );


            if (
                !snapshot.exists()
            ) {

                return null;

            }


            let customer =
                buildCustomer(
                    user,
                    snapshot.data()
                );


            /*
             * Recheck 40-day cycle on every refresh.
             */

            customer =
                await resetExpiredCycle(
                    customerRef,
                    customer
                );


            /*
             * Normalize reward state again.
             */

            customer =
                buildCustomer(
                    user,
                    customer
                );


            window.currentUser =
                customer;


            window.dispatchEvent(
                new CustomEvent(
                    "customer-updated",
                    {
                        detail:
                            customer
                    }
                )
            );


            return customer;

        }

        catch (error) {

            console.error(
                "Rio Dashboard: Customer refresh failed.",
                error
            );


            return null;

        }

    }


    // =================================================
    // UI-ONLY CUSTOMER STAMP SYNC
    //
    // IMPORTANT:
    // This DOES NOT write stamps to Firestore.
    //
    // Actual stamp awarding remains controlled
    // by the authorized/admin/server-side flow.
    // =================================================

    window.updateCustomerStamps =
        function (
            stampCount,
            rewardClaimed = false
        ) {

            const validCount =
                validateStampCount(
                    stampCount
                );


            const claimed =
                rewardClaimed === true;


            const currentCustomer =
                window.currentUser || {};


            const updatedCustomer = {

                ...currentCustomer,

                stamps:
                    validCount,

                rewardClaimed:
                    claimed,

                rewardUnlocked:
                    isRewardUnlocked(
                        validCount,
                        claimed
                    )

            };


            window.currentUser =
                updatedCustomer;


            window.dispatchEvent(
                new CustomEvent(
                    "customer-updated",
                    {
                        detail:
                            updatedCustomer
                    }
                )
            );


            return updatedCustomer;

        };


    // =================================================
    // RELOAD DASHBOARD
    // =================================================

    window.reloadCustomerDashboard =
        async function () {

            return (
                await refreshCustomerData()
            );

        };


    // =================================================
    // CUSTOMER REFRESH EVENT
    // =================================================

    const refreshEventHandler =
        function () {

            refreshCustomerData();

        };


    window.addEventListener(
        "request-customer-refresh",
        refreshEventHandler
    );


    // =================================================
    // CUSTOMER LOGOUT
    // =================================================

    window.logoutCustomer =
        async function () {

            try {

                await signOut(
                    auth
                );


                /*
                 * Clear customer-only temporary data.
                 */

                try {

                    sessionStorage.clear();

                }

                catch (storageError) {

                    console.warn(
                        "Rio Dashboard: Session storage could not be cleared.",
                        storageError
                    );

                }


                try {

                    localStorage.removeItem(
                        "rioCustomer"
                    );

                }

                catch (storageError) {

                    console.warn(
                        "Rio Dashboard: Customer local storage could not be cleared.",
                        storageError
                    );

                }


                window.currentUser =
                    null;


                window.location.replace(
                    "login.html"
                );

            }

            catch (error) {

                console.error(
                    "Rio Dashboard: Logout failed.",
                    error
                );


                alert(
                    "Logout failed. Please try again."
                );

            }

        };


    // =================================================
    // PUBLIC FIREBASE DASHBOARD API
    // =================================================

    window.RioFirebaseDashboard = {

        loadCustomer,

        refreshCustomerData,

        validateStampCount,

        checkCycleExpired,

        resetExpiredCycle,

        buildCustomer,

        isRewardUnlocked,

        STAMP_LIMIT,

        REWARD_CIRCLE,

        CYCLE_LIMIT_DAYS,

        unsubscribeAuth

    };


    // =================================================
    // FINAL LOG
    // =================================================

    console.log(
        "🍜 Rio Maggi Point - Customer Firebase Module Ready"
    );

}
