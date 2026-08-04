// ======================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - FINAL FIXED VERSION
// ======================================

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================
// LOYALTY CONFIGURATION
// ======================================

const TOTAL_STAMPS = 6;
const STAMP_RESET_DAYS = 40;

const SHOP_PHONE = "7987827979";
const WHATSAPP_NUMBER = "917987827979";


// ======================================
// GLOBAL STATE
// ======================================

window.currentRioUser = null;
window.rioCustomerData = null;
window.rioCurrentStamps = 0;
window.rioCountdownDays = STAMP_RESET_DAYS;

let countdownInterval = null;
let isClaimProcessing = false;


// ======================================
// DOM READY
// ======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeCardButtons();

    },
    {
        once: true
    }
);


// ======================================
// INITIALIZE BUTTONS
// ======================================

function initializeCardButtons() {

    // ----------------------------------
    // FREE GAME CARD BUTTON
    // ----------------------------------

    const freeGameBtn =
        document.getElementById("freeGameBtn");

    if (freeGameBtn) {

        freeGameBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "../index.html";

            },
            {
                once: true
            }
        );

    }


    // ----------------------------------
    // FREE GAME PROMOTION BUTTON
    // ----------------------------------

    const freeGamePromoBtn =
        document.getElementById("freeGamePromoBtn");

    if (freeGamePromoBtn) {

        freeGamePromoBtn.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                window.location.href =
                    "../index.html";

            },
            {
                once: true
            }
        );

    }


    // ----------------------------------
    // CALL BUTTON
    // ----------------------------------

    const callShopBtn =
        document.getElementById("callShopBtn");

    if (callShopBtn) {

        callShopBtn.href =
            `tel:+91${SHOP_PHONE}`;

    }


    // ----------------------------------
    // WHATSAPP BUTTON
    // ----------------------------------

    const whatsappShopBtn =
        document.getElementById("whatsappShopBtn");

    if (whatsappShopBtn) {

        const message =
            encodeURIComponent(
                "Hello Rio Maggi Point, I want to know more about the loyalty program."
            );

        whatsappShopBtn.href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    }


    // ----------------------------------
    // MAP COMING SOON
    // ----------------------------------

    const mapShopBtn =
        document.getElementById("mapShopBtn");

    if (mapShopBtn) {

        mapShopBtn.addEventListener(
            "click",
            () => {

                showComingSoon(
                    "Rio Maggi Point location is coming soon."
                );

            }
        );

    }


    // ----------------------------------
    // CLAIM REWARD BUTTON
    // ----------------------------------

    const claimRewardBtn =
        document.getElementById("claimRewardBtn");

    if (claimRewardBtn) {

        claimRewardBtn.addEventListener(
            "click",
            handleClaimReward
        );

    }

}


// ======================================
// COMING SOON
// ======================================

function showComingSoon(message) {

    alert(
        message ||
        "This feature is coming soon."
    );

}


// ======================================
// AUTH STATE
// ======================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.currentRioUser = null;
            window.rioCustomerData = null;
            window.rioCurrentStamps = 0;

            window.location.href =
                "login.html";

            return;

        }


        window.currentRioUser =
            user;


        await initializeLoyaltyCard(user);

    }
);


// ======================================
// INITIALIZE LOYALTY CARD
// ======================================

