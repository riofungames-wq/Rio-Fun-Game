// =====================================================
// RIO MAGGI POINT
// HISTORY.JS
// PREMIUM VERSION
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

const totalVisits =
document.getElementById("totalVisits");

const totalRewardCount =
document.getElementById("totalRewardCount");

const memberSince =
document.getElementById("memberSince");

const historyTimeline =
document.getElementById("historyTimeline");

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

        loadHistory(customer);

    }

    catch(error){

        console.error(error);

        alert("Unable To Load History");

    }

});

// =====================================================
// LOAD HISTORY
// =====================================================

function loadHistory(customer){

    historyName.textContent =
    customer.name || "Customer";

    historyMember.textContent =
    customer.memberId || "RIO-000000";

    historyStampCount.textContent =
    `${customer.stamps || 0}/6`;

    historyPhoto.src =
    customer.photoURL ||
    "assets/avatars/default.png";

    totalVisits.textContent =
    customer.stamps || 0;

    totalRewardCount.textContent =
    customer.rewardUnlocked ? "1" : "0";

    if(customer.createdAt){

        memberSince.textContent =
        new Date(
            customer.createdAt.seconds * 1000
        ).toLocaleDateString();

    }

    rewardStatus.textContent =
    customer.rewardUnlocked
    ?

    "🎉 Free Veg Maggi Unlocked"

    :

    "🔒 Locked";

    createTimeline(customer);

}
// =====================================================
// CREATE TIMELINE
// =====================================================

function createTimeline(customer){

    historyTimeline.innerHTML = "";

    const stamps = customer.stamps || 0;

    // No Stamp Yet

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

                No Stamp Collected Yet

                </p>

            </div>

        </div>

        `;

        return;

    }

    // Stamp Entries

    for(let i=1; i<=stamps; i++){

        const item = document.createElement("div");

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

            Thank You For Visiting Rio Maggi Point

            </p>

        </div>

        `;

        historyTimeline.appendChild(item);

    }

    // Reward Entry

    if(customer.rewardUnlocked){

        const reward = document.createElement("div");

        reward.className = "timeline-item reward";

        reward.innerHTML = `

        <div class="timeline-icon">

            🎁

        </div>

        <div class="timeline-content">

            <h4>

            Free Veg Maggi Unlocked

            </h4>

            <p>

            Congratulations!

            Your Reward Is Ready.

            </p>

        </div>

        `;

        historyTimeline.appendChild(reward);

    }

}

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("Rio Maggi Point");

console.log("History Page Ready");

console.log("================================");
