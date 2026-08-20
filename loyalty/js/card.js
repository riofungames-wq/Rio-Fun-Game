// =====================================
// RIO MAGGI POINT
// CARD.JS
// FINAL CUSTOMER CARD SYSTEM
// FIREBASE + LOYALTY + NAVIGATION
// =====================================


// =====================================
// FIREBASE IMPORTS
// =====================================

import {
    db,
    auth
} from "./firebase-config.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================
// CONSTANTS
// =====================================

const TOTAL_STAMPS = 6;
const STAMP_RESET_DAYS = 40;

const CUSTOMER_PHONE = "917987827979";
const CUSTOMER_PHONE_TEL = "+917987827979";


// =====================================
// GLOBAL STATE
// =====================================

let rioCustomerCache = null;
let isCardInitialized = false;
let countdownInterval = null;

window.currentRioUser = null;
window.rioCurrentStamps = 0;
window.rioCountdownDays = STAMP_RESET_DAYS;
window.rioMemberSince = null;
window.rioCustomerMobile = null;


// =====================================
// FIREBASE CHECK
// =====================================

if (!db) {
    console.error("❌ CARD.JS Firestore Missing");
} else {
    console.log("✅ CARD.JS Firestore Connected");
}


// =====================================
// DOM READY
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    setupGameButton();
    setupCallButton();
    setupWhatsAppButton();
    setupMapButton();
    setupDeliveryButton();

    setupBottomNavigation();

    setupNotificationButton();

});


// =====================================
// SAFE NAVIGATION
// =====================================

function navigateTo(path) {

    if (!path) return;

    window.location.href = path;

}


// =====================================
// GAME BUTTON
// =====================================

function setupGameButton() {

    const button = document.getElementById("gameLink");

    if (!button) return;

    button.addEventListener("click", () => {

        button.classList.add("game-button-clicked");

        setTimeout(() => {

            button.classList.remove("game-button-clicked");

        }, 300);

        navigateTo("../index.html");

    });

}


// =====================================
// CALL BUTTON
// =====================================

function setupCallButton() {

    const button = document.getElementById("callBtn");

    if (!button) return;

    button.addEventListener("click", () => {

        window.location.href =
            "tel:" + CUSTOMER_PHONE_TEL;

    });

}


// =====================================
// WHATSAPP BUTTON
// =====================================

function setupWhatsAppButton() {

    const button = document.getElementById("whatsappBtn");

    if (!button) return;

    button.addEventListener("click", () => {

        const message = encodeURIComponent(
            "Hello Rio Maggi Point, I want to know more about the loyalty program."
        );

        window.open(
            "https://wa.me/" +
            CUSTOMER_PHONE +
            "?text=" +
            message,
            "_blank",
            "noopener,noreferrer"
        );

    });

}


// =====================================
// MAP BUTTON
// =====================================

function setupMapButton() {

    const button = document.getElementById("mapBtn");

    if (!button) return;

    button.addEventListener("click", () => {

        showComingSoonMessage(
            "Google Maps location is coming soon."
        );

    });

}


// =====================================
// DELIVERY BUTTON
// =====================================

function setupDeliveryButton() {

    const button = document.getElementById("deliveryBtn");

    if (!button) return;

    button.addEventListener("click", () => {

        showComingSoonMessage(
            "Delivery service is coming soon."
        );

    });

}


// =====================================
// NOTIFICATION BUTTON
// =====================================

function setupNotificationButton() {

    const button =
        document.querySelector(
            ".notification-btn"
        );

    if (!button) return;

    button.addEventListener("click", () => {

        const target =
            document.getElementById(
                "announcements"
            ) ||
            document.querySelector(
                ".announcement-list"
            );

        if (target) {

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            return;

        }

        showComingSoonMessage(
            "No new announcements right now."
        );

    });

}


// =====================================
// BOTTOM NAVIGATION
// FINAL ORDER:
//
// HOME
// PROFILE
// QR
// HISTORY
// FEEDBACK
// CHAT
// =====================================

