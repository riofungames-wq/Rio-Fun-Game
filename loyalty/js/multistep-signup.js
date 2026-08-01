// ======================================
// RIO MAGGI POINT
// MULTI STEP SIGNUP
// FINAL FIXED VERSION
// ======================================

// ---------- Elements ----------

const steps = document.querySelectorAll(".signup-step");
const nextButtons = document.querySelectorAll(".next-btn");
const backButtons = document.querySelectorAll(".back-btn");

const progressFill = document.getElementById("progressFill");
const stepNumber = document.getElementById("stepNumber");

const form = document.getElementById("signupForm");

const nameInput = document.getElementById("name");
const mobileInput = document.getElementById("mobile");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput =
    document.getElementById("confirmPassword");

const photoInput =
    document.getElementById("photoInput");

const previewImage =
    document.getElementById("previewImage");

const finalPreview =
    document.getElementById("finalPreview");


// ---------- Variables ----------

let currentStep = 0;
let selectedGender = "";
let selectedAvatar = "";


// ======================================
// SHOW STEP
// ======================================

function showStep(index){

    if(!steps.length) return;

    steps.forEach((step, i)=>{

        step.classList.toggle(
            "active",
            i === index
        );

    });

    if(stepNumber){

        stepNumber.textContent =
            index + 1;

    }

    if(progressFill){

        const percent =
            ((index + 1) / steps.length) * 100;

        progressFill.style.width =
            percent + "%";

    }

}


// ======================================
// STEP 1 VALIDATION
// ======================================

function validateStepOne(){

    const name =
        nameInput?.value.trim();

    const mobile =
        mobileInput?.value.trim();

    const email =
        emailInput?.value.trim();

    const password =
        passwordInput?.value || "";

    const confirmPassword =
        confirmPasswordInput?.value || "";


    if(
        !name ||
        !mobile ||
        !email ||
        !password ||
        !confirmPassword
    ){

        alert(
            "Please fill all required fields."
        );

        return false;

    }


    if(name.length < 2){

        alert(
            "Please enter a valid full name."
        );

        return false;

    }


    if(!/^\+?[0-9\s\-()]{7,20}$/.test(mobile)){

        alert(
            "Please enter a valid mobile number."
        );

        return false;

    }


    if(password.length < 6){

        alert(
            "Password must be at least 6 characters."
        );

        return false;

    }


    if(password !== confirmPassword){

        alert(
            "Passwords do not match."
        );

        return false;

    }


    return true;

}


// ======================================
// NEXT BUTTON
// ======================================

nextButtons.forEach(button=>{

    button.addEventListener(
        "click",
        ()=>{

            if(currentStep === 0){

                if(!validateStepOne()){

                    return;

                }

            }


            if(currentStep === 1){

                if(!selectedGender){

                    alert(
                        "Please select your gender."
                    );

                    return;

                }

            }


            if(currentStep === 2){

                if(!selectedAvatar){

                    alert(
                        "Please select an avatar or upload a photo."
                    );

                    return;

                }

            }


            if(
                currentStep <
                steps.length - 1
            ){

                currentStep++;

                showStep(
                    currentStep
                );

            }


            if(
                currentStep ===
                steps.length - 1
            ){

                updateReview();

            }

        }
    );

});


// ======================================
// BACK BUTTON
// ======================================

backButtons.forEach(button=>{

    button.addEventListener(
        "click",
        ()=>{

            if(currentStep > 0){

                currentStep--;

                showStep(
                    currentStep
                );

            }

        }
    );

});


// ======================================
// GENDER SELECT
// ======================================

document
.querySelectorAll(".gender-card")
.forEach(card=>{

    card.addEventListener(
        "click",
        ()=>{

            document
            .querySelectorAll(".gender-card")
            .forEach(c=>{

                c.classList.remove(
                    "active"
                );

            });


            card.classList.add(
                "active"
            );


            selectedGender =
                card.dataset.gender || "";


            loadAvatars(
                selectedGender
            );

        }
    );

});


// ======================================
// AVATAR SYSTEM
// ======================================

