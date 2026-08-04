// ==========================================
// RIO MAGGI POINT
// APP.JS - PART 1/3
// CENTRAL FIREBASE APPLICATION CORE
// ==========================================

// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp, getApps, getApp } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getStorage
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
    firebaseConfig
} from "./firebase-config.js";


// ==========================================
// PREVENT DUPLICATE FIREBASE INITIALIZATION
// ==========================================

const firebaseApp = getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


// ==========================================
// CENTRAL FIREBASE SERVICES
// ==========================================

const auth = getAuth(firebaseApp);

const db = getFirestore(firebaseApp);

const storage = getStorage(firebaseApp);


// ==========================================
// GLOBAL APP CONFIGURATION
// ==========================================

const APP_CONFIG = Object.freeze({

    appName: "Rio Maggi Point",

    appShortName: "Rio Maggi",

    loyaltyStampsRequired: 6,

    rewardItem: "Veg Maggi",

    loyaltyCycleDays: 40,

    dailyStampLimit: 1,

    contactNumber: "7987827979",

    whatsappNumber: "917987827979",

    homeDeliveryStatus: "coming-soon",

    locationStatus: "coming-soon"

});


// ==========================================
// GLOBAL APP STATE
// ==========================================

const APP_STATE = {

    user: null,

    userProfile: null,

    isAuthenticated: false,

    isLoading: true,

    currentPage: null

};


// ==========================================
// PAGE DETECTION
// ==========================================

function getCurrentPage() {

    const path = window.location.pathname;

    const fileName =
        path.split("/").pop().toLowerCase();

    if (!fileName || fileName === "/") {
        return "index";
    }

    return fileName.replace(".html", "");

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

            APP_STATE.user = user;

            APP_STATE.isAuthenticated =
                Boolean(user);

            APP_STATE.isLoading = false;

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

    config: APP_CONFIG,

    state: APP_STATE,

    unsubscribeAuth,

    getCurrentPage

};


// ==========================================
// MAKE AVAILABLE TO OTHER MODULES
// ==========================================

window.RioApp = RioApp;


// ==========================================
// APPLICATION READY EVENT
// ==========================================

window.dispatchEvent(
    new CustomEvent(
        "rio-app-ready",
        {
            detail: RioApp
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
            APP_STATE.isAuthenticated
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
// END OF PART 1/3
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

    return auth.currentUser || null;

}


// ==========================================
// CHECK LOGIN STATUS
// ==========================================

function isUserLoggedIn() {

    return Boolean(auth.currentUser);

}


// ==========================================
// WAIT FOR AUTH STATE
// ==========================================

function waitForAuth() {

    return new Promise((resolve) => {

        if (auth.currentUser) {

            resolve(auth.currentUser);

            return;

        }


        const unsubscribe =
            onAuthStateChanged(
                auth,
                (user) => {

                    unsubscribe();

                    resolve(user);

                }
            );

    });

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
            window.location.pathname;

        const encodedPage =
            encodeURIComponent(
                currentPage
            );


        window.location.href =
            `${redirectPage}?redirect=${encodedPage}`;


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


    return user?.email || null;

}


// ==========================================
// GET USER PHONE
// ==========================================

function getCurrentUserPhone() {

    const user =
        getCurrentUser();


    return user?.phoneNumber || null;

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
        user.email?.split("@")[0] ||
        "Rio Member"
    );

}


// ==========================================
// GET USER PHOTO
// ==========================================

function getCurrentUserPhoto() {

    const user =
        getCurrentUser();


    return user?.photoURL || "";

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
        user.providerData || [];


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
            user.email || null,

        phoneNumber:
            user.phoneNumber || null,

        displayName:
            user.displayName || null,

        photoURL:
            user.photoURL || null,

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
        user || null;


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
// PAGE ACCESS CONTROL
// ==========================================

const PROTECTED_PAGES = Object.freeze([

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

    return PROTECTED_PAGES
        .includes(
            APP_STATE.currentPage
        );

}


// ==========================================
// AUTO PROTECTION
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
// EXPORT PART 2 FUNCTIONS
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
// GLOBAL UTILITIES + APP INITIALIZATION
// ==========================================


// ==========================================
// DOM READY HELPER
// ==========================================

function onDOMReady(callback) {

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

    } else {

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

    } catch (error) {

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

    } catch (error) {

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

    } catch (error) {

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

    } catch (error) {

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

    } else {

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

    const safeCount =
        Math.max(
            0,
            Math.min(
                Number(count) || 0,
                APP_CONFIG.loyaltyStampsRequired
            )
        );


    return `${safeCount}/${APP_CONFIG.loyaltyStampsRequired}`;

}


// ==========================================
// CALCULATE STAMP PROGRESS
// ==========================================

function calculateStampProgress(
    count = 0
) {

    const required =
        APP_CONFIG.loyaltyStampsRequired;


    const current =
        Math.max(
            0,
            Math.min(
                Number(count) || 0,
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

                ? "Your FREE Veg Maggi reward is unlocked!"

                : `Collect ${progress.remaining} more stamp${progress.remaining === 1 ? "" : "s"} to unlock your FREE Veg Maggi.`

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
        new Date(
            lastStampDate
        );


    if (
        Number.isNaN(
            lastDate.getTime()
        )
    ) {

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


    return `${year}-${month}-${day}`;

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
            detail: RioApp
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
// END OF APP.JS PART 3/3
// ==========================================
// APP.JS COMPLETE
// ==========================================
