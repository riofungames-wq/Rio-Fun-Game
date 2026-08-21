// ==========================================
// RIO MAGGI POINT
// APP.JS - PART 1/3
// CENTRAL FIREBASE APPLICATION CORE
// ==========================================


// ==========================================
// FIREBASE IMPORTS
// ==========================================

import {
    auth,
    db,
    storage
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ==========================================
// FIREBASE APP
// ==========================================
//
// firebase-config.js is the SINGLE source
// for Firebase initialization.
//
// No duplicate initializeApp() here.
//

import {
    app as firebaseApp
} from "./firebase-config.js";


// ==========================================
// GLOBAL APP CONFIGURATION
// ==========================================

const APP_CONFIG = Object.freeze({

    appName:
        "Rio Maggi Point",

    appShortName:
        "Rio Maggi",


    // ======================================
    // LOYALTY CARD RULES
    // ======================================

    /*
     * Customer needs 6 valid stamps
     * to unlock the FREE Veg Maggi reward.
     */
    loyaltyStampsRequired:
        6,


    /*
     * Visual loyalty card contains
     * 7 circles/slots.
     *
     * 1-6 = valid stamp slots
     * 7   = FREE reward slot
     */
    loyaltyCardSlots:
        7,


    /*
     * Final reward item.
     */
    rewardItem:
        "Veg Maggi",


    /*
     * Customer gets 40 days to complete
     * the complete loyalty journey.
     */
    loyaltyCycleDays:
        40,


    /*
     * One valid stamp per calendar day.
     *
     * IMPORTANT:
     * This is only a client-side helper.
     * Final enforcement must happen through
     * secure Firestore/admin/backend logic.
     */
    dailyStampLimit:
        1,


    // ======================================
    // CONTACT
    // ======================================

    contactNumber:
        "7987827979",

    whatsappNumber:
        "917987827979",


    // ======================================
    // BUSINESS STATUS
    // ======================================

    homeDeliveryStatus:
        "coming-soon",

    locationStatus:
        "coming-soon"

});


// ==========================================
// GLOBAL APP STATE
// ==========================================

const APP_STATE = {

    user:
        null,

    userProfile:
        null,

    isAuthenticated:
        false,

    isLoading:
        true,

    currentPage:
        null

};


// ==========================================
// PAGE DETECTION
// ==========================================

function getCurrentPage() {

    const path =
        window.location.pathname;


    const fileName =
        path
            .split("/")
            .pop()
            .toLowerCase();


    if (
        !fileName ||
        fileName === "/"
    ) {

        return "index";

    }


    return fileName.replace(
        ".html",
        ""
    );

}


// ==========================================
// SET CURRENT PAGE
// ==========================================

APP_STATE.currentPage =
    getCurrentPage();


// ==========================================
// AUTH STATE LISTENER
// ==========================================

function initializeAuthListener() {

    return onAuthStateChanged(
        auth,
        (user) => {

            APP_STATE.user =
                user;


            APP_STATE.isAuthenticated =
                Boolean(user);


            APP_STATE.isLoading =
                false;


            window.dispatchEvent(
                new CustomEvent(
                    "rio-auth-state-changed",
                    {
                        detail: {

                            user,

                            isAuthenticated:
                                APP_STATE.isAuthenticated

                        }
                    }
                )
            );

        }
    );

}


// ==========================================
// START AUTH LISTENER
// ==========================================

const unsubscribeAuth =
    initializeAuthListener();


// ==========================================
// GLOBAL RIO APP OBJECT
// ==========================================

const RioApp = {

    firebaseApp,

    auth,

    db,

    storage,

    config:
        APP_CONFIG,

    state:
        APP_STATE,

    unsubscribeAuth,

    getCurrentPage

};


// ==========================================
// MAKE AVAILABLE GLOBALLY
// ==========================================

window.RioApp =
    RioApp;


// ==========================================
// APPLICATION READY EVENT
// ==========================================

window.dispatchEvent(
    new CustomEvent(
        "rio-app-ready",
        {
            detail:
                RioApp
        }
    )
);


// ==========================================
// DEBUG MESSAGE
// ==========================================

console.log(
    "RIO MAGGI POINT - APP CORE READY",
    {

        page:
            APP_STATE.currentPage,

        authenticated:
            APP_STATE.isAuthenticated,

        loyaltyCycleDays:
            APP_CONFIG.loyaltyCycleDays,

        loyaltyStampsRequired:
            APP_CONFIG.loyaltyStampsRequired,

        loyaltyCardSlots:
            APP_CONFIG.loyaltyCardSlots

    }
);


// ==========================================
// EXPORTS
// ==========================================

export {

    firebaseApp,

    auth,

    db,

    storage,

    APP_CONFIG,

    APP_STATE,

    RioApp,

    getCurrentPage,

    initializeAuthListener

};


// ==========================================
// END OF APP.JS PART 1/3
// ==========================================
// ==========================================
// RIO MAGGI POINT
// APP.JS - PART 2/3
// GLOBAL AUTH + USER HELPERS
// ==========================================


// ==========================================
// AUTHENTICATION HELPERS
// ==========================================

function getCurrentUser() {

    return (
        auth.currentUser ||
        null
    );

}


// ==========================================
// CHECK LOGIN STATUS
// ==========================================

function isUserLoggedIn() {

    return Boolean(
        auth.currentUser
    );

}


// ==========================================
// WAIT FOR AUTH STATE
// ==========================================

function waitForAuth() {

    return new Promise(
        (resolve) => {

            /*
             * If Firebase already has a user,
             * return immediately.
             */
            if (auth.currentUser) {

                resolve(
                    auth.currentUser
                );

                return;

            }


            /*
             * Wait for Firebase's first
             * authentication state response.
             */
            let resolved = false;

            const unsubscribe =
                onAuthStateChanged(
                    auth,
                    (user) => {

                        if (resolved) {
                            return;
                        }

                        resolved = true;

                        unsubscribe();

                        resolve(
                            user
                        );

                    }
                );

        }
    );

}


// ==========================================
// REQUIRE LOGIN
// ==========================================

async function requireLogin(
    redirectPage = "login.html"
) {

    const user =
        await waitForAuth();


    if (!user) {

        const currentPage =
            window.location.pathname +
            window.location.search;


        const encodedPage =
            encodeURIComponent(
                currentPage
            );


        window.location.replace(
            `${redirectPage}?redirect=${encodedPage}`
        );


        return null;

    }


    return user;

}


// ==========================================
// REDIRECT IF ALREADY LOGGED IN
// ==========================================

async function redirectIfLoggedIn(
    redirectPage = "dashboard.html"
) {

    const user =
        await waitForAuth();


    if (user) {

        window.location.replace(
            redirectPage
        );


        return true;

    }


    return false;

}


// ==========================================
// GET USER ID
// ==========================================

function getCurrentUserId() {

    const user =
        getCurrentUser();


    return user
        ? user.uid
        : null;

}


// ==========================================
// GET USER EMAIL
// ==========================================

function getCurrentUserEmail() {

    const user =
        getCurrentUser();


    return (
        user?.email ||
        null
    );

}


// ==========================================
// GET USER PHONE
// ==========================================

function getCurrentUserPhone() {

    const user =
        getCurrentUser();


    return (
        user?.phoneNumber ||
        null
    );

}


// ==========================================
// GET USER DISPLAY NAME
// ==========================================

function getCurrentUserName() {

    const user =
        getCurrentUser();


    if (!user) {

        return "";

    }


    return (

        user.displayName ||

        user.email?.split(
            "@"
        )[0] ||

        "Rio Member"

    );

}


// ==========================================
// GET USER PHOTO
// ==========================================

function getCurrentUserPhoto() {

    const user =
        getCurrentUser();


    return (
        user?.photoURL ||
        ""
    );

}


// ==========================================
// AUTH PROVIDER DETECTION
// ==========================================

function getLoginProvider() {

    const user =
        getCurrentUser();


    if (!user) {

        return null;

    }


    const providerData =
        user.providerData ||
        [];


    if (
        providerData.some(
            provider =>
                provider.providerId ===
                "google.com"
        )
    ) {

        return "google";

    }


    if (
        providerData.some(
            provider =>
                provider.providerId ===
                "password"
        )
    ) {

        return "email";

    }


    if (
        providerData.some(
            provider =>
                provider.providerId ===
                "phone"
        )
    ) {

        return "phone";

    }


    return "unknown";

}


// ==========================================
// AUTH USER SNAPSHOT
// ==========================================

function getAuthUserData() {

    const user =
        getCurrentUser();


    if (!user) {

        return null;

    }


    return {

        uid:
            user.uid,

        email:
            user.email ||
            null,

        phoneNumber:
            user.phoneNumber ||
            null,

        displayName:
            user.displayName ||
            null,

        photoURL:
            user.photoURL ||
            null,

        provider:
            getLoginProvider(),

        emailVerified:
            Boolean(
                user.emailVerified
            )

    };

}


// ==========================================
// UPDATE GLOBAL APP USER STATE
// ==========================================

function updateAppUserState(
    user
) {

    APP_STATE.user =
        user ||
        null;


    APP_STATE.isAuthenticated =
        Boolean(user);


    APP_STATE.isLoading =
        false;


    return APP_STATE;

}


// ==========================================
// AUTH STATE EVENT HELPER
// ==========================================

function onAuthStateChange(
    callback
) {

    if (
        typeof callback !==
        "function"
    ) {

        console.error(
            "RioApp: Auth callback must be a function."
        );


        return () => {};

    }


    return onAuthStateChanged(
        auth,
        (user) => {

            updateAppUserState(
                user
            );


            callback(
                user
            );

        }
    );

}


// ==========================================
// REDIRECT HELPER
// ==========================================

function redirectTo(
    page
) {

    if (!page) {

        return;

    }


    window.location.href =
        page;

}


// ==========================================
// SAFE REDIRECT
// ==========================================

function safeRedirect(
    page,
    fallback = "dashboard.html"
) {

    const target =

        typeof page === "string" &&

        page.trim()

            ? page.trim()

            : fallback;


    window.location.href =
        target;

}


// ==========================================
// LOGIN PAGE REDIRECT
// ==========================================

function redirectToLogin() {

    redirectTo(
        "login.html"
    );

}


// ==========================================
// DASHBOARD REDIRECT
// ==========================================

function redirectToDashboard() {

    redirectTo(
        "dashboard.html"
    );

}


// ==========================================
// LOGOUT REDIRECT
// ==========================================

function redirectAfterLogout() {

    redirectTo(
        "login.html"
    );

}


// ==========================================
// PROTECTED CUSTOMER PAGES
// ==========================================

const PROTECTED_PAGES =
    Object.freeze([

        "dashboard",

        "card",

        "qr",

        "history",

        "reward",

        "profile",

        "edit-profile",

        "feedback"

    ]);


// ==========================================
// CHECK PROTECTED PAGE
// ==========================================

function isProtectedPage() {

    return PROTECTED_PAGES.includes(
        APP_STATE.currentPage
    );

}


// ==========================================
// AUTO PAGE PROTECTION
// ==========================================

async function protectCurrentPage() {

    if (
        !isProtectedPage()
    ) {

        return true;

    }


    const user =
        await waitForAuth();


    if (!user) {

        redirectToLogin();

        return false;

    }


    return true;

}


// ==========================================
// EXPORT PART 2
// ==========================================

export {

    getCurrentUser,

    isUserLoggedIn,

    waitForAuth,

    requireLogin,

    redirectIfLoggedIn,

    getCurrentUserId,

    getCurrentUserEmail,

    getCurrentUserPhone,

    getCurrentUserName,

    getCurrentUserPhoto,

    getLoginProvider,

    getAuthUserData,

    updateAppUserState,

    onAuthStateChange,

    redirectTo,

    safeRedirect,

    redirectToLogin,

    redirectToDashboard,

    redirectAfterLogout,

    isProtectedPage,

    protectCurrentPage

};


// ==========================================
// END OF APP.JS PART 2/3
// ==========================================
// ==========================================
// RIO MAGGI POINT
// APP.JS - PART 3/3
// GLOBAL LOYALTY + UTILITIES
// ==========================================


// ==========================================
// DOM READY HELPER
// ==========================================

function onDOMReady(
    callback
) {

    if (
        typeof callback !==
        "function"
    ) {

        return;

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            callback,
            {
                once: true
            }
        );

    }

    else {

        callback();

    }

}


