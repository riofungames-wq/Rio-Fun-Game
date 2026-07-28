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

const logoutBtn =
document.getElementById("logoutBtn");

const editProfileBtn =
document.getElementById("editProfileBtn");

// =====================================================
// VARIABLES
// =====================================================

let currentCustomer = null;

// =====================================================
// AUTH
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

        currentCustomer =
        customerSnap.data();

        currentCustomer.uid =
        user.uid;

        loadProfile(currentCustomer);

    }

    catch(error){

        console.error(error);

        alert("Unable To Load Profile");

    }

});
// =====================================================
// LOAD PROFILE
// PART 2
// =====================================================

function loadProfile(customer){

    profilePhoto.src =
    customer.photoURL ||
    customer.avatar ||
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
        stamps >= 6
    ){

        profileReward.textContent =
        "FREE VEG MAGGI UNLOCKED";

    }

    else{

        profileReward.textContent =
        "Locked";

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

            profileMemberSince.textContent =
            "--";

        }

    }

    else{

        profileMemberSince.textContent =
        "--";

    }

}
// =====================================================
// BUTTON EVENTS
// PART 3
// =====================================================


// ============================
// EDIT PROFILE
// ============================

if(editProfileBtn){

    editProfileBtn.addEventListener("click",()=>{

        alert("Edit Profile feature will be available soon.");

    });

}


// ============================
// LOGOUT
// ============================

if(logoutBtn){

    logoutBtn.addEventListener("click",async()=>{

        const confirmLogout =

        confirm("Do you want to logout?");

        if(!confirmLogout){

            return;

        }

        try{

            await signOut(auth);

            location.href="login.html";

        }

        catch(error){

            console.error(error);

            alert("Logout Failed");

        }

    });

}


// =====================================================
// READY
// =====================================================

console.log("================================");
console.log("🍜 Rio Maggi Point");
console.log("Profile Page Ready");
console.log("================================");
