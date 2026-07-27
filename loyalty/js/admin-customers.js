// =====================================================
// RIO MAGGI POINT
// ADMIN CUSTOMERS
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

const customerTable =
document.getElementById("customerTable");

const searchCustomer =
document.getElementById("searchCustomer");

const refreshBtn =
document.getElementById("refreshBtn");

const totalCustomers =
document.getElementById("totalCustomers");

const rewardReady =
document.getElementById("rewardReady");

const todayJoined =
document.getElementById("todayJoined");

const modal =
document.getElementById("customerModal");

const closeModal =
document.getElementById("closeModal");

const modalPhoto =
document.getElementById("modalPhoto");

const modalName =
document.getElementById("modalName");

const modalMember =
document.getElementById("modalMember");

const modalMobile =
document.getElementById("modalMobile");

const modalStamp =
document.getElementById("modalStamp");

const modalReward =
document.getElementById("modalReward");

// =====================================================
// VARIABLES
// =====================================================

let customers = [];

let selectedCustomer = null;

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async(user)=>{

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

customerTable.innerHTML="";

customers=[];

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

if(customer.rewardUnlocked){

rewardCount++;

}

createRow(customer);

});

totalCustomers.textContent=
customers.length;

rewardReady.textContent=
rewardCount;

todayJoined.textContent=
customers.length;

}
// =====================================================
// CREATE TABLE ROW
// =====================================================

function createRow(customer){

const tr=document.createElement("tr");

const avatar=

customer.gender==="female"

?"assets/avatars/female.png"

:"assets/avatars/male.png";

tr.innerHTML=`

<td>

<img src="${avatar}">

</td>

<td>${customer.name||"-"}</td>

<td>${customer.memberId||"-"}</td>

<td>${customer.mobile||"-"}</td>

<td>${customer.stamps||0}/6</td>

<td>

${customer.rewardUnlocked

? "✅ Ready"

: "❌ Locked"}

</td>

<td>

<button

class="actionBtn"

onclick="viewCustomer('${customer.uid}')">

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

.forEach(createRow);

});

// =====================================================
// REFRESH
// =====================================================

refreshBtn?.addEventListener("click",async()=>{

refreshBtn.disabled=true;

refreshBtn.innerHTML="Loading...";

await loadCustomers();

refreshBtn.disabled=false;

refreshBtn.innerHTML="Refresh";

});

// =====================================================
// VIEW CUSTOMER
// =====================================================

window.viewCustomer=function(uid){

selectedCustomer=

customers.find(c=>c.uid===uid);

if(!selectedCustomer){

return;

}

modal.style.display="flex";

modalPhoto.src=

selectedCustomer.gender==="female"

?"assets/avatars/female.png"

:"assets/avatars/male.png";

modalName.textContent=

selectedCustomer.name||"-";

modalMember.textContent=

selectedCustomer.memberId||"-";

modalMobile.textContent=

selectedCustomer.mobile||"-";

modalStamp.textContent=

`${selectedCustomer.stamps||0}/6`;

modalReward.textContent=

selectedCustomer.rewardUnlocked

?"Ready"

:"Locked";

};

// =====================================================
// CLOSE MODAL
// =====================================================

closeModal?.addEventListener("click",()=>{

modal.style.display="none";

});

window.addEventListener("click",(e)=>{

if(e.target===modal){

modal.style.display="none";

}

});
// =====================================================
// AUTO REFRESH
// =====================================================

setInterval(async()=>{

await loadCustomers();

},30000);

// =====================================================

console.log("================================");
console.log("👥 Rio Maggi Point");
console.log("Customer Manager Ready");
console.log("================================");
