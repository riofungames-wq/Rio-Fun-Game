// =====================================================
// RIO MAGGI POINT
// FEEDBACK.JS
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
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =====================================================
// ELEMENTS
// =====================================================

const feedbackPhoto =
document.getElementById("feedbackPhoto");

const feedbackName =
document.getElementById("feedbackName");

const feedbackMember =
document.getElementById("feedbackMember");

const reviewText =
document.getElementById("reviewText");

const charCount =
document.getElementById("charCount");

const submitFeedback =
document.getElementById("submitFeedback");

const thankYouBox =
document.getElementById("thankYouBox");

const ratingText =
document.getElementById("ratingText");

const stars =
document.querySelectorAll(".star");

const emojis =
document.querySelectorAll(".emoji-btn");

// =====================================================
// VARIABLES
// =====================================================

let currentCustomer = null;

let selectedRating = 0;

let selectedEmoji = "";

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

        loadCustomer(currentCustomer);

    }

    catch(error){

        console.error(error);

        alert("Unable To Load Customer");

    }

});

// =====================================================
// LOAD CUSTOMER
// =====================================================

function loadCustomer(customer){

    feedbackPhoto.src =
    customer.photoURL ||
    "assets/avatars/default.png";

    feedbackName.textContent =
    customer.name;

    feedbackMember.textContent =
    customer.memberId;

}

// =====================================================
// CHARACTER COUNTER
// =====================================================

reviewText.addEventListener("input",()=>{

    charCount.textContent =
    reviewText.value.length;

});
// =====================================================
// STAR RATING
// =====================================================

stars.forEach(star=>{

    star.addEventListener("click",()=>{

        selectedRating =
        Number(star.dataset.rate);

        stars.forEach(item=>{

            item.classList.remove("fa-solid");

            item.classList.add("fa-regular");

        });

        for(let i=0;i<selectedRating;i++){

            stars[i].classList.remove("fa-regular");

            stars[i].classList.add("fa-solid");

        }

        ratingText.textContent =
        `${selectedRating} / 5 Stars`;

    });

});

// =====================================================
// EMOJI
// =====================================================

emojis.forEach(btn=>{

    btn.addEventListener("click",()=>{

        emojis.forEach(item=>{

            item.classList.remove("active");

        });

        btn.classList.add("active");

        selectedEmoji =
        btn.textContent;

    });

});

// =====================================================
// SUBMIT FEEDBACK
// =====================================================

submitFeedback.addEventListener("click",async()=>{

    if(!currentCustomer){

        return;

    }

    if(selectedRating===0){

        alert("Please Select Rating");

        return;

    }

    try{

        await addDoc(

            collection(db,"feedback"),

            {

                uid:
                currentCustomer.uid,

                memberId:
                currentCustomer.memberId,

                customerName:
                currentCustomer.name,

                photoURL:
                currentCustomer.photoURL || "",

                rating:
                selectedRating,

                emoji:
                selectedEmoji,

                review:
                reviewText.value.trim(),

                createdAt:
                serverTimestamp()

            }

        );

        thankYouBox.style.display="block";

        reviewText.value="";

        charCount.textContent="0";

        selectedRating=0;

        selectedEmoji="";

        stars.forEach(item=>{

            item.classList.remove("fa-solid");

            item.classList.add("fa-regular");

        });

        emojis.forEach(item=>{

            item.classList.remove("active");

        });

        ratingText.textContent="Tap A Star";

        alert("✅ Feedback Submitted Successfully");

    }

    catch(error){

        console.error(error);

        alert("❌ Failed To Submit Feedback");

    }

});

// =====================================================
// READY
// =====================================================

console.log("================================");

console.log("🍜 Rio Maggi Point");

console.log("Feedback Page Ready");

console.log("================================");
