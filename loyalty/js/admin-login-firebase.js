// ======================================

// RIO LOYALTY CLUB

// ADMIN LOGIN FIREBASE

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



// ======================================

// FIREBASE INITIALIZE

// ======================================



const app = initializeApp(firebaseConfig);



const auth = getAuth(app);



const db = getFirestore(app);

// ======================================

// PART 2

// ADMIN LOGIN

// ======================================



document.addEventListener("admin-login-ready", async () => {



    const data = window.adminLoginData;



    if (!data) {



        window.showAdminError("Login data not found.");



        return;



    }



    try {



        // Firebase Authentication Login



        const userCredential =

        await signInWithEmailAndPassword(



            auth,



            data.email,



            data.password



        );



        const user = userCredential.user;



        // Check Admin Record



        const adminRef = doc(db, "admins", user.uid);



        const adminSnap = await getDoc(adminRef);



        if (!adminSnap.exists()) {



            await auth.signOut();



            window.showAdminError(

                "Access Denied. You are not an Admin."

            );



            return;



        }



        // Save Admin Data



        window.currentAdmin = adminSnap.data();



        // Login Success



        window.adminLoginSuccess();



        setTimeout(() => {



            window.location.href =

            "admin-dashboard.html";



        }, 800);



    }

    catch (error) {



        console.error("Admin Login Error :", error);



        switch (error.code) {



            case "auth/invalid-credential":



                window.showAdminError(

                    "Invalid Email or Password."

                );



                break;



            case "auth/wrong-password":



                window.showAdminError(

                    "Incorrect Password."

                );



                break;



            case "auth/user-not-found":



                window.showAdminError(

                    "Admin account not found."

                );



                break;



            case "auth/invalid-email":



                window.showAdminError(

                    "Invalid Email Address."

                );



                break;



            case "auth/network-request-failed":



                window.showAdminError(

                    "No Internet Connection."

                );



                break;



            case "auth/too-many-requests":



                window.showAdminError(

                    "Too many failed attempts. Try again later."

                );



                break;



            default:



                window.showAdminError(

                    error.message

                );



        }



    }



});
