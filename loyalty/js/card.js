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
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// =========================================================
// CONFIG
// =========================================================

const TOTAL_STAMPS = 6;

const CYCLE_DAYS = 40;



// =========================================================
// GLOBAL STATE
// =========================================================

window.currentRioUser = null;

window.rioCustomerData = null;

window.rioCurrentStamps = 0;


let cardInitialized = false;



// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        initializeCardActions();

    },
    {
        once:true
    }
);




// =========================================================
// BUTTON ACTIONS
// =========================================================

function initializeCardActions(){



    const freeGameBtn =
        document.getElementById(
            "freeGameBtn"
        );


    if(freeGameBtn){

        freeGameBtn.onclick = ()=>{

            window.location.href =
                "../index.html";

        };

    }





    const freeGamePromoBtn =
        document.getElementById(
            "freeGamePromoBtn"
        );


    if(freeGamePromoBtn){

        freeGamePromoBtn.onclick =
        (event)=>{


            event.preventDefault();


            window.location.href =
                "../index.html";


        };

    }





    const mapShopBtn =
        document.getElementById(
            "mapShopBtn"
        );


    if(mapShopBtn){

        mapShopBtn.onclick = ()=>{


            alert(
                "Rio Maggi Point location coming soon."
            );


        };

    }



}






// =========================================================
// AUTH LISTENER
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
// LOAD CUSTOMER CARD
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





        if(!snapshot.exists()){


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
            await validateCycle(
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
            "🍜 Customer Card Loaded"
        );



    }
    catch(error){


        console.error(
            "Card Load Error:",
            error
        );


        hideLoader();


    }


}






// =========================================================
// 40 DAYS CYCLE VALIDATION
// =========================================================

async function validateCycle(
    customer
){


    const stamps =
        Number(
            customer.stamps || 0
        );




    const expired =
        isExpired(
            customer.cycleStartedAt
        );





    if(

        expired

        &&

        stamps > 0

        &&

        stamps < TOTAL_STAMPS

    ){



        const resetData = {


            stamps:0,


            rewardUnlocked:false,


            rewardClaimed:false,


            cycleStartedAt:null,


            lastStampDate:null,


            updatedAt:
                serverTimestamp()


        };





        await updateDoc(

            doc(
                db,
                "customers",
                customer.uid
            ),

            resetData

        );





        return {


            ...customer,

            ...resetData


        };



    }




    return customer;


}






// =========================================================
// DATE CHECK
// =========================================================

function isExpired(
    value
){


    const date =
        convertDate(
            value
        );



    if(!date){

        return false;

    }




    const days =
        (
            Date.now()
            -
            date.getTime()
        )
        /
        (
            1000 *
            60 *
            60 *
            24
        );




    return days >= CYCLE_DAYS;


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


        photo.onerror =
        ()=>{

            photo.src =
                "assets/default-avatar.png";

        };


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



    const stamps =
        Math.min(

            Number(
                customer.stamps || 0
            ),

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



            const collected =
                number <= stamps;



            box.classList.toggle(
                "active",
                collected
            );



            box.classList.toggle(
                "collected",
                collected
            );



        }
    );







    const count =
        document.getElementById(
            "stampCountText"
        );



    if(count){


        count.textContent =
            `${stamps}/${TOTAL_STAMPS}`;


    }






    const progress =
        document.getElementById(
            "stampProgressBar"
        );



    if(progress){


        progress.style.width =
            `${

                (
                    stamps /
                    TOTAL_STAMPS
                )
                *
                100

            }%`;



    }






    const progressText =
        document.getElementById(
            "stampProgressText"
        );



    if(progressText){


        progressText.textContent =
        `${stamps} of ${TOTAL_STAMPS} valid stamps collected`;


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






    const rewardBox =
        document.getElementById(
            "rewardStatus"
        );



    const claimButton =
        document.getElementById(
            "claimRewardBtn"
        );





    const title =
        rewardBox?.querySelector(
            ".reward-status-content strong"
        );



    const message =
        rewardBox?.querySelector(
            ".reward-status-content span"
        );



    const icon =
        rewardBox?.querySelector(
            ".reward-status-icon i"
        );







    if(unlocked){



        if(rewardBox){

            rewardBox.classList.add(
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





        if(message){

            message.textContent =
            "Your FREE Veg Maggi reward is ready to claim.";

        }






        if(claimButton){


            claimButton.disabled =
                false;



            claimButton.classList.remove(
                "reward-locked-btn"
            );



            claimButton.classList.add(
                "reward-unlocked-btn"
            );



            claimButton.innerHTML =
            `

            <i class="fa-solid fa-gift"></i>

            <span>
            Claim Your FREE Veg Maggi
            </span>

            `;


        }





    }
    else{





        const remaining =
            TOTAL_STAMPS -
            stamps;





        if(rewardBox){

            rewardBox.classList.remove(
                "reward-unlocked"
            );

        }






        if(icon){

            icon.className =
                "fa-solid fa-lock";

        }






        if(title){

            title.textContent =
                "Reward Locked";

        }






        if(message){

            message.textContent =
            `Collect ${remaining} more valid stamp${remaining === 1 ? "" : "s"} within 40 days.`;

        }







        if(claimButton){


            claimButton.disabled =
                true;




            claimButton.classList.add(
                "reward-locked-btn"
            );



            claimButton.classList.remove(
                "reward-unlocked-btn"
            );




            claimButton.innerHTML =
            `

            <i class="fa-solid fa-lock"></i>

            <span>
            Collect ${TOTAL_STAMPS} Stamps to Unlock
            </span>

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




        return new Date(
            value
        );



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
// LOADER CONTROL
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
// DEFAULT CARD VIEW
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
// GLOBAL CARD API
// =========================================================

window.RioCard = {


    reload:
        loadCustomerCard,


    renderStampCard:
        renderStampCard,


    renderRewardStatus:
        renderRewardStatus


};






// =========================================================
// CLEAN ERROR HANDLING
// =========================================================

window.addEventListener(
    "error",
    (event)=>{


        console.error(
            "Rio Card Error:",
            event.error
        );


    }
);






// =========================================================
// FINAL READY
// =========================================================

console.log(
    "🍜 Rio Maggi Point CARD.JS Final Fixed Loaded Successfully"
);
