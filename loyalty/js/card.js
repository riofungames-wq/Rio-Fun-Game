// =====================================
// RIO MAGGI POINT
// PREMIUM CARD JS
// COMPLETE FIX VERSION
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

document.getElementById("customerName");


const memberId =

document.getElementById("memberId");


const customerPhoto =

document.getElementById("customerPhoto");


const countdownDays =

document.getElementById("countdownDays");


const rewardCircle =

document.getElementById("rewardCircle");


const gameLink =

document.getElementById("gameLink");




// ============================
// AVATAR SYSTEM
// ============================


function getAvatar(data){


if(data.photoURL){

return data.photoURL;

}



if(data.avatar){

return data.avatar;

}




if(data.gender){


const gender =

data.gender.toLowerCase();



if(

gender === "female" ||

gender === "girl" ||

gender === "woman"

){


return "assets/avatars/female.png";


}



if(

gender === "male" ||

gender === "boy" ||

gender === "man"

){


return "assets/avatars/male.png";


}


}




return "assets/avatars/male.png";


}







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

await getDoc(customerRef);





if(!customerSnap.exists()){


setDefaultData();

return;


}





const data =

customerSnap.data();





if(customerName){


customerName.textContent =

data.name || "Customer";


}





if(memberId){


memberId.textContent =

data.memberId || "RIO-000000";


}





if(customerPhoto){


customerPhoto.src =

getAvatar(data);


}





console.log(

"Customer Data Loaded",

data

);



}



