// =====================================
// RIO MAGGI POINT
// CARD.JS
// FINAL FIXED FIREBASE + LOYALTY VERSION
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

const CUSTOMER_PHONE =
"917987827979";


const CUSTOMER_PHONE_TEL =
"+917987827979";




// =====================================
// GLOBAL VARIABLES
// =====================================

let rioCustomerCache = null;

let isCardInitialized = false;

let countdownInterval = null;




// =====================================
// GLOBAL STATE EXPORT
// =====================================

window.currentRioUser = null;

window.rioCurrentStamps = 0;

window.rioCountdownDays =
STAMP_RESET_DAYS;

window.rioMemberSince = null;

window.rioCustomerMobile = null;





// =====================================
// FIREBASE CHECK
// =====================================

if(!db){


    console.error(
        "❌ Card.js Firestore DB Missing"
    );


}
else{


    console.log(
        "✅ Card.js Firestore Connected"
    );


}





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



});





// =====================================
// GAME BUTTON
// =====================================

function setupGameButton(){


    const button =
    document.getElementById(
        "gameLink"
    );


    if(!button)

        return;



    button.addEventListener(

    "click",

    ()=>{


        button.classList.add(
            "game-button-clicked"
        );


        setTimeout(()=>{


            button.classList.remove(
                "game-button-clicked"
            );


        },300);



        window.location.href =
        "../index.html";


    });


}






// =====================================
// CALL BUTTON
// =====================================

function setupCallButton(){


    const button =
    document.getElementById(
        "callBtn"
    );


    if(!button)

        return;



    button.addEventListener(

    "click",

    ()=>{


        window.location.href =
        "tel:" +
        CUSTOMER_PHONE_TEL;


    });


}






// =====================================
// WHATSAPP BUTTON
// =====================================

function setupWhatsAppButton(){


    const button =
    document.getElementById(
        "whatsappBtn"
    );


    if(!button)

        return;



    button.addEventListener(

    "click",

    ()=>{


        const message =
        encodeURIComponent(

        "Hello Rio Maggi Point, I want to know more about the loyalty program."

        );



        const url =

        "https://wa.me/" +

        CUSTOMER_PHONE +

        "?text=" +

        message;



        window.open(

            url,

            "_blank",

            "noopener,noreferrer"

        );


    });


}





// =====================================
// MAP BUTTON
// =====================================

function setupMapButton(){


    const button =
    document.getElementById(
        "mapBtn"
    );


    if(!button)

        return;



    button.addEventListener(

    "click",

    ()=>{


        showComingSoonMessage(
            "Google Maps location is coming soon."
        );


    });


}





// =====================================
// DELIVERY BUTTON
// =====================================

function setupDeliveryButton(){


    const button =
    document.getElementById(
        "deliveryBtn"
    );


    if(!button)

        return;



    button.addEventListener(

    "click",

    ()=>{


        showComingSoonMessage(
            "Delivery service is coming soon."
        );


    });


}





// =====================================
// TOAST / ALERT
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
// RIO MAGGI POINT
// CARD.JS
// PART 2/4
// FIRESTORE CUSTOMER SYSTEM
// =====================================


