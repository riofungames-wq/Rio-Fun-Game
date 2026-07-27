// =====================================================
// RIO MAGGI POINT
// ADMIN SETTINGS
// PART 1
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
doc,
getDoc,
setDoc
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// =====================================================
// ELEMENTS
// =====================================================

const shopName =
document.getElementById("shopName");

const shopAddress =
document.getElementById("shopAddress");

const shopMobile =
document.getElementById("shopMobile");

const requiredStamp =
document.getElementById("requiredStamp");

const rewardName =
document.getElementById("rewardName");

const rewardStatus =
document.getElementById("rewardStatus");

const cameraMode =
document.getElementById("cameraMode");

const scannerFPS =
document.getElementById("scannerFPS");

const scannerBox =
document.getElementById("scannerBox");

const primaryColor =
document.getElementById("primaryColor");

const darkMode =
document.getElementById("darkMode");

const authStatus =
document.getElementById("authStatus");

const dbStatus =
document.getElementById("dbStatus");

const storageStatus =
document.getElementById("storageStatus");

const saveBtn =
document.getElementById("saveBtn");

// =====================================================

const SETTINGS_DOC="admin-settings";

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="admin-login.html";

return;

}

authStatus.textContent="Connected";
dbStatus.textContent="Connected";
storageStatus.textContent="Ready";

await loadSettings();

});

// =====================================================
// LOAD SETTINGS
// =====================================================

async function loadSettings(){

const ref=doc(db,"settings",SETTINGS_DOC);

const snap=await getDoc(ref);

if(!snap.exists()) return;

const s=snap.data();

shopName.value=s.shopName||"";

shopAddress.value=s.shopAddress||"";

shopMobile.value=s.shopMobile||"";

requiredStamp.value=s.requiredStamp||6;

rewardName.value=s.rewardName||"FREE VEG MAGGI";

rewardStatus.value=s.rewardStatus||"enabled";

cameraMode.value=s.cameraMode||"environment";

scannerFPS.value=s.scannerFPS||10;

scannerBox.value=s.scannerBox||250;

primaryColor.value=s.primaryColor||"#ff7b00";

darkMode.value=s.darkMode||"off";

}
// =====================================================
// SAVE SETTINGS
// =====================================================

saveBtn?.addEventListener("click", async()=>{

try{

saveBtn.disabled=true;

saveBtn.innerHTML="Saving...";

await setDoc(

doc(db,"settings",SETTINGS_DOC),

{

shopName:shopName.value.trim(),

shopAddress:shopAddress.value.trim(),

shopMobile:shopMobile.value.trim(),

requiredStamp:Number(requiredStamp.value),

rewardName:rewardName.value.trim(),

rewardStatus:rewardStatus.value,

cameraMode:cameraMode.value,

scannerFPS:Number(scannerFPS.value),

scannerBox:Number(scannerBox.value),

primaryColor:primaryColor.value,

darkMode:darkMode.value,

updatedAt:new Date().toISOString()

},

{ merge:true }

);

alert("✅ Settings Saved Successfully");

saveBtn.disabled=false;

saveBtn.innerHTML=

'<i class="fa-solid fa-floppy-disk"></i> Save Settings';

}catch(err){

console.error(err);

alert("❌ Failed To Save Settings");

saveBtn.disabled=false;

saveBtn.innerHTML=

'<i class="fa-solid fa-floppy-disk"></i> Save Settings';

}

});

// =====================================================
// LIVE PRIMARY COLOR PREVIEW
// =====================================================

primaryColor?.addEventListener("input",()=>{

document.documentElement.style.setProperty(

"--primary",

primaryColor.value

);

});

// =====================================================
// CONSOLE
// =====================================================

console.log("================================");
console.log("⚙ Rio Maggi Point");
console.log("Admin Settings Ready");
console.log("================================");