function setupBottomNavigation() {

    const items =
        document.querySelectorAll(
            ".bottom-nav-item"
        );

    if (!items.length) return;

    items.forEach((item) => {

        item.addEventListener("click", (event) => {

            const href =
                item.getAttribute("href");

            const action =
                item.dataset.action ||
                item.dataset.nav;

            // QR action
            if (
                action === "qr" ||
                item.classList.contains("bottom-nav-qr")
            ) {

                event.preventDefault();

                handleQRNavigation(item);

                return;

            }

            // Internal section navigation
            if (
                href &&
                href.startsWith("#")
            ) {

                event.preventDefault();

                const target =
                    document.querySelector(
                        href
                    );

                if (target) {

                    setActiveNavigation(item);

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

                return;

            }

            // Normal page navigation
            if (href) {

                setActiveNavigation(item);

            }

        });

    });

}


// =====================================
// ACTIVE NAVIGATION
// =====================================

function setActiveNavigation(activeItem) {

    document
        .querySelectorAll(
            ".bottom-nav-item"
        )
        .forEach((item) => {

            item.classList.remove("active");

        });

    if (activeItem) {

        activeItem.classList.add("active");

    }

}


// =====================================
// QR NAVIGATION
// =====================================

function handleQRNavigation(item) {

    setActiveNavigation(item);

    const qrTarget =
        document.getElementById("qrSection") ||
        document.getElementById("customerQR") ||
        document.querySelector("[data-qr-section]");

    if (qrTarget) {

        qrTarget.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;

    }

    // If QR page exists in HTML/project,
    // use the page instead of throwing an error.

    const qrPage =
        item.getAttribute("href");

    if (
        qrPage &&
        qrPage !== "#" &&
        qrPage !== "javascript:void(0)"
    ) {

        window.location.href = qrPage;

        return;

    }

    showComingSoonMessage(
        "Customer QR is ready from your profile."
    );

}


// =====================================
// COMING SOON MESSAGE
// =====================================

function showComingSoonMessage(message) {

    if (
        typeof window.showToast === "function"
    ) {

        window.showToast(message);

        return;

    }

    alert(message);

}


// =====================================
// CUSTOMER FIRESTORE FETCH
// customers/{uid}
// =====================================

async function getCustomerDocument(user) {

    try {

        if (
            !user ||
            !user.uid
        ) {

            throw new Error(
                "Invalid Firebase User"
            );

        }

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

            console.warn(
                "⚠️ Customer document not found"
            );

            return null;

        }

        return {

            ref: customerRef,

            data: snapshot.data()

        };

    }
    catch (error) {

        console.error(
            "❌ Customer Fetch Error:",
            error
        );

        return null;

    }

}


// =====================================
// STAMP COUNT
// =====================================

function getStampCount(data) {

    let count =
        Number(
            data?.stamps ??
            data?.currentStamps ??
            0
        );

    if (
        !Number.isFinite(count)
    ) {

        count = 0;

    }

    return Math.max(
        0,
        Math.min(
            count,
            TOTAL_STAMPS
        )
    );

}


// =====================================
// FIREBASE DATE CONVERTER
// =====================================

function parseFirebaseDate(value) {

    try {

        if (!value) {
            return null;
        }

        if (
            typeof value.toDate === "function"
        ) {

            return value.toDate();

        }

        if (
            value instanceof Date
        ) {

            return value;

        }

        if (
            typeof value === "object" &&
            value.seconds !== undefined
        ) {

            return new Date(
                Number(value.seconds) * 1000
            );

        }

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
            "❌ Date Convert Error:",
            error
        );

        return null;

    }

}


// =====================================
// GET STAMP DATES
// =====================================

function getValidStampDates(data) {

    if (
        !Array.isArray(
            data?.stampDates
        )
    ) {

        return [];

    }

    return data.stampDates
        .slice(0, TOTAL_STAMPS)
        .map(parseFirebaseDate)
        .filter(Boolean);

}


// =====================================
// LAST STAMP DATE
// =====================================

function getLastStampDate(data) {

    if (
        data?.lastStampDate
    ) {

        const date =
            parseFirebaseDate(
                data.lastStampDate
            );

        if (date) {

            return date;

        }

    }

    const dates =
        getValidStampDates(
            data
        );

    if (!dates.length) {

        return null;

    }

    return dates[
        dates.length - 1
    ];

}


