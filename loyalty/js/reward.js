/* =========================================================
   RIO MAGGI POINT
   PREMIUM REWARD SYSTEM

   FILE : reward.js
   PART : 1/4 FIXED

   FIREBASE AUTH
   CUSTOMER DATA
   LOADER
   DOM
========================================================= */


/* =========================================================
   FIREBASE CONFIG
========================================================= */

import {

    auth,

    db

} from "./firebase-config.js";


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

    getDoc,

    runTransaction,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   CONSTANTS
========================================================= */

const MAX_STAMPS = 6;


/* =========================================================
   DOM ELEMENTS
========================================================= */


/* PAGE LOADER */

const rewardLoader =

    document.getElementById(

        "rewardLoader"

    );


/* CUSTOMER PHOTO */

const rewardPhoto =

    document.getElementById(

        "rewardPhoto"

    );


/* CUSTOMER NAME */

const rewardName =

    document.getElementById(

        "rewardName"

    );


/* MEMBER ID */

const rewardMemberId =

    document.getElementById(

        "rewardMemberId"

    );


/* REWARD STATUS */

const rewardStatus =

    document.getElementById(

        "rewardStatus"

    );


/* PROGRESS BAR */

const rewardProgressFill =

    document.getElementById(

        "rewardProgressFill"

    );


/* STAMP COUNT */

const rewardStampCount =

    document.getElementById(

        "rewardStampCount"

    );


/* CLAIM BUTTON */

const claimRewardBtn =

    document.getElementById(

        "claimRewardBtn"

    );


/* CLAIM MESSAGE */

const claimMessage =

    document.getElementById(

        "claimMessage"

    );


/* CLAIM PROCESSING */

const claimProcessing =

    document.getElementById(

        "claimProcessing"

    );


/* REDEEM STATUS */

const redeemStatus =

    document.getElementById(

        "redeemStatus"

    );


/* INFORMATION CARD */

const infoStampCount =

    document.getElementById(

        "infoStampCount"

    );


const infoRewardStatus =

    document.getElementById(

        "infoRewardStatus"

    );


const infoMemberId =

    document.getElementById(

        "infoMemberId"

    );


/* =========================================================
   VARIABLES
========================================================= */

let currentUID = null;

let currentCustomer = null;


/* =========================================================
   LOADER
========================================================= */

function showRewardLoader(){

    if(!rewardLoader){

        return;

    }


    rewardLoader.hidden = false;

    rewardLoader.classList.remove(

        "hidden"

    );

}


function hideRewardLoader(){

    if(!rewardLoader){

        return;

    }


    rewardLoader.classList.add(

        "hidden"

    );


    setTimeout(

        ()=>{

            if(rewardLoader){

                rewardLoader.hidden = true;

            }

        },

        400

    );

}


/* =========================================================
   SAFE NUMBER
========================================================= */

function getSafeStampCount(value){

    const stamps =

        Number(value);


    if(

        !Number.isFinite(stamps) ||

        stamps < 0

    ){

        return 0;

    }


    return Math.min(

        Math.floor(stamps),

        MAX_STAMPS

    );

}


/* =========================================================
   AUTH STATE
========================================================= */

showRewardLoader();


