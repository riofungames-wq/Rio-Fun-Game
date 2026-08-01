/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 1/4 FIXED

   FIREBASE
   DOM
   LOADER
   WELCOME ANIMATION
   SAFE UTILITIES
========================================================= */


/* =========================================================
   FIREBASE CONFIG
========================================================= */

import {

    auth,

    db

} from "../js/firebase-config.js";


/* =========================================================
   FIREBASE AUTH
========================================================= */

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/* =========================================================
   FIREBASE FIRESTORE
========================================================= */

import {

    doc,

    getDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   CONSTANTS
========================================================= */

const MAX_STAMPS = 6;


/* =========================================================
   DOM ELEMENTS
========================================================= */


/* LOADER */

const loader =

    document.getElementById(

        "maleDashboardLoader"

    );


/* WELCOME ANIMATION */

const welcomeAnimation =

    document.getElementById(

        "maleWelcomeAnimation"

    );


/* WELCOME SECTION */

const welcomeSection =

    document.getElementById(

        "maleWelcomeSection"

    );


/* WELCOME USER NAME */

const welcomeUser =

    document.getElementById(

        "maleUserName"

    );


/* PROFILE NAME */

const profileName =

    document.getElementById(

        "maleProfileName"

    );


/* MEMBER SINCE */

const memberSince =

    document.getElementById(

        "maleMemberSince"

    );


/* USER AVATAR */

const avatar =

    document.getElementById(

        "maleUserAvatar"

    );


/* PROGRESS TEXT */

const progressText =

    document.getElementById(

        "maleProgressText"

    );


/* PROGRESS BAR */

const stampProgress =

    document.getElementById(

        "maleStampProgress"

    );


/* PROGRESS MESSAGE */

const progressMessage =

    document.getElementById(

        "maleProgressMessage"

    );


/* REWARD STATUS */

const rewardStampStatus =

    document.getElementById(

        "maleRewardStampStatus"

    );


/* REWARD PROGRESS */

const rewardProgressFill =

    document.getElementById(

        "maleRewardProgressFill"

    );


/* REWARD MESSAGE */

const rewardMessage =

    document.getElementById(

        "maleRewardMessage"

    );


/* REWARD LOCK STATUS */

const rewardLockStatus =

    document.getElementById(

        "maleRewardLockStatus"

    );


/* CLAIM REWARD BUTTON */

const claimRewardButton =

    document.getElementById(

        "maleClaimRewardButton"

    );


/* PERSONAL GREETING */

const personalGreeting =

    document.getElementById(

        "malePersonalGreeting"

    );


/* PERSONAL MESSAGE */

const personalMessage =

    document.getElementById(

        "malePersonalMessage"

    );


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let currentUser = null;

let customerData = null;


/* =========================================================
   LOADER
========================================================= */

function showLoader(){

    if(!loader){

        return;

    }


    loader.classList.remove(

        "hidden"

    );


    loader.setAttribute(

        "aria-hidden",

        "false"

    );

}


/* =========================================================
   HIDE LOADER
========================================================= */

function hideLoader(){

    if(!loader){

        return;

    }


    setTimeout(()=>{

        loader.classList.add(

            "hidden"

        );


        loader.setAttribute(

            "aria-hidden",

            "true"

        );

    },500);

}


/* =========================================================
   WELCOME ANIMATION
========================================================= */

function showWelcomeAnimation(){

    if(!welcomeAnimation){

        return;

    }


    welcomeAnimation.classList.remove(

        "hidden"

    );


    welcomeAnimation.setAttribute(

        "aria-hidden",

        "false"

    );

}


/* =========================================================
   HIDE WELCOME ANIMATION
========================================================= */

function hideWelcomeAnimation(){

    if(!welcomeAnimation){

        return;

    }


    setTimeout(()=>{

        welcomeAnimation.classList.add(

            "hidden"

        );


        welcomeAnimation.setAttribute(

            "aria-hidden",

            "true"

        );

    },1800);

}


/* =========================================================
   WELCOME SECTION ENTRY ANIMATION
========================================================= */

function playWelcomeSectionAnimation(){

    if(!welcomeSection){

        return;

    }


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
   SAFE TEXT UPDATE
========================================================= */

function setText(

    element,

    value

){

    if(!element){

        return;

    }


    element.textContent =

        value;

}


/* =========================================================
   SAFE IMAGE UPDATE
========================================================= */

function setAvatar(

    element,

    imageUrl

){

    if(

        !element ||

        !imageUrl

    ){

        return;

    }


    element.src =

        imageUrl;

}


/* =========================================================
   SAFE STAMP VALUE
========================================================= */

function sanitizeStamps(

    value

){

    const number =

        Number(value);


    if(

        !Number.isFinite(number)

    ){

        return 0;

    }


    return Math.min(

        Math.max(

            Math.floor(number),

            0

        ),

        MAX_STAMPS

    );

}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

function initializeDashboard(){

    showLoader();

    playWelcomeSectionAnimation();

}


/* =========================================================
   DOM READY
========================================================= */

if(

    document.readyState ===

    "loading"

){

    document.addEventListener(

        "DOMContentLoaded",

        initializeDashboard,

        {

            once:true

        }

    );

}

else{

    initializeDashboard();

}


/* =========================================================
   FILE : male.js
   PART : 1/4 FIXED END

   NEXT :
   PART 2/4

   AUTH CHECK
   FIREBASE CUSTOMER DATA
   PROFILE UPDATE
   FALLBACK PROFILE
========================================================= *//* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 2/4 FIXED

   AUTHENTICATION
   CUSTOMER DATA
   PROFILE
   AVATAR
   MEMBER SINCE
   FALLBACK
========================================================= */


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

onAuthStateChanged(

    auth,

    async(user)=>{

        /* =================================================
           USER NOT LOGGED IN
        ================================================= */

        if(!user){

            currentUser = null;

            customerData = null;

            hideLoader();

            window.location.replace(

                "../login.html"

            );

            return;

        }


        /* =================================================
           CURRENT USER
        ================================================= */

        currentUser = user;


        try{

            /* =============================================
               LOAD FIREBASE CUSTOMER DATA
            ============================================= */

            await loadCustomerData(

                user

            );


            /* =============================================
               WELCOME ANIMATION
            ============================================= */

            showWelcomeAnimation();

            hideWelcomeAnimation();


            /* =============================================
               WELCOME SECTION
            ============================================= */

            playWelcomeSectionAnimation();


            /* =============================================
               HIDE LOADER
            ============================================= */

            hideLoader();


        }

        catch(error){

            console.error(

                "RIO MAGGI POINT | Dashboard Error:",

                error

            );


            /* =============================================
               FALLBACK TO FIREBASE AUTH DATA
            ============================================= */

            applyFallbackProfile(

                user

            );


            /* =============================================
               SHOW SAFE DEFAULT STAMP DATA
            ============================================= */

            updateStampSystem({

                stamps:0

            });


            updateRewardStatus({

                stamps:0

            });


            hideLoader();

        }

    }

);


/* =========================================================
   LOAD CUSTOMER DATA
========================================================= */

async function loadCustomerData(

    user

){

    if(!user || !user.uid){

        throw new Error(

            "Invalid Firebase user."

        );

    }


    /* =====================================================
       CUSTOMER DOCUMENT

       customers/{uid}
    ===================================================== */

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


    /* =====================================================
       CUSTOMER DOCUMENT NOT FOUND

       Use Firebase Auth Profile
    ===================================================== */

    if(

        !customerSnap.exists()

    ){

        customerData = {

            fullName:

                user.displayName ||

                "Customer",

            photoURL:

                user.photoURL ||

                "",

            memberSince:

                "",

            stamps:0

        };


        applyFallbackProfile(

            user

        );


        updateStampSystem(

            customerData

        );


        updateRewardStatus(

            customerData

        );


        return;

    }


    /* =====================================================
       CUSTOMER DATA
    ===================================================== */

    customerData =

        customerSnap.data() || {};


    /* =====================================================
       UPDATE PROFILE
    ===================================================== */

    updateProfile(

        customerData,

        user

    );


    /* =====================================================
       UPDATE LOYALTY SYSTEM
    ===================================================== */

    updateStampSystem(

        customerData

    );


    /* =====================================================
       UPDATE REWARD
    ===================================================== */

    updateRewardStatus(

        customerData

    );

}


/* =========================================================
   UPDATE CUSTOMER PROFILE
========================================================= */

function updateProfile(

    data,

    user

){

    data =

        data || {};


    /* =====================================================
       FULL NAME

       Priority:

       1. fullName
       2. name
       3. Firebase displayName
       4. Customer
    ===================================================== */

    const fullName =

        String(

            data.fullName ||

            data.name ||

            user?.displayName ||

            "Customer"

        ).trim() || "Customer";


    /* =====================================================
       UPDATE WELCOME NAME
    ===================================================== */

    setText(

        welcomeUser,

        fullName

    );


    /* =====================================================
       UPDATE PROFILE NAME
    ===================================================== */

    setText(

        profileName,

        fullName

    );


    /* =====================================================
       MEMBER SINCE

       Keep only date/value here.

       HTML already contains:
       Member Since
    ===================================================== */

    const memberDate =

        data.memberSince ||

        data.createdAt ||

        "";


    if(

        memberDate

    ){

        setText(

            memberSince,

            formatMemberSince(

                memberDate

            )

        );

    }

    else{

        setText(

            memberSince,

            "Premium Member"

        );

    }


    /* =====================================================
       AVATAR

       Priority:

       1. photoURL from Firestore
       2. Firebase Auth photoURL
       3. Existing HTML avatar
    ===================================================== */

    const photoURL =

        data.photoURL ||

        user?.photoURL ||

        "";


    if(photoURL){

        setAvatar(

            avatar,

            photoURL

        );

    }

}


/* =========================================================
   FORMAT MEMBER SINCE
========================================================= */

function formatMemberSince(

    value

){

    /* =====================================================
       FIREBASE TIMESTAMP
    ===================================================== */

    if(

        value &&

        typeof value.toDate ===

        "function"

    ){

        const date =

            value.toDate();


        return date.toLocaleDateString(

            "en-IN",

            {

                day:"2-digit",

                month:"short",

                year:"numeric"

            }

        );

    }


    /* =====================================================
       JAVASCRIPT DATE
    ===================================================== */

    if(

        value instanceof Date

    ){

        return value.toLocaleDateString(

            "en-IN",

            {

                day:"2-digit",

                month:"short",

                year:"numeric"

            }

        );

    }


    /* =====================================================
       STRING / NUMBER DATE
    ===================================================== */

    const date =

        new Date(

            value

        );


    if(

        !Number.isNaN(

            date.getTime()

        )

    ){

        return date.toLocaleDateString(

            "en-IN",

            {

                day:"2-digit",

                month:"short",

                year:"numeric"

            }

        );

    }


    /* =====================================================
       IF ALREADY A NORMAL TEXT VALUE
    ===================================================== */

    return String(

        value

    );

}


/* =========================================================
   FALLBACK PROFILE
========================================================= */

function applyFallbackProfile(

    user

){

    if(!user){

        return;

    }


    const name =

        String(

            user.displayName ||

            "Customer"

        ).trim() || "Customer";


    /* =====================================================
       NAME
    ===================================================== */

    setText(

        welcomeUser,

        name

    );


    setText(

        profileName,

        name

    );


    /* =====================================================
       MEMBER SINCE
    ===================================================== */

    setText(

        memberSince,

        "Premium Member"

    );


    /* =====================================================
       AVATAR
    ===================================================== */

    if(

        user.photoURL

    ){

        setAvatar(

            avatar,

            user.photoURL

        );

    }

}


/* =========================================================
   FILE : male.js
   PART : 2/4 FIXED END

   NEXT :
   PART 3/4

   LOYALTY STAMPS
   PROGRESS BAR
   REWARD UNLOCK
   CLAIM BUTTON
   PERSONAL GREETING
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 3/4 FIXED

   LOYALTY STAMPS
   PROGRESS BAR
   REWARD SYSTEM
   CLAIM REWARD
   PERSONAL GREETING
========================================================= */


/* =========================================================
   STAMP SYSTEM
========================================================= */

function updateStampSystem(

    data

){

    data =

        data || {};


    /* =====================================================
       GET SAFE STAMP VALUE

       Maximum = 6
    ===================================================== */

    const stamps =

        sanitizeStamps(

            data.stamps

        );


    /* =====================================================
       CALCULATE PROGRESS
    ===================================================== */

    const progress =

        (

            stamps /

            MAX_STAMPS

        ) * 100;


    /* =====================================================
       UPDATE PROGRESS TEXT

       Example:
       0 of 6 Stamps
       3 of 6 Stamps
       6 of 6 Stamps
    ===================================================== */

    setText(

        progressText,

        `${stamps} of ${MAX_STAMPS} Stamps`

    );


    /* =====================================================
       UPDATE MAIN PROGRESS BAR
    ===================================================== */

    if(stampProgress){

        stampProgress.style.width =

            `${progress}%`;


        stampProgress.setAttribute(

            "aria-valuenow",

            String(stamps)

        );

    }


    /* =====================================================
       UPDATE PROGRESS MESSAGE
    ===================================================== */

    if(progressMessage){

        if(

            stamps >= MAX_STAMPS

        ){

            progressMessage.textContent =

                "Congratulations! Your Free Veg Maggi reward is unlocked. 🎉";

        }

        else{

            const remaining =

                MAX_STAMPS -

                stamps;


            progressMessage.textContent =

                `Collect ${remaining} more stamp${

                    remaining === 1

                        ? ""

                        : "s"

                } to unlock your Free Veg Maggi.`;

        }

    }


    /* =====================================================
       UPDATE PERSONAL MESSAGE
    ===================================================== */

    updatePersonalMessage(

        stamps

    );

}


/* =========================================================
   REWARD STATUS
========================================================= */

function updateRewardStatus(

    data

){

    data =

        data || {};


    /* =====================================================
       GET SAFE STAMP VALUE
    ===================================================== */

    const stamps =

        sanitizeStamps(

            data.stamps

        );


    /* =====================================================
       CALCULATE REWARD PROGRESS
    ===================================================== */

    const progress =

        (

            stamps /

            MAX_STAMPS

        ) * 100;


    /* =====================================================
       UPDATE REWARD STAMP STATUS

       Example:
       0 / 6
       3 / 6
       6 / 6
    ===================================================== */

    setText(

        rewardStampStatus,

        `${stamps} / ${MAX_STAMPS}`

    );


    /* =====================================================
       UPDATE REWARD PROGRESS BAR
    ===================================================== */

    if(rewardProgressFill){

        rewardProgressFill.style.width =

            `${progress}%`;

    }


    /* =====================================================
       UPDATE ARIA VALUE
    ===================================================== */

    if(

        rewardProgressFill &&

        rewardProgressFill.parentElement

    ){

        rewardProgressFill.parentElement.setAttribute(

            "aria-valuenow",

            String(stamps)

        );

    }


    /* =====================================================
       CHECK REWARD UNLOCK
    ===================================================== */

    if(

        stamps >= MAX_STAMPS

    ){

        unlockReward();

    }

    else{

        lockReward(

            stamps

        );

    }

}


/* =========================================================
   UNLOCK REWARD
========================================================= */

function unlockReward(){

    /* =====================================================
       REWARD STATUS
    ===================================================== */

    setText(

        rewardStampStatus,

        `${MAX_STAMPS} / ${MAX_STAMPS}`

    );


    /* =====================================================
       REWARD MESSAGE
    ===================================================== */

    setText(

        rewardMessage,

        "Congratulations! Your Free Veg Maggi is ready to claim. 🎉"

    );


    /* =====================================================
       LOCK STATUS
    ===================================================== */

    if(rewardLockStatus){

        rewardLockStatus.innerHTML =

            `

            <i class="fa-solid fa-unlock"></i>

            <span>

                Reward Unlocked

            </span>

            `;


        rewardLockStatus.classList.add(

            "reward-unlocked"

        );

        rewardLockStatus.classList.remove(

            "reward-locked"

        );

    }


    /* =====================================================
       CLAIM BUTTON

       hidden = false
    ===================================================== */

    if(claimRewardButton){

        claimRewardButton.hidden =

            false;

        claimRewardButton.disabled =

            false;

        claimRewardButton.setAttribute(

            "aria-disabled",

            "false"

        );

    }

}


/* =========================================================
   LOCK REWARD
========================================================= */

function lockReward(

    stamps

){

    const remaining =

        MAX_STAMPS -

        stamps;


    /* =====================================================
       REWARD MESSAGE
    ===================================================== */

    setText(

        rewardMessage,

        `Collect ${remaining} more stamp${

            remaining === 1

                ? ""

                : "s"

        } to unlock your Free Veg Maggi.`

    );


    /* =====================================================
       LOCK STATUS
    ===================================================== */

    if(rewardLockStatus){

        rewardLockStatus.innerHTML =

            `

            <i class="fa-solid fa-lock"></i>

            <span>

                Reward Locked

            </span>

            `;


        rewardLockStatus.classList.add(

            "reward-locked"

        );

        rewardLockStatus.classList.remove(

            "reward-unlocked"

        );

    }


    /* =====================================================
       CLAIM BUTTON

       Keep hidden until 6 stamps
    ===================================================== */

    if(claimRewardButton){

        claimRewardButton.hidden =

            true;

        claimRewardButton.disabled =

            true;

        claimRewardButton.setAttribute(

            "aria-disabled",

            "true"

        );

    }

}


/* =========================================================
   PERSONAL MESSAGE
========================================================= */

function updatePersonalMessage(

    stamps

){

    if(!personalMessage){

        return;

    }


    /* =====================================================
       6 STAMPS
    ===================================================== */

    if(

        stamps >= MAX_STAMPS

    ){

        personalMessage.textContent =

            "Amazing! You completed your loyalty journey. Your Free Veg Maggi reward is ready to claim. 🎉";

        return;

    }


    /* =====================================================
       0 STAMPS
    ===================================================== */

    if(

        stamps === 0

    ){

        personalMessage.textContent =

            "Start your loyalty journey today. Every eligible purchase brings you closer to your Free Veg Maggi reward.";

        return;

    }


    /* =====================================================
       1–5 STAMPS
    ===================================================== */

    const remaining =

        MAX_STAMPS -

        stamps;


    personalMessage.textContent =

        `Great progress! You have ${stamps} stamp${

            stamps === 1

                ? ""

                : "s"

        }. Only ${remaining} more to unlock your Free Veg Maggi reward.`;

}


/* =========================================================
   PERSONAL GREETING
========================================================= */

function updatePersonalGreeting(

){

    if(!personalGreeting){

        return;

    }


    const hour =

        new Date().getHours();


    let greeting = "";


    /* =====================================================
       MORNING
    ===================================================== */

    if(

        hour < 12

    ){

        greeting =

            "Good Morning ☀️";

    }


    /* =====================================================
       AFTERNOON
    ===================================================== */

    else if(

        hour < 17

    ){

        greeting =

            "Good Afternoon 🌤️";

    }


    /* =====================================================
       EVENING
    ===================================================== */

    else{

        greeting =

            "Good Evening 🌙";

    }


    /* =====================================================
       UPDATE GREETING
    ===================================================== */

    personalGreeting.textContent =

        greeting;

}


/* =========================================================
   INITIAL GREETING
========================================================= */

updatePersonalGreeting();


/* =========================================================
   CLAIM REWARD EVENT
========================================================= */

if(claimRewardButton){

    claimRewardButton.addEventListener(

        "click",

        ()=>{

            /* =============================================
               SAFETY CHECK

               User must have 6 stamps
            ============================================= */

            const stamps =

                sanitizeStamps(

                    customerData?.stamps

                );


            if(

                stamps < MAX_STAMPS

            ){

                console.warn(

                    "Reward cannot be claimed before 6 stamps."

                );

                return;

            }


            /* =============================================
               OPEN REWARD PAGE
            ============================================= */

            window.location.href =

                "../reward.html";

        }

    );

}


/* =========================================================
   FILE : male.js
   PART : 3/4 FIXED END

   NEXT :
   PART 4/4

   BOTTOM NAVIGATION
   QUICK ACTIONS
   CARD ANIMATION
   FINAL INITIALIZATION
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   FILE : male.js
   PART : 4/4 FIXED

   BOTTOM NAVIGATION
   QUICK ACTIONS
   CARD ANIMATION
   GAME BUTTON
   FINAL INITIALIZATION
========================================================= */


/* =========================================================
   COMMON BOTTOM NAVIGATION
========================================================= */

const navigationContainer =

    document.getElementById(

        "commonNavigationContainer"

    );


/* =========================================================
   NAVIGATION ITEMS
========================================================= */

function loadBottomNavigation(){

    if(!navigationContainer){

        return;

    }


    /* =====================================================
       PREVENT DUPLICATE NAVIGATION
    ===================================================== */

    navigationContainer.innerHTML =

        "";


    /* =====================================================
       NAVIGATION HTML

       Paths are based on:

       loyalty/male-dashboard.html
    ===================================================== */

    navigationContainer.innerHTML =

        `

        <a
            href="../index.html"
            data-nav="home"
            aria-label="Home">

            <i class="fa-solid fa-house"></i>

            <span>
                Home
            </span>

        </a>


        <a
            href="../qr.html"
            data-nav="qr"
            aria-label="Scan QR">

            <i class="fa-solid fa-qrcode"></i>

            <span>
                QR
            </span>

        </a>


        <a
            href="../reward.html"
            data-nav="reward"
            aria-label="Rewards">

            <i class="fa-solid fa-gift"></i>

            <span>
                Reward
            </span>

        </a>


        <a
            href="../profile.html"
            data-nav="profile"
            aria-label="Profile">

            <i class="fa-solid fa-user"></i>

            <span>
                Profile
            </span>

        </a>

        `;


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    setActiveNavigation();

}


/* =========================================================
   SET ACTIVE NAVIGATION
========================================================= */

function setActiveNavigation(){

    if(!navigationContainer){

        return;

    }


    const currentFile =

        window.location.pathname

            .split("/")

            .pop()

            .toLowerCase();


    const navigationLinks =

        navigationContainer.querySelectorAll(

            "a[data-nav]"

        );


    navigationLinks.forEach(

        (link)=>{

            const href =

                link.getAttribute(

                    "href"

                );


            if(!href){

                return;

            }


            const targetFile =

                href

                    .split("/")

                    .pop()

                    .toLowerCase();


            if(

                targetFile &&

                targetFile === currentFile

            ){

                link.classList.add(

                    "active"

                );


                link.setAttribute(

                    "aria-current",

                    "page"

                );

            }

        }

    );

}


/* =========================================================
   QUICK ACTION ANIMATION
========================================================= */

function initializeQuickActions(){

    const actionCards =

        document.querySelectorAll(

            ".action-card"

        );


    actionCards.forEach(

        (card)=>{

            card.addEventListener(

                "click",

                ()=>{

                    card.classList.add(

                        "button-click"

                    );


                    setTimeout(

                        ()=>{

                            card.classList.remove(

                                "button-click"

                            );

                        },

                        250

                    );

                }

            );

        }

    );

}


/* =========================================================
   FREE GAME BUTTON
========================================================= */

function initializeGameButton(){

    const gameButton =

        document.querySelector(

            '.action-card[data-action="game"]'

        );


    if(!gameButton){

        return;

    }


    gameButton.addEventListener(

        "click",

        ()=>{

            console.log(

                "RIO FUN GAME | Opening Game Homepage"

            );

        }

    );

}


/* =========================================================
   CARD ENTRY ANIMATION
========================================================= */

function initializeCardAnimations(){

    const dashboardCards =

        document.querySelectorAll(

            `

            .male-user-info,

            .male-profile-card,

            .male-progress-card,

            .male-quick-actions,

            .male-reward-card,

            .male-personal-card,

            .male-tips-card,

            .male-motivation-banner,

            .summary-card

            `

        );


    dashboardCards.forEach(

        (card,index)=>{

            card.style.opacity =

                "0";


            card.style.animation =

                "cardFade .7s ease forwards";


            card.style.animationDelay =

                `${index * 0.12}s`;

        }

    );

}


/* =========================================================
   AVATAR ERROR HANDLING
========================================================= */

function initializeAvatarFallback(){

    if(!avatar){

        return;

    }


    avatar.addEventListener(

        "error",

        ()=>{

            /* =============================================
               Prevent Infinite Error Loop
            ============================================= */

            avatar.onerror =

                null;


            /* =============================================
               Keep Existing HTML Avatar

               If Firebase image fails,
               browser will keep the current fallback
               only when a fallback is available.
            ============================================= */

            avatar.src =

                "../assets/avatars/male.png";

        }

    );

}


/* =========================================================
   REWARD BUTTON SAFETY
========================================================= */

function initializeRewardButton(){

    if(!claimRewardButton){

        return;

    }


    /* =====================================================
       ALWAYS LOCK AT INITIAL PAGE LOAD

       It will be unlocked by updateRewardStatus()
       after Firebase data is loaded.
    ===================================================== */

    claimRewardButton.hidden =

        true;


    claimRewardButton.disabled =

        true;

}


/* =========================================================
   FINAL PAGE INITIALIZATION
========================================================= */

function initializeDashboardFeatures(){

    loadBottomNavigation();

    initializeQuickActions();

    initializeGameButton();

    initializeCardAnimations();

    initializeAvatarFallback();

    initializeRewardButton();

}


/* =========================================================
   INITIALIZE FEATURES
========================================================= */

if(

    document.readyState ===

    "loading"

){

    document.addEventListener(

        "DOMContentLoaded",

        initializeDashboardFeatures,

        {

            once:true

        }

    );

}

else{

    initializeDashboardFeatures();

}


/* =========================================================
   WINDOW LOAD
========================================================= */

window.addEventListener(

    "load",

    ()=>{

        hideLoader();

    },

    {

        once:true

    }

);


/* =========================================================
   GLOBAL ERROR HANDLING
========================================================= */

window.addEventListener(

    "error",

    (event)=>{

        console.error(

            "RIO MAGGI POINT | Dashboard Error:",

            event.error ||

            event.message

        );

    }

);


/* =========================================================
   UNHANDLED PROMISE ERROR
========================================================= */

window.addEventListener(

    "unhandledrejection",

    (event)=>{

        console.error(

            "RIO MAGGI POINT | Unhandled Promise Error:",

            event.reason

        );

    }

);


/* =========================================================
   FINAL CONSOLE
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

    "6 Stamp Loyalty System Active"

);


console.log(

    "Firebase Authentication Active"

);


console.log(

    "================================"

);


/* =========================================================
   FILE : male.js
   PART : 4/4 FIXED END

   RIO MAGGI POINT
   MALE PREMIUM DASHBOARD

   COMPLETE FIXED JAVASCRIPT
========================================================= */
