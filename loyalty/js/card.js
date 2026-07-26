// =====================================================
// RIO MAGGI POINT
// card.js
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


// ==========================================
// ELEMENTS
// ==========================================

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const playGameBtn =
document.getElementById("playGameBtn");

const loyaltyCard =
document.getElementById("loyaltyCard");


// Stamp Dates

const date1 =
document.getElementById("date1");

const date2 =
document.getElementById("date2");

const date3 =
document.getElementById("date3");

const date4 =
document.getElementById("date4");

const date5 =
document.getElementById("date5");

const date6 =
document.getElementById("date6");


// Stamp Circles

const stamp1 =
document.getElementById("stamp1");

const stamp2 =
document.getElementById("stamp2");

const stamp3 =
document.getElementById("stamp3");

const stamp4 =
document.getElementById("stamp4");

const stamp5 =
document.getElementById("stamp5");

const stamp6 =
document.getElementById("stamp6");


// Happy Emoji

const happyCircle =
document.getElementById("happyCircle");


// ==========================================
// LOGIN CHECK
// ==========================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    try{

        const customerRef =
        doc(db,"customers",user.uid);

        const customerSnap =
        await getDoc(customerRef);

        if(!customerSnap.exists()){

            alert("Customer data not found.");

            window.location.href="signup.html";

            return;

        }

        const customer =
        customerSnap.data();

        loadCustomer(customer);

    }

    catch(error){

        console.error(error);

        alert("Unable to load customer.");

    }

});
// =====================================================
// LOAD CUSTOMER
// =====================================================

function loadCustomer(customer){

    // -----------------------------
    // Name
    // -----------------------------

    customerName.textContent =
    customer.name || "Customer";

    // -----------------------------
    // Member ID
    // -----------------------------

    memberId.textContent =
    customer.memberId || "ID : -----";

    // -----------------------------
    // Avatar
    // -----------------------------

    if(customer.photoURL){

        customerPhoto.src =
        customer.photoURL;

    }

    // -----------------------------
    // Gender Theme
    // -----------------------------

    if(customer.gender){

        const gender =
        customer.gender.toLowerCase();

        loyaltyCard.classList.remove(
            "male-theme",
            "female-theme"
        );

        if(gender==="female"){

            loyaltyCard.classList.add(
                "female-theme"
            );

        }

        else{

            loyaltyCard.classList.add(
                "male-theme"
            );

        }

    }

    // -----------------------------
    // Stamp Count
    // -----------------------------

    loadStampProgress(customer);

}


// =====================================================
// LOAD STAMPS
// =====================================================

function loadStampProgress(customer){

    const stamps =
    customer.stamps || 0;

    const dates =
    customer.stampDates || [];

    const circles=[

        stamp1,
        stamp2,
        stamp3,
        stamp4,
        stamp5,
        stamp6

    ];

    const labels=[

        date1,
        date2,
        date3,
        date4,
        date5,
        date6

    ];

    for(let i=0;i<6;i++){

        circles[i].classList.remove("active");

        labels[i].textContent="";

        if(i<stamps){

            circles[i].classList.add("active");

        }

        if(dates[i]){

            labels[i].textContent=
            formatDate(dates[i]);

        }

    }

    updateHappyEmoji(stamps);

}
// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(value){

    try{

        if(!value) return "";

        // Firestore Timestamp

        if(value.toDate){

            const d=value.toDate();

            return d.toLocaleDateString("en-IN",{

                day:"2-digit",
                month:"short"

            });

        }

        // JS Date

        const d=new Date(value);

        return d.toLocaleDateString("en-IN",{

            day:"2-digit",
            month:"short"

        });

    }

    catch{

        return "";

    }

}


// =====================================================
// HAPPY EMOJI
// =====================================================

function updateHappyEmoji(stamps){

    const emojiList=[

        "🙂",
        "😊",
        "😄",
        "🤩",
        "🥳",
        "😍",
        "🎉"

    ];

    let index=Math.min(stamps,6);

    happyCircle.textContent=emojiList[index];

}


// =====================================================
// PLAY GAME
// =====================================================

playGameBtn.addEventListener("click",()=>{

    window.location.href="game.html";

});


// =====================================================
// FUTURE REWARD LOGIC
// =====================================================
// Circle 7 (Veg Maggi) unlock
// will be controlled from Admin Panel.
// Firebase reward flag can be added later.
// =====================================================