// =====================================
// GET CUSTOMER DOCUMENT
// FIXED COLLECTION NAME
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



        const customerRef = doc(

            db,

            "customers",

            user.uid

        );



        const snapshot = await getDoc(

            customerRef

        );



        if(
            !snapshot.exists()
        ){


            console.warn(

                "Customer document not found:",

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
// STAMP COUNT SYSTEM
// =====================================

function getStampCount(userData){



    let count = Number(

        userData.stamps ??

        userData.currentStamps ??

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
// FIREBASE DATE CONVERTER
// =====================================

function parseFirebaseDate(value){



    try{


        if(!value)

            return null;




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




        const date = new Date(value);



        if(
            isNaN(date.getTime())
        ){

            return null;

        }



        return date;



    }

    catch(error){


        console.error(

            "Date Parse Error:",

            error

        );


        return null;


    }



}






// =====================================
// STAMP DATE LIST
// =====================================

function getValidStampDates(stampDates){



    if(
        !Array.isArray(stampDates)
    ){

        return [];

    }



    return stampDates

    .slice(

        0,

        TOTAL_STAMPS

    )

    .map(parseFirebaseDate)

    .filter(Boolean);



}







// =====================================
// LAST STAMP DATE
// =====================================

function getLastStampDate(userData){



    const dates =

    getValidStampDates(

        userData.stampDates

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



    if(!date)

        return 0;



    const now = new Date();



    const todayUTC = Date.UTC(

        now.getFullYear(),

        now.getMonth(),

        now.getDate()

    );



    const stampUTC = Date.UTC(

        date.getFullYear(),

        date.getMonth(),

        date.getDate()

    );



    return Math.floor(

        (

            todayUTC -

            stampUTC

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
// 40 DAYS RESET CHECK
// =====================================

async function resetExpiredCycleIfNeeded(

    userRef,

    userData

){



    const stamps =

    getStampCount(

        userData

    );



    // Reward unlocked stays

    if(
        stamps >= TOTAL_STAMPS
    ){

        return {

            data:userData,

            reset:false

        };


    }





    const lastStamp =

    getLastStampDate(

        userData

    );



    if(!lastStamp){


        return {

            data:userData,

            reset:false

        };


    }





    const daysPassed =

    calculateCalendarDaysPassed(

        lastStamp

    );





    if(
        daysPassed < STAMP_RESET_DAYS
    ){


        return {

            data:userData,

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

            userRef,

            resetData

        );



        console.log(

            "✅ 40 Day Stamp Cycle Reset"

        );



        return {


            data:{

                ...userData,

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


            data:userData,


            reset:false


        };


    }



}
// =====================================
// RIO MAGGI POINT
// CARD.JS
// PART 3/4
// CUSTOMER UI RENDER SYSTEM
// =====================================



// =====================================
// RENDER CUSTOMER PROFILE
// =====================================

function renderCustomerData(
    user,
    userData
){


    const nameElement =
    document.getElementById(
        "customerName"
    );



    if(nameElement){


        nameElement.textContent =

        userData.name ||

        userData.fullName ||

        user.displayName ||

        "Rio Customer";


    }






    const memberIdElement =
    document.getElementById(
        "memberId"
    );



    if(memberIdElement){


        memberIdElement.textContent =

        userData.memberId ||

        (

            "RIO-" +

            user.uid
            .slice(0,10)
            .toUpperCase()

        );


    }






    const photoElement =
    document.getElementById(
        "customerPhoto"
    );



    if(photoElement){


        photoElement.src =

        userData.photoURL ||

        user.photoURL ||

        "image/default-avatar.png";


    }





    window.rioMemberSince =

    userData.memberSince ||

    null;




    window.rioCustomerMobile =

    userData.mobile ||

    null;



}







// =====================================
// RENDER STAMP SYSTEM
// =====================================

function renderStampData(
    userData
){



    const stampCount =

    getStampCount(

        userData

    );



    const dates =

    getValidStampDates(

        userData.stampDates

    );






    for(
        let i = 1;

        i <= TOTAL_STAMPS;

        i++
    ){



        const stamp =

        document.getElementById(

            "stamp" + i

        );



        if(!stamp)

            continue;





        if(
            i <= stampCount
        ){


            stamp.classList.add(

                "active"

            );



            stamp.innerHTML =

            '<i class="fa-solid fa-check"></i>';



        }

        else{


            stamp.classList.remove(

                "active"

            );



            stamp.innerHTML =

            "<span>"+i+"</span>";



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

    stampCount;




    updateRewardStatus(

        stampCount

    );



}








// =====================================
// REWARD UNLOCK SYSTEM
// =====================================

function updateRewardStatus(
    stamps
){



    const rewardCircle =

    document.getElementById(

        "rewardCircle"

    );



    if(!rewardCircle)

        return;




    const unlocked =

    stamps >= TOTAL_STAMPS;




    rewardCircle.classList.toggle(

        "active",

        unlocked

    );



    rewardCircle.classList.toggle(

        "reward-unlocked",

        unlocked

    );





    const rewardText =

    document.getElementById(

        "rewardStatus"

    );



    if(rewardText){


        rewardText.textContent =


        unlocked

        ?

        "FREE VEG MAGGI READY"

        :

        "Collect 6 stamps to unlock";


    }



}








// =====================================
// COUNTDOWN DISPLAY
// =====================================

function updateLocalCountdown(
    userData
){



    const element =

    document.getElementById(

        "countdownDays"

    );



    const stamps =

    getStampCount(

        userData

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

        userData

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
// LOAD CARD DATA
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

            "No customer data found"

        );


        return;


    }





    let userData =

    customer.data;





    const cycle =

    await resetExpiredCycleIfNeeded(

        customer.ref,

        userData

    );





    userData =

    cycle.data;





    rioCustomerCache =

    userData;





    renderCustomerData(

        user,

        userData

    );





    renderStampData(

        userData

    );





    updateLocalCountdown(

        userData

    );





    console.log(

        "🍜 Customer Card Loaded"

    );



}
// =====================================
// RIO MAGGI POINT
// CARD.JS
// PART 4/4
// AUTH + TIMER + FINAL INITIALIZATION
// =====================================



// =====================================
// START COUNTDOWN TIMER
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
// STOP COUNTDOWN TIMER
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

        "🍜 Rio Maggi Point CARD.JS Final Fixed Loaded Successfully"

    );



}

);








// =====================================
// GLOBAL DEBUG HELPERS
// =====================================

window.reloadRioCard =

async function(){



    if(window.currentRioUser){



        await loadCardData(

            window.currentRioUser

        );



        console.log(

            "Card Reloaded"

        );



    }



};








console.log(

    "✅ CARD.JS READY"

);
