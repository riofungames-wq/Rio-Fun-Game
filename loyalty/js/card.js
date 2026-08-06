// =====================================
// RIO MAGGI POINT
// CARD.JS
// CLEAN FIXED VERSION
// FIREBASE + LOYALTY SYSTEM
// PART 1/4
// =====================================


// =====================================
// FIREBASE IMPORTS
// =====================================

import {
    db,
    auth
} from "./firebase-config.js";


import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================
// CONSTANTS
// =====================================

const TOTAL_STAMPS = 6;
const STAMP_RESET_DAYS = 40;


const CUSTOMER_PHONE = "917987827979";
const CUSTOMER_PHONE_TEL = "+917987827979";


// =====================================
// GLOBAL VARIABLES
// =====================================

let rioCustomerCache = null;
let countdownInterval = null;
let isCardInitialized = false;


// Global access

window.currentRioUser = null;
window.rioCurrentStamps = 0;
window.rioCountdownDays = 40;
window.rioMemberSince = null;
window.rioCustomerMobile = null;



// =====================================
// DOM READY
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        setupGameButton();
        setupCallButton();
        setupWhatsAppButton();
        setupMapButton();
        setupDeliveryButton();

    }
);



// =====================================
// BUTTONS
// =====================================


function setupGameButton(){

    const button =
    document.getElementById("gameLink");


    if(!button) return;


    button.addEventListener(
        "click",
        ()=>{

            button.classList.add(
                "game-button-clicked"
            );


            setTimeout(
                ()=>{
                    button.classList.remove(
                        "game-button-clicked"
                    );
                },
                300
            );


            window.location.href =
            "../index.html";

        }
    );

}



function setupCallButton(){

    const button =
    document.getElementById("callBtn");


    if(!button) return;


    button.addEventListener(
        "click",
        ()=>{

            window.location.href =
            "tel:"+CUSTOMER_PHONE_TEL;

        }
    );

}



function setupWhatsAppButton(){

    const button =
    document.getElementById("whatsappBtn");


    if(!button) return;


    button.addEventListener(
        "click",
        ()=>{

            const message =
            encodeURIComponent(
                "Hello Rio Maggi Point, I want to know more about loyalty program."
            );


            window.open(
                "https://wa.me/"
                +
                CUSTOMER_PHONE
                +
                "?text="
                +
                message,
                "_blank"
            );

        }
    );

}



function setupMapButton(){

    const button =
    document.getElementById("mapBtn");


    if(!button) return;


    button.addEventListener(
        "click",
        ()=>{

            showToast(
                "Location Coming Soon"
            );

        }
    );

}



function setupDeliveryButton(){

    const button =
    document.getElementById("deliveryBtn");


    if(!button) return;


    button.addEventListener(
        "click",
        ()=>{

            showToast(
                "Home Delivery Coming Soon"
            );

        }
    );

}



function showToast(message){

    if(typeof window.showToast === "function"){

        window.showToast(message);

    }
    else{

        alert(message);

    }

}
// =====================================
// FIRESTORE CUSTOMER SYSTEM
// PART 2/4
// =====================================


// =====================================
// GET CUSTOMER DOCUMENT
// COLLECTION = customers
// =====================================

async function getCustomerDocument(user){

    try{

        if(!user || !user.uid){

            throw new Error(
                "Invalid Firebase User"
            );

        }


        const customerRef =
        doc(
            db,
            "customers",
            user.uid
        );


        const snapshot =
        await getDoc(customerRef);



        if(!snapshot.exists()){

            console.warn(
                "Customer document not found",
                user.uid
            );

            return null;

        }



        return {

            ref: customerRef,
            data: snapshot.data()

        };


    }
    catch(error){

        console.error(
            "Customer Fetch Error:",
            error
        );

        return null;

    }

}




// =====================================
// STAMP COUNT
// =====================================

function getStampCount(data){

    let count =
    Number(
        data.stamps ??
        data.currentStamps ??
        0
    );


    if(!Number.isFinite(count)){

        count = 0;

    }


    return Math.max(
        0,
        Math.min(
            count,
            TOTAL_STAMPS
        )
    );

}




// =====================================
// DATE CONVERTER
// =====================================

function parseFirebaseDate(value){

    try{


        if(!value){

            return null;

        }



        if(
            typeof value.toDate === "function"
        ){

            return value.toDate();

        }



        if(value instanceof Date){

            return value;

        }



        if(
            typeof value === "object" &&
            value.seconds !== undefined
        ){

            return new Date(
                value.seconds * 1000
            );

        }



        const date =
        new Date(value);



        return isNaN(
            date.getTime()
        )
        ?
        null
        :
        date;



    }
    catch(error){

        console.error(
            "Date Parse Error",
            error
        );

        return null;

    }

}




