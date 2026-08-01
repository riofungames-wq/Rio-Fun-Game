// =====================================================
// RIO MAGGI POINT
// CUSTOMER LOGIN
// FINAL FIXED VERSION
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// HTML ELEMENTS
// =====================================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const togglePassword =
    document.getElementById("togglePassword");

const forgotPassword =
    document.getElementById("forgotPassword");


// =====================================================
// BUTTON CONTROL
// =====================================================

function disableLoginButton() {

    if (!loginBtn) {
        return;
    }

    loginBtn.disabled = true;

    loginBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        &nbsp;
        Signing In...
    `;
}


function enableLoginButton() {

    if (!loginBtn) {
        return;
    }

    loginBtn.disabled = false;

    loginBtn.innerHTML = `
        <i class="fa-solid fa-right-to-bracket"></i>
        &nbsp;
        Login
    `;
}


// =====================================================
// AUTO LOGIN CHECK
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {
            return;
        }

        try {

            const customerRef =
                doc(
                    db,
                    "customers",
                    user.uid
                );

            const customerSnap =
                await getDoc(customerRef);

            if (!customerSnap.exists()) {
                return;
            }

            const customer =
                customerSnap.data();

            if (
                customer.status === "blocked"
            ) {

                console.warn(
                    "Blocked customer attempted auto login."
                );

                return;
            }

            window.location.href =
                "card.html";

        }

        catch (error) {

            console.error(
                "Auto Login Error:",
                error
            );

        }

    }
);


// =====================================================
// LOGIN FUNCTION
// =====================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            // =================================================
            // BASIC VALIDATION
            // =================================================

            if (!email || !password) {

                alert(
                    "Please enter Email and Password."
                );

                return;
            }


            disableLoginButton();


            try {

                // =================================================
                // FIREBASE LOGIN
                // =================================================

                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                // =================================================
                // CUSTOMER DATA CHECK
                // =================================================

                const customerRef =
                    doc(
                        db,
                        "customers",
                        user.uid
                    );


                const customerSnap =
                    await getDoc(
                        customerRef
                    );


                if (
                    !customerSnap.exists()
                ) {

                    alert(
                        "Customer record not found. Please contact Rio Maggi Point."
                    );

                    return;
                }


                const customer =
                    customerSnap.data();


                // =================================================
                // ACCOUNT STATUS CHECK
                // =================================================

                if (
                    customer.status === "blocked"
                ) {

                    alert(
                        "Your account has been blocked."
                    );

                    return;
                }


                if (
                    customer.status === "suspended"
                ) {

                    alert(
                        "Your account has been suspended."
                    );

                    return;
                }


                // =================================================
                // SAVE CUSTOMER DATA
                // =================================================

                window.currentUser =
                    customer;


                window.currentRioUser =
                    user;


                // =================================================
                // DIRECT LOGIN SUCCESS
                // =================================================

                window.location.href =
                    "card.html";

            }


            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                let message =
                    "Login Failed. Please try again.";


                switch (error.code) {

                    case "auth/invalid-credential":

                        message =
                            "Invalid Email or Password.";

                        break;


                    case "auth/user-not-found":

                        message =
                            "No account found with this email.";

                        break;


                    case "auth/wrong-password":

                        message =
                            "Invalid Email or Password.";

                        break;


                    case "auth/user-disabled":

                        message =
                            "This account has been disabled.";

                        break;


                    case "auth/too-many-requests":

                        message =
                            "Too many login attempts. Please try again later.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "No Internet Connection.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Invalid Email Address.";

                        break;

                }


                alert(message);

            }


            finally {

                enableLoginButton();

            }

        }
    );

}


// =====================================================
// PASSWORD SHOW / HIDE
// =====================================================

if (
    togglePassword &&
    passwordInput
) {

    const togglePasswordVisibility =
        () => {

            const isPassword =
                passwordInput.type === "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            togglePassword.innerHTML =
                isPassword
                    ? `<i class="fa-solid fa-eye-slash"></i>`
                    : `<i class="fa-solid fa-eye"></i>`;


            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        };


    togglePassword.addEventListener(
        "click",
        togglePasswordVisibility
    );


    togglePassword.addEventListener(
        "keydown",
        (e) => {

            if (
                e.key === "Enter" ||
                e.key === " "
            ) {

                e.preventDefault();

                togglePasswordVisibility();

            }

        }
    );

}


// =====================================================
// FORGOT PASSWORD
// =====================================================

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async (e) => {

            e.preventDefault();


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (!email) {

                alert(
                    "Please enter your email address first."
                );

                if (emailInput) {

                    emailInput.focus();

                }

                return;
            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                alert(
                    "Password reset email sent. Please check your inbox."
                );

            }


            catch (error) {

                console.error(
                    "Password Reset Error:",
                    error
                );


                let message =
                    "Unable to send password reset email.";


                switch (error.code) {

                    case "auth/user-not-found":

                        message =
                            "No account found with this email.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Invalid Email Address.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "No Internet Connection.";

                        break;

                }


                alert(message);

            }

        }
    );

}


// =====================================================
// ENTER KEY LOGIN
// =====================================================

[
    emailInput,
    passwordInput

].forEach(

    (input) => {

        if (!input) {
            return;
        }


        input.addEventListener(
            "keydown",
            (e) => {

                if (
                    e.key === "Enter"
                ) {

                    e.preventDefault();

                    if (loginForm) {

                        loginForm.requestSubmit();

                    }

                }

            }
        );

    }

);


// =====================================================
// INTERNET STATUS
// =====================================================

window.addEventListener(
    "online",
    () => {

        console.log(
            "Internet Connected"
        );

    }
);


window.addEventListener(
    "offline",
    () => {

        alert(
            "No Internet Connection."
        );

    }
);


// =====================================================
// READY LOG
// =====================================================

console.log(
    "===================================="
);

console.log(
    "🍜 Rio Maggi Point"
);

console.log(
    "Customer Login Ready"
);

console.log(
    "Firebase Authentication Connected"
);

console.log(
    "Firestore Connected"
);

console.log(
    "Remember Me Removed"
);

console.log(
    "Direct Login Enabled"
);

console.log(
    "===================================="
);
