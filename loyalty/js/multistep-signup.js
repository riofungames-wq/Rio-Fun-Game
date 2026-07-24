// ======================================
// RIO LOYALTY CLUB
// MULTI STEP SIGNUP
// PART 1
// ======================================

// ---------- Elements ----------

const steps = document.querySelectorAll(".signup-step");

const nextButtons = document.querySelectorAll(".next-btn");
const backButtons = document.querySelectorAll(".back-btn");

const progressFill = document.getElementById("progressFill");
const stepNumber = document.getElementById("stepNumber");

const form = document.getElementById("signupForm");

// ---------- Current Step ----------

let currentStep = 0;

// ---------- User Data ----------

let selectedGender = "";
let selectedAvatar = "";

// ---------- Show Step ----------

function showStep(index){

steps.forEach(step=>{

step.classList.remove("active");

});

steps[index].classList.add("active");

// Progress

stepNumber.textContent=index+1;

const percent=((index+1)/steps.length)*100;

progressFill.style.width=percent+"%";

}

// Initial

showStep(currentStep);
// ======================================
// PART 2
// NEXT & BACK BUTTONS
// ======================================

// ---------- Next ----------

nextButtons.forEach(button=>{

button.addEventListener("click",()=>{

// STEP 1 VALIDATION

if(currentStep===0){

const name=document.getElementById("name").value.trim();

const mobile=document.getElementById("mobile").value.trim();

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value;

const confirm=document.getElementById("confirmPassword").value;

if(
name===""||
mobile===""||
email===""||
password===""||
confirm===""){

alert("Please fill all required fields.");

return;

}

if(password!==confirm){

alert("Passwords do not match.");

return;

}

}

// STEP 2 VALIDATION

if(currentStep===1){

if(selectedGender===""){

alert("Please select your gender.");

return;

}

}

// GO NEXT

if(currentStep<steps.length-1){

currentStep++;

showStep(currentStep);

}

// UPDATE REVIEW

if(currentStep===3){

updateReview();

}

});

});

// ---------- Back ----------

backButtons.forEach(button=>{

button.addEventListener("click",()=>{

if(currentStep>0){

currentStep--;

showStep(currentStep);

}

});

});
// ======================================
// PART 3
// GENDER + AVATAR + PHOTO UPLOAD
// ======================================

// ---------- Gender Selection ----------

document.querySelectorAll(".gender-card").forEach(card=>{

card.addEventListener("click",()=>{

document.querySelectorAll(".gender-card").forEach(c=>{

c.classList.remove("active");

});

card.classList.add("active");

selectedGender=card.dataset.gender;

loadAvatars(selectedGender);

});

});

// ---------- Avatar Loader ----------

function loadAvatars(gender){

const avatarGrid=document.getElementById("avatarGrid");

avatarGrid.innerHTML="";

for(let i=1;i<=8;i++){

const number=String(i).padStart(2,"0");

const imagePath=`assets/avatars/${gender}-${number}.png`;

const avatar=document.createElement("div");

avatar.className="avatar-item";

avatar.innerHTML=`
<img src="${imagePath}" alt="Avatar">
`;

avatar.addEventListener("click",()=>{

document.querySelectorAll(".avatar-item").forEach(item=>{

item.classList.remove("active");

});

avatar.classList.add("active");

selectedAvatar=imagePath;

document.getElementById("previewImage").src=imagePath;

document.getElementById("finalPreview").src=imagePath;

});

avatarGrid.appendChild(avatar);

}

// Upload Card

const upload=document.createElement("div");

upload.className="avatar-item";

upload.innerHTML=`
<div style="
width:100%;
height:100%;
display:flex;
align-items:center;
justify-content:center;
font-size:32px;
">
<i class="fa-solid fa-camera"></i>
</div>
`;

upload.addEventListener("click",()=>{

document.getElementById("photoInput").click();

});

avatarGrid.appendChild(upload);

}

// ---------- Upload Photo ----------

document.getElementById("photoInput").addEventListener("change",(event)=>{

const file=event.target.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=function(e){

selectedAvatar=e.target.result;

document.getElementById("previewImage").src=selectedAvatar;

document.getElementById("finalPreview").src=selectedAvatar;

};

reader.readAsDataURL(file);

});
// ======================================
// PART 4
// REVIEW + SUBMIT
// ======================================

// ---------- Review ----------

function updateReview(){

document.getElementById("reviewName").textContent =
document.getElementById("name").value.trim();

document.getElementById("reviewMobile").textContent =
document.getElementById("mobile").value.trim();

document.getElementById("reviewEmail").textContent =
document.getElementById("email").value.trim();

document.getElementById("reviewGender").textContent =
selectedGender || "-";

}

// ---------- Submit ----------

form.addEventListener("submit",(event)=>{

event.preventDefault();

const agree=document.getElementById("agreeTerms");

if(!agree.checked){

alert("Please accept the terms before creating your account.");

return;

}

// Firebase file इस data को use करेगी

window.signupData={

name:document.getElementById("name").value.trim(),

mobile:document.getElementById("mobile").value.trim(),

email:document.getElementById("email").value.trim(),

password:document.getElementById("password").value,

gender:selectedGender,

avatar:selectedAvatar

};

// Trigger Firebase

document.dispatchEvent(

new CustomEvent("signup-ready")

);

});
