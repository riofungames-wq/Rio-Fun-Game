// =====================================================
// RIO MAGGI POINT
// HISTORY.JS
// FINAL PREMIUM VERSION
// PART 1
// =====================================================



// =====================================================
// FIREBASE IMPORT
// =====================================================

import { auth, db } from "./firebase-config.js";

import {

onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



import {

doc,
getDoc

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// =====================================================
// HTML ELEMENTS
// =====================================================

const historyPhoto =
document.getElementById("historyPhoto");

const historyName =
document.getElementById("historyName");

const historyMember =
document.getElementById("historyMember");

const historyStampCount =
document.getElementById("historyStampCount");

const rewardTitle =
document.getElementById("rewardTitle");

const rewardStatus =
document.getElementById("rewardStatus");

const totalVisits =
document.getElementById("totalVisits");

const totalRewardCount =
document.getElementById("totalRewardCount");

const memberSince =
document.getElementById("memberSince");

const historyTimeline =
document.getElementById("historyTimeline");

const rewardBox =
document.querySelector(".reward-box");



// =====================================================
// SAFE TEXT
// =====================================================

function setText(element,value){

if(element){

element.textContent=value;

}

}



// =====================================================
// SAFE IMAGE
// =====================================================

function setImage(img,url){

if(!img) return;

img.src=url || "assets/avatars/default.png";

img.onerror=()=>{

img.src="assets/avatars/default.png";

};

}



// =====================================================
// DATE FORMAT
// =====================================================

function formatMemberDate(value){

if(!value) return "--";

try{

if(value.toDate){

return value
.toDate()
.toLocaleDateString();

}

return new Date(value)
.toLocaleDateString();

}

catch{

return "--";

}

}



// =====================================================
// RESET PAGE
// =====================================================

function resetHistory(){

setText(historyName,"Customer");

setText(historyMember,"RIO-000000");

setText(historyStampCount,"0 / 6");

setText(rewardTitle,"FREE VEG MAGGI");

setText(rewardStatus,"Locked");

setText(totalVisits,"0");

setText(totalRewardCount,"0");

setText(memberSince,"--");

setImage(
historyPhoto,
"assets/avatars/default.png"
);

if(historyTimeline){

historyTimeline.innerHTML="";

}

if(rewardBox){

rewardBox.classList.remove("unlocked");

}

}



// =====================================================
// LOAD CUSTOMER
// =====================================================

async function loadCustomerHistory(user){

try{

const customerRef=

doc(
db,
"customers",
user.uid
);

const snap=

await getDoc(customerRef);

if(!snap.exists()){

resetHistory();

return null;

}

return snap.data();

}

catch(error){

console.error(
"History Error:",
error
);

resetHistory();

return null;

}

}


/* ===========================
   CONTINUE IN PART 2
=========================== */
// =====================================================
// DISPLAY CUSTOMER
// =====================================================

function displayHistory(customer){

// ============================
// BASIC PROFILE
// ============================

setText(

historyName,

customer.name || "Customer"

);

setText(

historyMember,

customer.memberId || "RIO-000000"

);

setImage(

historyPhoto,

customer.photoURL ||

customer.avatar ||

customer.profilePhoto ||

"assets/avatars/default.png"

);



// ============================
// STAMPS
// ============================

const stamps = Number(

customer.stamps || 0

);

setText(

historyStampCount,

`${stamps} / 6`

);



// ============================
// VISITS
// ============================

const visits = Number(

customer.totalVisits ??

customer.visits ??

stamps

);

setText(

totalVisits,

visits

);



// ============================
// REWARD COUNT
// ============================

const rewards = Number(

customer.totalRewards ??

customer.rewardCount ??

(customer.rewardUnlocked ? 1 : 0)

);

setText(

totalRewardCount,

rewards

);



// ============================
// MEMBER SINCE
// ============================

setText(

memberSince,

formatMemberDate(

customer.createdAt ||

customer.joinDate ||

customer.memberSince

)

);



// ============================
// REWARD STATUS
// ============================

const unlocked =

customer.rewardUnlocked === true ||

customer.reward === true ||

stamps >= 6;



if(unlocked){

setText(

rewardTitle,

"FREE VEG MAGGI"

);

setText(

rewardStatus,

"🎉 Reward Ready To Claim"

);

if(rewardBox){

rewardBox.classList.add(

"unlocked"

);

}

}

else{

setText(

rewardTitle,

"FREE VEG MAGGI"

);

setText(

rewardStatus,

`Collect ${6-stamps} More Stamp(s)`

);

if(rewardBox){

rewardBox.classList.remove(

"unlocked"

);

}

}



// ============================
// BUILD TIMELINE
// ============================

createTimeline(

customer,

stamps,

unlocked

);

}



/* ===================================
   CONTINUE IN PART 3
=================================== */
// =====================================================
// CREATE TIMELINE
// =====================================================

function createTimeline(

customer,
stamps,
rewardUnlocked

){

if(!historyTimeline){

return;

}

historyTimeline.innerHTML="";



// =====================================
// NO HISTORY
// =====================================

if(stamps===0){

historyTimeline.innerHTML=`

<div class="timeline-item fade-up">

<div class="timeline-icon">

🍜

</div>

<div class="timeline-content">

<h4>

Welcome To Rio Maggi Point

</h4>

<p>

Your loyalty journey starts here.

</p>

</div>

</div>

`;

return;

}



// =====================================
// STAMP HISTORY
// =====================================

for(

let i=1;

i<=stamps;

i++

){

const item=

document.createElement("div");

item.className=

"timeline-item fade-up";

item.innerHTML=`

<div class="timeline-icon">

⭐

</div>

<div class="timeline-content">

<h4>

Stamp ${i} Collected

</h4>

<p>

Thank you for visiting Rio Maggi Point.

</p>

</div>

`;

historyTimeline.appendChild(item);

}



// =====================================
// REWARD HISTORY
// =====================================

if(rewardUnlocked){

const reward=

document.createElement("div");

reward.className=

"timeline-item reward fade-up";

reward.innerHTML=`

<div class="timeline-icon">

🎁

</div>

<div class="timeline-content">

<h4>

FREE VEG MAGGI UNLOCKED

</h4>

<p>

Congratulations! Your reward is ready to claim.

</p>

</div>

`;

historyTimeline.appendChild(reward);

}

}



// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location.href=

"login.html";

return;

}

const customer=

await loadCustomerHistory(user);

if(customer){

displayHistory(customer);

}

}

);



// =====================================================
// PAGE READY
// =====================================================

document.addEventListener(

"DOMContentLoaded",

()=>{

console.log(

"🍜 Rio Maggi Point History Ready"

);

}

);