// =====================================
// GET LAST STAMP DATE
// =====================================

function getLastStampDate(data){


    if(data.lastStampDate){

        const date =
        parseFirebaseDate(
            data.lastStampDate
        );


        if(date){

            return date;

        }

    }



    if(
        Array.isArray(
            data.stampDates
        )
    ){

        const list =
        data.stampDates
        .map(parseFirebaseDate)
        .filter(Boolean);



        if(list.length){

            return list[
                list.length - 1
            ];

        }

    }



    return null;

}




// =====================================
// CALENDAR DAY DIFFERENCE
// =====================================

function calculateDaysPassed(date){


    if(!date){

        return 0;

    }



    const now =
    new Date();



    const today =
    Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );



    const old =
    Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );



    return Math.floor(
        (today-old)
        /
        (
            1000 *
            60 *
            60 *
            24
        )
    );


}




// =====================================
// 40 DAYS RESET SYSTEM
// =====================================

async function resetExpiredCycleIfNeeded(
    ref,
    data
){


    const stamps =
    getStampCount(data);



    // Reward already unlocked
    // keep until redeemed

    if(
        stamps >= TOTAL_STAMPS
    ){

        return {

            data,
            reset:false

        };

    }




    const lastStamp =
    getLastStampDate(
        data
    );



    if(!lastStamp){

        return {

            data,
            reset:false

        };

    }



    const passed =
    calculateDaysPassed(
        lastStamp
    );



    if(
        passed < STAMP_RESET_DAYS
    ){

        return {

            data,
            reset:false

        };

    }




    const resetData = {

        stamps:0,

        currentStamps:0,

        stampDates:[],

        rewardUnlocked:false

    };




    try{


        await updateDoc(
            ref,
            resetData
        );



        console.log(
            "40 Day Loyalty Reset Done"
        );



        return {

            data:{
                ...data,
                ...resetData
            },

            reset:true

        };


    }
    catch(error){


        console.error(
            "Reset Error",
            error
        );



        return {

            data,
            reset:false

        };


    }


}
// =====================================
// CUSTOMER UI RENDER SYSTEM
// PART 3/4
// =====================================


// =====================================
// RENDER CUSTOMER PROFILE
// =====================================

function renderCustomerData(
    user,
    data
){

    const name =
    document.getElementById(
        "customerName"
    );


    if(name){

        name.textContent =
        data.name ||
        user.displayName ||
        "Rio Customer";

    }




    const member =
    document.getElementById(
        "memberId"
    );


    if(member){

        member.textContent =
        data.memberId ||
        (
            "RIO-" +
            user.uid
            .slice(0,10)
            .toUpperCase()
        );

    }




    const photo =
    document.getElementById(
        "customerPhoto"
    );



    if(photo){

        photo.src =
        data.avatar ||
        data.photoURL ||
        "assets/avatars/default-avatar.png";

    }



    const mobile =
    data.mobile ||
    "";



    window.rioCustomerMobile =
    mobile;



    window.rioMemberSince =
    data.createdAt ||
    null;


}




// =====================================
// STAMP RENDER SYSTEM
// =====================================

function renderStampData(data){


    const stamps =
    getStampCount(
        data
    );



    for(
        let i = 1;
        i <= TOTAL_STAMPS;
        i++
    ){


        const circle =
        document.getElementById(
            "stamp" + i
        );



        if(!circle){

            continue;

        }




        if(
            i <= stamps
        ){


            circle.classList.add(
                "active"
            );


            circle.innerHTML =
            `
            <i class="fa-solid fa-check"></i>
            `;


        }
        else{


            circle.classList.remove(
                "active"
            );


            circle.innerHTML =
            `
            <span>${i}</span>
            `;


        }


    }



    window.rioCurrentStamps =
    stamps;



    updateRewardStatus(
        stamps
    );


}




// =====================================
// REWARD STATUS
// =====================================

function updateRewardStatus(
    stamps
){


    const reward =
    document.getElementById(
        "rewardCircle"
    );



    if(!reward){

        return;

    }



    const unlocked =
    stamps >= TOTAL_STAMPS;



    reward.classList.toggle(
        "active",
        unlocked
    );



    reward.classList.toggle(
        "reward-unlocked",
        unlocked
    );



    const text =
    document.getElementById(
        "rewardStatus"
    );



    if(text){


        text.textContent =
        unlocked
        ?
        "FREE VEG MAGGI READY"
        :
        "Collect 6 valid stamps within 40 days";


    }


}




