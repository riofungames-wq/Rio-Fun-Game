/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 1/3
   FIREBASE AUTH + CUSTOMER PROFILE
   FIXED SINGLE AUTH LISTENER
========================================== */

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ==========================================
   HTML ELEMENTS
========================================== */

const customerPhoto =
    document.getElementById("customerPhoto");

const customerName =
    document.getElementById("customerName");

const memberId =
    document.getElementById("memberId");

const qrCode =
    document.getElementById("qrcode");

const qrStatus =
    document.getElementById("qrStatus");


/* ==========================================
   QR CONFIG
========================================== */

const QR_PREFIX =
    "RIO_MAGGI_CUSTOMER:";


/* ==========================================
   DEFAULT AVATAR
========================================== */

const DEFAULT_AVATAR =
    "./assets/avatars/male.png";


/* ==========================================
   INITIAL LOADING STATE
========================================== */

function setInitialLoadingState() {

    if (customerName) {

        customerName.textContent =
            "Loading...";

    }

    if (memberId) {

        memberId.textContent =
            "RIO-000000";

    }

    if (qrStatus) {

        qrStatus.textContent =
            "Preparing Your Premium QR...";

    }

}


/* ==========================================
   DEFAULT AVATAR
========================================== */

function loadDefaultAvatar() {

    if (!customerPhoto) {

        return;

    }

    customerPhoto.onerror =
        null;

    customerPhoto.src =
        DEFAULT_AVATAR;

}


/* ==========================================
   LOAD CUSTOMER PHOTO
========================================== */

function loadCustomerPhoto(
    customerData,
    user
) {

    if (!customerPhoto) {

        return;

    }


    const photoURL =

        customerData?.photoURL ||

        customerData?.photoUrl ||

        customerData?.profilePhoto ||

        customerData?.avatarURL ||

        customerData?.avatar ||

        user?.photoURL ||

        "";


    if (!photoURL) {

        loadDefaultAvatar();

        return;

    }


    customerPhoto.onerror =

        () => {

            loadDefaultAvatar();

        };


    customerPhoto.src =
        photoURL;

}


/* ==========================================
   CREATE MEMBER ID
========================================== */

function createMemberId(
    uid
) {

    if (!uid) {

        return "RIO-000000";

    }


    const shortUID =

        uid
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .substring(
                0,
                6
            )
            .toUpperCase();


    return (
        "RIO-" +
        shortUID
    );

}


/* ==========================================
   LOAD CUSTOMER DATA
========================================== */

async function loadCustomerData(
    user
) {

    if (!user) {

        return;

    }


    try {

        setInitialLoadingState();


        /* ==================================
           FIRESTORE CUSTOMER DOCUMENT
        ================================== */

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


        /* ==================================
           CUSTOMER DOCUMENT NOT FOUND
        ================================== */

        if (
            !customerSnap.exists()
        ) {

            console.warn(
                "Customer document not found:",
                user.uid
            );


            if (customerName) {

                customerName.textContent =

                    user.displayName ||

                    "Rio Customer";

            }


            if (memberId) {

                memberId.textContent =

                    createMemberId(
                        user.uid
                    );

            }


            loadCustomerPhoto(
                {},
                user
            );


            if (qrStatus) {

                qrStatus.textContent =
                    "Your Premium QR is Ready";

            }


            /*
             * QR GENERATION IS CALLED HERE
             * AFTER AUTH + PROFILE LOAD.
             */

            generateCustomerQR(
                user.uid
            );


            return;

        }


        /* ==================================
           CUSTOMER DATA
        ================================== */

        const customerData =

            customerSnap.data() || {};


        /* ==================================
           CUSTOMER NAME
        ================================== */

        if (customerName) {

            customerName.textContent =

                customerData.name ||

                user.displayName ||

                "Rio Customer";

        }


        /* ==================================
           MEMBER ID
        ================================== */

        if (memberId) {

            memberId.textContent =

                customerData.memberId ||

                createMemberId(
                    user.uid
                );

        }


        /* ==================================
           CUSTOMER PHOTO
        ================================== */

        loadCustomerPhoto(
            customerData,
            user
        );


        /* ==================================
           QR GENERATION
        ================================== */

        generateCustomerQR(
            user.uid
        );


        if (qrStatus) {

            qrStatus.textContent =
                "Your Premium QR is Ready";

        }


        console.log(
            "Rio Maggi Customer Loaded:",
            customerData
        );

    }

    catch (error) {

        console.error(
            "Customer Data Loading Error:",
            error
        );


        /* ==================================
           FALLBACK PROFILE
        ================================== */

        if (customerName) {

            customerName.textContent =

                user.displayName ||

                "Rio Customer";

        }


        if (memberId) {

            memberId.textContent =

                createMemberId(
                    user.uid
                );

        }


        loadCustomerPhoto(
            {},
            user
        );


        /* ==================================
           QR MUST STILL GENERATE
           EVEN IF FIRESTORE FAILS
        ================================== */

        generateCustomerQR(
            user.uid
        );

    }

}


