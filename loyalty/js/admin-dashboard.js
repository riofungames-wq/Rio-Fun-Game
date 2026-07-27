// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD v3
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
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

const scannerStatus =
document.getElementById("scannerStatus");

const refreshBtn =
document.getElementById("refreshBtn");

const giveStampBtn =
document.getElementById("giveStampBtn");

const cancelScanBtn =
document.getElementById("cancelScanBtn");

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

let customers = [];

let currentCustomer = null;

let qrScanner = null;

let todayScanCount = 0;

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.href="admin-login.html";

        return;

    }

    await loadDashboard();

    startScanner();

});

// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard(){

    customerTable.innerHTML="";

    customers=[];

    let stampCount=0;

    let rewardCount=0;

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

    totalCustomers.textContent=
    customers.length;

    totalStamps.textContent=
    stampCount;

    totalRewards.textContent=
    rewardCount;

    todayScans.textContent=
    todayScanCount;

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

        <img
        src="${customer.photoURL || 'assets/avatars/default.png'}"
        class="table-avatar">

    </td>

    <td>${customer.name}</td>

    <td>${customer.memberId}</td>

    <td>${customer.stamps || 0}/6</td>

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
// SEARCH CUSTOMER
// =====================================================

searchCustomer.addEventListener("keyup",(e)=>{

    const keyword=e.target.value
    .toLowerCase()
    .trim();

    customerTable.innerHTML="";

    customers

    .filter(customer=>{

        return(

            (customer.name || "")

            .toLowerCase()

            .includes(keyword)

            ||

            (customer.memberId || "")

            .toLowerCase()

            .includes(keyword)

            ||

            (customer.mobile || "")

            .includes(keyword)

        );

    })

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

    customer.photoURL ||

    "assets/avatars/default.png";

    scanCustomerName.textContent=

    customer.name;

    scanMemberId.textContent=

    customer.memberId;

    scanStampCount.textContent=

    `${customer.stamps || 0}/6`;

    todayStatus.textContent=

    "Ready To Give Stamp";

    todayStatus.className=

    "success";

    giveStampBtn.disabled=false;

}

// =====================================================
// START QR SCANNER
// =====================================================

async function startScanner(){

    if(qrScanner) return;

    qrScanner=new Html5Qrcode("qr-reader");

    scannerStatus.textContent=

    "🟢 Camera Starting...";

    try{

        await qrScanner.start(

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

        scannerStatus.textContent=

        "🟢 Scanner Ready";

    }

    catch(error){

        console.error(error);

        scannerStatus.textContent=

        "🔴 Camera Error";

    }

}
// =====================================================
// QR SCAN SUCCESS
// =====================================================

async function onScanSuccess(decodedText){

    try{

        // Stop Scanner

        await qrScanner.stop();

        qrScanner = null;

        scannerStatus.textContent =
        "🟢 QR Detected";

        // ============================
        // VALIDATE QR
        // ============================

        if(

            !decodedText.startsWith("RIO-MAGGI::")

        ){

            alert("❌ Invalid Rio Maggi QR");

            startScanner();

            return;

        }

        // ============================
        // MEMBER ID
        // ============================

        const memberId =

        decodedText.replace(

            "RIO-MAGGI::",

            ""

        );

        // ============================
        // FIND CUSTOMER
        // ============================

        const q = query(

            collection(db,"customers"),

            where(

                "memberId",

                "==",

                memberId

            )

        );

        const snapshot =

        await getDocs(q);

        if(snapshot.empty){

            alert("Customer Not Found");

            startScanner();

            return;

        }

        snapshot.forEach((document)=>{

            currentCustomer =

            document.data();

            currentCustomer.uid =

            document.id;

        });

        // ============================
        // SHOW PREVIEW
        // ============================

        showCustomer(currentCustomer);

    }

    catch(error){

        console.error(error);

        alert("Scanner Error");

        startScanner();

    }

}

// =====================================================
// CANCEL
// =====================================================

cancelScanBtn.addEventListener(

"click",

()=>{

    clearCustomerPreview();

    startScanner();

});

// =====================================================
// CLEAR PREVIEW
// =====================================================

function clearCustomerPreview(){

    currentCustomer = null;

    scanCustomerPhoto.src =

    "assets/avatars/default.png";

    scanCustomerName.textContent =

    "Waiting For Scan...";

    scanMemberId.textContent =

    "RIO-000000000";

    scanStampCount.textContent =

    "0 / 6";

    todayStatus.textContent =

    "Not Scanned";

    todayStatus.className =

    "pending";

    giveStampBtn.disabled = true;

}
// =====================================================
// GIVE STAMP
// =====================================================

giveStampBtn.addEventListener("click", async () => {

    if (!currentCustomer) return;

    try {

        let stamp = currentCustomer.stamps || 0;

        if (stamp < 6) {

            stamp++;

        }

        const rewardUnlocked = (stamp >= 6);

        await updateDoc(

            doc(db, "customers", currentCustomer.uid),

            {

                stamps: stamp,

                rewardUnlocked: rewardUnlocked,

                lastStampAt: serverTimestamp(),

                updatedAt: serverTimestamp()

            }

        );

        todayScanCount++;

        alert("✅ Stamp Added Successfully");

        clearCustomerPreview();

        await loadDashboard();

        startScanner();

    }

    catch (error) {

        console.error(error);

        alert("❌ Failed To Give Stamp");

    }

});

// =====================================================
// REFRESH
// =====================================================

refreshBtn.addEventListener("click", async () => {

    await loadDashboard();

});

// =====================================================
// LOGOUT
// =====================================================

document.querySelectorAll(".sidebar nav a")
.forEach(item => {

    if (item.textContent.includes("Logout")) {

        item.addEventListener("click", async () => {

            if (qrScanner) {

                try {

                    await qrScanner.stop();

                }

                catch (e) {}

            }

            await signOut(auth);

            location.href = "admin-login.html";

        });

    }

});

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Premium Admin Dashboard Ready");

console.log("QR Scanner Active");

console.log("================================");
