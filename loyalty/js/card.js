// ==========================================
// RIO MAGGI POINT
// PREMIUM CARD
// FINAL VERSION
// ==========================================

import { firebaseConfig } from "./firebase-config.js";

import { initializeApp }
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

// ==========================================
// FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// ==========================================
// HTML
// ==========================================

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const ownerNumber =
document.getElementById("ownerNumber");

// ==========================================
// LOGIN CHECK
// ==========================================

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

loadCustomer(user.uid);

});

// ==========================================
// CUSTOMER
// ==========================================

async function loadCustomer(uid){

try{

const ref =
doc(db,"customers",uid);

const snap =
await getDoc(ref);

if(!snap.exists()) return;

const data = snap.data();

// Name

customerName.textContent =
data.name || "Customer";

// Member ID

memberId.textContent =
"ID : " + (data.memberId || "------");

// Avatar

if(data.photoURL){

customerPhoto.src =
data.photoURL;

}
else{

customerPhoto.src =
"assets/avatar/default.png";

}

// Stamp Dates

for(let i=1;i<=6;i++){

const el =
document.getElementById("date"+i);

if(el){

el.textContent =
data["stamp"+i] || "";

}

}

}
catch(e){

console.log(e);

}

}

// ==========================================
// PLAY GAME
// ==========================================

const playBtn =
document.getElementById("playGameBtn");

if(playBtn){

playBtn.onclick=function(){

window.open(

"https://riofungames-wq.github.io/Rio-Fun-Game/",

"_blank"

);

};

}

// ==========================================
// DOWNLOAD CARD
// ==========================================

window.downloadCard=function(){

alert(
"Download Module Next Step"
);

};

// ==========================================
// LOG
// ==========================================

console.log("RIO Premium Card Loaded");