async function initializeLoyaltyCard(user) {

    try {

        showPageLoader();


        // ----------------------------------
        // CUSTOMER DOCUMENT
        // ----------------------------------

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


        // ----------------------------------
        // CUSTOMER NOT FOUND
        // ----------------------------------

        if (!customerSnap.exists()) {

            console.warn(
                "Customer profile not found."
            );

            showDefaultCustomerData();

            hidePageLoader();

            return;

        }


        let customerData =
            customerSnap.data();


        // ----------------------------------
        // VALIDATE 40-DAY CYCLE
        // ----------------------------------

        const cycleResult =
            await validateLoyaltyCycle(
                customerRef,
                customerData
            );


        if (cycleResult.reset) {

            customerData =
                {
                    ...customerData,
                    ...cycleResult.data
                };

        }


        // ----------------------------------
        // SAVE GLOBAL DATA
        // ----------------------------------

        window.rioCustomerData =
            customerData;


        // ----------------------------------
        // UPDATE PROFILE
        // ----------------------------------

        updateCustomerProfile(
            user,
            customerData
        );


        // ----------------------------------
        // STAMP COUNT
        // ----------------------------------

        const stampCount =
            getStampCount(
                customerData
            );


        window.rioCurrentStamps =
            stampCount;


        // ----------------------------------
        // UPDATE STAMP UI
        // ----------------------------------

        updateStampUI(
            stampCount,
            customerData
        );


        // ----------------------------------
        // UPDATE REWARD UI
        // ----------------------------------

        updateRewardUI(
            stampCount,
            customerData
        );


        // ----------------------------------
        // UPDATE COUNTDOWN
        // ----------------------------------

        updateCountdown(
            customerData,
            stampCount
        );


        // ----------------------------------
        // START COUNTDOWN
        // ----------------------------------

        startCountdownRefresh();


        hidePageLoader();


        console.log(
            "Rio Maggi Point Loyalty Card Loaded Successfully"
        );

    }

    catch (error) {

        console.error(
            "Loyalty card initialization failed:",
            error
        );

        hidePageLoader();

    }

}


// ======================================
// CUSTOMER PROFILE
// ======================================

function updateCustomerProfile(
    user,
    customerData
) {

    const customerName =
        document.getElementById(
            "loyaltyCustomerName"
        );


    const welcomeUserName =
        document.getElementById(
            "welcomeUserName"
        );


    const name =
        customerData.name ||
        customerData.fullName ||
        customerData.displayName ||
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


    // ----------------------------------
    // PHOTO
    // ----------------------------------

    const customerPhoto =
        document.getElementById(
            "loyaltyCustomerPhoto"
        );


    const photoURL =
        customerData.photoURL ||
        customerData.photoUrl ||
        user.photoURL;


    if (
        customerPhoto &&
        photoURL
    ) {

        customerPhoto.src =
            photoURL;

    }


    if (customerPhoto) {

        customerPhoto.onerror =
            () => {

                customerPhoto.onerror =
                    null;

                customerPhoto.src =
                    "assets/default-avatar.png";

            };

    }


    // ----------------------------------
    // MEMBER SINCE
    // ----------------------------------

    const memberSinceDate =
        document.getElementById(
            "memberSinceDate"
        );


    if (memberSinceDate) {

        const memberSince =
            customerData.memberSince ||
            customerData.createdAt ||
            customerData.createdDate;


        memberSinceDate.textContent =
            formatDate(memberSince);

    }


    // ----------------------------------
    // WELCOME MESSAGE
    // ----------------------------------

    const welcomeMessage =
        document.getElementById(
            "welcomeMessage"
        );


    if (welcomeMessage) {

        welcomeMessage.textContent =
            "Keep collecting stamps and enjoy your reward.";

    }

}


// ======================================
// GET STAMP COUNT
// ======================================

function getStampCount(
    customerData
) {

    let stampCount =
        Number(
            customerData.stamps ??
            customerData.currentStamps ??
            0
        );


    if (
        !Number.isFinite(
            stampCount
        )
    ) {

        stampCount = 0;

    }


    return Math.max(
        0,
        Math.min(
            Math.floor(stampCount),
            TOTAL_STAMPS
        )
    );

}


// ======================================
// UPDATE STAMP UI
// ======================================

