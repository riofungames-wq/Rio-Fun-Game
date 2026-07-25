// =========================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD
// card.js
// PART 1
// =========================================

// ---------- Firebase ----------

import { firebaseConfig } from "./firebase-config.js";

import {
initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {

getAuth,
onAuthStateChanged,
signOut

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {

getFirestore,
doc,
getDoc

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ---------- Initialize ----------

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// =========================================
// HTML ELEMENTS
// =========================================

const customerPhoto =
document.getElementById("customerPhoto");

const defaultAvatar =
document.getElementById("defaultAvatar");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const mobileNumber =
document.getElementById("mobileNumber");

const announcementBar =
document.getElementById("announcementBar");

const announcementText =
document.getElementById("announcementText");

const playGameBtn =
document.getElementById("playGameBtn");

const downloadBtn =
document.getElementById("downloadCard");

// Stamp

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

const rewardStamp =
document.getElementById("rewardStamp");

const happyStamp =
document.getElementById("happyStamp");

const rewardMessage =
document.getElementById("rewardMessage");

// Countdown

const days =
document.getElementById("days");

const hours =
document.getElementById("hours");

const minutes =
document.getElementById("minutes");

const seconds =
document.getElementById("seconds");

// =========================================
// LOGIN CHECK
// =========================================

onAuthStateChanged(

auth,

async(user)=>{

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

const snap =
await getDoc(customerRef);

if(!snap.exists()){

alert("Customer data not found.");

return;

}

const customer =
snap.data();

// Load Data

loadCustomer(customer);

// Announcement

loadAnnouncement();

// Stamp

loadStamp(customer.stamps || 0);

// Countdown

startCountdown(customer);

}
catch(error){

console.error(error);

}

}

);

console.log("Card JS Loaded - Part 1");
// =========================================
// LOAD CUSTOMER
// =========================================

function loadCustomer(customer){

// Name

customerName.textContent =
customer.name || "Customer";

// Member ID

memberId.textContent =
"Member ID : " +
(customer.memberId || "------");

// Mobile

mobileNumber.textContent =
customer.mobile || "No Mobile";

// =========================================
// PHOTO / PREMIUM AVATAR
// =========================================

if(customer.photoURL){

customerPhoto.src =
customer.photoURL;

customerPhoto.style.display="block";

defaultAvatar.style.display="none";

}
else{

customerPhoto.style.display="none";

defaultAvatar.style.display="flex";

let avatarPath="";

if(customer.gender==="female"){

avatarPath=
"assets/avatars/female/" +
(customer.avatar || "female1.webp");

}
else{

avatarPath=
"assets/avatars/male/" +
(customer.avatar || "male1.webp");

}

defaultAvatar.innerHTML=

`
<img
src="${avatarPath}"
class="avatar-image"
alt="Avatar">
`;

}

}

// =========================================
// LOAD ANNOUNCEMENT
// =========================================

async function loadAnnouncement(){

try{

const ref = doc(

db,

"settings",

"announcement"

);

const snap =
await getDoc(ref);

if(!snap.exists()){

announcementBar.style.display="none";

return;

}

const data=snap.data();

if(data.active===true){

announcementBar.style.display="flex";

announcementText.textContent=
data.message;

}
else{

announcementBar.style.display="none";

}

}
catch(error){

console.log(error);

}

}

// =========================================
// LOAD STAMPS
// =========================================

function loadStamp(total){

const stamps=[

stamp1,
stamp2,
stamp3,
stamp4,
stamp5,
stamp6

];

stamps.forEach(

(item,index)=>{

item.classList.remove("active");

if(index<total){

item.classList.add("active");

}

}

);

// FREE VEG MAGGI

if(total>=7){

rewardStamp.classList.add("active");

rewardMessage.innerHTML=

"🎉 Congratulations!<br>FREE Veg Maggi Unlocked.";

happyStamp.style.display="flex";

}
else{

rewardStamp.classList.remove("active");

happyStamp.style.display="none";

rewardMessage.innerHTML=

"Collect all stamps to unlock your FREE Veg Maggi.";

}

}

// =========================================
// COUNTDOWN
// =========================================

function startCountdown(customer){

if(!customer.expiryDate){

days.textContent="00";
hours.textContent="00";
minutes.textContent="00";
seconds.textContent="00";

return;

}

const expiry =
new Date(customer.expiryDate).getTime();

setInterval(()=>{

const now = Date.now();

const distance =
expiry-now;

if(distance<=0){

days.textContent="00";
hours.textContent="00";
minutes.textContent="00";
seconds.textContent="00";

return;

}

days.textContent =
Math.floor(distance/(1000*60*60*24));

hours.textContent =
Math.floor(
(distance%(1000*60*60*24))/
(1000*60*60)
);

minutes.textContent =
Math.floor(
(distance%(1000*60*60))/
(1000*60)
);

seconds.textContent =
Math.floor(
(distance%(1000*60))/1000
);

},1000);

}
// =========================================
// DOWNLOAD CARD
// =========================================

async function downloadCard(){

document.body.classList.add("downloading");

const card =
document.getElementById("downloadArea");

const canvas =
await html2canvas(card,{

scale:3,

useCORS:true,

backgroundColor:null

});

const image =
canvas.toDataURL("image/png");

const link =
document.createElement("a");

link.download="Rio-Maggi-Loyalty-Card.png";

link.href=image;

link.click();

document.body.classList.remove("downloading");

}

// =========================================
// PLAY FREE GAME
// =========================================

if(playGameBtn){

playGameBtn.addEventListener(

"click",

()=>{

window.open(

"https://riofungames-wq.github.io/Rio-Fun-Game/",

"_blank"

);

}

);

}

// =========================================
// DOWNLOAD BUTTON
// =========================================

if(downloadBtn){

downloadBtn.addEventListener(

"click",

downloadCard

);

}

// =========================================
// LOGOUT
// =========================================

window.logout=function(){

signOut(auth)

.then(()=>{

window.location.href="login.html";

})

.catch(error=>{

console.log(error);

});

};

// =========================================
// HAPPY EMOJI ANIMATION
// =========================================

setInterval(()=>{

if(

happyStamp.style.display==="flex"

){

happyStamp.animate([

{

transform:"translateY(0px) scale(1)"

},

{

transform:"translateY(-10px) scale(1.15)"

},

{

transform:"translateY(0px) scale(1)"

}

],{

duration:900,

iterations:1

});

}

},2000);

// =========================================
// PAGE READY
// =========================================

window.addEventListener(

"load",

()=>{

console.log(

"RIO Premium Loyalty Card Loaded Successfully"

);

}

);