catch(error){


console.error(

"Customer Load Error",

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



if(!rewardCircle){

return;

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





if(stampCount >= 6){



rewardCircle.classList.add("active");



}

else{



rewardCircle.classList.remove("active");



}



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

await getDoc(customerRef);





if(!customerSnap.exists()){

return;

}





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







// ============================
// GAME BUTTON
// ============================


if(gameLink){



gameLink.addEventListener(

"click",

()=>{



window.location.href =

"https://riofungames-wq.github.io/Rio-Fun-Game/";



}

);



}






// ============================
// COUNTDOWN SYSTEM
// ============================


function updateResetCountdown(cycleStart){



if(!countdownDays){

return;

}





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

// =====================================
// COUNTDOWN LOAD
// PART 3
// =====================================



async function loadCountdownData(user){



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

return;

}





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







// =====================================
// QUICK BUTTONS
// =====================================



// CALL BUTTON


document.getElementById("callBtn")?.addEventListener(

"click",

()=>{



window.location.href =

"tel:YOUR_PHONE_NUMBER";



}

);






// WHATSAPP BUTTON


document.getElementById("whatsappBtn")?.addEventListener(

"click",

()=>{



window.open(

"https://wa.me/YOUR_WHATSAPP_NUMBER",

"_blank"

);



}

);






// MAP BUTTON


document.getElementById("mapBtn")?.addEventListener(

"click",

()=>{



window.open(

"YOUR_GOOGLE_MAP_LINK",

"_blank"

);



}

);







// =====================================
// AUTH START
// =====================================



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

"================================"

);



console.log(

"🍜 Rio Maggi Point"

);



console.log(

"Premium Card Loaded Successfully"

);



console.log(

"================================"

);





}

);
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0">

<title>
Rio Maggi Point
</title>

<meta
name="theme-color"
content="#111111">

<link
rel="manifest"
href="manifest.json">

<link
rel="preconnect"
href="https://fonts.googleapis.com">

<link
rel="preconnect"
href="https://fonts.gstatic.com"
crossorigin>

<link
href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
rel="stylesheet">

<link
rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

<link
rel="stylesheet"
href="css/card.css">

</head>

<body>

<div class="page">

<div class="premium-card">

<div class="card-glow"></div>

<div class="card-shine"></div>

<!-- HEADER -->

<div class="card-header">

<h1 class="brand-title">

RIO MAGGI POINT

</h1>

<div class="brand-subtitle">

Premium Loyalty Club

</div>

</div>


<!-- CUSTOMER SECTION -->

<div class="customer-section">

<div class="avatar-frame">

<img
id="customerPhoto"
src="assets/avatars/male.png"
alt="Customer">

</div>

<div
class="customer-name"
id="customerName">

Loading...

</div>

<div class="customer-id">

ID :

<span id="memberId">

RIO-000000

</span>

</div>

<div class="premium-member">

PREMIUM MEMBER

</div>


<!-- PREMIUM FREE GAME BUTTON -->

<button
class="game-button"
id="gameLink">

<span class="game-icon">

<i class="fa-solid fa-gamepad"></i>

</span>

<span class="game-text">

CLICK FREE GAME

</span>

<span class="game-arrow">

<i class="fa-solid fa-bolt"></i>

</span>

</button>

</div>


<!-- STAMP TITLE -->

<div class="stamp-title">

Collect 6 Stamps • Win 1 FREE VEG MAGGI

</div>


<!-- STAMP SECTION -->

<div class="stamp-section">

<div class="stamp-row">


<!-- STAMP 1 -->

<div class="stamp-item">

<div
class="stamp-circle"
id="stamp1">

<span>1</span>

</div>

<div
class="stamp-date"
id="stampDate1">

--

</div>

</div>


<!-- STAMP 2 -->

<div class="stamp-item">

<div
class="stamp-circle"
id="stamp2">

<span>2</span>

</div>

<div
class="stamp-date"
id="stampDate2">

--

</div>

</div>


<!-- STAMP 3 -->

<div class="stamp-item">

<div
class="stamp-circle"
id="stamp3">

<span>3</span>

</div>

<div
class="stamp-date"
id="stampDate3">

--

</div>

</div>


<!-- STAMP 4 -->

<div class="stamp-item">

<div
class="stamp-circle"
id="stamp4">

<span>4</span>

</div>

<div
class="stamp-date"
id="stampDate4">

--

</div>

</div>


<!-- STAMP 5 -->

<div class="stamp-item">

<div
class="stamp-circle"
id="stamp5">

<span>5</span>

</div>

<div
class="stamp-date"
id="stampDate5">

--

</div>

</div>


<!-- STAMP 6 -->

<div class="stamp-item">

<div
class="stamp-circle"
id="stamp6">

<span>6</span>

</div>

<div
class="stamp-date"
id="stampDate6">

--

</div>

</div>


<!-- REWARD -->

<div class="stamp-item reward-item">

<div
class="stamp-circle reward-circle"
id="rewardCircle">

<div class="reward-label">

FREE
<br>
VEG
<br>
MAGGI

</div>

</div>

<div class="stamp-date reward-date">

REWARD

</div>

</div>


</div>

</div>


<!-- COUNTDOWN -->

<div class="countdown-box">

<div class="countdown-text">

STAMP RESET IN

</div>

<div
id="countdownDays"
class="countdown-days">

40 DAYS

</div>

</div>


<!-- QUICK BUTTONS -->

<div class="quick-buttons">


<!-- CALL -->

<button
id="callBtn">

<i class="fa-solid fa-phone"></i>

<span>

Call

</span>

</button>


<!-- WHATSAPP -->

<button
id="whatsappBtn">

<i class="fa-brands fa-whatsapp"></i>

<span>

WhatsApp

</span>

</button>


<!-- HOME DELIVERY -->

<button
id="deliveryBtn"
class="coming-soon-button">

<i class="fa-solid fa-motorcycle"></i>

<span>

Delivery

</span>

<small>

Coming Soon

</small>

</button>


<!-- MAP -->

<button
id="mapBtn"
class="coming-soon-button">

<i class="fa-solid fa-location-dot"></i>

<span>

Map

</span>

<small>

Coming Soon

</small>

</button>


</div>


<!-- BOTTOM NAVIGATION -->

<nav class="bottom-nav">


<a
href="card.html"
class="active">

<i class="fa-solid fa-house"></i>

<span>

Home

</span>

</a>


<a href="qr.html">

<i class="fa-solid fa-qrcode"></i>

<span>

QR

</span>

</a>


<a href="history.html">

<i class="fa-solid fa-clock-rotate-left"></i>

<span>

History

</span>

</a>


<a href="menu.html">

<i class="fa-solid fa-utensils"></i>

<span>

Menu

</span>

</a>


<a href="feedback.html">

<i class="fa-solid fa-heart"></i>

<span>

Review

</span>

</a>


<a href="profile.html">

<i class="fa-solid fa-user"></i>

<span>

Profile

</span>

</a>


</nav>

</div>

</div>


<!-- CARD JAVASCRIPT -->

<script
type="module"
src="js/card.js">

</script>


<!-- SERVICE WORKER -->

<script>

if("serviceWorker" in navigator){

window.addEventListener("load",()=>{

navigator.serviceWorker.register("./service-worker.js");

});

}

</script>

</body>

</html>
