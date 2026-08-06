// =========================================================
// RIO MAGGI POINT
// CARD.JS
// FINAL FIXED LOYALTY CARD SYSTEM
// PART 1/3
// =========================================================


// =========================================================
// FIREBASE IMPORT
// =========================================================

import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// =========================================================
// LOYALTY CONFIG
// =========================================================

const TOTAL_STAMPS = 6;

const CYCLE_DAYS = 40;



// =========================================================
// GLOBAL STATE
// =========================================================

window.currentRioUser = null;

window.rioCustomerData = null;

window.rioCurrentStamps = 0;


let countdownTimer = null;

let cardInitialized = false;




// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeCardActions();

    },
    {
        once:true
    }
);




// =========================================================
// INITIALIZE BUTTON ACTIONS
// =========================================================

function initializeCardActions(){


    const freeGameBtn =
        document.getElementById(
            "freeGameBtn"
        );


    if(freeGameBtn){

        freeGameBtn.addEventListener(
            "click",
            ()=>{

                window.location.href =
                    "../index.html";

            }
        );

    }




    const freeGamePromoBtn =
        document.getElementById(
            "freeGamePromoBtn"
        );


    if(freeGamePromoBtn){

        freeGamePromoBtn.addEventListener(
            "click",
            (event)=>{


                event.preventDefault();


                window.location.href =
                    "../index.html";


            }
        );

    }




    const mapShopBtn =
        document.getElementById(
            "mapShopBtn"
        );


    if(mapShopBtn){

        mapShopBtn.addEventListener(
            "click",
            ()=>{

                alert(
                    "Rio Maggi Point location coming soon."
                );

            }
        );

    }



}




// =========================================================
// AUTH CHECK
// =========================================================

onAuthStateChanged(
    auth,
    async(user)=>{


        if(cardInitialized){

            return;

        }


        cardInitialized = true;



        if(!user){


            window.location.replace(
                "login.html"
            );


            return;

        }



        window.currentRioUser =
            user;



        await loadCustomerCard(
            user.uid
        );


    }
);





// =========================================================
// LOAD CUSTOMER CARD DATA
// =========================================================

async function loadCustomerCard(
    uid
){


    try{


        showLoader();



        const customerRef =
            doc(
                db,
                "customers",
                uid
            );



        const snapshot =
            await getDoc(
                customerRef
            );



        if(
            !snapshot.exists()
        ){


            console.warn(
                "Customer document not found"
            );


            renderDefaultCard();


            hideLoader();


            return;

        }



        let customer =
        {

            uid,

            ...snapshot.data()

        };



        customer =
            validateCycle(
                customer
            );



        window.rioCustomerData =
            customer;



        window.rioCurrentStamps =
            Number(
                customer.stamps || 0
            );



        renderCustomerProfile(
            customer
        );


        renderStampCard(
            customer
        );


        renderRewardStatus(
            customer
        );



        hideLoader();



        console.log(
            "🍜 Card loaded successfully"
        );


    }
    catch(error){


        console.error(
            "Card loading error:",
            error
        );


        hideLoader();


    }


}





// =========================================================
// CYCLE VALIDATION
// =========================================================

function validateCycle(
    customer
){


    const stamps =
        Number(
            customer.stamps || 0
        );



    if(

        isExpired(
            customer.cycleStartedAt
        )

        &&

        stamps < TOTAL_STAMPS

        &&

        customer.rewardClaimed !== true

    ){


        return {

            ...customer,

            stamps:0,

            rewardUnlocked:false

        };


    }



    return customer;


}
// =========================================================
// RIO MAGGI POINT
// CARD.JS
// FINAL FIXED LOYALTY CARD SYSTEM
// PART 2/3
// =========================================================



// =========================================================
// RENDER CUSTOMER PROFILE
// =========================================================

function renderCustomerProfile(
    customer
){


    const name =
        customer.name ||
        customer.fullName ||
        "Rio Maggi Member";



    const welcomeName =
        document.getElementById(
            "welcomeUserName"
        );


    const customerName =
        document.getElementById(
            "loyaltyCustomerName"
        );


    if(welcomeName){

        welcomeName.textContent =
            name;

    }



    if(customerName){

        customerName.textContent =
            name;

    }




    const photo =
        document.getElementById(
            "loyaltyCustomerPhoto"
        );



    if(photo){


        photo.src =
            customer.photoURL ||
            customer.avatar ||
            "assets/default-avatar.png";


    }





    const memberDate =
        document.getElementById(
            "memberSinceDate"
        );



    if(memberDate){


        memberDate.textContent =
            formatDate(
                customer.createdAt ||
                customer.memberSince ||
                customer.cycleStartedAt
            );


    }




    const welcomeMessage =
        document.getElementById(
            "welcomeMessage"
        );



    if(welcomeMessage){


        welcomeMessage.textContent =
            "Keep collecting stamps and enjoy your FREE Veg Maggi reward.";


    }


}





// =========================================================
// RENDER STAMP CARD
// =========================================================

