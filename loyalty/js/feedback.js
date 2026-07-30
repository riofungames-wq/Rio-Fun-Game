// =====================================================
// RIO MAGGI POINT
// FEEDBACK.JS
// FINAL PREMIUM VERSION
// PART 1 / 3
// =====================================================

// ============================
// FIREBASE IMPORT
// ============================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ============================
// HTML ELEMENTS
// ============================

const feedbackPhoto = document.getElementById("feedbackPhoto");
const feedbackName = document.getElementById("feedbackName");
const feedbackMember = document.getElementById("feedbackMember");

const reviewText = document.getElementById("reviewText");
const charCount = document.getElementById("charCount");

const submitFeedback = document.getElementById("submitFeedback");
const thankYouBox = document.getElementById("thankYouBox");

const ratingText = document.getElementById("ratingText");

const stars = document.querySelectorAll(".star");
const emojis = document.querySelectorAll(".emoji-btn");

// ============================
// VARIABLES
// ============================

let currentCustomer = null;
let selectedRating = 0;
let selectedEmoji = "";
let isSubmitting = false;

// ============================
// SAFE TEXT FUNCTION
// ============================

function setText(element, value) {

    if (element) {

        element.textContent = value;

    }

}

// ============================
// AUTH CHECK
// ============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    try {

        const customerRef = doc(db, "customers", user.uid);

        const customerSnap = await getDoc(customerRef);

        if (!customerSnap.exists()) {

            alert("Customer data not found.");
            return;

        }

        currentCustomer = customerSnap.data();
        currentCustomer.uid = user.uid;

        loadCustomer(currentCustomer);

    }

    catch (error) {

        console.error("Customer Load Error:", error);
        alert("Unable to load customer profile.");

    }

});

// ============================
// LOAD CUSTOMER
// ============================

function loadCustomer(customer) {

    if (feedbackPhoto) {

        feedbackPhoto.src =
            customer.avatar ||
            customer.photoURL ||
            "assets/avatars/default.png";

    }

    setText(
        feedbackName,
        customer.name || "Customer"
    );

    setText(
        feedbackMember,
        customer.memberId || "RIO-000000"
    );

}
// ============================
// RESET FORM
// ============================

function resetFeedbackForm(){

    selectedRating = 0;

    selectedEmoji = "";

    reviewText.value = "";

    if(charCount){
        charCount.textContent = "0";
    }

    if(ratingText){
        ratingText.textContent = "Tap A Star";
    }

    stars.forEach((star)=>{

        star.classList.remove(
            "fa-solid",
            "active"
        );

        star.classList.add(
            "fa-regular"
        );

    });

    emojis.forEach((emoji)=>{

        emoji.classList.remove(
            "active"
        );

    });

}



// ============================
// SUBMIT FEEDBACK
// ============================

if(submitFeedback){

submitFeedback.addEventListener(

"click",

async()=>{

if(isSubmitting){

return;

}

if(!currentCustomer){

alert(
"Customer Not Loaded"
);

return;

}

if(selectedRating===0){

alert(
"Please select your rating."
);

return;

}

const review = reviewText.value.trim();

isSubmitting = true;

submitFeedback.disabled = true;

submitFeedback.innerHTML =

`<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;

try{

await addDoc(

collection(
db,
"feedback"
),

{

uid:
currentCustomer.uid,

memberId:
currentCustomer.memberId || "",

customerName:
currentCustomer.name || "Customer",

avatar:
currentCustomer.avatar ||
currentCustomer.photoURL ||
"",

rating:
selectedRating,

emoji:
selectedEmoji,

review:
review,

createdAt:
serverTimestamp()

}

);

if(thankYouBox){

thankYouBox.style.display =
"block";

}

resetFeedbackForm();

setTimeout(()=>{

if(thankYouBox){

thankYouBox.style.display =
"none";

}

},3000);
          alert(
            "✅ Feedback Submitted Successfully"
        );

    }

    catch(error){

        console.error(
            "Feedback Submit Error:",
            error
        );

        alert(
            "❌ Feedback Submit Failed"
        );

    }

    finally{

        isSubmitting = false;

        submitFeedback.disabled = false;

        submitFeedback.innerHTML = `

<i class="fa-solid fa-paper-plane"></i>

Submit Feedback

`;

    }

});

}



// ============================
// PAGE READY
// ============================

console.log(
"================================"
);

console.log(
"🍜 Rio Maggi Point"
);

console.log(
"Premium Feedback System Active"
);

console.log(
"Firebase Feedback Connected"
);

console.log(
"================================"
);
