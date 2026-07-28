// =====================================================
// RIO MAGGI POINT
// CUSTOMER PREMIUM CARD
// CARD.JS
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

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const customerPhoto =
document.getElementById("customerPhoto");

const loyaltyCard =
document.getElementById("loyaltyCard");

const playGameBtn =
document.getElementById("playGameBtn");


// =====================================================
// AUTH CHECK
// =====================================================

onAuthStateChanged(auth, async(user)=>{


if(!user){

window.location.href =
"login.html";

return;

}


try{


const customerRef =
doc(
db,
"customers",
user.uid
);


const customerSnap =
await getDoc(customerRef);



if(customerSnap.exists()){


const customer =
customerSnap.data();



loadCustomer(customer);



}
else{


customerName.textContent =
"Customer";


memberId.textContent =
"RIO MEMBER";


}



}

catch(error){

console.error(
"Card Loading Error:",
error
);


}



});


// =====================================================
// LOAD CUSTOMER
// =====================================================

function loadCustomer(customer){


customerName.textContent =
customer.name || "Customer";


memberId.textContent =
customer.memberId ||
("RIO-" + Date.now());



if(customer.photoURL){


customerPhoto.src =
customer.photoURL;


}



// Theme Check

if(customer.gender === "female"){


loyaltyCard.classList.remove(
"male-theme"
);


loyaltyCard.classList.add(
"female-theme"
);


}



}
// =====================================================
// STAMP SYSTEM
// =====================================================


function loadStamps(customer){


const stamps =
customer.stamps || 0;


// Stamp Elements

for(let i=1;i<=6;i++){


const stamp =
document.getElementById(
"stamp"+i
);


const date =
document.getElementById(
"date"+i
);



if(!stamp) continue;



if(i <= stamps){


stamp.classList.add(
"active"
);


// Gender Stamp

if(customer.gender === "female"){


stamp.innerHTML =
"💖";


}
else{


stamp.innerHTML =
"👑";


}



if(customer.stampDates &&
customer.stampDates[i-1]){


date.textContent =
customer.stampDates[i-1];


}
else{


date.textContent =
"Done";


}


}
else{


stamp.classList.remove(
"active"
);


stamp.innerHTML =
i;


date.textContent =
"--";


}



}


}


// =====================================================
// REWARD & HAPPY MASCOT
// =====================================================


function loadReward(customer){


const reward =
document.getElementById(
"rewardVegMaggi"
);


const mascot =
document.getElementById(
"happyMascot"
);



if(reward){


if(customer.stamps >= 6){


reward.style.opacity =
"1";


}
else{


reward.style.opacity =
"0.45";


}


}



// Female Mascot

if(mascot &&
customer.gender === "female"){


mascot.src =
"assets/mascot/rio-female.png";


}



}



// =====================================================
// PLAY FREE GAME
// =====================================================


if(playGameBtn){


playGameBtn.addEventListener(
"click",
()=>{


window.location.href =
"rio-fun-game.html";


});


}



// =====================================================
// UPDATE LOAD CUSTOMER
// =====================================================


const oldLoadCustomer =
loadCustomer;


loadCustomer =
function(customer){


oldLoadCustomer(customer);


loadStamps(customer);


loadReward(customer);


};
// =====================================================
// SHOP QUICK ACTIONS
// =====================================================


const callShopBtn =
document.getElementById(
"callShopBtn"
);


const whatsappBtn =
document.getElementById(
"whatsappBtn"
);


const mapBtn =
document.getElementById(
"mapBtn"
);



// Shop Details

const shopMobile =
"8871689650";


const shopWhatsApp =
"918871689650";


// Google Map Location

const shopLocation =
"https://maps.google.com/?q=Rio+Maggi+Point";




// CALL

if(callShopBtn){


callShopBtn.addEventListener(
"click",
()=>{


window.location.href =
"tel:" + shopMobile;


});


}



// WHATSAPP

if(whatsappBtn){


whatsappBtn.addEventListener(
"click",
()=>{


window.open(
"https://wa.me/"+shopWhatsApp,
"_blank"
);


});


}



// MAP

if(mapBtn){


mapBtn.addEventListener(
"click",
()=>{


window.open(
shopLocation,
"_blank"
);


});


}




// =====================================================
// AUTO UPDATE CHECK
// =====================================================


window.addEventListener(
"focus",
async()=>{


const user =
auth.currentUser;


if(!user) return;



try{


const customerRef =
doc(
db,
"customers",
user.uid
);


const snap =
await getDoc(
customerRef
);



if(snap.exists()){


const data =
snap.data();


loadStamps(data);


loadReward(data);


}



}

catch(error){


console.error(
"Refresh Error:",
error
);


}



});





// =====================================================
// READY MESSAGE
// =====================================================


console.log(
"================================="
);


console.log(
"🍜 Rio Maggi Point"
);


console.log(
"Premium Customer Card Loaded"
);


console.log(
"ATM Loyalty Design Connected"
);


console.log(
"Firebase Connected"
);


console.log(
"================================="
);
// =====================================================
// FINAL SAFETY CHECK
// =====================================================


// Prevent broken image

if(customerPhoto){

customerPhoto.onerror = ()=>{

customerPhoto.src =
"assets/avatars/default.png";

};

}



// Prevent mascot error

const happyMascot =
document.getElementById(
"happyMascot"
);


if(happyMascot){

happyMascot.onerror = ()=>{

happyMascot.src =
"assets/mascot/rio-male.png";

};

}



// Reward image fallback

const rewardVegMaggi =
document.getElementById(
"rewardVegMaggi"
);


if(rewardVegMaggi){

rewardVegMaggi.onerror = ()=>{

rewardVegMaggi.style.display =
"none";

};

}



// =====================================================
// PREVENT MULTIPLE LOGIN LOOP
// =====================================================


let cardLoaded = false;



onAuthStateChanged(auth, async(user)=>{


if(!user || cardLoaded)
return;



cardLoaded = true;



try{


const ref =
doc(
db,
"customers",
user.uid
);



const snap =
await getDoc(
ref
);



if(snap.exists()){


const data =
snap.data();


loadCustomer(data);


loadStamps(data);


loadReward(data);


}



}

catch(error){


console.error(
"Final Card Error:",
error
);



}



});



// =====================================================
// END
// =====================================================


console.log(
"✅ Rio Premium ATM Loyalty Card JS Completed"
);
