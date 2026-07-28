// =====================================================
// RIO MAGGI POINT
// CUSTOMER LOGIN
// PART 1 / 4
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// DOM
// =====================================================

const loginForm =
document.getElementById("loginForm");

const email =
document.getElementById("email");

const password =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

const togglePassword =
document.getElementById("togglePassword");

// =====================================================
// AUTO LOGIN
// =====================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) return;

    try {

        const customerRef =
        doc(db, "customers", user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if (customerSnap.exists()) {

            window.location.href = "card.html";

        }

    }

    catch (error) {

        console.error(error);

    }

});
// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const userEmail =
        email.value.trim();

    const userPassword =
        password.value.trim();

    if (!userEmail || !userPassword) {

        alert("Please enter Email and Password.");

        return;

    }

    loginBtn.disabled = true;

    loginBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Signing In...';

    try {

        // Firebase Login
        const credential =
            await signInWithEmailAndPassword(
                auth,
                userEmail,
                userPassword
            );

        const uid =
            credential.user.uid;

        // Customer Data
        const customerRef =
            doc(db, "customers", uid);

        const customerSnap =
            await getDoc(customerRef);

        if (!customerSnap.exists()) {

            alert("Customer record not found.");

            loginBtn.disabled = false;
            loginBtn.innerHTML = "Login";

            return;

        }

        const customer =
            customerSnap.data();

        // Blocked Account
        if (customer.status === "blocked") {

            alert("Your account has been blocked.");

            loginBtn.disabled = false;
            loginBtn.innerHTML = "Login";

            return;

        }

        // Success
        alert(`Welcome ${customer.name}!`);

        window.location.href = "card.html";

    }

    catch (error) {

        console.error(error);

        let message = "Login Failed";

        switch (error.code) {

            case "auth/invalid-credential":
                message = "Invalid Email or Password";
                break;

            case "auth/user-disabled":
                message = "Your account has been disabled";
                break;

            case "auth/too-many-requests":
                message = "Too many attempts. Try again later.";
                break;

            case "auth/network-request-failed":
                message = "No Internet Connection";
                break;

        }

        alert(message);

    }

    finally {

        loginBtn.disabled = false;

        loginBtn.innerHTML =
            '<i class="fa-solid fa-right-to-bracket"></i> Login';

    }

});
// =====================================================
// PASSWORD SHOW / HIDE
// =====================================================

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (password.type === "password") {

            password.type = "text";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

        } else {

            password.type = "password";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

        }

    });

}

// =====================================================
// FORGOT PASSWORD
// =====================================================

const forgotPassword =
document.getElementById("forgotPassword");

if (forgotPassword) {

    forgotPassword.addEventListener("click", (e) => {

        e.preventDefault();

        window.location.href =
        "forgot-password.html";

    });

}

// =====================================================
// ENTER KEY SUPPORT
// =====================================================

[email, password].forEach(input => {

    input?.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {

            loginForm.requestSubmit();

        }

    });

});
// =====================================================
// WINDOW FOCUS CHECK
// =====================================================

window.addEventListener("focus", async () => {

    if (!auth.currentUser) return;

    try {

        const customerRef =
            doc(db, "customers", auth.currentUser.uid);

        const customerSnap =
            await getDoc(customerRef);

        if (!customerSnap.exists()) {

            alert("Customer record no longer exists.");

            return;

        }

    }

    catch (error) {

        console.error(error);

    }

});

// =====================================================
// READY
// =====================================================

console.log("====================================");
console.log("🍜 Rio Maggi Point");
console.log("Customer Login Ready");
console.log("Firebase Authentication Connected");
console.log("Firestore Connected");
console.log("====================================");