/* ==========================================
   SINGLE AUTH STATE LISTENER
   IMPORTANT:
   DO NOT ADD ANOTHER onAuthStateChanged
   FOR QR GENERATION IN PART 2.
========================================== */

setInitialLoadingState();


onAuthStateChanged(

    auth,

    async (user) => {

        /* ==================================
           USER NOT LOGGED IN
        ================================== */

        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;

        }


        /* ==================================
           LOAD PROFILE
           QR IS GENERATED FROM SAME
           AUTH FLOW.
        ================================== */

        await loadCustomerData(
            user
        );

    }

);


/* ==========================================
   EXPORT FOR OTHER QR PARTS
========================================== */

window.RioQR = {

    createMemberId,

    loadCustomerPhoto,

    loadDefaultAvatar,

    loadCustomerData

};


/* ==========================================
   END QR.JS — PART 1/3
========================================== */
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 2/3
   PREMIUM QR GENERATION
   FIXED QR LIBRARY + DUPLICATE AUTH BUG
========================================== */


/* ==========================================
   QR GENERATION CONFIG
========================================== */

const QR_SIZE = 260;

const QR_DARK_COLOR = "#263525";

const QR_LIGHT_COLOR = "#ffffff";


/* ==========================================
   GENERATE CUSTOMER QR
========================================== */

function generateCustomerQR(uid) {

    /* ==================================
       VALIDATE QR ELEMENT
    ================================== */

    if (!qrCode) {

        console.error(
            "QR Generation Failed: #qrcode element not found."
        );

        return;

    }


    /* ==================================
       VALIDATE UID
    ================================== */

    if (!uid) {

        console.error(
            "QR Generation Failed: UID missing."
        );


        if (qrStatus) {

            qrStatus.textContent =
                "Unable to generate QR";

        }


        return;

    }


    /* ==================================
       CHECK QR LIBRARY
       IMPORTANT FIX
    ================================== */

    if (
        typeof window.QRCode !==
        "function"
    ) {

        console.error(
            "QRCode library not loaded. Check qr.html script."
        );


        if (qrStatus) {

            qrStatus.textContent =
                "QR System Loading...";

        }


        /*
         * Retry once after library loads.
         */

        setTimeout(

            () => {

                if (
                    typeof window.QRCode ===
                    "function"
                ) {

                    generateCustomerQR(
                        uid
                    );

                }

                else if (qrStatus) {

                    qrStatus.textContent =
                        "QR Code could not be loaded";

                }

            },

            800

        );


        return;

    }


    /* ==================================
       QR DATA
    ================================== */

    const qrData =

        QR_PREFIX +
        uid;


    /* ==================================
       CLEAR PREVIOUS QR
    ================================== */

    qrCode.innerHTML =
        "";


    qrCode.classList.remove(
        "qr-generated"
    );


    /* ==================================
       GENERATE QR
    ================================== */

    try {

        new window.QRCode(

            qrCode,

            {

                text:
                    qrData,

                width:
                    QR_SIZE,

                height:
                    QR_SIZE,

                colorDark:
                    QR_DARK_COLOR,

                colorLight:
                    QR_LIGHT_COLOR,

                correctLevel:
                    window.QRCode.CorrectLevel
                        ? window.QRCode.CorrectLevel.H
                        : 2

            }

        );


        /* ==================================
           QR READY
        ================================== */

        if (qrStatus) {

            qrStatus.textContent =
                "✓ Premium QR Ready — Show at Counter";

            qrStatus.classList.add(
                "ready"
            );

        }


        /* ==================================
           ANIMATION
        ================================== */

        requestAnimationFrame(

            () => {

                qrCode.classList.add(
                    "qr-generated"
                );

            }

        );


        console.log(
            "Customer QR Generated Successfully:",
            qrData
        );

    }

    catch (error) {

        console.error(
            "QR Generation Error:",
            error
        );


        if (qrStatus) {

            qrStatus.textContent =
                "Unable to generate Premium QR";

        }

    }

}


