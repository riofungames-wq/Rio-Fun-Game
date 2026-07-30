// =====================================================
// RIO MAGGI POINT
// HISTORY.JS
// PREMIUM HISTORY SYSTEM
// PART 1 / 3
// =====================================================


// ============================
// FIREBASE IMPORT
// ============================

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




// ============================
// HTML ELEMENTS
// ============================

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

const stampProgressFill =
document.getElementById("stampProgressFill");




// ============================
// SAFE TEXT
// ============================

function setText(element,value){

if(element){

element.textContent=value;

}

}




// ============================
// AVATAR SYSTEM
// ============================

function getAvatar(customer){

if(customer.photoURL){

return customer.photoURL;

}

if(customer.avatar){

return customer.avatar;

}

if(customer.gender){

const gender=

customer.gender.toLowerCase();

if(

gender==="female" ||

gender==="girl" ||

gender==="woman"

){

return "assets/avatars/female.png";

}

}

return "assets/avatars/male.png";

}




// ============================
// DEFAULT DATA
// ============================

function resetHistory(){

setText(historyName,"Customer");

setText(historyMember,"RIO-000000");

setText(historyStampCount,"0 / 6");

setText(rewardTitle,"FREE VEG MAGGI");

setText(rewardStatus,"Locked");

setText(totalVisits,"0");

setText(totalRewardCount,"0");

setText(memberSince,"--");

if(historyPhoto){

historyPhoto.src="assets/avatars/male.png";

}

if(historyTimeline){

historyTimeline.innerHTML="";

}

if(stampProgressFill){

stampProgressFill.style.width="0%";

}

}
// ============================
// LOAD CUSTOMER FROM FIRESTORE
// ============================

async function loadCustomerHistory(user){

try{

const customerRef=

doc(

db,

"customers",

user.uid

);

const customerSnap=

await getDoc(customerRef);

if(!customerSnap.exists()){

resetHistory();

console.error(

"Customer document not found."

);

return null;

}

return customerSnap.data();

}

catch(error){

console.error(

"History Load Error:",

error

);

resetHistory();

return null;

}

}




// ============================
// DISPLAY CUSTOMER DATA
// ============================

function displayHistory(customer){

setText(

historyName,

customer.name || "Customer"

);

setText(

historyMember,

customer.memberId || "RIO-000000"

);

if(historyPhoto){

historyPhoto.src=

getAvatar(customer);

}

const stamps=

Number(

customer.stamps || 0

);

setText(

historyStampCount,

`${stamps} / 6`

);

setText(

totalVisits,

stamps

);

if(stampProgressFill){

stampProgressFill.style.width=

`${Math.min((stamps/6)*100,100)}%`;

}

const rewardUnlocked=

customer.rewardUnlocked===true ||

customer.reward===true ||

stamps>=6;

if(rewardUnlocked){

setText(

rewardTitle,

"FREE VEG MAGGI"

);

setText(

rewardStatus,

"🎉 Ready To Claim"

);

setText(

totalRewardCount,

"1"

);

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

setText(

totalRewardCount,

"0"

);

}

if(customer.createdAt){

try{

const date=

customer.createdAt.toDate

?

customer.createdAt.toDate()

:

new Date(

customer.createdAt.seconds*1000

);

setText(

memberSince,

date.toLocaleDateString()

);

}

catch{

setText(

memberSince,

"--"

);

}

}

else{

setText(

memberSince,

"--"

);

}

createTimeline(

customer,

stamps,

rewardUnlocked

);

}
// ============================
// CREATE TIMELINE
// ============================

function createTimeline(

customer,

stamps,

rewardUnlocked

){

if(!historyTimeline){

return;

}

historyTimeline.innerHTML="";

if(stamps===0){

historyTimeline.innerHTML=`

<div class="timeline-item">

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

for(

let i=1;

i<=stamps;

i++

){

const item=

document.createElement(

"div"

);

item.className=

"timeline-item";

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

historyTimeline.appendChild(

item

);

}

if(rewardUnlocked){

const reward=

document.createElement(

"div"

);

reward.className=

"timeline-item reward";

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

historyTimeline.appendChild(

reward

);

}

}




// ============================
// AUTH CONNECTION
// ============================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location.href=

"login.html";

return;

}

const customer=

await loadCustomerHistory(

user

);

if(customer){

displayHistory(

customer

);

}

console.log(

"================================"

);

console.log(

"🍜 Rio Maggi Point"

);

console.log(

"Premium History Loaded"

);

console.log(

"================================"

);

}

);




// ============================
// READY
// ============================

console.log(

"History JS Premium Ready"

);
