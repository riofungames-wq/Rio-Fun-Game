// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V2
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {

collection,
getDocs,
query,
where,
doc,
updateDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {

onAuthStateChanged,
signOut

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================================
// VARIABLES
// =====================================================

let customers = [];

let currentCustomer = null;

let html5QrCode = null;

let scannerRunning = false;

// =====================================================
// ELEMENTS
// =====================================================

const startScannerBtn =
document.getElementById("startScannerBtn");

const stopScannerBtn =
document.getElementById("stopScannerBtn");

const scannerStatus =
document.getElementById("scannerStatus");

const cameraOverlay =
document.getElementById("cameraOverlay");

const qrReader =
document.getElementById("qr-reader");

const giveStampBtn =
document.getElementById("giveStampBtn");

const cancelScanBtn =
document.getElementById("cancelScanBtn");

const logoutBtn =
document.getElementById("logoutBtn");

const refreshBtn =
document.getElementById("refreshBtn");

const exportBtn =
document.getElementById("exportBtn");

const rewardBtn =
document.getElementById("rewardBtn");

const reportBtn =
document.getElementById("reportBtn");

const settingsBtn =
document.getElementById("settingsBtn");

const customerTable =
document.getElementById("customerTable");

const searchCustomer =
document.getElementById("searchCustomer");

const totalCustomers =
document.getElementById("totalCustomers");

const totalStamps =
document.getElementById("totalStamps");

const totalRewards =
document.getElementById("totalRewards");

const todayScans =
document.getElementById("todayScans");

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

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async(user)=>{

if(!user){

location.href="admin-login.html";

return;

}

await loadDashboard();

});
// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

customerTable.innerHTML = "";

customers = [];

let totalStamp = 0;

let rewardCount = 0;

let todayCount = 0;

const snapshot =
await getDocs(collection(db,"customers"));

snapshot.forEach((document)=>{

const customer = document.data();

customer.uid = document.id;

customers.push(customer);

totalStamp += customer.stamps || 0;

if(customer.rewardUnlocked){

rewardCount++;

}

createCustomerRow(customer);

});

totalCustomers.textContent = customers.length;

totalStamps.textContent = totalStamp;

totalRewards.textContent = rewardCount;

todayScans.textContent = todayCount;

lastRefresh.textContent =
new Date().toLocaleString();

}

// =====================================================
// CUSTOMER TABLE
// =====================================================

function createCustomerRow(customer){

const tr = document.createElement("tr");

const avatar =
customer.gender === "female"
?
"assets/avatars/female.png"
:
"assets/avatars/male.png";

tr.innerHTML = `

<td>

<img
src="${avatar}"
class="table-avatar">

</td>

<td>${customer.name || "-"}</td>

<td>${customer.memberId || "-"}</td>

<td>${customer.mobile || "-"}</td>

<td>${customer.stamps || 0}/6</td>

<td>

${
customer.rewardUnlocked

?

'<span class="online">Unlocked</span>'

:

'<span style="color:#ef4444;">Locked</span>'

}

</td>

<td>

<button
class="action-btn"

onclick="selectCustomer('${customer.uid}')">

View

</button>

</td>

`;

customerTable.appendChild(tr);

}

// =====================================================
// SEARCH CUSTOMER
// =====================================================

searchCustomer.addEventListener("keyup",(e)=>{

const keyword =
e.target.value.toLowerCase().trim();

customerTable.innerHTML = "";

customers

.filter(customer=>{

return(

(customer.name || "")
.toLowerCase()
.includes(keyword)

||

(customer.mobile || "")
.includes(keyword)

||

(customer.memberId || "")
.toLowerCase()
.includes(keyword)

);

})

.forEach(createCustomerRow);

});

// =====================================================
// REFRESH
// =====================================================

refreshBtn.addEventListener("click",async()=>{

await loadDashboard();

});

// =====================================================
// SELECT CUSTOMER
// =====================================================

window.selectCustomer = function(uid){

currentCustomer =
customers.find(c=>c.uid===uid);

if(!currentCustomer) return;

showCustomer(currentCustomer);

};
// =====================================================
// SHOW CUSTOMER
// =====================================================

function showCustomer(customer){

scanCustomerPhoto.src =
customer.gender === "female"
?
"assets/avatars/female.png"
:
"assets/avatars/male.png";

scanCustomerName.textContent =
customer.name || "Customer";

scanMemberId.textContent =
customer.memberId || "-";

scanStampCount.textContent =
`${customer.stamps || 0} / 6`;

todayStatus.textContent =
customer.rewardUnlocked
?
"Reward Ready"
:
"Ready For Stamp";

todayStatus.className =
customer.rewardUnlocked
?
"online"
:
"pending";

giveStampBtn.disabled = false;

}

// =====================================================
// CLEAR CUSTOMER
// =====================================================

function clearCustomer(){

currentCustomer = null;

scanCustomerPhoto.src =
"assets/avatars/male.png";

scanCustomerName.textContent =
"Waiting For Scan...";

scanMemberId.textContent =
"RIO-000000000";

scanStampCount.textContent =
"0 / 6";

todayStatus.textContent =
"Waiting";

todayStatus.className =
"pending";

giveStampBtn.disabled = true;

}

// =====================================================
// START SCANNER
// =====================================================

startScannerBtn.addEventListener("click",async()=>{

if(scannerRunning) return;

cameraOverlay.style.display = "none";

scannerStatus.textContent =
"Starting Camera...";

html5QrCode =
new Html5Qrcode("qr-reader");

try{

await html5QrCode.start(

{

facingMode:"environment"

},

{

fps:10,

qrbox:260

},

onScanSuccess,

()=>{}

);

scannerRunning = true;

startScannerBtn.disabled = true;

stopScannerBtn.disabled = false;

scannerStatus.textContent =
"Scanner Ready";

}catch(error){

console.error(error);

cameraOverlay.style.display = "flex";

scannerStatus.textContent =
"Camera Error";

scannerRunning = false;

}

});

