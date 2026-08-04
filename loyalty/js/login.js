// =====================================================
// RIO MAGGI POINT
// CUSTOMER LOGIN
// FINAL FIXED CENTRAL APP INTEGRATION
// =====================================================


// =====================================================
// CENTRAL APP IMPORT
// =====================================================

import {
    auth,
    db,
    waitForAuth
} from "./app.js";


// =====================================================
// FIREBASE AUTH IMPORTS
// SAME VERSION AS app.js
// =====================================================

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================================
// FIRESTORE IMPORTS
// =====================================================

import {
    doc,
    getDoc
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


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
// LOGIN PROCESS CONTROL
// =====================================================

let isLoginProcessing = false;


// =====================================================
// BUTTON LOADING
// =====================================================

function setLoginLoading(
    loading
) {

    if (!loginBtn) {
        return;
    }


    loginBtn.disabled =
        loading;


    if (loading) {

        loginBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            &nbsp;
            Signing In...
        `;

    } else {

        loginBtn.innerHTML = `
            <i class="fa-solid fa-right-to-bracket"></i>
            &nbsp;
            Login
        `;

    }

}


// =====================================================
// GET CUSTOMER PROFILE
// =====================================================

async function getCustomerProfile(
    uid
) {

    if (!uid) {
        return null;
    }


    const customerRef =
        doc(
            db,
            "customers",
            uid
        );


    const customerSnap =
        await getDoc(
            customerRef
        );


    if (
        !customerSnap.exists()
    ) {

        return null;

    }


    return {

        id:
            customerSnap.id,

        ...customerSnap.data()

    };

}


// =====================================================
// SAVE GLOBAL CUSTOMER DATA
// =====================================================

function saveCustomerData(
    user,
    customer
) {

    window.currentRioUser =
        user;


    window.currentUser =
        customer;

}


// =====================================================
// CHECK CUSTOMER ACCOUNT STATUS
// =====================================================

function validateCustomerStatus(
    customer
) {

    if (!customer) {

        return {

            valid: false,

            message:
                "Customer record not found. Please contact Rio Maggi Point."

        };

    }


    if (
        customer.status ===
        "blocked"
    ) {

        return {

            valid: false,

            message:
                "Your account has been blocked."

        };

    }


    if (
        customer.status ===
        "suspended"
    ) {

        return {

            valid: false,

            message:
                "Your account has been suspended."

        };

    }


    return {

        valid: true,

        message: ""

    };

}


// =====================================================
// AUTO LOGIN CHECK
// =====================================================

async function checkExistingLogin() {

    try {

        const user =
            await waitForAuth();


        if (!user) {

            return;

        }


        const customer =
            await getCustomerProfile(
                user.uid
            );


        const status =
            validateCustomerStatus(
                customer
            );


        if (
            !status.valid
        ) {

            console.warn(
                "Auto login blocked:",
                status.message
            );

            return;

        }


        saveCustomerData(
            user,
            customer
        );


        window.location.replace(
            "card.html"
        );

    }


    catch (error) {

        console.error(
            "Auto Login Error:",
            error
        );

    }

}


// =====================================================
// LOGIN FORM
// =====================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (
                isLoginProcessing
            ) {

                return;

            }


            const email =
                emailInput
                    ?.value
                    .trim()
                    .toLowerCase() ||
                "";


            const password =
                passwordInput
                    ?.value ||
                "";


            // =========================================
            // BASIC VALIDATION
            // =========================================

            if (
                !email ||
                !password
            ) {

                alert(
                    "Please enter Email and Password."
                );

                return;

            }


            isLoginProcessing =
                true;


            setLoginLoading(
                true
            );


            try {

                // =====================================
                // FIREBASE AUTH LOGIN
                // =====================================

                const credential =
                    await signInWithEmailAndPassword(

                        auth,

                        email,

                        password

                    );


                const user =
                    credential.user;


                // =====================================
                // CUSTOMER PROFILE
                // =====================================

                const customer =
                    await getCustomerProfile(
                        user.uid
                    );


                // =====================================
                // CUSTOMER STATUS
                // =====================================

                const status =
                    validateCustomerStatus(
                        customer
                    );


                if (
                    !status.valid
                ) {

                    alert(
                        status.message
                    );

                    return;

                }


                // =====================================
                // SAVE GLOBAL DATA
                // =====================================

                saveCustomerData(
                    user,
                    customer
                );


                // =====================================
                // LOGIN SUCCESS
                // =====================================

                window.location.replace(
                    "card.html"
                );

            }


            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                let message =
                    "Login failed. Please try again.";


                switch (
                    error.code
                ) {

                    case
                    "auth/invalid-credential":

                        message =
                            "Invalid Email or Password.";

                        break;


                    case
                    "auth/user-not-found":

                        message =
                            "No account found with this email.";

                        break;


                    case
                    "auth/wrong-password":

                        message =
                            "Invalid Email or Password.";

                        break;


                    case
                    "auth/user-disabled":

                        message =
                            "This account has been disabled.";

                        break;


                    case
                    "auth/too-many-requests":

                        message =
                            "Too many login attempts. Please try again later.";

                        break;


                    case
                    "auth/network-request-failed":

                        message =
                            "No Internet Connection.";

                        break;


                    case
                    "auth/invalid-email":

                        message =
                            "Invalid Email Address.";

                        break;


                    case
                    "auth/user-token-expired":

                        message =
                            "Your session has expired. Please login again.";

                        break;

                }


                alert(
                    message
                );

            }


            finally {

                isLoginProcessing =
                    false;


                setLoginLoading(
                    false
                );

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

    function togglePasswordVisibility() {

        const isPassword =
            passwordInput.type ===
            "password";


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

    }


    togglePassword.addEventListener(
        "click",
        togglePasswordVisibility
    );


    togglePassword.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Enter" ||

                event.key ===
                " "
            ) {

                event.preventDefault();


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
        async (event) => {

            event.preventDefault();


            const email =
                emailInput
                    ?.value
                    .trim()
                    .toLowerCase() ||
                "";


            if (!email) {

                alert(
                    "Please enter your email address first."
                );


                emailInput?.focus();


                return;

            }


            try {

                forgotPassword.style.pointerEvents =
                    "none";


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


                switch (
                    error.code
                ) {

                    case
                    "auth/user-not-found":

                        message =
                            "No account found with this email.";

                        break;


                    case
                    "auth/invalid-email":

                        message =
                            "Invalid Email Address.";

                        break;


                    case
                    "auth/network-request-failed":

                        message =
                            "No Internet Connection.";

                        break;

                }


                alert(
                    message
                );

            }


            finally {

                forgotPassword.style.pointerEvents =
                    "";

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
            (event) => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();


                    loginForm?.requestSubmit();

                }

            }
        );

    }
);


// =====================================================
// INTERNET STATUS
// =====================================================

window.addEventListener(
    "offline",
    () => {

        console.warn(
            "RioApp: Internet connection lost."
        );

    }
);


window.addEventListener(
    "online",
    () => {

        console.log(
            "RioApp: Internet connection restored."
        );

    }
);


// =====================================================
// START AUTO LOGIN CHECK
// =====================================================

checkExistingLogin();


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
    "Central app.js Integration Active"
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
