// ======================================
// RIO LOYALTY CLUB
// FIREBASE SIGNUP
// PART 1
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getFirestore,
doc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);
// ======================================
// PART 2
// CREATE FIREBASE ACCOUNT
// ======================================

document.addEventListener("signup-ready", async () => {

const data = window.signupData;

try{

// Create Firebase Authentication User

const userCredential = await createUserWithEmailAndPassword(

auth,
data.email,
data.password

);

const user = userCredential.user;

// Generate Member ID

const memberId = "RIO-" + Date.now();

// Save Customer

await setDoc(doc(db,"customers",user.uid),{

uid:user.uid,

memberId:memberId,

name:data.name,

mobile:data.mobile,

email:data.email,

gender:data.gender,

avatar:data.avatar,

stamps:0,

reward:false,

rewardUnlocked:false,

rewardRedeemed:false,

status:"active",

createdAt:serverTimestamp(),

updatedAt:serverTimestamp()

});
  // ======================================
// PART 3
// SUCCESS + ERROR + REDIRECT
// ======================================

alert("🎉 Account Created Successfully!");

window.location.href = "index.html";

}

catch(error){

console.error(error);

switch(error.code){

case "auth/email-already-in-use":

alert("This email is already registered.");

break;

case "auth/invalid-email":

alert("Invalid email address.");

break;

case "auth/weak-password":

alert("Password should be at least 6 characters.");

break;

case "auth/network-request-failed":

alert("Network error. Please check your internet connection.");

break;

default:

alert(error.message);

}

}

});
