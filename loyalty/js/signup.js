// =====================================================
// RIO MAGGI POINT
// PREMIUM SIGNUP SYSTEM
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const signupForm =
document.getElementById("signupForm");

const fullName =
document.getElementById("fullName");

const mobile =
document.getElementById("mobile");

const email =
document.getElementById("email");

const password =
document.getElementById("password");

const confirmPassword =
document.getElementById("confirmPassword");

const gender =
document.getElementById("gender");

const dob =
document.getElementById("dob");

const customerPhoto =
document.getElementById("customerPhoto");

// =====================================================
// VARIABLES
// =====================================================

let uploadedPhoto = "";

// =====================================================
// PERMANENT MEMBER ID
// =====================================================

function generateMemberId(){

    const timestamp = Date.now();

    return `RIO-${timestamp}`;

}

// =====================================================
// CALCULATE AGE
// =====================================================

function calculateAge(date){

    const birth =
    new Date(date);

    const today =
    new Date();

    let age =
    today.getFullYear() -
    birth.getFullYear();

    const month =
    today.getMonth() -
    birth.getMonth();

    if(

        month < 0 ||

        (

            month === 0 &&

            today.getDate() <
            birth.getDate()

        )

    ){

        age--;

    }

    return age;

}

// =====================================================
// PHOTO UPLOAD
// =====================================================

if(customerPhoto){

    customerPhoto.addEventListener("change",(e)=>{

        const file =
        e.target.files[0];

        if(!file) return;

        const reader =
        new FileReader();

        reader.onload = ()=>{

            uploadedPhoto =
            reader.result;

        };

        reader.readAsDataURL(file);

    });

}
// =====================================================
// SIGNUP SUBMIT
// =====================================================

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name =
    fullName.value.trim();

    const phone =
    mobile.value.trim();

    const userEmail =
    email.value.trim();

    const userPassword =
    password.value;

    const confirm =
    confirmPassword.value;

    const userGender =
    gender.value;

    const birthDate =
    dob.value;

    // =========================================
    // VALIDATION
    // =========================================

    if (

        !name ||

        !phone ||

        !userEmail ||

        !userPassword ||

        !confirm ||

        !userGender ||

        !birthDate

    ) {

        alert("Please Fill All Fields");

        return;

    }

    if (phone.length !== 10) {

        alert("Enter Valid Mobile Number");

        return;

    }

    if (userPassword !== confirm) {

        alert("Password Doesn't Match");

        return;

    }

    const age =
    calculateAge(birthDate);

    const memberId =
    generateMemberId();

    try {

        // =========================================
        // CREATE AUTH ACCOUNT
        // =========================================

        const userCredential =

        await createUserWithEmailAndPassword(

            auth,

            userEmail,

            userPassword

        );

        const uid =
        userCredential.user.uid;

        // =========================================
        // SAVE CUSTOMER
        // =========================================

        await setDoc(

            doc(db, "customers", uid),

            {

                uid: uid,

                memberId: memberId,

                name: name,

                mobile: phone,

                email: userEmail,

                gender: userGender,

                dob: birthDate,

                age: age,

                photoURL: uploadedPhoto,

                stamps: 0,

                rewardUnlocked: false,

                createdAt: serverTimestamp(),

                updatedAt: serverTimestamp()

            }

        );
              // =========================================
        // CUSTOMER CATEGORY
        // =========================================

        let customerCategory = "adult";

        if (age < 18) {

            customerCategory = "child";

        }

        // =========================================
        // UPDATE CATEGORY
        // =========================================

        await setDoc(

            doc(db, "customers", uid),

            {

                category: customerCategory,

                qrVersion: 1

            },

            {

                merge: true

            }

        );

        // =========================================
        // SUCCESS
        // =========================================

        alert(

            "🎉 Account Created Successfully!"

        );

        // =========================================
        // REDIRECT
        // =========================================

        window.location.href =

        "card.html";

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("Rio Maggi Point");

console.log("Premium Signup Ready");

console.log("Permanent Member ID Enabled");

console.log("================================");
