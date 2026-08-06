// =====================================
// FIREBASE IMPORTS & CONFIGURATION
// =====================================
import { db, auth } from "./firebase-config.js";
import { 
    doc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Global Constants
const TOTAL_STAMPS = 6;
const STAMP_RESET_DAYS = 40;
const CUSTOMER_PHONE = "917987827979"; // Real WhatsApp Number
const CUSTOMER_PHONE_TEL = "+917987827979"; // Real Call Number

// Global Runtime Variables
let rioCustomerCache = null;
let isCardInitialized = false;
let countdownInterval = null;

// Expose Global State
window.currentRioUser = null;
window.rioCurrentStamps = 0;
window.rioCountdownDays = STAMP_RESET_DAYS;
window.rioMemberSince = null;
window.rioCustomerMobile = null;

// =====================================
// DOM INITIALIZATION & EVENT LISTENERS
// =====================================
document.addEventListener("DOMContentLoaded", () => {
    setupGameButton();
    setupCallButton();
    setupWhatsAppButton();
    setupMapButton();
    setupDeliveryButton();
});

// =====================================
// BUTTON SYSTEM
// =====================================
function setupGameButton() {
    const gameButton = document.getElementById("gameLink");
    if (!gameButton) return;
    
    gameButton.addEventListener("click", () => {
        gameButton.classList.add("game-button-clicked");
        setTimeout(() => {
            gameButton.classList.remove("game-button-clicked");
        }, 300);
        window.location.href = "../index.html";
    });
}

function setupCallButton() {
    const callButton = document.getElementById("callBtn");
    if (!callButton) return;
    
    callButton.addEventListener("click", () => {
        window.location.href = "tel:" + CUSTOMER_PHONE_TEL;
    });
}

function setupWhatsAppButton() {
    const whatsappButton = document.getElementById("whatsappBtn");
    if (!whatsappButton) return;
    
    whatsappButton.addEventListener("click", () => {
        const message = encodeURIComponent("Hello Rio Maggi Point, I want to know more about the loyalty program.");
        const whatsappURL = "https://wa.me/" + CUSTOMER_PHONE + "?text=" + message;
        window.open(whatsappURL, "_blank", "noopener,noreferrer");
    });
}

function setupMapButton() {
    const mapButton = document.getElementById("mapBtn");
    if (!mapButton) return;
    
    mapButton.addEventListener("click", () => {
        showComingSoonMessage("Google Maps location is coming soon.");
    });
}

function setupDeliveryButton() {
    const deliveryButton = document.getElementById("deliveryBtn");
    if (!deliveryButton) return;
    
    deliveryButton.addEventListener("click", () => {
        showComingSoonMessage("Delivery service is coming soon.");
    });
}

function showComingSoonMessage(message) {
    if (typeof window.showToast === "function") {
        window.showToast(message);
        return;
    }
    alert(message);
}

// =====================================
// FIRESTORE CUSTOMER DOCUMENT
// =====================================
async function getCustomerDocument(user) {
    try {
        if (!user || !user.uid) {
            throw new Error("Invalid Firebase User");
        }
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);
        
        if (!userSnapshot.exists()) {
            return null;
        }
        return {
            ref: userRef,
            data: userSnapshot.data()
        };
    } catch (error) {
        console.error("Error fetching customer document:", error);
        return null;
    }
}

// =====================================
// STAMP COUNT VALIDATION & PARSING
// =====================================
function getStampCount(userData) {
    let count = Number(userData.stamps ?? userData.currentStamps ?? 0);
    if (!Number.isFinite(count)) {
        count = 0;
    }
    return Math.max(0, Math.min(count, TOTAL_STAMPS));
}

