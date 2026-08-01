// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 1 OF 4
// =====================================


// =====================================
// FIREBASE IMPORTS
// =====================================

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// GLOBAL USER
// =====================================

window.currentRioUser = null;


// =====================================
// LOYALTY CONFIGURATION
// =====================================

const TOTAL_STAMPS = 6;
const STAMP_RESET_DAYS = 40;


// =====================================
// FREE GAME BUTTON
// =====================================

const gameButton = document.getElementById("gameLink");

if (gameButton) {

    gameButton.addEventListener("click", () => {

        window.location.href = "../index.html";

    });

}


// =====================================
// CALL BUTTON
// =====================================

const callButton = document.getElementById("callBtn");

if (callButton) {

    callButton.addEventListener("click", () => {

        window.location.href = "tel:+918871689650";

    });

}


// =====================================
// WHATSAPP BUTTON
// =====================================

const whatsappButton = document.getElementById("whatsappBtn");

if (whatsappButton) {

    whatsappButton.addEventListener("click", () => {

        const whatsappNumber = "918871689650";

        const whatsappMessage = encodeURIComponent(
            "Hello Rio Maggi Point, I want to know more about the loyalty program."
        );

        window.open(
            "https://wa.me/" +
            whatsappNumber +
            "?text=" +
            whatsappMessage,
            "_blank",
            "noopener,noreferrer"
        );

    });

}


// =====================================
// MAP BUTTON
// =====================================

const mapButton = document.getElementById("mapBtn");

if (mapButton) {

    mapButton.addEventListener("click", () => {

        // Add the verified Rio Maggi Point
        // Google Maps URL here when available.
        const mapUrl = "";

        if (mapUrl) {

            window.open(
                mapUrl,
                "_blank",
                "noopener,noreferrer"
            );

        } else {

            alert(
                "Rio Maggi Point Google Maps location link is not configured yet."
            );

        }

    });

}


// =====================================
// DELIVERY BUTTON
// =====================================

const deliveryButton = document.getElementById("deliveryBtn");

if (deliveryButton) {

    deliveryButton.addEventListener("click", () => {

        alert(
            "Delivery service coming soon."
        );

    });

}


// =====================================
// GET CUSTOMER PROFILE
// =====================================

async function loadCustomerData(user) {

    try {

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap = await getDoc(
            userRef
        );


        if (!userSnap.exists()) {

            console.warn(
                "Customer profile not found."
            );

            return;

        }


        const data = userSnap.data();


        // =================================
        // CUSTOMER NAME
        // =================================

        const customerName =
            document.getElementById(
                "customerName"
            );

        if (customerName) {

            customerName.textContent =
                data.name ||
                data.fullName ||
                "Rio Customer";

        }


        // =================================
        // MEMBER ID
        // =================================

        const memberId =
            document.getElementById(
                "memberId"
            );

        if (memberId) {

            memberId.textContent =
                data.memberId ||
                "RIO-" +
                user.uid
                    .slice(0, 10)
                    .toUpperCase();

        }


        // =================================
        // CUSTOMER PHOTO
        // =================================

        const customerPhoto =
            document.getElementById(
                "customerPhoto"
            );

        if (
            customerPhoto &&
            data.photoURL
        ) {

            customerPhoto.src =
                data.photoURL;

        }


        // =================================
        // MEMBER SINCE
        // =================================

        if (data.memberSince) {

            window.rioMemberSince =
                data.memberSince;

        }


        // =================================
        // MOBILE NUMBER
        // =================================

        if (data.mobile) {

            window.rioCustomerMobile =
                data.mobile;

        }


        console.log(
            "Customer profile loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "Customer profile loading failed:",
            error
        );

    }

}


// =====================================
// END OF CARD.JS PART 1
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 2 OF 4
// =====================================


// =====================================
// LOAD STAMP DATA
// =====================================

