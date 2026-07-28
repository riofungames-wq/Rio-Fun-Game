
// =====================================================
// RIO MAGGI POINT
// PROFILE.JS
// PREMIUM CUSTOMER PROFILE SYSTEM
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

"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";



import {

doc,

getDoc,

signOut

}

from

"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";





// ============================
// HTML ELEMENTS
// ============================


const profilePhoto =

document.getElementById(
"profilePhoto"
);



const profileName =

document.getElementById(
"profileName"
);



const profileMemberId =

document.getElementById(
"profileMemberId"
);



const profileMobile =

document.getElementById(
"profileMobile"
);



const profileEmail =

document.getElementById(
"profileEmail"
);



const profileDOB =

document.getElementById(
"profileDOB"
);



const profileAge =

document.getElementById(
"profileAge"
);



const profileCategory =

document.getElementById(
"profileCategory"
);



const profileStampCount =

document.getElementById(
"profileStampCount"
);



const profileReward =

document.getElementById(
"profileReward"
);



const profileMemberSince =

document.getElementById(
"profileMemberSince"
);



const logoutBtn =

document.getElementById(
"logoutBtn"
);



const editProfileBtn =

document.getElementById(
"editProfileBtn"
);




// ============================
// DEFAULT PROFILE
// ============================


function setDefaultProfile(){


if(profileName)

profileName.textContent =
"Customer";



if(profileMemberId)

profileMemberId.textContent =
"RIO-000000";



if(profilePhoto)

profilePhoto.src =
"assets/avatars/default.png";



if(profileStampCount)

profileStampCount.textContent =
"0 / 6";



if(profileReward)

profileReward.textContent =
"Locked";


}

// ============================
// LOAD CUSTOMER PROFILE
// ============================


async function loadProfileData(user){


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


setDefaultProfile();


alert(

"Customer Data Not Found"

);


return;


}



const data =

customerSnap.data();




// ============================
// BASIC INFORMATION
// ============================


if(profileName){

profileName.textContent =

data.name ||

"Customer";

}



if(profileMemberId){

profileMemberId.textContent =

data.memberId ||

"RIO-000000";

}




// ============================
// PHOTO
// ============================


if(profilePhoto){


profilePhoto.src =

data.photoURL ||

data.avatar ||

"assets/avatars/default.png";


}




// ============================
// CONTACT DETAILS
// ============================


if(profileMobile){

profileMobile.textContent =

data.mobile ||

"--";

}



if(profileEmail){

profileEmail.textContent =

data.email ||

"--";

}




// ============================
// EXTRA DETAILS
// ============================


if(profileDOB){

profileDOB.textContent =

data.dob ||

"--";

}



if(profileAge){

profileAge.textContent =

data.age ||

"--";

}



if(profileCategory){

profileCategory.textContent =

data.gender ?

data.gender.toUpperCase()

:

"PREMIUM MEMBER";

}




// ============================
// LOYALTY DATA
// ============================


const stamps =

data.stamps ||

0;



if(profileStampCount){

profileStampCount.textContent =

stamps +

" / 6";

}




if(profileReward){


if(

data.rewardUnlocked === true ||

stamps >= 6

){


profileReward.textContent =

"FREE VEG MAGGI UNLOCKED";


}

else{


profileReward.textContent =

"Locked";


}


}



// ============================
// MEMBER SINCE
// ============================


if(profileMemberSince){


if(data.createdAt){


const date =

data.createdAt.toDate();



profileMemberSince.textContent =

date.toLocaleDateString();


}

else{


profileMemberSince.textContent =

"--";


}


}



console.log(

"Profile Loaded Successfully"

);



}



catch(error){


console.error(

"Profile Load Error:",

error

);



setDefaultProfile();


}


}

// ============================
// AUTH CONNECTION
// ============================


onAuthStateChanged(

auth,

async(user)=>{


if(user){


console.log(

"PROFILE LOGIN UID:",

user.uid

);



await loadProfileData(user);



}



else{


window.location.href =

"login.html";


}



});





// ============================
// LOGOUT
// ============================


if(logoutBtn){


logoutBtn.addEventListener(

"click",

async()=>{


try{


await signOut(auth);



window.location.href =

"login.html";



}

catch(error){


console.error(

"Logout Error:",

error

);



alert(

"Logout Failed"

);


}



}

);


}





// ============================
// EDIT PROFILE
// ============================


if(editProfileBtn){


editProfileBtn.addEventListener(

"click",

()=>{


alert(

"Edit Profile Feature Coming Soon"

);


}

);


}





// ============================
// PAGE READY
// ============================


console.log(

"================================"

);


console.log(

"🍜 Rio Maggi Point"

);



console.log(

"Premium Profile Page Ready"

);



console.log(

"================================"

);