function parseFirebaseDate(value) {
    try {
        if (!value) return null;
        if (typeof value.toDate === "function") {
            return value.toDate();
        }
        if (value instanceof Date) {
            return value;
        }
        if (typeof value === "object" && value.seconds !== undefined) {
            return new Date(value.seconds * 1000);
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        console.error("Date parsing error:", error);
        return null;
    }
}

function getValidStampDates(stampDates) {
    if (!Array.isArray(stampDates)) {
        return [];
    }
    return stampDates.slice(0, TOTAL_STAMPS).map(parseFirebaseDate).filter(Boolean);
}

function getLastStampDate(userData) {
    const dates = getValidStampDates(userData.stampDates);
    if (dates.length === 0) {
        return null;
    }
    return dates[dates.length - 1];
}

// Fixed: Strict Calendar Day Calculation (Midnight Alignment)
function calculateCalendarDaysPassed(date) {
    if (!date) return 0;
    const now = new Date();
    const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    return Math.floor(Math.max(0, utcNow - utcDate) / (1000 * 60 * 60 * 24));
}

// =====================================
// CHECK 40 DAY EXPIRY LOGIC
// =====================================
async function resetExpiredCycleIfNeeded(userRef, userData) {
    const stamps = getStampCount(userData);
    
    // Unlocked reward stays until claimed
    if (stamps >= TOTAL_STAMPS) {
        return { data: userData, reset: false };
    }

    const lastStamp = getLastStampDate(userData);
    if (!lastStamp) {
        return { data: userData, reset: false };
    }

    const daysPassed = calculateCalendarDaysPassed(lastStamp);
    if (daysPassed < STAMP_RESET_DAYS) {
        return { data: userData, reset: false };
    }

    const resetData = {
        stamps: 0,
        currentStamps: 0,
        stampDates: [],
        rewardUnlocked: false
    };

    try {
        await updateDoc(userRef, resetData);
        console.log("40-day calendar loyalty cycle reset executed");
        return {
            data: { ...userData, ...resetData },
            reset: true
        };
    } catch (error) {
        console.error("Error resetting cycle:", error);
        return { data: userData, reset: false };
    }
}

// =====================================
// RENDER CUSTOMER PROFILE & STAMPS
// =====================================
function renderCustomerData(user, userData) {
    const nameElement = document.getElementById("customerName");
    if (nameElement) {
        nameElement.textContent = userData.name || userData.fullName || user.displayName || "Rio Customer";
    }

    const memberElement = document.getElementById("memberId");
    if (memberElement) {
        memberElement.textContent = userData.memberId || ("RIO-" + user.uid.slice(0, 10).toUpperCase());
    }

    const photo = document.getElementById("customerPhoto");
    if (photo && (userData.photoURL || user.photoURL)) {
        photo.src = userData.photoURL || user.photoURL;
    }

    window.rioMemberSince = userData.memberSince || null;
    window.rioCustomerMobile = userData.mobile || null;
}

function renderStampData(userData) {
    const stampCount = getStampCount(userData);
    const dates = getValidStampDates(userData.stampDates);

    for (let i = 1; i <= TOTAL_STAMPS; i++) {
        const circle = document.getElementById("stamp" + i);
        if (!circle) continue;

        if (i <= stampCount) {
            circle.classList.add("active");
            circle.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else {
            circle.classList.remove("active");
            circle.innerHTML = "<span>" + i + "</span>";
        }

        const dateElement = document.getElementById("stampDate" + i);
        if (dateElement) {
            dateElement.textContent = dates[i - 1] ? dates[i - 1].toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short"
            }) : "--";
        }
    }

    window.rioCurrentStamps = stampCount;
    updateRewardStatus(stampCount);
}

function updateRewardStatus(stamps) {
    const reward = document.getElementById("rewardCircle");
    if (!reward) return;
    
    const unlocked = stamps >= TOTAL_STAMPS;
    reward.classList.toggle("active", unlocked);
    reward.classList.toggle("reward-unlocked", unlocked);
}

function updateLocalCountdown(userData) {
    const stamps = getStampCount(userData);
    const element = document.getElementById("countdownDays");
    
    if (stamps >= TOTAL_STAMPS) {
        window.rioCountdownDays = 0;
        if (element) {
            element.textContent = "REWARD READY";
        }
        return;
    }

    const lastStamp = getLastStampDate(userData);
    let days = STAMP_RESET_DAYS;

    if (lastStamp) {
        days = Math.max(0, STAMP_RESET_DAYS - calculateCalendarDaysPassed(lastStamp));
    }

    window.rioCountdownDays = days;
    if (element) {
        element.textContent = days + (days === 1 ? " DAY" : " DAYS");
    }
}

// =====================================
// DATA LOADING & REFRESH SYSTEM
// =====================================
async function loadCardData(user) {
    const customer = await getCustomerDocument(user);
    if (!customer) {
        console.warn("Customer document not found in Firestore");
        return;
    }

    let userData = customer.data;
    const cycle = await resetExpiredCycleIfNeeded(customer.ref, userData);
    userData = cycle.data;

    rioCustomerCache = userData;
    renderCustomerData(user, userData);
    renderStampData(userData);
    updateLocalCountdown(userData);
}

function startCountdownTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(() => {
        if (rioCustomerCache) {
            updateLocalCountdown(rioCustomerCache);
        }
    }, 60000);
}

function stopCountdownTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// =====================================
// FIREBASE AUTH LISTENER
// =====================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.currentRioUser = null;
        stopCountdownTimer();
        if (!location.pathname.includes("login.html")) {
            location.href = "login.html";
        }
        return;
    }

    window.currentRioUser = user;
    if (isCardInitialized) return;

    isCardInitialized = true;
    await loadCardData(user);
    startCountdownTimer();
    console.log("Rio Maggi Point Digital Card Ready");
});
