/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 1/4

   FIREBASE + INITIALIZATION
========================================================= */

/* =========================================================
   FIREBASE IMPORTS
========================================================= */

import { auth, db }
from "../../js/firebase-config.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

    doc,
    getDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loader =
document.getElementById("maleDashboardLoader");

const welcomeSection =
document.getElementById("maleWelcomeSection");

const welcomeTitle =
document.getElementById("maleWelcomeTitle");

const welcomeUser =
document.getElementById("maleUserName");

const profileName =
document.getElementById("maleProfileName");

const memberSince =
document.getElementById("maleMemberSince");

const avatar =
document.getElementById("maleUserAvatar");

const stampCount =
document.getElementById("maleStampCount");

const progressText =
document.getElementById("maleProgressText");

const stampProgress =
document.getElementById("maleStampProgress");

const rewardStatus =
document.getElementById("maleRewardStatus");

const rewardStampStatus =
document.getElementById("maleRewardStampStatus");

const rewardProgress =
document.getElementById("maleRewardProgressFill");

const rewardMessage =
document.getElementById("maleRewardMessage");

const claimRewardButton =
document.getElementById("maleClaimRewardButton");

const personalGreeting =
document.getElementById("malePersonalGreeting");

const personalMessage =
document.getElementById("malePersonalMessage");

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

function showLoader(){

    if(!loader) return;

    loader.classList.remove("hidden");

}

function hideLoader(){

    if(!loader) return;

    setTimeout(()=>{

        loader.classList.add("hidden");

    },500);

}


/* =========================================================
   WELCOME ANIMATION
========================================================= */

function playWelcomeAnimation(){

    if(!welcomeSection) return;

    welcomeSection.animate(

        [

            {

                opacity:0,

                transform:"translateY(25px)"

            },

            {

                opacity:1,

                transform:"translateY(0)"

            }

        ],

        {

            duration:700,

            easing:"ease-out",

            fill:"forwards"

        }

    );

}


/* =========================================================
   START DASHBOARD
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        showLoader();

        playWelcomeAnimation();

    }

);


/* =========================================================
   FILE : male.js
   PART : 2/4 CONTINUES...
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 2/4

   AUTH + CUSTOMER DATA + PROFILE
========================================================= */

/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            hideLoader();

            window.location.href =
            "../../login.html";

            return;

        }

        currentUser = user;

        try{

            await loadCustomerData(user);

        }

        catch(error){

            console.error(

                "Male Dashboard Error:",

                error

            );

            hideLoader();

        }

    }

);


/* =========================================================
   LOAD CUSTOMER DATA
========================================================= */