onAuthStateChanged(

    auth,

    async(user)=>{

        /* ================================================
           USER NOT LOGGED IN
        ================================================= */

        if(!user){

            currentUID = null;

            currentCustomer = null;


            window.location.href =

                "login.html";


            return;

        }


        /* ================================================
           SAVE USER ID
        ================================================= */

        currentUID =

            user.uid;


        try{

            /* ============================================
               CUSTOMER DOCUMENT
            ============================================= */

            const customerRef =

                doc(

                    db,

                    "customers",

                    user.uid

                );


            /* ============================================
               GET CUSTOMER DATA
            ============================================= */

            const customerSnap =

                await getDoc(

                    customerRef

                );


            /* ============================================
               CUSTOMER NOT FOUND
            ============================================= */

            if(!customerSnap.exists()){

                console.error(

                    "Customer document not found:",

                    user.uid

                );


                currentCustomer = null;


                hideRewardLoader();


                if(rewardStatus){

                    rewardStatus.textContent =

                        "Customer Profile Not Found";

                }


                if(claimMessage){

                    claimMessage.textContent =

                        "Please complete your profile before using rewards.";

                }


                return;

            }


            /* ============================================
               SAVE CUSTOMER DATA
            ============================================= */

            currentCustomer =

                {

                    uid:user.uid,

                    ...customerSnap.data()

                };


            /* ============================================
               LOAD REWARD UI
            ============================================= */

            loadReward(

                currentCustomer

            );


        }

        catch(error){

            console.error(

                "RIO MAGGI POINT | Reward Load Error:",

                error

            );


            if(rewardStatus){

                rewardStatus.textContent =

                    "Unable To Load Reward";

            }


            if(claimMessage){

                claimMessage.textContent =

                    "Something went wrong while loading your reward.";

            }


            if(redeemStatus){

                redeemStatus.textContent =

                    "Error";

            }

        }

        finally{

            hideRewardLoader();

        }

    }

);


/* =========================================================
   FILE : reward.js
   PART : 1/4 FIXED END

   NEXT:
   PART 2/4
   LOAD REWARD UI
   STAMP STATUS
   REWARD UNLOCK LOGIC
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   PREMIUM REWARD SYSTEM

   FILE : reward.js
   PART : 2/4 FIXED

   CUSTOMER PROFILE
   STAMP PROGRESS
   REWARD UNLOCK
   REWARD UI UPDATE
========================================================= */


/* =========================================================
   LOAD REWARD DATA INTO UI
========================================================= */

function loadReward(customer){

    if(!customer){

        return;

    }


    /* =====================================================
       CUSTOMER NAME
    ====================================================== */

    const customerName =

        customer.fullName ||

        customer.name ||

        customer.displayName ||

        "Customer";


    if(rewardName){

        rewardName.textContent =

            customerName;

    }


    /* =====================================================
       CUSTOMER PHOTO
    ====================================================== */

    if(rewardPhoto){

        rewardPhoto.src =

            customer.photoURL ||

            customer.profilePhoto ||

            "assets/avatars/default.png";


        /* ================================================
           BROKEN IMAGE FALLBACK
        ================================================= */

        rewardPhoto.onerror =

            ()=>{

                rewardPhoto.onerror =

                    null;


                rewardPhoto.src =

                    "assets/avatars/default.png";

            };

    }


    /* =====================================================
       MEMBER ID
    ====================================================== */

    const memberId =

        customer.memberId ||

        customer.membershipId ||

        (

            currentUID

                ?

            `RIO-${currentUID.substring(0,8).toUpperCase()}`

                :

            "RIO-000000000"

        );


    if(rewardMemberId){

        rewardMemberId.textContent =

            memberId;

    }


    if(infoMemberId){

        infoMemberId.textContent =

            memberId;

    }


    /* =====================================================
       STAMP COUNT
    ====================================================== */

    const stamps =

        getSafeStampCount(

            customer.stamps

        );


    /* =====================================================
       REWARD CLAIMED STATE
    ====================================================== */

    const rewardClaimed =

        customer.rewardClaimed === true;


    /* =====================================================
       REWARD UNLOCK STATE

       IMPORTANT:

       Reward is considered available only when:

       1. 6 valid stamps exist
       2. Reward is not already claimed

       We also support existing rewardUnlocked
       data for compatibility.
    ====================================================== */

    const rewardUnlocked =

        (

            stamps >= MAX_STAMPS ||

            customer.rewardUnlocked === true

        )

        &&

        !rewardClaimed;


    /* =====================================================
       UPDATE STAMP COUNT
    ====================================================== */

    if(rewardStampCount){

        rewardStampCount.textContent =

            stamps;

    }


    if(infoStampCount){

        infoStampCount.textContent =

            `${stamps} / ${MAX_STAMPS}`;

    }


    /* =====================================================
       UPDATE PROGRESS BAR
    ====================================================== */

    const progressPercent =

        Math.min(

            (

                stamps /

                MAX_STAMPS

            ) * 100,

            100

        );


    if(rewardProgressFill){

        rewardProgressFill.style.width =

            `${progressPercent}%`;

    }


    /* =====================================================
       UPDATE ARIA PROGRESS
    ====================================================== */

    const progressBar =

        document.querySelector(

            ".progress-bar"

        );


    if(progressBar){

        progressBar.setAttribute(

            "aria-valuenow",

            stamps

        );

    }


    /* =====================================================
       REWARD ALREADY CLAIMED
    ====================================================== */

    if(rewardClaimed){

        updateRewardClaimedUI(

            stamps

        );

        return;

    }


    /* =====================================================
       REWARD UNLOCKED
    ====================================================== */

    if(rewardUnlocked){

        updateRewardUnlockedUI(

            stamps

        );

        return;

    }


    /* =====================================================
       REWARD LOCKED
    ====================================================== */

    updateRewardLockedUI(

        stamps

    );

}


