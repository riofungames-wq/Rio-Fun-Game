// ======================================
// RIO MAGGI POINT
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

// ---------- Variables ----------

let currentStep = 0;
let selectedGender = "";
let selectedAvatar = "";

// ---------- Show Step ----------

function showStep(index){

    steps.forEach(step=>{
        step.classList.remove("active");
    });

    steps[index].classList.add("active");

    stepNumber.textContent=index+1;

    const percent=((index+1)/steps.length)*100;
    progressFill.style.width=percent+"%";

}

showStep(currentStep);

// ======================================
// NEXT BUTTON
// ======================================

nextButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        // STEP 1

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

        // STEP 2

        if(currentStep===1){

            if(selectedGender===""){

                alert("Please select your gender.");
                return;

            }

        }

        if(currentStep<steps.length-1){

            currentStep++;
            showStep(currentStep);

        }

        if(currentStep===3){

            updateReview();

        }

    });

});

// ======================================
// BACK BUTTON
// ======================================

backButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        if(currentStep>0){

            currentStep--;
            showStep(currentStep);

        }

    });

});

// ======================================
// GENDER SELECT
// ======================================

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
// ======================================
// PART 2
// AVATAR SYSTEM (FIXED)
// ======================================

// ---------- Avatar Loader ----------

function loadAvatars(gender){

    const avatarGrid=document.getElementById("avatarGrid");

    avatarGrid.innerHTML="";

    let avatarPath="assets/avatars/male.png";

    if(gender==="female"){

        avatarPath="assets/avatars/female.png";

    }

    // Main Avatar

    const avatar=document.createElement("div");

    avatar.className="avatar-item active";

    avatar.innerHTML=`
        <img src="${avatarPath}" alt="Avatar">
    `;

    selectedAvatar=avatarPath;

    document.getElementById("previewImage").src=avatarPath;
    document.getElementById("finalPreview").src=avatarPath;

    avatar.addEventListener("click",()=>{

        selectedAvatar=avatarPath;

        document.getElementById("previewImage").src=avatarPath;
        document.getElementById("finalPreview").src=avatarPath;

    });

    avatarGrid.appendChild(avatar);

    // Upload Button

    const upload=document.createElement("div");

    upload.className="avatar-item";

    upload.innerHTML=`
        <div style="
            width:100%;
            height:100%;
            display:flex;
            justify-content:center;
            align-items:center;
            font-size:30px;
        ">
            <i class="fa-solid fa-camera"></i>
        </div>
    `;

    upload.addEventListener("click",()=>{

        document.getElementById("photoInput").click();

    });

    avatarGrid.appendChild(upload);

}

// ======================================
// PHOTO UPLOAD
// ======================================

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
// PART 3
// REVIEW + FIREBASE SUBMIT
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

    if(selectedAvatar){

        document.getElementById("finalPreview").src =
        selectedAvatar;

    }

}

// ======================================
// SUBMIT
// ======================================

form.addEventListener("submit",(event)=>{

    event.preventDefault();

    const agree =
    document.getElementById("agreeTerms");

    if(!agree.checked){

        alert(
        "Please accept the Terms & Conditions."
        );

        return;

    }

    window.signupData={

        name:
        document.getElementById("name")
        .value.trim(),

        mobile:
        document.getElementById("mobile")
        .value.trim(),

        email:
        document.getElementById("email")
        .value.trim(),

        password:
        document.getElementById("password")
        .value,

        gender:selectedGender,

        avatar:selectedAvatar

    };

    document.dispatchEvent(

        new CustomEvent("signup-ready")

    );

});

// ======================================

console.log(
"🍜 Rio Maggi Point Signup Ready"
);