// ==========================================
// CUSTOM EVENT HELPER
// ==========================================

function emitAppEvent(
    eventName,
    detail = {}
) {

    if (!eventName) {

        return;

    }


    window.dispatchEvent(
        new CustomEvent(
            eventName,
            {
                detail
            }
        )
    );

}


// ==========================================
// LISTEN TO APP EVENT
// ==========================================

function onAppEvent(
    eventName,
    callback
) {

    if (
        !eventName ||
        typeof callback !==
        "function"
    ) {

        return () => {};

    }


    window.addEventListener(
        eventName,
        callback
    );


    return () => {

        window.removeEventListener(
            eventName,
            callback
        );

    };

}


// ==========================================
// SAFE JSON PARSER
// ==========================================

function safeJSONParse(
    value,
    fallback = null
) {

    if (
        typeof value !==
        "string"
    ) {

        return fallback;

    }


    try {

        return JSON.parse(
            value
        );

    }

    catch (error) {

        console.warn(
            "RioApp: Invalid JSON data.",
            error
        );


        return fallback;

    }

}


// ==========================================
// SAFE LOCAL STORAGE GET
// ==========================================

function getStorageItem(
    key,
    fallback = null
) {

    if (!key) {

        return fallback;

    }


    try {

        const value =
            localStorage.getItem(
                key
            );


        if (
            value === null
        ) {

            return fallback;

        }


        return value;

    }

    catch (error) {

        console.warn(
            "RioApp: Unable to read localStorage.",
            error
        );


        return fallback;

    }

}


