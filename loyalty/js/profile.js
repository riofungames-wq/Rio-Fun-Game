// =====================================
// RIO MAGGI POINT
// PROFILE.JS
// PART 1 OF 4
// PREMIUM CUSTOMER PROFILE SYSTEM
// =====================================

// =====================================
// FIREBASE IMPORTS
// =====================================

import {

    auth,
    db

} from "./firebase-config.js";

import {

    onAuthStateChanged,
    signOut,
    deleteUser

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

    doc,
    getDoc,
    updateDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================
// PROFILE ELEMENTS
// =====================================

const profileName =
document.getElementById("profileName");

const profileEmail =
document.getElementById("profileEmail");

const profilePhoto =
document.getElementById("profilePhoto");

const defaultAvatar =
document.getElementById("defaultAvatar");

const memberId =
document.getElementById("memberId");

const memberSince =
document.getElementById("memberSince");

const profileStamps =
document.getElementById("profileStamps");

const profileReward =
document.getElementById("profileReward");

// =====================================
// EDIT PROFILE ELEMENTS
// =====================================

const editName =
document.getElementById("editName");

const editEmail =
document.getElementById("editEmail");

const saveProfileBtn =
document.getElementById("saveProfileBtn");

const profileMessage =
document.getElementById("profileMessage");

const photoInput =
document.getElementById("photoInput");

// =====================================
// ACCOUNT BUTTONS
// =====================================

const logoutBtn =
document.getElementById("logoutBtn");

const deleteAccountBtn =
document.getElementById("deleteAccountBtn");

// =====================================
// VARIABLES
// =====================================

let currentUser = null;

let currentProfile = {};

let uploadedPhoto = "";

// =====================================
// SHOW MESSAGE
// =====================================

function showMessage(message, type) {

    profileMessage.textContent =
    message;

    profileMessage.className =
    "profile-message " + type;

}

// =====================================
// REMOVE LOADING
// =====================================

function removeLoading() {

    profileName.classList.remove(
        "profile-loading"
    );

    profileEmail.classList.remove(
        "profile-loading"
    );

}

// =====================================
// CALCULATE AGE
// =====================================

function calculateAge(date){

    if(!date) return "";

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

// =====================================
// PART 1 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PROFILE.JS
// PART 2 OF 4
// LOAD CUSTOMER PROFILE
// =====================================

// =====================================
// LOAD PROFILE
// =====================================

async function loadProfile(user){

    try{

        const userRef =

        doc(

            db,

            "customers",

            user.uid

        );

        const userSnap =

        await getDoc(

            userRef

        );

        if(!userSnap.exists()){

            showMessage(

                "Profile not found.",

                "error"

            );

            return;

        }

        currentProfile =

        userSnap.data();

        // ===============================
        // NAME
        // ===============================

        profileName.textContent =

        currentProfile.name ||

        "Customer";

        editName.value =

        currentProfile.name ||

        "";

        // ===============================
        // EMAIL
        // ===============================

        profileEmail.textContent =

        currentProfile.email ||

        user.email ||

        "";

        editEmail.value =

        currentProfile.email ||

        user.email ||

        "";

        // ===============================
        // MEMBER ID
        // ===============================

        memberId.textContent =

        currentProfile.memberId ||

        "RIO-" +

        user.uid.substring(0,8)

        .toUpperCase();

        // ===============================
        // MEMBER SINCE
        // ===============================

        if(

            currentProfile.createdAt &&

            currentProfile.createdAt.toDate

        ){

            memberSince.textContent =

            currentProfile.createdAt

            .toDate()

            .toLocaleDateString(

                "en-IN",

                {

                    day:"2-digit",

                    month:"short",

                    year:"numeric"

                }

            );

        }

        else{

            memberSince.textContent =

            "Premium Member";

        }

        // ===============================
        // STAMPS
        // ===============================

        const stamps =

        Number(

            currentProfile.stamps || 0

        );

        profileStamps.textContent =

        Math.min(stamps,6)

        + " / 6";

        // ===============================
        // REWARD
        // ===============================

        if(stamps >= 6){

            profileReward.textContent =

            "FREE VEG MAGGI";

        }

        else{

            profileReward.textContent =

            (6 - stamps)

            + " Stamp Left";

        }

        // ===============================
        // PROFILE PHOTO
        // ===============================

        if(currentProfile.photoURL){

            profilePhoto.src =

            currentProfile.photoURL;

            profilePhoto.style.display =

            "block";

            defaultAvatar.style.display =

            "none";

        }

        else{

            profilePhoto.style.display =

            "none";

            defaultAvatar.style.display =

            "block";

        }

        removeLoading();

    }

    catch(error){

        console.error(error);

        showMessage(

            "Unable to load profile.",

            "error"

        );

    }

}

// =====================================
// AUTH STATE
// =====================================

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            window.location.href =

            "login.html";

            return;

        }

        currentUser = user;

        await loadProfile(user);

    }

);

