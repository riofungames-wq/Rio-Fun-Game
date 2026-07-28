// ============================
// FIREBASE IMPORT
// ============================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";




// ============================
// HTML ELEMENTS
// ============================


const customerName =
document.getElementById("customerName");


const memberId =
document.getElementById("memberId");


const customerPhoto =
document.getElementById("customerPhoto");



const countdownDays =
document.getElementById("countdownDays");



const rewardCircle =
document.getElementById("rewardCircle");




// ============================
// DEFAULT DATA
// ============================


function setDefaultData(){


    if(customerName){

        customerName.innerText =
        "Customer";

    }



    if(memberId){

        memberId.innerText =
        "RIO-000000";

    }



    if(customerPhoto){

        customerPhoto.src =
        "assets/avatars/male.png";

    }


}

// ============================
// LOAD CUSTOMER DATA
// ============================


async function loadCustomerData(user){


try{


const userRef =
doc(
    db,
    "customers",
    user.uid
);



const userSnap =
await getDoc(
    userRef
);



if(userSnap.exists()){


const data =
userSnap.data();



if(customerName){

customerName.innerText =
data.name || "Customer";

}



if(memberId){

memberId.innerText =
data.id || "RIO-000000";

}




if(customerPhoto){


if(data.photoURL){


customerPhoto.src =
data.photoURL;


}

else{


customerPhoto.src =
"assets/avatars/male.png";


}


}



}

else{


setDefaultData();


}



}

catch(error){


console.error(
"Customer Load Error:",
error
);


setDefaultData();


}



}
// ============================
// STAMP SYSTEM
// ============================


const stampIds = [

"stamp1",
"stamp2",
"stamp3",
"stamp4",
"stamp5",
"stamp6"

];





// ============================
// UPDATE STAMP DISPLAY
// ============================


function updateStampDisplay(count){


stampIds.forEach(
(id,index)=>{


const stamp =
document.getElementById(id);



if(!stamp)
return;



if(index < count){


stamp.classList.add(
"active"
);


}

else{


stamp.classList.remove(
"active"
);


}


});


}





// ============================
// UPDATE REWARD CIRCLE
// ============================


function updateRewardDisplay(count){


if(!rewardCircle)
return;



if(count >= 6){


rewardCircle.innerHTML = `

<div class="reward-label">

FREE<br>
VEG<br>
MAGGI

</div>

`;


rewardCircle.classList.add(
"active"
);


}

else{


rewardCircle.innerHTML = `

<div class="reward-label">

${count}/6

</div>

`;


rewardCircle.classList.remove(
"active"
);


}


}





// ============================
// LOAD STAMP DATA
// ============================


async function loadStampData(user){


try{


const userRef =
doc(
    db,
    "customers",
    user.uid
);



const userSnap =
await getDoc(
    userRef
);



if(userSnap.exists()){


const data =
userSnap.data();



const stampCount =
data.stamps || 0;



updateStampDisplay(
stampCount
);



updateRewardDisplay(
stampCount
);



}



}

catch(error){


console.error(
"Stamp Load Error:",
error
);


}



}

// ============================
// COUNTDOWN SYSTEM
// ============================


function updateResetCountdown(
cycleStart
){


if(!countdownDays)
return;



const startDate =
new Date(
cycleStart
);



const resetDate =
new Date(
startDate
);



resetDate.setDate(
resetDate.getDate() + 40
);



const today =
new Date();



const difference =
resetDate - today;



if(difference <= 0){


countdownDays.innerText =
"0 DAYS";


return;


}



const remainingDays =
Math.ceil(
difference /
(1000 * 60 * 60 * 24)
);



countdownDays.innerText =
remainingDays + " DAYS";



}






// ============================
// LOAD RESET DATE
// ============================


async function loadCountdownData(user){


try{


const userRef =
doc(
    db,
    "customers",
    user.uid
);



const userSnap =
await getDoc(
    userRef
);



if(userSnap.exists()){


const data =
userSnap.data();



if(data.cycleStart){


updateResetCountdown(
data.cycleStart
);


}



}



}

catch(error){


console.error(
"Countdown Load Error:",
error
);


}



}

// ============================
// CONTACT BUTTONS
// ============================


const callBtn =
document.getElementById("callBtn");


const whatsappBtn =
document.getElementById("whatsappBtn");


const mapBtn =
document.getElementById("mapBtn");




// ============================
// SHOP DETAILS
// बाद में अपना data डालेंगे
// ============================


const SHOP_PHONE =
"YOUR_PHONE_NUMBER";


const WHATSAPP_NUMBER =
"YOUR_WHATSAPP_NUMBER";


const MAP_LINK =
"YOUR_GOOGLE_MAP_LINK";





// ============================
// CALL BUTTON
// ============================


if(callBtn){


callBtn.addEventListener(
"click",
()=>{


window.location.href =
"tel:" + SHOP_PHONE;


});


}






// ============================
// WHATSAPP BUTTON
// ============================


if(whatsappBtn){


whatsappBtn.addEventListener(
"click",
()=>{


window.open(

"https://wa.me/" +
WHATSAPP_NUMBER,

"_blank"

);


});


}






// ============================
// MAP BUTTON
// ============================


if(mapBtn){


mapBtn.addEventListener(
"click",
()=>{


window.open(

MAP_LINK,

"_blank"

);


});


}

// ============================
// FINAL AUTH CONNECTION
// ============================


onAuthStateChanged(
auth,
async(user)=>{


if(user){



await loadCustomerData(
user
);



await loadStampData(
user
);



await loadCountdownData(
user
);



console.log(
"Rio Maggi Point Premium Card Loaded Successfully"
);



}

else{


window.location.href =
"login.html";


}



});
