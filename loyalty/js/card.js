// ======================================
// RIO MAGGI POINT
// CUSTOMER CARD JS
// FIREBASE CONNECT
// PART 1
// ======================================


// Firebase Config

import { firebaseConfig } from "../firebase-config.js";


// Firebase

import {

initializeApp

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";


import {

getAuth,
onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


import {

getFirestore,
doc,
getDoc

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";




// Initialize Firebase


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = getFirestore(app);




// ======================================
// HTML ELEMENTS
// ======================================


const customerName = 
document.getElementById("customerName");


const memberId = 
document.getElementById("memberId");


const avatarDisplay = 
document.getElementById("avatarDisplay");


const customerPhoto = 
document.getElementById("customerPhoto");


const qrCodeBox = 
document.getElementById("qrCodeBox");


const qrCustomerId = 
document.getElementById("qrCustomerId");





// ======================================
// LOAD CUSTOMER DATA
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



const customerSnap = await getDoc(customerRef);



if(customerSnap.exists()){


const data = customerSnap.data();


// Name

if(customerName){

customerName.textContent =
data.name || "Customer";

}


// Member ID

if(memberId){

memberId.textContent =

"Member ID : " +

(data.memberId || user.uid);

}


// Avatar / Photo

loadAvatar(data);



// QR ID

if(qrCustomerId){

qrCustomerId.textContent =

"ID : " +

(data.memberId || user.uid);

}



generateQR(

data.memberId || user.uid

);



}



else{


console.log(
"Customer data not found"
);


}



}

catch(error){


console.error(

"Card Load Error :",

error

);


}


});
// ======================================
// RIO MAGGI POINT
// CUSTOMER CARD JS
// AVATAR + QR SYSTEM
// PART 2
// ======================================



// ======================================
// LOAD AVATAR
// ======================================


function loadAvatar(data){


const photoBox = 
document.getElementById("customerPhoto");


const emojiBox = 
document.getElementById("avatarEmoji");



if(!photoBox) return;



// Customer Photo Available

if(data.photoURL){


photoBox.src = data.photoURL;


photoBox.style.display="block";


if(emojiBox){

emojiBox.style.display="none";

}


}


// Emoji Avatar

else if(data.avatar){


if(emojiBox){


emojiBox.textContent =
data.avatar;


emojiBox.style.display="block";


}



photoBox.style.display="none";


}


// Default

else{


if(emojiBox){


emojiBox.textContent="😊";


}


photoBox.style.display="none";


}



}





// ======================================
// QR GENERATOR
// ======================================


function generateQR(id){



if(!qrCodeBox) return;



qrCodeBox.innerHTML="";



const qrImage = document.createElement("img");



qrImage.src =

"https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="

+

encodeURIComponent(id);



qrImage.alt="Customer QR";



qrCodeBox.appendChild(qrImage);



}





// ======================================
// QR POPUP OPEN CLOSE
// ======================================


const openQR = 

document.getElementById("openQR");



const qrPopup =

document.getElementById("qrPopup");



const closeQR =

document.getElementById("closeQR");





if(openQR){


openQR.addEventListener(

"click",

()=>{


qrPopup.style.display="flex";


}

);


}




if(closeQR){


closeQR.addEventListener(

"click",

()=>{


qrPopup.style.display="none";


}

);


}





if(qrPopup){


qrPopup.addEventListener(

"click",

(e)=>{


if(e.target===qrPopup){


qrPopup.style.display="none";


}


}

);


}
// ======================================
// RIO MAGGI POINT
// CUSTOMER CARD JS
// FINAL PART
// PART 3
// ======================================



// ======================================
// CUSTOMER CARD DATA BACKUP
// ======================================


window.addEventListener(
"beforeunload",
()=>{

console.log(
"Rio Customer Card Closed"
);

}

);





// ======================================
// PREVENT INVALID QR
// ======================================


function cleanQRData(value){


if(!value){


return "RIO-CUSTOMER";


}


return String(value)

.replace(

/[^a-zA-Z0-9-_]/g,

""

);


}




// ======================================
// UPDATE QR WITH CLEAN ID
// ======================================


function updateCustomerQR(id){



const cleanID = cleanQRData(id);



generateQR(cleanID);



}





// ======================================
// CARD READY MESSAGE
// ======================================


console.log(

"RIO MAGGI POINT CUSTOMER CARD READY"

);



// ======================================
// END
// ======================================
