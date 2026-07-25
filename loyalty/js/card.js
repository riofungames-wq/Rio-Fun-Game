// ======================================
// RIO MAGGI POINT
// PREMIUM CARD
// FIREBASE
// ======================================

import { firebaseConfig }
from "./firebase-config.js";

import {
initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
getAuth,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
getFirestore,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// ======================================
// FIREBASE INIT
// ======================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// ======================================
// HTML ELEMENTS
// ======================================

const customerPhoto =
document.getElementById("customerPhoto");

const defaultAvatar =
document.getElementById("defaultAvatar");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const mobileNumber =
document.getElementById("mobileNumber");

const announcementBar =
document.getElementById("announcementBar");

const announcementText =
document.getElementById("announcementText");

// ======================================
// AUTH CHECK
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

alert("Customer Not Found");

return;

}

const data = snap.data();

loadCustomer(data);

loadAnnouncement();

}
catch(error){

console.error(error);

}

});

// ======================================
// LOAD CUSTOMER
// ======================================

function loadCustomer(data){

customerName.textContent =
data.name || "Customer";

memberId.textContent =
"Member ID : " +
(data.memberId || "-----");

mobileNumber.textContent =
data.mobile || "No Mobile";

// Photo

if(data.photoURL){

customerPhoto.src =
data.photoURL;

customerPhoto.style.display =
"block";

defaultAvatar.style.display =
"none";

}
else{

customerPhoto.style.display =
"none";

defaultAvatar.style.display =
"flex";

// अभी Temporary
defaultAvatar.innerHTML="👤";

}

}

// ======================================
// LOAD ANNOUNCEMENT
// ======================================

async function loadAnnouncement(){

try{

const announcementRef = doc(
db,
"settings",
"announcement"
);

const snap =
await getDoc(announcementRef);

if(!snap.exists()){

announcementBar.style.display="none";

return;

}

const data=snap.data();

if(data.active){

announcementBar.style.display="flex";

announcementText.textContent=
data.message;

}
else{

announcementBar.style.display="none";

}

}
catch(e){

console.log(e);

}

}

// ======================================
// DOWNLOAD BUTTON
// ======================================

document
.getElementById("downloadCard")
.addEventListener("click",()=>{

alert(
"Download Feature Coming Next"
);

});

// ======================================
// PLAY GAME
// ======================================

document
.getElementById("playGameBtn")
.addEventListener("click",()=>{

window.open(
"https://riofungames-wq.github.io/Rio-Fun-Game/",
"_blank"
);

});

// ======================================
// LOGOUT
// ======================================

window.logout=function(){

signOut(auth)
.then(()=>{

window.location.href="login.html";

});

};

console.log(
"Premium Card Loaded"
);