// ==========================================
// LOCAL STORAGE SET
// ==========================================

function setStorageItem(
    key,
    value
) {

    if (!key) {

        return false;

    }


    try {

        localStorage.setItem(
            key,
            String(value)
        );


        return true;

    }

    catch (error) {

        console.warn(
            "RioApp: Unable to save localStorage.",
            error
        );


        return false;

    }

}


// ==========================================
// LOCAL STORAGE REMOVE
// ==========================================

function removeStorageItem(
    key
) {

    if (!key) {

        return false;

    }


    try {

        localStorage.removeItem(
            key
        );


        return true;

    }

    catch (error) {

        console.warn(
            "RioApp: Unable to remove localStorage item.",
            error
        );


        return false;

    }

}


// ==========================================
// FORMAT PHONE NUMBER
// ==========================================

function formatPhoneNumber(
    phone
) {

    if (!phone) {

        return "";

    }


    return String(phone)
        .replace(
            /\s+/g,
            ""
        )
        .trim();

}


// ==========================================
// FORMAT USER NAME
// ==========================================

function formatUserName(
    name
) {

    if (!name) {

        return "Rio Member";

    }


    return String(name)
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    dateValue,
    options = {}
) {

    if (!dateValue) {

        return "—";

    }


    let date;


    if (
        dateValue?.toDate &&
        typeof dateValue.toDate ===
        "function"
    ) {

        date =
            dateValue.toDate();

    }

    else {

        date =
            new Date(
                dateValue
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    const defaultOptions = {

        day:
            "2-digit",

        month:
            "short",

        year:
            "numeric"

    };


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            ...defaultOptions,
            ...options
        }
    ).format(
        date
    );

}


