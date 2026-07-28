// =====================================================
// RIO MAGGI POINT
// FEEDBACK.JS
// PREMIUM CUSTOMER REVIEW SYSTEM
// PART 1
// =====================================================


// ============================
// FIREBASE IMPORT
// ============================

import { auth, db } from "./firebase-config.js";


import {

onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";



import {

doc,

getDoc,

collection,

addDoc,

serverTimestamp

}

from

"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";




// ============================
// HTML ELEMENTS
// ============================


const feedbackPhoto =
document.getElementById(
"feedbackPhoto"
);



const feedbackName =
document.getElementById(
"feedbackName"
);



const feedbackMember =
document.getElementById(
"feedbackMember"
);



const reviewText =
document.getElementById(
"reviewText"
);



const charCount =
document.getElementById(
"charCount"
);



const submitFeedback =
document.getElementById(
"submitFeedback"
);



const thankYouBox =
document.getElementById(
"thankYouBox"
);



const ratingText =
document.getElementById(
"ratingText"
);



const stars =
document.querySelectorAll(
".star"
);



const emojis =
document.querySelectorAll(
".emoji-btn"
);




// ============================
// VARIABLES
// ============================


let currentCustomer = null;


let selectedRating = 0;


let selectedEmoji = "";


let isSubmitting = false;



// ============================
// AUTH CHECK
// ============================


onAuthStateChanged(
auth,
async(user)=>{


if(!user){


window.location.href =
"login.html";


return;


}



try{


const customerRef =

doc(

db,

"customers",

user.uid

);



const customerSnap =

await getDoc(

customerRef

);



if(!customerSnap.exists()){


alert(
"Customer Data Not Found"
);


return;


}



currentCustomer =

customerSnap.data();



currentCustomer.uid =

user.uid;



loadCustomer(
currentCustomer
);



}



catch(error){


console.error(

"Feedback Customer Load Error:",

error

);



}



});

// ============================
// LOAD CUSTOMER DATA
// ============================


function loadCustomer(customer){


if(feedbackPhoto){


feedbackPhoto.src =

customer.avatar ||

customer.photoURL ||

"assets/avatars/default.png";


}



if(feedbackName){


feedbackName.textContent =

customer.name ||

"Customer";


}



if(feedbackMember){


feedbackMember.textContent =

customer.memberId ||

"RIO-000000";


}



}



// ============================
// CHARACTER COUNTER
// ============================


if(reviewText){


reviewText.addEventListener(

"input",

()=>{


if(charCount){


charCount.textContent =

reviewText.value.length;


}


}

);


}



// ============================
// STAR RATING SYSTEM
// ============================


stars.forEach(

(star)=>{


star.addEventListener(

"click",

()=>{


selectedRating =

Number(

star.dataset.rate

);



stars.forEach(

(item)=>{


item.classList.remove(

"fa-solid"

);


item.classList.add(

"fa-regular"

);


}

);



for(

let i = 0;

i < selectedRating;

i++

){


stars[i].classList.remove(

"fa-regular"

);



stars[i].classList.add(

"fa-solid"

);


}



if(ratingText){


ratingText.textContent =

selectedRating +

" / 5 Stars";


}



}

);


}

);



// ============================
// EMOJI SELECT
// ============================


emojis.forEach(

(button)=>{


button.addEventListener(

"click",

()=>{


emojis.forEach(

(item)=>{


item.classList.remove(

"active"

);


}

);



button.classList.add(

"active"

);



selectedEmoji =

button.textContent.trim();


}

);


}

);

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



if(selectedRating === 0){


alert(
"Please Select Rating"
);


return;


}



isSubmitting = true;



submitFeedback.disabled = true;



submitFeedback.innerHTML =

`<i class="fa-solid fa-spinner fa-spin"></i> Sending...`;



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

currentCustomer.avatar || "",



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



if(thankYouBox){


thankYouBox.style.display =

"block";


}



reviewText.value = "";



if(charCount){


charCount.textContent =

"0";


}



selectedRating = 0;


selectedEmoji = "";



stars.forEach(

(item)=>{


item.classList.remove(

"fa-solid"

);



item.classList.add(

"fa-regular"

);


}

);



emojis.forEach(

(item)=>{


item.classList.remove(

"active"

);


}

);



if(ratingText){


ratingText.textContent =

"Tap A Star";


}



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



submitFeedback.innerHTML =

`

<i class="fa-solid fa-paper-plane"></i>

Submit Feedback

`;



}



}

);


}



// ============================
// READY
// ============================


console.log(
"================================"
);


console.log(
"🍜 Rio Maggi Point Feedback Ready"
);


console.log(
"================================"
);