// =====================================
// PART 2 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PROFILE.JS
// PART 3 OF 4
// SAVE PROFILE + PHOTO + GENDER
// =====================================

// =====================================
// PHOTO PREVIEW
// =====================================

photoInput.addEventListener(

    "change",

    (event)=>{

        const file =

        event.target.files[0];

        if(!file){

            return;

        }

        if(

            !file.type.startsWith("image/")

        ){

            showMessage(

                "Please select a valid image.",

                "error"

            );

            return;

        }

        const reader =

        new FileReader();

        reader.onload = ()=>{

            uploadedPhoto =

            reader.result;

            profilePhoto.src =

            uploadedPhoto;

            profilePhoto.style.display =

            "block";

            defaultAvatar.style.display =

            "none";

        };

        reader.readAsDataURL(file);

    }

);

// =====================================
// SAVE PROFILE
// =====================================

saveProfileBtn.addEventListener(

    "click",

    async()=>{

        if(!currentUser){

            return;

        }

        const newName =

        editName.value.trim();

        if(!newName){

            showMessage(

                "Please enter your name.",

                "error"

            );

            return;

        }

        try{

            saveProfileBtn.disabled =

            true;

            saveProfileBtn.innerHTML =

            '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

            const updateData = {

                name:

                newName,

                updatedAt:

                serverTimestamp()

            };

            if(uploadedPhoto){

                updateData.photoURL =

                uploadedPhoto;

            }

            await updateDoc(

                doc(

                    db,

                    "customers",

                    currentUser.uid

                ),

                updateData

            );

            profileName.textContent =

            newName;

            showMessage(

                "Profile updated successfully.",

                "success"

            );

        }

        catch(error){

            console.error(error);

            showMessage(

                "Unable to update profile.",

                "error"

            );

        }

        finally{

            saveProfileBtn.disabled =

            false;

            saveProfileBtn.innerHTML =

            '<i class="fa-solid fa-floppy-disk"></i> Save Profile';

        }

    }

);

// =====================================
// APPLY GENDER THEME
// =====================================

function applyGenderTheme(gender){

    document.body.classList.remove(

        "male-theme",

        "female-theme"

    );

    if(

        String(gender)

        .toLowerCase()

        ===

        "female"

    ){

        document.body.classList.add(

            "female-theme"

        );

    }

    else{

        document.body.classList.add(

            "male-theme"

        );

    }

}

if(

    currentProfile.gender

){

    applyGenderTheme(

        currentProfile.gender

    );

}

// =====================================
// PART 3 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PROFILE.JS
// PART 4 OF 4
// LOGOUT + DELETE ACCOUNT + READY
// =====================================

// =====================================
// LOGOUT
// =====================================

logoutBtn.addEventListener(

    "click",

    async()=>{

        const confirmLogout =

        confirm(

            "Are you sure you want to logout?"

        );

        if(!confirmLogout){

            return;

        }

        try{

            await signOut(auth);

            window.location.href =

            "login.html";

        }

        catch(error){

            console.error(error);

            showMessage(

                "Logout failed.",

                "error"

            );

        }

    }

);

// =====================================
// DELETE ACCOUNT
// =====================================

deleteAccountBtn.addEventListener(

    "click",

    async()=>{

        if(!currentUser){

            return;

        }

        const confirmDelete =

        confirm(

            "Delete your account permanently?"

        );

        if(!confirmDelete){

            return;

        }

        try{

            await deleteUser(

                currentUser

            );

            alert(

                "Account deleted successfully."

            );

            window.location.href =

            "signup.html";

        }

        catch(error){

            console.error(error);

            showMessage(

                "Unable to delete account. Login again and try.",

                "error"

            );

        }

    }

);

// =====================================
// PAGE ANIMATION
// =====================================

window.addEventListener(

    "load",

    ()=>{

        document.body.classList.add(

            "page-loaded"

        );

    }

);

// =====================================
// PROFILE READY
// =====================================

console.log(

    "================================"

);

console.log(

    "RIO MAGGI POINT"

);

console.log(

    "Premium Profile Ready"

);

console.log(

    "Firebase Connected"

);

console.log(

    "Profile Loaded"

);

console.log(

    "Photo Upload Enabled"

);

console.log(

    "Logout Enabled"

);

console.log(

    "Delete Account Enabled"

);

console.log(

    "Male/Female Theme Ready"

);

console.log(

    "================================"

);

// =====================================
// END OF PROFILE.JS
// =====================================
