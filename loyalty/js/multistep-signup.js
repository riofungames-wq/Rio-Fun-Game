/* ==========================================
   Rio Loyalty Club - Multi Step Signup
========================================== */

let currentStep = 1;

const totalSteps = 4;

const steps = document.querySelectorAll(".step");

const progressFill = document.getElementById("progressFill");

const stepNumber = document.getElementById("stepNumber");

/* -----------------------
   Show Step
----------------------- */

function showStep(step){

steps.forEach((item,index)=>{

item.classList.toggle("active",index===step-1);

});

progressFill.style.width=((step/totalSteps)*100)+"%";

stepNumber.textContent=step;

}

/* -----------------------
   Next Button
----------------------- */

document.addEventListener("click",(e)=>{

if(e.target.closest(".next-btn")){

if(currentStep<totalSteps){

currentStep++;

showStep(currentStep);

}

}

});

/* -----------------------
   Back Button
----------------------- */

document.addEventListener("click",(e)=>{

if(e.target.closest(".back-btn")){

if(currentStep>1){

currentStep--;

showStep(currentStep);

}

}

});

/* -----------------------
   Gender Selection
----------------------- */

let selectedGender="";

document.addEventListener("click",(e)=>{

const card=e.target.closest(".gender-card");

if(!card) return;

document.querySelectorAll(".gender-card").forEach(item=>{

item.classList.remove("active");

});

card.classList.add("active");

selectedGender=card.dataset.gender;

console.log("Gender :",selectedGender);

/* आगे अगले Part में
यहीं से Avatar Load होगा */

});

/* -----------------------
   Initialize
----------------------- */

showStep(1);
