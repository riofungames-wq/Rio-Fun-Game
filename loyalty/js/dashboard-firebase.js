// ======================================
// RIO LOYALTY CLUB
// DASHBOARD FIREBASE
// PART 1
// ======================================

import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {

getAuth,

onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {

getFirestore,

doc,

getDoc

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// --------------------------------------
// Firebase Initialize
// --------------------------------------

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);
// ======================================
// PART 2
// LOAD CURRENT USER
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    try {

        // Firestore से Customer Data

        const userRef = doc(db, "customers", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            alert("Customer record not found.");

            return;

        }

        const customer = userSnap.data();

        // Global Variable

        window.currentUser = customer;

        // Dashboard.js को Data Update करने दो

        window.dispatchEvent(

            new CustomEvent("dashboard-ready")

        );

    }

    catch(error){

        console.error("Dashboard Error :", error);

        alert("Unable to load your profile.");

    }

});
// ======================================
// PART 3
// DASHBOARD READY EVENT
// ======================================

window.addEventListener("dashboard-ready", () => {

    const customer = window.currentUser;

    if (!customer) return;

    // Name
    const customerName = document.getElementById("customerName");
    if (customerName) {
        customerName.textContent = customer.name;
    }

    // Member ID
    const memberId = document.getElementById("memberId");
    if (memberId) {
        memberId.textContent = "Member ID : " + customer.memberId;
    }

    // Avatar
    const avatar = document.getElementById("customerAvatar");
    if (avatar && customer.avatar) {
        avatar.src = customer.avatar;
    }

    // dashboard.js में मौजूद Function को Call करो
    if (typeof updateStamps === "function") {
        updateStamps(customer.stamps || 0);
    }

});
