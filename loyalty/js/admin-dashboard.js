// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V3
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
collection,
getDocs,
doc,
query,
where,
updateDoc,
serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged,
signOut
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================================
// ELEMENTS
// =====================================================

const totalCustomers =
document.getElementById("totalCustomers");

const totalStamps =
document.getElementById("totalStamps");

const totalRewards =
document.getElementById("totalRewards");

const todayScans =
document.getElementById("todayScans");

const customerTable =
document.getElementById("customerTable");

const searchCustomer =
document.getElementById("searchCustomer");

const refreshBtn =
document.getElementById("refreshBtn");

const exportBtn =
document.getElementById("exportBtn");

const rewardBtn =
document.getElementById("rewardBtn");

const settingsBtn =
document.getElementById("settingsBtn");

const giveStampBtn =
document.getElementById("giveStampBtn");

const cancelScanBtn =
document.getElementById("cancelScanBtn");

const startScannerBtn =
document.getElementById("startScannerBtn");

const stopScannerBtn =
document.getElementById("stopScannerBtn");

const scannerStatus =
document.getElementById("scannerStatus");

const lastRefresh =
document.getElementById("lastRefresh");

const scanCustomerPhoto =
document.getElementById("scanCustomerPhoto");

const scanCustomerName =
document.getElementById("scanCustomerName");

const scanMemberId =
document.getElementById("scanMemberId");

const scanStampCount =
document.getElementById("scanStampCount");

const todayStatus =
document.getElementById("todayStatus");

const logoutBtn =
document.getElementById("logoutBtn");

// =====================================================
// VARIABLES
// =====================================================

let customers = [];

let currentCustomer = null;

let todayScanCount = 0;

let html5QrCode = null;

let scannerRunning = false;

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async (user)=>{

if(!user){

location.href="admin-login.html";

return;

}

await loadDashboard();

});
// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard(){

customerTable.innerHTML="";

customers=[];

let stampCount=0;

let rewardCount=0;

todayScanCount=0;

const snapshot=
await getDocs(collection(db,"customers"));

snapshot.forEach((document)=>{

const customer=document.data();

customer.uid=document.id;

customers.push(customer);

stampCount+=customer.stamps||0;

if(customer.rewardUnlocked){

rewardCount++;

}

createCustomerRow(customer);

});

totalCustomers.textContent=customers.length;

totalStamps.textContent=stampCount;

totalRewards.textContent=rewardCount;

todayScans.textContent=todayScanCount;

lastRefresh.textContent=
new Date().toLocaleString();

}

// =====================================================
// CUSTOMER TABLE
// =====================================================

function createCustomerRow(customer){

const tr=document.createElement("tr");

const avatar=
customer.gender==="female"
?"assets/avatars/female.png"
:"assets/avatars/male.png";

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
? "✅ Ready"
: "❌ Locked"
}

</td>

<td>

<button
onclick="selectCustomer('${customer.uid}')">

View

</button>

</td>

