/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 1 / 3
   AUTH + CUSTOMER PROFILE + QR DATA FLOW
   FIXED / CLEAN VERSION
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
   DEFAULT VALUES
========================================== */

const DEFAULT_AVATAR =
    "./assets/avatars/male.png";

const DEFAULT_CUSTOMER_NAME =
    "Rio Customer";

const DEFAULT_MEMBER_ID =
    "RIO-000000";


/* ==========================================
   QR GENERATION STATE
========================================== */

let qrGenerationStarted = false;


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

        qrStatus.classList.remove(
            "ready",
            "error",
            "loading"
        );

        qrStatus.classList.add(
            "loading"
        );

    }

}


/* ==========================================
   INITIALIZE PAGE
========================================== */

setInitialLoadingState();


/* ==========================================
   AUTH STATE
   SINGLE LISTENER ONLY
========================================== */

onAuthStateChanged(

    auth,

    async (user) => {

        /* ==================================
           CUSTOMER NOT LOGGED IN
        ================================== */

        if (!user) {

            console.warn(
                "Rio Maggi Point: Customer is not authenticated."
            );

            window.location.replace(
                "./login.html"
            );

            return;

        }


        /* ==================================
           AUTHENTICATED CUSTOMER
        ================================== */

        console.log(
            "Rio Maggi Point: Authenticated Customer",
            user.uid
        );


        try {

            /* ==================================
               LOAD CUSTOMER PROFILE
            ================================== */

            const customerData =
                await loadCustomerData(
                    user
                );


            /* ==================================
               CUSTOMER DATA READY
               QR GENERATION EVENT
            ================================== */

            dispatchCustomerReadyEvent(

                user.uid,

                customerData

            );

        }


        catch (error) {

            console.error(
                "Rio Customer Initialization Error:",
                error
            );


            /* ==================================
               PROFILE FALLBACK
            ================================== */

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


            /* ==================================
               QR CAN STILL USE AUTH UID
            ================================== */

            dispatchCustomerReadyEvent(

                user.uid,

                null

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

    if (
        !user ||
        !user.uid
    ) {

        throw new Error(
            "Authenticated customer UID is missing."
        );

    }


    /* ==================================
       FIRESTORE CUSTOMER DOCUMENT
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

            gender:
                "",

            exists:
                false

        };

    }


    /* ==================================
       FIRESTORE CUSTOMER DATA
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
       QR STATUS
    ================================== */

    if (qrStatus) {

        qrStatus.textContent =
            "Preparing Your Premium QR...";

        qrStatus.classList.remove(
            "ready",
            "error"
        );

        qrStatus.classList.add(
            "loading"
        );

    }


    /* ==================================
       LOG CUSTOMER DATA
    ================================== */

    console.log(
        "Rio Maggi Customer Loaded:",
        {
            uid:
                user.uid,

            name:
                name,

            memberId:
                finalMemberId,

            gender:
                customerData.gender ||
                ""

        }
    );


    /* ==================================
       NORMALIZED CUSTOMER DATA
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
       PHOTO ERROR FALLBACK
    ================================== */

    customerPhoto.onerror =
        () => {

            loadDefaultAvatar();

        };


    /* ==================================
       SET CUSTOMER PHOTO
    ================================== */

    customerPhoto.src =
        photoURL;

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
   PART 2 LISTENS TO THIS EVENT
========================================== */

function dispatchCustomerReadyEvent(
    uid,
    customerData
) {

    if (!uid) {

        console.error(
            "Customer Ready Event: UID missing."
        );

        return;

    }


    /*
     * Prevent accidental duplicate dispatch.
     * This protects QR generation from being
     * triggered multiple times by this file.
     */

    if (
        qrGenerationStarted
    ) {

        console.warn(
            "Customer Ready Event already dispatched."
        );

        return;

    }


    qrGenerationStarted =
        true;


    window.dispatchEvent(

        new CustomEvent(
            "rioCustomerReady",
            {
                detail: {

                    uid:
                        uid,

                    customerData:
                        customerData

                }

            }
        )

    );


    console.log(
        "Rio Customer Ready Event Dispatched:",
        uid
    );

}


/* ==========================================
   PART 1 READY
========================================== */

console.log(
    "QR.JS PART 1 LOADED"
);

console.log(
    "RIO CUSTOMER AUTH FLOW READY"
);

console.log(
    "RIO CUSTOMER PROFILE FLOW READY"
);
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 2 / 3
   QR GENERATION + LIBRARY CHECK
   FIXED / CLEAN VERSION
========================================== */


/* ==========================================
   CUSTOMER READY EVENT
   RECEIVED FROM PART 1
========================================== */

window.addEventListener(

    "rioCustomerReady",

    (event) => {

        /* ==================================
           VALIDATE EVENT
        ================================== */

        if (
            !event ||
            !event.detail
        ) {

            console.error(
                "Rio QR: Customer data event is missing."
            );

            showQRError(
                "Unable to load customer information."
            );

            return;

        }


        const {

            uid,

            customerData

        } =
            event.detail;


        /* ==================================
           VALIDATE UID
        ================================== */

        if (!uid) {

            console.error(
                "Rio QR: Customer UID is missing."
            );

            showQRError(
                "Customer account could not be verified."
            );

            return;

        }


        /* ==================================
           GET MEMBER ID
        ================================== */

        const finalMemberId =

            customerData &&
            customerData.memberId

                ? customerData.memberId

                : createMemberId(
                    uid
                );


        /* ==================================
           PREPARE QR PAYLOAD
        ================================== */

        const qrPayload =

            createQRPayload(

                uid,

                finalMemberId

            );


        console.log(
            "Rio QR Payload Prepared:",
            qrPayload
        );


        /* ==================================
           WAIT FOR QR LIBRARY
        ================================== */

        waitForQRCodeLibrary(

            () => {

                generateCustomerQR(

                    qrPayload

                );

            }

        );

    }

);


/* ==========================================
   CREATE QR PAYLOAD
========================================== */

function createQRPayload(

    uid,

    memberId

) {

    /*
     * IMPORTANT:
     *
     * The QR contains only the customer
     * account identifier.
     *
     * Staff/Admin QR scanner can use
     * this UID to find the customer.
     *
     * Do NOT put sensitive customer data
     * inside the QR code.
     */


    return (

        QR_PREFIX +

        uid +

        "|MEMBER:" +

        memberId

    );

}


/* ==========================================
   WAIT FOR QR CODE LIBRARY
========================================== */

function waitForQRCodeLibrary(

    callback,

    attempt = 0

) {

    const MAX_ATTEMPTS =
        100;


    const RETRY_DELAY =
        100;


    /* ==================================
       LIBRARY AVAILABLE
    ================================== */

    if (

        typeof window.QRCode !==
        "undefined"

    ) {

        console.log(
            "Rio QR: QRCode library detected."
        );


        callback();

        return;

    }


    /* ==================================
       MAX ATTEMPTS REACHED
    ================================== */

    if (

        attempt >=
        MAX_ATTEMPTS

    ) {

        console.error(

            "Rio QR: QRCode library failed to load."

        );


        showQRError(

            "QR service temporarily unavailable. Please refresh the page."

        );


        return;

    }


    /* ==================================
       RETRY
    ================================== */

    setTimeout(

        () => {

            waitForQRCodeLibrary(

                callback,

                attempt + 1

            );

        },

        RETRY_DELAY

    );

}


/* ==========================================
   GENERATE CUSTOMER QR
========================================== */

function generateCustomerQR(

    qrPayload

) {

    /* ==================================
       VALIDATE QR CONTAINER
    ================================== */

    if (!qrCode) {

        console.error(

            "Rio QR: #qrcode container not found."

        );


        showQRError(

            "QR display area is unavailable."

        );


        return;

    }


    /* ==================================
       VALIDATE PAYLOAD
    ================================== */

    if (

        !qrPayload ||

        typeof qrPayload !==
        "string"

    ) {

        console.error(

            "Rio QR: Invalid QR payload."

        );


        showQRError(

            "Unable to create your QR code."

        );


        return;

    }


    /* ==================================
       CLEAR OLD QR
    ================================== */

    qrCode.innerHTML =
        "";


    qrCode.classList.remove(

        "qr-generated"

    );


    /* ==================================
       QR OPTIONS
    ================================== */

    const qrOptions = {

        text:
            qrPayload,

        width:
            260,

        height:
            260,

        colorDark:
            "#263525",

        colorLight:
            "#ffffff",

        correctLevel:
            window.QRCode.CorrectLevel.H

    };


    /* ==================================
       GENERATE QR
    ================================== */

    try {

        new window.QRCode(

            qrCode,

            qrOptions

        );


        console.log(

            "Rio QR: QR generation started."

        );


        /* ==================================
           VERIFY QR OUTPUT
        ================================== */

        waitForQRRender(

            0

        );

    }


    catch (error) {

        console.error(

            "Rio QR Generation Error:",

            error

        );


        showQRError(

            "Unable to generate your QR code. Please refresh the page."

        );

    }

}


/* ==========================================
   VERIFY QR RENDER
========================================== */

function waitForQRRender(

    attempt

) {

    const MAX_ATTEMPTS =
        30;


    const RETRY_DELAY =
        100;


    /* ==================================
       QR OUTPUT FOUND
    ================================== */

    const qrImage =

        qrCode
            ? qrCode.querySelector(
                "img"
            )
            : null;


    const qrCanvas =

        qrCode
            ? qrCode.querySelector(
                "canvas"
            )
            : null;


    if (

        qrImage ||

        qrCanvas

    ) {

        console.log(

            "Rio QR: QR code rendered successfully."

        );


        markQRReady();


        return;

    }


    /* ==================================
       RENDER FAILED
    ================================== */

    if (

        attempt >=
        MAX_ATTEMPTS

    ) {

        console.error(

            "Rio QR: QR code was not rendered."

        );


        showQRError(

            "QR code could not be displayed. Please refresh the page."

        );


        return;

    }


    /* ==================================
       WAIT AND CHECK AGAIN
    ================================== */

    setTimeout(

        () => {

            waitForQRRender(

                attempt + 1

            );

        },

        RETRY_DELAY

    );

}


/* ==========================================
   QR READY STATE
========================================== */

function markQRReady() {

    if (qrCode) {

        qrCode.classList.remove(

            "qr-generated"

        );


        /*
         * Force browser reflow so the
         * animation can restart correctly.
         */

        void qrCode.offsetWidth;


        qrCode.classList.add(

            "qr-generated"

        );

    }


    if (qrStatus) {

        qrStatus.textContent =

            "Your Premium Loyalty QR is ready.";

        qrStatus.classList.remove(

            "loading",

            "error"

        );

        qrStatus.classList.add(

            "ready"

        );

    }


    console.log(

        "Rio QR: Premium QR is ready."

    );

}


/* ==========================================
   QR ERROR STATE
========================================== */

function showQRError(

    message

) {

    if (qrStatus) {

        qrStatus.textContent =

            message ||

            "Unable to load QR code.";

        qrStatus.classList.remove(

            "loading",

            "ready"

        );

        qrStatus.classList.add(

            "error"

        );

    }


    if (qrCode) {

        qrCode.innerHTML =

            `

            <div
                class="qr-error"
                role="alert"
            >

                <i
                    class="fa-solid fa-triangle-exclamation"
                    aria-hidden="true"
                ></i>

                <span>
                    QR Unavailable
                </span>

            </div>

            `;

    }

}


/* ==========================================
   MEMBER ID HELPER
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


    return (

        "RIO-" +

        cleanUID

            .substring(

                0,

                6

            )

            .toUpperCase()

    );

}


/* ==========================================
   PART 2 READY
========================================== */

console.log(

    "QR.JS PART 2 LOADED"

);

console.log(

    "RIO QR GENERATION FLOW READY"

);
/* ==========================================
   RIO MAGGI POINT
   QR.JS — PART 3 / 3
   INTERACTION + FINAL SAFETY + INITIALIZATION
========================================== */


/* ==========================================
   QR CARD INTERACTION
========================================== */

const premiumQRCard =

    document.querySelector(
        ".premium-qr-card"
    );


/* ==========================================
   MOUSE HOVER
========================================== */

if (premiumQRCard) {

    premiumQRCard.addEventListener(

        "mouseenter",

        () => {

            premiumQRCard.classList.add(

                "qr-hover"

            );

        }

    );


    premiumQRCard.addEventListener(

        "mouseleave",

        () => {

            premiumQRCard.classList.remove(

                "qr-hover"

            );

        }

    );


    /* ======================================
       TOUCH START
    ====================================== */

    premiumQRCard.addEventListener(

        "touchstart",

        () => {

            premiumQRCard.classList.add(

                "qr-touch"

            );

        },

        {
            passive:
                true
        }

    );


    /* ======================================
       TOUCH END
    ====================================== */

    premiumQRCard.addEventListener(

        "touchend",

        () => {

            setTimeout(

                () => {

                    premiumQRCard.classList.remove(

                        "qr-touch"

                    );

                },

                150

            );

        },

        {
            passive:
                true
        }

    );

}


/* ==========================================
   SECTION ENTRY ANIMATION
========================================== */

function initializeSectionAnimation() {

    const sections =

        document.querySelectorAll(

            ".premium-qr-section"

        );


    if (!sections.length) {

        return;

    }


    /* ======================================
       REDUCED MOTION
    ====================================== */

    const prefersReducedMotion =

        window.matchMedia(

            "(prefers-reduced-motion: reduce)"

        ).matches;


    if (prefersReducedMotion) {

        sections.forEach(

            (section) => {

                section.classList.add(

                    "section-visible"

                );

            }

        );


        return;

    }


    /* ======================================
       INTERSECTION OBSERVER
    ====================================== */

    if (

        "IntersectionObserver" in
        window

    ) {

        const observer =

            new IntersectionObserver(

                (

                    entries,

                    observerInstance

                ) => {

                    entries.forEach(

                        (entry) => {

                            if (

                                entry.isIntersecting

                            ) {

                                entry.target.classList.add(

                                    "section-visible"

                                );


                                observerInstance.unobserve(

                                    entry.target

                                );

                            }

                        }

                    );

                },

                {

                    threshold:
                        0.08

                }

            );


        sections.forEach(

            (section) => {

                observer.observe(

                    section

                );

            }

        );

    }


    /* ======================================
       FALLBACK
    ====================================== */

    else {

        sections.forEach(

            (section) => {

                section.classList.add(

                    "section-visible"

                );

            }

        );

    }

}


/* ==========================================
   QR STATUS SAFETY
========================================== */

function initializeQRStatus() {

    if (!qrStatus) {

        return;

    }


    qrStatus.classList.add(

        "loading"

    );


    qrStatus.classList.remove(

        "ready",

        "error"

    );


    qrStatus.textContent =

        "Preparing Your Premium QR...";

}


/* ==========================================
   QR CONTAINER SAFETY
========================================== */

function initializeQRContainer() {

    if (!qrCode) {

        console.error(

            "Rio QR: #qrcode element is missing from HTML."

        );


        return false;

    }


    /*
     * Make sure QR container does not
     * contain accidental old content.
     */

    qrCode.setAttribute(

        "aria-label",

        "Customer Loyalty QR Code"

    );


    return true;

}


/* ==========================================
   EXTERNAL QR LIBRARY FINAL CHECK
========================================== */

function verifyQRCodeLibrary() {

    if (

        typeof window.QRCode ===
        "undefined"

    ) {

        console.warn(

            "Rio QR: QRCode library is not available yet."

        );


        return false;

    }


    return true;

}


/* ==========================================
   PAGE INITIALIZATION
========================================== */

function initializeQRPage() {

    console.log(

        "Rio Maggi Point: Initializing QR page..."

    );


    /* ======================================
       INITIAL STATUS
    ====================================== */

    initializeQRStatus();


    /* ======================================
       CHECK QR CONTAINER
    ====================================== */

    const qrContainerReady =

        initializeQRContainer();


    if (!qrContainerReady) {

        showQRError(

            "QR display area is unavailable."

        );

    }


    /* ======================================
       SECTION ANIMATION
    ====================================== */

    initializeSectionAnimation();


    /* ======================================
       LIBRARY STATUS
    ====================================== */

    if (

        verifyQRCodeLibrary()

    ) {

        console.log(

            "Rio QR: QRCode library is ready."

        );

    }

    else {

        console.log(

            "Rio QR: Waiting for QRCode library..."

        );

    }


    /* ======================================
       FINAL READY LOG
    ====================================== */

    console.log(

        "Rio Maggi Point QR page initialized."

    );

}


/* ==========================================
   DOM READY
========================================== */

if (

    document.readyState ===
    "loading"

) {

    document.addEventListener(

        "DOMContentLoaded",

        initializeQRPage,

        {
            once:
                true
        }

    );

}

else {

    initializeQRPage();

}


/* ==========================================
   GLOBAL QR DEBUG EVENT
   OPTIONAL / SAFE
========================================== */

window.addEventListener(

    "error",

    (event) => {

        /*
         * Only log QR-related runtime errors.
         * Do not replace the whole page UI.
         */

        if (

            event &&
            event.message &&
            event.message
                .toLowerCase()
                .includes("qrcode")

        ) {

            console.error(

                "Rio QR Runtime Error:",

                event.message

            );

        }

    }

);


/* ==========================================
   FINAL QR.JS STATUS
========================================== */

console.log(

    "================================"

);

console.log(

    "RIO MAGGI POINT"

);

console.log(

    "QR.JS LOADED SUCCESSFULLY"

);

console.log(

    "CUSTOMER AUTH FLOW: READY"

);

console.log(

    "CUSTOMER PROFILE FLOW: READY"

);

console.log(

    "QR GENERATION FLOW: READY"

);

console.log(

    "RESPONSIVE QR UI: READY"

);

console.log(

    "================================"
);