function loadAvatars(gender){

    const avatarGrid =
        document.getElementById(
            "avatarGrid"
        );


    if(!avatarGrid){

        return;

    }


    avatarGrid.innerHTML = "";


    let avatarPath =
        "assets/avatars/male.png";


    if(gender === "female"){

        avatarPath =
            "assets/avatars/female.png";

    }


    if(gender === "other"){

        avatarPath =
            "assets/avatars/other.png";

    }


    // ==================================
    // DEFAULT AVATAR
    // ==================================

    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =
        "avatar-item active";


    avatar.innerHTML = `

        <img
            src="${avatarPath}"
            alt="Default Avatar"
        >

    `;


    selectedAvatar =
        avatarPath;


    if(previewImage){

        previewImage.src =
            avatarPath;

    }


    if(finalPreview){

        finalPreview.src =
            avatarPath;

    }


    avatar.addEventListener(
        "click",
        ()=>{

            document
            .querySelectorAll(".avatar-item")
            .forEach(item=>{

                item.classList.remove(
                    "active"
                );

            });


            avatar.classList.add(
                "active"
            );


            selectedAvatar =
                avatarPath;


            if(previewImage){

                previewImage.src =
                    selectedAvatar;

            }


            if(finalPreview){

                finalPreview.src =
                    selectedAvatar;

            }

        }
    );


    avatarGrid.appendChild(
        avatar
    );


    // ==================================
    // UPLOAD PHOTO BUTTON
    // ==================================

    const upload =
        document.createElement(
            "div"
        );


    upload.className =
        "avatar-item upload-avatar";


    upload.innerHTML = `

        <div
            style="
                width:100%;
                height:100%;
                display:flex;
                justify-content:center;
                align-items:center;
                font-size:30px;
            "
        >

            <i
                class="fa-solid fa-camera"
            ></i>

        </div>

    `;


    upload.addEventListener(
        "click",
        ()=>{

            if(photoInput){

                photoInput.click();

            }

        }
    );


    avatarGrid.appendChild(
        upload
    );

}


// ======================================
// PHOTO UPLOAD
// ======================================

if(photoInput){

    photoInput.addEventListener(
        "change",
        (event)=>{

            const file =
                event.target.files?.[0];


            if(!file){

                return;

            }


            if(!file.type.startsWith("image/")){

                alert(
                    "Please select a valid image."
                );

                photoInput.value = "";

                return;

            }


            const maxSize =
                5 * 1024 * 1024;


            if(file.size > maxSize){

                alert(
                    "Image size must be less than 5MB."
                );

                photoInput.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(e){

                    selectedAvatar =
                        e.target.result;


                    if(previewImage){

                        previewImage.src =
                            selectedAvatar;

                    }


                    if(finalPreview){

                        finalPreview.src =
                            selectedAvatar;

                    }


                    document
                    .querySelectorAll(
                        ".avatar-item"
                    )
                    .forEach(item=>{

                        item.classList.remove(
                            "active"
                        );

                    });

                };


            reader.onerror =
                function(){

                    alert(
                        "Unable to read selected image."
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ======================================
// UPDATE REVIEW
// ======================================

function updateReview(){

    const reviewName =
        document.getElementById(
            "reviewName"
        );

    const reviewMobile =
        document.getElementById(
            "reviewMobile"
        );

    const reviewEmail =
        document.getElementById(
            "reviewEmail"
        );

    const reviewGender =
        document.getElementById(
            "reviewGender"
        );


    if(reviewName){

        reviewName.textContent =
            nameInput?.value.trim() || "-";

    }


    if(reviewMobile){

        reviewMobile.textContent =
            mobileInput?.value.trim() || "-";

    }


    if(reviewEmail){

        reviewEmail.textContent =
            emailInput?.value.trim() || "-";

    }


    if(reviewGender){

        reviewGender.textContent =
            selectedGender || "-";

    }


    if(
        selectedAvatar &&
        finalPreview
    ){

        finalPreview.src =
            selectedAvatar;

    }

}


// ======================================
// FORM SUBMIT
// ======================================

if(form){

    form.addEventListener(
        "submit",
        (event)=>{

            event.preventDefault();


            const agree =
                document.getElementById(
                    "agreeTerms"
                );


            if(
                !validateStepOne()
            ){

                currentStep = 0;

                showStep(
                    currentStep
                );

                return;

            }


            if(!selectedGender){

                alert(
                    "Please select your gender."
                );

                currentStep = 1;

                showStep(
                    currentStep
                );

                return;

            }


            if(!selectedAvatar){

                alert(
                    "Please select an avatar or upload a photo."
                );

                currentStep = 2;

                showStep(
                    currentStep
                );

                return;

            }


            if(
                !agree ||
                !agree.checked
            ){

                alert(
                    "Please accept the Terms & Conditions."
                );

                return;

            }


            window.signupData = {

                name:
                    nameInput.value.trim(),

                mobile:
                    mobileInput.value.trim(),

                email:
                    emailInput.value.trim(),

                password:
                    passwordInput.value,

                gender:
                    selectedGender,

                avatar:
                    selectedAvatar

            };


            document.dispatchEvent(

                new CustomEvent(
                    "signup-ready"
                )

            );

        }
    );

}


// ======================================
// INITIALIZE
// ======================================

showStep(
    currentStep
);


console.log(
    "🍜 Rio Maggi Point Multi-Step Signup Ready"
);
