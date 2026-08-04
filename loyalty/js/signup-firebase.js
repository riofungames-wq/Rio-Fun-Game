// ======================================
// RIO MAGGI POINT
// SIGNUP FIREBASE
// FINAL FIXED VERSION
// CENTRAL APP.JS INTEGRATION
// ======================================

import {
    auth,
    db,
    storage
} from "./app.js";

import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


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

let isCreatingAccount = false;


// ======================================
// BUTTON STATE
// ======================================

function setLoadingState(
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

    const randomNumber =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return (
        "RIO-" +
        Date.now() +
        "-" +
        randomNumber
    );

}


// ======================================
// UPLOAD PROFILE PHOTO
// ======================================

async function uploadProfilePhoto(
    user,
    avatar
) {

    // ==================================
    // DEFAULT AVATAR
    // ==================================

    if (
        !avatar ||
        typeof avatar !== "string"
    ) {

        return "";

    }


    // ==================================
    // NORMAL ASSET AVATAR
    // ==================================

    if (
        avatar.startsWith(
            "assets/"
        )
    ) {

        return avatar;

    }


    // ==================================
    // BASE64 UPLOADED IMAGE
    // ==================================

    if (
        !avatar.startsWith(
            "data:image/"
        )
    ) {

        return "";

    }


    // ==================================
    // CONVERT BASE64 TO BLOB
    // ==================================

    const response =
        await fetch(
            avatar
        );


    const blob =
        await response.blob();


    // ==================================
    // STORAGE FILE PATH
    // ==================================

    const fileName =

        `profile_${Date.now()}.jpg`;


    const storagePath =

        `customers/${user.uid}/profile/${fileName}`;


    const storageRef =

        ref(
            storage,
            storagePath
        );


    // ==================================
    // UPLOAD TO FIREBASE STORAGE
    // ==================================

    await uploadBytes(
        storageRef,
        blob,
        {
            contentType:
                blob.type || "image/jpeg"
        }
    );


    // ==================================
    // GET DOWNLOAD URL
    // ==================================

    const downloadURL =
        await getDownloadURL(
            storageRef
        );


    return downloadURL;

}


// ======================================
// SIGNUP EVENT
// ======================================

document.addEventListener(
    "signup-ready",
    async () => {

        // ==================================
        // PREVENT DOUBLE SUBMISSION
        // ==================================

        if (isCreatingAccount) {

            return;

        }


        isCreatingAccount =
            true;


        setLoadingState(
            true
        );


        // ==================================
        // GET SIGNUP DATA
        // ==================================

        const data =
            window.signupData;


        if (!data) {

            alert(
                "Signup data not found. Please try again."
            );


            isCreatingAccount =
                false;


            setLoadingState(
                false
            );


            return;

        }


        // ==================================
        // BASIC VALIDATION
        // ==================================

        if (
            !data.name ||
            !data.mobile ||
            !data.email ||
            !data.password ||
            !data.gender ||
            !data.avatar
        ) {

            alert(
                "Please complete all signup details."
            );


            isCreatingAccount =
                false;


            setLoadingState(
                false
            );


            return;

        }


        let user = null;


        try {

            // ==================================
            // CREATE FIREBASE AUTH ACCOUNT
            // ==================================

            const userCredential =

                await createUserWithEmailAndPassword(

                    auth,

                    data.email,

                    data.password

                );


            user =
                userCredential.user;


            // ==================================
            // SEND EMAIL VERIFICATION
            // ==================================

            await sendEmailVerification(
                user
            );


            // ==================================
            // UPLOAD CUSTOM PHOTO
            // ==================================

            const photoURL =

                await uploadProfilePhoto(

                    user,

                    data.avatar

                );


            // ==================================
            // MEMBER ID
            // ==================================

            const memberId =

                generateMemberId();


            // ==================================
            // CUSTOMER DATA
            // ==================================

            const customerData = {

                uid:
                    user.uid,

                memberId:
                    memberId,

                name:
                    data.name.trim(),

                mobile:
                    data.mobile.trim(),

                email:
                    data.email.trim()
                        .toLowerCase(),

                gender:
                    data.gender,

                avatar:
                    data.avatar.startsWith("data:image/")
                        ? ""
                        : data.avatar,

                photoURL:
                    photoURL,


                // ==================================
                // LOYALTY DATA
                // ==================================

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


                // ==================================
                // ACCOUNT STATUS
                // ==================================

                status:
                    "active",

                emailVerified:
                    false,


                // ==================================
                // LOYALTY CYCLE
                // ==================================

                loyaltyCycleStartedAt:
                    null,

                loyaltyCycleExpiresAt:
                    null,


                // ==================================
                // TIMESTAMPS
                // ==================================

                memberSince:
                    serverTimestamp(),

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            // ==================================
            // SAVE CUSTOMER PROFILE
            // ==================================

            await setDoc(

                doc(
                    db,
                    "customers",
                    user.uid
                ),

                customerData

            );


            // ==================================
            // SUCCESS
            // ==================================

            alert(

                "🎉 Account Created Successfully!\n\n" +

                "A verification email has been sent to:\n" +

                data.email +

                "\n\n" +

                "Please verify your email before logging in."

            );


            // ==================================
            // CLEAR GLOBAL SIGNUP DATA
            // ==================================

            window.signupData =
                null;


            // ==================================
            // SIGN OUT
            // ==================================

            await signOut(
                auth
            );


            // ==================================
            // REDIRECT LOGIN
            // ==================================

            window.location.replace(
                "login.html"
            );

        }


        catch (error) {

            console.error(
                "Signup Error:",
                error
            );


            // ==================================
            // CLEANUP AUTH ACCOUNT
            // ==================================

            // NOTE:
            // If Firestore or Storage fails after
            // Auth account creation, the created
            // Auth user remains in Firebase.
            //
            // It should be handled from Firebase
            // Admin side or with a secure backend.
            // Client-side deleteUser is intentionally
            // avoided here.


            let message =

                "Signup failed. Please try again.";


            switch (
                error.code
            ) {

                case "auth/email-already-in-use":

                    message =

                        "This email is already registered.";

                    break;


                case "auth/invalid-email":

                    message =

                        "Invalid email address.";

                    break;


                case "auth/weak-password":

                    message =

                        "Password must be at least 6 characters.";

                    break;


                case "auth/network-request-failed":

                    message =

                        "Network error. Please check your internet connection.";

                    break;


                case "auth/operation-not-allowed":

                    message =

                        "Email and Password signup is not enabled in Firebase.";

                    break;


                case "storage/unauthorized":

                    message =

                        "Profile photo upload is not allowed. Please check Firebase Storage rules.";

                    break;


                case "storage/unknown":

                    message =

                        "Profile photo upload failed. Please try again.";

                    break;


                case "permission-denied":

                    message =

                        "Unable to save customer profile. Please check Firestore permissions.";

                    break;


                default:

                    if (
                        error.message
                    ) {

                        message =

                            "Signup Failed:\n" +
                            error.message;

                    }

            }


            alert(
                message
            );

        }


        finally {

            isCreatingAccount =
                false;


            setLoadingState(
                false
            );

        }

    }
);


// ======================================
// READY LOG
// ======================================

console.log(
    "🍜 Rio Maggi Point Firebase Signup Ready"
);

console.log(
    "Central App.js Firebase Architecture Connected"
);

console.log(
    "Email Verification Enabled"
);

console.log(
    "Customer Registration Enabled"
);

console.log(
    "Firebase Storage Profile Upload Enabled"
);
