/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 1 / 3
   AUTH + CUSTOMER PROFILE + QR DATA FLOW
   CLEAN SINGLE AUTH FLOW
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
   DOM ELEMENTS
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
   QR CONFIGURATION
========================================== */

const QR_PREFIX =
    "RIO_MAGGI_CUSTOMER:";


/* ==========================================
   DEFAULT AVATAR
========================================== */

const DEFAULT_AVATAR =
    "assets/avatars/male.png";


/* ==========================================
   FALLBACK CUSTOMER NAME
========================================== */

const DEFAULT_CUSTOMER_NAME =
    "Rio Customer";


/* ==========================================
   FALLBACK MEMBER ID
========================================== */

const DEFAULT_MEMBER_ID =
    "RIO-000000";


/* ==========================================
   INITIAL UI STATE
========================================== */

function setInitialLoadingState() {

    if (customerName) {

        customerName.textContent =
            "Loading...";

    }


    if (memberId) {

        memberId.textContent =
            DEFAULT_MEMBER_ID;

    }


    if (qrStatus) {

        qrStatus.textContent =
            "Preparing Your Premium QR...";

    }

}


/* ==========================================
   INITIALIZE PAGE
========================================== */

setInitialLoadingState();


/* ==========================================
   SINGLE AUTH STATE LISTENER
   IMPORTANT:
   Only ONE onAuthStateChanged listener
========================================== */

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
           USER LOGGED IN
        ================================== */

        console.log(
            "Rio Maggi Point: Authenticated User",
            user.uid
        );


        try {

            /*
             * Load customer profile first.
             * QR generation will be handled
             * after this flow is completed.
             */

            const customerData =
                await loadCustomerData(
                    user
                );


            /*
             * Customer profile loaded.
             * Pass final UID to QR system.
             */

            window.dispatchEvent(

                new CustomEvent(
                    "rioCustomerReady",
                    {
                        detail: {
                            uid: user.uid,
                            customerData:
                                customerData
                        }
                    }
                )

            );

        }


        catch (error) {

            console.error(
                "Rio Customer Initialization Error:",
                error
            );


            /*
             * Even if Firestore profile
             * loading fails, QR can still
             * be generated using Firebase UID.
             */

            if (customerName) {

                customerName.textContent =
                    user.displayName ||
                    DEFAULT_CUSTOMER_NAME;

            }


            if (memberId) {

                memberId.textContent =
                    createMemberId(
                        user.uid
                    );

            }


            loadDefaultAvatar();


            if (qrStatus) {

                qrStatus.textContent =
                    "Preparing Your Premium QR...";

            }


            /*
             * Allow QR system to continue
             * using authenticated UID.
             */

            window.dispatchEvent(

                new CustomEvent(
                    "rioCustomerReady",
                    {
                        detail: {
                            uid: user.uid,
                            customerData: null
                        }
                    }
                )

            );

        }

    }

);


/* ==========================================
   LOAD CUSTOMER DATA
========================================== */