// ==========================================
// FORMAT STAMP COUNT
// ==========================================

function formatStampCount(
    count = 0
) {

    const required =
        APP_CONFIG
            .loyaltyStampsRequired;


    const safeCount =

        Math.max(

            0,

            Math.min(

                Math.floor(
                    Number(count) || 0
                ),

                required

            )

        );


    return (
        `${safeCount}/${required}`
    );

}


// ==========================================
// CALCULATE STAMP PROGRESS
// ==========================================

function calculateStampProgress(
    count = 0
) {

    const required =
        APP_CONFIG
            .loyaltyStampsRequired;


    const current =

        Math.max(

            0,

            Math.min(

                Math.floor(
                    Number(count) || 0
                ),

                required

            )

        );


    return {

        current,

        required,

        remaining:
            Math.max(
                0,
                required - current
            ),

        percentage:
            Math.round(
                (
                    current /
                    required
                ) * 100
            ),

        completed:
            current >= required

    };

}


// ==========================================
// LOYALTY REWARD STATUS
// ==========================================

function getRewardStatus(
    stampCount = 0
) {

    const progress =
        calculateStampProgress(
            stampCount
        );


    return {

        unlocked:
            progress.completed,

        locked:
            !progress.completed,

        message:

            progress.completed

                ?

                "Your FREE Veg Maggi reward is unlocked!"

                :

                `Collect ${progress.remaining} more stamp${
                    progress.remaining === 1
                        ? ""
                        : "s"
                } to unlock your FREE Veg Maggi.`

    };

}


