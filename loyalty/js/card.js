// ======================================
// RIO MAGGI POINT
// CARD.JS
// FINAL CLEAN FIXED VERSION
// CENTRAL APP ARCHITECTURE
// ======================================


// ======================================
// IMPORTS
// ======================================

import {
    RioApp
} from "./app.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// ======================================
// FIREBASE SERVICES
// ======================================

const {
    auth,
    db
} = RioApp;



// ======================================
// CONFIG
// ======================================

const TOTAL_STAMPS = 
    RioApp.config.loyaltyStampsRequired || 6;


const CYCLE_DAYS =
    RioApp.config.loyaltyCycleDays || 40;


const SHOP_PHONE =
    RioApp.config.contactNumber;


const WHATSAPP_NUMBER =
    RioApp.config.whatsappNumber;



// ======================================
// GLOBAL STATE
// ======================================

window.rioCustomerData = null;

window.rioCurrentStamps = 0;

let countdownTimer = null;



// ======================================
// DOM READY
// ======================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    initializeCardButtons();

});



// ======================================
// BUTTON EVENTS
// ======================================

function initializeCardButtons(){


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
        (e)=>{

            e.preventDefault();

            window.location.href =
            "../index.html";

        };

    }




    const callBtn =
    document.getElementById(
        "callShopBtn"
    );


    if(callBtn){

        callBtn.href =
        `tel:+91${SHOP_PHONE}`;

    }




    const whatsappBtn =
    document.getElementById(
        "whatsappShopBtn"
    );


    if(whatsappBtn){

        const message =
        encodeURIComponent(
        "Hello Rio Maggi Point, I want information about loyalty program."
        );


        whatsappBtn.href =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    }




    const mapBtn =
    document.getElementById(
        "mapShopBtn"
    );


    if(mapBtn){

        mapBtn.onclick = ()=>{

            alert(
            "Rio Maggi Point location coming soon."
            );

        };

    }




    const rewardBtn =
    document.getElementById(
        "claimRewardBtn"
    );


    if(rewardBtn){

        rewardBtn.onclick = ()=>{

            window.location.href =
            "reward.html";

        };

    }


}



// ======================================
// LOAD CUSTOMER CARD
// ======================================


window.addEventListener(
"rio-auth-state-changed",
async(event)=>{


    const user =
    event.detail.user;


    if(!user){

        window.location.href =
        "login.html";

        return;

    }


    await loadCustomerCard(
        user.uid
    );


});




// ======================================
// GET CUSTOMER DATA
// ======================================


async function loadCustomerCard(uid){


    try{


        const customerRef =
        doc(
            db,
            "customers",
            uid
        );


        const snap =
        await getDoc(
            customerRef
        );



        if(!snap.exists()){


            showDefaultCustomerData();

            return;

        }



        const customer = {


            uid,

            ...snap.data()


        };



        window.rioCustomerData =
        customer;



        const stamps =
        Number(
            customer.stamps || 0
        );



        window.rioCurrentStamps =
        stamps;



        updateCustomerProfile(
            customer
        );



        updateStampUI(
            stamps
        );



        updateRewardUI(
            stamps
        );



        updateCountdown(
            customer,
            stamps
        );


    }


    catch(error){


        console.error(
        "Card Load Error:",
        error
        );


    }


}




// ======================================
// PROFILE UPDATE
// ======================================


function updateCustomerProfile(customer){


    const name =
    customer.name ||
    "Rio Maggi Member";



    const nameBox =
    document.getElementById(
        "loyaltyCustomerName"
    );


    const welcome =
    document.getElementById(
        "welcomeUserName"
    );


    if(nameBox)
        nameBox.textContent=name;


    if(welcome)
        welcome.textContent=name;




    const photo =
    document.getElementById(
        "loyaltyCustomerPhoto"
    );


    if(photo){

        photo.src =
        customer.avatar ||
        customer.photoURL ||
        "assets/default-avatar.png";

    }




    const dateBox =
    document.getElementById(
        "memberSinceDate"
    );


    if(dateBox){

        dateBox.textContent =
        formatDate(
            customer.createdAt
        );

    }


}




// ======================================
// STAMP UI
// ======================================


function updateStampUI(count){


    const total =
    Math.min(
        Math.max(Number(count)||0,0),
        TOTAL_STAMPS
    );



    document
    .querySelectorAll(
        ".stamp-box"
    )
    .forEach(
    box=>{


        const number =
        Number(
            box.dataset.stamp
        );


        box.classList.toggle(
            "active",
            number <= total
        );


    });



    const countText =
    document.getElementById(
        "stampCountText"
    );


    if(countText)
        countText.textContent =
        `${total}/${TOTAL_STAMPS}`;



    const bar =
    document.getElementById(
        "stampProgressBar"
    );


    if(bar)
        bar.style.width =
        `${(total/TOTAL_STAMPS)*100}%`;



    const text =
    document.getElementById(
        "stampProgressText"
    );


    if(text)
        text.textContent =
        `${total} of ${TOTAL_STAMPS} valid stamps collected`;

}



// ======================================
// REWARD UI
// ======================================


function updateRewardUI(stamps){


    const status =
    document.getElementById(
        "rewardStatus"
    );


    const btn =
    document.getElementById(
        "claimRewardBtn"
    );



    if(stamps >= TOTAL_STAMPS){


        if(status)
        status.innerHTML =
        `
        🎉 Reward Unlocked!
        <br><br>
        FREE Veg Maggi 🍜
        `;



        if(btn){

            btn.disabled=false;

            btn.innerHTML =
            `
            <i class="fa-solid fa-gift"></i>
            Claim Your FREE Veg Maggi
            `;

        }


    }

}



// ======================================
// 40 DAYS COUNTDOWN
// ======================================


function updateCountdown(customer,stamps){


    const element =
    document.getElementById(
        "countdownDays"
    );


    if(!element)
        return;



    if(stamps >= TOTAL_STAMPS){

        element.textContent =
        "REWARD READY";

        return;

    }



    let start =
    parseDate(
        customer.cycleStartedAt
    );



    if(!start){

        element.textContent =
        `${CYCLE_DAYS} DAYS`;

        return;

    }



    const passed =
    Math.floor(
    (
        Date.now()
        -
        start.getTime()
    )
    /
    86400000
    );



    const remaining =
    Math.max(
        0,
        CYCLE_DAYS-passed
    );



    element.textContent =
    `${remaining} DAYS`;

}



// ======================================
// DATE HELPERS
// ======================================


function parseDate(value){


    if(!value)
        return null;


    if(value.toDate)
        return value.toDate();


    const date =
    new Date(value);


    return isNaN(date)
    ? null
    : date;

}



function formatDate(value){


    const date =
    parseDate(value);


    if(!date)
        return "--";


    return date.toLocaleDateString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );

}



// ======================================
// DEFAULT DATA
// ======================================


function showDefaultCustomerData(){


    updateStampUI(0);

    updateRewardUI(0);


}



// ======================================
// CLEANUP
// ======================================


window.addEventListener(
"beforeunload",
()=>{


    if(countdownTimer)
        clearInterval(
            countdownTimer
        );


});



console.log(
"🍜 Rio Maggi Point Card.js Loaded"
);