// =====================================================
// STOP SCANNER
// =====================================================

stopScannerBtn.addEventListener("click",async()=>{

if(!scannerRunning) return;

try{

await html5QrCode.stop();

}catch(e){}

scannerRunning = false;

cameraOverlay.style.display = "flex";

scannerStatus.textContent =
"Camera Off";

startScannerBtn.disabled = false;

stopScannerBtn.disabled = true;

});

// =====================================================
// RESET SCANNER
// =====================================================

cancelScanBtn.addEventListener("click",()=>{

clearCustomer();

});
// =====================================================
// QR SUCCESS
// =====================================================

async function onScanSuccess(decodedText){

try{

await html5QrCode.stop();

scannerRunning = false;

startScannerBtn.disabled = false;

stopScannerBtn.disabled = true;

scannerStatus.textContent =
"QR Detected";

cameraOverlay.style.display = "flex";

if(!decodedText.startsWith("RIO-MAGGI::")){

alert("❌ Invalid Rio Maggi QR");

return;

}

const memberId =
decodedText.replace("RIO-MAGGI::","");

const q = query(

collection(db,"customers"),

where("memberId","==",memberId)

);

const snapshot =
await getDocs(q);

if(snapshot.empty){

alert("❌ Customer Not Found");

return;

}

snapshot.forEach((document)=>{

currentCustomer =
document.data();

currentCustomer.uid =
document.id;

});

showCustomer(currentCustomer);

}
catch(error){

console.error(error);

alert("Scanner Error");

}

}

// =====================================================
// GIVE STAMP
// =====================================================

giveStampBtn.addEventListener("click",async()=>{

if(!currentCustomer) return;

try{

let stamp =
currentCustomer.stamps || 0;

if(stamp < 6){

stamp++;

}

const rewardUnlocked =
(stamp >= 6);

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

clearCustomer();

await loadDashboard();

}
catch(error){

console.error(error);

alert("❌ Failed To Add Stamp");

}

});
// =====================================================
// QUICK ACTION BUTTONS
// =====================================================

if(exportBtn){

exportBtn.addEventListener("click",()=>{

alert("📄 Export Feature Coming Soon");

});

}

if(rewardBtn){

rewardBtn.addEventListener("click",()=>{

alert("🎁 Reward Manager Coming Soon");

});

}

if(reportBtn){

reportBtn.addEventListener("click",()=>{

alert("📊 Reports Coming Soon");

});

}

if(settingsBtn){

settingsBtn.addEventListener("click",()=>{

alert("⚙ Settings Coming Soon");

});

}

// =====================================================
// SIDEBAR MENU
// =====================================================

const dashboardMenu =
document.getElementById("dashboardMenu");

const scannerMenu =
document.getElementById("scannerMenu");

const customersMenu =
document.getElementById("customersMenu");

const stampMenu =
document.getElementById("stampMenu");

const rewardsMenu =
document.getElementById("rewardsMenu");

const reportsMenu =
document.getElementById("reportsMenu");

const settingMenu =
document.getElementById("settingMenu");

function menuClick(name){

console.log(name);

}

dashboardMenu?.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

scannerMenu?.addEventListener("click",()=>{

document.querySelector(".scanner-card")

?.scrollIntoView({

behavior:"smooth"

});

});

customersMenu?.addEventListener("click",()=>{

document.querySelector(".customer-table-card")

?.scrollIntoView({

behavior:"smooth"

});

});

stampMenu?.addEventListener("click",()=>{

document.querySelector(".customer-card")

?.scrollIntoView({

behavior:"smooth"

});

});

rewardsMenu?.addEventListener("click",()=>{

alert("🎁 Reward Manager Coming Soon");

});

reportsMenu?.addEventListener("click",()=>{

alert("📊 Reports Coming Soon");

});

settingMenu?.addEventListener("click",()=>{

alert("⚙ Settings Coming Soon");

});

// =====================================================
// LOGOUT
// =====================================================

logoutBtn?.addEventListener("click",async()=>{

try{

if(html5QrCode && scannerRunning){

await html5QrCode.stop();

}

}catch(e){}

await signOut(auth);

location.href="admin-login.html";

});
// =====================================================
// INITIALIZATION
// =====================================================

window.addEventListener("load",()=>{

clearCustomer();

console.log("====================================");

console.log("🍜 Rio Maggi Point");

console.log("Premium Admin Dashboard V2");

console.log("Firebase Connected");

console.log("Manual Camera Mode Enabled");

console.log("====================================");

});

// =====================================================
// AUTO STOP CAMERA ON EXIT
// =====================================================

window.addEventListener("beforeunload",async()=>{

try{

if(html5QrCode && scannerRunning){

await html5QrCode.stop();

}

}catch(e){}

});

// =====================================================
// CAMERA SAFETY
// =====================================================

document.addEventListener("visibilitychange",async()=>{

if(document.hidden){

try{

if(html5QrCode && scannerRunning){

await html5QrCode.stop();

scannerRunning = false;

cameraOverlay.style.display = "flex";

scannerStatus.textContent = "Camera Paused";

startScannerBtn.disabled = false;

stopScannerBtn.disabled = true;

}

}catch(e){}

}

});

// =====================================================
// FINISHED
// =====================================================

console.log("====================================");
console.log("✅ Rio Admin Dashboard Ready");
console.log("Version : V2");
console.log("Camera : Manual");
console.log("Scanner : Ready");
console.log("====================================");
