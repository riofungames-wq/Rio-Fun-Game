// =====================================================
// RIO MAGGI POINT
// ADMIN REWARD MANAGER V1
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
collection,
getDocs,
doc,
updateDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================================
// ELEMENTS
// =====================================================

const rewardTable =
document.getElementById("rewardTable");

const rewardHistoryTable =
document.getElementById("rewardHistoryTable");

const rewardTotal =
document.getElementById("rewardTotal");

const rewardReady =
document.getElementById("rewardReady");

const rewardClaimed =
document.getElementById("rewardClaimed");

const previewPhoto =
document.getElementById("previewPhoto");

const previewName =
document.getElementById("previewName");

const previewMember =
document.getElementById("previewMember");

const previewStamp =
document.getElementById("previewStamp");

const redeemRewardBtn =
document.getElementById("redeemRewardBtn");

const searchRewardCustomer =
document.getElementById("searchRewardCustomer");

const refreshRewardBtn =
document.getElementById("refreshRewardBtn");

const exportRewardBtn =
document.getElementById("exportRewardBtn");

const pendingRewardBtn =
document.getElementById("pendingRewardBtn");

const claimedRewardBtn =
document.getElementById("claimedRewardBtn");

const backDashboard =
document.getElementById("backDashboard");

const lastRewardRefresh =
document.getElementById("lastRewardRefresh");

// =====================================================
// VARIABLES
// =====================================================

let customers = [];

let selectedCustomer = null;

// =====================================================
// ADMIN LOGIN CHECK
// =====================================================

onAuthStateChanged(auth, async (user)=>{

if(!user){

location.href="admin-login.html";

return;

}

await loadRewards();

});
// =====================================================
// LOAD ALL REWARD CUSTOMERS
// =====================================================

async function loadRewards(){

rewardTable.innerHTML="";

customers=[];

let total=0;
let ready=0;
let claimed=0;

const snapshot=
await getDocs(collection(db,"customers"));

snapshot.forEach((document)=>{

const customer=document.data();

customer.uid=document.id;

customers.push(customer);

total++;

if(customer.rewardUnlocked){

ready++;

}

if(customer.rewardClaimed){

claimed++;

}

createRewardRow(customer);

});

rewardTotal.textContent=total;

rewardReady.textContent=ready;

rewardClaimed.textContent=claimed;

lastRewardRefresh.textContent=

new Date().toLocaleString();

}

// =====================================================
// CREATE TABLE ROW
// =====================================================

function createRewardRow(customer){

const avatar=

customer.gender==="female"

?"assets/avatars/female.png"

:"assets/avatars/male.png";

const tr=document.createElement("tr");

tr.innerHTML=`

<td>

<img
src="${avatar}"
style="width:45px;height:45px;border-radius:50%;">

</td>

<td>${customer.name||"-"}</td>

<td>${customer.memberId||"-"}</td>

<td>${customer.mobile||"-"}</td>

<td>${customer.stamps||0}/6</td>

<td>

${
customer.rewardUnlocked
? "🟢 Ready"
: "🔴 Locked"
}

</td>

<td>

<button
onclick="selectRewardCustomer('${customer.uid}')">

Select

</button>

</td>

`;

rewardTable.appendChild(tr);

}

// =====================================================
// SEARCH
// =====================================================

searchRewardCustomer?.addEventListener("keyup",(e)=>{

const keyword=e.target.value.toLowerCase();

rewardTable.innerHTML="";

customers

.filter(customer=>

(customer.name||"")

.toLowerCase()

.includes(keyword)

||

(customer.memberId||"")

.toLowerCase()

.includes(keyword)

||

(customer.mobile||"")

.includes(keyword)

)

.forEach(createRewardRow);

});

// =====================================================
// SELECT CUSTOMER
// =====================================================

window.selectRewardCustomer=function(uid){

selectedCustomer=

customers.find(c=>c.uid===uid);

if(!selectedCustomer) return;

previewCustomer(selectedCustomer);

};
// =====================================================
// PREVIEW CUSTOMER
// =====================================================

