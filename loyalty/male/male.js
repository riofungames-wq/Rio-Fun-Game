/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 1/4

   FIREBASE + LOADER + WELCOME
========================================================= */

import { auth, db } from "../js/firebase-config.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

    doc,

    getDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* =========================================================
   DOM
========================================================= */

const loader =

document.getElementById(

    "maleDashboardLoader"

);

const welcomeSection =

document.getElementById(

    "maleWelcomeSection"

);

const welcomeUser =

document.getElementById(

    "maleUserName"

);

const profileName =

document.getElementById(

    "maleProfileName"

);

const memberSince =

document.getElementById(

    "maleMemberSince"

);

const avatar =

document.getElementById(

    "maleUserAvatar"

);

const stampCount =

document.getElementById(

    "maleStampCount"

);

const stampProgress =

document.getElementById(

    "maleStampProgress"

);

const rewardStatus =

document.getElementById(

    "maleRewardStatus"

);

/* =========================================================
   VARIABLES
========================================================= */

const MAX_STAMPS = 6;

let currentUser = null;

let customerData = null;

/* =========================================================
   LOADER
========================================================= */

function showLoader(){

    if(!loader) return;

    loader.classList.remove(

        "hidden"

    );

}

function hideLoader(){

    if(!loader) return;

    setTimeout(()=>{

        loader.classList.add(

            "hidden"

        );

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

                transform:

                "translateY(35px)"

            },

            {

                opacity:1,

                transform:

                "translateY(0)"

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
   PAGE READY
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        showLoader();

        playWelcomeAnimation();

    }

);

/* =========================================================
   AUTH CHECK

   FILE : male.js
   PART : 2/4 CONTINUES...
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 2/4

   AUTH + CUSTOMER DATA
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

            "../login.html";

            return;

        }

        currentUser = user;

        try{

            await loadCustomerData(user);

        }

        catch(error){

            console.error(

                "Dashboard Error:",

                error

            );

            hideLoader();

        }

    }

);

/* =========================================================
   LOAD CUSTOMER
========================================================= */

async function loadCustomerData(user){

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

    if(!customerSnap.exists()){

        applyFallbackProfile(user);

        hideLoader();

        return;

    }

    customerData =

    customerSnap.data();

    updateProfile(

        customerData

    );

    updateStampSystem(

        customerData

    );

    updateRewardStatus(

        customerData

    );

    hideLoader();

}

/* =========================================================
   PROFILE
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

    if(

        data.memberSince

    ){

        memberSince.textContent =

        "Member Since " +

        data.memberSince;

    }

    if(

        avatar &&

        data.photoURL

    ){

        avatar.src =

        data.photoURL;

    }

}

/* =========================================================
   FALLBACK
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
   FILE : male.js
   PART : 3/4 CONTINUES...
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 3/4

   STAMP + REWARD + PERSONAL SECTION
========================================================= */

/* =========================================================
   STAMP SYSTEM
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

    stampProgress.style.width =

    progress + "%";

}

/* =========================================================
   REWARD STATUS
========================================================= */

function updateRewardStatus(data){

    const stamps =

    Number(

        data.stamps || 0

    );

    if(

        stamps >= MAX_STAMPS

    ){

        rewardStatus.textContent =

        "Unlocked";

    }

    else{

        rewardStatus.textContent =

        "Locked";

    }

}

/* =========================================================
   PERSONAL GREETING
========================================================= */

function getGreeting(){

    const hour =

    new Date().getHours();

    if(hour < 12){

        return "Good Morning ☀️";

    }

    if(hour < 17){

        return "Good Afternoon 🌤️";

    }

    return "Good Evening 🌙";

}

const greetingElement =

document.getElementById(

    "malePersonalGreeting"

);

if(greetingElement){

    greetingElement.textContent =

    getGreeting();

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

   BUTTON EVENTS + CARD ANIMATION + FINISH
========================================================= */

/* =========================================================
   CLAIM REWARD
========================================================= */

const claimRewardButton =

document.getElementById(

    "maleClaimRewardButton"

);

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
   CARD ENTRY ANIMATION
========================================================= */

const dashboardCards =

document.querySelectorAll(

    ".summary-card, .male-profile-card, .male-progress-card, .male-quick-actions, .male-reward-card, .male-personal-card, .male-tips-card"

);

dashboardCards.forEach(

    (card,index)=>{

        card.style.opacity="0";

        card.style.animation=

        `cardFade .7s ease forwards`;

        card.style.animationDelay=

        `${index*0.12}s`;

    }

);

/* =========================================================
   QUICK ACTION BUTTONS
========================================================= */

document.querySelectorAll(

    ".action-card"

).forEach(

    (button)=>{

        button.addEventListener(

            "click",

            ()=>{

                button.classList.add(

                    "button-click"

                );

                setTimeout(()=>{

                    button.classList.remove(

                        "button-click"

                    );

                },250);

            }

        );

    }

);

/* =========================================================
   PAGE READY
========================================================= */

window.addEventListener(

    "load",

    ()=>{

        hideLoader();

    }

);

/* =========================================================
   READY
========================================================= */

console.log(

    "================================"

);

console.log(

    "RIO MAGGI POINT"

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

   COMPLETE
========================================================= */