async function loadCustomerData(
    user
) {

    if (!user || !user.uid) {

        throw new Error(
            "Authenticated customer UID is missing."
        );

    }


    /* ==================================
       FIRESTORE CUSTOMER REFERENCE
    ================================== */

    const customerRef =
        doc(
            db,
            "customers",
            user.uid
        );


    /* ==================================
       FETCH CUSTOMER DOCUMENT
    ================================== */

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


        const fallbackName =
            user.displayName ||
            DEFAULT_CUSTOMER_NAME;


        const fallbackMemberId =
            createMemberId(
                user.uid
            );


        if (customerName) {

            customerName.textContent =
                fallbackName;

        }


        if (memberId) {

            memberId.textContent =
                fallbackMemberId;

        }


        loadDefaultAvatar();


        return {

            uid:
                user.uid,

            name:
                fallbackName,

            memberId:
                fallbackMemberId,

            photoURL:
                "",

            exists:
                false

        };

    }


    /* ==================================
       GET FIRESTORE DATA
    ================================== */

    const customerData =
        customerSnap.data() || {};


    /* ==================================
       CUSTOMER NAME
    ================================== */

    const name =
        customerData.name ||
        user.displayName ||
        DEFAULT_CUSTOMER_NAME;


    if (customerName) {

        customerName.textContent =
            name;

    }


    /* ==================================
       MEMBER ID
    ================================== */

    const finalMemberId =
        customerData.memberId ||
        createMemberId(
            user.uid
        );


    if (memberId) {

        memberId.textContent =
            finalMemberId;

    }


    /* ==================================
       CUSTOMER PHOTO
    ================================== */

    loadCustomerPhoto(
        customerData
    );


    /* ==================================
       PROFILE READY STATUS
    ================================== */

    if (qrStatus) {

        qrStatus.textContent =
            "Preparing Your Premium QR...";

    }


    console.log(
        "Rio Maggi Customer Loaded:",
        {
            uid:
                user.uid,

            name:
                name,

            memberId:
                finalMemberId

        }
    );


    /* ==================================
       RETURN NORMALIZED CUSTOMER DATA
    ================================== */

    return {

        uid:
            user.uid,

        name:
            name,

        memberId:
            finalMemberId,

        photoURL:
            customerData.photoURL ||
            customerData.photoUrl ||
            customerData.profilePhoto ||
            customerData.avatarURL ||
            "",

        gender:
            customerData.gender ||
            "",

        exists:
            true

    };

}


/* ==========================================
   LOAD CUSTOMER PHOTO
========================================== */

function loadCustomerPhoto(
    customerData
) {

    if (!customerPhoto) {

        return;

    }


    const photoURL =
        customerData.photoURL ||
        customerData.photoUrl ||
        customerData.profilePhoto ||
        customerData.avatarURL ||
        "";


    /* ==================================
       NO PHOTO
    ================================== */

    if (!photoURL) {

        loadDefaultAvatar();

        return;

    }


    /* ==================================
       SET PHOTO
    ================================== */

    customerPhoto.src =
        photoURL;


    /* ==================================
       PHOTO ERROR FALLBACK
    ================================== */

    customerPhoto.onerror =
        () => {

            loadDefaultAvatar();

        };

}


/* ==========================================
   LOAD DEFAULT AVATAR
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
   CREATE MEMBER ID
========================================== */

function createMemberId(
    uid
) {

    if (!uid) {

        return DEFAULT_MEMBER_ID;

    }


    const cleanUID =
        String(uid)
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            );


    if (!cleanUID) {

        return DEFAULT_MEMBER_ID;

    }


    const shortUID =
        cleanUID
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
   CUSTOMER READY EVENT
   PART 2 WILL LISTEN TO THIS EVENT
   AND GENERATE QR ONCE ONLY
========================================== */

console.log(
    "QR.JS PART 1 LOADED"
);
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 2 / 3
   PREMIUM QR GENERATION
   SINGLE CLEAN QR FLOW
========================================== */


/* ==========================================
   QR GENERATION STATE
========================================== */

let qrGenerated = false;


/* ==========================================
   QR LIBRARY CHECK
========================================== */

function isQRCodeLibraryReady() {

    return (
        typeof window.QRCode !== "undefined" &&
        typeof window.QRCode === "function"
    );

}


/* ==========================================
   WAIT FOR QR LIBRARY
   Prevents QR generation failure when
   qr.js loads before QRCode library
========================================== */

function waitForQRCodeLibrary(
    maxAttempts = 50,
    interval = 100
) {

    return new Promise(

        (resolve, reject) => {

            let attempts = 0;


            const checkLibrary = () => {

                if (
                    isQRCodeLibraryReady()
                ) {

                    resolve(
                        window.QRCode
                    );

                    return;

                }


                attempts++;


                if (
                    attempts >=
                    maxAttempts
                ) {

                    reject(

                        new Error(
                            "QRCode library was not loaded."
                        )

                    );

                    return;

                }


                setTimeout(
                    checkLibrary,
                    interval
                );

            };


            checkLibrary();

        }

    );

}