function updateStampUI(
    stampCount,
    customerData
) {

    const stampBoxes =
        document.querySelectorAll(
            "#stampContainer .stamp-box"
        );


    stampBoxes.forEach(
        (stampBox) => {

            const stampNumber =
                Number(
                    stampBox.dataset.stamp
                );


            if (!stampNumber) {

                return;

            }


            const collected =
                stampNumber <= stampCount;


            stampBox.classList.toggle(
                "active",
                collected
            );


            stampBox.classList.toggle(
                "collected",
                collected
            );


            stampBox.setAttribute(
                "aria-label",
                collected
                    ? `Stamp ${stampNumber} collected`
                    : `Stamp ${stampNumber} not collected`
            );

        }
    );


    // ----------------------------------
    // COUNT
    // ----------------------------------

    const stampCountText =
        document.getElementById(
            "stampCountText"
        );


    if (stampCountText) {

        stampCountText.textContent =
            `${stampCount}/${TOTAL_STAMPS}`;

    }


    // ----------------------------------
    // PROGRESS
    // ----------------------------------

    const stampProgressBar =
        document.getElementById(
            "stampProgressBar"
        );


    const progressPercentage =
        (
            stampCount /
            TOTAL_STAMPS
        ) * 100;


    if (stampProgressBar) {

        stampProgressBar.style.width =
            `${progressPercentage}%`;

    }


    // ----------------------------------
    // PROGRESS TEXT
    // ----------------------------------

    const stampProgressText =
        document.getElementById(
            "stampProgressText"
        );


    if (stampProgressText) {

        stampProgressText.textContent =
            `${stampCount} of ${TOTAL_STAMPS} valid stamps collected`;

    }


    // ----------------------------------
    // STAMP DATES
    // ----------------------------------

    window.rioStampDates =
        Array.isArray(
            customerData.stampDates
        )
            ? customerData.stampDates
            : [];

}


// ======================================
// UPDATE REWARD UI
// ======================================

function updateRewardUI(
    stampCount,
    customerData
) {

    const rewardStatus =
        document.getElementById(
            "rewardStatus"
        );


    const rewardStatusIcon =
        rewardStatus?.querySelector(
            ".reward-status-icon i"
        );


    const rewardStatusTitle =
        rewardStatus?.querySelector(
            ".reward-status-content strong"
        );


    const rewardStatusText =
        rewardStatus?.querySelector(
            ".reward-status-content span"
        );


    const claimRewardBtn =
        document.getElementById(
            "claimRewardBtn"
        );


    const rewardClaimed =
        customerData?.rewardClaimed === true;


    const isUnlocked =
        stampCount >= TOTAL_STAMPS &&
        !rewardClaimed;


    // ----------------------------------
    // REWARD CLAIMED
    // ----------------------------------

    if (rewardClaimed) {

        if (rewardStatus) {

            rewardStatus.classList.remove(
                "reward-unlocked"
            );

        }


        if (rewardStatusIcon) {

            rewardStatusIcon.className =
                "fa-solid fa-check";

        }


        if (rewardStatusTitle) {

            rewardStatusTitle.textContent =
                "Reward Claimed";

        }


        if (rewardStatusText) {

            rewardStatusText.textContent =
                "Your reward has already been claimed.";

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

        }


        return;

    }


    // ----------------------------------
    // REWARD UNLOCKED
    // ----------------------------------

    if (isUnlocked) {

        if (rewardStatus) {

            rewardStatus.classList.add(
                "reward-unlocked"
            );

        }


        if (rewardStatusIcon) {

            rewardStatusIcon.className =
                "fa-solid fa-gift";

        }


        if (rewardStatusTitle) {

            rewardStatusTitle.textContent =
                "Reward Unlocked!";

        }


        if (rewardStatusText) {

            rewardStatusText.textContent =
                "Congratulations! Your FREE Veg Maggi is ready to claim.";

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

            claimRewardBtn.innerHTML =
                `
                <i class="fa-solid fa-gift"></i>
                <span>Claim Your FREE Veg Maggi</span>
                `;

        }


        return;

    }


    // ----------------------------------
    // REWARD LOCKED
    // ----------------------------------

    if (rewardStatus) {

        rewardStatus.classList.remove(
            "reward-unlocked"
        );

    }


    if (rewardStatusIcon) {

        rewardStatusIcon.className =
            "fa-solid fa-lock";

    }


    if (rewardStatusTitle) {

        rewardStatusTitle.textContent =
            "Reward Locked";

    }


    if (rewardStatusText) {

        const remaining =
            Math.max(
                TOTAL_STAMPS - stampCount,
                0
            );


        rewardStatusText.textContent =
            `Collect ${remaining} more valid stamp${remaining === 1 ? "" : "s"} within the 40-day cycle to unlock your FREE Veg Maggi.`;

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

        claimRewardBtn.innerHTML =
            `
            <i class="fa-solid fa-lock"></i>
            <span>Collect ${TOTAL_STAMPS} Stamps to Unlock</span>
            `;

    }

}


