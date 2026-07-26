// ======================================================
// RIO MAGGI POINT
// card.js
// FINAL VERSION
// PART 1 / 4
// ======================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================================
// HTML ELEMENTS
// ======================================================

const loyaltyCard =
document.getElementById("loyaltyCard");

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const mobileNumber =
document.getElementById("mobileNumber");

const playGameBtn =
document.getElementById("playGameBtn");


// ------------------------------------------------------
// Stamp Circles
// ------------------------------------------------------

const stamp1 =
document.getElementById("stamp1");

const stamp2 =
document.getElementById("stamp2");

const stamp3 =
document.getElementById("stamp3");

const stamp4 =
document.getElementById("stamp4");

const stamp5 =
document.getElementById("stamp5");

const stamp6 =
document.getElementById("stamp6");

const rewardCircle =
document.getElementById("rewardCircle");

const happyCircle =
document.getElementById("happyCircle");


// ------------------------------------------------------
// Stamp Dates
// ------------------------------------------------------

const date1 =
document.getElementById("date1");

const date2 =
document.getElementById("date2");

const date3 =
document.getElementById("date3");

const date4 =
document.getElementById("date4");

const date5 =
document.getElementById("date5");

const date6 =
document.getElementById("date6");


// ======================================================
// CHECK LOGIN
// ======================================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    try{

        const ref =
        doc(db,"customers",user.uid);

        const snap =
        await getDoc(ref);

        if(!snap.exists()){

            alert("Customer record not found.");

            return;

        }

        const customer =
        snap.data();

        loadCustomer(customer);

    }

    catch(error){

        console.error(error);

        alert("Unable to load customer.");

    }

});
// ======================================================
// LOAD CUSTOMER
// ======================================================

function loadCustomer(customer){

    // -----------------------------------
    // Name
    // -----------------------------------

    customerName.textContent =
    customer.name || "Customer";

    // -----------------------------------
    // Member ID
    // -----------------------------------

    memberId.textContent =
    customer.memberId || "-----";

    // -----------------------------------
    // Mobile
    // -----------------------------------

    if(mobileNumber){

        mobileNumber.textContent =
        customer.mobile || "";

    }

    // -----------------------------------
    // Avatar
    // -----------------------------------

    if(customer.avatar){

        customerPhoto.src =
        customer.avatar;

    }else{

        if(customer.gender==="female"){

            customerPhoto.src =
            "assets/avatars/female-01.png";

        }else{

            customerPhoto.src =
            "assets/avatars/male-01.png";

        }

    }

    // -----------------------------------
    // Theme
    // -----------------------------------

    loyaltyCard.classList.remove(
        "theme-male",
        "theme-female"
    );

    if(customer.gender==="female"){

        loyaltyCard.classList.add(
            "theme-female"
        );

    }else{

        loyaltyCard.classList.add(
            "theme-male"
        );

    }

    // -----------------------------------
    // Stamp Progress
    // -----------------------------------

    loadStampProgress(
        customer.stamps || 0
    );

    // -----------------------------------
    // Reward
    // -----------------------------------

    updateReward(customer);

}
// ======================================================
// LOAD STAMP PROGRESS
// ======================================================

function loadStampProgress(stamps){

    const circles = [
        stamp1,
        stamp2,
        stamp3,
        stamp4,
        stamp5,
        stamp6
    ];

    // Reset

    circles.forEach(circle => {

        if(circle){

            circle.classList.remove("active");

        }

    });

    // Fill Active Stamp

    for(let i=0; i<stamps && i<6; i++){

        if(circles[i]){

            circles[i].classList.add("active");

        }

    }

    // -----------------------------------
    // Reward Circle (7th)
    // -----------------------------------

    if(rewardCircle){

        rewardCircle.classList.remove("active");

        if(stamps >= 6){

            rewardCircle.classList.add("active");

        }

    }

    // -----------------------------------
    // Happy Emoji (8th)
    // -----------------------------------

    updateHappyEmoji(stamps);

}


// ======================================================
// HAPPY EMOJI
// ======================================================

function updateHappyEmoji(stamps){

    if(!happyCircle) return;

    const emoji = [

        "🙂",
        "😊",
        "😄",
        "😁",
        "🤩",
        "🥳",
        "🎉"

    ];

    let index = Math.min(stamps,6);

    happyCircle.textContent = emoji[index];

    if(stamps >= 6){

        happyCircle.classList.add("celebrate");

    }else{

        happyCircle.classList.remove("celebrate");

    }

}
// ======================================================
// REWARD STATUS
// ======================================================

function updateReward(customer){

    if(!rewardCircle) return;

    rewardCircle.classList.remove("unlocked");

    if(customer.rewardUnlocked===true){

        rewardCircle.classList.add("unlocked");

    }

}


// ======================================================
// STAMP DATE SUPPORT
// (Future Admin Panel Integration)
// ======================================================

function loadStampDates(customer){

    // Future Version:
    // Admin Panel stampDates save karega.
    // Yahaan automatically dates fill hongi.

}


// ======================================================
// PLAY GAME BUTTON
// ======================================================

if(playGameBtn){

    playGameBtn.addEventListener("click",()=>{

        window.location.href="game.html";

    });

}


// ======================================================
// DEBUG
// ======================================================

console.log("================================");
console.log("RIO MAGGI POINT");
console.log("Premium Card Loaded Successfully");
console.log("Firebase Connected");
console.log("================================");
