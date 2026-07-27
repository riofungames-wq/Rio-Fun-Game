// =====================================================
// RIO MAGGI POINT
// REWARD.JS
// PREMIUM VERSION
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const rewardPhoto =
document.getElementById("rewardPhoto");

const rewardName =
document.getElementById("rewardName");

const rewardMemberId =
document.getElementById("rewardMemberId");

const rewardStatus =
document.getElementById("rewardStatus");

const rewardProgressFill =
document.getElementById("rewardProgressFill");

const rewardStampCount =
document.getElementById("rewardStampCount");

const claimRewardBtn =
document.getElementById("claimRewardBtn");

const claimMessage =
document.getElementById("claimMessage");

const redeemStatus =
document.getElementById("redeemStatus");

// =====================================================

let currentUID = "";

let currentCustomer = null;

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

        currentCustomer =
        customerSnap.data();

        loadReward(currentCustomer);

    }

    catch(error){

        console.error(error);

        alert("Unable To Load Reward");

    }

});

// =====================================================
// LOAD REWARD
// =====================================================

function loadReward(customer){

    rewardPhoto.src =
    customer.photoURL ||
    "assets/avatars/default.png";

    rewardName.textContent =
    customer.name;

    rewardMemberId.textContent =
    customer.memberId;

    const stamps =
    customer.stamps || 0;

    rewardStampCount.textContent =
    stamps;

    rewardProgressFill.style.width =
    `${(stamps/6)*100}%`;

    if(customer.rewardUnlocked){

        rewardStatus.textContent =
        "🎉 Reward Unlocked";

        claimMessage.textContent =
        "You Can Claim Your Free Veg Maggi.";

        claimRewardBtn.disabled = false;

        redeemStatus.textContent =
        "Ready To Redeem";

    }

    else{

        rewardStatus.textContent =
        "🔒 Reward Locked";

        claimMessage.textContent =
        `Collect ${6-stamps} More Stamp(s).`;

        claimRewardBtn.disabled = true;

        redeemStatus.textContent =
        "Locked";

    }

}
// =====================================================
// CLAIM REWARD
// =====================================================

claimRewardBtn.addEventListener("click", async()=>{

    if(!currentCustomer) return;

    if(!currentCustomer.rewardUnlocked){

        alert("Reward Not Unlocked Yet");

        return;

    }

    const confirmClaim = confirm(

        "Claim Your FREE VEG MAGGI?"

    );

    if(!confirmClaim) return;

    try{

        await updateDoc(

            doc(db,"customers",currentUID),

            {

                rewardUnlocked:false,

                rewardClaimed:true,

                rewardClaimDate:serverTimestamp(),

                stamps:0,

                updatedAt:serverTimestamp()

            }

        );

        rewardStatus.textContent =
        "✅ Reward Claimed";

        redeemStatus.textContent =
        "Redeemed";

        claimMessage.textContent =
        "Your Reward Has Been Successfully Claimed.";

        rewardProgressFill.style.width = "0%";

        rewardStampCount.textContent = "0";

        claimRewardBtn.disabled = true;

        alert("🎉 Enjoy Your FREE VEG MAGGI!");

    }

    catch(error){

        console.error(error);

        alert("❌ Failed To Claim Reward");

    }

});

// =====================================================
// FUTURE FUNCTIONS
// =====================================================

// Future:
//
// Admin Redeem Verification
//
// Reward History
//
// Multiple Reward Levels
//
// Coupon Support

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Reward Page Ready");

console.log("================================");
