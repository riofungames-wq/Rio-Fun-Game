// =====================================================
// RIO MAGGI POINT
// PROFILE.JS
// FINAL PREMIUM VERSION
// PART 1
// =====================================================



// =====================================================
// FIREBASE IMPORT
// =====================================================

import { auth, db } from "./firebase-config.js";

import {

onAuthStateChanged,
signOut

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

doc,
getDoc,
updateDoc

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// =====================================================
// PROFILE ELEMENTS
// =====================================================

const profilePhoto =
document.getElementById("profilePhoto");

const profileName =
document.getElementById("profileName");

const profileMemberId =
document.getElementById("profileMemberId");

const profileMobile =
document.getElementById("profileMobile");

const profileEmail =
document.getElementById("profileEmail");

const profileDOB =
document.getElementById("profileDOB");

const profileAge =
document.getElementById("profileAge");

const profileCategory =
document.getElementById("profileCategory");

const profileStampCount =
document.getElementById("profileStampCount");

const profileReward =
document.getElementById("profileReward");

const profileMemberSince =
document.getElementById("profileMemberSince");



// =====================================================
// EDIT ELEMENTS
// =====================================================

const editProfileBtn =
document.getElementById("editProfileBtn");

const editModal =
document.getElementById("editModal");

const editName =
document.getElementById("editName");

const editDOB =
document.getElementById("editDOB");

const editAge =
document.getElementById("editAge");

const editGender =
document.getElementById("editGender");

const saveProfileBtn =
document.getElementById("saveProfileBtn");

const closeEditBtn =
document.getElementById("closeEditBtn");

const logoutBtn =
document.getElementById("logoutBtn");



// =====================================================
// VARIABLES
// =====================================================

let currentUID = null;

let currentCustomer = null;



// =====================================================
// SAFE TEXT
// =====================================================

function setText(element,value){

if(element){

element.textContent=value;

}

}



// =====================================================
// SAFE IMAGE
// =====================================================

function setImage(image,url){

if(!image) return;

image.src=url || "assets/avatars/default.png";

image.onerror=()=>{

image.src="assets/avatars/default.png";

};

}



// =====================================================
// SAFE DATE FORMAT
// =====================================================

function formatMemberDate(value){

if(!value){

return "--";

}

try{

if(value.toDate){

return value
.toDate()
.toLocaleDateString();

}

return new Date(value)
.toLocaleDateString();

}

catch{

return "--";

}

}



// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

currentUID=user.uid;

try{

const customerRef=

doc(
db,
"customers",
user.uid
);

const customerSnap=

await getDoc(customerRef);

if(!customerSnap.exists()){

alert("Customer data not found");

return;

}

currentCustomer=

customerSnap.data();

loadProfile(currentCustomer);

}

catch(error){

console.error(

"Profile Load Error:",

error

);

alert(

"Unable to load profile"

);

}

});

/* ============================
   CONTINUE IN PART 2
============================ */
// =====================================================
// LOAD CUSTOMER PROFILE
// =====================================================

onAuthStateChanged(

auth,

async(user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    currentUID = user.uid;

    try{

        const customerRef = doc(
            db,
            "customers",
            user.uid
        );

        const customerSnap = await getDoc(customerRef);

        if(!customerSnap.exists()){

            alert("Customer data not found");

            return;

        }

        currentCustomer = customerSnap.data();

        loadProfile(currentCustomer);

    }

    catch(error){

        console.error(
            "Profile Load Error:",
            error
        );

        alert(
            "Unable to load profile"
        );

    }

}

);


// =====================================================
// DISPLAY PROFILE DATA
// =====================================================

