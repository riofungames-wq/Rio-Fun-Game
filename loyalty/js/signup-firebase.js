// ======================================
// RIO MAGGI POINT
// SIGNUP FIREBASE
// FINAL FIXED CENTRAL APP INTEGRATION
// ======================================


// ======================================
// CENTRAL APP IMPORT
// ======================================

import {
    auth,
    db
} from "./app.js";


// ======================================
// FIREBASE AUTH IMPORTS
// SAME FIREBASE VERSION AS APP.JS
// ======================================

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================
// FIRESTORE IMPORTS
// ======================================

import {
    doc,
    setDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================
// CREATE ACCOUNT BUTTON
// ======================================

const createAccountBtn =
    document.getElementById(
        "createAccountBtn"
    );


// ======================================
// PREVENT DUPLICATE SUBMISSION
// ======================================

let isSignupProcessing = false;


// ======================================
// SET BUTTON LOADING
// ======================================

function setSignupLoading(
    loading
) {

    if (!createAccountBtn) {
        return;
    }


    createAccountBtn.disabled =
        loading;


    if (loading) {

        createAccountBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            &nbsp;
            Creating Account...
        `;

    } else {

        createAccountBtn.innerHTML = `
            <i class="fa-solid fa-user-plus"></i>
            &nbsp;
            Create Account
        `;

    }

}


// ======================================
// GENERATE MEMBER ID
// ======================================

function generateMemberId() {

    const timestamp =
        Date.now();

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return (
        "RIO-" +
        timestamp +
        "-" +
        random
    );

}


// ======================================
// GET SIGNUP DATA
// ======================================

function getSignupData() {

    const data =
        window.signupData;


    if (!data) {

        return null;

    }


    return {

        name:
            String(
                data.name || ""
            ).trim(),

        mobile:
            String(
                data.mobile || ""
            ).trim(),

        email:
            String(
                data.email || ""
            ).trim()
            .toLowerCase(),

        password:
            data.password || "",

        gender:
            String(
                data.gender || ""
            ).trim(),

        avatar:
            data.avatar || ""

    };

}


// ======================================
// VALIDATE SIGNUP DATA
// ======================================

function validateSignupData(
    data
) {

    if (!data) {

        return {
            valid: false,
            message:
                "Signup data not found."
        };

    }


    if (
        !data.name ||
        !data.mobile ||
        !data.email ||
        !data.password ||
        !data.gender ||
        !data.avatar
    ) {

        return {
            valid: false,
            message:
                "Please complete all signup details."
        };

    }


    if (
        data.name.length < 2
    ) {

        return {
            valid: false,
            message:
                "Please enter a valid full name."
        };

    }


    if (
        !/^\+?[0-9\s\-()]{7,20}$/
            .test(
                data.mobile
            )
    ) {

        return {
            valid: false,
            message:
                "Please enter a valid mobile number."
        };

    }


    if (
        data.password.length < 6
    ) {

        return {
            valid: false,
            message:
                "Password must be at least 6 characters."
        };

    }


    if (
        !data.gender
    ) {

        return {
            valid: false,
            message:
                "Please select your gender."
        };

    }


    if (
        !data.avatar
    ) {

        return {
            valid: false,
            message:
                "Please select an avatar or upload a photo."
        };

    }


    return {
        valid: true,
        message: ""
    };

}


// ======================================
// CREATE CUSTOMER FIRESTORE DOCUMENT
// ======================================

async function createCustomerProfile(
    user,
    data
) {

    const customerRef =
        doc(
            db,
            "customers",
            user.uid
        );


    const memberId =
        generateMemberId();


    const customerData = {

        // ==============================
        // IDENTITY
        // ==============================

        uid:
            user.uid,

        memberId:
            memberId,


        // ==============================
        // BASIC PROFILE
        // ==============================

        name:
            data.name,

        mobile:
            data.mobile,

        email:
            data.email,

        gender:
            data.gender,


        // ==============================
        // PROFILE IMAGE
        // ==============================

        avatar:
            data.avatar,

        photoURL:
            data.avatar,


        // ==============================
        // LOYALTY
        // ==============================

        stamps:
            0,

        currentStamps:
            0,

        stampDates:
            [],


        // ==============================
        // LOYALTY CYCLE
        // ==============================

        loyaltyCycleStart:
            null,

        loyaltyCycleExpiresAt:
            null,


        // ==============================
        // REWARD
        // ==============================

        reward:
            false,

        rewardUnlocked:
            false,

        rewardRedeemed:
            false,


        // ==============================
        // ACCOUNT STATUS
        // ==============================

        status:
            "active",

        emailVerified:
            false,


        // ==============================
        // TIMESTAMPS
        // ==============================

        memberSince:
            serverTimestamp(),

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    await setDoc(
        customerRef,
        customerData
    );


    return {

        memberId,

        customerData

    };

}


// ======================================
// SIGNUP EVENT
// ======================================

document.addEventListener(
    "signup-ready",
    handleSignup
);


// ======================================
// MAIN SIGNUP FUNCTION
// ======================================

async function handleSignup() {

    if (
        isSignupProcessing
    ) {

        return;

    }


    isSignupProcessing =
        true;


    setSignupLoading(
        true
    );


    try {

        // ==============================
        // GET DATA
        // ==============================

        const data =
            getSignupData();


        // ==============================
        // VALIDATE
        // ==============================

        const validation =
            validateSignupData(
                data
            );


        if (
            !validation.valid
        ) {

            alert(
                validation.message
            );

            return;

        }


        // ==============================
        // CREATE AUTH ACCOUNT
        // ==============================

        const userCredential =
            await createUserWithEmailAndPassword(

                auth,

                data.email,

                data.password

            );


        const user =
            userCredential.user;


        // ==============================
        // SEND VERIFICATION EMAIL
        // ==============================

        await sendEmailVerification(
            user
        );


        // ==============================
        // CREATE CUSTOMER PROFILE
        // ==============================

        const profile =
            await createCustomerProfile(
                user,
                data
            );


        // ==============================
        // SAVE GLOBAL USER DATA
        // ==============================

        window.currentRioUser =
            user;


        window.currentUser = {

            uid:
                user.uid,

            memberId:
                profile.memberId,

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

            status:
                "active"

        };


        // ==============================
        // SUCCESS MESSAGE
        // ==============================

        alert(

            "🎉 Account Created Successfully!\n\n" +

            "Member ID: " +
            profile.memberId +

            "\n\n" +

            "A verification email has been sent to:\n" +

            data.email +

            "\n\n" +

            "Please verify your email before logging in."

        );


        // ==============================
        // SIGN OUT
        // ==============================

        await signOut(
            auth
        );


        // ==============================
        // CLEAR TEMP DATA
        // ==============================

        window.signupData =
            null;


        window.currentUser =
            null;


        window.currentRioUser =
            null;


        // ==============================
        // REDIRECT LOGIN
        // ==============================

        window.location.replace(
            "login.html"
        );

    }


    catch (error) {

        console.error(
            "Rio Signup Error:",
            error
        );


        // ==============================
        // ERROR MESSAGE
        // ==============================

        let message =
            "Signup failed. Please try again.";


        switch (
            error.code
        ) {

            case
            "auth/email-already-in-use":

                message =
                    "This email is already registered.";

                break;


            case
            "auth/invalid-email":

                message =
                    "Invalid email address.";

                break;


            case
            "auth/weak-password":

                message =
                    "Password must be at least 6 characters.";

                break;


            case
            "auth/network-request-failed":

                message =
                    "Network error. Please check your internet connection.";

                break;


            case
            "auth/operation-not-allowed":

                message =
                    "Email and Password signup is not enabled in Firebase.";

                break;


            case
            "auth/too-many-requests":

                message =
                    "Too many requests. Please try again later.";

                break;


            default:

                message =
                    error.message ||
                    message;

        }


        alert(
            message
        );

    }


    finally {

        isSignupProcessing =
            false;


        setSignupLoading(
            false
        );

    }

}


// ======================================
// ONLINE / OFFLINE STATUS
// ======================================

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


// ======================================
// READY LOG
// ======================================

console.log(
    "===================================="
);

console.log(
    "🍜 Rio Maggi Point"
);

console.log(
    "Firebase Signup Ready"
);

console.log(
    "Central app.js Integration Active"
);

console.log(
    "Email Verification Enabled"
);

console.log(
    "Customer Registration Enabled"
);

console.log(
    "Duplicate Submission Protection Enabled"
);

console.log(
    "===================================="
);
