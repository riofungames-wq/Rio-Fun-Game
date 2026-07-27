// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// ======================================
// ELEMENTS
// ======================================

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

const lastRefresh =
document.getElementById("lastRefresh");

const giveStampBtn =
document.getElementById("giveStampBtn");

const scannerStatus =
document.getElementById("scannerStatus");

let customers = [];

let currentCustomer = null;

// ======================================
// AUTH
// ======================================

onAuthStateChanged(auth,(user)=>{

    if(!user){

        location.href="admin-login.html";

        return;

    }

    loadDashboard();

});
// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard(){

    scannerStatus.textContent="🟢 Ready";

    const snapshot =
    await getDocs(collection(db,"customers"));

    customers=[];

    let stampCount=0;

    let rewardCount=0;

    customerTable.innerHTML="";

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

    todayScans.textContent="0";

    lastRefresh.textContent=
    new Date().toLocaleString();

}

// =====================================================
// CREATE CUSTOMER ROW
// =====================================================

function createCustomerRow(customer){

    const tr=document.createElement("tr");

    tr.innerHTML=`

    <td>

    <img src="${customer.photoURL||'assets/avatars/default.png'}">

    </td>

    <td>${customer.name}</td>

    <td>${customer.memberId}</td>

    <td>${customer.stamps||0}/6</td>

    <td>

    ${
    customer.rewardUnlocked
    ?

    '<span class="reward-ready">✅ Ready</span>'

    :

    '<span class="reward-lock">❌ Locked</span>'

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
// SEARCH
// =====================================================

searchCustomer.addEventListener("keyup",(e)=>{

    const keyword=e.target.value.toLowerCase();

    customerTable.innerHTML="";

    customers

    .filter((customer)=>{

        return(

        customer.name.toLowerCase().includes(keyword)

        ||

        customer.memberId.toLowerCase().includes(keyword)

        ||

        customer.mobile.includes(keyword)

        );

    })

    .forEach(createCustomerRow);

});
// =====================================================
// SELECT CUSTOMER
// =====================================================

window.selectCustomer = function(uid){

    currentCustomer = customers.find(c => c.uid === uid);

    if(!currentCustomer) return;

    document.getElementById("scanCustomerName").textContent =
    currentCustomer.name;

    document.getElementById("scanMemberId").textContent =
    currentCustomer.memberId;

    document.getElementById("scanStampCount").textContent =
    `${currentCustomer.stamps || 0}/6`;

    document.getElementById("scanCustomerPhoto").src =
    currentCustomer.photoURL || "assets/avatars/default.png";

    document.getElementById("todayStatus").textContent =
    "Ready To Give Stamp";

    document.getElementById("todayStatus").className =
    "success";

    giveStampBtn.disabled = false;

};

// =====================================================
// GIVE STAMP
// =====================================================

giveStampBtn.addEventListener("click", async()=>{

    if(!currentCustomer) return;

    try{

        let stamp = currentCustomer.stamps || 0;

        if(stamp < 6){

            stamp++;

        }

        let rewardUnlocked = stamp >= 6;

        await updateDoc(

            doc(db,"customers",currentCustomer.uid),

            {

                stamps: stamp,

                rewardUnlocked: rewardUnlocked,

                updatedAt: serverTimestamp()

            }

        );

        alert("✅ Stamp Added Successfully");

        giveStampBtn.disabled = true;

        currentCustomer = null;

        loadDashboard();

    }

    catch(error){

        console.error(error);

        alert("❌ Failed to Give Stamp");

    }

});

// =====================================================
// REFRESH
// =====================================================

document.getElementById("refreshBtn")
.addEventListener("click",()=>{

    loadDashboard();

});

// =====================================================
// LOGOUT
// =====================================================

document.querySelectorAll(".sidebar nav a").forEach(item=>{

    if(item.textContent.includes("Logout")){

        item.addEventListener("click",async()=>{

            await signOut(auth);

            location.href="admin-login.html";

        });

    }

});

// =====================================================
// READY
// =====================================================

console.log("Rio Maggi Premium Admin Loaded");
