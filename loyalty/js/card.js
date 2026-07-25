// ======================================
// RIO MAGGI POINT
// PREMIUM CARD V3
// FIREBASE
// PART 1
// ======================================

import { firebaseConfig }
from "../js/firebase-config.js";

import {
initializeApp
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
getFirestore,
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ======================================
// FIREBASE
// ======================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// ======================================
// HTML ELEMENTS
// ======================================

const customerCard =
document.getElementById("customerCard");

const customerPhoto =
document.getElementById("customerPhoto");

const avatarDisplay =
document.getElementById("avatarDisplay");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const memberBadge =
document.getElementById("memberBadge");

const customerLevel =
document.getElementById("customerLevel");

const stampProgress =
document.getElementById("stampProgress");

const rewardMessage =
document.getElementById("rewardMessage");

const qrCustomerName =
document.getElementById("qrCustomerName");

const qrCustomerId =
document.getElementById("qrCustomerId");

const qrCodeBox =
document.getElementById("qrCodeBox");

// ======================================
// LOAD CUSTOMER
// ======================================

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

try{

const customerRef = doc(
db,
"customers",
user.uid
);

const snap = await getDoc(customerRef);

if(!snap.exists()){

console.log("Customer Not Found");

return;

}

const data = snap.data();

// Name

customerName.textContent =
data.name || "Customer";

// QR Name

qrCustomerName.textContent =
data.name || "Customer";

// Member ID

const id =
data.memberId || user.uid;

memberId.textContent =
"Member ID : " + id;

qrCustomerId.textContent =
"Member ID : " + id;

// Avatar

loadAvatar(data);

// Gender Theme

applyTheme(data);

// Member Level

updateMemberLevel(data.stamps || 0);

// Stamp

loadStamps(data.stamps || 0);

// QR

generateQR(id);

}

catch(err){

console.error(err);

}

});
// ======================================
// RIO MAGGI POINT
// PREMIUM CARD V3
// PART 2
// ======================================

// ======================================
// LOAD AVATAR
// ======================================

function loadAvatar(data){

if(data.photoURL){

customerPhoto.src = data.photoURL;

customerPhoto.style.display = "block";

avatarDisplay.style.display = "none";

}

else{

customerPhoto.style.display = "none";

avatarDisplay.style.display = "flex";

avatarDisplay.textContent =
data.avatar || "😊";

}

}

// ======================================
// APPLY GENDER THEME
// ======================================

function applyTheme(data){

customerCard.classList.remove(
"male",
"female"
);

// Expected values:
// "male", "female", "boy", "girl", "M", "F"

const gender =
(data.gender || "")
.toLowerCase();

if(
gender === "female" ||
gender === "girl" ||
gender === "f"
){

customerCard.classList.add("female");

}

else{

customerCard.classList.add("male");

}

}

// ======================================
// MEMBER LEVEL
// ======================================

function updateMemberLevel(stamps){

let level = "";
let badge = "";

if(stamps >= 6){

level = "👑 Elite Member";
badge = "👑 ELITE MEMBER";

}

else if(stamps >= 3){

level = "🥇 Gold Member";
badge = "🥇 GOLD MEMBER";

}

else{

level = "⭐ Silver Member";
badge = "⭐ SILVER MEMBER";

}

customerLevel.textContent = level;
  // ======================================
// RIO MAGGI POINT
// PREMIUM CARD V3
// PART 3
// STAMP SYSTEM
// ======================================

function loadStamps(totalStamps){

// Maximum 6 stamps

const stamps = Math.min(totalStamps,6);

// Clear all stamps

for(let i=1;i<=6;i++){

const stamp =
document.getElementById("stamp"+i);

if(stamp){

stamp.classList.remove("active");

}

}

// Fill stamps

for(let i=1;i<=stamps;i++){

const stamp =
document.getElementById("stamp"+i);

if(stamp){

stamp.classList.add("active");

}

}

// Progress Text

if(stampProgress){

stampProgress.textContent =
stamps + " / 6 Stamps Collected";

}

// Reward

const reward =
document.getElementById("rewardStamp");

if(stamps>=6){

if(reward){

reward.classList.add("reward-active");

}

if(rewardMessage){

rewardMessage.innerHTML =
"🎉 Congratulations!<br>FREE VEG MAGGI UNLOCKED 🍜";

}

animateReward();

}

else{

if(reward){

reward.classList.remove("reward-active");

}

const left = 6 - stamps;

if(rewardMessage){

rewardMessage.innerHTML =
"Collect <b>" +
left +
"</b> more stamp" +
(left>1?"s":"") +
" to unlock your <b>FREE VEG MAGGI 🍜</b>";

}

}

}

// ======================================
// REWARD ANIMATION
// ======================================

function animateReward(){

const reward =
document.getElementById("rewardStamp");

if(!reward) return;

reward.animate(

[

{

transform:"scale(1)",

boxShadow:"0 0 0 rgba(255,215,0,0)"

},

{

transform:"scale(1.12)",

boxShadow:"0 0 30px gold"

},

{

transform:"scale(1)",

boxShadow:"0 0 15px gold"

}

],

{

duration:1200,

iterations:2

}

);

}

memberBadge.textContent = badge;

}
// ======================================
// RIO MAGGI POINT
// PREMIUM CARD V3
// FINAL PART
// ======================================

// ======================================
// QR GENERATOR
// ======================================

function generateQR(id){

if(!qrCodeBox) return;

qrCodeBox.innerHTML="";

const img = document.createElement("img");

img.src =
"https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="
+
encodeURIComponent(id);

img.alt="Customer QR";

qrCodeBox.appendChild(img);

}

// ======================================
// QR POPUP
// ======================================

const openQR =
document.getElementById("openQR");

const closeQR =
document.getElementById("closeQR");

const qrPopup =
document.getElementById("qrPopup");

if(openQR){

openQR.addEventListener("click",()=>{

qrPopup.style.display="flex";

showRandomMessage();

});

}

if(closeQR){

closeQR.addEventListener("click",()=>{

qrPopup.style.display="none";

});

}

if(qrPopup){

qrPopup.addEventListener("click",(e)=>{

if(e.target===qrPopup){

qrPopup.style.display="none";

}

});

}

// ======================================
// PREMIUM RANDOM MESSAGE
// ======================================

const premiumMessages=[

"🍜 Every Stamp Brings You Closer To Free Veg Maggi.",

"❤️ Thank You For Being A Rio Loyalty Member.",

"🌟 Loyalty Has Its Rewards.",

"🎉 Collect • Enjoy • Repeat.",

"🚀 Keep Visiting Rio Maggi Point.",

"🥰 We Love Our Loyal Customers.",

"🍜 Free Veg Maggi Is Waiting For You!"

];

function showRandomMessage(){

const box =
document.getElementById("randomMessage");

if(!box) return;

const index =
Math.floor(
Math.random() *
premiumMessages.length
);

box.textContent =
premiumMessages[index];

}

// ======================================
// READY
// ======================================

console.log(
"RIO MAGGI POINT PREMIUM CARD V3 READY"
);
