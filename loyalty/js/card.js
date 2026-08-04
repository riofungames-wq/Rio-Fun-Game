// ======================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - FINAL FIXED
// ======================================


// ======================================
// FIREBASE
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
    getDoc
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
let authInitialized = false;


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
// INITIALIZE CARD BUTTONS
// ======================================

function initializeCardButtons() {

    // ==================================
    // FREE GAME CARD BUTTON
    // ==================================

    const freeGameBtn =
        document.getElementById(
            "freeGameBtn"
        );

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


    // ==================================
    // FREE GAME PROMOTION BUTTON
    // ==================================

    const freeGamePromoBtn =
        document.getElementById(
            "freeGamePromoBtn"
        );

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


    // ==================================
    // CALL SHOP
    // ==================================

    const callShopBtn =
        document.getElementById(
            "callShopBtn"
        );

    if (callShopBtn) {

        callShopBtn.href =
            `tel:+91${SHOP_PHONE}`;

    }


    // ==================================
    // WHATSAPP SHOP
    // ==================================

    const whatsappShopBtn =
        document.getElementById(
            "whatsappShopBtn"
        );

    if (whatsappShopBtn) {

        const message =
            encodeURIComponent(
                "Hello Rio Maggi Point, I want to know more about the loyalty program."
            );

        whatsappShopBtn.href =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    }


    // ==================================
    // MAP - COMING SOON
    // ==================================

    const mapShopBtn =
        document.getElementById(
            "mapShopBtn"
        );

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


    // ==================================
    // REWARD BUTTON
    // ==================================

    const claimRewardBtn =
        document.getElementById(
            "claimRewardBtn"
        );

    if (claimRewardBtn) {

        claimRewardBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "reward.html";

            },
            {
                once: true
            }
        );

    }

}


// ======================================
// COMING SOON
// ======================================

function showComingSoon(
    message
) {

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

        if (authInitialized) {

            return;

        }

        authInitialized = true;


        // ==============================
        // NOT LOGGED IN
        // ==============================

        if (!user) {

            window.currentRioUser =
                null;

            window.rioCustomerData =
                null;

            hidePageLoader();

            window.location.href =
                "login.html";

            return;

        }


        // ==============================
        // SAVE USER
        // ==============================

        window.currentRioUser =
            user;


        // ==============================
        // LOAD CUSTOMER CARD
        // ==============================

        await initializeLoyaltyCard(
            user
        );

    }
);


// ======================================
// INITIALIZE LOYALTY CARD
// ======================================

async function initializeLoyaltyCard(
    user
) {

    try {

        showPageLoader();


        // ==============================
        // USER DOCUMENT
        // ==============================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnap =
            await getDoc(
                userRef
            );


        // ==============================
        // PROFILE NOT FOUND
        // ==============================

        if (
            !userSnap.exists()
        ) {

            console.warn(
                "Customer profile not found."
            );


            showDefaultCustomerData();

            hidePageLoader();

            return;

        }


        // ==============================
        // CUSTOMER DATA
        // ==============================

        const userData =
            userSnap.data();


        window.rioCustomerData =
            userData;


        // ==============================
        // CUSTOMER PROFILE
        // ==============================

        updateCustomerProfile(
            user,
            userData
        );


        // ==============================
        // STAMP COUNT
        // ==============================

        const stampCount =
            getStampCount(
                userData
            );


        window.rioCurrentStamps =
            stampCount;


        // ==============================
        // STAMP UI
        // ==============================

        updateStampUI(
            stampCount,
            userData
        );


        // ==============================
        // REWARD UI
        // ==============================

        updateRewardUI(
            stampCount
        );


        // ==============================
        // COUNTDOWN
        // ==============================

        updateCountdown(
            userData,
            stampCount
        );


        // ==============================
        // START REFRESH
        // ==============================

        startCountdownRefresh();


        // ==============================
        // HIDE LOADER
        // ==============================

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
    userData
) {

    // ==============================
    // CUSTOMER NAME
    // ==============================

    const customerName =
        document.getElementById(
            "loyaltyCustomerName"
        );


    const welcomeUserName =
        document.getElementById(
            "welcomeUserName"
        );


    const name =
        userData.name ||
        userData.fullName ||
        userData.displayName ||
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


    // ==============================
    // CUSTOMER PHOTO
    // ==============================

    const customerPhoto =
        document.getElementById(
            "loyaltyCustomerPhoto"
        );


    const photoURL =
        userData.photoURL ||
        userData.photoUrl ||
        user.photoURL;


    if (
        customerPhoto &&
        photoURL
    ) {

        customerPhoto.src =
            photoURL;

    }


    // ==============================
    // MEMBER SINCE
    // ==============================

    const memberSinceDate =
        document.getElementById(
            "memberSinceDate"
        );


    if (memberSinceDate) {

        const memberSince =
            userData.memberSince ||
            userData.createdAt ||
            userData.createdDate;


        memberSinceDate.textContent =
            formatDate(
                memberSince
            );

    }


    // ==============================
    // WELCOME MESSAGE
    // ==============================

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
    userData
) {

    let stampCount =
        Number(
            userData.stamps ??
            userData.currentStamps ??
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
            stampCount,
            TOTAL_STAMPS
        )
    );

}


