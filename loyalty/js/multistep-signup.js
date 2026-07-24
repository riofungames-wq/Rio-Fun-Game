// ===============================
// Rio Loyalty Club
// Multi Step Signup
// ===============================

const steps = document.querySelectorAll(".signup-step");
const nextButtons = document.querySelectorAll(".next-btn");
const backButtons = document.querySelectorAll(".back-btn");

const progressFill = document.getElementById("progressFill");
const stepNumber = document.getElementById("stepNumber");

let currentStep = 0;

let selectedGender = "";
let selectedAvatar = "";

// ===============================
// Show Step
// ===============================

function showStep(index){

steps.forEach((step)=>{

step.classList.remove("active");

});

steps[index].classList.add("active");

stepNumber.textContent=index+1;

progressFill.style.width=((index+1)/steps.length)*100+"%";

}

showStep(currentStep);

// ===============================
// Next Button
// ===============================

nextButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

// Step 1 Validation

if(currentStep===0){

const name=document.getElementById("name").value.trim();

const mobile=document.getElementById("mobile").value.trim();

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value;

const confirm=document.getElementById("confirmPassword").value;

if(name===""||mobile===""||email===""||password===""||confirm===""){

alert("Please fill all fields.");

return;

}

if(password!==confirm){

alert("Passwords do not match.");

return;

}

}

// Step 2 Validation

if(currentStep===1){

if(selectedGender===""){

alert("Please select your gender.");

return;

}

}

// Last Step

if(currentStep<steps.length-1){

currentStep++;

showStep(currentStep);

updateReview();

}

});

});

// ===============================
// Back Button
// ===============================

backButtons.forEach(btn=>{

btn.addEventListener("click",()=>{

if(currentStep>0){

currentStep--;

showStep(currentStep);

}

});

});

// ===============================
// Gender Selection
// ===============================

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

// ===============================
// Avatar Loader
// ===============================

function loadAvatars(gender){

const avatarGrid=document.getElementById("avatarGrid");

avatarGrid.innerHTML="";

for(let i=1;i<=8;i++){

const avatar=document.createElement("div");

avatar.className="avatar-item";

avatar.innerHTML=`
<img src="assets/avatars/${gender}-${String(i).padStart(2,"0")}.png">
`;

avatar.onclick=()=>{

document.querySelectorAll(".avatar-item").forEach(a=>{

a.classList.remove("active");

});

avatar.classList.add("active");

selectedAvatar=`${gender}-${String(i).padStart(2,"0")}.png`;

document.getElementById("previewImage").src=
`assets/avatars/${selectedAvatar}`;

document.getElementById("finalPreview").src=
`assets/avatars/${selectedAvatar}`;

};

avatarGrid.appendChild(avatar);

}

// Upload Tile

const upload=document.createElement("div");

upload.className="avatar-item";

upload.innerHTML=`

<div style="
display:flex;
height:100%;
align-items:center;
justify-content:center;
font-size:30px;
">

📷

</div>

`;

upload.onclick=()=>{

document.getElementById("photoInput").click();

};

avatarGrid.appendChild(upload);

}

// ===============================
// Upload Photo
// ===============================

document.getElementById("photoInput").addEventListener("change",(e)=>{

const file=e.target.files[0];

if(!file)return;

const reader=new FileReader();

reader.onload=(ev)=>{

document.getElementById("previewImage").src=ev.target.result;

document.getElementById("finalPreview").src=ev.target.result;

selectedAvatar=ev.target.result;

};

reader.readAsDataURL(file);

});

// ===============================
// Review
// ===============================

function updateReview(){

document.getElementById("reviewName").textContent=
document.getElementById("name").value;

document.getElementById("reviewMobile").textContent=
document.getElementById("mobile").value;

document.getElementById("reviewEmail").textContent=
document.getElementById("email").value;

document.getElementById("reviewGender").textContent=
selectedGender;

}
