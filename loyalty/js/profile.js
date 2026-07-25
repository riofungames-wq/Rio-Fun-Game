// ======================================
// RIO MAGGI POINT
// PROFILE SYSTEM
// PART 1
// ======================================

import {

auth,
db,
storage

} from "./firebase-config.js";

import {

onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

doc,
getDoc,
updateDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {

ref,
uploadBytes,
getDownloadURL,
deleteObject

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// ======================================
// HTML ELEMENTS
// ======================================

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

// ======================================

let currentUser = null;

let selectedAvatar = "";

let uploadedFile = null;

// ======================================
// LOGIN CHECK
// ======================================

onAuthStateChanged(auth, async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

currentUser = user;

loadProfile(user.uid);

});

// ======================================
// LOAD PROFILE
// ======================================

async function loadProfile(uid){

try{

const customerRef =
doc(db,"customers",uid);

const snap =
await getDoc(customerRef);

if(!snap.exists()) return;

const data = snap.data();

if(data.photoURL){

previewImage.src =
data.photoURL;

selectedAvatar =
data.photoURL;

}

}
catch(error){

console.log(error);

}

}

// ======================================
// IMAGE PICK
// ======================================

photoInput.addEventListener("change",(e)=>{

const file =
e.target.files[0];

if(!file) return;

uploadedFile = file;

previewImage.src =
URL.createObjectURL(file);

});

// ======================================
// DEFAULT AVATAR
// ======================================

avatarOptions.forEach((avatar)=>{

avatar.onclick=function(){

selectedAvatar =
this.src;

previewImage.src =
this.src;

uploadedFile = null;

};

});
// ======================================
// SAVE AVATAR
// ======================================

saveAvatar.addEventListener("click", async()=>{

if(!currentUser){

alert("Login Required");

return;

}

try{

let photoURL = selectedAvatar;

// ======================================
// UPLOAD CUSTOM PHOTO
// ======================================

if(uploadedFile){

const storageRef = ref(

storage,

"customers/" +

currentUser.uid +

"/profile.jpg"

);

await uploadBytes(

storageRef,

uploadedFile

);

photoURL = await getDownloadURL(storageRef);

}

// ======================================
// SAVE TO FIRESTORE
// ======================================

await updateDoc(

doc(db,"customers",currentUser.uid),

{

photoURL:photoURL

}

);

alert("Profile Updated Successfully");

}
catch(error){

console.log(error);

alert("Upload Failed");

}

});

// ======================================
// REMOVE PHOTO
// ======================================

removeAvatar.addEventListener("click", async()=>{

if(!currentUser) return;

try{

const storageRef = ref(

storage,

"customers/" +

currentUser.uid +

"/profile.jpg"

);

try{

await deleteObject(storageRef);

}catch(e){

// Ignore if file not found

}

// Default Avatar

const defaultAvatar =

"assets/avatar/default.png";

await updateDoc(

doc(db,"customers",currentUser.uid),

{

photoURL:defaultAvatar

}

);

previewImage.src = defaultAvatar;

selectedAvatar = defaultAvatar;

uploadedFile = null;

alert("Photo Removed");

}
catch(error){

console.log(error);

}

});
// ======================================
// ACTIVE AVATAR BORDER
// ======================================

avatarOptions.forEach((avatar)=>{

avatar.addEventListener("click",()=>{

avatarOptions.forEach((item)=>{

item.style.border =
"2px solid #444";

});

avatar.style.border =
"3px solid gold";

});

});

// ======================================
// AUTO REFRESH AFTER SAVE
// ======================================

async function refreshProfile(){

if(!currentUser) return;

try{

const customerRef =
doc(db,"customers",currentUser.uid);

const snap =
await getDoc(customerRef);

if(!snap.exists()) return;

const data = snap.data();

if(data.photoURL){

previewImage.src =
data.photoURL;

selectedAvatar =
data.photoURL;

}

}
catch(error){

console.log(error);

}

}

// ======================================
// PAGE LOAD
// ======================================

window.addEventListener("load",()=>{

refreshProfile();

});

// ======================================
// NAVIGATION
// ======================================

document.querySelectorAll(".bottom-nav a")

.forEach((link)=>{

link.addEventListener("click",(e)=>{

// Future Animation Ready

});

});

// ======================================
// PROFILE READY
// ======================================

console.log("RIO PROFILE READY");

// ======================================
// END OF profile.js
// ======================================
