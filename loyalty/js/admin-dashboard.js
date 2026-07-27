// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD v2.0
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

// =====================================================
// ELEMENTS
// =====================================================

const totalCustomers = document.getElementById("totalCustomers");
const totalStamps = document.getElementById("totalStamps");
const totalRewards = document.getElementById("totalRewards");
const todayScans = document.getElementById("todayScans");

const customerTable = document.getElementById("customerTable");

const searchCustomer = document.getElementById("searchCustomer");

const lastRefresh = document.getElementById("lastRefresh");

const scannerStatus = document.getElementById("scannerStatus");

const giveStampBtn = document.getElementById("giveStampBtn");

const scanCustomerName =
document.getElementById("scanCustomerName");

const scanCustomerPhoto =
document.getElementById("scanCustomerPhoto");

const scanMemberId =
document.getElementById("scanMemberId");

const scanStampCount =
document.getElementById("scanStampCount");

const todayStatus =
document.getElementById("todayStatus");

let customers = [];

let currentCustomer = null;

let qrScanner = null;

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "admin-login.html";

        return;

    }

    loadDashboard();

});
// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        scannerStatus.textContent = "🟢 Ready";

        customerTable.innerHTML = "";

        customers = [];

        let totalStampCount = 0;
        let rewardUnlockedCount = 0;

        const snapshot = await getDocs(collection(db, "customers"));

        snapshot.forEach((document) => {

            const customer = document.data();

            customer.uid = document.id;

            customers.push(customer);

            totalStampCount += customer.stamps || 0;

            if (customer.rewardUnlocked === true) {

                rewardUnlockedCount++;

            }

            createCustomerRow(customer);

        });

        totalCustomers.textContent = customers.length;

        totalStamps.textContent = totalStampCount;

        totalRewards.textContent = rewardUnlockedCount;

        todayScans.textContent = "0";

        lastRefresh.textContent =
            new Date().toLocaleString();

    }

    catch (error) {

        console.error(error);

        alert("Dashboard Loading Failed");

    }

}

// =====================================================
// CREATE CUSTOMER ROW
// =====================================================

function createCustomerRow(customer) {

    const tr = document.createElement("tr");

    tr.innerHTML = `

    <td>

        <img
        src="${customer.photoURL || "assets/avatars/default.png"}">

    </td>

    <td>

        ${customer.name}

    </td>

    <td>

        ${customer.memberId}

    </td>

    <td>

        ${customer.stamps || 0}/6

    </td>

    <td>

        ${customer.rewardUnlocked

            ? '<span class="reward-ready">✅ Ready</span>'

            : '<span class="reward-lock">❌ Locked</span>'

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

searchCustomer.addEventListener("keyup", (e) => {

    const keyword = e.target.value.toLowerCase().trim();

    customerTable.innerHTML = "";

    customers
        .filter((customer) => {

            return (

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

window.selectCustomer = function (uid) {

    currentCustomer =
        customers.find(c => c.uid === uid);

    if (!currentCustomer) return;

    scanCustomerName.textContent =
        currentCustomer.name || "Customer";

    scanMemberId.textContent =
        currentCustomer.memberId || "--";

    scanStampCount.textContent =
        `${currentCustomer.stamps || 0}/6`;

    scanCustomerPhoto.src =
        currentCustomer.photoURL ||
        "assets/avatars/default.png";

    todayStatus.textContent =
        "Ready To Give Stamp";

    todayStatus.className = "success";

    giveStampBtn.disabled = false;

};

// =====================================================
// CLEAR PREVIEW
// =====================================================

function clearCustomerPreview() {

    currentCustomer = null;

    scanCustomerName.textContent =
        "Waiting for Scan...";

    scanMemberId.textContent =
        "RIO-000000000";

    scanStampCount.textContent =
        "0/6";

    scanCustomerPhoto.src =
        "assets/avatars/default.png";

    todayStatus.textContent =
        "Not Scanned";

    todayStatus.className =
        "pending";

    giveStampBtn.disabled = true;

}

clearCustomerPreview();
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

        alert("✅ Stamp Added Successfully");

        clearCustomerPreview();

        await loadDashboard();

    }

    catch (error) {

        console.error(error);

        alert("❌ Failed To Give Stamp");

    }

});

// =====================================================
// QR SCANNER
// =====================================================

async function startScanner() {

    if (typeof Html5Qrcode === "undefined") {

        console.warn("QR Library Not Loaded");

        return;

    }

    if (qrScanner) return;

    qrScanner = new Html5Qrcode("qr-reader");

    try {

        await qrScanner.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,
                qrbox: 250
            },

            onScanSuccess,

            () => {}

        );

        scannerStatus.textContent = "🟢 Camera Active";

    }

    catch (error) {

        console.error(error);

        scannerStatus.textContent = "🔴 Camera Error";

    }

}

// =====================================================
// QR SUCCESS
// =====================================================

async function onScanSuccess(decodedText) {

    try {

        await qrScanner.stop();

        qrScanner = null;

        scannerStatus.textContent = "🟢 QR Detected";

        const customerRef =
            doc(db, "customers", decodedText);

        const customerSnap =
            await getDoc(customerRef);

        if (!customerSnap.exists()) {

            alert("Customer Not Found");

            startScanner();

            return;

        }

        currentCustomer = customerSnap.data();

        currentCustomer.uid = customerSnap.id;

        scanCustomerName.textContent =
            currentCustomer.name;

        scanMemberId.textContent =
            currentCustomer.memberId;

        scanStampCount.textContent =
            `${currentCustomer.stamps || 0}/6`;

        scanCustomerPhoto.src =
            currentCustomer.photoURL ||
            "assets/avatars/default.png";

        todayStatus.textContent =
            "Ready To Give Stamp";

        todayStatus.className = "success";

        giveStampBtn.disabled = false;

    }

    catch (error) {

        console.error(error);

    }

}

// =====================================================
// REFRESH
// =====================================================

document
.getElementById("refreshBtn")
.addEventListener("click", () => {

    loadDashboard();

});

// =====================================================
// CANCEL
// =====================================================

document
.getElementById("cancelScanBtn")
.addEventListener("click", () => {

    clearCustomerPreview();

    startScanner();

});

// =====================================================
// LOGOUT
// =====================================================

document.querySelectorAll(".sidebar nav a")
.forEach(item => {

    if (item.textContent.includes("Logout")) {

        item.addEventListener("click", async () => {

            await signOut(auth);

            location.href = "admin-login.html";

        });

    }

});

// =====================================================
// START
// =====================================================

startScanner();

console.log("✅ Rio Premium Admin Dashboard Loaded");