function previewCustomer(customer){

const avatar =
customer.gender==="female"
? "assets/avatars/female.png"
: "assets/avatars/male.png";

previewPhoto.src = avatar;

previewName.textContent =
customer.name || "Unknown";

previewMember.textContent =
customer.memberId || "RIO-000000000";

previewStamp.textContent =
`${customer.stamps || 0}/6`;

redeemRewardBtn.disabled =
!customer.rewardUnlocked;

}

// =====================================================
// REDEEM REWARD
// =====================================================

redeemRewardBtn?.addEventListener("click", async ()=>{

if(!selectedCustomer) return;

if(!selectedCustomer.rewardUnlocked){

alert("Reward Not Ready");

return;

}

try{

await updateDoc(

doc(db,"customers",selectedCustomer.uid),

{

rewardUnlocked:false,

rewardClaimed:true,

stamps:0,

rewardClaimedAt:serverTimestamp(),

updatedAt:serverTimestamp()

}

);

alert("🎉 Reward Redeemed Successfully");

selectedCustomer.rewardUnlocked=false;

selectedCustomer.rewardClaimed=true;

selectedCustomer.stamps=0;

previewCustomer(selectedCustomer);

await loadRewards();

}catch(err){

console.error(err);

alert("Redeem Failed");

}

});

// =====================================================
// REFRESH
// =====================================================

refreshRewardBtn?.addEventListener("click", async ()=>{

await loadRewards();

});

// =====================================================
// EXPORT
// =====================================================

exportRewardBtn?.addEventListener("click",()=>{

alert("Export Feature Coming Soon");

});

// =====================================================
// FILTER BUTTONS
// =====================================================

pendingRewardBtn?.addEventListener("click",()=>{

rewardTable.innerHTML="";

customers
.filter(c=>c.rewardUnlocked)
.forEach(createRewardRow);

});

claimedRewardBtn?.addEventListener("click",()=>{

rewardTable.innerHTML="";

customers
.filter(c=>c.rewardClaimed)
.forEach(createRewardRow);

});

// =====================================================
// BACK TO DASHBOARD
// =====================================================

backDashboard?.addEventListener("click",()=>{

location.href="admin-dashboard.html";

});

// =====================================================

console.log("🎁 Reward Manager Ready");
// =====================================================
// LOAD REWARD HISTORY
// =====================================================

async function loadRewardHistory(){

rewardHistoryTable.innerHTML="";

customers
.filter(c => c.rewardClaimed)
.forEach(customer=>{

const tr=document.createElement("tr");

tr.innerHTML=`

<td>

${
customer.rewardClaimedAt
? new Date(
customer.rewardClaimedAt.seconds*1000
).toLocaleDateString()

: "--"

}

</td>

<td>${customer.name||"-"}</td>

<td>${customer.memberId||"-"}</td>

<td>FREE VEG MAGGI</td>

<td>

<span style="color:#61ff7d">

Claimed

</span>

</td>

`;

rewardHistoryTable.appendChild(tr);

});

}

// =====================================================
// UPDATE HISTORY AFTER LOAD
// =====================================================

const oldLoadRewards = loadRewards;

loadRewards = async function(){

await oldLoadRewards();

await loadRewardHistory();

};

// =====================================================
// LOGOUT
// =====================================================

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", async ()=>{

try{

await signOut(auth);

location.href="admin-login.html";

}catch(err){

console.error(err);

alert("Logout Failed");

}

});

// =====================================================
// AUTO REFRESH EVERY 60 SECONDS
// =====================================================

setInterval(async ()=>{

await loadRewards();

},60000);

// =====================================================
// WINDOW READY
// =====================================================

window.addEventListener("load",()=>{

console.log("===================================");

console.log("🎁 Rio Reward Manager Ready");

console.log("Firebase Connected");

console.log("===================================");

});
