// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN LOGIN
// FIREBASE AUTHENTICATION
// ADMIN-LOGIN.JS
// CLEAN & FIXED VERSION
// =====================================================


// =====================================================
// FIREBASE CONFIG
// =====================================================

import {
    auth
} from "./firebase-config.js";


// =====================================================
// FIREBASE AUTH SDK
// =====================================================

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


// =====================================================
// ADMIN DASHBOARD PAGE
// =====================================================

const ADMIN_DASHBOARD_PAGE =
    "./admin-dashboard.html";


// =====================================================
// DOM ELEMENTS
// =====================================================

const loginForm =
    document.getElementById(
        "adminLoginForm"
    );


const emailInput =
    document.getElementById(
        "adminEmail"
    );


const passwordInput =
    document.getElementById(
        "adminPassword"
    );


const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const togglePassword =
    document.getElementById(
        "togglePassword"
    );


const loginError =
    document.getElementById(
        "loginError"
    );


// =====================================================
// PASSWORD SHOW / HIDE
// =====================================================

togglePassword?.addEventListener(
    "click",
    () => {

        if (!passwordInput) {
            return;
        }


        if (
            passwordInput.type ===
            "password"
        ) {

            passwordInput.type =
                "text";


            togglePassword.innerHTML =
                `<i class="fa-solid fa-eye-slash"></i>`;

        }

        else {

            passwordInput.type =
                "password";


            togglePassword.innerHTML =
                `<i class="fa-solid fa-eye"></i>`;

        }

    }
);


// =====================================================
// ERROR MESSAGE
// =====================================================

function showError(
    message
) {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        message;


    loginError.style.display =
        "block";

}


function hideError() {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        "";


    loginError.style.display =
        "none";

}


// =====================================================
// LOGIN BUTTON STATE
// =====================================================

function setLoginButtonLoading(
    isLoading
) {

    if (!loginBtn) {
        return;
    }


    if (isLoading) {

        loginBtn.disabled =
            true;


        loginBtn.innerHTML =
            `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Checking...</span>
            `;

    }

    else {

        loginBtn.disabled =
            false;


        loginBtn.innerHTML =
            `
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Login Dashboard</span>
            `;

    }

}


// =====================================================
// FIREBASE AUTH ERROR MESSAGE
// =====================================================

function getLoginErrorMessage(
    error
) {

    if (!error) {

        return (
            "Unable to login. Please try again."
        );

    }


    console.error(
        "Firebase Login Error Code:",
        error.code
    );


    console.error(
        "Firebase Login Error Message:",
        error.message
    );


    switch (
        error.code
    ) {

        case "auth/invalid-email":

            return (
                "Please enter a valid email address."
            );


        case "auth/user-not-found":

            return (
                "No admin account found with this email."
            );


        case "auth/wrong-password":

            return (
                "Incorrect password."
            );


        case "auth/invalid-credential":

            return (
                "Invalid email or password."
            );


        case "auth/user-disabled":

            return (
                "This admin account has been disabled."
            );


        case "auth/too-many-requests":

            return (
                "Too many login attempts. Please try again later."
            );


        case "auth/network-request-failed":

            return (
                "Network error. Please check your internet connection."
            );


        case "auth/operation-not-allowed":

            return (
                "Email/password login is not enabled in Firebase Authentication."
            );


        default:

            return (
                error.message ||
                "Unable to login. Please try again."
            );

    }

}


// =====================================================
// LOGIN SUBMIT
// =====================================================

loginForm?.addEventListener(
    "submit",
    async (
        event
    ) => {

        event.preventDefault();


        hideError();


        if (
            !emailInput ||
            !passwordInput
        ) {

            showError(
                "Login form fields are missing."
            );

            return;

        }


        const email =
            emailInput.value
                .trim();


        const password =
            passwordInput.value;


        // ---------------------------------------------
        // BASIC VALIDATION
        // ---------------------------------------------

        if (
            !email ||
            !password
        ) {

            showError(
                "Please enter email and password."
            );

            return;

        }


        // ---------------------------------------------
        // EMAIL FORMAT CHECK
        // ---------------------------------------------

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                email
            )
        ) {

            showError(
                "Please enter a valid email address."
            );

            emailInput.focus();

            return;

        }


        // ---------------------------------------------
        // START LOGIN
        // ---------------------------------------------

        setLoginButtonLoading(
            true
        );


        try {

            const userCredential =

                await signInWithEmailAndPassword(

                    auth,

                    email,

                    password

                );


            const user =
                userCredential.user;


            console.log(
                "✅ Admin Login Successful"
            );


            console.log(
                "Admin UID:",
                user.uid
            );


            console.log(
                "Admin Email:",
                user.email
            );


            // -----------------------------------------
            // REDIRECT TO ADMIN DASHBOARD
            // -----------------------------------------

            window.location.replace(
                ADMIN_DASHBOARD_PAGE
            );

        }

        catch (
            error
        ) {

            console.error(
                "❌ Admin Login Failed:",
                error
            );


            showError(
                getLoginErrorMessage(
                    error
                )
            );


            setLoginButtonLoading(
                false
            );

        }

    }
);


// =====================================================
// AUTH SESSION CHECK
// =====================================================

onAuthStateChanged(

    auth,

    user => {

        if (!user) {

            console.log(
                "ℹ️ No active admin session."
            );

            return;

        }


        console.log(
            "✅ Active Firebase Session:",
            user.email
        );

    }

);


// =====================================================
// ENTER KEY SUPPORT
// =====================================================
// The form submit event already handles Enter.
// No additional keypress listener is required.
// This prevents duplicate login submissions.
// =====================================================


// =====================================================
// PAGE READY
// =====================================================

console.log(
    "================================"
);


console.log(
    "🍜 RIO MAGGI POINT"
);


console.log(
    "✅ Premium Admin Login Ready"
);


console.log(
    "✅ Firebase Authentication Connected"
);


console.log(
    "================================"
);