/* ==========================================
   CLEAR OLD QR
========================================== */

function clearQRCode() {

    if (!qrCode) {

        return;

    }


    qrGenerated =
        false;


    qrCode.innerHTML =
        "";


    qrCode.classList.remove(
        "qr-generated"
    );


    qrCode.classList.remove(
        "qr-error"
    );

}


/* ==========================================
   SET QR STATUS
========================================== */

function setQRStatus(
    message,
    type = "default"
) {

    if (!qrStatus) {

        return;

    }


    qrStatus.textContent =
        message;


    qrStatus.classList.remove(
        "ready",
        "error",
        "loading"
    );


    if (type) {

        qrStatus.classList.add(
            type
        );

    }

}


/* ==========================================
   GENERATE CUSTOMER QR
========================================== */

async function generateCustomerQR(
    uid
) {

    /* ==================================
       VALIDATE UID
    ================================== */

    if (!uid) {

        console.error(
            "QR Generation Failed: UID missing."
        );


        clearQRCode();


        setQRStatus(
            "Unable to generate QR",
            "error"
        );


        return false;

    }


    /* ==================================
       VALIDATE QR CONTAINER
    ================================== */

    if (!qrCode) {

        console.error(
            "QR Generation Failed: #qrcode element not found."
        );


        return false;

    }


    /* ==================================
       PREVENT DUPLICATE GENERATION
    ================================== */

    if (qrGenerated) {

        console.log(
            "QR already generated."
        );


        return true;

    }


    /* ==================================
       SHOW LOADING
    ================================== */

    setQRStatus(
        "Preparing Your Premium QR...",
        "loading"
    );


    clearQRCode();


    /* ==================================
       CREATE QR PAYLOAD
    ================================== */

    const qrData =
        QR_PREFIX +
        String(uid);


    console.log(
        "Generating Customer QR:",
        qrData
    );


    try {

        /* ==================================
           WAIT FOR QR LIBRARY
        ================================== */

        const QRCodeLibrary =
            await waitForQRCodeLibrary();


        /* ==================================
           GENERATE QR
        ================================== */

        new QRCodeLibrary(

            qrCode,

            {

                text:
                    qrData,

                width:
                    260,

                height:
                    260,

                colorDark:
                    "#263525",

                colorLight:
                    "#ffffff",

                correctLevel:
                    QRCodeLibrary.CorrectLevel
                        ? QRCodeLibrary.CorrectLevel.H
                        : undefined

            }

        );


        /* ==================================
           MARK QR AS GENERATED
        ================================== */

        qrGenerated =
            true;


        /* ==================================
           QR READY STATUS
        ================================== */

        setQRStatus(
            "✓ Premium QR Ready — Show at Counter",
            "ready"
        );


        /* ==================================
           QR ANIMATION
        ================================== */

        requestAnimationFrame(

            () => {

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

        );


        console.log(
            "Customer QR Generated Successfully"
        );


        return true;

    }


    catch (error) {

        console.error(
            "QR Generation Error:",
            error
        );


        qrGenerated =
            false;


        clearQRCode();


        if (qrCode) {

            qrCode.classList.add(
                "qr-error"
            );

        }


        setQRStatus(
            "Unable to generate Premium QR",
            "error"
        );


        return false;

    }

}


/* ==========================================
   CUSTOMER READY EVENT
   PART 1 DISPATCHES THIS EVENT
   QR GENERATES ONLY AFTER AUTH + PROFILE FLOW
========================================== */

window.addEventListener(

    "rioCustomerReady",

    async (event) => {

        const detail =
            event.detail || {};


        const uid =
            detail.uid;


        if (!uid) {

            console.error(
                "Customer Ready Event: UID missing."
            );


            return;

        }


        console.log(
            "Customer Ready — Starting QR Generation"
        );


        await generateCustomerQR(
            uid
        );

    }

);


/* ==========================================
   QR CLICK ANIMATION
========================================== */

if (qrCode) {

    qrCode.addEventListener(

        "click",

        () => {

            if (!qrGenerated) {

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

    );

}


/* ==========================================
   QR TOUCH ANIMATION
========================================== */

if (qrCode) {

    qrCode.addEventListener(

        "touchstart",

        () => {

            if (!qrGenerated) {

                return;

            }


            qrCode.classList.add(
                "qr-touch"
            );

        },

        {
            passive: true
        }

    );


    qrCode.addEventListener(

        "touchend",

        () => {

            setTimeout(

                () => {

                    qrCode.classList.remove(
                        "qr-touch"
                    );

                },

                350

            );

        },

        {
            passive: true
        }

    );

}


/* ==========================================
   QR CARD HOVER
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

}


/* ==========================================
   QR CARD TOUCH
========================================== */

if (qrCard) {

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
   CUSTOMER PHOTO ANIMATION
========================================== */

if (customerPhoto) {

    customerPhoto.addEventListener(

        "load",

        () => {

            customerPhoto.classList.add(
                "photo-loaded"
            );

        }

    );

}


/* ==========================================
   QR.JS PART 2 READY
========================================== */

console.log(
    "QR.JS PART 2 LOADED"
);

console.log(
    "QR GENERATION SYSTEM READY"
);
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 3 / 3
   DAILY STAMP RULE + PREMIUM INTERACTIONS
   SERVICE WORKER
========================================== */


/* ==========================================
   DAILY STAMP RULE
========================================== */

const DAILY_STAMP_LIMIT = 1;


const DAILY_STAMP_MESSAGE =
    "ONE STAMP PER DAY — Multiple purchases on the same day will still count as only ONE loyalty stamp.";


const NEXT_DAY_MESSAGE =
    "Your next loyalty stamp will be available on your next purchase day.";


/* ==========================================
   DAILY STAMP RULE INTERACTION
========================================== */

const dailyStampRule =
    document.querySelector(
        ".daily-stamp-rule"
    );


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
   PREMIUM QR SECTION OBSERVER
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

            (entries) => {

                entries.forEach(

                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "section-visible"
                            );


                            qrObserver.unobserve(
                                entry.target
                            );

                        }

                    }

                );

            },

            {

                threshold:
                    0.15

            }

        );


    qrObserver.observe(
        premiumQRSection
    );

}