/* =========================================================
   REWARD LOCKED UI
========================================================= */

function updateRewardLockedUI(stamps){

    const remaining =

        Math.max(

            MAX_STAMPS -

            stamps,

            0

        );


    /* =====================================================
       MAIN STATUS
    ====================================================== */

    if(rewardStatus){

        rewardStatus.textContent =

            "🔒 Reward Locked";

    }


    /* =====================================================
       CLAIM MESSAGE
    ====================================================== */

    if(claimMessage){

        if(remaining === 1){

            claimMessage.textContent =

                "Collect 1 more stamp to unlock your Free Veg Maggi.";

        }

        else{

            claimMessage.textContent =

                `Collect ${remaining} more stamps to unlock your Free Veg Maggi.`;

        }

    }


    /* =====================================================
       REDEEM STATUS
    ====================================================== */

    if(redeemStatus){

        redeemStatus.textContent =

            "Locked";

    }


    /* =====================================================
       INFORMATION CARD
    ====================================================== */

    if(infoRewardStatus){

        infoRewardStatus.textContent =

            "Locked";

    }


    /* =====================================================
       CLAIM BUTTON
    ====================================================== */

    if(claimRewardBtn){

        claimRewardBtn.disabled =

            true;


        claimRewardBtn.setAttribute(

            "aria-disabled",

            "true"

        );

    }

}


/* =========================================================
   REWARD UNLOCKED UI
========================================================= */

function updateRewardUnlockedUI(stamps){

    /* =====================================================
       MAIN STATUS
    ====================================================== */

    if(rewardStatus){

        rewardStatus.textContent =

            "🎉 Reward Unlocked";

    }


    /* =====================================================
       CLAIM MESSAGE
    ====================================================== */

    if(claimMessage){

        claimMessage.textContent =

            "Your Free Veg Maggi is ready to claim.";

    }


    /* =====================================================
       REDEEM STATUS
    ====================================================== */

    if(redeemStatus){

        redeemStatus.textContent =

            "Ready To Redeem";

    }


    /* =====================================================
       INFORMATION CARD
    ====================================================== */

    if(infoRewardStatus){

        infoRewardStatus.textContent =

            "Unlocked";

    }


    /* =====================================================
       CLAIM BUTTON
    ====================================================== */

    if(claimRewardBtn){

        claimRewardBtn.disabled =

            false;


        claimRewardBtn.setAttribute(

            "aria-disabled",

            "false"

        );

    }

}


/* =========================================================
   REWARD CLAIMED UI
========================================================= */

function updateRewardClaimedUI(stamps){

    /* =====================================================
       MAIN STATUS
    ====================================================== */

    if(rewardStatus){

        rewardStatus.textContent =

            "✅ Reward Claimed";

    }


    /* =====================================================
       CLAIM MESSAGE
    ====================================================== */

    if(claimMessage){

        claimMessage.textContent =

            "This reward has already been claimed.";

    }


    /* =====================================================
       REDEEM STATUS
    ====================================================== */

    if(redeemStatus){

        redeemStatus.textContent =

            "Claimed";

    }


    /* =====================================================
       INFORMATION CARD
    ====================================================== */

    if(infoRewardStatus){

        infoRewardStatus.textContent =

            "Claimed";

    }


    /* =====================================================
       CLAIM BUTTON
    ====================================================== */

    if(claimRewardBtn){

        claimRewardBtn.disabled =

            true;


        claimRewardBtn.setAttribute(

            "aria-disabled",

            "true"

        );

    }

}


