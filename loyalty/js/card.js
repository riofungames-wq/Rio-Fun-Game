// ======================================
// RIO MAGGI POINT
// PREMIUM CARD V3
// FIREBASE
// PART 1
// ======================================

import { firebaseConfig }
from "../js/firebase-config.js";

import {
initializeApp
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
getFirestore,
doc,
getDoc
}
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ======================================
// FIREBASE
// ======================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// ======================================
// HTML ELEMENTS
// ======================================

const customerCard =
document.getElementById("customerCard");

const customerPhoto =
document.getElementById("customerPhoto");

const avatarDisplay =
document.getElementById("avatarDisplay");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const memberBadge =
document.getElementById("memberBadge");

const customerLevel =
document.getElementById("customerLevel");

const stampProgress =
document.getElementById("stampProgress");

const rewardMessage =
document.getElementById("rewardMessage");

const qrCustomerName =
document.getElementById("qrCustomerName");

const qrCustomerId =
document.getElementById("qrCustomerId");

const qrCodeBox =
document.getElementById("qrCodeBox");

// ======================================
// LOAD CUSTOMER
// ======================================

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

try{

const customerRef = doc(
db,
"customers",
user.uid
);

const snap = await getDoc(customerRef);

if(!snap.exists()){

console.log("Customer Not Found");

return;

}

const data = snap.data();

// Name

customerName.textContent =
data.name || "Customer";

// QR Name

qrCustomerName.textContent =
data.name || "Customer";

// Member ID

const id =
data.memberId || user.uid;

memberId.textContent =
"Member ID : " + id;

qrCustomerId.textContent =
"Member ID : " + id;

// Avatar

loadAvatar(data);

// Gender Theme

applyTheme(data);

// Member Level

updateMemberLevel(data.stamps || 0);

// Stamp

loadStamps(data.stamps || 0);

// QR

generateQR(id);

}

catch(err){

console.error(err);

}

});
// ======================================
// RIO MAGGI POINT
// PREMIUM CARD V3
// PART 2
// ======================================

// ======================================
// LOAD AVATAR
// ======================================

function loadAvatar(data){

if(data.photoURL){

customerPhoto.src = data.photoURL;

customerPhoto.style.display = "block";

avatarDisplay.style.display = "none";

}

else{

customerPhoto.style.display = "none";

avatarDisplay.style.display = "flex";

avatarDisplay.textContent =
data.avatar || "😊";

}

}

// ======================================
// APPLY GENDER THEME
// ======================================

function applyTheme(data){

customerCard.classList.remove(
"male",
"female"
);

// Expected values:
// "male", "female", "boy", "girl", "M", "F"

const gender =
(data.gender || "")
.toLowerCase();

if(
gender === "female" ||
gender === "girl" ||
gender === "f"
){

customerCard.classList.add("female");

}

else{

customerCard.classList.add("male");

}

}

// ======================================
// MEMBER LEVEL
// ======================================

function updateMemberLevel(stamps){

let level = "";
let badge = "";

if(stamps >= 6){

level = "👑 Elite Member";
badge = "👑 ELITE MEMBER";

}

else if(stamps >= 3){

level = "🥇 Gold Member";
badge = "🥇 GOLD MEMBER";

}

else{

level = "⭐ Silver Member";
badge = "⭐ SILVER MEMBER";

}

customerLevel.textContent = level;

memberBadge.textContent = badge;

}
