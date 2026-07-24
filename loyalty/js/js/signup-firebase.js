// ======================================
// RIO LOYALTY CLUB
// SIGNUP FIREBASE
// FINAL VERSION
// PART 1 / 2
// ======================================

import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// --------------------------------------
// Firebase Initialize
// --------------------------------------

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// --------------------------------------
// Listen Signup Event
// --------------------------------------

document.addEventListener("signup-ready", async () => {

    const data = window.signupData;

    if (!data) {

        alert("Signup data not found.");

        return;

    }

    try {

        // Create Authentication Account

        const userCredential =
        await createUserWithEmailAndPassword(

            auth,

            data.email,

            data.password

        );

        const user = userCredential.user;

        // Update Firebase Profile

        await updateProfile(user, {

            displayName: data.name

        });

        // Generate Member ID

        const memberId = "RIO-" + Date.now();
                // --------------------------------------
        // Save Customer Data
        // --------------------------------------

        await setDoc(doc(db, "customers", user.uid), {

            uid: user.uid,

            memberId: memberId,

            name: data.name,

            mobile: data.mobile,

            email: data.email,

            gender: data.gender,

            avatar: data.avatar,

            stamps: 0,

            rewardClaimed: false,

            status: "active",

            createdAt: serverTimestamp()

        });

        // --------------------------------------
        // Success
        // --------------------------------------

        alert("🎉 Account Created Successfully!");

        window.location.href = "login.html";

    }

    catch (error) {

        console.error("Signup Error :", error);

        switch (error.code) {

            case "auth/email-already-in-use":

                alert("This email is already registered.");

                break;

            case "auth/invalid-email":

                alert("Invalid email address.");

                break;

            case "auth/weak-password":

                alert("Password must be at least 6 characters.");

                break;

            case "auth/network-request-failed":

                alert("No internet connection.");

                break;

            default:

                alert("Signup Failed : " + error.message);

        }

    }

});
