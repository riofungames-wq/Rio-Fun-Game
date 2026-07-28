// =======================================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD
// PART 1
// =======================================================

import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =======================================================
// DOM
// =======================================================

const loyaltyCard =
document.getElementById("loyaltyCard");

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const playGameBtn =
document.getElementById("playGameBtn");

const callShopBtn =
document.getElementById("callShopBtn");

const whatsappBtn =
document.getElementById("whatsappBtn");

const mapBtn =
document.getElementById("mapBtn");

// =======================================================
// AUTO LOGIN CHECK
// =======================================================

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

alert("Customer record not found.");

window.location.href="login.html";

return;

}

window.customer =
customerSnap.data();

loadCustomer(window.customer);

}

catch(error){

console.error(error);

alert("Unable to load customer.");

}

});
// =======================================================
// LOAD CUSTOMER
// PART 2
// =======================================================

function loadCustomer(customer){

// -----------------------------
// Name
// -----------------------------

customerName.textContent =
customer.name || "Customer";

// -----------------------------
// Member ID
// -----------------------------

memberId.textContent =
customer.memberId || "RIO-000000";

// -----------------------------
// Theme
// -----------------------------

loyaltyCard.classList.remove(
"male-theme",
"female-theme"
);

if(customer.gender === "female"){

loyaltyCard.classList.add("female-theme");

}else{

loyaltyCard.classList.add("male-theme");

}

// -----------------------------
// Profile Photo
// -----------------------------

if(customer.photoURL){

customerPhoto.src =
customer.photoURL;

}
else if(customer.avatar){

customerPhoto.src =
customer.avatar;

}
else{

customerPhoto.src =
"assets/avatars/default.png";

}

// -----------------------------
// Play Button
// -----------------------------

playGameBtn.onclick = ()=>{

window.open(

"https://riofungames-wq.github.io/Rio-Fun-Game/",

"_blank"

);

};

// -----------------------------
// Load Stamps
// -----------------------------

loadStamps(customer);

}
// =======================================================
// STAMP SYSTEM
// PART 3
// =======================================================

function loadStamps(customer){

const totalStamps =
Number(customer.stamps || 0);

for(let i=1;i<=6;i++){

const stamp =
document.getElementById("stamp"+i);

const date =
document.getElementById("date"+i);

if(!stamp) continue;

stamp.classList.remove("active");

if(totalStamps >= i){

stamp.classList.add("active");

if(customer.gender === "female"){

stamp.innerHTML = "<span>💖</span>";

}else{

stamp.innerHTML = "<span>👑</span>";

}

if(date){

const stampDate =
customer["stampDate"+i];

date.textContent =
stampDate || "--";

}

}else{

stamp.innerHTML =
`<span>${i}</span>`;

if(date){

date.textContent="--";

}

}

}

// ----------------------------------
// 7th Reward
// ----------------------------------

const rewardCircle =
document.querySelector(".reward-circle");

if(rewardCircle){

if(totalStamps >= 6){

rewardCircle.style.boxShadow =
"0 0 18px rgba(255,215,0,.9)";

}else{

rewardCircle.style.boxShadow =
"none";

}

}

// ----------------------------------
// 8th Mascot
// ----------------------------------

const mascot =
document.getElementById("happyCircle");

if(mascot){

mascot.classList.add("happy-animation");

}

}
// =======================================================
// QUICK ACTIONS + LOGOUT
// PART 4
// =======================================================

// -----------------------------
// Call Button
// -----------------------------

callShopBtn?.addEventListener("click",()=>{

window.location.href="tel:+918871689650";

});

// -----------------------------
// WhatsApp Button
// -----------------------------

whatsappBtn?.addEventListener("click",()=>{

window.open(

"https://wa.me/918871689650",

"_blank"

);

});

// -----------------------------
// Google Map
// -----------------------------

mapBtn?.addEventListener("click",()=>{

window.open(

"https://maps.google.com",

"_blank"

);

});

// -----------------------------
// Logout
// -----------------------------

const logoutBtn =
document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click",async()=>{

const ok =
confirm("Logout from Rio Maggi Point ?");

if(!ok) return;

try{

await signOut(auth);

window.location.href="login.html";

}

catch(error){

console.error(error);

alert("Logout Failed");

}

});

// =======================================================
// READY
// =======================================================

console.log("====================================");
console.log("🍜 Rio Maggi Point");
console.log("Premium ATM Loyalty Card Ready");
console.log("Firebase Connected");
console.log("====================================");