/* =========================================================
   FILE : reward.js
   PART : 2/4 FIXED END

   NEXT:
   PART 3/4
   SECURE CLAIM
   FIRESTORE TRANSACTION
   DUPLICATE CLAIM PROTECTION
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   PREMIUM REWARD SYSTEM

   FILE : reward.js
   PART : 3/4 FIXED

   SECURE CLAIM FLOW
   FIRESTORE TRANSACTION
   DUPLICATE CLAIM PROTECTION
   CLAIM PROCESSING STATE
========================================================= */


/* =========================================================
   CLAIM BUTTON EVENT
========================================================= */

if(claimRewardBtn){

    claimRewardBtn.addEventListener(

        "click",

        async()=>{

            /* =============================================
               BASIC USER CHECK
            ============================================== */

            if(!currentUID){

                alert(

                    "Please login to claim your reward."

                );

                return;

            }


            /* =============================================
               CUSTOMER DATA CHECK
            ============================================== */

            if(!currentCustomer){

                alert(

                    "Customer information is not available."

                );

                return;

            }


            /* =============================================
               PREVENT DOUBLE CLICK
            ============================================== */

            if(

                claimRewardBtn.disabled ||

                claimRewardBtn.dataset.processing === "true"

            ){

                return;

            }


            /* =============================================
               CURRENT STAMP CHECK
            ============================================== */

            const currentStamps =

                getSafeStampCount(

                    currentCustomer.stamps

                );


            /* =============================================
               REWARD CLAIMED CHECK
            ============================================== */

            if(

                currentCustomer.rewardClaimed === true

            ){

                alert(

                    "This reward has already been claimed."

                );

                return;

            }


            /* =============================================
               6 STAMPS REQUIRED
            ============================================== */

            if(

                currentStamps < MAX_STAMPS &&

                currentCustomer.rewardUnlocked !== true

            ){

                alert(

                    `You need ${MAX_STAMPS - currentStamps} more stamp(s) to unlock this reward.`

                );

                return;

            }


            /* =============================================
               USER CONFIRMATION
            ============================================== */

            const confirmClaim =

                window.confirm(

                    "🎁 Claim your FREE VEG MAGGI reward now?"

                );


            if(!confirmClaim){

                return;

            }


            /* =============================================
               START PROCESSING
            ============================================== */

            setClaimProcessing(

                true

            );


            try{

                /* =========================================
                   CUSTOMER DOCUMENT
                ========================================== */

                const customerRef =

                    doc(

                        db,

                        "customers",

                        currentUID

                    );


                /* =========================================
                   FIRESTORE TRANSACTION

                   Transaction reads the latest server data
                   and prevents two simultaneous claims
                   from using the same reward.
                ========================================== */

                await runTransaction(

                    db,

                    async(transaction)=>{

                        const customerSnap =

                            await transaction.get(

                                customerRef

                            );


                        /* =================================
                           CUSTOMER DOCUMENT CHECK
                        ================================== */

                        if(

                            !customerSnap.exists()

                        ){

                            throw new Error(

                                "CUSTOMER_NOT_FOUND"

                            );

                        }


                        const latestCustomer =

                            customerSnap.data();


                        /* =================================
                           LATEST STAMP COUNT
                        ================================== */

                        const latestStamps =

                            getSafeStampCount(

                                latestCustomer.stamps

                            );


                        /* =================================
                           ALREADY CLAIMED CHECK

                           This check happens inside
                           the transaction.
                        ================================== */

                        if(

                            latestCustomer.rewardClaimed === true

                        ){

                            throw new Error(

                                "REWARD_ALREADY_CLAIMED"

                            );

                        }


                        /* =================================
                           LATEST UNLOCK CHECK
                        ================================== */

                        const latestRewardUnlocked =

                            (

                                latestStamps >= MAX_STAMPS ||

                                latestCustomer.rewardUnlocked === true

                            );


                        if(

                            !latestRewardUnlocked

                        ){

                            throw new Error(

                                "REWARD_NOT_UNLOCKED"

                            );

                        }


                        /* =================================
                           CLAIM REWARD

                           Current reward cycle is consumed.

                           New loyalty cycle starts from 0.
                        ================================== */

                        transaction.update(

                            customerRef,

                            {

                                stamps:0,

                                rewardUnlocked:false,

                                rewardClaimed:true,

                                rewardClaimDate:

                                    serverTimestamp(),

                                updatedAt:

                                    serverTimestamp()

                            }

                        );

                    }

                );


                /* =========================================
                   UPDATE LOCAL DATA

                   Keep UI synchronized after successful
                   Firestore transaction.
                ========================================== */

                currentCustomer =

                    {

                        ...currentCustomer,

                        stamps:0,

                        rewardUnlocked:false,

                        rewardClaimed:true

                    };


                /* =========================================
                   UPDATE UI
                ========================================== */

                if(rewardStampCount){

                    rewardStampCount.textContent =

                        "0";

                }


                if(infoStampCount){

                    infoStampCount.textContent =

                        "0 / 6";

                }


                if(rewardProgressFill){

                    rewardProgressFill.style.width =

                        "0%";

                }


                if(rewardStatus){

                    rewardStatus.textContent =

                        "✅ Reward Claimed";

                }


                if(infoRewardStatus){

                    infoRewardStatus.textContent =

                        "Claimed";

                }


                if(redeemStatus){

                    redeemStatus.textContent =

                        "Claimed";

                }


                if(claimMessage){

                    claimMessage.textContent =

                        "Your Free Veg Maggi reward has been claimed successfully.";

                }


                /* =========================================
                   DISABLE CLAIM BUTTON
                ========================================== */

                claimRewardBtn.disabled =

                    true;


                claimRewardBtn.setAttribute(

                    "aria-disabled",

                    "true"

                );


                /* =========================================
                   SUCCESS MESSAGE
                ========================================== */

                alert(

                    "🎉 Your FREE VEG MAGGI reward has been successfully claimed!"

                );

            }

            catch(error){

                console.error(

                    "RIO MAGGI POINT | Reward Claim Error:",

                    error

                );


                /* =========================================
                   SPECIFIC ERROR MESSAGES
                ========================================== */

                if(

                    error.message ===

                    "REWARD_ALREADY_CLAIMED"

                ){

                    alert(

                        "This reward has already been claimed."

                    );

                }

                else if(

                    error.message ===

                    "REWARD_NOT_UNLOCKED"

                ){

                    alert(

                        "Your reward is not unlocked yet."

                    );

                }

                else if(

                    error.message ===

                    "CUSTOMER_NOT_FOUND"

                ){

                    alert(

                        "Customer account could not be found."

                    );

                }

                else{

                    alert(

                        "❌ Unable to claim your reward. Please try again."

                    );

                }

            }

            finally{

                /* =========================================
                   STOP PROCESSING
                ========================================== */

                setClaimProcessing(

                    false

                );

            }

        }

    );

}


