// =====================================================
// RIO MAGGI POINT
// CUSTOMER LOYALTY CARD
// CARD.JS
// FINAL FIXED FIREBASE VERSION
// =====================================================

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// CONFIGURATION
// =====================================================

const TOTAL_STAMPS = 6;
const STAMP_RESET_DAYS = 40;

const SHOP_PHONE = "7987827979";
const SHOP_WHATSAPP = "917987827979";

const DEFAULT_AVATAR =
    "assets/default-avatar.png";


// =====================================================
// GLOBAL STATE
// =====================================================

window.currentRioUser = null;
window.currentRioCustomer = null;

let currentCustomerData = null;
let countdownTimer = null;


// =====================================================
// DOM ELEMENTS
// =====================================================

const pageLoader =
    document.getElementById("pageLoader");

const customerPhoto =
    document.getElementById("loyaltyCustomerPhoto");

const customerName =
    document.getElementById("loyaltyCustomerName");

const welcomeUserName =
    document.getElementById("welcomeUserName");

const welcomeMessage =
    document.getElementById("welcomeMessage");

const memberSinceDate =
    document.getElementById("memberSinceDate");

const stampCountText =
    document.getElementById("stampCountText");

const stampProgressBar =
    document.getElementById("stampProgressBar");

const stampProgressText =
    document.getElementById("stampProgressText");

const stampContainer =
    document.getElementById("stampContainer");

const rewardStatus =
    document.getElementById("rewardStatus");

const claimRewardBtn =
    document.getElementById("claimRewardBtn");

const freeGameBtn =
    document.getElementById("freeGameBtn");

const freeGamePromoBtn =
    document.getElementById("freeGamePromoBtn");

const callShopBtn =
    document.getElementById("callShopBtn");

const whatsappShopBtn =
    document.getElementById("whatsappShopBtn");

const mapShopBtn =
    document.getElementById("mapShopBtn");


// =====================================================
// SAFE NUMBER
// =====================================================

function getSafeStampCount(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            TOTAL_STAMPS,
            Math.floor(number)
        )
    );
}


// =====================================================
// PARSE FIREBASE DATE
// =====================================================

