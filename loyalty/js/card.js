// ======================================
// RIO MAGGI POINT
// CUSTOMER CARD JS
// FINAL FIREBASE VERSION
// PART 1
// ======================================


// Firebase Config

import { firebaseConfig } from "../firebase-config.js";


// Firebase Imports

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




// ======================================
// INITIALIZE FIREBASE
// ======================================


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = getFirestore(app);




// ======================================
// HTML ELEMENTS
// ======================================


const customerName = document.getElementById(
"customerName"
);


const memberId = document.getElementById(
"memberId"
);


const avatarDisplay = document.getElementById(
"avatarDisplay"
);


const customerPhoto = document.getElementById(
"customerPhoto"
);


const qrCodeBox = document.getElementById(
"qrCodeBox"
);


const qrCustomerId = document.getElementById(
"qrCustomerId"
);



// QR Buttons


const openQR = document.getElementById(
"openQR"
);


const qrPopup = document.getElementById(
"qrPopup"
);


const closeQR = document.getElementById(
"closeQR"
);



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



console.log(
"Customer Card Data:",
data
);



// CUSTOMER NAME


if(customerName){

customerName.textContent =
data.name || "Customer";

}



// MEMBER ID


const customerID =
data.memberId || user.uid;



if(memberId){

memberId.textContent =
"Member ID : " + customerID;

}



// LOAD PHOTO / AVATAR


loadAvatar(data);



// GENERATE QR


generateQR(customerID);



if(qrCustomerId){

qrCustomerId.textContent =
"ID : " + customerID;

}



}

else{


console.log(
"Customer record not found"
);


}



}

catch(error){


console.error(
"Card Loading Error:",
error
);


}


});

// ======================================
// LOAD CUSTOMER AVATAR / PHOTO
// ======================================


function loadAvatar(data){



// HTML ELEMENTS


const emojiAvatar = document.getElementById(
"avatarDisplay"
);




const photo = document.getElementById(
"customerPhoto"
);





// CUSTOMER PHOTO EXISTS


if(data.photoURL){



if(photo){


photo.src = data.photoURL;


photo.style.display = "block";


}



if(emojiAvatar){


emojiAvatar.style.display = "none";


}



}





// EMOJI AVATAR EXISTS


else if(data.avatar){



if(emojiAvatar){


emojiAvatar.textContent = data.avatar;


emojiAvatar.style.display = "block";


}



if(photo){


photo.style.display = "none";


}



}





// DEFAULT AVATAR


else{



if(emojiAvatar){


emojiAvatar.textContent = "😊";


emojiAvatar.style.display = "block";


}



if(photo){


photo.style.display = "none";


}



}



}






// ======================================
// GENERATE CUSTOMER QR
// ======================================


function generateQR(id){



if(!qrCodeBox){

return;

}



qrCodeBox.innerHTML = "";



const qrImage = document.createElement(
"img"
);



qrImage.src =

"https://api.qrserver.com/v1/create-qr-code/?size=220x220&data="

+

encodeURIComponent(id);



qrImage.alt =
"Customer QR Code";



qrCodeBox.appendChild(
qrImage
);



}






// ======================================
// QR POPUP OPEN
// ======================================


if(openQR){



openQR.addEventListener(
"click",
()=>{


if(qrPopup){


qrPopup.style.display = "flex";


}



}

);


}






// ======================================
// QR POPUP CLOSE
// ======================================


if(closeQR){



closeQR.addEventListener(
"click",
()=>{


if(qrPopup){


qrPopup.style.display = "none";


}



}

);


}





// CLOSE WHEN CLICK OUTSIDE


if(qrPopup){



qrPopup.addEventListener(
"click",
(event)=>{


if(event.target === qrPopup){


qrPopup.style.display = "none";


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
// CARD READY MESSAGE
// ======================================


console.log(
"RIO MAGGI POINT CUSTOMER CARD READY"
);



// ======================================
// PREVENT EMPTY QR DATA
// ======================================


function safeQR(value){


if(!value){


return "RIO-CUSTOMER";


}


return String(value);


}



// ======================================
// FINAL QR UPDATE CHECK
// ======================================


window.addEventListener(
"load",
()=>{


console.log(
"Customer Card Loaded Successfully"
);


});



// ======================================
// END OF CARD.JS
// ======================================
