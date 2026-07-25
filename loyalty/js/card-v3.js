// ======================================
// RIO MAGGI POINT
// CARD V3
// PART 1
// FIREBASE + CUSTOMER LOAD
// ======================================

import { firebaseConfig }
from "./firebase-config.js";

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

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const customerLevel =
document.getElementById("customerLevel");

const memberBadge =
document.getElementById("memberBadge");

const memberSince =
document.getElementById("memberSince");

const customerPhoto =
document.getElementById("customerPhoto");

const avatarDisplay =
document.getElementById("avatarDisplay");

// ======================================
// AUTH CHECK
// ======================================

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

alert("Customer Not Found");

return;

}

const customer =
snap.data();

// Load Customer

showCustomer(customer,user.uid);

}

catch(error){

console.error(error);

}

});

// ======================================
// SHOW CUSTOMER
// ======================================

function showCustomer(data,uid){

customerName.textContent =
data.name || "Rio Customer";

memberId.textContent =
"Member ID : " +
(data.memberId || uid);

customerLevel.textContent =
data.level || "Premium Member";

memberSince.textContent =
"Member Since : " +
(data.joinDate || "--");

// Photo

if(data.photoURL){

customerPhoto.src =
data.photoURL;

customerPhoto.style.display="block";

avatarDisplay.style.display="none";

}else{

customerPhoto.style.display="none";

avatarDisplay.style.display="flex";

avatarDisplay.textContent =
data.avatar || "😊";

}

// Gender Theme

applyTheme(data.gender);

// Member Badge

updateMemberBadge(data.stamps || 0);

// Next Parts

loadStamps(data);

startCountdown(data);

setupQR(data);

}
// ======================================
// PART 2
// THEME + MEMBER BADGE + STAMPS
// ======================================

// ======================================
// APPLY GENDER THEME
// ======================================

function applyTheme(gender){

customerCard.classList.remove(
"male",
"female"
);

const g=(gender||"").toLowerCase();

if(
g==="female"||
g==="girl"||
g==="f"
){

customerCard.classList.add("female");

}else{

customerCard.classList.add("male");

}

}

// ======================================
// MEMBER BADGE
// ======================================

function updateMemberBadge(stamps){

let badge="⭐ SILVER MEMBER";
let level="Premium Member";

if(stamps>=6){

badge="👑 ELITE MEMBER";
level="Elite Member";

}

else if(stamps>=3){

badge="🥇 GOLD MEMBER";
level="Gold Member";

}

memberBadge.textContent=badge;

customerLevel.textContent=level;

}

// ======================================
// LOAD STAMPS
// ======================================

function loadStamps(data){

const total=
Number(data.stamps||0);

// --------------------
// Stamp Circles
// --------------------

for(let i=1;i<=6;i++){

const circle=
document.getElementById("stamp"+i);

const date=
document.getElementById("stampDate"+i);

if(!circle) continue;

circle.classList.remove("active");

if(total>=i){

circle.classList.add("active");

if(
data.stampDates &&
data.stampDates[i-1]
){

date.textContent=
data.stampDates[i-1];

}else{

date.textContent="✔";

}

}else{

date.textContent="--";

}

}

// --------------------
// Progress
// --------------------

document.getElementById("stampProgress")
.textContent=

total+" / 6 Stamps Collected";

// --------------------
// Reward
// --------------------

const reward=
document.getElementById("rewardStamp");

const message=
document.getElementById("rewardMessage");

if(total>=6){

reward.classList.add("reward-active");

message.innerHTML=

"🎉 Congratulations!<br><b>ONE FREE VEG MAGGI</b> 🍜";

}else{

reward.classList.remove("reward-active");

message.innerHTML=

"Collect <b>"+

(6-total)+

"</b> More Stamp"+

((6-total)>1?"s":"")+

" To Unlock <b>ONE FREE VEG MAGGI</b>";

}

// --------------------
// HAPPY EMOJI
// --------------------

updateHappyEmoji(total);

}

// ======================================
// HAPPY EMOJI
// ======================================

function updateHappyEmoji(total){

const emoji=
document.getElementById("happyEmoji");

const faces=[

"🙂",

"😊",

"😄",

"😁",

"🤩",

"🥳",

"🎉"

];

emoji.textContent=

faces[Math.min(total,6)];

if(total>=6){

emoji.classList.add("party");

}else{

emoji.classList.remove("party");

}

}
// ======================================
// PART 3
// CARD VALIDITY + COUNTDOWN
// ======================================

function startCountdown(data){

const dayBox=document.getElementById("days");
const hourBox=document.getElementById("hours");
const minuteBox=document.getElementById("minutes");
const secondBox=document.getElementById("seconds");

const warning=
document.getElementById("expiryWarning");

// ----------------------------
// Card Start Date
// ----------------------------

let startDate;

if(data.cardStartDate){

startDate=new Date(data.cardStartDate);

}else{

startDate=new Date();

}

// ----------------------------
// Expiry = 40 Days
// ----------------------------

const expiryDate=new Date(startDate);

expiryDate.setDate(
expiryDate.getDate()+40
);

// ----------------------------
// LIVE TIMER
// ----------------------------

updateCountdown();

setInterval(updateCountdown,1000);

function updateCountdown(){

const now=new Date();

const diff=
expiryDate-now;

// ----------------------------
// EXPIRED
// ----------------------------

if(diff<=0){

dayBox.textContent="00";
hourBox.textContent="00";
minuteBox.textContent="00";
secondBox.textContent="00";

warning.innerHTML=
"❌ YOUR CARD HAS EXPIRED";

warning.style.color="#D32F2F";

// आगे Part 4 में
// resetCard(data);

return;

}

// ----------------------------

const days=
Math.floor(diff/(1000*60*60*24));

const hours=
Math.floor(
(diff/(1000*60*60))%24
);

const minutes=
Math.floor(
(diff/(1000*60))%60
);

const seconds=
Math.floor(
(diff/1000)%60
);

// ----------------------------

dayBox.textContent=
String(days).padStart(2,"0");

hourBox.textContent=
String(hours).padStart(2,"0");

minuteBox.textContent=
String(minutes).padStart(2,"0");

secondBox.textContent=
String(seconds).padStart(2,"0");

// ----------------------------
// WARNING
// ----------------------------

if(days<=5){

warning.innerHTML=
"⚠ Hurry! Only <b>"+days+
"</b> Days Left";

warning.style.color="#E53935";

}
else{

warning.innerHTML=
"Complete All 6 Stamps Before Card Expires";

warning.style.color="#2E7D32";

}

}

}

// ======================================
// REWARD GLOW ANIMATION
// ======================================

function playRewardAnimation(){

const reward=
document.getElementById("rewardStamp");

if(!reward) return;

reward.animate(

[
{
transform:"scale(1)"
},
{
transform:"scale(1.10)"
},
{
transform:"scale(1)"
}
],

{
duration:900,
iterations:3
}

);

}
