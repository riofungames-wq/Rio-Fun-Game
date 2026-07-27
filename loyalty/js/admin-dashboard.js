// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// FINAL VERSION v4
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

const refreshBtn =
document.getElementById("refreshBtn");

const giveStampBtn =
document.getElementById("giveStampBtn");

const cancelScanBtn =
document.getElementById("cancelScanBtn");

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

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "admin-login.html";

        return;

    }

    await loadDashboard();

    startScanner();

});
// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    customerTable.innerHTML = "";

    customers = [];

    let stampCount = 0;

    let rewardCount = 0;

    todayScanCount = 0;

    const snapshot =
    await getDocs(collection(db, "customers"));

    snapshot.forEach((document) => {

        const customer = document.data();

        customer.uid = document.id;

        customers.push(customer);

        stampCount += customer.stamps || 0;

        if (customer.rewardUnlocked) {

            rewardCount++;

        }

        createCustomerRow(customer);

    });

    totalCustomers.textContent = customers.length;

    totalStamps.textContent = stampCount;

    totalRewards.textContent = rewardCount;

    todayScans.textContent = todayScanCount;

    lastRefresh.textContent =
    new Date().toLocaleString();

}

// =====================================================
// CUSTOMER TABLE
// =====================================================

function createCustomerRow(customer) {

    const tr = document.createElement("tr");

    const avatar = customer.gender === "female"
        ? "assets/avatars/female.png"
        : "assets/avatars/male.png";

    tr.innerHTML = `

    <td>
        <img src="${avatar}" class="table-avatar">
    </td>

    <td>${customer.name || "-"}</td>

    <td>${customer.memberId || "-"}</td>

    <td>${customer.mobile || "-"}</td>

    <td>${customer.stamps || 0}/6</td>

    <td>

        ${
            customer.rewardUnlocked

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
// SEARCH
// =====================================================

searchCustomer.addEventListener("keyup", (e) => {

    const keyword =
    e.target.value.toLowerCase().trim();

    customerTable.innerHTML = "";

    customers

    .filter(customer => {

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

window.selectCustomer = function(uid){

    currentCustomer =
    customers.find(c => c.uid === uid);

    if(!currentCustomer) return;

    showCustomer(currentCustomer);

};

// =====================================================
// SHOW CUSTOMER
// =====================================================

function showCustomer(customer){

    scanCustomerPhoto.src =
    customer.gender === "female"
        ? "assets/avatars/female.png"
        : "assets/avatars/male.png";

    scanCustomerName.textContent =
    customer.name;

    scanMemberId.textContent =
    customer.memberId;

    scanStampCount.textContent =
    `${customer.stamps || 0}/6`;

    todayStatus.textContent =
    "Ready To Give Stamp";

    todayStatus.className =
    "success";

    giveStampBtn.disabled = false;

}
// =====================================================
// START SCANNER
// =====================================================

async function startScanner() {

    if (scannerRunning) return;

    scannerRunning = true;

    scannerStatus.textContent = "🟡 Starting Camera...";

    html5QrCode = new Html5Qrcode("qr-reader");

    try {

        await html5QrCode.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,
                qrbox: 260
            },

            onScanSuccess,

            () => {}

        );

        scannerStatus.textContent = "🟢 Scanner Ready";

    }

    catch (error) {

        console.error(error);

        scannerStatus.textContent = "🔴 Camera Error";

        scannerRunning = false;

    }

}

// =====================================================
// QR SUCCESS
// =====================================================

async function onScanSuccess(decodedText) {

    try {

        await html5QrCode.stop();

        scannerRunning = false;

        scannerStatus.textContent = "🟢 QR Detected";

        if (!decodedText.startsWith("RIO-MAGGI::")) {

            alert("❌ Invalid Rio Maggi QR");

            startScanner();

            return;

        }

        const memberId = decodedText.replace("RIO-MAGGI::", "");

        const q = query(

            collection(db, "customers"),

            where("memberId", "==", memberId)

        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            alert("❌ Customer Not Found");

            startScanner();

            return;

        }

        snapshot.forEach((document) => {

            currentCustomer = document.data();

            currentCustomer.uid = document.id;

        });

        showCustomer(currentCustomer);

    }

    catch (error) {

        console.error(error);

        alert("Scanner Error");

        scannerRunning = false;

        startScanner();

    }

}

// =====================================================
// RESTART SCANNER
// =====================================================

cancelScanBtn.addEventListener("click", async () => {

    try {

        if (html5QrCode && scannerRunning) {

            await html5QrCode.stop();

        }

    }

    catch (e) {}

    scannerRunning = false;

    clearCustomerPreview();

    startScanner();

});

// =====================================================
// CLEAR PREVIEW
// =====================================================

function clearCustomerPreview() {

    currentCustomer = null;

    scanCustomerPhoto.src = "assets/avatars/male.png";

    scanCustomerName.textContent = "Waiting For Scan...";

    scanMemberId.textContent = "RIO-000000000";

    scanStampCount.textContent = "0 / 6";

    todayStatus.textContent = "Not Scanned";

    todayStatus.className = "pending";

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

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            if (html5QrCode && scannerRunning) {

                await html5QrCode.stop();

            }

        }

        catch (e) {}

        await signOut(auth);

        location.href = "admin-login.html";

    });

}

// =====================================================
// ===================================================== // SIDEBAR MENU // =====================================================  const scannerMenu = document.getElementById("scannerMenu"); const exportBtn = document.getElementById("exportBtn"); const rewardBtn = document.getElementById("rewardBtn"); const settingsBtn = document.getElementById("settingsBtn");  if (scannerMenu) {      scannerMenu.addEventListener("click", () => {          document.querySelector(".dashboard-section")             ?.scrollIntoView({                 behavior: "smooth"             });      });  }  if (exportBtn) {      exportBtn.addEventListener("click", () => {          alert("📄 Export Feature Coming Soon");      });  }  if (rewardBtn) {      rewardBtn.addEventListener("click", () => {          location.href = "reward.html";      });  }  if (settingsBtn) {      settingsBtn.addEventListener("click", () => {          alert("⚙️ Settings Coming Soon");      });  }
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Premium Admin Dashboard Ready");

console.log("QR Scanner Ready");

console.log("================================");
