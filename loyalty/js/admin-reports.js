// =====================================================
// RIO MAGGI POINT
// ADMIN REPORTS
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
collection,
getDocs,
query,
orderBy
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================================
// ELEMENTS
// =====================================================

const todayScan =
document.getElementById("todayScan");

const weekScan =
document.getElementById("weekScan");

const monthScan =
document.getElementById("monthScan");

const rewardClaim =
document.getElementById("rewardClaim");

const reportTable =
document.getElementById("reportTable");

const summaryCustomer =
document.getElementById("summaryCustomer");

const summaryStamp =
document.getElementById("summaryStamp");

const summaryReward =
document.getElementById("summaryReward");

const refreshBtn =
document.getElementById("refreshBtn");

const loadReport =
document.getElementById("loadReport");

const fromDate =
document.getElementById("fromDate");

const toDate =
document.getElementById("toDate");

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

await loadReports();

});

// =====================================================
// LOAD REPORT
// =====================================================

async function loadReports(){

reportTable.innerHTML="";

customers=[];

let totalStamp=0;

let rewardCount=0;

const q=query(

collection(db,"customers"),

orderBy("createdAt","desc")

);

const snapshot=

await getDocs(q);

snapshot.forEach((document)=>{

const customer=document.data();

customer.uid=document.id;

customers.push(customer);

totalStamp+=customer.stamps||0;

if(customer.rewardUnlocked){

rewardCount++;

}

createRow(customer);

});

todayScan.textContent=
customers.length;

weekScan.textContent=
customers.length;

monthScan.textContent=
customers.length;

rewardClaim.textContent=
rewardCount;

summaryCustomer.textContent=
customers.length;

summaryStamp.textContent=
totalStamp;

summaryReward.textContent=
rewardCount;

}

// =====================================================
// CREATE ROW
// =====================================================

function createRow(customer){

const tr=document.createElement("tr");

tr.innerHTML=`

<td>

${customer.createdAt
? new Date(
customer.createdAt.seconds*1000
).toLocaleDateString()
: "-"}

</td>

<td>${customer.name||"-"}</td>

<td>${customer.memberId||"-"}</td>

<td>${customer.stamps||0}/6</td>

<td>

${customer.rewardUnlocked
?"✅ Claimed"
:"❌ Locked"}

</td>

`;

reportTable.appendChild(tr);

}
// =====================================================
// REFRESH
// =====================================================

refreshBtn?.addEventListener("click", async()=>{

refreshBtn.disabled=true;

refreshBtn.innerHTML="Loading...";

await loadReports();

refreshBtn.disabled=false;

refreshBtn.innerHTML=

'<i class="fa-solid fa-rotate"></i> Refresh';

});

// =====================================================
// DATE FILTER
// =====================================================

loadReport?.addEventListener("click",()=>{

const from=fromDate.value;

const to=toDate.value;

if(!from || !to){

alert("Please Select Date Range");

return;

}

const fromTime=new Date(from).getTime();

const toTime=new Date(to).getTime();

reportTable.innerHTML="";

let totalStamp=0;

let rewardCount=0;

let customerCount=0;

customers.forEach(customer=>{

if(!customer.createdAt) return;

const time=

customer.createdAt.seconds*1000;

if(time>=fromTime && time<=toTime+86400000){

customerCount++;

totalStamp+=customer.stamps||0;

if(customer.rewardUnlocked){

rewardCount++;

}

createRow(customer);

}

});

summaryCustomer.textContent=

customerCount;

summaryStamp.textContent=

totalStamp;

summaryReward.textContent=

rewardCount;

});

// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(async()=>{

await loadReports();

},30000);

// =====================================================
// READY
// =====================================================

console.log("================================");
console.log("📊 Rio Maggi Point");
console.log("Reports Dashboard Ready");
console.log("================================");
