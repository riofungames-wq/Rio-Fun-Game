// =====================================================
// RIO MAGGI POINT
// ADMIN EXPORT
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================================
// ELEMENTS
// =====================================================

const exportCustomers =
document.getElementById("exportCustomers");

const exportRewards =
document.getElementById("exportRewards");

const totalExportCustomers =
document.getElementById("totalExportCustomers");

const totalExportRewards =
document.getElementById("totalExportRewards");

const lastExportDate =
document.getElementById("lastExportDate");

const lastExportType =
document.getElementById("lastExportType");

const lastExportStatus =
document.getElementById("lastExportStatus");

// =====================================================

let customers=[];

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="admin-login.html";

return;

}

await loadCustomers();

});

// =====================================================
// LOAD CUSTOMERS
// =====================================================

async function loadCustomers(){

customers=[];

let rewardCount=0;

const snapshot=

await getDocs(collection(db,"customers"));

snapshot.forEach((document)=>{

const customer=document.data();

customer.uid=document.id;

customers.push(customer);

if(customer.rewardUnlocked){

rewardCount++;

}

});

totalExportCustomers.textContent=

customers.length;

totalExportRewards.textContent=

rewardCount;

}
// =====================================================
// EXPORT ALL CUSTOMERS
// =====================================================

exportCustomers?.addEventListener("click",()=>{

if(customers.length===0){

alert("No Customer Data");

return;

}

let csv=

"Name,Member ID,Mobile,Stamps,Reward\n";

customers.forEach(customer=>{

csv+=

`"${customer.name||""}","${customer.memberId||""}","${customer.mobile||""}",${customer.stamps||0},"${customer.rewardUnlocked?"Ready":"Locked"}"\n`;

});

downloadCSV(

csv,

"Rio_Customers.csv"

);

updateLog(

"Customer Export"

);

});

// =====================================================
// EXPORT REWARD CUSTOMERS
// =====================================================

exportRewards?.addEventListener("click",()=>{

const rewardCustomers=

customers.filter(customer=>

customer.rewardUnlocked

);

if(rewardCustomers.length===0){

alert("No Reward Customer");

return;

}

let csv=

"Name,Member ID,Mobile,Reward\n";

rewardCustomers.forEach(customer=>{

csv+=

`"${customer.name||""}","${customer.memberId||""}","${customer.mobile||""}","FREE VEG MAGGI"\n`;

});

downloadCSV(

csv,

"Rio_Rewards.csv"

);

updateLog(

"Reward Export"

);

});

// =====================================================
// DOWNLOAD CSV
// =====================================================

function downloadCSV(csv,fileName){

const blob=

new Blob(

[csv],

{type:"text/csv"}

);

const url=

URL.createObjectURL(blob);

const a=

document.createElement("a");

a.href=url;

a.download=fileName;

a.click();

URL.revokeObjectURL(url);

}

// =====================================================
// EXPORT LOG
// =====================================================

function updateLog(type){

lastExportDate.textContent=

new Date().toLocaleString();

lastExportType.textContent=

type;

lastExportStatus.textContent=

"Success";

}

// =====================================================
// READY
// =====================================================

console.log("================================");
console.log("📤 Rio Maggi Point");
console.log("Export Center Ready");
console.log("================================");
