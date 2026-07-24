// ======================================
// RIO LOYALTY CLUB
// SIGNUP FIREBASE
// PART 1
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

// ---------- Initialize ----------

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);
// ======================================
// PART 2
// LISTEN FOR SIGNUP EVENT
// ======================================

document.addEventListener("signup-ready", async () => {

    const data = window.signupData;

    if (!data) {
        alert("Signup data not found.");
        return;
    }

    try {

        // Create Authentication Account
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        const user = userCredential.user;

        // Update Display Name
        await updateProfile(user, {
            displayName: data.name
        });

        // आगे Firestore में Save करेंगे...

    } catch (error) {

        alert(error.message);
        console.error(error);

    }

});
// ======================================
// PART 3
// SAVE USER TO FIRESTORE
// ======================================

        await setDoc(doc(db, "users", user.uid), {

            uid: user.uid,

            name: data.name,

            mobile: data.mobile,

            email: data.email,

            gender: data.gender,

            avatar: data.avatar,

            stamps: 0,

            rewardClaimed: false,

            createdAt: serverTimestamp()

        });

        alert("🎉 Account Created Successfully!");

        window.location.href = "login.html";