/* ==========================================
   SERVICE WORKER
   REGISTER ONLY ON PRODUCTION / HTTPS
========================================== */

function registerRioServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        return;

    }


    /* ==================================
       SERVICE WORKER REQUIRES HTTPS
       OR LOCALHOST
    ================================== */

    const isLocalhost =
        location.hostname ===
            "localhost" ||
        location.hostname ===
            "127.0.0.1";


    const isHTTPS =
        location.protocol ===
        "https:";


    if (
        !isHTTPS &&
        !isLocalhost
    ) {

        console.warn(
            "Service Worker skipped: HTTPS or localhost required."
        );


        return;

    }


    window.addEventListener(

        "load",

        async () => {

            try {

                const registration =

                    await navigator.serviceWorker.register(

                        "./service-worker.js",

                        {

                            scope:
                                "./"

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

        }

    );

}


registerRioServiceWorker();


/* ==========================================
   SERVICE WORKER UPDATE HANDLING
========================================== */

if (
    "serviceWorker" in navigator
) {

    navigator.serviceWorker.addEventListener(

        "controllerchange",

        () => {

            console.log(
                "Rio Maggi Point Service Worker Updated."
            );

        }

    );

}


/* ==========================================
   FINAL STARTUP LOG
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
    "QR GENERATION READY"
);


console.log(
    "DAILY STAMP RULE READY"
);


console.log(
    "QR ANIMATION READY"
);


console.log(
    "SERVICE WORKER READY"
);


console.log(
    "==================================="
);


/* ==========================================
   END QR.JS — PART 3 / 3
========================================== */
