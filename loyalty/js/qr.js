// =====================================
// RIO MAGGI POINT
// QR.JS
// FINAL PREMIUM VERSION
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
// ELEMENTS
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





// ============================
// LOAD CUSTOMER
// ============================


async function loadCustomerData(user){


try{


const customerRef =

doc(

db,

"customers",

user.uid

);



const snapshot =

await getDoc(customerRef);



if(!snapshot.exists()){


setDefaultData();


if(qrStatus){

qrStatus.textContent =
"Customer Data Not Found";

}


return null;


}



const customer = snapshot.data();





// NAME


if(customerName){

customerName.textContent =

customer.name ||

"Customer";

}





// MEMBER ID


if(memberId){

memberId.textContent =

customer.memberId ||

"RIO-000000";

}





// PHOTO


if(customerPhoto){

customerPhoto.src =

customer.photoURL ||

customer.avatar ||

"assets/avatars/male.png";

}



return {


uid:user.uid,


memberId:

customer.memberId ||

"RIO-000000"


};



}


catch(error){


console.error(

"QR LOAD ERROR",

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
// PART 2
// =====================================


function generateQR(customer){


if(!qrBox){

return;

}



// OLD QR REMOVE

qrBox.innerHTML = "";




// QR DATA


const qrData = {


type:

"RIO_MAGGI_LOYALTY",



uid:

customer.uid,



memberId:

customer.memberId



};





// CREATE QR


new QRCode(


qrBox,


{


text:

JSON.stringify(qrData),



width:

220,



height:

220,



colorDark:

"#111111",



colorLight:

"#ffffff",



correctLevel:

QRCode.CorrectLevel.H



}



);





if(qrStatus){


qrStatus.textContent =

"QR Ready To Scan";


}



}






// =====================================
// DOWNLOAD QR
// =====================================


const downloadQR =

document.getElementById(

"downloadQR"

);





if(downloadQR){


downloadQR.addEventListener(

"click",()=>{



const canvas =

qrBox.querySelector(

"canvas"

);



if(!canvas){

alert(

"QR Not Ready"

);

return;

}




const link =

document.createElement(

"a"

);



link.download =

"Rio-Maggi-QR.png";



link.href =

canvas.toDataURL();



link.click();



});


}






// =====================================
// SHARE QR
// =====================================


const shareQR =

document.getElementById(

"shareQR"

);





if(shareQR){


shareQR.addEventListener(

"click",async()=>{



const canvas =

qrBox.querySelector(

"canvas"

);



if(!canvas){

alert(

"QR Not Ready"

);

return;

}




const image =

canvas.toDataURL();



if(navigator.share){



navigator.share({

title:

"Rio Maggi Point Loyalty QR",


text:

"Scan my Rio Maggi Loyalty QR",


url:

image


});



}

else{


alert(

"Share not supported"

);



}



});


}
// =====================================
// AUTH CONNECTION
// PART 3
// =====================================


onAuthStateChanged(

auth,

async(user)=>{



// USER NOT LOGIN


if(!user){


window.location.href =

"login.html";


return;


}





// LOAD CUSTOMER DATA


const customer =

await loadCustomerData(user);






// GENERATE QR


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




// =====================================
// END QR.JS
// =====================================