// =====================================
// CALENDAR DAY DIFFERENCE
// MIDNIGHT SAFE
// =====================================

function calculateCalendarDaysPassed(date) {

    if (!date) {
        return 0;
    }

    const now =
        new Date();

    const today =
        Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

    const old =
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

    return Math.floor(
        (today - old) /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

}


// =====================================
// 40 DAY LOYALTY RESET
// =====================================

async function resetExpiredCycleIfNeeded(
    customerRef,
    data
) {

    const stamps =
        getStampCount(data);

    // Reward already unlocked.
    // Do NOT reset it automatically.
    if (
        stamps >= TOTAL_STAMPS
    ) {

        return {
            data,
            reset: false
        };

    }

    const lastStamp =
        getLastStampDate(data);

    if (!lastStamp) {

        return {
            data,
            reset: false
        };

    }

    const passedDays =
        calculateCalendarDaysPassed(
            lastStamp
        );

    if (
        passedDays < STAMP_RESET_DAYS
    ) {

        return {
            data,
            reset: false
        };

    }

    const resetData = {

        stamps: 0,

        currentStamps: 0,

        stampDates: [],

        rewardUnlocked: false,

        reward: false,

        rewardRedeemed: false

    };

    try {

        await updateDoc(
            customerRef,
            resetData
        );

        console.log(
            "✅ 40 Day Loyalty Cycle Reset"
        );

        return {

            data: {
                ...data,
                ...resetData
            },

            reset: true

        };

    }
    catch (error) {

        console.error(
            "❌ Reset Error:",
            error
        );

        return {

            data,

            reset: false

        };

    }

}


// =====================================
// RENDER CUSTOMER PROFILE
// =====================================

function renderCustomerData(
    user,
    data
) {

    const name =
        document.getElementById(
            "customerName"
        );

    if (name) {

        name.textContent =
            data?.name ||
            user?.displayName ||
            "Rio Customer";

    }


    const member =
        document.getElementById(
            "memberId"
        );

    if (member) {

        member.textContent =
            data?.memberId ||
            (
                "RIO-" +
                user.uid
                    .slice(0, 10)
                    .toUpperCase()
            );

    }


    const photo =
        document.getElementById(
            "customerPhoto"
        );

    if (photo) {

        photo.src =
            data?.avatar ||
            data?.photoURL ||
            user?.photoURL ||
            "assets/avatars/default-avatar.png";

        photo.onerror = () => {

            photo.onerror = null;

            photo.src =
                "assets/avatars/default-avatar.png";

        };

    }


    window.rioMemberSince =
        data?.createdAt ||
        null;


    window.rioCustomerMobile =
        data?.mobile ||
        data?.phone ||
        null;

}


// =====================================
// RENDER STAMP SYSTEM
// =====================================

function renderStampData(data) {

    const stamps =
        getStampCount(data);

    const dates =
        getValidStampDates(data);

    for (
        let i = 1;
        i <= TOTAL_STAMPS;
        i++
    ) {

        const circle =
            document.getElementById(
                "stamp" + i
            );

        if (!circle) {
            continue;
        }

        if (
            i <= stamps
        ) {

            circle.classList.add(
                "active"
            );

            circle.innerHTML =
                `
                <i class="fa-solid fa-check"></i>
                `;

        }
        else {

            circle.classList.remove(
                "active"
            );

            circle.innerHTML =
                `
                <span>${i}</span>
                `;

        }


        const dateElement =
            document.getElementById(
                "stampDate" + i
            );

        if (dateElement) {

            dateElement.textContent =
                dates[i - 1]
                    ? dates[i - 1]
                        .toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short"
                            }
                        )
                    : "--";

        }

    }

    window.rioCurrentStamps =
        stamps;

    updateRewardStatus(
        stamps
    );

}


// =====================================
// REWARD STATUS
// =====================================

