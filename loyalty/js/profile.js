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

onAuthStateChanged,
signOut

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
// DEFAULT DATA
// ============================


function setDefaultProfile(){



if(profilePhoto){

profilePhoto.src =

"assets/avatars/default.png";

}



if(profileName){

profileName.textContent =

"Customer";

}



if(profileMemberId){

profileMemberId.textContent =

"RIO-000000";

}



if(profileMobile){

profileMobile.textContent =

"--";

}



if(profileEmail){

profileEmail.textContent =

"--";

}



if(profileDOB){

profileDOB.textContent =

"--";

}



if(profileAge){

profileAge.textContent =

"--";

}



if(profileCategory){

profileCategory.textContent =

"PREMIUM MEMBER";

}



if(profileStampCount){

profileStampCount.textContent =

"0 / 6";

}



if(profileReward){

profileReward.textContent =

"Locked";

}



if(profileMemberSince){

profileMemberSince.textContent =

"--";

}


}



// ============================
// LOAD PROFILE DATA
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

await getDoc(customerRef);



if(!customerSnap.exists()){


console.log(

"Customer Document Not Found"

);


setDefaultProfile();


return;


}



const data =

customerSnap.data();



console.log(

"Customer Data:",

data

);



updateProfileUI(data);



}


catch(error){


console.error(

"Profile Loading Error:",

error

);


setDefaultProfile();


}



}

// =====================================================
// UPDATE PROFILE UI
// PART 2
// =====================================================


function updateProfileUI(data){



// ============================
// BASIC INFO
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
// PERSONAL DETAILS
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


if(data.category){


profileCategory.textContent =

data.category.toUpperCase();


}

else if(data.gender){


profileCategory.textContent =

data.gender.toUpperCase();


}

else{


profileCategory.textContent =

"PREMIUM MEMBER";


}


}





// ============================
// LOYALTY DATA
// ============================


const stamps =

Number(data.stamps || 0);





if(profileStampCount){


profileStampCount.textContent =

`${stamps} / 6`;


}





if(profileReward){



if(

data.rewardUnlocked === true ||

stamps >= 6

){


profileReward.textContent =

"🎉 FREE VEG MAGGI UNLOCKED";


}

else{


profileReward.textContent =

"🔒 Locked";


}



}




// ============================
// MEMBER SINCE
// ============================


if(profileMemberSince){



if(data.createdAt){



try{


if(data.createdAt.toDate){



profileMemberSince.textContent =

data.createdAt

.toDate()

.toLocaleDateString();



}

else{



profileMemberSince.textContent =

new Date(data.createdAt)

.toLocaleDateString();



}



}

catch(error){



profileMemberSince.textContent =

"--";



}



}

else{


profileMemberSince.textContent =

"--";


}



}





console.log(

"Profile UI Updated Successfully"

);



}




// =====================================================
// AUTH CONNECTION
// =====================================================


onAuthStateChanged(

auth,

async(user)=>{


if(user){



console.log(

"PROFILE USER UID:",

user.uid

);



await loadProfileData(user);



}

else{



window.location.href =

"login.html";


}



});

// =====================================================
// LOGOUT
// PART 3
// =====================================================


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





// =====================================================
// EDIT PROFILE
// =====================================================


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

"Premium Profile System Ready"

);


console.log(

"================================"

);
