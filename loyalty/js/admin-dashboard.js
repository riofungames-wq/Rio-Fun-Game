// ======================================
// RIO MAGGI POINT
// ADMIN DASHBOARD
// PART 1
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
// FIREBASE INITIALIZE
// ======================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// ======================================
// HTML ELEMENTS
// ======================================

const adminName = document.getElementById("adminName");

const totalCustomers = document.getElementById("totalCustomers");

const totalStamps = document.getElementById("totalStamps");

const rewardUnlocked = document.getElementById("rewardUnlocked");

const rewardRedeemed = document.getElementById("rewardRedeemed");

const customerTable = document.getElementById("customerTable");

const firebaseStatus = document.getElementById("firebaseStatus");

const adminStatus = document.getElementById("adminStatus");

const lastRefresh = document.getElementById("lastRefresh");

const logoutBtn = document.getElementById("logoutBtn");
// ======================================
// PART 2
// CHECK ADMIN LOGIN
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "admin-login.html";
        return;

    }

    try {

        firebaseStatus.textContent = "Connected";
        adminStatus.textContent = "Verified";

        // Admin Document Read

        const adminRef = doc(db, "admins", user.uid);

        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {

            alert("Access Denied");

            await signOut(auth);

            window.location.href = "admin-login.html";

            return;

        }

        const admin = adminSnap.data();

        adminName.textContent = admin.name || "Admin";

        loadDashboard();

    }

    catch (error) {

        console.error(error);

        firebaseStatus.textContent = "Error";

        adminStatus.textContent = "Failed";

    }

});

// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

    lastRefresh.textContent =
        new Date().toLocaleString();

    const snapshot =
        await getDocs(collection(db, "customers"));

    totalCustomers.textContent =
        snapshot.size;

}
// ======================================
// PART 3
// LOAD CUSTOMER TABLE
// ======================================

async function loadDashboard() {

    lastRefresh.textContent =
        new Date().toLocaleString();

    const snapshot =
        await getDocs(collection(db, "customers"));

    totalCustomers.textContent = snapshot.size;

    customerTable.innerHTML = "";

    let stampCount = 0;
    let unlockedCount = 0;
    let redeemedCount = 0;

    snapshot.forEach((docSnap) => {

        const customer = docSnap.data();

        stampCount += customer.stamps || 0;

        if (customer.rewardUnlocked)
            unlockedCount++;

        if (customer.rewardRedeemed)
            redeemedCount++;

        customerTable.innerHTML += `

        <tr>

            <td>${customer.name || "-"}</td>

            <td>${customer.mobile || "-"}</td>

            <td>${customer.memberId || "-"}</td>

            <td>${customer.stamps || 0}</td>

            <td>

                ${customer.rewardUnlocked ? "🎁 Unlocked" : "❌ Locked"}

            </td>

            <td>

                <button
                    class="viewBtn"
                    data-id="${docSnap.id}"
                >

                    View

                </button>

            </td>

        </tr>

        `;

    });

    totalStamps.textContent = stampCount;

    rewardUnlocked.textContent = unlockedCount;

    rewardRedeemed.textContent = redeemedCount;

}
// ======================================
// PART 4
// LOGOUT + REFRESH + SEARCH
// ======================================

// Logout
logoutBtn.addEventListener("click", async () => {

    const ok = confirm("Are you sure you want to Logout?");

    if (!ok) return;

    try {

        await signOut(auth);

        window.location.href = "admin-login.html";

    } catch (error) {

        console.error(error);

        alert("Logout Failed");

    }

});

// Refresh Dashboard
const refreshBtn = document.getElementById("refreshDataBtn");

if (refreshBtn) {

    refreshBtn.addEventListener("click", () => {

        loadDashboard();

    });

}

// Search Customer
const searchInput = document.getElementById("searchCustomer");

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

// Firebase Connected
firebaseStatus.textContent = "Connected";
// ======================================
// PART 5 (FINAL)
// CUSTOMER DETAILS + FINISH
// ======================================

// View Customer Details
customerTable.addEventListener("click", async (event) => {

    if (!event.target.classList.contains("viewBtn")) return;

    const customerId = event.target.dataset.id;

    try {

        const customerRef = doc(db, "customers", customerId);

        const customerSnap = await getDoc(customerRef);

        if (!customerSnap.exists()) {

            alert("Customer not found.");

            return;

        }

        const customer = customerSnap.data();

        const customerInfo = document.getElementById("customerInfo");

        customerInfo.innerHTML = `

            <p><strong>Name:</strong> ${customer.name || "-"}</p>

            <p><strong>Mobile:</strong> ${customer.mobile || "-"}</p>

            <p><strong>Email:</strong> ${customer.email || "-"}</p>

            <p><strong>Member ID:</strong> ${customer.memberId || "-"}</p>

            <p><strong>Gender:</strong> ${customer.gender || "-"}</p>

            <p><strong>Stamps:</strong> ${customer.stamps || 0}</p>

            <p><strong>Reward Unlocked:</strong> ${customer.rewardUnlocked ? "Yes" : "No"}</p>

            <p><strong>Reward Redeemed:</strong> ${customer.rewardRedeemed ? "Yes" : "No"}</p>

        `;

        document.getElementById("customerModal").style.display = "block";

    }

    catch (error) {

        console.error(error);

        alert("Unable to load customer details.");

    }

});

// Close Modal
const closeModal = document.querySelector(".closeModal");

if (closeModal) {

    closeModal.addEventListener("click", () => {

        document.getElementById("customerModal").style.display = "none";

    });

}

window.addEventListener("click", (event) => {

    const modal = document.getElementById("customerModal");

    if (event.target === modal) {

        modal.style.display = "none";

    }

});

console.log("✅ Rio Maggi Admin Dashboard Loaded Successfully");