`;

customerTable.appendChild(tr);

}

// =====================================================
// SEARCH
// =====================================================

searchCustomer?.addEventListener("keyup",(e)=>{

const keyword=e.target.value.toLowerCase();

customerTable.innerHTML="";

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

.forEach(createCustomerRow);

});

// =====================================================
// SELECT CUSTOMER
// =====================================================

window.selectCustomer=function(uid){

currentCustomer=
customers.find(c=>c.uid===uid);

if(!currentCustomer) return;

showCustomer(currentCustomer);

};

// =====================================================
// SHOW CUSTOMER
// =====================================================

function showCustomer(customer){

scanCustomerPhoto.src=

customer.gender==="female"

?"assets/avatars/female.png"

:"assets/avatars/male.png";

scanCustomerName.textContent=

customer.name;

scanMemberId.textContent=

customer.memberId;

scanStampCount.textContent=

`${customer.stamps||0}/6`;

todayStatus.textContent=

"Ready To Give Stamp";

todayStatus.className="success";

giveStampBtn.disabled=false;

}
// =====================================================
// CAMERA + QR SCANNER
// =====================================================

async function startScanner(){

if(scannerRunning) return;

scannerRunning=true;

scannerStatus.textContent="🟡 Opening Camera...";

document.getElementById("cameraOverlay").style.display="none";

html5QrCode=new Html5Qrcode("qr-reader");

try{

await html5QrCode.start(

{ facingMode:"environment" },

{

fps:10,

qrbox:250

},

onScanSuccess,

()=>{}

);

scannerStatus.textContent="🟢 Scanner Running";

startScannerBtn.disabled=true;

stopScannerBtn.disabled=false;

}catch(err){

console.error(err);

scannerStatus.textContent="🔴 Camera Error";

scannerRunning=false;

document.getElementById("cameraOverlay").style.display="flex";

}

}

// =====================================================

async function stopScanner(){

if(!scannerRunning) return;

try{

await html5QrCode.stop();

}catch(e){}

scannerRunning=false;

scannerStatus.textContent="⚪ Camera Stopped";

document.getElementById("cameraOverlay").style.display="flex";

startScannerBtn.disabled=false;

stopScannerBtn.disabled=true;

}

// =====================================================
// BUTTONS
// =====================================================

startScannerBtn?.addEventListener("click",startScanner);

stopScannerBtn?.addEventListener("click",stopScanner);

// =====================================================
// QR SUCCESS
// =====================================================

async function onScanSuccess(decodedText){

await stopScanner();

if(!decodedText.startsWith("RIO-MAGGI::")){

alert("Invalid Rio QR");

return;

}

const memberId=

decodedText.replace("RIO-MAGGI::","");

const q=query(

collection(db,"customers"),

where("memberId","==",memberId)

);

const snapshot=

await getDocs(q);

if(snapshot.empty){

alert("Customer Not Found");

return;

}

snapshot.forEach((document)=>{

currentCustomer=document.data();

currentCustomer.uid=document.id;

});

showCustomer(currentCustomer);

}
// =====================================================
// GIVE STAMP
// =====================================================

giveStampBtn?.addEventListener("click", async ()=>{

if(!currentCustomer) return;

try{

let stamp=currentCustomer.stamps||0;

if(stamp<6){

stamp++;

}

const rewardUnlocked=(stamp>=6);

await updateDoc(

doc(db,"customers",currentCustomer.uid),

{

stamps:stamp,

rewardUnlocked:rewardUnlocked,

lastStampAt:serverTimestamp(),

updatedAt:serverTimestamp()

}

);

alert("✅ Stamp Added Successfully");

currentCustomer.stamps=stamp;

currentCustomer.rewardUnlocked=rewardUnlocked;

showCustomer(currentCustomer);

await loadDashboard();

}catch(err){

console.error(err);

alert("❌ Failed To Give Stamp");

}

});

// =====================================================
// RESET CUSTOMER
// =====================================================

cancelScanBtn?.addEventListener("click",()=>{

currentCustomer=null;

scanCustomerPhoto.src="assets/avatars/male.png";

scanCustomerName.textContent="Waiting For Scan...";

scanMemberId.textContent="RIO-000000000";

scanStampCount.textContent="0/6";

todayStatus.textContent="Waiting";

todayStatus.className="pending";

giveStampBtn.disabled=true;

});

// =====================================================
// REFRESH
// =====================================================

refreshBtn?.addEventListener("click",async()=>{

await loadDashboard();

});

// =====================================================
// EXPORT
// =====================================================

exportBtn?.addEventListener("click",()=>{

alert("📄 Export Feature Coming Soon");

});

// =====================================================
// REWARD
// =====================================================

rewardBtn?.addEventListener("click",()=>{

location.href="reward.html";

});

// =====================================================
// REPORT
// =====================================================

document.getElementById("reportMenu")
?.addEventListener("click",()=>{

alert("📊 Reports Coming Soon");

});

// =====================================================
// SETTINGS
// =====================================================

settingsBtn?.addEventListener("click",()=>{

alert("⚙ Settings Coming Soon");

});

document.getElementById("settingMenu")
?.addEventListener("click",()=>{

alert("⚙ Settings Coming Soon");

});

// =====================================================
// NAVIGATION
// =====================================================

document.getElementById("dashboardMenu")
?.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

document.getElementById("customersMenu")
?.addEventListener("click",()=>{

document.querySelector(".customer-section")
?.scrollIntoView({

behavior:"smooth"

});

});

document.getElementById("stampMenu")
?.addEventListener("click",()=>{

document.querySelector(".scanner-section")
?.scrollIntoView({

behavior:"smooth"

});

});

// =====================================================
// LOGOUT
// =====================================================

logoutBtn?.addEventListener("click",async()=>{

try{

if(scannerRunning){

await stopScanner();

}

}catch(e){}

await signOut(auth);

location.href="admin-login.html";

});

// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Premium Admin Dashboard V3");

console.log("Camera Ready");

console.log("================================");