/* =========================================================
   CLAIM PROCESSING STATE
========================================================= */

function setClaimProcessing(isProcessing){

    if(!claimRewardBtn){

        return;

    }


    /* =====================================================
       SAVE PROCESSING STATE
    ====================================================== */

    claimRewardBtn.dataset.processing =

        isProcessing

            ?

        "true"

            :

        "false";


    /* =====================================================
       BUTTON STATE
    ====================================================== */

    claimRewardBtn.disabled =

        isProcessing;


    claimRewardBtn.setAttribute(

        "aria-disabled",

        isProcessing

            ?

        "true"

            :

        "false"

    );


    /* =====================================================
       PROCESSING INDICATOR
    ====================================================== */

    if(claimProcessing){

        claimProcessing.hidden =

            !isProcessing;

    }


    /* =====================================================
       BUTTON TEXT
    ====================================================== */

    const buttonText =

        claimRewardBtn.querySelector(

            "span"

        );


    if(buttonText){

        buttonText.textContent =

            isProcessing

                ?

            "Processing..."

                :

            "Claim Reward";

    }


    /* =====================================================
       BUTTON ICON
    ====================================================== */

    const buttonIcon =

        claimRewardBtn.querySelector(

            "i"

        );


    if(buttonIcon){

        if(isProcessing){

            buttonIcon.className =

                "fa-solid fa-spinner fa-spin";

        }

        else{

            buttonIcon.className =

                "fa-solid fa-gift";

        }

    }

}