async function loadStampData(user) {

    try {

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap = await getDoc(
            userRef
        );


        if (!userSnap.exists()) {

            console.warn(
                "Stamp data user profile not found."
            );

            return;

        }


        const userData = userSnap.data();


        // =================================
        // CURRENT STAMP COUNT
        // =================================

        let stampCount = Number(
            userData.stamps ??
            userData.currentStamps ??
            0
        );


        // =================================
        // KEEP STAMPS BETWEEN 0 AND 6
        // =================================

        stampCount = Math.max(
            0,
            Math.min(
                stampCount,
                TOTAL_STAMPS
            )
        );


        // =================================
        // UPDATE STAMP CIRCLES
        // =================================

        for (
            let i = 1;
            i <= TOTAL_STAMPS;
            i++
        ) {

            const stampCircle =
                document.getElementById(
                    "stamp" + i
                );


            if (!stampCircle) {
                continue;
            }


            if (i <= stampCount) {

                stampCircle.classList.add(
                    "active"
                );

                stampCircle.classList.add(
                    "stamp-collected"
                );

                stampCircle.innerHTML =
                    '<i class="fa-solid fa-check"></i>';

            } else {

                stampCircle.classList.remove(
                    "active"
                );

                stampCircle.classList.remove(
                    "stamp-collected"
                );

                stampCircle.innerHTML =
                    "<span>" +
                    i +
                    "</span>";

            }

        }


        // =================================
        // STAMP DATES
        // =================================

        const stampDates =
            Array.isArray(userData.stampDates)
                ? userData.stampDates
                : [];


        for (
            let i = 1;
            i <= TOTAL_STAMPS;
            i++
        ) {

            const dateElement =
                document.getElementById(
                    "stampDate" + i
                );


            if (!dateElement) {
                continue;
            }


            const stampDate =
                stampDates[i - 1];


            if (stampDate) {

                dateElement.textContent =
                    formatStampDate(
                        stampDate
                    );

            } else {

                dateElement.textContent =
                    "--";

            }

        }


        // =================================
        // REWARD CIRCLE
        // =================================

        checkRewardStatus(
            stampCount
        );


        // =================================
        // UPDATE GLOBAL STAMP COUNT
        // =================================

        window.rioCurrentStamps =
            stampCount;


        // =================================
        // REWARD STATUS
        // =================================

        if (
            stampCount >= TOTAL_STAMPS
        ) {

            console.log(
                "FREE VEG MAGGI REWARD UNLOCKED"
            );

        } else {

            console.log(
                "Stamps remaining:",
                TOTAL_STAMPS - stampCount
            );

        }


        console.log(
            "Current Stamp Count:",
            stampCount +
            " / " +
            TOTAL_STAMPS
        );

    }

    catch (error) {

        console.error(
            "Stamp data loading failed:",
            error
        );

    }

}


// =====================================
// FORMAT STAMP DATE
// =====================================

function formatStampDate(dateValue) {

    try {

        let date;


        // =================================
        // FIREBASE TIMESTAMP
        // =================================

        if (
            dateValue &&
            typeof dateValue.toDate ===
            "function"
        ) {

            date =
                dateValue.toDate();

        }


        // =================================
        // JAVASCRIPT DATE
        // =================================

        else if (
            dateValue instanceof Date
        ) {

            date =
                dateValue;

        }


        // =================================
        // STRING / NUMBER
        // =================================

        else {

            date =
                new Date(
                    dateValue
                );

        }


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "--";

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short"
            }
        );

    }

    catch (error) {

        console.error(
            "Stamp date formatting error:",
            error
        );

        return "--";

    }

}


// =====================================
// CHECK REWARD STATUS
// =====================================

