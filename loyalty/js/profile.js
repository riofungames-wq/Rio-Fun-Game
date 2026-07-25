// ======================================
// RIO MAGGI POINT
// PROFILE SYSTEM
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
// HTML
// ======================================

const previewImage =
document.getElementById("previewImage");

const photoInput =
document.getElementById("photoInput");

const saveAvatar =
document.getElementById("saveAvatar");

const removeAvatar =
document.getElementById("removeAvatar");

const avatarType =
document.getElementsByName("avatarType");

// ======================================

let currentUser = null;

let uploadedFile = null;

let selectedAvatar = "male";

// ======================================
// LOGIN CHECK
// ======================================

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href="login.html";

return;

}

currentUser=user;

loadProfile();

});

// ======================================
// LOAD PROFILE
// ======================================

async function loadProfile(){

const refDoc=

doc(db,"customers",currentUser.uid);

const snap=

await getDoc(refDoc);

if(!snap.exists()) return;

const data=snap.data();

// Male / Female

selectedAvatar=

data.avatarType || "male";

avatarType.forEach((radio)=>{

radio.checked=

radio.value===selectedAvatar;

});

// Preview

if(data.usePhoto && data.photoURL){

previewImage.src=

data.photoURL;

}

else{

previewImage.src=

`assets/avatars/${selectedAvatar}.png`;

}

}

// ======================================
// CHANGE DEFAULT AVATAR
// ======================================

avatarType.forEach((radio)=>{

radio.addEventListener("change",()=>{

selectedAvatar=radio.value;

if(!uploadedFile){

previewImage.src=

`assets/avatars/${selectedAvatar}.png`;

}

});

});

// ======================================
// IMAGE PICK
// ======================================

photoInput.addEventListener("change",(e)=>{

const file=e.target.files[0];

if(!file) return;

uploadedFile=file;

previewImage.src=

URL.createObjectURL(file);

});
// ======================================
// SAVE PROFILE
// ======================================

saveAvatar.addEventListener("click", async()=>{

if(!currentUser) return;

try{

let photoURL = "";

let usePhoto = false;

// ================================
// UPLOAD PHOTO
// ================================

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

usePhoto = true;

}

// ================================
// SAVE FIRESTORE
// ================================

await updateDoc(

doc(db,"customers",currentUser.uid),

{

avatarType:selectedAvatar,

photoURL:photoURL,

usePhoto:usePhoto

}

);

alert("✅ Profile Updated Successfully");

loadProfile();

}
catch(error){

console.log(error);

alert("❌ Failed To Save Profile");

}

});

// ======================================
// REMOVE PHOTO
// ======================================

removeAvatar.addEventListener("click",async()=>{

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

console.log("Photo Already Removed");

}

await updateDoc(

doc(db,"customers",currentUser.uid),

{

photoURL:"",

usePhoto:false,

avatarType:selectedAvatar

}

);

previewImage.src =

`assets/avatars/${selectedAvatar}.png`;

uploadedFile = null;

alert("✅ Photo Removed");

}
catch(error){

console.log(error);

alert("❌ Remove Failed");

}

});

// ======================================
// PROFILE READY
// ======================================

console.log("PROFILE READY");
