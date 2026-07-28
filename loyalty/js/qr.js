// =====================================
// RIO MAGGI POINT
// QR.JS
// PREMIUM QR SYSTEM
// PART 1
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
// HTML ELEMENTS
// ============================


const customerName =

document.getElementById(
"customerName"
);



const memberId =

document.getElementById(
"memberId"
);



const customerPhoto =

document.getElementById(
"customerPhoto"
);



const qrBox =

document.getElementById(
"qrcode"
);



const qrStatus =

document.getElementById(
"qrStatus"
);




// ============================
// DEFAULT DATA
// ============================


function setDefaultData(){


if(customerName){

customerName.textContent =
"Customer";

}



if(memberId){

memberId.textContent =
"RIO-000000";

}



if(customerPhoto){

customerPhoto.src =
"assets/avatars/male.png";

}


}

// =====================================
// LOAD CUSTOMER DATA
// =====================================


async function loadCustomerData(user){


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


setDefaultData();


if(qrStatus){

qrStatus.textContent =
"Customer Not Found";

}


return null;


}



const data =

customerSnap.data();




// ============================
// CUSTOMER NAME
// ============================


if(customerName){


customerName.textContent =

data.name ||

"Customer";


}




// ============================
// MEMBER ID
// ============================


if(memberId){


memberId.textContent =

data.memberId ||

"RIO-000000";


}




// ============================
// PHOTO
// ============================


if(customerPhoto){


customerPhoto.src =

data.photoURL ||

data.avatar ||

"assets/avatars/male.png";


}




// ============================
// QR STATUS CLEAR
// ============================


if(qrStatus){


qrStatus.textContent = "";


}




return {


uid:user.uid,


memberId:

data.memberId || "RIO-000000"



};



}



catch(error){


console.error(

"QR Customer Load Error:",

error

);



if(qrStatus){

qrStatus.textContent =
"Unable To Load QR";

}



return null;


}


}

// =====================================
// QR GENERATE
// =====================================


function generateQR(customer){


if(!qrBox){

return;

}



qrBox.innerHTML = "";



const qrData = {


type:

"RIO_MAGGI_LOYALTY",


uid:

customer.uid,


memberId:

customer.memberId


};




new QRCode(

qrBox,

{

text:

JSON.stringify(qrData),


width:

220,


height:

220,


correctLevel:

QRCode.CorrectLevel.H


}

);



}



// =====================================
// AUTH CONNECTION
// =====================================


onAuthStateChanged(

auth,

async(user)=>{


if(!user){


window.location.href =

"login.html";


return;


}




const customer =

await loadCustomerData(user);



if(customer){


generateQR(customer);


}




console.log(

"================================"

);


console.log(

"🍜 Rio Maggi Point"

);


console.log(

"Premium QR Loaded Successfully"

);


console.log(

"================================"

);



});