function updateRewardStatus(stamps) {

    const reward =
        document.getElementById(
            "rewardCircle"
        );

    const unlocked =
        stamps >= TOTAL_STAMPS;


    if (reward) {

        reward.classList.toggle(
            "active",
            unlocked
        );

        reward.classList.toggle(
            "reward-unlocked",
            unlocked
        );

    }


    const text =
        document.getElementById(
            "rewardStatus"
        );

    if (text) {

        text.textContent =
            unlocked
                ? "FREE VEG MAGGI READY"
                : "Collect 6 stamps within 40 days";

    }


    const rewardButton =
        document.getElementById(
            "rewardButton"
        ) ||
        document.querySelector(
            ".reward-locked-btn"
        );

    if (rewardButton) {

        rewardButton.disabled =
            !unlocked;

        rewardButton.classList.toggle(
            "reward-unlocked",
            unlocked
        );

    }

}


// =====================================
// COUNTDOWN DISPLAY
// =====================================

function updateLocalCountdown(data) {

    const element =
        document.getElementById(
            "countdownDays"
        );

    const stamps =
        getStampCount(data);

    if (
        stamps >= TOTAL_STAMPS
    ) {

        window.rioCountdownDays = 0;

        if (element) {

            element.textContent =
                "REWARD READY";

        }

        return;

    }

    const lastStamp =
        getLastStampDate(data);

    let days =
        STAMP_RESET_DAYS;

    if (lastStamp) {

        days =
            Math.max(
                0,
                STAMP_RESET_DAYS -
                calculateCalendarDaysPassed(
                    lastStamp
                )
            );

    }

    window.rioCountdownDays =
        days;

    if (element) {

        element.textContent =
            days +
            (
                days === 1
                    ? " DAY"
                    : " DAYS"
            );

    }

}


// =====================================
// LOAD CUSTOMER CARD DATA
// =====================================

async function loadCardData(user) {

    const customer =
        await getCustomerDocument(
            user
        );

    if (!customer) {

        console.warn(
            "⚠️ No Customer Data Found"
        );

        return;

    }

    let data =
        customer.data;

    const cycle =
        await resetExpiredCycleIfNeeded(
            customer.ref,
            data
        );

    data =
        cycle.data;

    rioCustomerCache =
        data;

    renderCustomerData(
        user,
        data
    );

    renderStampData(
        data
    );

    updateLocalCountdown(
        data
    );

    console.log(
        "🍜 Rio Customer Dashboard Loaded"
    );

}


// =====================================
// COUNTDOWN TIMER
// =====================================

function startCountdownTimer() {

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }

    countdownInterval =
        setInterval(
            () => {

                if (
                    rioCustomerCache
                ) {

                    updateLocalCountdown(
                        rioCustomerCache
                    );

                }

            },
            60000
        );

}


// =====================================
// STOP TIMER
// =====================================

function stopCountdownTimer() {

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

        countdownInterval = null;

    }

}


// =====================================
// FIREBASE AUTH LISTENER
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.currentRioUser =
                null;

            rioCustomerCache =
                null;

            isCardInitialized =
                false;

            stopCountdownTimer();

            if (
                !location.pathname.includes(
                    "login.html"
                )
            ) {

                location.href =
                    "login.html";

            }

            return;

        }


        window.currentRioUser =
            user;


        if (
            isCardInitialized
        ) {

            return;

        }


        isCardInitialized =
            true;


        await loadCardData(
            user
        );


        startCountdownTimer();


        console.log(
            "🍜 RIO MAGGI POINT CARD READY"
        );

    }
);


// =====================================
// GLOBAL RELOAD FUNCTION
// =====================================

window.reloadRioCard =
    async function () {

        if (
            window.currentRioUser
        ) {

            await loadCardData(
                window.currentRioUser
            );

            console.log(
                "🔄 Card Reloaded"
            );

        }

    };


// =====================================
// GLOBAL CARD DATA ACCESS
// =====================================

window.getRioCardState =
    function () {

        return {

            user:
                window.currentRioUser,

            customer:
                rioCustomerCache,

            stamps:
                window.rioCurrentStamps,

            countdownDays:
                window.rioCountdownDays

        };

    };


// =====================================
// FINAL READY LOG
// =====================================

console.log(
    "✅ CARD.JS FINAL VERSION LOADED"
);