// ==========================================
// GET DATE OBJECT
// ==========================================

function toDate(
    value
) {

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
        new Date(
            value
        );


    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;

}


// ==========================================
// GET LOYALTY CYCLE START DATE
// ==========================================

function getLoyaltyCycleStartDate(
    customer
) {

    if (!customer) {

        return null;

    }


    return toDate(

        customer.cycleStartDate ||

        customer.loyaltyCycleStart ||

        customer.stampCycleStart ||

        customer.cycleStartedAt ||

        null

    );

}


// ==========================================
// GET CYCLE DAYS ELAPSED
// ==========================================

function getLoyaltyCycleDaysElapsed(
    customer
) {

    const cycleStart =
        getLoyaltyCycleStartDate(
            customer
        );


    if (!cycleStart) {

        return 0;

    }


    const now =
        new Date();


    const elapsedMilliseconds =
        Math.max(

            0,

            now.getTime() -
            cycleStart.getTime()

        );


    return Math.floor(

        elapsedMilliseconds /
        86400000

    );

}


// ==========================================
// CALCULATE CYCLE DAYS REMAINING
// ==========================================

function getLoyaltyCycleDaysRemaining(
    customer
) {

    if (!customer) {

        return APP_CONFIG
            .loyaltyCycleDays;

    }


    /*
     * Prefer backend/server-calculated value.
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

                APP_CONFIG
                    .loyaltyCycleDays

            )

        );

    }


    /*
     * Compatibility field.
     */

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

            Math.min(

                Math.floor(
                    daysRemaining
                ),

                APP_CONFIG
                    .loyaltyCycleDays

            )

        );

    }


    const elapsed =
        getLoyaltyCycleDaysElapsed(
            customer
        );


    return Math.max(

        0,

        APP_CONFIG
            .loyaltyCycleDays -
        elapsed

    );

}


// ==========================================
// CHECK WHETHER CYCLE IS EXPIRED
// ==========================================

function isLoyaltyCycleExpired(
    customer
) {

    if (!customer) {

        return false;

    }


    return (
        getLoyaltyCycleDaysRemaining(
            customer
        ) <= 0
    );

}


// ==========================================
// GET LOYALTY CYCLE STATE
// ==========================================

