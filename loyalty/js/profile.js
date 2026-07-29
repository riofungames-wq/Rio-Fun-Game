// =====================================================
// RIO MAGGI POINT
// PROFILE.JS
// FINAL EDIT PROFILE VERSION
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





// BUTTONS


const editProfileBtn =
document.getElementById("editProfileBtn");


const saveProfileBtn =
document.getElementById("saveProfileBtn");


const closeEditBtn =
document.getElementById("closeEditBtn");


const editModal =
document.getElementById("editModal");


const editName =
document.getElementById("editName");


const editDOB =
document.getElementById("editDOB");


const editAge =
document.getElementById("editAge");


const editGender =
document.getElementById("editGender");


const logoutBtn =
document.getElementById("logoutBtn");






// =====================================================
// VARIABLES
// =====================================================


let currentCustomer = null;

let currentUID = null;
// =====================================================
// AUTH + LOAD CUSTOMER
// PART 2 / 3
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

: new Date(customer.createdAt.seconds * 1000);



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
// OPEN EDIT MODAL
// =====================================================


if(editProfileBtn){


editProfileBtn.addEventListener(

"click",

()=>{


editName.value =

currentCustomer.name || "";



editDOB.value =

currentCustomer.dob || "";



editAge.value =

currentCustomer.age || "";



editGender.value =

currentCustomer.gender || "";





editModal.style.display =

"flex";



}

);



}
// =====================================================
// SAVE EDIT PROFILE
// PART 3 / 3
// =====================================================


if(saveProfileBtn){


saveProfileBtn.addEventListener(

"click",

async()=>{


const updatedName =

editName.value.trim();


const updatedDOB =

editDOB.value;


const updatedAge =

editAge.value;


const updatedGender =

editGender.value;




if(!updatedName){


alert(

"Please enter name"

);


return;


}




try{


saveProfileBtn.disabled = true;



saveProfileBtn.innerHTML =

"Saving...";





const customerRef =

doc(

db,

"customers",

currentUID

);





await updateDoc(

customerRef,

{


name: updatedName,

dob: updatedDOB,

age: updatedAge,

gender: updatedGender



}

);





// Update local data


currentCustomer.name =

updatedName;


currentCustomer.dob =

updatedDOB;


currentCustomer.age =

updatedAge;


currentCustomer.gender =

updatedGender;






loadProfile(currentCustomer);






editModal.style.display =

"none";





alert(

"Profile Updated Successfully"

);



}



catch(error){


console.error(

"Profile Update Error:",

error

);



alert(

"Profile Update Failed"

);



}



finally{


saveProfileBtn.disabled = false;


saveProfileBtn.innerHTML =

`<i class="fa-solid fa-check"></i> Save`;



}



}

);



}







// =====================================================
// CLOSE EDIT MODAL
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
// LOGOUT
// =====================================================


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







// =====================================================
// CLOSE MODAL OUTSIDE CLICK
// =====================================================


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







console.log(

"================================"

);


console.log(

"🍜 Rio Maggi Point"

);


console.log(

"Profile Edit System Active"

);


console.log(

"Name DOB Age Gender Update Ready"

);


console.log(

"================================"

);