/* ==========================================
   WAIT FOR QR LIBRARY
   FIXES SCRIPT LOAD ORDER ISSUE
========================================== */

function waitForQRCodeLibrary(
    uid,
    attempts = 0
) {

    const MAX_ATTEMPTS = 20;


    if (
        typeof window.QRCode ===
        "function"
    ) {

        generateCustomerQR(
            uid
        );

        return;

    }


    if (
        attempts >=
        MAX_ATTEMPTS
    ) {

        console.error(
            "QRCode library failed to load."
        );


        if (qrStatus) {

            qrStatus.textContent =
                "QR Code could not be loaded";

        }


        return;

    }


    setTimeout(

        () => {

            waitForQRCodeLibrary(
                uid,
                attempts + 1
            );

        },

        250

    );

}


/* ==========================================
   QR STATUS ANIMATION
========================================== */

function animateQRStatus() {

    if (!qrStatus) {

        return;

    }


    qrStatus.classList.add(
        "status-pulse"
    );

}


animateQRStatus();


/* ==========================================
   QR CLICK ANIMATION
========================================== */

if (qrCode) {

    qrCode.addEventListener(

        "click",

        () => {

            qrCode.classList.remove(
                "qr-generated"
            );


            /*
             * Force browser reflow
             * to restart animation.
             */

            void qrCode.offsetWidth;


            qrCode.classList.add(
                "qr-generated"
            );

        }

    );

}


/* ==========================================
   QR TOUCH ANIMATION
========================================== */

const qrCard =

    document.querySelector(
        ".premium-qr-card"
    );


if (qrCard) {

    qrCard.addEventListener(

        "mouseenter",

        () => {

            qrCard.classList.add(
                "qr-hover"
            );

        }

    );


    qrCard.addEventListener(

        "mouseleave",

        () => {

            qrCard.classList.remove(
                "qr-hover"
            );

        }

    );


    qrCard.addEventListener(

        "touchstart",

        () => {

            qrCard.classList.add(
                "qr-touch"
            );

        },

        {
            passive: true
        }

    );


    qrCard.addEventListener(

        "touchend",

        () => {

            setTimeout(

                () => {

                    qrCard.classList.remove(
                        "qr-touch"
                    );

                },

                500

            );

        },

        {
            passive: true
        }

    );

}


/* ==========================================
   QR READY ANIMATION
========================================== */

function showQRReadyAnimation() {

    if (!qrCode) {

        return;

    }


    qrCode.classList.remove(
        "qr-generated"
    );


    void qrCode.offsetWidth;


    qrCode.classList.add(
        "qr-generated"
    );

}


/* ==========================================
   START QR ANIMATION
========================================== */

setTimeout(

    () => {

        showQRReadyAnimation();

    },

    300

);


/* ==========================================
   EXPORT QR FUNCTION
========================================== */

window.RioQR =

    window.RioQR || {};


window.RioQR.generateCustomerQR =

    generateCustomerQR;


window.RioQR.waitForQRCodeLibrary =

    waitForQRCodeLibrary;


/* ==========================================
   IMPORTANT
   NO SECOND onAuthStateChanged HERE.

   PART 1 AUTH FLOW ALREADY CALLS:

   generateCustomerQR(user.uid)

   This removes the duplicate auth listener
   that existed in your old QR.JS.
========================================== */


/* ==========================================
   END QR.JS — PART 2/3
========================================== */
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 3/3
   DAILY STAMP RULE + PREMIUM INTERACTIONS
   FIXED / CLEAN FINAL VERSION
========================================== */


/* ==========================================
   DAILY STAMP CONFIG
========================================== */

const DAILY_STAMP_LIMIT = 1;


/* ==========================================
   DAILY STAMP MESSAGE
========================================== */

const DAILY_STAMP_MESSAGE =
    "ONE STAMP PER DAY — Multiple purchases on the same day will still count as only ONE loyalty stamp.";


/* ==========================================
   NEXT PURCHASE DAY MESSAGE
========================================== */

const NEXT_DAY_MESSAGE =
    "Your next loyalty stamp will be available on your next purchase day.";


