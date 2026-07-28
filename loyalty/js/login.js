// =====================================================
// RIO MAGGI POINT
// CUSTOMER LOGIN
// VERSION 5.0
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
// DOM ELEMENTS
// =====================================================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");

const togglePassword = document.getElementById("togglePassword");

const forgotPassword = document.getElementById("forgotPassword");

const rememberMe = document.getElementById("rememberMe");

// =====================================================
// AUTO LOGIN
// =====================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) return;

    try {

        const customerRef = doc(db, "customers", user.uid);

        const customerSnap = await getDoc(customerRef);

        if (customerSnap.exists()) {

            window.location.href = "card.html";

        }

    } catch (error) {

        console.error("Auto Login Error :", error);

    }

});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function disableLoginButton() {

    loginBtn.disabled = true;

    loginBtn.innerHTML =
        `<i class="fa-solid fa-spinner fa-spin"></i> Signing In...`;

}

function enableLoginButton() {

    loginBtn.disabled = false;

    loginBtn.innerHTML =
        `<i class="fa-solid fa-right-to-bracket"></i> Login`;

}

console.log("Rio Login JS Loaded");
// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    if (!email || !password) {

        alert("Please enter Email and Password.");

        return;

    }

    disableLoginButton();

    try {

        // Firebase Authentication Login

        const credential = await signInWithEmailAndPassword(

            auth,

            email,

            password

        );

        const user = credential.user;

        // Read Customer Document

        const customerRef = doc(

            db,

            "customers",

            user.uid

        );

        const customerSnap = await getDoc(customerRef);

        if (!customerSnap.exists()) {

            alert("Customer record not found.");

            enableLoginButton();

            return;

        }

        const customer = customerSnap.data();

        // Account Status Check

        if (customer.status === "blocked") {

            alert("Your account has been blocked.");

            enableLoginButton();

            return;

        }

        // Optional Remember Me

        if (rememberMe.checked) {

            localStorage.setItem(

                "rioRememberEmail",

                email

            );

        } else {

            localStorage.removeItem(

                "rioRememberEmail"

            );

        }

        // Success

        alert(`Welcome ${customer.name}!`);

        window.location.href = "card.html";

    }

    catch (error) {

        console.error("Login Error :", error);

        let message = "Login Failed";

        switch (error.code) {

            case "auth/invalid-credential":
                message = "Invalid Email or Password";
                break;

            case "auth/user-disabled":
                message = "This account has been disabled";
                break;

            case "auth/too-many-requests":
                message = "Too many attempts. Try again later.";
                break;

            case "auth/network-request-failed":
                message = "No Internet Connection";
                break;

            case "auth/invalid-email":
                message = "Invalid Email Address";
                break;

        }

        alert(message);

    }

    finally {

        enableLoginButton();

    }

});
// =====================================================
// PASSWORD SHOW / HIDE
// =====================================================

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

        } else {

            passwordInput.type = "password";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

        }

    });

}

// =====================================================
// FORGOT PASSWORD
// =====================================================

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

[emailInput, passwordInput].forEach(input => {

    input?.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {

            loginForm.requestSubmit();

        }

    });

});

// =====================================================
// REMEMBER EMAIL
// =====================================================

window.addEventListener("load", () => {

    const savedEmail =
        localStorage.getItem("rioRememberEmail");

    if (savedEmail) {

        emailInput.value = savedEmail;

        rememberMe.checked = true;

    }

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

        }

    }

    catch (error) {

        console.error(error);

    }

});

// =====================================================
// CONNECTION CHECK
// =====================================================

window.addEventListener("online", () => {

    console.log("Internet Connected");

});

window.addEventListener("offline", () => {

    alert("No Internet Connection");

});

// =====================================================
// READY
// =====================================================

console.log("====================================");

console.log("🍜 Rio Maggi Point");

console.log("Customer Login Ready");

console.log("Firebase Authentication Connected");

console.log("Firestore Connected");

console.log("Version 5.0");

console.log("====================================");
