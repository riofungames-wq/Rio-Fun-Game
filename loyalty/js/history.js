// =====================================================
// RIO MAGGI POINT
// HISTORY.JS
// FINAL CLEAN VERSION
// PART 1
// =====================================================


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




// =====================================================
// HTML ELEMENTS
// =====================================================


const historyPhoto =
document.getElementById("historyPhoto");


const historyName =
document.getElementById("historyName");


const historyMember =
document.getElementById("historyMember");


const historyStampCount =
document.getElementById("historyStampCount");


const rewardStatus =
document.getElementById("rewardStatus");


const rewardTitle =
document.getElementById("rewardTitle");


const totalVisits =
document.getElementById("totalVisits");


const totalRewardCount =
document.getElementById("totalRewardCount");


const memberSince =
document.getElementById("memberSince");


const historyTimeline =
document.getElementById("historyTimeline");




// =====================================================
// SAFE SET FUNCTION
// =====================================================


function setText(element,value){

if(element){

element.textContent = value;

}

}




// =====================================================
// DEFAULT PROFILE RESET
// =====================================================


function resetHistory(){


setText(
historyName,
"Customer"
);



setText(
historyMember,
"RIO-000000"
);



setText(
historyStampCount,
"0 / 6"
);



setText(
rewardTitle,
"FREE VEG MAGGI"
);



setText(
rewardStatus,
"Locked"
);



setText(
totalVisits,
"0"
);



setText(
totalRewardCount,
"0"
);



setText(
memberSince,
"--"
);



if(historyPhoto){

historyPhoto.src =
"assets/avatars/default.png";

}



if(historyTimeline){

historyTimeline.innerHTML = "";

}


}




// =====================================================
// LOAD CUSTOMER FROM FIRESTORE
// =====================================================


async function loadCustomerHistory(user){


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


resetHistory();


console.error(
"Customer document not found"
);


return null;


}



return customerSnap.data();



}


catch(error){


console.error(

"History Firebase Error:",

error

);



resetHistory();


return null;


}


}
// =====================================================
// DISPLAY CUSTOMER DATA
// PART 2
// =====================================================


function displayHistory(customer){


// ============================
// BASIC PROFILE
// ============================


setText(

historyName,

customer.name || "Customer"

);



setText(

historyMember,

customer.memberId || "RIO-000000"

);




// ============================
// PHOTO
// ============================


if(historyPhoto){


historyPhoto.src =

customer.photoURL ||

customer.avatar ||

"assets/avatars/default.png";


}




// ============================
// STAMP DATA
// ============================


const stamps =

Number(customer.stamps || 0);



setText(

historyStampCount,

`${stamps} / 6`

);




// ============================
// VISITS
// ============================


setText(

totalVisits,

stamps

);





// ============================
// REWARD CHECK
// ============================


const rewardUnlocked =

customer.rewardUnlocked === true ||

customer.reward === true ||

stamps >= 6;





if(rewardUnlocked){



setText(

rewardTitle,

"FREE VEG MAGGI"

);



setText(

rewardStatus,

"🎉 Ready To Claim"

);



setText(

totalRewardCount,

"1"

);



}


else{



setText(

rewardTitle,

"FREE VEG MAGGI"

);



setText(

rewardStatus,

`Collect ${6-stamps} More Stamp(s)`

);



setText(

totalRewardCount,

"0"

);



}





// ============================
// MEMBER SINCE
// SAFE VERSION
// ============================


if(customer.createdAt){



try{



if(

customer.createdAt.toDate

){



const date =

customer.createdAt.toDate();



setText(

memberSince,

date.toLocaleDateString()

);



}

else{


setText(

memberSince,

"--"

);


}



}

catch(error){


console.error(

"Date Error:",

error

);



setText(

memberSince,

"--"

);


}



}

else{


setText(

memberSince,

"--"

);


}




// ============================
// CREATE TIMELINE
// ============================


createTimeline(customer);



}
// =====================================================
// CREATE TIMELINE
// PART 3
// =====================================================


function createTimeline(customer){


if(!historyTimeline){

return;

}



historyTimeline.innerHTML = "";



const stamps =

Number(customer.stamps || 0);




// ============================
// NO HISTORY
// ============================


if(stamps === 0){



historyTimeline.innerHTML = `


<div class="timeline-item">


<div class="timeline-icon">

🍜

</div>



<div class="timeline-content">


<h4>

Welcome To Rio Maggi Point

</h4>



<p>

Your loyalty journey starts here.

</p>



</div>



</div>


`;



return;



}




// ============================
// STAMP TIMELINE
// ============================


for(

let i = 1;

i <= stamps;

i++

){



const item =

document.createElement(

"div"

);



item.className =

"timeline-item";



item.innerHTML = `


<div class="timeline-icon">

⭐

</div>



<div class="timeline-content">


<h4>

Stamp ${i} Collected

</h4>



<p>

Thank you for visiting Rio Maggi Point.

</p>



</div>


`;



historyTimeline.appendChild(item);



}




// ============================
// REWARD TIMELINE
// ============================


const rewardUnlocked =

customer.rewardUnlocked === true ||

customer.reward === true ||

stamps >= 6;



if(rewardUnlocked){



const reward =

document.createElement(

"div"

);



reward.className =

"timeline-item reward";



reward.innerHTML = `


<div class="timeline-icon">

🎁

</div>



<div class="timeline-content">


<h4>

FREE VEG MAGGI UNLOCKED

</h4>



<p>

Congratulations! Your reward is available.

</p>



</div>


`;



historyTimeline.appendChild(reward);



}



}




// =====================================================
// AUTH CONNECTION
// =====================================================


onAuthStateChanged(

auth,

async(user)=>{



if(!user){


window.location.href =

"login.html";


return;


}





const customer =

await loadCustomerHistory(user);





if(customer){


displayHistory(customer);


}



console.log(

"================================"

);



console.log(

"🍜 Rio Maggi Point"

);



console.log(

"History Loaded Successfully"

);



console.log(

"================================"

);



});





// =====================================================
// PAGE READY
// =====================================================


console.log(

"History JS Final Version Ready"

);
