// =====================================
// RIO MAGGI POINT
// PREMIUM CARD
// PART 1
// =====================================


// ============================
// FIREBASE IMPORT
// ============================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================
// HTML ELEMENTS
// ============================

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const customerPhoto =
document.getElementById("customerPhoto");

const countdownDays =
document.getElementById("countdownDays");

const rewardCircle =
document.getElementById("rewardCircle");


// ============================
// DEFAULT DATA
// ============================

function setDefaultData() {

    customerName.textContent = "Customer";

    memberId.textContent = "RIO-000000";

    customerPhoto.src = "assets/avatars/male.png";

}


// ============================
// LOAD CUSTOMER
// ============================

async function loadCustomerData(user) {

    try {

        const customerRef =
        doc(db, "customers", user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if (!customerSnap.exists()) {

            setDefaultData();
            return;

        }

        const data =
        customerSnap.data();

        customerName.textContent =
        data.name || "Customer";

        memberId.textContent =
        data.memberId || "RIO-000000";

        if (data.avatar) {

            customerPhoto.src = data.avatar;

        } else {

            customerPhoto.src =
            "assets/avatars/male.png";

        }

    }

    catch (error) {

        console.error("Customer Load Error:", error);

        setDefaultData();

    }

}
// =====================================
// STAMP SYSTEM
// PART 2
// =====================================


// Stamp IDs

const stampIds = [

"stamp1",
"stamp2",
"stamp3",
"stamp4",
"stamp5",
"stamp6"

];




// ============================
// UPDATE STAMPS
// ============================

function updateStampDisplay(stampCount){

    stampIds.forEach((id,index)=>{

        const stamp =
        document.getElementById(id);

        if(!stamp) return;

        if(index < stampCount){

            stamp.classList.add("active");

        }

        else{

            stamp.classList.remove("active");

        }

    });

}




// ============================
// UPDATE REWARD
// ============================

function updateRewardDisplay(stampCount){

    if(!rewardCircle) return;

    if(stampCount >= 6){

        rewardCircle.classList.add("active");

        rewardCircle.innerHTML =

        `

        <div class="reward-label">

        FREE<br>

        VEG<br>

        MAGGI

        </div>

        `;

    }

    else{

        rewardCircle.classList.remove("active");

        rewardCircle.innerHTML =

        `

        <div class="reward-label">

        FREE<br>

        VEG<br>

        MAGGI

        </div>

        `;

    }

}




// ============================
// LOAD STAMPS
// ============================

async function loadStampData(user){

    try{

        const customerRef =

        doc(db,"customers",user.uid);

        const customerSnap =

        await getDoc(customerRef);

        if(!customerSnap.exists()) return;

        const data =

        customerSnap.data();

        const stampCount =

        data.stamps || 0;

        updateStampDisplay(stampCount);

        updateRewardDisplay(stampCount);

    }

    catch(error){

        console.error(

        "Stamp Load Error:",

        error

        );

    }

}
// =====================================
// COUNTDOWN + BUTTONS + AUTH
// PART 3
// =====================================


// ============================
// COUNTDOWN
// ============================

function updateResetCountdown(cycleStart){

    if(!countdownDays) return;

    const startDate = new Date(cycleStart);

    const resetDate = new Date(startDate);

    resetDate.setDate(resetDate.getDate()+40);

    const now = new Date();

    const diff = resetDate - now;

    if(diff<=0){

        countdownDays.textContent="0 DAYS";

        return;

    }

    const days = Math.ceil(

        diff/(1000*60*60*24)

    );

    countdownDays.textContent=

    days+" DAYS";

}




async function loadCountdownData(user){

    try{

        const customerRef=

        doc(db,"customers",user.uid);

        const customerSnap=

        await getDoc(customerRef);

        if(!customerSnap.exists()) return;

        const data=

        customerSnap.data();

        if(data.cycleStart){

            updateResetCountdown(data.cycleStart);

        }

    }

    catch(error){

        console.error(

        "Countdown Error:",

        error

        );

    }

}




// ============================
// CONTACT BUTTONS
// ============================

document.getElementById("callBtn")?.addEventListener(

"click",

()=>{

window.location.href="tel:YOUR_PHONE_NUMBER";

}

);



document.getElementById("whatsappBtn")?.addEventListener(

"click",

()=>{

window.open(

"https://wa.me/YOUR_WHATSAPP_NUMBER",

"_blank"

);

}

);



document.getElementById("mapBtn")?.addEventListener(

"click",

()=>{

window.open(

"YOUR_GOOGLE_MAP_LINK",

"_blank"

);

}

);




// ============================
// AUTH
// ============================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

console.log("LOGIN UID:",user.uid);

await loadCustomerData(user);

await loadStampData(user);

await loadCountdownData(user);

console.log("Rio Maggi Point Card Loaded Successfully");

}

);