function getLoyaltyCycleState(
    customer
) {

    const stampCount =

        Math.max(

            0,

            Math.min(

                Math.floor(
                    Number(
                        customer?.stamps ??
                        customer?.stampCount ??
                        customer?.validStamps ??
                        0
                    ) || 0
                ),

                APP_CONFIG
                    .loyaltyStampsRequired

            )

        );


    const rewardUnlocked =
        stampCount >=
        APP_CONFIG
            .loyaltyStampsRequired;


    const rewardClaimed =
        customer?.rewardClaimed === true ||
        customer?.rewardRedeemed === true ||
        customer?.rewardStatus === "claimed" ||
        customer?.rewardStatus === "redeemed";


    const daysRemaining =
        getLoyaltyCycleDaysRemaining(
            customer
        );


    const expired =
        daysRemaining <= 0;


    let status =
        "active";


    if (
        expired &&
        !rewardClaimed &&
        !rewardUnlocked
    ) {

        status =
            "expired";

    }

    else if (
        rewardUnlocked &&
        !rewardClaimed
    ) {

        status =
            "reward-unlocked";

    }

    else if (
        rewardClaimed
    ) {

        status =
            "claimed";

    }


    return {

        stampCount,

        stampLimit:
            APP_CONFIG
                .loyaltyStampsRequired,

        cardSlots:
            APP_CONFIG
                .loyaltyCardSlots,

        daysRemaining,

        cycleDays:
            APP_CONFIG
                .loyaltyCycleDays,

        rewardUnlocked,

        rewardClaimed,

        expired,

        status

    };

}


// ==========================================
// DAILY STAMP VALIDATION
// ==========================================

function canEarnDailyStamp(
    lastStampDate
) {

    if (!lastStampDate) {

        return true;

    }


    const lastDate =
        toDate(
            lastStampDate
        );


    if (!lastDate) {

        return true;

    }


    const now =
        new Date();


    return (

        lastDate.getFullYear() !==
        now.getFullYear()

        ||

        lastDate.getMonth() !==
        now.getMonth()

        ||

        lastDate.getDate() !==
        now.getDate()

    );

}


// ==========================================
// GET TODAY DATE KEY
// ==========================================

function getTodayDateKey() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

function initializeRioApp() {

    document.documentElement
        .setAttribute(
            "data-rio-app",
            "ready"
        );


    document.body?.classList
        .add(
            "rio-app-ready"
        );


    emitAppEvent(
        "rio-app-initialized",
        {

            page:
                APP_STATE.currentPage,

            user:
                APP_STATE.user,

            isAuthenticated:
                APP_STATE.isAuthenticated

        }
    );


    console.log(
        "RIO MAGGI POINT - APPLICATION INITIALIZED"
    );

}


// ==========================================
// AUTO INITIALIZATION
// ==========================================

onDOMReady(
    initializeRioApp
);


// ==========================================
// UPDATE GLOBAL RIO APP OBJECT
// ==========================================

Object.assign(
    RioApp,
    {

        getCurrentUser,

        isUserLoggedIn,

        waitForAuth,

        requireLogin,

        redirectIfLoggedIn,

        getCurrentUserId,

        getCurrentUserEmail,

        getCurrentUserPhone,

        getCurrentUserName,

        getCurrentUserPhoto,

        getLoginProvider,

        getAuthUserData,

        updateAppUserState,

        onAuthStateChange,

        redirectTo,

        safeRedirect,

        redirectToLogin,

        redirectToDashboard,

        redirectAfterLogout,

        isProtectedPage,

        protectCurrentPage,

        onDOMReady,

        emitAppEvent,

        onAppEvent,

        safeJSONParse,

        getStorageItem,

        setStorageItem,

        removeStorageItem,

        formatPhoneNumber,

        formatUserName,

        formatDate,

        formatStampCount,

        calculateStampProgress,

        getRewardStatus,

        toDate,

        getLoyaltyCycleStartDate,

        getLoyaltyCycleDaysElapsed,

        getLoyaltyCycleDaysRemaining,

        isLoyaltyCycleExpired,

        getLoyaltyCycleState,

        canEarnDailyStamp,

        getTodayDateKey,

        initializeRioApp

    }

);


// ==========================================
// FINAL GLOBAL APP READY EVENT
// ==========================================

window.dispatchEvent(
    new CustomEvent(
        "rio-app-core-complete",
        {
            detail:
                RioApp
        }
    )
);


// ==========================================
// FINAL CONSOLE MESSAGE
// ==========================================

console.log(
    "RIO MAGGI POINT - APP.JS FULLY LOADED"
);


// ==========================================
// APP.JS COMPLETE
// ==========================================
