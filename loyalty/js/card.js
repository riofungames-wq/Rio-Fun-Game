// =====================================================
// RIO MAGGI POINT
// CARD.JS
// PREMIUM VERSION
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const happyCircle =
document.getElementById("happyCircle");

const rewardCircle =
document.querySelector(".reward-circle");

const stampCircles = [

document.getElementById("stamp1"),
document.getElementById("stamp2"),
document.getElementById("stamp3"),
document.getElementById("stamp4"),
document.getElementById("stamp5"),
document.getElementById("stamp6")

];

const callShopBtn =
document.getElementById("callShopBtn");

const whatsappBtn =
document.getElementById("whatsappBtn");

const mapBtn =
document.getElementById("mapBtn");

// =====================================================
// SHOP INFO
// =====================================================

const SHOP_PHONE = "8871689650";

const SHOP_WHATSAPP = "918871689650";

const SHOP_MAP =
"https://www.google.com/maps/place/Rio+Aqua+Decor+Aquarium+Shop";
// =====================================================
// AUTH CHECK
// =====================================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    try{

        const customerRef =
        doc(db,"customers",user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if(!customerSnap.exists()){

            alert("Customer not found.");

            return;

        }

        const customer =
        customerSnap.data();

        loadCustomer(customer);

    }

    catch(error){

        console.error(error);

        alert("Unable to load customer.");

    }

});

// =====================================================
// LOAD CUSTOMER
// =====================================================

function loadCustomer(customer){

    // Customer Name

    customerName.textContent =
    customer.name || "Customer";

    // Member ID

    memberId.textContent =
    customer.memberId || "RIO-000000";

    // Avatar

    if(customer.photoURL){

        customerPhoto.src =
        customer.photoURL;

    }

    // Theme

    applyTheme(customer.gender);

    // Stamp

    updateStamps(customer.stamps || 0);

    // Reward

    updateReward(customer.rewardUnlocked);

    // Happy Mascot

    updateHappyMascot(customer.gender);

}

// =====================================================
// APPLY THEME
// =====================================================

function applyTheme(gender){

    const card =
    document.getElementById("loyaltyCard");

    if(!card) return;

    card.classList.remove(
        "male-theme",
        "female-theme"
    );

    if(
        gender &&
        gender.toLowerCase()=="female"
    ){

        card.classList.add(
        "female-theme");

    }

    else{

        card.classList.add(
        "male-theme");

    }

}
// =====================================================
// STAMP UPDATE
// =====================================================

function updateStamps(stamps){

    stampCircles.forEach((circle,index)=>{

        circle.classList.remove("active");

        if(index < stamps){

            circle.classList.add("active");

            circle.innerHTML="✔";

        }

        else{

            circle.innerHTML=`<span>${index+1}</span>`;

        }

    });

}

// =====================================================
// REWARD
// =====================================================

function updateReward(unlocked){

    if(!rewardCircle) return;

    if(unlocked){

        rewardCircle.classList.add("active");

    }

    else{

        rewardCircle.classList.remove("active");

    }

}

// =====================================================
// HAPPY MASCOT
// =====================================================

function updateHappyMascot(gender){

    const img =
    happyCircle.querySelector("img");

    if(!img) return;

    if(
        gender &&
        gender.toLowerCase()=="female"
    ){

        img.src=
        "assets/mascot/rio-female.png";

    }

    else{

        img.src=
        "assets/mascot/rio-male.png";

    }

}

// =====================================================
// CALL BUTTON
// =====================================================

callShopBtn.addEventListener("click",()=>{

    window.location.href=
    `tel:${SHOP_PHONE}`;

});

// =====================================================
// WHATSAPP
// =====================================================

whatsappBtn.addEventListener("click",()=>{

    window.open(

    `https://wa.me/${SHOP_WHATSAPP}`,

    "_blank"

    );

});

// =====================================================
// GOOGLE MAP
// =====================================================

mapBtn.addEventListener("click",()=>{

    window.open(

    SHOP_MAP,

    "_blank"

    );

});

// =====================================================
// CONSOLE
// =====================================================

console.log("RIO MAGGI POINT");

console.log("Premium Loyalty Card Loaded");
