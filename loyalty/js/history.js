// =====================================================
// RIO MAGGI POINT
// HISTORY.JS
// PREMIUM VERSION
// PART 1
// =====================================================


// ============================
// FIREBASE IMPORT
// ============================

import { auth, db } from "./firebase-config.js";


import {

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



import {

doc,

getDoc

}

from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




// ============================
// HTML ELEMENTS
// ============================


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


const totalVisits =
document.getElementById("totalVisits");


const totalRewardCount =
document.getElementById("totalRewardCount");


const memberSince =
document.getElementById("memberSince");


const historyTimeline =
document.getElementById("historyTimeline");




// ============================
// AUTH CHECK
// ============================


onAuthStateChanged(

auth,

async(user)=>{


if(!user){


window.location.href =

"login.html";


return;


}



await loadHistoryData(user);



}

);





// ============================
// LOAD HISTORY DATA
// ============================


async function loadHistoryData(user){


try{


const customerRef =

doc(

db,

"customers",

user.uid

);



const customerSnap =

await getDoc(customerRef);



if(!customerSnap.exists()){


showEmptyHistory();


return;


}



const customer =

customerSnap.data();



displayCustomer(customer);



createTimeline(customer);



console.log(

"Rio Maggi Point History Loaded"

);



}


catch(error){


console.error(

"History Error:",

error

);


showEmptyHistory();


}



}





// ============================
// DISPLAY CUSTOMER DATA
// ============================


function displayCustomer(customer){



const stamps =

customer.stamps || 0;




if(historyName){

historyName.textContent =

customer.name || "Customer";

}





if(historyMember){

historyMember.textContent =

customer.memberId || "RIO-000000";

}





if(historyPhoto){

historyPhoto.src =

customer.photoURL ||

customer.avatar ||

"assets/avatars/male.png";

}





if(historyStampCount){

historyStampCount.textContent =

`${stamps} / 6`;

}





if(totalVisits){

totalVisits.textContent =

stamps;

}





if(totalRewardCount){

totalRewardCount.textContent =

customer.rewardUnlocked

?

"1"

:

"0";

}





if(rewardStatus){

rewardStatus.textContent =

customer.rewardUnlocked

?

"🎉 Free Veg Maggi Unlocked"

:

"🔒 Locked";

}





if(memberSince){


if(customer.createdAt?.seconds){


memberSince.textContent =

new Date(

customer.createdAt.seconds * 1000

)

.toLocaleDateString();


}

else{


memberSince.textContent =

"--";


}



}



}

// =====================================================
// CREATE TIMELINE
// PART 2
// =====================================================


function createTimeline(customer){


if(!historyTimeline){

return;

}



historyTimeline.innerHTML = "";



const stamps =

customer.stamps || 0;




// ============================
// NO STAMP MESSAGE
// ============================


if(stamps === 0){


historyTimeline.innerHTML = `

<div class="empty-history">


🍜 Welcome To Rio Maggi Point

<br><br>

No Stamp Collected Yet


</div>

`;


return;


}




// ============================
// STAMP HISTORY
// ============================


for(let i = 1; i <= stamps; i++){



const stampItem =

document.createElement("div");



stampItem.className =

"timeline-item";



stampItem.innerHTML = `


<div class="timeline-icon">

⭐

</div>



<div class="timeline-content">


<h4>

Stamp ${i} Collected

</h4>


<p>

Thank You For Visiting Rio Maggi Point

</p>


</div>


`;



historyTimeline.appendChild(stampItem);



}





// ============================
// REWARD UNLOCK ENTRY
// ============================


if(customer.rewardUnlocked === true){



const rewardItem =

document.createElement("div");



rewardItem.className =

"timeline-item reward";



rewardItem.innerHTML = `


<div class="timeline-icon">

🎁

</div>



<div class="timeline-content">


<h4>

Free Veg Maggi Unlocked

</h4>


<p>

Your reward is ready to claim.

</p>


</div>


`;



historyTimeline.appendChild(rewardItem);



}



}





// =====================================================
// EMPTY HISTORY
// =====================================================


function showEmptyHistory(){


if(!historyTimeline){

return;

}



historyTimeline.innerHTML = `


<div class="empty-history">


⚠️ Customer History Not Available


</div>


`;



}




// =====================================================
// PAGE READY
// =====================================================


console.log(

"================================"

);


console.log(

"🍜 Rio Maggi Point"

);


console.log(

"History Dashboard Ready"

);


console.log(

"================================"

);
