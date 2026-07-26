// ==========================================
// RIO MAGGI POINT
// QR PAGE
// PART 1
// ==========================================

import { auth, db }
from "./firebase-config.js";

import {

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

doc,
getDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ==========================================
// HTML
// ==========================================

const qrCard =
document.getElementById("qrCard");

const customerPhoto =
document.getElementById("customerPhoto");

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const qrBox =
document.getElementById("qrcode");

const downloadBtn =
document.getElementById("downloadQR");

const shareBtn =
document.getElementById("shareQR");

// ==========================================
// LOGIN
// ==========================================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

loadCustomer(user.uid);

}

);

// ==========================================
// LOAD CUSTOMER
// ==========================================

async function loadCustomer(uid){

try{

const ref =

doc(db,"customers",uid);

const snap =

await getDoc(ref);

if(!snap.exists()) return;

const data =

snap.data();

// =====================
// NAME
// =====================

customerName.textContent =
data.name || "Customer";

// =====================
// MEMBER ID
// =====================

memberId.textContent =
"ID : " +
(data.memberId || "------");

// =====================
// THEME
// =====================

qrCard.classList.remove(
"theme-male",
"theme-female"
);

if(data.gender==="female"){

qrCard.classList.add(
"theme-female"
);

}else{

qrCard.classList.add(
"theme-male"
);

}

// =====================
// PHOTO
// =====================

if(data.photoURL){

customerPhoto.src =
data.photoURL;

}else{

if(data.gender==="female"){

customerPhoto.src =
"assets/avatars/female.png";

}else{

customerPhoto.src =
"assets/avatars/male.png";

}

}

// =====================
// CREATE QR
// =====================

const qrData =
JSON.stringify({

type:"customer",

uid:uid,

memberId:
data.memberId || "",

name:
data.name || ""

});

qrBox.innerHTML="";

new QRCode(

qrBox,

{

text:qrData,

width:220,

height:220,

correctLevel:
QRCode.CorrectLevel.H

}

);

}catch(err){

console.log(err);

}

}
// ==========================================
// DOWNLOAD QR
// ==========================================

downloadBtn.addEventListener(

"click",

()=>{

const img =

qrBox.querySelector("img");

if(!img){

alert("QR Not Ready");

return;

}

const link =

document.createElement("a");

link.href =

img.src;

link.download =

"Rio_Maggi_QR.png";

link.click();

}

// ==========================================
// SHARE QR
// ==========================================

);

shareBtn.addEventListener(

"click",

async()=>{

const img =

qrBox.querySelector("img");

if(!img){

alert("QR Not Ready");

return;

}

try{

if(navigator.share){

await navigator.share({

title:

"Rio Maggi Point",

text:

"My Loyalty QR",

url:

img.src

});

}

else{

navigator.clipboard.writeText(

img.src

);

alert(

"QR Link Copied"

);

}

}

catch(err){

console.log(err);

}

}

// ==========================================
// );

READY
// ==========================================

console.log(

"RIO QR READY"

);
