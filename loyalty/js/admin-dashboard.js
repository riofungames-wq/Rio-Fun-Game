// ======================================
// RIO MAGGI POINT
// ADMIN DASHBOARD
// CLEAN VERSION - PART 1
// ======================================

import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ======================================
// FIREBASE
// ======================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// ======================================
// HTML ELEMENTS
// ======================================

const adminName =
document.getElementById("adminName");

const totalCustomers =
document.getElementById("totalCustomers");

const totalStamps =
document.getElementById("totalStamps");

const rewardUnlocked =
document.getElementById("rewardUnlocked");

const rewardRedeemed =
document.getElementById("rewardRedeemed");

const customerTable =
document.getElementById("customerTable");

const firebaseStatus =
document.getElementById("firebaseStatus");

const adminStatus =
document.getElementById("adminStatus");

const lastRefresh =
document.getElementById("lastRefresh");

const logoutBtn =
document.getElementById("logoutBtn");

const refreshBtn =
document.getElementById("refreshDataBtn");

const searchInput =
document.getElementById("searchCustomer");

const customerModal =
document.getElementById("customerModal");

const customerInfo =
document.getElementById("customerInfo");

const closeModal =
document.querySelector(".closeModal");

// ======================================
// AUTH CHECK
// ======================================

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        location.href="admin-login.html";

        return;

    }

    try{

        firebaseStatus.textContent="Connected";

        const adminRef=doc(db,"admins",user.uid);

        const adminSnap=await getDoc(adminRef);

        if(!adminSnap.exists()){

            alert("Access Denied");

            await signOut(auth);

            location.href="admin-login.html";

            return;

        }

        const admin=adminSnap.data();

        adminName.textContent=admin.name || "Admin";

        adminStatus.textContent="Verified";

        loadDashboard();

    }

    catch(error){

        console.error(error);

        firebaseStatus.textContent="Error";

        adminStatus.textContent="Failed";

    }

});
// ======================================
// CLEAN VERSION - PART 2
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

    lastRefresh.textContent =
        new Date().toLocaleString();

    const snapshot =
        await getDocs(collection(db, "customers"));

    customerTable.innerHTML = "";

    let totalStampCount = 0;
    let unlockedCount = 0;
    let redeemedCount = 0;

    totalCustomers.textContent = snapshot.size;

    snapshot.forEach((customerDoc) => {

        const customer = customerDoc.data();

        const id = customerDoc.id;

        totalStampCount += customer.stamps || 0;

        if (customer.rewardUnlocked === true)
            unlockedCount++;

        if (customer.rewardRedeemed === true)
            redeemedCount++;

        customerTable.innerHTML += `

        <tr>

            <td>${customer.name || "-"}</td>

            <td>${customer.mobile || "-"}</td>

            <td>${customer.memberId || "-"}</td>

            <td>${customer.stamps || 0}</td>

            <td>

                ${customer.rewardUnlocked
                    ? "🎁 Unlocked"
                    : "❌ Locked"}

            </td>

            <td>

                <button
                    class="viewBtn"
                    data-id="${id}"
                >

                    View

                </button>

            </td>

        </tr>

        `;

    });

    totalStamps.textContent = totalStampCount;

    rewardUnlocked.textContent = unlockedCount;

    rewardRedeemed.textContent = redeemedCount;

}
// ======================================
// CLEAN VERSION - PART 3
// SEARCH + REFRESH + LOGOUT + MODAL
// ======================================

// Refresh Dashboard
if (refreshBtn) {

    refreshBtn.addEventListener("click", () => {

        loadDashboard();

    });

}

// Search Customer
if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        const value = searchInput.value.toLowerCase();

        const rows = customerTable.querySelectorAll("tr");

        rows.forEach((row) => {

            row.style.display =
                row.innerText.toLowerCase().includes(value)
                    ? ""
                    : "none";

        });

    });

}

// Logout
if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        const ok = confirm("Logout from Admin Panel?");

        if (!ok) return;

        try {

            await signOut(auth);

            location.href = "admin-login.html";

        }

        catch (error) {

            console.error(error);

            alert("Logout Failed");

        }

    });

}

// View Customer Details
customerTable.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("viewBtn"))
        return;

    const customerId = event.target.dataset.id;

    try {

        const customerRef =
            doc(db, "customers", customerId);

        const customerSnap =
            await getDoc(customerRef);

        if (!customerSnap.exists()) {

            alert("Customer not found");

            return;

        }

        const customer = customerSnap.data();

        customerInfo.innerHTML = `

            <p><strong>Name :</strong> ${customer.name || "-"}</p>

            <p><strong>Mobile :</strong> ${customer.mobile || "-"}</p>

            <p><strong>Email :</strong> ${customer.email || "-"}</p>

            <p><strong>Member ID :</strong> ${customer.memberId || "-"}</p>

            <p><strong>Gender :</strong> ${customer.gender || "-"}</p>

            <p><strong>Stamps :</strong> ${customer.stamps || 0}</p>

            <p><strong>Reward Unlocked :</strong>

                ${customer.rewardUnlocked ? "Yes" : "No"}

            </p>

            <p><strong>Reward Redeemed :</strong>

                ${customer.rewardRedeemed ? "Yes" : "No"}

            </p>

        `;

        customerModal.style.display = "block";

    }

    catch (error) {

        console.error(error);

        alert("Unable to load customer.");

    }

});
// ======================================
// CLEAN VERSION - PART 4 (FINAL)
// MODAL + FINISH
// ======================================

// Close Modal Button
if (closeModal) {

    closeModal.addEventListener("click", () => {

        customerModal.style.display = "none";

    });

}

// Close Modal on Outside Click
window.addEventListener("click", (event) => {

    if (event.target === customerModal) {

        customerModal.style.display = "none";

    }

});

// ======================================
// EXPORT BUTTON (TEMP)
// ======================================

const exportBtn = document.getElementById("exportBtn");

if (exportBtn) {

    exportBtn.addEventListener("click", () => {

        alert("Export feature will be added soon.");

    });

}

// ======================================
// REWARD LIST BUTTON (TEMP)
// ======================================

const rewardListBtn = document.getElementById("rewardListBtn");

if (rewardListBtn) {

    rewardListBtn.addEventListener("click", () => {

        alert("Reward List feature coming soon.");

    });

}

// ======================================
// SETTINGS BUTTON (TEMP)
// ======================================

const settingsBtn = document.getElementById("settingsBtn");

if (settingsBtn) {

    settingsBtn.addEventListener("click", () => {

        alert("Settings panel coming soon.");

    });

}

// ======================================
// STARTUP COMPLETE
// ======================================

console.clear();

console.log("===================================");

console.log("RIO MAGGI POINT");

console.log("ADMIN DASHBOARD LOADED SUCCESSFULLY");

console.log("===================================");
