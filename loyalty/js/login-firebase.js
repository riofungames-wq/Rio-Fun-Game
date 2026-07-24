// ======================================
// RIO LOYALTY CLUB
// LOGIN FIREBASE
// PART 1
// ======================================

import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword
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
// LOGIN EVENT
// ======================================

document.addEventListener("login-ready", async () => {

    const data = window.loginData;

    if (!data) {
        alert("Login data not found.");
        return;
    }

    try {

        // --------------------------------------
        // Firebase Authentication Login
        // --------------------------------------

        const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        const user = userCredential.user;

        // --------------------------------------
        // Read Customer Data
        // --------------------------------------

        const userRef = doc(db, "customers", user.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            alert("Customer record not found.");

            return;

        }

        // --------------------------------------
        // Save User Data
        // --------------------------------------

        window.currentUser = userSnap.data();
      // ======================================
// PART 3
// LOGIN SUCCESS + ERROR HANDLING
// ======================================

        // --------------------------------------
        // Login Success
        // --------------------------------------

        alert("🎉 Login Successful!");

        if (typeof window.loginSuccess === "function") {

            window.loginSuccess();

        } else {

            window.location.href = "dashboard.html";

        }

    } catch (error) {

        console.error("Login Error:", error);

        switch (error.code) {

            case "auth/user-not-found":
                alert("No account found with this email.");
                break;

            case "auth/invalid-credential":
                alert("Incorrect email or password.");
                break;

            case "auth/wrong-password":
                alert("Incorrect email or password.");
                break;

            case "auth/invalid-email":
                alert("Invalid email address.");
                break;

            case "auth/network-request-failed":
                alert("No internet connection.");
                break;

            case "auth/too-many-requests":
                alert("Too many failed attempts. Please try again later.");
                break;

            default:
                alert("Login Failed: " + error.message);

        }

    }

});
