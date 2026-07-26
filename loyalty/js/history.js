// ==========================================
// RIO MAGGI POINT
// HISTORY PAGE
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

const profileCard =
document.getElementById("profileCard");

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const totalStamp =
document.getElementById("totalStamp");

const rewardCount =
document.getElementById("rewardCount");

const historyContainer =
document.getElementById("historyContainer");

const rewardContainer =
document.getElementById("rewardContainer");

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

loadHistory(user.uid);

}

);

// ==========================================
// LOAD HISTORY
// ==========================================

async function loadHistory(uid){

try{

const ref=

doc(db,"customers",uid);

const snap=

await getDoc(ref);

if(!snap.exists()) return;

const data=snap.data();

// =====================
// PROFILE
// =====================

customerName.textContent=

data.name || "Customer";

memberId.textContent=

"ID : " +

(data.memberId || "------");

// =====================
// THEME
// =====================

profileCard.classList.remove(

"theme-male",

"theme-female"

);

if(data.gender==="female"){

profileCard.classList.add(

"theme-female"

);

}else{

profileCard.classList.add(

"theme-male"

);

}

// =====================
// PHOTO
// =====================

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

// =====================
// SUMMARY
// =====================

totalStamp.textContent=

data.totalStamp || 0;

rewardCount.textContent=

data.totalReward || 0;
   // ==========================================
// ACTIVITY TIMELINE
// ==========================================

historyContainer.innerHTML = "";

for(let i=1;i<=6;i++){

const stampDate = data["stamp"+i];

if(stampDate){

historyContainer.innerHTML += `

<div class="history-item">

<div class="history-icon">

⭐

</div>

<div class="history-info">

<h3>

Stamp ${i} Collected

</h3>

<p>

You earned Stamp ${i}
at Rio Maggi Point.

</p>

<div class="history-date">

${stampDate}

</div>

</div>

</div>

`;

}

}

// Empty State

if(historyContainer.innerHTML===""){

historyContainer.innerHTML = `

<div class="history-item">

<div class="history-icon">

🕒

</div>

<div class="history-info">

<h3>

No Stamp Yet

</h3>

<p>

Visit Rio Maggi Point
to start collecting stamps.

</p>

</div>

</div>

`;

}

// ==========================================
// REWARD HISTORY
// ==========================================

rewardContainer.innerHTML="";

if(Number(data.totalReward||0)>0){

rewardContainer.innerHTML += `

<div class="reward-item">

<div class="reward-icon">

🎁

</div>

<div class="reward-info">

<h3>

Free Veg Maggi Claimed

</h3>

<p>

Congratulations!
You successfully redeemed
your loyalty reward.

</p>

</div>

</div>

`;

}else{

rewardContainer.innerHTML = `

<div class="reward-item">

<div class="reward-icon">

🎁

</div>

<div class="reward-info">

<h3>

No Reward Yet

</h3>

<p>

Collect 6 stamps to unlock
your FREE Veg Maggi.

</p>

</div>

</div>

`;

}

}catch(err){

console.error(err);

}

}

// ==========================================
// READY
// ==========================================

console.log(

"RIO HISTORY READY"

);