function checkRewardStatus(stampCount) {

    const rewardCircle =
        document.getElementById(
            "rewardCircle"
        );


    if (!rewardCircle) {
        return;
    }


    const isUnlocked =
        Number(stampCount) >=
        TOTAL_STAMPS;


    if (isUnlocked) {

        rewardCircle.classList.add(
            "active"
        );

        rewardCircle.classList.add(
            "reward-unlocked"
        );

        rewardCircle.setAttribute(
            "aria-label",
            "Free Veg Maggi reward unlocked"
        );

    } else {

        rewardCircle.classList.remove(
            "active"
        );

        rewardCircle.classList.remove(
            "reward-unlocked"
        );

        rewardCircle.setAttribute(
            "aria-label",
            "Reward locked"
        );

    }

}


// =====================================
// END OF CARD.JS PART 2
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 3 OF 4
// =====================================


// =====================================
// LOAD 40-DAY COUNTDOWN DATA
// =====================================

async function loadCountdownData(user) {

    try {

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap = await getDoc(
            userRef
        );


        if (!userSnap.exists()) {

            console.warn(
                "Countdown user profile not found."
            );

            return;

        }


        const userData = userSnap.data();


        // =================================
        // GET STAMP DATES
        // =================================

        const stampDates =
            Array.isArray(userData.stampDates)
                ? userData.stampDates
                : [];


        // =================================
        // FIND MOST RECENT VALID STAMP DATE
        // =================================

        let lastStampDate = null;


        for (
            let i = stampDates.length - 1;
            i >= 0;
            i--
        ) {

            const parsedDate =
                parseFirebaseDate(
                    stampDates[i]
                );


            if (parsedDate) {

                lastStampDate =
                    parsedDate;

                break;

            }

        }


        // =================================
        // GET CURRENT STAMP COUNT
        // =================================

        const stampCount = Math.max(
            0,
            Math.min(
                Number(
                    userData.stamps ??
                    userData.currentStamps ??
                    0
                ),
                TOTAL_STAMPS
            )
        );


        // =================================
        // NO STAMP YET
        // =================================

        if (!lastStampDate) {

            updateCountdownDisplay(
                STAMP_RESET_DAYS,
                stampCount >= TOTAL_STAMPS
            );

            window.rioCountdownDays =
                STAMP_RESET_DAYS;

            return;

        }


        // =================================
        // CALCULATE DAYS PASSED
        // =================================

        const now =
            new Date();


        const difference =
            Math.max(
                0,
                now.getTime() -
                lastStampDate.getTime()
            );


        const daysPassed =
            Math.floor(
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        // =================================
        // CALCULATE REMAINING DAYS
        // =================================

        let remainingDays =
            STAMP_RESET_DAYS -
            daysPassed;


        remainingDays =
            Math.max(
                0,
                remainingDays
            );


        // =================================
        // UPDATE COUNTDOWN UI
        // =================================

        updateCountdownDisplay(
            remainingDays,
            stampCount >= TOTAL_STAMPS
        );


        // =================================
        // SAVE GLOBAL COUNTDOWN
        // =================================

        window.rioCountdownDays =
            remainingDays;


        console.log(
            "Stamp Reset Countdown:",
            remainingDays,
            "Days"
        );

    }

    catch (error) {

        console.error(
            "Countdown loading failed:",
            error
        );

    }

}


// =====================================
// PARSE FIREBASE / DATE VALUE
// =====================================

function parseFirebaseDate(dateValue) {

    try {

        if (!dateValue) {
            return null;
        }


        // =================================
        // FIREBASE TIMESTAMP
        // =================================

        if (
            typeof dateValue.toDate ===
            "function"
        ) {

            const date =
                dateValue.toDate();


            return isNaN(
                date.getTime()
            )
                ? null
                : date;

        }


        // =================================
        // JAVASCRIPT DATE
        // =================================

        if (
            dateValue instanceof Date
        ) {

            return isNaN(
                dateValue.getTime()
            )
                ? null
                : dateValue;

        }


        // =================================
        // FIREBASE SERIALIZED TIMESTAMP
        // =================================

        if (
            typeof dateValue === "object" &&
            dateValue.seconds !== undefined
        ) {

            const milliseconds =
                Number(
                    dateValue.seconds
                ) * 1000 +
                Math.floor(
                    Number(
                        dateValue.nanoseconds ||
                        0
                    ) / 1000000
                );


            const date =
                new Date(
                    milliseconds
                );


            return isNaN(
                date.getTime()
            )
                ? null
                : date;

        }


        // =================================
        // STRING / NUMBER
        // =================================

        const date =
            new Date(
                dateValue
            );


        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }

    catch (error) {

        console.error(
            "Date parsing failed:",
            error
        );

        return null;

    }

}


// =====================================
// UPDATE COUNTDOWN UI
// =====================================

function updateCountdownDisplay(
    days,
    rewardUnlocked
) {

    const countdownBox =
        document.querySelector(
            ".countdown-box"
        );


    const countdownDays =
        document.getElementById(
            "countdownDays"
        );


    if (!countdownDays) {
        return;
    }


    // =================================
    // SAFE DAY VALUE
    // =================================

    const safeDays =
        Math.max(
            0,
            Number(days) || 0
        );


    // =================================
    // UPDATE NUMBER
    // =================================

    countdownDays.textContent =
        safeDays +
        (
            safeDays === 1
                ? " DAY"
                : " DAYS"
        );


    // =================================
    // REWARD UNLOCKED STYLE
    // =================================

    if (countdownBox) {

        countdownBox.classList.toggle(
            "reward-unlocked",
            Boolean(rewardUnlocked)
        );

        countdownBox.classList.toggle(
            "active",
            Boolean(rewardUnlocked)
        );

    }

}


// =====================================
// UPDATE COUNTDOWN EVERY MINUTE
// =====================================

function startCountdownRefresh() {

    setInterval(
        () => {

            if (
                window.currentRioUser
            ) {

                loadCountdownData(
                    window.currentRioUser
                );

            }

        },
        60 * 1000
    );

}


// =====================================
// START COUNTDOWN REFRESH
// =====================================

startCountdownRefresh();


// =====================================
// END OF CARD.JS PART 3
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 4 OF 4
// FINAL PART
// =====================================


// =====================================
// FIREBASE AUTHENTICATION
// =====================================

onAuthStateChanged(

    auth,

    async (user) => {

        // =====================================
        // USER NOT LOGGED IN
        // =====================================

        if (!user) {

            console.warn(
                "No logged-in user found."
            );


            // =====================================
            // SEND USER TO LOGIN PAGE
            // =====================================

            window.location.href =
                "login.html";


            return;

        }


        // =====================================
        // SAVE CURRENT LOGGED-IN USER
        // =====================================

        window.currentRioUser =
            user;


        // =====================================
        // DEBUG LOGIN UID
        // =====================================

        console.log(
            "LOGIN UID:",
            user.uid
        );


        try {

            // =====================================
            // LOAD CUSTOMER PROFILE
            // =====================================

            await loadCustomerData(
                user
            );


            // =====================================
            // LOAD STAMP DATA
            // =====================================

            await loadStampData(
                user
            );


            // =====================================
            // LOAD 40-DAY COUNTDOWN
            // =====================================

            await loadCountdownData(
                user
            );


            // =====================================
            // FINAL SUCCESS LOG
            // =====================================

            console.log(
                "================================"
            );


            console.log(
                "🍜 Rio Maggi Point"
            );


            console.log(
                "Premium Loyalty Card Loaded Successfully"
            );


            console.log(
                "Customer UID:",
                user.uid
            );


            console.log(
                "================================"
            );

        }

        catch (error) {

            console.error(
                "Premium Loyalty Card initialization failed:",
                error
            );

        }

    }

);


// =====================================
// FINAL CARD.JS READY MESSAGE
// =====================================

console.log(
    "Rio Maggi Point Premium Loyalty Card System Ready"
);


// =====================================
// END OF CARD.JS
// =====================================
