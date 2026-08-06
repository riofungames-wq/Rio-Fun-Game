// =====================================
// RIO MAGGI POINT
// CARD.JS
// CLEAN FINAL VERSION
// FIREBASE + LOYALTY CARD SYSTEM
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


// Rio Contact

const CUSTOMER_PHONE = "917987827979";
const CUSTOMER_PHONE_TEL = "+917987827979";



// =====================================
// GLOBAL VARIABLES
// =====================================

let rioCustomerCache = null;
let isCardInitialized = false;
let countdownInterval = null;



// =====================================
// GLOBAL STATE
// =====================================

window.currentRioUser = null;

window.rioCurrentStamps = 0;

window.rioCountdownDays = STAMP_RESET_DAYS;

window.rioMemberSince = null;

window.rioCustomerMobile = null;



// =====================================
// FIREBASE CHECK
// =====================================

if (!db) {

    console.error(
        "❌ CARD.JS Firestore Missing"
    );

} else {

    console.log(
        "✅ CARD.JS Firestore Connected"
    );

}



// =====================================
// DOM READY
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupGameButton();

        setupCallButton();

        setupWhatsAppButton();

        setupMapButton();

        setupDeliveryButton();

    }
);



// =====================================
// GAME BUTTON
// =====================================

function setupGameButton(){

    const button =
    document.getElementById(
        "gameLink"
    );


    if(!button) return;


    button.onclick = () => {

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

    };

}



// =====================================
// CALL BUTTON
// =====================================

function setupCallButton(){

    const button =
    document.getElementById(
        "callBtn"
    );


    if(!button) return;


    button.onclick = () => {

        window.location.href =
        "tel:" + CUSTOMER_PHONE_TEL;

    };

}



// =====================================
// WHATSAPP BUTTON
// =====================================

function setupWhatsAppButton(){

    const button =
    document.getElementById(
        "whatsappBtn"
    );


    if(!button) return;


    button.onclick = () => {


        const message =
        encodeURIComponent(
            "Hello Rio Maggi Point, I want to know more about the loyalty program."
        );


        window.open(

            "https://wa.me/" +
            CUSTOMER_PHONE +
            "?text=" +
            message,

            "_blank",

            "noopener,noreferrer"

        );


    };

}



// =====================================
// MAP BUTTON
// =====================================

function setupMapButton(){

    const button =
    document.getElementById(
        "mapBtn"
    );


    if(!button) return;


    button.onclick = () => {

        showComingSoonMessage(
            "Google Maps location is coming soon."
        );

    };

}



// =====================================
// DELIVERY BUTTON
// =====================================

function setupDeliveryButton(){

    const button =
    document.getElementById(
        "deliveryBtn"
    );


    if(!button) return;


    button.onclick = () => {

        showComingSoonMessage(
            "Delivery service is coming soon."
        );

    };

}



// =====================================
// MESSAGE SYSTEM
// =====================================

function showComingSoonMessage(message){

    if(
        typeof window.showToast === "function"
    ){

        window.showToast(
            message
        );

        return;

    }


    alert(message);

}



// =====================================
// CUSTOMER FIRESTORE FETCH
// COLLECTION:
// customers/{uid}
// =====================================