function renderStampCard(
    customer
){


    const count =
        Math.min(
            Number(customer.stamps || 0),
            TOTAL_STAMPS
        );



    const stampBoxes =
        document.querySelectorAll(
            "#stampContainer .stamp-box"
        );



    stampBoxes.forEach(
        (box)=>{


            const number =
                Number(
                    box.dataset.stamp
                );



            const active =
                number <= count;



            box.classList.toggle(
                "active",
                active
            );


            box.classList.toggle(
                "collected",
                active
            );



        }
    );




    const countText =
        document.getElementById(
            "stampCountText"
        );



    if(countText){

        countText.textContent =
            `${count}/${TOTAL_STAMPS}`;

    }




    const progressBar =
        document.getElementById(
            "stampProgressBar"
        );



    if(progressBar){


        progressBar.style.width =
            `${(count / TOTAL_STAMPS) * 100}%`;


    }




    const progressText =
        document.getElementById(
            "stampProgressText"
        );



    if(progressText){


        progressText.textContent =
            `${count} of ${TOTAL_STAMPS} valid stamps collected`;


    }



}





// =========================================================
// RENDER REWARD STATUS
// =========================================================

function renderRewardStatus(
    customer
){



    const stamps =
        Number(
            customer.stamps || 0
        );



    const unlocked =
        stamps >= TOTAL_STAMPS;



    const rewardStatus =
        document.getElementById(
            "rewardStatus"
        );



    const claimButton =
        document.getElementById(
            "claimRewardBtn"
        );



    const title =
        rewardStatus?.querySelector(
            ".reward-status-content strong"
        );



    const text =
        rewardStatus?.querySelector(
            ".reward-status-content span"
        );



    const icon =
        rewardStatus?.querySelector(
            ".reward-status-icon i"
        );





    if(unlocked){



        if(rewardStatus){

            rewardStatus.classList.add(
                "reward-unlocked"
            );

        }



        if(icon){

            icon.className =
                "fa-solid fa-gift";

        }



        if(title){

            title.textContent =
                "Reward Unlocked!";

        }



        if(text){

            text.textContent =
                "Your FREE Veg Maggi is ready to claim.";

        }



        if(claimButton){


            claimButton.disabled =
                false;


            claimButton.innerHTML =
            `
            <i class="fa-solid fa-gift"></i>
            <span>Claim Your FREE Veg Maggi</span>
            `;


        }


    }

    else{



        const remaining =
            TOTAL_STAMPS - stamps;



        if(icon){

            icon.className =
                "fa-solid fa-lock";

        }



        if(title){

            title.textContent =
                "Reward Locked";

        }



        if(text){

            text.textContent =
                `Collect ${remaining} more valid stamp${remaining === 1 ? "" : "s"} within 40 days.`;

        }



        if(claimButton){

            claimButton.disabled =
                true;


            claimButton.innerHTML =
            `
            <i class="fa-solid fa-lock"></i>
            <span>Collect ${TOTAL_STAMPS} Stamps to Unlock</span>
            `;


        }


    }



}





// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
    value
){


    const date =
        convertDate(
            value
        );



    if(!date){

        return "--";

    }



    return date.toLocaleDateString(
        "en-IN",
        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }
    );


}




// =========================================================
// DATE CONVERTER
// =========================================================

function convertDate(
    value
){


    if(!value){

        return null;

    }



    try{


        if(
            typeof value.toDate === "function"
        ){

            return value.toDate();

        }



        if(
            value.seconds !== undefined
        ){

            return new Date(
                value.seconds * 1000
            );

        }



        return new Date(value);


    }
    catch(error){

        return null;

    }


}
// =========================================================
// RIO MAGGI POINT
// CARD.JS
// FINAL FIXED LOYALTY CARD SYSTEM
// PART 3/3
// =========================================================



// =========================================================
// CHECK 40 DAYS EXPIRY
// =========================================================

function isExpired(
    value
){

    const startDate =
        convertDate(
            value
        );


    if(!startDate){

        return false;

    }



    const difference =
        Date.now()
        -
        startDate.getTime();



    const days =
        difference /
        (
            1000 *
            60 *
            60 *
            24
        );



    return days >= CYCLE_DAYS;

}





// =========================================================
// LOADER
// =========================================================

function showLoader(){

    const loader =
        document.getElementById(
            "pageLoader"
        );


    if(loader){

        loader.classList.remove(
            "hidden"
        );

        loader.setAttribute(
            "aria-hidden",
            "false"
        );

    }

}



function hideLoader(){

    const loader =
        document.getElementById(
            "pageLoader"
        );


    if(loader){

        loader.classList.add(
            "hidden"
        );

        loader.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}





// =========================================================
// DEFAULT CARD
// =========================================================

function renderDefaultCard(){


    const welcome =
        document.getElementById(
            "welcomeUserName"
        );


    const customer =
        document.getElementById(
            "loyaltyCustomerName"
        );



    if(welcome){

        welcome.textContent =
            "Premium Member";

    }



    if(customer){

        customer.textContent =
            "Rio Maggi Member";

    }



    renderStampCard({

        stamps:0

    });



    renderRewardStatus({

        stamps:0

    });


}





// =========================================================
// CLEANUP TIMER
// =========================================================

window.addEventListener(
    "beforeunload",
    ()=>{


        if(countdownTimer){


            clearInterval(
                countdownTimer
            );


            countdownTimer =
                null;


        }


    },
    {
        once:true
    }
);





// =========================================================
// GLOBAL EXPORT
// =========================================================

window.RioCard = {


    reload:loadCustomerCard,


    renderStampCard,


    renderRewardStatus


};





console.log(
    "🍜 RIO MAGGI POINT CARD.JS FINAL VERSION LOADED"
);
