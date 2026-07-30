// =====================================
// RIO MAGGI POINT
// QR.JS
// FINAL PREMIUM VERSION
// PART 1 / 3
// =====================================


// ============================
// FIREBASE IMPORT
// ============================

import { auth, db } from "./firebase-config.js";

import {

onAuthStateChanged

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


import {

doc,

getDoc

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



// ============================
// ELEMENTS
// ============================

const customerName =
document.getElementById("customerName");

const memberId =
document.getElementById("memberId");

const customerPhoto =
document.getElementById("customerPhoto");

const qrBox =
document.getElementById("qrcode");

const qrStatus =
document.getElementById("qrStatus");



// ============================
// DEFAULT DATA
// ============================

function setDefaultData(){

if(customerName){

customerName.textContent="Customer";

}

if(memberId){

memberId.textContent="RIO-000000";

}

if(customerPhoto){

customerPhoto.src="assets/avatars/male.png";

}

}



// ============================
// LOAD CUSTOMER
// ============================

async function loadCustomerData(user){

try{

const customerRef=

doc(

db,

"customers",

user.uid

);

const snapshot=

await getDoc(customerRef);

if(!snapshot.exists()){

setDefaultData();

if(qrStatus){

qrStatus.textContent="Customer Data Not Found";

}

return null;

}

const customer=snapshot.data();

if(customerName){

customerName.textContent=

customer.name ||

"Customer";

}

if(memberId){

memberId.textContent=

customer.memberId ||

"RIO-000000";

}

if(customerPhoto){

customerPhoto.src=

customer.photoURL ||

customer.avatar ||

"assets/avatars/male.png";

}

return{

uid:user.uid,

memberId:

customer.memberId ||

"RIO-000000"

};

}

catch(error){

console.error("QR LOAD ERROR",error);

if(qrStatus){

qrStatus.textContent="Unable To Load QR";

}

return null;

}

}
// =====================================
// PREMIUM QR GENERATE
// PART 2 / 3
// =====================================

function generateQR(customer){

if(!qrBox){

return;

}


// REMOVE OLD QR

qrBox.innerHTML = "";


// QR DATA

const qrData={

type:"RIO_MAGGI_LOYALTY",

uid:customer.uid,

memberId:customer.memberId

};


// GENERATE QR

new QRCode(

qrBox,

{

text:JSON.stringify(qrData),

width:220,

height:220,

colorDark:"#111111",

colorLight:"#ffffff",

correctLevel:QRCode.CorrectLevel.H

}

);


// PREMIUM STATUS

if(qrStatus){

qrStatus.innerHTML=

`
<i class="fa-solid fa-circle-check"></i>
&nbsp;
Ready To Scan At Counter
`;

}

}


// =====================================
// REFRESH QR
// =====================================

function refreshQR(customer){

generateQR(customer);

}


// =====================================
// END PART 2
// =====================================
// =====================================
// AUTH CONNECTION
// PART 3 / 3
// =====================================

onAuthStateChanged(

auth,

async(user)=>{

// USER NOT LOGGED IN

if(!user){

window.location.href="login.html";

return;

}

try{

// LOAD CUSTOMER

const customer=

await loadCustomerData(user);


// GENERATE QR

if(customer){

refreshQR(customer);

}

console.log("================================");
console.log("🍜 Rio Maggi Point");
console.log("Premium QR Loaded Successfully");
console.log("================================");

}

catch(error){

console.error(

"QR INITIALIZATION ERROR",

error

);

if(qrStatus){

qrStatus.innerHTML=

`
<i class="fa-solid fa-triangle-exclamation"></i>
&nbsp;
Unable To Generate QR
`;

}

}

});


// =====================================
// AUTO REFRESH QR
// =====================================

document.addEventListener(

"visibilitychange",

()=>{

if(document.visibilityState==="visible"){

const user=auth.currentUser;

if(user){

loadCustomerData(user)

.then((customer)=>{

if(customer){

refreshQR(customer);

}

});

}

}

});


// =====================================
// END OF QR.JS
// =====================================