/* =========================================================
   FILE : reward.js
   PART : 3/4 FIXED END

   NEXT:
   PART 4/4
   FINAL INITIALIZATION
   NAVIGATION
   PAGE READY
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   PREMIUM REWARD SYSTEM

   FILE : reward.js
   PART : 4/4 FIXED

   FINAL INITIALIZATION
   BOTTOM NAVIGATION
   ACTIVE NAVIGATION
   PAGE READY
========================================================= */


/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function initializeBottomNavigation(){

    const navigation =

        document.getElementById(

            "rewardBottomNavigation"

        );


    if(!navigation){

        return;

    }


    /* =====================================================
       GET CURRENT PAGE
    ====================================================== */

    const currentPage =

        window.location.pathname

            .split("/")

            .pop()

            .toLowerCase();


    /* =====================================================
       NAVIGATION LINKS
    ====================================================== */

    const navigationLinks =

        navigation.querySelectorAll(

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


            const targetPage =

                href

                    .split("/")

                    .pop()

                    .toLowerCase();


            /* =============================================
               REMOVE OLD ACTIVE STATE
            ============================================== */

            link.classList.remove(

                "active"

            );


            link.removeAttribute(

                "aria-current"

            );


            /* =============================================
               SET ACTIVE PAGE
            ============================================== */

            if(

                targetPage ===

                currentPage

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
   NAVIGATION CLICK ANIMATION
========================================================= */

function initializeNavigationAnimation(){

    const navigationLinks =

        document.querySelectorAll(

            "#rewardBottomNavigation a"

        );


    navigationLinks.forEach(

        (link)=>{

            link.addEventListener(

                "click",

                ()=>{

                    link.classList.add(

                        "nav-click"

                    );


                    setTimeout(

                        ()=>{

                            link.classList.remove(

                                "nav-click"

                            );

                        },

                        200

                    );

                }

            );

        }

    );

}


/* =========================================================
   DISABLE CLAIM BUTTON WHILE PAGE LOADS
========================================================= */

function initializeClaimButton(){

    if(!claimRewardBtn){

        return;

    }


    /* =====================================================
       SECURITY DEFAULT

       Button stays disabled until Firebase data
       confirms that the reward is available.
    ====================================================== */

    claimRewardBtn.disabled =

        true;


    claimRewardBtn.setAttribute(

        "aria-disabled",

        "true"

    );


    claimRewardBtn.dataset.processing =

        "false";

}


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initializeRewardPage(){

    initializeBottomNavigation();

    initializeNavigationAnimation();

    initializeClaimButton();

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

        initializeRewardPage,

        {

            once:true

        }

    );

}

else{

    initializeRewardPage();

}


/* =========================================================
   PAGE LOAD SAFETY
========================================================= */

window.addEventListener(

    "load",

    ()=>{

        hideRewardLoader();

    },

    {

        once:true

    }

);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(

    "error",

    (event)=>{

        console.error(

            "RIO MAGGI POINT | Reward Page Error:",

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

            "RIO MAGGI POINT | Reward Promise Error:",

            event.reason

        );

    }

);


/* =========================================================
   FINAL READY MESSAGE
========================================================= */

console.log(

    "========================================"

);


console.log(

    "🍜 RIO MAGGI POINT"

);


console.log(

    "Premium Reward System Ready"

);


console.log(

    "Firebase Authentication Active"

);


console.log(

    "6 Stamp Reward System Active"

);


console.log(

    "Secure Transaction Claim Enabled"

);


console.log(

    "========================================"

);


/* =========================================================
   FILE : reward.js
   PART : 4/4 FIXED END

   RIO MAGGI POINT
   PREMIUM REWARD SYSTEM

   COMPLETE FIXED JAVASCRIPT
========================================================= */
