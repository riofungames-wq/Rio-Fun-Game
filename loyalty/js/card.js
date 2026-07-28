import { auth, db } from "./firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";



// ===============================
// ELEMENTS
// ===============================


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



// ===============================
// DEFAULT DATA
// ===============================


function setDefaultUser(){


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
"assets/avatars/default.png";

}


}





// ===============================
// LOAD CUSTOMER
// ===============================


onAuthStateChanged(
auth,
async(user)=>{


if(!user){


window.location.href =
"login.html";


return;


}



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
"assets/avatars/default.png";


}


}




}



else{


setDefaultUser();


}



}

catch(error){


console.error(
"Customer Load Error:",
error
);


setDefaultUser();


}



});

// ===============================
// STAMP SYSTEM
// ===============================


const stamps = [
"stamp1",
"stamp2",
"stamp3",
"stamp4",
"stamp5",
"stamp6"
];



function updateStamps(count){


stamps.forEach(
(id,index)=>{


const stamp =
document.getElementById(id);



if(!stamp) return;



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





// ===============================
// COUNTDOWN SYSTEM
// ===============================


const countdownDays =
document.getElementById(
"countdownDays"
);



function updateCountdown(startDate){



if(!countdownDays)
return;



const now =
new Date();



const start =
new Date(startDate);



const resetDate =
new Date(start);



resetDate.setDate(
resetDate.getDate()+40
);



const difference =
resetDate - now;



if(difference <= 0){



countdownDays.innerText =
"0 DAYS";



return;



}



const days =
Math.ceil(
difference /
(1000*60*60*24)
);



countdownDays.innerText =
days + " DAYS";



}





// ===============================
// LOAD STAMP DATA
// ===============================


async function loadStampData(uid){


try{


const userRef =
doc(
db,
"customers",
uid
);



const snap =
await getDoc(
userRef
);



if(!snap.exists())
return;



const data =
snap.data();



const stampCount =
data.stamps || 0;



updateStamps(
stampCount
);





// Countdown

if(data.cycleStart){


updateCountdown(
data.cycleStart
);


}



}



catch(error){


console.error(
"Stamp Error:",
error
);


}



}

// ===============================
// CONNECT STAMP DATA WITH USER
// ===============================


onAuthStateChanged(
auth,
async(user)=>{


if(!user)
return;



loadStampData(
user.uid
);



});





// ===============================
// REWARD CIRCLE
// ===============================


const rewardCircle =
document.querySelector(
".reward-circle"
);



function updateReward(stampCount){



if(!rewardCircle)
return;



if(stampCount >= 6){


rewardCircle.innerHTML =

`
<div class="reward-text">
FREE<br>
VEG<br>
MAGGI
</div>
`;


rewardCircle.classList.add(
"stamp-active"
);



}

else{


rewardCircle.innerHTML =

`
<div class="reward-text">
${stampCount}/6
</div>
`;


rewardCircle.classList.remove(
"stamp-active"
);



}


}






// ===============================
// SHOP CONTACT BUTTONS
// ===============================


const callBtn =
document.getElementById(
"callBtn"
);



const whatsappBtn =
document.getElementById(
"whatsappBtn"
);



const mapBtn =
document.getElementById(
"mapBtn"
);




// Change these later with your shop details

const SHOP_PHONE =
"YOUR_SHOP_NUMBER";



const WHATSAPP_NUMBER =
"YOUR_WHATSAPP_NUMBER";



const SHOP_LOCATION =
"YOUR_GOOGLE_MAP_LINK";




if(callBtn){


callBtn.onclick = ()=>{


window.location.href =
"tel:" + SHOP_PHONE;


};


}



if(whatsappBtn){


whatsappBtn.onclick = ()=>{


window.open(

"https://wa.me/" + WHATSAPP_NUMBER,

"_blank"

);


};


}



if(mapBtn){


mapBtn.onclick = ()=>{


window.open(

SHOP_LOCATION,

"_blank"

);


};


}

// ===============================
// FINAL CUSTOMER UPDATE
// ===============================


async function refreshCustomerData(uid){


try{


const userRef =
doc(
db,
"customers",
uid
);



const snap =
await getDoc(
userRef
);



if(!snap.exists())
return;



const data =
snap.data();



const stampCount =
data.stamps || 0;



// Update stamps

updateStamps(
stampCount
);



// Update reward

updateReward(
stampCount
);



// Update countdown

if(data.cycleStart){

updateCountdown(
data.cycleStart
);

}



}


catch(error){


console.error(
"Refresh Error:",
error
);


}


}







// ===============================
// AUTO REFRESH
// ===============================


onAuthStateChanged(
auth,
(user)=>{


if(user){


refreshCustomerData(
user.uid
);


}


});






// ===============================
// RESET MESSAGE
// ===============================


function checkResetStatus(){


const daysText =
document.getElementById(
"countdownDays"
);



if(
daysText &&
daysText.innerText === "0 DAYS"
){


daysText.innerText =
"NEW CYCLE STARTED";


}


}



setInterval(
checkResetStatus,
60000
);






console.log(
"Rio Maggi Point Premium Card Loaded"
);
