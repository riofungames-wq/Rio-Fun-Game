// ==========================================
// RIO MAGGI POINT
// PREMIUM CARD
// PART 1
// ==========================================

import { auth, db }
from "./firebase-config.js";

import {

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

doc,
getDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ==========================================
// HTML
// ==========================================

const loyaltyCard =
document.getElementById("loyaltyCard");

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const ownerNumber =
document.getElementById("ownerNumber");

const rewardBadge =
document.querySelector(".reward-badge");

const countdown =
document.getElementById("countdown");

// ==========================================
// LOGIN
// ==========================================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

loadCustomer(user.uid);

}

);

// ==========================================
// LOAD CUSTOMER
// ==========================================

async function loadCustomer(uid){

try{

const ref=

doc(db,"customers",uid);

const snap=

await getDoc(ref);

if(!snap.exists()) return;

const data=snap.data();

// =======================
// NAME
// =======================

customerName.textContent=

data.name || "Customer";

// =======================
// MEMBER ID
// =======================

memberId.textContent=

"ID : " +

(data.memberId || "------");

// =======================
// MOBILE
// =======================

ownerNumber.textContent=

data.mobile || "";

// =======================
// THEME
// =======================

loyaltyCard.classList.remove(

"theme-male",

"theme-female"

);

if(data.gender==="female"){

loyaltyCard.classList.add(

"theme-female"

);

}else{

loyaltyCard.classList.add(

"theme-male"

);

}

// =======================
// PHOTO
// =======================

if(data.photoURL){

customerPhoto.src=

data.photoURL;

}else{

customerPhoto.src=

data.gender==="female"

?

"assets/avatars/female.png"

:

"assets/avatars/male.png";

}

// =======================
// STAMPS
// =======================

for(let i=1;i<=6;i++){

const el=

document.getElementById(

"date"+i

);

if(el){

el.textContent=

data["stamp"+i] || "";

}

}
    // =======================
// REWARD
// =======================

const totalStamp =

Number(data.totalStamp || 0);

if(totalStamp>=6){

rewardBadge.style.opacity="1";

rewardBadge.style.transform="scale(1.02)";

}else{

rewardBadge.style.opacity=".45";

rewardBadge.style.transform="scale(.96)";

}

// =======================
// COUNTDOWN
// =======================

if(countdown){

const remain =

Math.max(

0,

6-totalStamp

);

if(remain===0){

countdown.textContent=

"Reward Ready";

}else{

countdown.textContent=

remain + " Stamp Left";

}

}

}catch(err){

console.error(err);

}

}

// ==========================================
// PLAY GAME
// ==========================================

const playBtn=

document.getElementById(

"playGameBtn"

);

if(playBtn){

playBtn.addEventListener(

"click",

()=>{

window.open(

"https://riofungames-wq.github.io/Rio-Fun-Game/",

"_blank"

);

}

);

}

// ==========================================
// DOWNLOAD CARD
// ==========================================

window.downloadCard=function(){

alert(

"Download Module Coming Soon"

);

};

// ==========================================
// READY
// ==========================================

console.log(

"RIO PREMIUM CARD READY"

);