function parseFirebaseDate(value) {

    if (!value) {
        return null;
    }

    try {

        // Firebase Timestamp
        if (
            typeof value.toDate === "function"
        ) {

            const date =
                value.toDate();

            return Number.isNaN(
                date.getTime()
            )
                ? null
                : date;
        }


        // Serialized Firebase Timestamp
        if (
            typeof value === "object" &&
            value.seconds !== undefined
        ) {

            const milliseconds =
                Number(value.seconds) * 1000 +
                Math.floor(
                    Number(
                        value.nanoseconds || 0
                    ) / 1000000
                );

            const date =
                new Date(milliseconds);

            return Number.isNaN(
                date.getTime()
            )
                ? null
                : date;
        }


        // Date object
        if (
            value instanceof Date
        ) {

            return Number.isNaN(
                value.getTime()
            )
                ? null
                : value;
        }


        // String / Number
        const date =
            new Date(value);

        return Number.isNaN(
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


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(value) {

    const date =
        parseFirebaseDate(value);

    if (!date) {
        return "--";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// GET CUSTOMER CYCLE START DATE
// =====================================================
//
// IMPORTANT:
// 40-day validity starts from the FIRST stamp
// of the current incomplete cycle.
//
// Example:
// First stamp: 1 August
// Cycle expires: 10 September
//
// After expiry:
// stamps reset to 0
//
// =====================================================

function getCycleStartDate(customer) {

    const stampDates =
        Array.isArray(customer.stampDates)
            ? customer.stampDates
            : [];


    if (!stampDates.length) {
        return null;
    }


    const firstStampDate =
        parseFirebaseDate(
            stampDates[0]
        );


    return firstStampDate;

}


// =====================================================
// CHECK CYCLE EXPIRATION
// =====================================================

function isCycleExpired(
    customer,
    stampCount
) {

    // Complete 6-stamp cycle does NOT expire.
    if (
        stampCount >= TOTAL_STAMPS
    ) {

        return false;

    }


    // No stamps means no active cycle.
    if (
        stampCount <= 0
    ) {

        return false;

    }


    const cycleStart =
        getCycleStartDate(
            customer
        );


    if (!cycleStart) {
        return false;
    }


    const now =
        new Date();


    const expiryTime =
        cycleStart.getTime() +
        (
            STAMP_RESET_DAYS *
            24 *
            60 *
            60 *
            1000
        );


    return (
        now.getTime() >=
        expiryTime
    );

}


// =====================================================
// RESET EXPIRED CYCLE
// =====================================================

async function resetExpiredCycle(
    user,
    customer,
    stampCount
) {

    if (
        !isCycleExpired(
            customer,
            stampCount
        )
    ) {

        return {
            reset: false,
            stampCount
        };

    }


    console.warn(
        "40-day loyalty cycle expired. Resetting stamps."
    );


    const customerRef =
        doc(
            db,
            "customers",
            user.uid
        );


    await updateDoc(

        customerRef,

        {

            stamps: 0,

            currentStamps: 0,

            stampDates: [],

            reward: false,

            rewardUnlocked: false,

            rewardRedeemed: false,

            updatedAt:
                serverTimestamp()

        }

    );


    // Update local state
    customer.stamps = 0;
    customer.currentStamps = 0;
    customer.stampDates = [];
    customer.reward = false;
    customer.rewardUnlocked = false;
    customer.rewardRedeemed = false;


    return {
        reset: true,
        stampCount: 0
    };

}


// =====================================================
// LOAD CUSTOMER DATA
// =====================================================

async function loadCustomerData(user) {

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


    if (
        !customerSnap.exists()
    ) {

        throw new Error(
            "Customer record not found."
        );

    }


    const customer =
        customerSnap.data();


    // =================================================
    // ACCOUNT STATUS
    // =================================================

    if (
        customer.status === "blocked"
    ) {

        alert(
            "Your account has been blocked."
        );

        await signOut(auth);

        window.location.href =
            "login.html";

        return null;

    }


    if (
        customer.status === "suspended"
    ) {

        alert(
            "Your account has been suspended."
        );

        await signOut(auth);

        window.location.href =
            "login.html";

        return null;

    }


    currentCustomerData =
        customer;

    window.currentRioCustomer =
        customer;


    // =================================================
    // CUSTOMER NAME
    // =================================================

    const name =
        customer.name ||
        customer.fullName ||
        user.displayName ||
        "Rio Maggi Member";


    if (customerName) {

        customerName.textContent =
            name;

    }


    if (welcomeUserName) {

        welcomeUserName.textContent =
            name;

    }


    // =================================================
    // WELCOME MESSAGE
    // =================================================

    if (welcomeMessage) {

        welcomeMessage.textContent =
            "Keep collecting stamps and enjoy your reward.";

    }


    // =================================================
    // CUSTOMER PHOTO
    // =================================================

    const photo =
        customer.photoURL ||
        customer.avatar ||
        customer.photo ||
        DEFAULT_AVATAR;


    if (customerPhoto) {

        customerPhoto.src =
            photo;

    }


    // =================================================
    // MEMBER SINCE
    // =================================================

    if (memberSinceDate) {

        memberSinceDate.textContent =
            formatDate(
                customer.memberSince ||
                customer.createdAt
            );

    }


    // =================================================
    // STAMPS
    // =================================================

    let stampCount =
        getSafeStampCount(

            customer.currentStamps ??
            customer.stamps ??
            0

        );


    // =================================================
    // CHECK 40-DAY EXPIRATION
    // =================================================

    const cycleResult =
        await resetExpiredCycle(

            user,

            customer,

            stampCount

        );


    if (
        cycleResult.reset
    ) {

        stampCount = 0;

    }


    // =================================================
    // UPDATE UI
    // =================================================

    updateStampUI(

        stampCount,

        customer

    );


    // =================================================
    // GLOBAL DATA
    // =================================================

    window.rioCurrentStamps =
        stampCount;


    console.log(
        "Customer profile loaded:",
        customer.memberId || user.uid
    );


    return customer;

}


// =====================================================
// UPDATE STAMP UI
// =====================================================

function updateStampUI(
    stampCount,
    customer
) {

    const safeCount =
        getSafeStampCount(
            stampCount
        );


    // =================================================
    // STAMP COUNT
    // =================================================

    if (stampCountText) {

        stampCountText.textContent =
            `${safeCount}/${TOTAL_STAMPS}`;

    }


    // =================================================
    // PROGRESS BAR
    // =================================================

    if (stampProgressBar) {

        const percentage =
            (
                safeCount /
                TOTAL_STAMPS
            ) * 100;


        stampProgressBar.style.width =
            `${percentage}%`;

    }


    // =================================================
    // PROGRESS TEXT
    // =================================================

    if (stampProgressText) {

        stampProgressText.textContent =
            `${safeCount} of ${TOTAL_STAMPS} stamps collected`;

    }


    // =================================================
    // STAMP BOXES
    // =================================================

    if (stampContainer) {

        const stampBoxes =
            stampContainer.querySelectorAll(
                ".stamp-box"
            );


        stampBoxes.forEach(

            (box) => {

                const stampNumber =
                    Number(
                        box.dataset.stamp
                    );


                const collected =
                    stampNumber <=
                    safeCount;


                box.classList.toggle(
                    "stamp-collected",
                    collected
                );


                box.setAttribute(
                    "aria-label",

                    collected

                        ? `Stamp ${stampNumber} collected`

                        : `Stamp ${stampNumber} not collected`

                );

            }

        );

    }


    // =================================================
    // REWARD UI
    // =================================================

    const rewardUnlocked =
        safeCount >= TOTAL_STAMPS;


    const rewardRedeemed =
        customer?.rewardRedeemed === true;


    updateRewardUI(

        rewardUnlocked,

        rewardRedeemed

    );

}


// =====================================================
// REWARD UI
// =====================================================

function updateRewardUI(
    rewardUnlocked,
    rewardRedeemed
) {


    // =================================================
    // ALREADY REDEEMED
    // =================================================

    if (rewardRedeemed) {

        if (rewardStatus) {

            rewardStatus.classList.add(
                "reward-unlocked"
            );


            rewardStatus.innerHTML = `

                <div class="reward-status-icon">

                    <i class="fa-solid fa-check"></i>

                </div>

                <div class="reward-status-content">

                    <strong>
                        Reward Redeemed
                    </strong>

                    <span>
                        Your FREE Veg Maggi reward has already been redeemed.
                    </span>

                </div>

            `;

        }


        if (claimRewardBtn) {

            claimRewardBtn.disabled =
                true;


            claimRewardBtn.classList.remove(
                "reward-locked-btn"
            );


            claimRewardBtn.classList.add(
                "reward-unlocked-btn"
            );


            claimRewardBtn.innerHTML = `

                <i class="fa-solid fa-check"></i>

                <span>
                    Reward Redeemed
                </span>

            `;

        }


        return;

    }


    // =================================================
    // REWARD UNLOCKED
    // =================================================

    if (rewardUnlocked) {

        if (rewardStatus) {

            rewardStatus.classList.add(
                "reward-unlocked"
            );


            rewardStatus.innerHTML = `

                <div class="reward-status-icon">

                    <i class="fa-solid fa-gift"></i>

                </div>

                <div class="reward-status-content">

                    <strong>
                        Reward Unlocked!
                    </strong>

                    <span>
                        Your FREE Veg Maggi reward is ready.
                    </span>

                </div>

            `;

        }


        if (claimRewardBtn) {

            claimRewardBtn.disabled =
                false;


            claimRewardBtn.classList.remove(
                "reward-locked-btn"
            );


            claimRewardBtn.classList.add(
                "reward-unlocked-btn"
            );


            claimRewardBtn.innerHTML = `

                <i class="fa-solid fa-gift"></i>

                <span>
                    Claim FREE Veg Maggi
                </span>

            `;

        }


        return;

    }


    // =================================================
    // REWARD LOCKED
    // =================================================

    if (rewardStatus) {

        rewardStatus.classList.remove(
            "reward-unlocked"
        );


        rewardStatus.innerHTML = `

            <div class="reward-status-icon">

                <i class="fa-solid fa-lock"></i>

            </div>

            <div class="reward-status-content">

                <strong>
                    Reward Locked
                </strong>

                <span>
                    Collect all 6 stamps to unlock your FREE Veg Maggi.
                </span>

            </div>

        `;

    }


    if (claimRewardBtn) {

        claimRewardBtn.disabled =
            true;


        claimRewardBtn.classList.add(
            "reward-locked-btn"
        );


        claimRewardBtn.classList.remove(
            "reward-unlocked-btn"
        );


        claimRewardBtn.innerHTML = `

            <i class="fa-solid fa-lock"></i>

            <span>
                Collect 6 Stamps to Unlock
            </span>

        `;

    }

}


// =====================================================
// CLAIM REWARD
// =====================================================
//
// IMPORTANT:
// This only marks the reward as requested.
// Actual redemption should be confirmed by Admin.
//
// =====================================================

async function claimReward() {

    if (
        !window.currentRioUser ||
        !currentCustomerData
    ) {

        return;

    }


    const stampCount =
        getSafeStampCount(

            currentCustomerData.currentStamps ??
            currentCustomerData.stamps ??
            0

        );


    if (
        stampCount <
        TOTAL_STAMPS
    ) {

        return;

    }


    if (
        currentCustomerData.rewardRedeemed === true
    ) {

        return;

    }


    const customerRef =
        doc(
            db,
            "customers",
            window.currentRioUser.uid
        );


    try {

        claimRewardBtn.disabled =
            true;


        claimRewardBtn.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Requesting Reward...
            </span>

        `;


        await updateDoc(

            customerRef,

            {

                reward: true,

                rewardUnlocked: true,

                updatedAt:
                    serverTimestamp()

            }

        );


        currentCustomerData.reward =
            true;

        currentCustomerData.rewardUnlocked =
            true;


        updateRewardUI(
            true,
            false
        );


        alert(

            "🎉 Your FREE Veg Maggi reward has been requested.\n\n" +

            "Please show your loyalty card at Rio Maggi Point."

        );

    }

    catch (error) {

        console.error(
            "Reward claim error:",
            error
        );


        alert(
            "Unable to request reward. Please try again."
        );


        updateRewardUI(
            true,
            false
        );

    }

}


// =====================================================
// CUSTOMER PHOTO FALLBACK
// =====================================================

if (customerPhoto) {

    customerPhoto.addEventListener(

        "error",

        () => {

            if (
                customerPhoto.src !==
                DEFAULT_AVATAR
            ) {

                customerPhoto.src =
                    DEFAULT_AVATAR;

            }

        },

        {
            once: true
        }

    );

}


// =====================================================
// FREE GAME
// =====================================================

function openFreeGames(event) {

    if (event) {

        event.preventDefault();

    }


    window.location.href =
        "../index.html";

}


if (freeGameBtn) {

    freeGameBtn.addEventListener(
        "click",
        openFreeGames
    );

}


if (freeGamePromoBtn) {

    freeGamePromoBtn.addEventListener(

        "click",

        openFreeGames

    );

}


// =====================================================
// CLAIM REWARD BUTTON
// =====================================================

if (claimRewardBtn) {

    claimRewardBtn.addEventListener(

        "click",

        claimReward

    );

}


// =====================================================
// SHOP CALL
// =====================================================

if (callShopBtn) {

    callShopBtn.href =
        `tel:+91${SHOP_PHONE}`;

}


// =====================================================
// SHOP WHATSAPP
// =====================================================

if (whatsappShopBtn) {

    whatsappShopBtn.href =
        `https://wa.me/${SHOP_WHATSAPP}`;

}


// =====================================================
// MAP — COMING SOON
// =====================================================

if (mapShopBtn) {

    mapShopBtn.addEventListener(

        "click",

        () => {

            alert(
                "Rio Maggi Point location is coming soon."
            );

        }

    );

}


// =====================================================
// SCROLL REVEAL
// =====================================================

function initializeRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal-animation"
        );


    if (
        !elements.length
    ) {

        return;

    }


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(

                (entries) => {

                    entries.forEach(

                        (entry) => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "is-visible"
                                );


                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }

                    );

                },

                {
                    threshold: 0.12
                }

            );


        elements.forEach(

            (element) => {

                observer.observe(
                    element
                );

            }

        );

    }

    else {

        elements.forEach(

            (element) => {

                element.classList.add(
                    "is-visible"
                );

            }

        );

    }

}


// =====================================================
// HIDE PAGE LOADER
// =====================================================

function hidePageLoader() {

    if (!pageLoader) {
        return;
    }


    pageLoader.classList.add(
        "hidden"
    );


    setTimeout(

        () => {

            pageLoader.remove();

        },

        500

    );

}


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(

    auth,

    async (user) => {

        try {

            // =========================================
            // NOT LOGGED IN
            // =========================================

            if (!user) {

                window.location.replace(
                    "login.html"
                );

                return;

            }


            // =========================================
            // SAVE CURRENT USER
            // =========================================

            window.currentRioUser =
                user;


            console.log(
                "Login UID:",
                user.uid
            );


            // =========================================
            // LOAD CUSTOMER
            // =========================================

            const customer =
                await loadCustomerData(
                    user
                );


            if (!customer) {

                return;

            }


            // =========================================
            // INITIALIZE UI
            // =========================================

            initializeRevealAnimations();


            // =========================================
            // HIDE LOADER
            // =========================================

            hidePageLoader();


            // =========================================
            // READY
            // =========================================

            document.body.classList.add(
                "card-page-ready"
            );


            console.log(
                "================================"
            );


            console.log(
                "🍜 Rio Maggi Point"
            );


            console.log(
                "Premium Loyalty Card Loaded"
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
                "Card initialization failed:",
                error
            );


            hidePageLoader();


            alert(
                "Unable to load your loyalty card. Please try again."
            );

        }

    }

);


// =====================================================
// COUNTDOWN REFRESH
// =====================================================
//
// Re-checks the Firebase customer record every minute.
// This ensures a cycle that expires while the page
// remains open gets reset automatically.
//
// =====================================================

countdownTimer =

    setInterval(

        async () => {

            if (
                !window.currentRioUser
            ) {

                return;

            }


            try {

                await loadCustomerData(

                    window.currentRioUser

                );

            }

            catch (error) {

                console.error(
                    "Loyalty refresh failed:",
                    error
                );

            }

        },

        60 * 1000

    );


// =====================================================
// ONLINE / OFFLINE STATUS
// =====================================================

window.addEventListener(

    "offline",

    () => {

        console.warn(
            "Internet connection lost."
        );

    }

);


window.addEventListener(

    "online",

    () => {

        console.log(
            "Internet connection restored."
        );

    }

);


// =====================================================
// FINAL READY LOG
// =====================================================

console.log(
    "🍜 Rio Maggi Point Customer Card JS Ready"
);

console.log(
    "Firebase Customer Collection: customers"
);

console.log(
    "6 Stamp Reward System: Enabled"
);

console.log(
    "40 Day Loyalty Cycle: Enabled"
);

console.log(
    "LocalStorage Loyalty System: Removed"
);
