/* =====================================================
   RIO MAGGI POINT
   CUSTOMER DASHBOARD-FIREBASE.JS
   FINAL CLEAN BUILD

   CUSTOMER AUTH + CUSTOMER DATA + 40-DAY CYCLE
   NO ADMIN DASHBOARD CODE
===================================================== */


// =====================================================
// IMPORTS
// =====================================================

import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// DUPLICATE LOAD GUARD
// =====================================================

if (window.__RIO_DASHBOARD_FIREBASE_LOADED) {

    console.warn(
        "Rio Dashboard Firebase is already loaded."
    );

} else {

    window.__RIO_DASHBOARD_FIREBASE_LOADED = true;


    // =================================================
    // CONSTANTS
    // =================================================

    const STAMP_LIMIT = 6;

    const CYCLE_LIMIT_DAYS = 40;


    // =================================================
    // DATE CONVERTER
    // =================================================

    function convertDate(value) {

        if (!value) {
            return null;
        }


        try {

            if (
                typeof value.toDate === "function"
            ) {

                return value.toDate();

            }


            const converted =
                new Date(value);


            if (
                Number.isNaN(
                    converted.getTime()
                )
            ) {

                return null;

            }


            return converted;

        }

        catch (error) {

            console.error(
                "Date conversion error:",
                error
            );

            return null;

        }

    }


    // =================================================
    // CHECK 40-DAY CYCLE EXPIRY
    // =================================================

    function checkCycleExpired(customer) {

        if (
            !customer ||
            !customer.cycleStartedAt
        ) {

            return false;

        }


        const startDate =
            convertDate(
                customer.cycleStartedAt
            );


        if (!startDate) {

            return false;

        }


        const difference =
            Date.now() -
            startDate.getTime();


        if (difference < 0) {

            return false;

        }


        const elapsedDays =
            difference /
            (1000 * 60 * 60 * 24);


        /*
         * 40 complete days = expired.
         */

        return (
            elapsedDays >=
            CYCLE_LIMIT_DAYS
        );

    }


    // =================================================
    // RESET EXPIRED CYCLE
    //
    // IMPORTANT:
    // THIS IS ONLY THE AUTOMATIC 40-DAY RESET.
    //
    // ADMIN REWARD CLAIM & RESET IS A SEPARATE SYSTEM.
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
            Number(
                customer.stamps || 0
            );


        /*
         * Do NOT automatically reset:
         *
         * 1. A non-expired cycle
         * 2. A completed 6-stamp reward
         * 3. A claimed reward
         *
         * Completed reward is handled separately
         * through the Admin reward flow.
         */

        if (
            !checkCycleExpired(customer) ||
            stamps >= STAMP_LIMIT ||
            customer.rewardUnlocked === true ||
            customer.rewardClaimed === true
        ) {

            return customer;

        }


        try {

            const newCycleStartedAt =
                serverTimestamp();


            const resetData = {

                stamps: 0,

                rewardUnlocked: false,

                rewardClaimed: false,

                lastStampDate: null,

                cycleStartedAt:
                    newCycleStartedAt,

                updatedAt:
                    serverTimestamp()

            };


            await updateDoc(
                customerRef,
                resetData
            );


            /*
             * serverTimestamp() does not immediately
             * become a JavaScript Date locally.
             *
             * Keep the existing cycleStartedAt locally
             * rather than pretending it is null.
             *
             * The next Firebase refresh will receive the
             * real Firestore Timestamp.
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
                "40-day cycle reset failed:",
                error
            );


            return customer;

        }

    }


    // =================================================
    // LOAD CUSTOMER
    // =================================================

    async function loadCustomer(user) {

        if (!user) {

            window.currentUser = null;


            window.location.replace(
                "login.html"
            );


            return;

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


            if (!snapshot.exists()) {

                console.error(
                    "Customer profile not found."
                );


                alert(
                    "Customer profile not found."
                );


                return;

            }


            let customer = {

                uid: user.uid,

                ...snapshot.data()

            };


            customer =
                await resetExpiredCycle(
                    customerRef,
                    customer
                );


            window.currentUser =
                customer;


            window.dispatchEvent(
                new CustomEvent(
                    "dashboard-ready",
                    {
                        detail: customer
                    }
                )
            );

        }

        catch (error) {

            console.error(
                "Dashboard Firebase Error:",
                error
            );


            alert(
                "Unable to load dashboard."
            );

        }

    }


    // =================================================
    // AUTH STATE
    // =================================================

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


            if (!snapshot.exists()) {

                return null;

            }


            let customer = {

                uid: user.uid,

                ...snapshot.data()

            };


            customer =
                await resetExpiredCycle(
                    customerRef,
                    customer
                );


            window.currentUser =
                customer;


            window.dispatchEvent(
                new CustomEvent(
                    "customer-updated",
                    {
                        detail: customer
                    }
                )
            );


            return customer;

        }

        catch (error) {

            console.error(
                "Customer refresh error:",
                error
            );


            return null;

        }

    }


    // =================================================
    // STAMP VALIDATION
    // =================================================

    function validateStampCount(value) {

        let stamps =
            Number(value) || 0;


        stamps =
            Math.max(
                0,
                Math.min(
                    stamps,
                    STAMP_LIMIT
                )
            );


        return stamps;

    }


    // =================================================
    // EXTERNAL STAMP UPDATE
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


            const currentCustomer =
                window.currentUser || {};


            const updatedCustomer = {

                ...currentCustomer,

                stamps: validCount,

                rewardClaimed:
                    rewardClaimed === true,

                rewardUnlocked:
                    validCount >= STAMP_LIMIT &&
                    rewardClaimed !== true

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

        };


    // =================================================
    // CUSTOMER REFRESH HOOK
    // =================================================

    window.reloadCustomerDashboard =
        async function () {

            return refreshCustomerData();

        };


    window.addEventListener(
        "request-customer-refresh",
        () => {

            refreshCustomerData();

        }
    );


    // =================================================
    // CUSTOMER LOGOUT
    // =================================================

    window.logoutCustomer =
        async function () {

            try {

                await signOut(auth);


                sessionStorage.clear();


                localStorage.removeItem(
                    "rioCustomer"
                );


                window.currentUser =
                    null;


                window.location.replace(
                    "login.html"
                );

            }

            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Logout failed. Please try again."
                );

            }

        };


    // =================================================
    // GLOBAL CUSTOMER FIREBASE API
    // =================================================

    window.RioFirebaseDashboard = {

        refreshCustomerData,

        validateStampCount,

        resetExpiredCycle,

        checkCycleExpired,

        loadCustomer

    };


    // =================================================
    // FINAL LOG
    // =================================================

    console.log(
        "🍜 Rio Maggi Point Customer Firebase Loaded Successfully"
    );

}
