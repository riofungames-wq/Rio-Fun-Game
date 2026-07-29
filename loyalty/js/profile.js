// =====================================================
// RIO MAGGI POINT
// PROFILE.JS
// FINAL FIXED VERSION
// PART 1 / 3
// =====================================================


import { auth, db } from "./firebase-config.js";


import {

onAuthStateChanged,

signOut

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



import {

doc,

getDoc,

updateDoc

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




// =====================================================
// ELEMENTS
// =====================================================


const profilePhoto =

document.getElementById("profilePhoto");


const profileName =

document.getElementById("profileName");


const profileMemberId =

document.getElementById("profileMemberId");


const profileMobile =

document.getElementById("profileMobile");


const profileEmail =

document.getElementById("profileEmail");


const profileDOB =

document.getElementById("profileDOB");


const profileAge =

document.getElementById("profileAge");


const profileCategory =

document.getElementById("profileCategory");


const profileStampCount =

document.getElementById("profileStampCount");


const profileReward =

document.getElementById("profileReward");


const profileMemberSince =

document.getElementById("profileMemberSince");



const editProfileBtn =

document.getElementById("editProfileBtn");


const logoutBtn =

document.getElementById("logoutBtn");



const editModal =

document.getElementById("editModal");


const editName =

document.getElementById("editName");


const saveProfileBtn =

document.getElementById("saveProfileBtn");


const closeEditBtn =

document.getElementById("closeEditBtn");





// =====================================================
// VARIABLES
// =====================================================


let currentCustomer = null;

let currentUID = null;





// =====================================================
// AUTH CHECK
// =====================================================


onAuthStateChanged(

auth,

async(user)=>{


if(!user){


location.href="login.html";


return;


}



try{


currentUID = user.uid;



const customerRef =

doc(

db,

"customers",

user.uid

);



const customerSnap =

await getDoc(customerRef);




if(!customerSnap.exists()){


alert(

"Customer Not Found"

);


return;


}





currentCustomer =

customerSnap.data();



loadProfile(currentCustomer);



}



catch(error){


console.error(

"Profile Load Error:",

error

);



alert(

"Unable To Load Profile"

);



}



}

);
// =====================================================
// LOAD PROFILE DATA
// PART 2 / 3
// =====================================================


function loadProfile(customer){



profilePhoto.src =

customer.photoURL ||

customer.avatar ||

"assets/avatars/default.png";





profileName.textContent =

customer.name || "Customer";





profileMemberId.textContent =

customer.memberId || "RIO-000000";





profileMobile.textContent =

customer.mobile || "--";





profileEmail.textContent =

customer.email || "--";





profileDOB.textContent =

customer.dob || "--";





profileAge.textContent =

customer.age || "--";





profileCategory.textContent =

customer.gender

? customer.gender.toUpperCase()

: "PREMIUM MEMBER";






const stamps =

Number(customer.stamps || 0);





profileStampCount.textContent =

`${stamps} / 6`;






if(

customer.rewardUnlocked === true ||

stamps >= 6

){


profileReward.textContent =

"FREE VEG MAGGI UNLOCKED";


}

else{


profileReward.textContent =

"Locked";


}






if(customer.createdAt){


try{


const date =

customer.createdAt.toDate

? customer.createdAt.toDate()

: new Date(

customer.createdAt.seconds * 1000

);



profileMemberSince.textContent =

date.toLocaleDateString();



}

catch{


profileMemberSince.textContent =

"--";


}



}

else{


profileMemberSince.textContent =

"--";


}




}







// =====================================================
// OPEN EDIT PROFILE
// =====================================================


if(editProfileBtn){


editProfileBtn.addEventListener(

"click",

()=>{


if(!editModal) return;



editName.value =

currentCustomer.name || "";



editModal.style.display =

"flex";



}

);



}







// =====================================================
// CLOSE EDIT PROFILE
// =====================================================


if(closeEditBtn){


closeEditBtn.addEventListener(

"click",

()=>{


editModal.style.display =

"none";


}

);


}







// =====================================================
// SAVE PROFILE NAME
// FIRESTORE UPDATE
// =====================================================


if(saveProfileBtn){


saveProfileBtn.addEventListener(

"click",

async()=>{



const newName =

editName.value.trim();





if(!newName){


alert(

"Please enter name"

);


return;


}





try{


saveProfileBtn.disabled = true;



const customerRef =

doc(

db,

"customers",

currentUID

);





await updateDoc(

customerRef,

{


name:newName


}

);





currentCustomer.name =

newName;



loadProfile(currentCustomer);



editModal.style.display =

"none";





alert(

"Profile Updated Successfully"

);



}



catch(error){


console.error(

"Update Error:",

error

);



alert(

"Profile Update Failed"

);



}



finally{


saveProfileBtn.disabled = false;



}



}

);



}
// =====================================================
// LOGOUT + FINAL CHECKS
// PART 3 / 3
// =====================================================



// ============================
// LOGOUT
// ============================


if(logoutBtn){


logoutBtn.addEventListener(

"click",

async()=>{



const confirmLogout =

confirm(

"Do you want to logout?"

);





if(!confirmLogout){

return;

}





try{


await signOut(auth);



location.href =

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
// CLOSE MODAL OUTSIDE CLICK
// ============================


if(editModal){


window.addEventListener(

"click",

(e)=>{


if(e.target === editModal){


editModal.style.display =

"none";


}



}

);



}






// ============================
// READY LOG
// ============================


console.log(

"================================"

);


console.log(

"🍜 Rio Maggi Point"

);


console.log(

"Profile Page Ready"

);


console.log(

"Edit Profile Enabled"

);


console.log(

"Firestore Update Connected"

);


console.log(

"================================"

);
