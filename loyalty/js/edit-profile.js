// =====================================================
// RIO MAGGI POINT
// EDIT PROFILE
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const editPhoto =
document.getElementById("editPhoto");

const photoInput =
document.getElementById("photoInput");

const editForm =
document.getElementById("editProfileForm");

const editName =
document.getElementById("editName");

const editMobile =
document.getElementById("editMobile");

const editEmail =
document.getElementById("editEmail");

const editMemberId =
document.getElementById("editMemberId");

const editDOB =
document.getElementById("editDOB");

const editGender =
document.getElementById("editGender");

const cancelBtn =
document.getElementById("cancelBtn");

// =====================================================

let currentUID = "";

let uploadedPhoto = "";

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.href = "login.html";

        return;

    }

    currentUID = user.uid;

    try{

        const customerRef =
        doc(db,"customers",user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if(!customerSnap.exists()){

            alert("Customer Not Found");

            return;

        }

        loadProfile(customerSnap.data());

    }

    catch(error){

        console.error(error);

        alert("Unable To Load Profile");

    }

});

// =====================================================
// LOAD PROFILE
// =====================================================

function loadProfile(customer){

    editPhoto.src =
    customer.photoURL ||
    "assets/avatars/default.png";

    uploadedPhoto =
    customer.photoURL || "";

    editName.value =
    customer.name || "";

    editMobile.value =
    customer.mobile || "";

    editEmail.value =
    customer.email || "";

    editMemberId.value =
    customer.memberId || "";

    editDOB.value =
    customer.dob || "";

    editGender.value =
    customer.gender || "male";

}

// =====================================================
// PHOTO PREVIEW
// =====================================================

photoInput.addEventListener("change",(e)=>{

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = ()=>{

        uploadedPhoto = reader.result;

        editPhoto.src = uploadedPhoto;

    };

    reader.readAsDataURL(file);

});
// =====================================================
// SAVE PROFILE
// =====================================================

editForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        await updateDoc(

            doc(db, "customers", currentUID),

            {

                name: editName.value.trim(),

                mobile: editMobile.value.trim(),

                dob: editDOB.value,

                gender: editGender.value,

                photoURL: uploadedPhoto,

                updatedAt: new Date()

            }

        );

        alert("✅ Profile Updated Successfully");

        window.location.href = "profile.html";

    }

    catch (error) {

        console.error(error);

        alert("❌ Failed To Update Profile");

    }

});

// =====================================================
// CANCEL
// =====================================================

cancelBtn.addEventListener("click", () => {

    window.location.href = "profile.html";

});

// =====================================================
// FUTURE FUNCTIONS
// =====================================================

// Future:
// Change Password
// Delete Account
// Change Mobile OTP Verification
// Change Email Verification

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Edit Profile Ready");

console.log("================================");
