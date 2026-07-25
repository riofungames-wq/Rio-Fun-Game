// ======================================
// RIO MAGGI POINT
// HOME PAGE
// VERSION 2
// PART 1
// ======================================

import { firebaseConfig }
from "./firebase-config.js";

import {

LOYALTY_SETTINGS,

getHomeSummary,

getCountdown,

getExpiryWarning,

getHappyAnimation

}

from "./shared-loyalty.js";

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

// ======================================
// FIREBASE
// ======================================

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const db =
getFirestore(app);

// ======================================
// ELEMENTS
// ======================================

const customerName =
document.getElementById("customerName");

const customerEmail =
document.getElementById("customerEmail");

const memberLevel =
document.getElementById("memberLevel");

const emojiAvatar =
document.getElementById("emojiAvatar");

const profileImage =
document.getElementById("profileImage");

const logoutBtn =
document.getElementById("logoutBtn");

// ======================================
// LOGOUT
// ======================================

logoutBtn.onclick=()=>{

signOut(auth)
.then(()=>{

location.href="login.html";

});

};
// ======================================
// PART 2
// LOGIN + CUSTOMER LOAD
// ======================================

onAuthStateChanged(auth, async(user)=>{

if(!user){

location.href="login.html";

return;

}

try{

const ref=

doc(
db,
"customers",
user.uid
);

const snap=

await getDoc(ref);

if(!snap.exists()){

console.log("Customer Not Found");

return;

}

const data=

snap.data();

// ===============================
// NAME
// ===============================

customerName.textContent=

data.name || "Customer";

// ===============================
// EMAIL
// ===============================

customerEmail.textContent=

data.email || user.email;

// ===============================
// MEMBER LEVEL
// ===============================

const home=

getHomeSummary(

data.stamps || 0

);

memberLevel.textContent=

home.member.level;

// ===============================
// AVATAR
// ===============================

if(data.photoURL){

profileImage.src=

data.photoURL;

profileImage.style.display="block";

emojiAvatar.style.display="none";

}

else{

profileImage.style.display="none";

emojiAvatar.style.display="flex";

emojiAvatar.textContent=

data.avatar || "😊";

}

// ===============================
// LOAD HOME DATA
// ===============================

loadStampPreview(data);

loadCountdown(data);

loadStats(data);

}

catch(err){

console.error(err);

}

});
// ======================================
// PART 3
// HOME STAMP PREVIEW
// ======================================

function loadStampPreview(data){

const container =
document.getElementById("stampPreview");

const progressText =
document.getElementById("homeStampText");

if(!container) return;

container.innerHTML = "";

const stamps =
Number(data.stamps || 0);

// ===============================
// STAMP 1 TO 6
// ===============================

for(let i=1;i<=6;i++){

const circle =
document.createElement("div");

circle.className =
"home-stamp";

if(i<=stamps){

circle.classList.add("active");

circle.innerHTML="✔";

}else{

circle.innerHTML=i;

}

container.appendChild(circle);

}

// ===============================
// 7th REWARD
// ===============================

const reward =
document.createElement("div");

reward.className="reward-stamp";

reward.innerHTML=`

<div class="reward-bowl">🍜</div>

<div class="reward-title">

ONE

</div>

<div class="reward-name">

FREE VEG MAGGI

</div>

`;

if(stamps>=6){

reward.classList.add("unlock");

}

container.appendChild(reward);

// ===============================
// 8th HAPPY EMOJI
// ===============================

const happy =
document.createElement("div");

happy.className="happy-stamp";

const emoji =
getHappyAnimation(stamps);

happy.innerHTML=

emoji.emoji;

happy.classList.add(

emoji.animation

);

container.appendChild(happy);

// ===============================
// PROGRESS TEXT
// ===============================

if(progressText){

progressText.textContent=

stamps+

" / "+

LOYALTY_SETTINGS.MAX_STAMPS+

" Stamps Collected";

}

}

// ======================================
// HOME STATS
// ======================================

function loadStats(data){

const stamps =
Number(data.stamps||0);

document
.getElementById("totalStamp")
.textContent=stamps;

document
.getElementById("remainingStamp")
.textContent=
Math.max(0,6-stamps);

document
.getElementById("rewardCount")
.textContent=
data.rewardClaimed
?1:0;

}
// ======================================
// PART 4
// COUNTDOWN + GAME + FINAL
// ======================================

// ======================================
// LIVE COUNTDOWN
// ======================================

function loadCountdown(data){

const startDate =
data.cardStartDate || new Date().toISOString();

updateCountdown(startDate);

setInterval(()=>{

updateCountdown(startDate);

},1000);

}

function updateCountdown(startDate){

const countdown =
getCountdown(startDate);

const warning =
getExpiryWarning(startDate);

document.getElementById("days").textContent =
countdown.days;

document.getElementById("hours").textContent =
countdown.hours;

document.getElementById("minutes").textContent =
countdown.minutes;

document.getElementById("seconds").textContent =
countdown.seconds;

const status =
document.getElementById("expiryStatus");

if(status){

status.textContent =
warning.text;

status.style.color =
warning.color;

}

}

// ======================================
// PLAY GAME BUTTON
// ======================================

const playGameBtn =
document.getElementById("playGameBtn");

if(playGameBtn){

playGameBtn.addEventListener("click",()=>{

alert(
"🎮 Rio Fun Game Coming Soon!"
);

});

}

// ======================================
// PAGE READY
// ======================================

console.log(

"RIO HOME V2 READY"

);