function loadProfile(customer){

    profilePhoto.src =
        customer.avatar ||
        customer.photoURL ||
        "assets/avatars/default.png";

    profileName.textContent =
        customer.name || "Customer";

    profileMemberId.textContent =
        customer.memberId || "RIO-000000";

    profileMobile.textContent =
        customer.mobile || "--";

    profileEmail.textContent =
        customer.email || "--";

    profileDOB.textContent =
        customer.dob || "--";

    profileAge.textContent =
        customer.age || "--";

    profileCategory.textContent =
        customer.gender
            ? customer.gender.toUpperCase()
            : "PREMIUM MEMBER";

    const stamps =
        Number(customer.stamps || 0);

    profileStampCount.textContent =
        `${stamps} / 6`;

    if(
        customer.rewardUnlocked === true ||
        customer.reward === true ||
        stamps >= 6
    ){

        profileReward.textContent =
            "FREE VEG MAGGI UNLOCKED";

    }

    else{

        profileReward.textContent =
            `Collect ${6 - stamps} More Stamp(s)`;

    }

    if(customer.createdAt){

        try{

            const date =
                customer.createdAt.toDate
                ? customer.createdAt.toDate()
                : new Date(customer.createdAt.seconds * 1000);

            profileMemberSince.textContent =
                date.toLocaleDateString();

        }

        catch{

            profileMemberSince.textContent = "--";

        }

    }

    else{

        profileMemberSince.textContent = "--";

    }

}


// =====================================================
// OPEN EDIT PROFILE
// =====================================================

if(editProfileBtn){

    editProfileBtn.addEventListener(

        "click",

        ()=>{

            if(!currentCustomer) return;

            editName.value =
                currentCustomer.name || "";

            editDOB.value =
                currentCustomer.dob || "";

            editAge.value =
                currentCustomer.age || "";

            editGender.value =
                currentCustomer.gender || "";

            editModal.style.display = "flex";

        }

    );

}
// =====================================================
// SAVE PROFILE
// =====================================================

if(saveProfileBtn){

saveProfileBtn.addEventListener(

"click",

async()=>{

const newName = editName.value.trim();

const newDOB = editDOB.value;

const newAge = editAge.value;

const newGender = editGender.value;

if(!newName){

alert("Please enter your name.");

return;

}

try{

saveProfileBtn.disabled = true;

saveProfileBtn.innerHTML =
`<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

let avatar = "assets/avatars/default.png";

if(newGender === "male"){

avatar = "assets/avatars/male.png";

}

else if(newGender === "female"){

avatar = "assets/avatars/female.png";

}

const customerRef = doc(

db,

"customers",

currentUID

);

await updateDoc(

customerRef,

{

name:newName,

dob:newDOB,

age:newAge,

gender:newGender,

avatar:avatar

}

);

currentCustomer.name = newName;

currentCustomer.dob = newDOB;

currentCustomer.age = newAge;

currentCustomer.gender = newGender;

currentCustomer.avatar = avatar;

loadProfile(currentCustomer);

editModal.style.display = "none";

alert("Profile updated successfully.");

}

catch(error){

console.error(

"Profile Update Error:",

error

);

alert("Unable to update profile.");

}

finally{

saveProfileBtn.disabled = false;

saveProfileBtn.innerHTML =
`<i class="fa-solid fa-check"></i> Save`;

}

}

);

}


// =====================================================
// CLOSE EDIT MODAL
// =====================================================

if(closeEditBtn){

closeEditBtn.addEventListener(

"click",

()=>{

editModal.style.display = "none";

}

);

}


// =====================================================
// CLOSE MODAL ON OUTSIDE CLICK
// =====================================================

window.addEventListener(

"click",

(event)=>{

if(event.target === editModal){

editModal.style.display = "none";

}

}

);


// =====================================================
// LOGOUT
// =====================================================

if(logoutBtn){

logoutBtn.addEventListener(

"click",

async()=>{

const confirmLogout = confirm(

"Do you want to logout?"

);

if(!confirmLogout){

return;

}

try{

await signOut(auth);

window.location.href = "login.html";

}

catch(error){

console.error(

"Logout Error:",

error

);

alert("Logout failed.");

}

}

);

}


// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Premium Profile Loaded");

console.log("Profile Edit Enabled");

console.log("================================");