async function loadCustomerData(user){

    const customerRef =

    doc(

        db,

        "customers",

        user.uid

    );

    const customerSnap =

    await getDoc(customerRef);

    if(!customerSnap.exists()){

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

function applyFallbackProfile(user){

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

function updateProfile(data){

    const fullName =

        data.fullName ||

        data.name ||

        "Customer";

    welcomeUser.textContent =
    fullName;

    profileName.textContent =
    fullName;

    if(data.memberSince){

        memberSince.textContent =

        "Member Since " +

        data.memberSince;

    }

    if(

        data.photoURL &&

        avatar

    ){

        avatar.src =
        data.photoURL;

    }

}


/* =========================================================
   UPDATE STAMP SYSTEM
========================================================= */

function updateStampSystem(data){

    const stamps =

    Number(

        data.stamps || 0

    );

    const progress =

    Math.min(

        (stamps / MAX_STAMPS) * 100,

        100

    );

    stampCount.textContent =

    `${stamps} / ${MAX_STAMPS}`;

    progressText.textContent =

    `${stamps} of ${MAX_STAMPS} Stamps`;

    stampProgress.style.width =

    progress + "%";

}


/* =========================================================
   FILE : male.js
   PART : 3/4 CONTINUES...
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 3/4

   REWARD + PERSONAL + ACTIONS
========================================================= */

/* =========================================================
   UPDATE REWARD SYSTEM
========================================================= */

function updateRewardSystem(data){

    const stamps =

    Number(

        data.stamps || 0

    );

    const progress =

    Math.min(

        (stamps / MAX_STAMPS) * 100,

        100

    );

    rewardStampStatus.textContent =

    `${stamps} / ${MAX_STAMPS}`;

    rewardProgress.style.width =

    progress + "%";

    if(stamps >= MAX_STAMPS){

        rewardStatus.textContent =
        "Unlocked";

        rewardMessage.textContent =

        "🎉 Congratulations! Your Free Veg Maggi reward is ready.";

        claimRewardButton.hidden =
        false;

    }

    else{

        rewardStatus.textContent =
        "Locked";

        const remaining =

        MAX_STAMPS - stamps;

        rewardMessage.textContent =

        `${remaining} stamp${remaining === 1 ? "" : "s"} left to unlock your Free Veg Maggi.`;

        claimRewardButton.hidden =
        true;

    }

}


/* =========================================================
   PERSONAL SECTION
========================================================= */

function updatePersonalSection(data){

    const firstName =

    (

        data.name ||

        "Customer"

    ).split(" ")[0];

    personalGreeting.textContent =

    `Welcome ${firstName} 👑`;

    const stamps =

    Number(

        data.stamps || 0

    );

    if(stamps >= MAX_STAMPS){

        personalMessage.textContent =

        "Your reward is unlocked. Visit Rio Maggi Point and claim your Free Veg Maggi.";

    }

    else{

        const remaining =

        MAX_STAMPS - stamps;

        personalMessage.textContent =

        `Only ${remaining} more stamp${remaining === 1 ? "" : "s"} to unlock your Free Veg Maggi reward.`;

    }

}


/* =========================================================
   CLAIM REWARD
========================================================= */

if(claimRewardButton){

    claimRewardButton.addEventListener(

        "click",

        ()=>{

            window.location.href =
            "../reward/reward.html";

        }

    );

}


/* =========================================================
   FILE : male.js
   PART : 4/4 CONTINUES...
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 4/4

   NAVIGATION + REFRESH + END
========================================================= */

/* =========================================================
   LOAD BOTTOM NAVIGATION
========================================================= */

async function loadNavigation(){

    if(!navigationContainer) return;

    try{

        const response =

        await fetch(

            "../components/bottom-nav.html"

        );

        if(!response.ok) return;

        navigationContainer.innerHTML =

        await response.text();

    }

    catch(error){

        console.error(

            "Navigation Load Error:",

            error

        );

    }

}


/* =========================================================
   REFRESH DASHBOARD
========================================================= */

async function refreshDashboard(){

    if(!currentUser) return;

    try{

        await loadCustomerData(

            currentUser

        );

    }

    catch(error){

        console.error(

            "Dashboard Refresh Error:",

            error

        );

    }

}


/* =========================================================
   WINDOW EVENTS
========================================================= */

window.addEventListener(

    "focus",

    ()=>{

        refreshDashboard();

    }

);

window.addEventListener(

    "online",

    ()=>{

        refreshDashboard();

    }

);

window.addEventListener(

    "offline",

    ()=>{

        console.warn(

            "Internet connection lost."

        );

    }

);

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            document.visibilityState ===

            "visible"

        ){

            refreshDashboard();

        }

    }

);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(

    "error",

    (event)=>{

        console.error(

            "Male Dashboard Error:",

            event.error

        );

    }

);


/* =========================================================
   INITIALIZED
========================================================= */

console.log(

    "================================"

);

console.log(

    "Rio Maggi Point"

);

console.log(

    "Male Premium Dashboard Ready"

);

console.log(

    "================================"

);


/* =========================================================
   FILE : male.js
   PART : 4/4 END

   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD
========================================================= */
