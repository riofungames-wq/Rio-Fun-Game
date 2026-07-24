// ======================================
// RIO LOYALTY CLUB
// ADMIN LOGIN FIREBASE
// FINAL CLEAN VERSION
// ======================================

import {
    auth,
    db
} from "./firebase-config.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================
// ADMIN LOGIN EVENT
// ======================================

document.addEventListener(
    "admin-login-ready",
    async () => {

        // --------------------------------------
        // GET LOGIN DATA
        // --------------------------------------

        const data =
            window.adminLoginData;


        if (!data) {

            if (
                typeof window.showAdminError ===
                "function"
            ) {

                window.showAdminError(
                    "Login data not found."
                );

            } else {

                alert(
                    "Login data not found."
                );

            }

            return;

        }


        try {

            // --------------------------------------
            // FIREBASE AUTH LOGIN
            // --------------------------------------

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    data.email,
                    data.password
                );


            const user =
                userCredential.user;


            console.log(
                "Admin Firebase Login:",
                user.email
            );


            // --------------------------------------
            // CHECK ADMIN DOCUMENT
            // --------------------------------------

            const adminRef =
                doc(
                    db,
                    "admins",
                    user.uid
                );


            const adminSnap =
                await getDoc(
                    adminRef
                );


            // --------------------------------------
            // ADMIN NOT FOUND
            // --------------------------------------

            if (
                !adminSnap.exists()
            ) {

                await auth.signOut();

                if (
                    typeof window.showAdminError ===
                    "function"
                ) {

                    window.showAdminError(
                        "Access Denied. This account is not registered as an Admin."
                    );

                } else {

                    alert(
                        "Access Denied. This account is not registered as an Admin."
                    );

                }

                return;

            }


            // --------------------------------------
            // SAVE ADMIN DATA
            // --------------------------------------

            const adminData =
                adminSnap.data();


            window.currentAdmin =
                adminData;


            // --------------------------------------
            // LOGIN SUCCESS
            // --------------------------------------

            console.log(
                "Admin Authentication Successful"
            );


            if (
                typeof window.adminLoginSuccess ===
                "function"
            ) {

                window.adminLoginSuccess();

            }


            // --------------------------------------
            // GO TO ADMIN DASHBOARD
            // --------------------------------------

            window.location.href =
                "admin-dashboard.html";

        }


        // ======================================
        // ERROR HANDLING
        // ======================================

        catch (error) {

            console.error(
                "Admin Login Error:",
                error
            );


            let message =
                "Admin Login Failed.";


            switch (
                error.code
            ) {

                case "auth/user-not-found":

                    message =
                        "No Admin account found with this email.";

                    break;


                case "auth/invalid-credential":

                    message =
                        "Incorrect Admin Email or Password.";

                    break;


                case "auth/wrong-password":

                    message =
                        "Incorrect Admin Email or Password.";

                    break;


                case "auth/invalid-email":

                    message =
                        "Invalid Email Address.";

                    break;


                case "auth/network-request-failed":

                    message =
                        "Network Error. Please check your internet connection.";

                    break;


                case "auth/too-many-requests":

                    message =
                        "Too many login attempts. Please try again later.";

                    break;


                default:

                    message =
                        "Login Failed: " +
                        error.message;

                    break;

            }


            if (
                typeof window.showAdminError ===
                "function"
            ) {

                window.showAdminError(
                    message
                );

            } else {

                alert(
                    message
                );

            }

        }

    }
);


// ======================================
// STARTUP
// ======================================

console.log(
    "==================================="
);

console.log(
    "RIO MAGGI POINT"
);

console.log(
    "ADMIN LOGIN FIREBASE READY"
);

console.log(
    "==================================="
);