// =====================================
// COUNTDOWN DISPLAY
// =====================================

function updateLocalCountdown(
    data
){

    const element =
    document.getElementById(
        "countdownDays"
    );



    const stamps =
    getStampCount(
        data
    );



    if(
        stamps >= TOTAL_STAMPS
    ){


        window.rioCountdownDays = 0;



        if(element){

            element.textContent =
            "REWARD READY";

        }


        return;

    }




    const last =
    getLastStampDate(
        data
    );



    let days =
    STAMP_RESET_DAYS;



    if(last){


        days =
        Math.max(
            0,
            STAMP_RESET_DAYS -
            calculateDaysPassed(last)
        );


    }




    window.rioCountdownDays =
    days;



    if(element){


        element.textContent =
        `${days} ${days===1 ? "DAY":"DAYS"}`;


    }



}



// =====================================
// LOAD CUSTOMER CARD DATA
// =====================================

async function loadCardData(
    user
){

    const customer =
    await getCustomerDocument(
        user
    );



    if(!customer){


        console.warn(
            "No Customer Data Found"
        );


        return;


    }




    let data =
    customer.data;



    const cycle =
    await resetExpiredCycleIfNeeded(
        customer.ref,
        data
    );



    data =
    cycle.data;




    rioCustomerCache =
    data;



    renderCustomerData(
        user,
        data
    );



    renderStampData(
        data
    );



    updateLocalCountdown(
        data
    );



    console.log(
        "🍜 Rio Customer Dashboard Loaded"
    );


}
// =====================================
// AUTH + TIMER + FINAL INITIALIZATION
// PART 4/4
// =====================================


// =====================================
// COUNTDOWN TIMER
// =====================================

function startCountdownTimer(){

    if(countdownInterval){

        clearInterval(
            countdownInterval
        );

    }



    countdownInterval =
    setInterval(
        ()=>{


            if(
                rioCustomerCache
            ){

                updateLocalCountdown(
                    rioCustomerCache
                );

            }


        },
        60000
    );

}



// =====================================
// STOP TIMER
// =====================================

function stopCountdownTimer(){

    if(countdownInterval){

        clearInterval(
            countdownInterval
        );


        countdownInterval =
        null;

    }

}




// =====================================
// AUTH STATE LISTENER
// =====================================

onAuthStateChanged(
    auth,
    async(user)=>{


        if(!user){


            window.currentRioUser =
            null;



            stopCountdownTimer();



            if(
                !location.pathname.includes(
                    "login.html"
                )
            ){

                location.href =
                "login.html";

            }


            return;

        }





        window.currentRioUser =
        user;




        if(
            isCardInitialized
        ){

            return;

        }




        isCardInitialized =
        true;



        await loadCardData(
            user
        );



        startCountdownTimer();



        console.log(
            "✅ RIO MAGGI POINT CARD READY"
        );



    }
);





// =====================================
// GLOBAL RELOAD FUNCTION
// DEBUG / TEST
// =====================================

window.reloadRioCard =
async function(){


    if(
        window.currentRioUser
    ){


        await loadCardData(
            window.currentRioUser
        );



        console.log(
            "🔄 Card Reloaded"
        );


    }


};





// =====================================
// BUTTON SYSTEM
// =====================================


// GAME BUTTON

document.addEventListener(
"DOMContentLoaded",
()=>{


    const game =
    document.getElementById(
        "gameLink"
    );


    if(game){


        game.onclick =
        ()=>{


            window.location.href =
            "../index.html";


        };


    }




    const call =
    document.getElementById(
        "callBtn"
    );



    if(call){


        call.onclick =
        ()=>{


            window.location.href =
            "tel:+917987827979";


        };


    }





    const whatsapp =
    document.getElementById(
        "whatsappBtn"
    );



    if(whatsapp){


        whatsapp.onclick =
        ()=>{


            const msg =
            encodeURIComponent(
            "Hello Rio Maggi Point, I want to know more about loyalty program."
            );



            window.open(
            "https://wa.me/917987827979?text="+msg,
            "_blank"
            );


        };


    }





    const map =
    document.getElementById(
        "mapBtn"
    );



    if(map){


        map.onclick =
        ()=>{


            alert(
            "Google Maps Location Coming Soon"
            );


        };


    }





    const delivery =
    document.getElementById(
        "deliveryBtn"
    );



    if(delivery){


        delivery.onclick =
        ()=>{


            alert(
            "Home Delivery Coming Soon"
            );


        };


    }



});





console.log(
"🍜 CARD.JS FINAL CLEAN VERSION LOADED"
);