async function getCustomerDocument(user){


    try{


        if(
            !user ||
            !user.uid
        ){

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
        await getDoc(
            customerRef
        );



        if(
            !snapshot.exists()
        ){

            console.warn(
                "Customer document not found"
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


    if(
        !Number.isFinite(count)
    ){

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
// RIO MAGGI POINT
// CARD.JS
// CLEAN FINAL VERSION
// FIREBASE + LOYALTY CARD SYSTEM
// PART 2/4
// =====================================


// =====================================
// FIREBASE DATE CONVERTER
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



        if(
            value instanceof Date
        ){

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



        if(
            isNaN(
                date.getTime()
            )
        ){

            return null;

        }



        return date;


    }
    catch(error){


        console.error(
            "Date Convert Error:",
            error
        );


        return null;


    }


}




// =====================================
// GET STAMP DATES
// =====================================

function getValidStampDates(data){


    if(
        !Array.isArray(
            data.stampDates
        )
    ){

        return [];

    }



    return data.stampDates

    .slice(
        0,
        TOTAL_STAMPS
    )

    .map(
        parseFirebaseDate
    )

    .filter(
        Boolean
    );


}




// =====================================
// LAST STAMP DATE
// =====================================

function getLastStampDate(data){



    // New Firebase field support

    if(
        data.lastStampDate
    ){

        const date =
        parseFirebaseDate(
            data.lastStampDate
        );


        if(date){

            return date;

        }

    }



    const dates =
    getValidStampDates(
        data
    );



    if(
        dates.length === 0
    ){

        return null;

    }



    return dates[
        dates.length - 1
    ];


}




// =====================================
// CALENDAR DAY DIFFERENCE
// MIDNIGHT SAFE
// =====================================

function calculateCalendarDaysPassed(date){


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

        (
            today - old
        )

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
// 40 DAYS LOYALTY RESET
// =====================================

async function resetExpiredCycleIfNeeded(
    customerRef,
    data
){


    const stamps =
    getStampCount(
        data
    );



    // Reward unlocked stays

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



    const passedDays =
    calculateCalendarDaysPassed(
        lastStamp
    );



    if(
        passedDays < STAMP_RESET_DAYS
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


        rewardUnlocked:false,


        reward:false,


        rewardRedeemed:false


    };




    try{


        await updateDoc(

            customerRef,

            resetData

        );



        console.log(
            "✅ 40 Day Loyalty Cycle Reset"
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
            "Reset Error:",
            error
        );



        return {


            data,

            reset:false


        };


    }


}




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





    window.rioMemberSince =

    data.createdAt ||

    null;



    window.rioCustomerMobile =

    data.mobile ||

    null;



}
// =====================================
// RIO MAGGI POINT
// CARD.JS
// CLEAN FINAL VERSION
// FIREBASE + LOYALTY CARD SYSTEM
// PART 3/4
// =====================================



// =====================================
// RENDER STAMP SYSTEM
// =====================================

function renderStampData(data){


    const stamps =
    getStampCount(
        data
    );


    const dates =
    getValidStampDates(
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



        const dateElement =
        document.getElementById(
            "stampDate" + i
        );



        if(dateElement){


            dateElement.textContent =

            dates[i-1]

            ?

            dates[i-1]
            .toLocaleDateString(
                "en-IN",
                {
                    day:"2-digit",
                    month:"short"
                }
            )

            :

            "--";


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

        "Collect 6 stamps within 40 days";


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




    const lastStamp =
    getLastStampDate(
        data
    );



    let days =
    STAMP_RESET_DAYS;



    if(lastStamp){


        days = Math.max(

            0,

            STAMP_RESET_DAYS -

            calculateCalendarDaysPassed(
                lastStamp
            )

        );


    }




    window.rioCountdownDays =
    days;



    if(element){


        element.textContent =

        days +

        (

            days === 1

            ?

            " DAY"

            :

            " DAYS"

        );


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
// RIO MAGGI POINT
// CARD.JS
// CLEAN FINAL VERSION
// FIREBASE + LOYALTY CARD SYSTEM
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


            if(rioCustomerCache){


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


        countdownInterval = null;


    }


}




// =====================================
// FIREBASE AUTH LISTENER
// =====================================

onAuthStateChanged(

    auth,

    async(user)=>{


        if(!user){



            window.currentRioUser = null;



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




        window.currentRioUser = user;




        if(isCardInitialized){


            return;


        }





        isCardInitialized = true;




        await loadCardData(

            user

        );



        startCountdownTimer();



        console.log(

            "🍜 RIO MAGGI POINT CARD READY"

        );



    }

);




// =====================================
// GLOBAL RELOAD FUNCTION
// DEBUG SUPPORT
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
// FINAL READY LOG
// =====================================

console.log(

    "✅ CARD.JS CLEAN FINAL VERSION LOADED"

);
