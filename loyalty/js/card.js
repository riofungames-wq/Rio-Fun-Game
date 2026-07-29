// =====================================
// RIO MAGGI POINT
// PREMIUM CARD JS
// FINAL VERSION
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



const countdownDays =

document.getElementById(
"countdownDays"
);



const rewardCircle =

document.getElementById(
"rewardCircle"
);



const gameLink =

document.getElementById(
"gameLink"
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
// LOAD CUSTOMER DATA
// ============================


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

return;


}





const data =

customerSnap.data();





if(customerName){


customerName.textContent =

data.name ||

"Customer";


}





if(memberId){


memberId.textContent =

data.memberId ||

"RIO-000000";


}





if(customerPhoto){


customerPhoto.src =

data.photoURL ||

data.avatar ||

"assets/avatars/male.png";


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

// =====================================
// STAMP SYSTEM
// PART 2
// =====================================



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


function updateStampDisplay(stampCount){


stampIds.forEach((id,index)=>{


const stamp =

document.getElementById(id);



if(!stamp) return;





if(index < stampCount){


stamp.classList.add("active");


}

else{


stamp.classList.remove("active");


}



});


}






// ============================
// UPDATE REWARD DISPLAY
// ============================


function updateRewardDisplay(stampCount){


if(!rewardCircle) return;





if(stampCount >= 6){


rewardCircle.classList.add("active");



}

else{


rewardCircle.classList.remove("active");


}



rewardCircle.innerHTML =



`

<div class="reward-label">

FREE

<br>

VEG

<br>

MAGGI

</div>

`;



}







// ============================
// LOAD STAMP DATA
// ============================


async function loadStampData(user){


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





if(!customerSnap.exists()) return;





const data =

customerSnap.data();





const stampCount =

Number(data.stamps || 0);





updateStampDisplay(

stampCount

);





updateRewardDisplay(

stampCount

);



}



catch(error){


console.error(

"Stamp Load Error:",

error

);


}



}

// =====================================
// COUNTDOWN + BUTTONS + AUTH
// PART 3
// =====================================



// ============================
// FREE GAME BUTTON
// ============================


if(gameLink){


gameLink.addEventListener(

"click",

()=>{


window.location.href = "game.html";


}

);


}







// ============================
// COUNTDOWN
// ============================


function updateResetCountdown(cycleStart){


if(!countdownDays) return;



const startDate =

new Date(cycleStart);



const resetDate =

new Date(startDate);



resetDate.setDate(

resetDate.getDate()+40

);



const now =

new Date();



const difference =

resetDate - now;





if(difference <= 0){


countdownDays.textContent =

"0 DAYS";


return;


}





const days =

Math.ceil(

difference /

(1000*60*60*24)

);





countdownDays.textContent =

days + " DAYS";



}







async function loadCountdownData(user){


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





if(!customerSnap.exists()) return;





const data =

customerSnap.data();





if(data.cycleStart){


updateResetCountdown(

data.cycleStart

);


}





}



catch(error){


console.error(

"Countdown Error:",

error

);


}



}







// ============================
// CONTACT BUTTONS
// ============================


document.getElementById("callBtn")?.addEventListener(

"click",

()=>{


window.location.href =

"tel:YOUR_PHONE_NUMBER";


}

);





document.getElementById("whatsappBtn")?.addEventListener(

"click",

()=>{


window.open(

"https://wa.me/YOUR_WHATSAPP_NUMBER",

"_blank"

);


}

);





document.getElementById("mapBtn")?.addEventListener(

"click",

()=>{


window.open(

"YOUR_GOOGLE_MAP_LINK",

"_blank"

);


}

);








// ============================
// AUTH CONNECTION
// ============================


onAuthStateChanged(

auth,

async(user)=>{


if(!user){


window.location.href =

"login.html";


return;


}





console.log(

"LOGIN UID:",

user.uid

);





await loadCustomerData(user);



await loadStampData(user);



await loadCountdownData(user);





console.log(

"🍜 Rio Maggi Point Card Loaded Successfully"

);



}

);
