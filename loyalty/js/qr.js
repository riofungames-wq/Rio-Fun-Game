/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 1/3
   FIREBASE AUTH + CUSTOMER PROFILE
   CLEANED + DUPLICATE-FREE
========================================== */


/* ==========================================
   FIREBASE IMPORTS
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
    document.getElementById(
        "customerPhoto"
    );


const customerName =
    document.getElementById(
        "customerName"
    );


const memberId =
    document.getElementById(
        "memberId"
    );


const qrCode =
    document.getElementById(
        "qrcode"
    );


const qrStatus =
    document.getElementById(
        "qrStatus"
    );


/* ==========================================
   CONSTANTS
========================================== */

const DEFAULT_AVATAR =
    "assets/avatars/male.png";


/* ==========================================
   AUTH STATE
   SINGLE LISTENER ONLY
   QR GENERATION WILL CONTINUE IN PART 2
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
           LOAD CUSTOMER PROFILE
        ================================== */

        await loadCustomerData(
            user
        );

    }
);


/* ==========================================
   LOAD CUSTOMER DATA
========================================== */

async function loadCustomerData(
    user
) {

    /* ======================================
       INITIAL LOADING STATE
    ====================================== */

    setCustomerLoadingState();


    try {

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


            applyCustomerFallback(
                user
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

        const name =
            getFirstValidValue(
                customerData.name,
                customerData.fullName,
                user.displayName,
                "Rio Customer"
            );


        customerName.textContent =
            name;


        /* ==================================
           MEMBER ID
        ================================== */

        const customerMemberId =
            getFirstValidValue(
                customerData.memberId,
                customerData.memberID,
                customerData.customerId,
                customerData.customerID,
                createMemberId(
                    user.uid
                )
            );


        memberId.textContent =
            customerMemberId;


        /* ==================================
           CUSTOMER PHOTO
        ================================== */

        loadCustomerPhoto(
            customerData
        );


        /* ==================================
           PROFILE LOADED STATUS
        ================================== */

        qrStatus.textContent =
            "Preparing Your Premium QR...";


        console.log(
            "Rio Maggi Customer Profile Loaded"
        );

    }


    catch (error) {

        /* ==================================
           FIRESTORE / PROFILE ERROR
        ================================== */

        console.error(
            "Customer Data Loading Error:",
            error
        );


        applyCustomerFallback(
            user
        );

    }

}


/* ==========================================
   LOADING STATE
========================================== */

function setCustomerLoadingState() {

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


    loadDefaultAvatar();

}


/* ==========================================
   CUSTOMER FALLBACK
========================================== */

function applyCustomerFallback(
    user
) {

    if (customerName) {

        customerName.textContent =
            getFirstValidValue(
                user?.displayName,
                "Rio Customer"
            );

    }


    if (memberId) {

        memberId.textContent =
            createMemberId(
                user?.uid
            );

    }


    loadDefaultAvatar();


    if (qrStatus) {

        qrStatus.textContent =
            "Preparing Your Premium QR...";

    }

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
        getFirstValidValue(
            customerData?.photoURL,
            customerData?.photoUrl,
            customerData?.profilePhoto,
            customerData?.profileImage,
            customerData?.avatarURL,
            customerData?.avatarUrl,
            ""
        );


    /* ==================================
       NO PROFILE PHOTO
    ================================== */

    if (!photoURL) {

        loadDefaultAvatar();

        return;

    }


    /* ==================================
       SET PHOTO
    ================================== */

    customerPhoto.onerror =
        handlePhotoError;


    customerPhoto.src =
        photoURL;

}


/* ==========================================
   PHOTO ERROR HANDLER
========================================== */

function handlePhotoError() {

    if (!customerPhoto) {

        return;

    }


    customerPhoto.onerror =
        null;


    loadDefaultAvatar();

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
   CREATE MEMBER ID
========================================== */

function createMemberId(
    uid
) {

    if (!uid) {

        return "RIO-000000";

    }


    const cleanUID =
        String(uid)
            .replace(
                /[^a-zA-Z0-9]/g,
                ""
            )
            .toUpperCase();


    const shortUID =
        cleanUID.substring(
            0,
            6
        );


    return (
        "RIO-" +
        (
            shortUID ||
            "000000"
        )
    );

}


/* ==========================================
   GET FIRST VALID VALUE
========================================== */

function getFirstValidValue(
    ...values
) {

    for (
        const value of values
    ) {

        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {

            return String(
                value
            ).trim();

        }

    }


    return "";

}


/* ==========================================
   END QR.JS — PART 1/3
========================================== */
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 2/3
   PREMIUM QR CODE GENERATION
   CLEANED + DUPLICATE-FREE
========================================== */


/* ==========================================
   QR CONFIGURATION
========================================== */

const QR_PREFIX =
    "RIO_MAGGI_CUSTOMER:";


const QR_SIZE =
    260;


/* ==========================================
   GENERATE CUSTOMER QR
========================================== */

function generateCustomerQR(
    uid
) {

    /* ======================================
       VALIDATE QR ELEMENT
    ====================================== */

    if (!qrCode) {

        console.error(
            "QR Generation Failed: #qrcode element not found."
        );

        return;

    }


    /* ======================================
       VALIDATE UID
    ====================================== */

    if (!uid) {

        console.error(
            "QR Generation Failed: UID missing."
        );


        qrStatus.textContent =
            "Unable to generate QR";


        return;

    }


    /* ======================================
       CLEAR PREVIOUS QR
    ====================================== */

    qrCode.innerHTML =
        "";


    qrCode.classList.remove(
        "qr-generated"
    );


    /* ======================================
       CREATE QR DATA
    ====================================== */

    const qrData =
        QR_PREFIX +
        uid;


    /* ======================================
       CHECK QR LIBRARY
    ====================================== */

    if (
        typeof QRCode ===
        "undefined"
    ) {

        console.error(
            "QRCode library is not loaded."
        );


        qrStatus.textContent =
            "QR system unavailable";


        return;

    }


    /* ======================================
       GENERATE QR
    ====================================== */

    try {

        new QRCode(

            qrCode,

            {

                text:
                    qrData,

                width:
                    QR_SIZE,

                height:
                    QR_SIZE,

                colorDark:
                    "#263525",

                colorLight:
                    "#ffffff",

                correctLevel:
                    QRCode.CorrectLevel.H

            }

        );


        /* ==================================
           QR READY STATUS
        ================================== */

        qrStatus.textContent =
            "✓ Premium QR Ready — Show at Counter";


        qrStatus.classList.add(
            "ready"
        );


        /* ==================================
           QR GENERATED ANIMATION
        ================================== */

        requestAnimationFrame(

            () => {

                qrCode.classList.add(
                    "qr-generated"
                );

            }

        );


        console.log(
            "Customer QR Generated Successfully"
        );

    }


    catch (error) {

        console.error(
            "QR Generation Error:",
            error
        );


        qrStatus.textContent =
            "Unable to generate Premium QR";


        qrCode.innerHTML =
            "";

    }

}


/* ==========================================
   QR CARD CLICK ANIMATION
========================================== */

function restartQRAnimation() {

    if (!qrCode) {

        return;

    }


    qrCode.classList.remove(
        "qr-generated"
    );


    /* ======================================
       FORCE CSS ANIMATION RESTART
    ====================================== */

    void qrCode.offsetWidth;


    qrCode.classList.add(
        "qr-generated"
    );

}


/* ==========================================
   QR CLICK EVENT
   SINGLE LISTENER
========================================== */

if (qrCode) {

    qrCode.addEventListener(

        "click",

        restartQRAnimation

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


/* ==========================================
   START STATUS ANIMATION
========================================== */

animateQRStatus();


/* ==========================================
   CUSTOMER PHOTO LOAD ANIMATION
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
   QR READY ANIMATION
========================================== */

function showQRReadyAnimation() {

    if (!qrCode) {

        return;

    }


    restartQRAnimation();

}


/* ==========================================
   EXPORT QR GENERATION FUNCTION
   PART 3 WILL CONTROL AUTH FLOW
========================================== */

window.generateCustomerQR =
    generateCustomerQR;


/* ==========================================
   END QR.JS — PART 2/3
========================================== */
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 3/3
   FINAL QR FLOW + INTERACTION + SERVICE WORKER
   CLEANED + DUPLICATE-FREE
========================================== */


/* ==========================================
   DAILY STAMP RULE
========================================== */

const DAILY_STAMP_LIMIT =
    1;


const DAILY_STAMP_MESSAGE =
    "ONE STAMP PER DAY — Multiple purchases on the same day will still count as only ONE loyalty stamp.";


const NEXT_DAY_MESSAGE =
    "Your next loyalty stamp will be available on your next purchase day.";


/* ==========================================
   QR CARD
========================================== */

const qrCard =
    document.querySelector(
        ".premium-qr-card"
    );


/* ==========================================
   QR CARD HOVER
   DESKTOP
========================================== */

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
   MOBILE / TABLET
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
   SCAN TITLE READY
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
   DAILY STAMP RULE
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
   QR SECTION INTERSECTION OBSERVER
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
   SERVICE WORKER
   SINGLE REGISTRATION
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
                        "./service-worker.js"
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
   FINAL STARTUP LOG
========================================== */

console.log(
    "Rio Maggi Point Premium QR System Ready"
);


/* ==========================================
   END QR.JS — PART 3/3
========================================== */
