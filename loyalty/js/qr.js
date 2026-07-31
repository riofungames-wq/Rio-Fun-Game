/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 1
   FIREBASE + CUSTOMER AUTH + PROFILE DATA
========================================== */


/* ==========================================
   FIREBASE IMPORT
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
   QR PREFIX
========================================== */

const QR_PREFIX =
    "RIO_MAGGI_CUSTOMER:";


/* ==========================================
   DEFAULT AVATAR
========================================== */

const DEFAULT_AVATAR =
    "assets/avatars/male.png";


/* ==========================================
   AUTH CHECK
========================================== */

onAuthStateChanged(

    auth,

    async (user) => {

        /* ==================================
           USER NOT LOGGED IN
        ================================== */

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        /* ==================================
           LOAD CUSTOMER DATA
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

    try {

        /* ==================================
           SHOW LOADING STATE
        ================================== */

        customerName.textContent =
            "Loading...";


        memberId.textContent =
            "RIO-000000";


        qrStatus.textContent =
            "Preparing Your Premium QR...";


        /* ==================================
           CUSTOMER FIRESTORE DOCUMENT
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
           CUSTOMER NOT FOUND
        ================================== */

        if (
            !customerSnap.exists()
        ) {

            console.warn(
                "Customer document not found."
            );


            customerName.textContent =
                user.displayName ||
                "Rio Customer";


            memberId.textContent =
                createMemberId(
                    user.uid
                );


            loadDefaultAvatar();


            qrStatus.textContent =
                "Your Premium QR is Ready";


            return;

        }


        /* ==================================
           GET CUSTOMER DATA
        ================================== */

        const customerData =
            customerSnap.data();


        /* ==================================
           CUSTOMER NAME
        ================================== */

        customerName.textContent =
            customerData.name ||
            user.displayName ||
            "Rio Customer";


        /* ==================================
           MEMBER ID
        ================================== */

        memberId.textContent =
            customerData.memberId ||
            createMemberId(
                user.uid
            );


        /* ==================================
           CUSTOMER PHOTO
        ================================== */

        loadCustomerPhoto(
            customerData
        );


        /* ==================================
           QR STATUS
        ================================== */

        qrStatus.textContent =
            "Your Premium QR is Ready";


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


        customerName.textContent =
            "Rio Customer";


        memberId.textContent =
            createMemberId(
                user.uid
            );


        loadDefaultAvatar();


        qrStatus.textContent =
            "Premium QR Ready";

    }

}


/* ==========================================
   LOAD CUSTOMER PHOTO
========================================== */

function loadCustomerPhoto(
    customerData
) {

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
       LOAD PHOTO
    ================================== */

    customerPhoto.src =
        photoURL;


    customerPhoto.onerror =
        () => {

            loadDefaultAvatar();

        };

}


/* ==========================================
   DEFAULT AVATAR
========================================== */

function loadDefaultAvatar() {

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
   END PART 1
========================================== */
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 2
   PREMIUM QR CODE GENERATION
========================================== */


/* ==========================================
   GENERATE CUSTOMER QR
========================================== */

function generateCustomerQR(
    uid
) {

    /* ==================================
       VALIDATE UID
    ================================== */

    if (!uid) {

        console.error(
            "QR Generation Failed: UID missing."
        );

        qrStatus.textContent =
            "Unable to generate QR";

        return;

    }


    /* ==================================
       CLEAR OLD QR
    ================================== */

    qrCode.innerHTML =
        "";


    /* ==================================
       CREATE QR DATA
    ================================== */

    const qrData =
        QR_PREFIX +
        uid;


    /* ==================================
       GENERATE QR
    ================================== */

    try {

        new QRCode(

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
           QR ANIMATION
        ================================== */

        qrCode.classList.add(
            "qr-generated"
        );


        console.log(
            "Customer QR Generated:",
            qrData
        );

    }


    catch (error) {

        console.error(
            "QR Generation Error:",
            error
        );


        qrStatus.textContent =
            "Unable to generate Premium QR";

    }

}


/* ==========================================
   GENERATE QR AFTER AUTH
========================================== */

onAuthStateChanged(

    auth,

    async (user) => {

        /* ==================================
           USER NOT LOGGED IN
        ================================== */

        if (!user) {

            return;

        }


        /* ==================================
           WAIT FOR CUSTOMER DATA
        ================================== */

        try {

            generateCustomerQR(
                user.uid
            );

        }


        catch (error) {

            console.error(
                "QR Initialization Error:",
                error
            );

        }

    }

);


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
   QR CARD INTERACTION
========================================== */

if (qrCode) {

    qrCode.addEventListener(

        "click",

        () => {

            qrCode.classList.remove(
                "qr-generated"
            );


            /* ==============================
               RESTART ANIMATION
            ============================== */

            void qrCode.offsetWidth;


            qrCode.classList.add(
                "qr-generated"
            );

        }

    );

}


/* ==========================================
   END PART 2
========================================== */
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 3
   DAILY STAMP RULE + PREMIUM INTERACTION
========================================== */


/* ==========================================
   DAILY STAMP RULE
========================================== */

const DAILY_STAMP_LIMIT =
    1;


/* ==========================================
   DAILY STAMP MESSAGE
========================================== */

const DAILY_STAMP_MESSAGE =

    "ONE STAMP PER DAY — " +
    "Multiple purchases on the same day " +
    "will still count as only ONE loyalty stamp.";


/* ==========================================
   NEXT PURCHASE DAY MESSAGE
========================================== */

const NEXT_DAY_MESSAGE =

    "Your next loyalty stamp will be available " +
    "on your next purchase day.";


/* ==========================================
   QR CARD ANIMATION
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
   QR TOUCH ANIMATION
   MOBILE + TABLET
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
   QR SCAN TITLE ANIMATION
========================================== */

const scanTitle =
    document.querySelector(
        ".scan-title"
    );


if (scanTitle) {

    scanTitle.classList.add(
        "scan-title-ready"
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
   QR READY ANIMATION
========================================== */

function showQRReadyAnimation() {

    if (!qrCode) {

        return;

    }


    qrCode.classList.remove(
        "qr-generated"
    );


    /* ==================================
       FORCE ANIMATION RESTART
    ================================== */

    void qrCode.offsetWidth;


    qrCode.classList.add(
        "qr-generated"
    );

}


/* ==========================================
   RUN QR ANIMATION
========================================== */

setTimeout(

    () => {

        showQRReadyAnimation();

    },

    300

);


/* ==========================================
   DAILY STAMP RULE HIGHLIGHT
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


            /* ==============================
               RESTART HIGHLIGHT ANIMATION
            ============================== */

            void dailyStampRule.offsetWidth;


            dailyStampRule.classList.add(
                "rule-highlight"
            );

        }

    );

}


/* ==========================================
   PREMIUM QR CARD OBSERVER
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

                        }

                    }

                );

            },

            {

                threshold:
                    0.2

            }

        );


    qrObserver.observe(
        premiumQRSection
    );

}


/* ==========================================
   SERVICE WORKER
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

        }

    );

}


/* ==========================================
   FINAL QR.JS STARTUP
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
   QR.JS END
========================================== */
