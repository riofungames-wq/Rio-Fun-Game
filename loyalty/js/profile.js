// =====================================================
// RIO MAGGI POINT
// PROFILE.JS
// PREMIUM VERSION
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
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

const editProfileBtn =
document.getElementById("editProfileBtn");

const logoutBtn =
document.getElementById("logoutBtn");

// =====================================================
// AUTH CHECK
// =====================================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        location.href="login.html";

        return;

    }

    try{

        const customerRef =
        doc(db,"customers",user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if(!customerSnap.exists()){

            alert("Customer Not Found");

            return;

        }

        const customer =
        customerSnap.data();

        loadProfile(customer);

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

    profilePhoto.src =
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
    customer.category || "adult";

    profileStampCount.textContent =
    `${customer.stamps || 0}/6`;

    profileReward.textContent =
    customer.rewardUnlocked
    ?
    "Unlocked 🎉"
    :
    "Locked 🔒";

    if(customer.createdAt){

        profileMemberSince.textContent =
        new Date(
            customer.createdAt.seconds * 1000
        ).toLocaleDateString();

    }

}
// =====================================================
// EDIT PROFILE
// =====================================================

editProfileBtn.addEventListener("click",()=>{

    // Future Edit Profile Page

    window.location.href =

    "edit-profile.html";

});

// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener("click", async()=>{

    const confirmLogout = confirm(

        "Are You Sure You Want To Logout?"

    );

    if(!confirmLogout) return;

    try{

        await signOut(auth);

        location.href = "login.html";

    }

    catch(error){

        console.error(error);

        alert("Logout Failed");

    }

});

// =====================================================
// FUTURE FUNCTIONS
// =====================================================

// Profile Update

window.updateProfilePhoto = function(photoURL){

    profilePhoto.src = photoURL;

};

// Reward Refresh

window.refreshRewardStatus = function(status){

    profileReward.textContent =

    status

    ?

    "Unlocked 🎉"

    :

    "Locked 🔒";

};

// Stamp Refresh

window.refreshStampCount = function(stamps){

    profileStampCount.textContent =

    `${stamps}/6`;

};

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Premium Profile Ready");

console.log("================================");
