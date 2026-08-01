/* =========================================================
   RIO MAGGI POINT
   FEMALE PREMIUM DASHBOARD
   FEMALE.JS
   PART 1/4

   FIREBASE + INITIALIZATION
========================================================= */

/* =========================================================
   FIREBASE IMPORTS
   Existing project structure
========================================================= */

import { app, auth, db } from "../js/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loader =
    document.getElementById("femaleDashboardLoader");

const welcomeSection =
    document.getElementById("femaleWelcomeSection");

const welcomeTitle =
    document.getElementById("femaleWelcomeTitle");

const welcomeUser =
    document.getElementById("femaleUserName");

const profileName =
    document.getElementById("femaleProfileName");

const memberSince =
    document.getElementById("femaleMemberSince");

const avatar =
    document.getElementById("femaleUserAvatar");

const stampCount =
    document.getElementById("femaleStampCount");

const stampProgress =
    document.getElementById("femaleStampProgress");

const rewardStampStatus =
    document.getElementById("femaleRewardStampStatus");

const rewardProgress =
    document.getElementById("femaleRewardProgressFill");

const rewardMessage =
    document.getElementById("femaleRewardMessage");

const rewardUnlocked =
    document.getElementById("femaleRewardUnlocked");

const personalGreeting =
    document.getElementById("femalePersonalGreeting");

const personalMessage =
    document.getElementById("femalePersonalMessage");

const navigationContainer =
    document.getElementById("commonNavigationContainer");


/* =========================================================
   DASHBOARD SETTINGS
========================================================= */

const MAX_STAMPS = 6;

let currentUser = null;

let customerData = null;


/* =========================================================
   LOADER
========================================================= */

function showLoader() {

    if (!loader) return;

    loader.classList.remove("hidden");

}

function hideLoader() {

    if (!loader) return;

    setTimeout(() => {

        loader.classList.add("hidden");

    }, 500);

}


/* =========================================================
   WELCOME ANIMATION
========================================================= */

function playWelcomeAnimation() {

    if (!welcomeSection) return;

    welcomeSection.animate(

        [
            {
                opacity: 0,
                transform: "translateY(25px)"
            },
            {
                opacity: 1,
                transform: "translateY(0)"
            }
        ],

        {
            duration: 700,
            easing: "ease-out",
            fill: "forwards"
        }

    );

}


/* =========================================================
   START DASHBOARD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    showLoader();

    playWelcomeAnimation();

});


/* =========================================================
   AUTH CHECK
   PART 2 CONTINUES...
========================================================= */
/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        hideLoader();

        window.location.href = "../login.html";
        return;

    }

    currentUser = user;

    try {

        await loadCustomerData(user);

    } catch (error) {

        console.error(
            "Female Dashboard Error:",
            error
        );

        hideLoader();

    }

});


/* =========================================================
   LOAD CUSTOMER DATA
========================================================= */

async function loadCustomerData(user) {

    const customerRef = doc(
        db,
        "customers",
        user.uid
    );

    const customerSnap =
        await getDoc(customerRef);

    if (!customerSnap.exists()) {

        console.warn(
            "Customer document not found."
        );

        applyFallbackProfile(user);

        hideLoader();

        return;

    }

    customerData =
        customerSnap.data();

    updateProfile(customerData);

    updateStampSystem(customerData);

    updateRewardSystem(customerData);

    updatePersonalSection(customerData);

    loadNavigation();

    hideLoader();

}


/* =========================================================
   FALLBACK PROFILE
========================================================= */

function applyFallbackProfile(user) {

    const name =
        user.displayName ||
        "Customer";

    welcomeUser.textContent =
        name;

    profileName.textContent =
        name;

    memberSince.textContent =
        "Premium Member";

}


/* =========================================================
   UPDATE PROFILE
========================================================= */

function updateProfile(data) {

    const fullName =
        data.fullName ||
        data.name ||
        "Customer";

    welcomeUser.textContent =
        fullName;

    profileName.textContent =
        fullName;

    if (data.memberSince) {

        memberSince.textContent =
            "Member Since " +
            data.memberSince;

    }

    if (
        data.photoURL &&
        avatar
    ) {

        avatar.src =
            data.photoURL;

    }

}


/* =========================================================
   UPDATE STAMP SYSTEM
========================================================= */

function updateStampSystem(data) {

    const stamps =
        Number(data.stamps || 0);

    const progress =
        Math.min(
            (stamps / MAX_STAMPS) * 100,
            100
        );

    stampCount.textContent =
        `${stamps} / ${MAX_STAMPS}`;

    stampProgress.style.width =
        progress + "%";

}


/* =========================================================
   PART 3 CONTINUES...
========================================================= */
/* =========================================================
   UPDATE REWARD SYSTEM
========================================================= */

function updateRewardSystem(data) {

    const stamps =
        Number(data.stamps || 0);

    const progress =
        Math.min(
            (stamps / MAX_STAMPS) * 100,
            100
        );

    rewardStampStatus.textContent =
        `${stamps} / ${MAX_STAMPS}`;

    rewardProgress.style.width =
        progress + "%";

    if (stamps >= MAX_STAMPS) {

        rewardMessage.textContent =
            "🎉 Congratulations! Your Free Veg Maggi reward is ready.";

        rewardUnlocked.hidden =
            false;

    } else {

        const remaining =
            MAX_STAMPS - stamps;

        rewardMessage.textContent =
            `${remaining} stamp${remaining === 1 ? "" : "s"} left to unlock your Free Veg Maggi.`;

        rewardUnlocked.hidden =
            true;

    }

}


/* =========================================================
   PERSONALIZED SECTION
========================================================= */

function updatePersonalSection(data) {

    const firstName =
        (
            data.fullName ||
            data.name ||
            "Customer"
        )
        .split(" ")[0];

    personalGreeting.textContent =
        `Welcome ${firstName} 💗`;

    const stamps =
        Number(data.stamps || 0);

    if (stamps >= MAX_STAMPS) {

        personalMessage.textContent =
            "Your reward is unlocked. Visit Rio Maggi Point and claim your Free Veg Maggi.";

    } else {

        const remaining =
            MAX_STAMPS - stamps;

        personalMessage.textContent =
            `Only ${remaining} more stamp${remaining === 1 ? "" : "s"} to unlock your Free Veg Maggi reward.`;

    }

}


/* =========================================================
   CLAIM REWARD
========================================================= */

const claimRewardButton =
    document.getElementById(
        "femaleClaimRewardButton"
    );

if (claimRewardButton) {

    claimRewardButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "../reward.html";

        }
    );

}


/* =========================================================
   PART 4 CONTINUES...
========================================================= */
