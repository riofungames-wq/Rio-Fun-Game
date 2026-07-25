// =======================================
// RIO MAGGI POINT
// PREMIUM CARD V2
// PART 1
// =======================================

import { firebaseConfig }
from "./firebase-config.js";

import {
initializeApp
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged,
signOut
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
getFirestore,
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// =======================================
// FIREBASE
// =======================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// =======================================
// HTML ELEMENTS
// =======================================

const customerPhoto =
document.getElementById("customerPhoto");

const avatarDisplay =
document.getElementById("avatarDisplay");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const welcomeMessage =
document.getElementById("welcomeMessage");

const stampProgress =
document.getElementById("stampProgress");

const rewardMessage =
document.getElementById("rewardMessage");
// =======================================
// CHECK LOGIN
// =======================================

onAuthStateChanged(auth, async (user) => {

if (!user) {

window.location.href = "login.html";

return;

}

try {

const customerRef = doc(
db,
"customers",
user.uid
);

const snap = await getDoc(customerRef);

if (!snap.exists()) {

console.log("Customer Not Found");

return;

}

const data = snap.data();

// ===============================
// CUSTOMER NAME
// ===============================

customerName.textContent =
data.name || "Customer";

// ===============================
// MEMBER ID
// ===============================

memberId.textContent =
"Member ID : " +
(data.memberId || user.uid);

// ===============================
// WELCOME MESSAGE
// ===============================

welcomeMessage.textContent =
"Welcome Back, " +
(data.name || "Customer") +
" ❤️";

// ===============================
// LOAD PROFILE
// ===============================

loadProfile(data);

// ===============================
// LOAD STAMPS
// ===============================

loadStamps(data.stamps || 0);

// ===============================
// START COUNTDOWN
// ===============================

startCountdown(data);

}
catch(err){

console.error(err);

}

});

// =======================================
// PROFILE PHOTO / AVATAR
// =======================================

function loadProfile(data){

// Priority:
// 1. User Photo
// 2. Premium Avatar
// 3. Default Avatar

if(data.photoURL){

customerPhoto.src = data.photoURL;

customerPhoto.style.display = "block";

avatarDisplay.style.display = "none";

return;

}

customerPhoto.style.display = "none";

avatarDisplay.style.display = "flex";

// Premium Avatar Name

avatarDisplay.textContent =
data.avatar || "👤";

}
// =======================================
// LOAD STAMPS
// =======================================

function loadStamps(totalStamps){

const stamps = Math.min(totalStamps,6);

// Reset

for(let i=1;i<=6;i++){

const stamp =
document.getElementById("stamp"+i);

if(stamp){

stamp.classList.remove("active");

}

}

// Fill

for(let i=1;i<=stamps;i++){

const stamp =
document.getElementById("stamp"+i);

if(stamp){

stamp.classList.add("active");

}

}

// Progress

stampProgress.textContent =
stamps + " / 6 Stamps Collected";

// Reward

const reward =
document.getElementById("rewardStamp");

const happy =
document.getElementById("happyCircle");

const emoji =
document.getElementById("happyEmoji");

if(stamps>=6){

reward.classList.add("reward-active");

happy.classList.add("happy-active");

emoji.textContent="😄";

rewardMessage.innerHTML=
"🎉 Congratulations!<br>FREE VEG MAGGI UNLOCKED 🍜";

}

else{

reward.classList.remove("reward-active");

happy.classList.remove("happy-active");

emoji.textContent="🙂";

const left=6-stamps;

rewardMessage.innerHTML=

"Collect <b>"+

left+

"</b> More Stamp"+

(left>1?"s":"")+

" To Unlock<br><b>FREE VEG MAGGI 🍜</b>";

}

}

// =======================================
// COUNTDOWN TIMER
// =======================================

function startCountdown(data){

// अभी 40 Days Demo
// बाद में Firebase Expiry Date से चलेगा

let totalSeconds=

40*24*60*60;

setInterval(()=>{

if(totalSeconds<=0)return;

totalSeconds--;

const days=Math.floor(totalSeconds/86400);

const hours=Math.floor((totalSeconds%86400)/3600);

const minutes=Math.floor((totalSeconds%3600)/60);

const seconds=totalSeconds%60;

document.getElementById("days").textContent=days;

document.getElementById("hours").textContent=

String(hours).padStart(2,"0");

document.getElementById("minutes").textContent=

String(minutes).padStart(2,"0");

document.getElementById("seconds").textContent=

String(seconds).padStart(2,"0");

},1000);

}

// =======================================
// READY
// =======================================

console.log(

"RIO MAGGI POINT PREMIUM V2 READY"

);
