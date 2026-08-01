// =====================================================
// RIO MAGGI POINT
// FORGOT PASSWORD
// FINAL FIXED VERSION
// =====================================================

import { auth } from "./firebase-config.js";

import {
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// ELEMENTS
// =====================================================

const forgotForm =
    document.getElementById("forgotForm");

const resetEmail =
    document.getElementById("resetEmail");

const resetBtn =
    document.getElementById("resetBtn");

const successBox =
    document.getElementById("successBox");

const backLoginBtn =
    document.getElementById("backLoginBtn");


// =====================================================
// SEND RESET EMAIL
// =====================================================

if (forgotForm) {

    forgotForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const email =
                resetEmail
                    ? resetEmail.value.trim()
                    : "";


            if (!email) {

                alert(
                    "Please enter your registered email address."
                );

                return;
            }


            if (resetBtn) {

                resetBtn.disabled = true;

                resetBtn.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    &nbsp;
                    Sending...
                `;

            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                // =========================================
                // HIDE FORM
                // =========================================

                forgotForm.style.display =
                    "none";


                // =========================================
                // SHOW SUCCESS MESSAGE
                // =========================================

                if (successBox) {

                    successBox.style.display =
                        "block";

                }

            }


            catch (error) {

                console.error(
                    "Password Reset Error:",
                    error
                );


                let message =
                    "Unable to send password reset email. Please try again.";


                switch (error.code) {

                    case "auth/user-not-found":

                        message =
                            "No account found with this email address.";

                        break;


                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email address.";

                        break;


                    case "auth/too-many-requests":

                        message =
                            "Too many requests. Please try again later.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "No Internet Connection.";

                        break;

                }


                alert(message);

            }


            finally {

                if (resetBtn) {

                    resetBtn.disabled =
                        false;

                    resetBtn.innerHTML = `
                        <i class="fa-solid fa-paper-plane"></i>
                        &nbsp;
                        Send Reset Link
                    `;

                }

            }

        }
    );

}


// =====================================================
// BACK TO LOGIN
// =====================================================

if (backLoginBtn) {

    backLoginBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// READY
// =====================================================

console.log(
    "================================"
);

console.log(
    "🍜 Rio Maggi Point"
);

console.log(
    "Forgot Password Ready"
);

console.log(
    "Firebase Password Reset Connected"
);

console.log(
    "================================"
);
