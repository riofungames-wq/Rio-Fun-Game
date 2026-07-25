// ==========================================
// RIO MAGGI POINT
// PROFILE
// PART 1
// ==========================================

import { auth, db }
from "./firebase-config.js";

import {

onAuthStateChanged

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

// ==========================================
// HTML
// ==========================================

const previewImage =
document.getElementById("previewImage");

const photoInput =
document.getElementById("photoInput");

const saveAvatar =
document.getElementById("saveAvatar");

const removeAvatar =
document.getElementById("removeAvatar");

const avatarOptions =
document.querySelectorAll(".avatar-option");

// ==========================================
// VARIABLES
// ==========================================

let currentUser = null;

let selectedAvatar = "";

let selectedGender = "male";

// ==========================================
// LOGIN
// ==========================================

onAuthStateChanged(

auth,

async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

currentUser = user;

loadProfile(user.uid);

}

);

// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile(uid){

try{

const ref =

doc(

db,

"customers",

uid

);

const snap =

await getDoc(ref);

if(!snap.exists()) return;

const data = snap.data();

// Gender

selectedGender =

data.gender || "male";

// Avatar

selectedAvatar =

data.photoURL || "";

if(selectedAvatar!=""){

previewImage.src =

selectedAvatar;

}

else{

if(selectedGender==="female"){

previewImage.src =

"assets/avatars/female.png";

}

else{

previewImage.src =

"assets/avatars/male.png";

}

}

}

catch(err){

console.log(err);

}

}
// ==========================================
// AVATAR SELECT
// ==========================================

avatarOptions.forEach((avatar)=>{

avatar.addEventListener("click",()=>{

selectedAvatar =
avatar.src;

previewImage.src =
selectedAvatar;

// Gender Detect

if(

selectedAvatar
.toLowerCase()
.includes("female")

||

selectedAvatar
.toLowerCase()
.includes("girl")

){

selectedGender =
"female";

}

else{

selectedGender =
"male";

}

});

});

// ==========================================
// PHOTO UPLOAD
// ==========================================

photoInput.addEventListener(

"change",

(e)=>{

const file =
e.target.files[0];

if(!file) return;

const reader =
new FileReader();

reader.onload=function(){

selectedAvatar =
reader.result;

previewImage.src =
reader.result;

};

reader.readAsDataURL(file);

}

);

// ==========================================
// REMOVE PHOTO
// ==========================================

removeAvatar.addEventListener(

"click",

()=>{

selectedAvatar="";

if(selectedGender==="female"){

previewImage.src=
"assets/avatars/female.png";

}

else{

previewImage.src=
"assets/avatars/male.png";

}

}

);

// ==========================================
// SAVE
// ==========================================

saveAvatar.addEventListener(

"click",

async()=>{

if(!currentUser) return;

try{

await updateDoc(

doc(

db,

"customers",

currentUser.uid

),

{

photoURL:selectedAvatar,

gender:selectedGender

}

);

alert(

"Profile Updated Successfully"

);

window.location.href="card.html";

}

catch(err){

console.log(err);

alert(

"Update Failed"

);

}

});

// ==========================================
// READY
// ==========================================

console.log(

"RIO PROFILE READY"

);