// ======================================
// UPDATE STAMP UI
// ======================================

function updateStampUI(
    stampCount,
    userData
) {

    // ==============================
    // STAMP BOXES
    // ==============================

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


            if (
                !stampNumber
            ) {

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


    // ==============================
    // STAMP COUNT
    // ==============================

    const stampCountText =
        document.getElementById(
            "stampCountText"
        );


    if (stampCountText) {

        stampCountText.textContent =
            `${stampCount}/${TOTAL_STAMPS}`;

    }


    // ==============================
    // PROGRESS BAR
    // ==============================

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


    // ==============================
    // PROGRESS TEXT
    // ==============================

    const stampProgressText =
        document.getElementById(
            "stampProgressText"
        );


    if (stampProgressText) {

        stampProgressText.textContent =
            `${stampCount} of ${TOTAL_STAMPS} valid stamps collected`;

    }


    // ==============================
    // GLOBAL STAMP DATES
    // ==============================

    window.rioStampDates =
        Array.isArray(
            userData?.stampDates
        )
            ? userData.stampDates
            : [];

}


// ======================================
// UPDATE REWARD UI
// ======================================

function updateRewardUI(
    stampCount
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


    const isUnlocked =
        stampCount >= TOTAL_STAMPS;


    // ==============================
    // REWARD UNLOCKED
    // ==============================

    if (
        isUnlocked
    ) {

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

    }


    // ==============================
    // REWARD LOCKED
    // ==============================

    else {

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
                TOTAL_STAMPS -
                stampCount;


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

}


// ======================================
// COUNTDOWN
// ======================================

function updateCountdown(
    userData,
    stampCount
) {

    // ==============================
    // NO COUNTDOWN ELEMENT
    // ==============================

    const countdownElement =
        document.getElementById(
            "countdownDays"
        );


    // card.html में अभी countdownDays नहीं है
    // इसलिए बिना error के return करें

    if (
        !countdownElement
    ) {

        return;

    }


    // ==============================
    // REWARD READY
    // ==============================

    if (
        stampCount >= TOTAL_STAMPS
    ) {

        countdownElement.textContent =
            "REWARD READY";

        window.rioCountdownDays =
            0;

        return;

    }


    // ==============================
    // GET CYCLE START
    // ==============================

    let cycleStart =
        parseFirebaseDate(
            userData?.cycleStartDate
        );


    // ==============================
    // FALLBACK STAMP DATE
    // ==============================

    if (
        !cycleStart &&
        Array.isArray(
            userData?.stampDates
        )
    ) {

        const firstStamp =
            userData.stampDates.find(
                (date) =>
                    parseFirebaseDate(
                        date
                    )
            );


        cycleStart =
            parseFirebaseDate(
                firstStamp
            );

    }


    // ==============================
    // NO ACTIVE CYCLE
    // ==============================

    if (
        !cycleStart
    ) {

        countdownElement.textContent =
            `${STAMP_RESET_DAYS} DAYS`;

        window.rioCountdownDays =
            STAMP_RESET_DAYS;

        return;

    }


    // ==============================
    // CALCULATE DAYS
    // ==============================

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

    if (
        countdownInterval
    ) {

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

                    const userRef =
                        doc(
                            db,
                            "users",
                            window.currentRioUser.uid
                        );


                    const userSnap =
                        await getDoc(
                            userRef
                        );


                    if (
                        !userSnap.exists()
                    ) {

                        return;

                    }


                    const userData =
                        userSnap.data();


                    const stampCount =
                        getStampCount(
                            userData
                        );


                    window.rioCustomerData =
                        userData;


                    window.rioCurrentStamps =
                        stampCount;


                    updateCountdown(
                        userData,
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
// DATE PARSER
// ======================================

function parseFirebaseDate(
    dateValue
) {

    try {

        if (
            !dateValue
        ) {

            return null;

        }


        // ==============================
        // FIREBASE TIMESTAMP
        // ==============================

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


        // ==============================
        // SERIALIZED FIREBASE TIMESTAMP
        // ==============================

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


        // ==============================
        // JAVASCRIPT DATE
        // ==============================

        if (
            dateValue instanceof Date
        ) {

            return isNaN(
                dateValue.getTime()
            )
                ? null
                : dateValue;

        }


        // ==============================
        // STRING / NUMBER
        // ==============================

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


    if (
        !date
    ) {

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


    if (
        loader
    ) {

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


    if (
        loader
    ) {

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


    if (
        customerName
    ) {

        customerName.textContent =
            "Rio Maggi Member";

    }


    if (
        welcomeUserName
    ) {

        welcomeUserName.textContent =
            "Premium Member";

    }


    updateStampUI(
        0,
        {
            stampDates: []
        }
    );


    updateRewardUI(
        0
    );

}


// ======================================
// CLEANUP
// ======================================

window.addEventListener(
    "beforeunload",
    () => {

        if (
            countdownInterval
        ) {

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
    "RIO MAGGI POINT - CARD SYSTEM READY"
);
