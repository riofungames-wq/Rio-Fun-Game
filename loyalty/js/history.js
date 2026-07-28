// =====================================================
// RIO MAGGI POINT
// HISTORY.JS
// FINAL VERSION
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


// =====================================================
// ELEMENTS
// =====================================================

const historyPhoto =
document.getElementById("historyPhoto");

const historyName =
document.getElementById("historyName");

const historyMember =
document.getElementById("historyMember");

const historyStampCount =
document.getElementById("historyStampCount");

const rewardStatus =
document.getElementById("rewardStatus");

const rewardTitle =
document.getElementById("rewardTitle");

const totalVisits =
document.getElementById("totalVisits");

const totalRewardCount =
document.getElementById("totalRewardCount");

const memberSince =
document.getElementById("memberSince");

const historyTimeline =
document.getElementById("historyTimeline");


// =====================================================
// DEFAULT VALUES
// =====================================================

function resetHistory(){

    historyName.textContent = "Customer";

    historyMember.textContent = "RIO-000000";

    historyStampCount.textContent = "0 / 6";

    rewardTitle.textContent = "FREE VEG MAGGI";

    rewardStatus.textContent = "Locked";

    totalVisits.textContent = "0";

    totalRewardCount.textContent = "0";

    memberSince.textContent = "--";

    historyPhoto.src =
    "assets/avatars/default.png";

    historyTimeline.innerHTML = "";

}


// =====================================================
// AUTH CHECK
// =====================================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href = "login.html";

        return;

    }

    try{

        const customerRef =
        doc(db,"customers",user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if(!customerSnap.exists()){

            resetHistory();

            alert("Customer Data Not Found");

            return;

        }

        const customer =
        customerSnap.data();

        loadHistory(customer);

    }

    catch(error){

        console.error(error);

        resetHistory();

        alert("Unable To Load History");

    }

});
// =====================================================
// LOAD CUSTOMER HISTORY
// PART 2
// =====================================================

function loadHistory(customer){

    // ==========================
    // BASIC INFO
    // ==========================

    historyName.textContent =
    customer.name || "Customer";

    historyMember.textContent =
    customer.memberId || "RIO-000000";

    historyPhoto.src =
    customer.photoURL ||
    customer.avatar ||
    "assets/avatars/default.png";

    // ==========================
    // STAMPS
    // ==========================

    const stamps =
    Number(customer.stamps || 0);

    historyStampCount.textContent =
    `${stamps} / 6`;

    // ==========================
    // TOTAL VISITS
    // ==========================

    totalVisits.textContent =
    stamps;

    // ==========================
    // REWARD
    // ==========================

    const rewardUnlocked =
        customer.rewardUnlocked === true ||
        customer.reward === true ||
        stamps >= 6;

    if(rewardUnlocked){

        rewardTitle.textContent =
        "FREE VEG MAGGI";

        rewardStatus.textContent =
        "🎉 Ready To Claim";

        totalRewardCount.textContent =
        "1";

    }

    else{

        rewardTitle.textContent =
        "FREE VEG MAGGI";

        rewardStatus.textContent =
        `Collect ${6 - stamps} More Stamp(s)`;

        totalRewardCount.textContent =
        "0";

    }

    // ==========================
    // MEMBER SINCE
    // ==========================

    if(customer.createdAt){

        try{

            const date =
            customer.createdAt.toDate();

            memberSince.textContent =
            date.toLocaleDateString();

        }

        catch(e){

            memberSince.textContent = "--";

        }

    }

    else{

        memberSince.textContent = "--";

    }

    // ==========================
    // TIMELINE
    // ==========================

    createTimeline(customer);

}
// =====================================================
// CREATE TIMELINE
// PART 3
// =====================================================

function createTimeline(customer){

    historyTimeline.innerHTML = "";

    const stamps =
    Number(customer.stamps || 0);

    // ==========================
    // NO STAMP
    // ==========================

    if(stamps === 0){

        historyTimeline.innerHTML = `

        <div class="timeline-item">

            <div class="timeline-icon">
                🍜
            </div>

            <div class="timeline-content">

                <h4>
                    Welcome To Rio Maggi Point
                </h4>

                <p>
                    Your loyalty journey starts here.
                </p>

            </div>

        </div>

        `;

        return;

    }

    // ==========================
    // STAMP HISTORY
    // ==========================

    for(let i = 1; i <= stamps; i++){

        const item =
        document.createElement("div");

        item.className = "timeline-item";

        item.innerHTML = `

            <div class="timeline-icon">
                ⭐
            </div>

            <div class="timeline-content">

                <h4>
                    Stamp ${i} Collected
                </h4>

                <p>
                    Thank you for visiting Rio Maggi Point.
                </p>

            </div>

        `;

        historyTimeline.appendChild(item);

    }

    // ==========================
    // REWARD ENTRY
    // ==========================

    if(
        customer.rewardUnlocked === true ||
        customer.reward === true ||
        stamps >= 6
    ){

        const reward =
        document.createElement("div");

        reward.className =
        "timeline-item reward";

        reward.innerHTML = `

            <div class="timeline-icon">
                🎁
            </div>

            <div class="timeline-content">

                <h4>
                    FREE VEG MAGGI UNLOCKED
                </h4>

                <p>
                    Congratulations! Your reward is now available.
                </p>

            </div>

        `;

        historyTimeline.appendChild(reward);

    }

}


// =====================================================
// PAGE READY
// =====================================================

console.log("================================");
console.log("🍜 Rio Maggi Point");
console.log("History Page Ready");
console.log("================================");
