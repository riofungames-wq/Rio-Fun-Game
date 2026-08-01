// ======================================
// RIO MAGGI POINT
// FIREBASE SIGNUP
// FINAL FIXED VERSION
// ======================================

import {
    auth,
    db
} from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================
// SIGNUP EVENT
// ======================================

document.addEventListener(
    "signup-ready",
    async () => {

        const data =
            window.signupData;


        if(!data){

            alert(
                "Signup data not found."
            );

            return;

        }


        // ==================================
        // BASIC VALIDATION
        // ==================================

        if(
            !data.name ||
            !data.mobile ||
            !data.email ||
            !data.password ||
            !data.gender ||
            !data.avatar
        ){

            alert(
                "Please complete all signup details."
            );

            return;

        }


        try{

            // ==================================
            // CREATE FIREBASE AUTH ACCOUNT
            // ==================================

            const userCredential =
                await createUserWithEmailAndPassword(

                    auth,

                    data.email,

                    data.password

                );


            const user =
                userCredential.user;


            // ==================================
            // SEND EMAIL VERIFICATION
            // ==================================

            await sendEmailVerification(
                user
            );


            // ==================================
            // GENERATE MEMBER ID
            // ==================================

            const memberId =

                "RIO-" +

                Date.now();


            // ==================================
            // SAVE CUSTOMER DATA
            // ==================================

            await setDoc(

                doc(

                    db,

                    "customers",

                    user.uid

                ),

                {

                    uid:
                        user.uid,

                    memberId:
                        memberId,

                    name:
                        data.name,

                    mobile:
                        data.mobile,

                    email:
                        data.email,

                    gender:
                        data.gender,

                    avatar:
                        data.avatar,

                    photoURL:
                        data.avatar,

                    stamps:
                        0,

                    currentStamps:
                        0,

                    stampDates:
                        [],

                    reward:
                        false,

                    rewardUnlocked:
                        false,

                    rewardRedeemed:
                        false,

                    status:
                        "active",

                    emailVerified:
                        false,

                    memberSince:
                        serverTimestamp(),

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }

            );


            // ==================================
            // SUCCESS MESSAGE
            // ==================================

            alert(

                "🎉 Account Created Successfully!\n\n" +

                "A verification email has been sent to " +

                data.email +

                ".\n\n" +

                "Please verify your email before logging in."

            );


            // ==================================
            // SIGN OUT AFTER REGISTRATION
            // ==================================

            await auth.signOut();


            // ==================================
            // REDIRECT TO LOGIN
            // ==================================

            window.location.href =
                "login.html";


        }

        catch(error){

            console.error(
                "Signup Error:",
                error
            );


            // ==================================
            // ERROR HANDLING
            // ==================================

            switch(
                error.code
            ){

                case "auth/email-already-in-use":

                    alert(
                        "This email is already registered."
                    );

                    break;


                case "auth/invalid-email":

                    alert(
                        "Invalid email address."
                    );

                    break;


                case "auth/weak-password":

                    alert(
                        "Password must be at least 6 characters."
                    );

                    break;


                case "auth/network-request-failed":

                    alert(
                        "Network error. Please check your internet connection."
                    );

                    break;


                case "auth/operation-not-allowed":

                    alert(
                        "Email and Password signup is not enabled in Firebase."
                    );

                    break;


                default:

                    alert(

                        "Signup Failed: " +

                        (
                            error.message ||

                            "Unknown error occurred."

                        )

                    );

            }

        }

    }

);


// ======================================
// READY
// ======================================

console.log(
    "🍜 Rio Maggi Point Firebase Signup Ready"
);

console.log(
    "Email Verification Enabled"
);

console.log(
    "Customer Registration Enabled"
);