/* ==========================================
   DAILY STAMP RULE ELEMENT
========================================== */

const dailyStampRule =
    document.querySelector(
        ".daily-stamp-rule"
    );


/* ==========================================
   DAILY STAMP RULE INTERACTION
========================================== */

if (dailyStampRule) {

    dailyStampRule.setAttribute(
        "title",
        DAILY_STAMP_MESSAGE
    );


    dailyStampRule.addEventListener(

        "click",

        () => {

            dailyStampRule.classList.remove(
                "rule-highlight"
            );


            /*
             * Restart animation
             */

            void dailyStampRule.offsetWidth;


            dailyStampRule.classList.add(
                "rule-highlight"
            );

        }

    );

}


/* ==========================================
   SCAN TITLE ANIMATION
========================================== */

const scanTitle =
    document.querySelector(
        ".scan-title"
    );


if (scanTitle) {

    requestAnimationFrame(

        () => {

            scanTitle.classList.add(
                "scan-title-ready"
            );

        }

    );

}


/* ==========================================
   CUSTOMER PHOTO ANIMATION
========================================== */

if (customerPhoto) {

    customerPhoto.addEventListener(

        "load",

        () => {

            customerPhoto.classList.add(
                "photo-loaded"
            );

        },

        {
            once: false
        }

    );

}


/* ==========================================
   QR SECTION OBSERVER
========================================== */

const premiumQRSection =
    document.querySelector(
        ".premium-qr-section"
    );


if (
    premiumQRSection &&
    "IntersectionObserver" in window
) {

    const qrObserver =

        new IntersectionObserver(

            (
                entries,
                observer
            ) => {

                entries.forEach(

                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "section-visible"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }

                );

            },

            {
                threshold: 0.2
            }

        );


    qrObserver.observe(
        premiumQRSection
    );

}


/* ==========================================
   BOTTOM NAV ACTIVE STATE
   AUTO-DETECT CURRENT PAGE
========================================== */

function setActiveBottomNav() {

    const navLinks =
        document.querySelectorAll(
            ".bottom-nav a"
        );


    if (
        !navLinks.length
    ) {

        return;

    }


    const currentPage =

        window.location.pathname

            .split("/")

            .pop()

            .toLowerCase();


    navLinks.forEach(

        (link) => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {

                return;

            }


            const linkPage =

                href

                    .split("#")[0]

                    .split("?")[0]

                    .split("/")

                    .pop()

                    .toLowerCase();


            link.classList.toggle(

                "active",

                linkPage ===
                currentPage

            );

        }

    );

}


setActiveBottomNav();


/* ==========================================
   BOTTOM NAV CLICK FEEDBACK
========================================== */

document
    .querySelectorAll(
        ".bottom-nav a"
    )
    .forEach(

        (link) => {

            link.addEventListener(

                "click",

                () => {

                    document
                        .querySelectorAll(
                            ".bottom-nav a"
                        )
                        .forEach(

                            (item) => {

                                item.classList.remove(
                                    "active"
                                );

                            }

                        );


                    link.classList.add(
                        "active"
                    );

                }

            );

        }

    );


/* ==========================================
   SERVICE WORKER REGISTRATION
   SINGLE REGISTRATION ONLY
========================================== */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(

        "load",

        async () => {

            try {

                const registration =

                    await navigator.serviceWorker.register(

                        "./service-worker.js",

                        {
                            scope: "./"
                        }

                    );


                console.log(

                    "Rio Maggi Point Service Worker Registered:",

                    registration.scope

                );

            }

            catch (error) {

                console.error(

                    "Service Worker Registration Failed:",

                    error

                );

            }

        },

        {
            once: true
        }

    );

}


/* ==========================================
   FINAL SYSTEM STATUS
========================================== */

console.log(
    "==================================="
);

console.log(
    "RIO MAGGI POINT"
);

console.log(
    "PREMIUM QR SYSTEM READY"
);

console.log(
    "CUSTOMER AUTH READY"
);

console.log(
    "CUSTOMER PROFILE READY"
);

console.log(
    "QR GENERATION READY"
);

console.log(
    "DAILY STAMP RULE READY"
);

console.log(
    "BOTTOM NAV READY"
);

console.log(
    "SERVICE WORKER READY"
);

console.log(
    "==================================="
);


/* ==========================================
   QR.JS — PART 3/3 COMPLETE
========================================== */