// ======================================
// 40-DAY LOYALTY CYCLE
// ======================================

async function validateLoyaltyCycle(
    customerRef,
    customerData
) {

    const stampCount =
        getStampCount(
            customerData
        );


    // ----------------------------------
    // NO ACTIVE STAMPS
    // ----------------------------------

    if (stampCount <= 0) {

        return {
            reset: false,
            data: customerData
        };

    }


    // ----------------------------------
    // FIND CYCLE START
    // ----------------------------------

    let cycleStart =
        parseFirebaseDate(
            customerData.cycleStartDate
        );


    // ----------------------------------
    // FALLBACK TO FIRST STAMP
    // ----------------------------------

    if (
        !cycleStart &&
        Array.isArray(
            customerData.stampDates
        )
    ) {

        const firstStamp =
            customerData.stampDates.find(
                (date) =>
                    parseFirebaseDate(date)
            );


        cycleStart =
            parseFirebaseDate(
                firstStamp
            );

    }


    // ----------------------------------
    // NO DATE AVAILABLE
    // ----------------------------------

    if (!cycleStart) {

        return {
            reset: false,
            data: customerData
        };

    }


    // ----------------------------------
    // CALCULATE DAYS
    // ----------------------------------

    const now =
        new Date();


    const elapsedMilliseconds =
        now.getTime() -
        cycleStart.getTime();


    const elapsedDays =
        Math.floor(
            elapsedMilliseconds /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    const remainingDays =
        Math.max(
            0,
            STAMP_RESET_DAYS -
            elapsedDays
        );


    window.rioCountdownDays =
        remainingDays;


    // ----------------------------------
    // CYCLE VALID
    // ----------------------------------

    if (
        elapsedDays <
        STAMP_RESET_DAYS
    ) {

        return {
            reset: false,
            data: customerData
        };

    }


    // ----------------------------------
    // 6 STAMPS COMPLETED
    // REWARD REMAINS AVAILABLE
    // ----------------------------------

    if (
        stampCount >=
        TOTAL_STAMPS
    ) {

        return {
            reset: false,
            data: customerData
        };

    }


    // ----------------------------------
    // 40 DAYS EXPIRED
    // RESET INCOMPLETE CYCLE
    // ----------------------------------

    const resetData = {

        stamps: 0,

        currentStamps: 0,

        stampDates: [],

        cycleStartDate: null,

        rewardUnlocked: false,

        rewardClaimed: false,

        cycleResetAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    try {

        await runTransaction(
            db,
            async (transaction) => {

                const latestSnap =
                    await transaction.get(
                        customerRef
                    );


                if (
                    !latestSnap.exists()
                ) {

                    throw new Error(
                        "CUSTOMER_NOT_FOUND"
                    );

                }


                const latestData =
                    latestSnap.data();


                const latestStamps =
                    getStampCount(
                        latestData
                    );


                if (
                    latestStamps >=
                    TOTAL_STAMPS
                ) {

                    return;

                }


                transaction.update(
                    customerRef,
                    resetData
                );

            }
        );


        console.log(
            "40-day loyalty cycle expired. Incomplete stamps reset to 0."
        );


        return {

            reset: true,

            data: {

                ...customerData,

                stamps: 0,

                currentStamps: 0,

                stampDates: [],

                cycleStartDate: null,

                rewardUnlocked: false,

                rewardClaimed: false

            }

        };

    }

    catch (error) {

        console.error(
            "Loyalty cycle reset failed:",
            error
        );


        return {

            reset: false,

            data: customerData

        };

    }

}


// ======================================
// UPDATE COUNTDOWN
// ======================================

function updateCountdown(
    customerData,
    stampCount
) {

    const countdownElement =
        document.getElementById(
            "countdownDays"
        );


    if (!countdownElement) {

        return;

    }


    // ----------------------------------
    // REWARD READY
    // ----------------------------------

    if (
        stampCount >=
        TOTAL_STAMPS
    ) {

        countdownElement.textContent =
            "REWARD READY";

        window.rioCountdownDays =
            0;

        return;

    }


    // ----------------------------------
    // GET CYCLE START
    // ----------------------------------

    let cycleStart =
        parseFirebaseDate(
            customerData.cycleStartDate
        );


    if (
        !cycleStart &&
        Array.isArray(
            customerData.stampDates
        )
    ) {

        const firstStamp =
            customerData.stampDates.find(
                (date) =>
                    parseFirebaseDate(date)
            );


        cycleStart =
            parseFirebaseDate(
                firstStamp
            );

    }


    // ----------------------------------
    // NO ACTIVE CYCLE
    // ----------------------------------

    if (!cycleStart) {

        countdownElement.textContent =
            `${STAMP_RESET_DAYS} DAYS`;

        window.rioCountdownDays =
            STAMP_RESET_DAYS;

        return;

    }


    // ----------------------------------
    // CALCULATE REMAINING
    // ----------------------------------

    const now =
        new Date();


    const elapsedMilliseconds =
        now.getTime() -
        cycleStart.getTime();


    const elapsedDays =
        Math.floor(
            elapsedMilliseconds /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    const remainingDays =
        Math.max(
            0,
            STAMP_RESET_DAYS -
            elapsedDays
        );


    countdownElement.textContent =
        `${remainingDays} ${
            remainingDays === 1
                ? "DAY"
                : "DAYS"
        }`;


    window.rioCountdownDays =
        remainingDays;

}


// ======================================
// COUNTDOWN REFRESH
// ======================================

function startCountdownRefresh() {

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

    }


    countdownInterval =
        setInterval(
            async () => {

                if (
                    !window.currentRioUser
                ) {

                    return;

                }


                try {

                    const customerRef =
                        doc(
                            db,
                            "customers",
                            window.currentRioUser.uid
                        );


                    const customerSnap =
                        await getDoc(
                            customerRef
                        );


                    if (
                        !customerSnap.exists()
                    ) {

                        return;

                    }


                    const customerData =
                        customerSnap.data();


                    const stampCount =
                        getStampCount(
                            customerData
                        );


                    updateCountdown(
                        customerData,
                        stampCount
                    );

                }

                catch (error) {

                    console.error(
                        "Countdown refresh failed:",
                        error
                    );

                }

            },
            60 * 1000
        );

}


// ======================================
// CLAIM REWARD
// ======================================

async function handleClaimReward() {

    if (isClaimProcessing) {

        return;

    }


    const user =
        window.currentRioUser;


    if (!user) {

        alert(
            "Please login first."
        );

        return;

    }


    const claimButton =
        document.getElementById(
            "claimRewardBtn"
        );


    isClaimProcessing =
        true;


    if (claimButton) {

        claimButton.disabled =
            true;

        claimButton.dataset.processing =
            "true";

    }


    try {

        const customerRef =
            doc(
                db,
                "customers",
                user.uid
            );


        // ----------------------------------
        // CONFIRMATION
        // ----------------------------------

        const confirmed =
            window.confirm(
                "🎁 Claim your FREE VEG MAGGI reward now?"
            );


        if (!confirmed) {

            return;

        }


        // ----------------------------------
        // SECURE TRANSACTION
        // ----------------------------------

        await runTransaction(
            db,
            async (transaction) => {

                const customerSnap =
                    await transaction.get(
                        customerRef
                    );


                if (
                    !customerSnap.exists()
                ) {

                    throw new Error(
                        "CUSTOMER_NOT_FOUND"
                    );

                }


                const latestData =
                    customerSnap.data();


                const latestStampCount =
                    getStampCount(
                        latestData
                    );


                const alreadyClaimed =
                    latestData.rewardClaimed === true;


                if (alreadyClaimed) {

                    throw new Error(
                        "REWARD_ALREADY_CLAIMED"
                    );

                }


                if (
                    latestStampCount <
                    TOTAL_STAMPS
                ) {

                    throw new Error(
                        "REWARD_NOT_UNLOCKED"
                    );

                }


                // ----------------------------------
                // CONSUME CURRENT REWARD CYCLE
                // START NEW CYCLE
                // ----------------------------------

                transaction.update(
                    customerRef,
                    {

                        stamps: 0,

                        currentStamps: 0,

                        stampDates: [],

                        cycleStartDate: null,

                        rewardUnlocked: false,

                        rewardClaimed: true,

                        rewardClaimDate:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }
                );

            }
        );


        // ----------------------------------
        // LOCAL STATE
        // ----------------------------------

        window.rioCurrentStamps =
            0;


        window.rioCustomerData =
            {

                ...window.rioCustomerData,

                stamps: 0,

                currentStamps: 0,

                stampDates: [],

                cycleStartDate: null,

                rewardUnlocked: false,

                rewardClaimed: true

            };


        // ----------------------------------
        // UPDATE UI
        // ----------------------------------

        updateStampUI(
            0,
            window.rioCustomerData
        );


        updateRewardUI(
            0,
            window.rioCustomerData
        );


        updateCountdown(
            window.rioCustomerData,
            0
        );


        alert(
            "🎉 Your FREE VEG MAGGI reward has been successfully claimed!"
        );

    }

    catch (error) {

        console.error(
            "Reward claim failed:",
            error
        );


        if (
            error.message ===
            "REWARD_ALREADY_CLAIMED"
        ) {

            alert(
                "This reward has already been claimed."
            );

        }

        else if (
            error.message ===
            "REWARD_NOT_UNLOCKED"
        ) {

            alert(
                "Your reward is not unlocked yet."
            );

        }

        else if (
            error.message ===
            "CUSTOMER_NOT_FOUND"
        ) {

            alert(
                "Customer account could not be found."
            );

        }

        else {

            alert(
                "Unable to claim reward right now. Please try again."
            );

        }

    }

    finally {

        isClaimProcessing =
            false;


        if (claimButton) {

            claimButton.dataset.processing =
                "false";


            // Re-read current state
            // so claimed reward never becomes enabled again.

            const rewardClaimed =
                window.rioCustomerData?.rewardClaimed === true;


            claimButton.disabled =
                rewardClaimed ||
                window.rioCurrentStamps < TOTAL_STAMPS;

        }

    }

}


// ======================================
// DATE PARSER
// ======================================

function parseFirebaseDate(
    dateValue
) {

    try {

        if (!dateValue) {

            return null;

        }


        // FIREBASE TIMESTAMP

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


        // SERIALIZED TIMESTAMP

        if (
            typeof dateValue ===
            "object" &&
            dateValue.seconds !==
            undefined
        ) {

            const milliseconds =
                Number(
                    dateValue.seconds
                ) * 1000
                +
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


        // JAVASCRIPT DATE

        if (
            dateValue instanceof Date
        ) {

            return isNaN(
                dateValue.getTime()
            )
                ? null
                : dateValue;

        }


        // STRING / NUMBER

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


// ======================================
// FORMAT DATE
// ======================================

function formatDate(
    dateValue
) {

    const date =
        parseFirebaseDate(
            dateValue
        );


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


// ======================================
// PAGE LOADER
// ======================================

function showPageLoader() {

    const loader =
        document.getElementById(
            "pageLoader"
        );


    if (loader) {

        loader.classList.remove(
            "hidden"
        );

        loader.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}


function hidePageLoader() {

    const loader =
        document.getElementById(
            "pageLoader"
        );


    if (loader) {

        loader.classList.add(
            "hidden"
        );

        loader.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


// ======================================
// DEFAULT CUSTOMER DATA
// ======================================

function showDefaultCustomerData() {

    const customerName =
        document.getElementById(
            "loyaltyCustomerName"
        );


    const welcomeUserName =
        document.getElementById(
            "welcomeUserName"
        );


    if (customerName) {

        customerName.textContent =
            "Rio Maggi Member";

    }


    if (welcomeUserName) {

        welcomeUserName.textContent =
            "Premium Member";

    }


    const defaultData = {

        stamps: 0,

        currentStamps: 0,

        stampDates: [],

        rewardClaimed: false

    };


    updateStampUI(
        0,
        defaultData
    );


    updateRewardUI(
        0,
        defaultData
    );

}


// ======================================
// CLEANUP
// ======================================

window.addEventListener(
    "beforeunload",
    () => {

        if (countdownInterval) {

            clearInterval(
                countdownInterval
            );

            countdownInterval =
                null;

        }

    },
    {
        once: true
    }
);


// ======================================
// FINAL READY
// ======================================

console.log(
    "Rio Maggi Point Premium Loyalty Card System Ready"
);
