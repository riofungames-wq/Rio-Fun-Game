// ======================================
// RIO MAGGI POINT
// MULTI STEP SIGNUP
// FINAL FIXED VERSION
// ======================================

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
const confirmPasswordInput = document.getElementById("confirmPassword");

const photoInput = document.getElementById("photoInput");
const previewImage = document.getElementById("previewImage");
const finalPreview = document.getElementById("finalPreview");

const avatarGrid = document.getElementById("avatarGrid");
const uploadPhotoBtn = document.getElementById("uploadPhotoBtn");
const agreeTerms = document.getElementById("agreeTerms");

let currentStep = 0;
let selectedGender = "";
let selectedAvatar = "";


// ======================================
// DEFAULT AVATARS
// ======================================

const DEFAULT_AVATARS = {

    male: "assets/avatars/male.png",

    female: "assets/avatars/female.png",

    other: "assets/avatars/other.png"

};


// ======================================
// SHOW STEP
// ======================================

function showStep(index) {

    if (!steps.length) {
        return;
    }

    currentStep = Math.max(
        0,
        Math.min(index, steps.length - 1)
    );

    steps.forEach((step, i) => {

        step.classList.toggle(
            "active",
            i === currentStep
        );

    });

    if (stepNumber) {

        stepNumber.textContent =
            currentStep + 1;

    }

    if (progressFill) {

        const percent =
            ((currentStep + 1) / steps.length) * 100;

        progressFill.style.width =
            `${percent}%`;

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ======================================
// VALIDATE STEP 1
// ======================================

function validateStepOne() {

    const name =
        nameInput?.value.trim() || "";

    const mobile =
        mobileInput?.value.trim() || "";

    const email =
        emailInput?.value.trim() || "";

    const password =
        passwordInput?.value || "";

    const confirmPassword =
        confirmPasswordInput?.value || "";


    if (
        !name ||
        !mobile ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        alert(
            "Please fill all required fields."
        );

        return false;

    }


    if (name.length < 2) {

        alert(
            "Please enter a valid full name."
        );

        return false;

    }


    const cleanMobile =
        mobile.replace(/\D/g, "");


    if (
        cleanMobile.length < 10 ||
        cleanMobile.length > 15
    ) {

        alert(
            "Please enter a valid mobile number."
        );

        return false;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        alert(
            "Please enter a valid email address."
        );

        return false;

    }


    if (password.length < 6) {

        alert(
            "Password must be at least 6 characters."
        );

        return false;

    }


    if (password !== confirmPassword) {

        alert(
            "Passwords do not match."
        );

        return false;

    }


    return true;

}


// ======================================
// LOAD AVATARS
// ======================================

function loadAvatars(gender) {

    if (!avatarGrid) {
        return;
    }

    avatarGrid.innerHTML = "";

    selectedAvatar =
        DEFAULT_AVATARS[gender] ||
        DEFAULT_AVATARS.other;


    // ==================================
    // DEFAULT AVATAR
    // ==================================

    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar-item active";

    avatar.innerHTML = `
        <img
            src="${selectedAvatar}"
            alt="${gender} Avatar"
        >
    `;


    avatar.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(".avatar-item")
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


            avatar.classList.add(
                "active"
            );


            selectedAvatar =
                DEFAULT_AVATARS[gender] ||
                DEFAULT_AVATARS.other;


            updatePreview();

        }
    );


    avatarGrid.appendChild(
        avatar
    );


    // ==================================
    // UPLOAD AVATAR
    // ==================================

    const upload =
        document.createElement("div");

    upload.className =
        "avatar-item upload-avatar";

    upload.setAttribute(
        "role",
        "button"
    );

    upload.setAttribute(
        "tabindex",
        "0"
    );

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
            <i class="fa-solid fa-camera"></i>
        </div>
    `;


    const openUpload = () => {

        photoInput?.click();

    };


    upload.addEventListener(
        "click",
        openUpload
    );


    upload.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openUpload();

            }

        }
    );


    avatarGrid.appendChild(
        upload
    );


    updatePreview();

}


// ======================================
// UPDATE PREVIEW
// ======================================

function updatePreview() {

    if (!selectedAvatar) {
        return;
    }


    if (previewImage) {

        previewImage.src =
            selectedAvatar;

    }


    if (finalPreview) {

        finalPreview.src =
            selectedAvatar;

    }

}


// ======================================
// GENDER SELECTION
// ======================================

document
    .querySelectorAll(".gender-card")
    .forEach(card => {

        const selectGender = () => {

            document
                .querySelectorAll(".gender-card")
                .forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


            card.classList.add(
                "active"
            );


            selectedGender =
                card.dataset.gender || "";


            const genderInput =
                document.getElementById("gender");


            if (genderInput) {

                genderInput.value =
                    selectedGender;

            }


            loadAvatars(
                selectedGender
            );

        };


        card.addEventListener(
            "click",
            selectGender
        );


        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    selectGender();

                }

            }
        );

    });


// ======================================
// UPLOAD BUTTON
// ======================================

if (uploadPhotoBtn) {

    uploadPhotoBtn.addEventListener(
        "click",
        () => {

            photoInput?.click();

        }
    );

}


// ======================================
// PHOTO UPLOAD
// ======================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            const allowedTypes = [

                "image/jpeg",

                "image/png",

                "image/webp"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select a JPG, PNG, or WEBP image."
                );

                photoInput.value = "";

                return;

            }


            const maxSize =
                5 * 1024 * 1024;


            if (file.size > maxSize) {

                alert(
                    "Image size must be less than 5MB."
                );

                photoInput.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload = event => {

                selectedAvatar =
                    event.target.result;


                updatePreview();


                document
                    .querySelectorAll(".avatar-item")
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });

            };


            reader.onerror = () => {

                alert(
                    "Unable to read selected image."
                );

                photoInput.value = "";

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

function updateReview() {

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


    if (reviewName) {

        reviewName.textContent =
            nameInput?.value.trim() || "-";

    }


    if (reviewMobile) {

        reviewMobile.textContent =
            mobileInput?.value.trim() || "-";

    }


    if (reviewEmail) {

        reviewEmail.textContent =
            emailInput?.value.trim() || "-";

    }


    if (reviewGender) {

        reviewGender.textContent =
            selectedGender || "-";

    }


    updatePreview();

}


// ======================================
// NEXT BUTTON
// ======================================

nextButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if (currentStep === 0) {

                if (!validateStepOne()) {
                    return;
                }

            }


            if (currentStep === 1) {

                if (!selectedGender) {

                    alert(
                        "Please select your gender."
                    );

                    return;

                }

            }


            if (currentStep === 2) {

                if (!selectedAvatar) {

                    alert(
                        "Please select an avatar or upload a photo."
                    );

                    return;

                }

            }


            if (
                currentStep <
                steps.length - 1
            ) {

                currentStep++;

                showStep(
                    currentStep
                );

            }


            if (
                currentStep ===
                steps.length - 1
            ) {

                updateReview();

            }

        }
    );

});


// ======================================
// BACK BUTTON
// ======================================

backButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            if (currentStep > 0) {

                currentStep--;

                showStep(
                    currentStep
                );

            }

        }
    );

});


// ======================================
// FORM SUBMIT
// ======================================

if (form) {

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (!validateStepOne()) {

                currentStep = 0;

                showStep(
                    currentStep
                );

                return;

            }


            if (!selectedGender) {

                alert(
                    "Please select your gender."
                );

                currentStep = 1;

                showStep(
                    currentStep
                );

                return;

            }


            if (!selectedAvatar) {

                alert(
                    "Please select an avatar or upload a photo."
                );

                currentStep = 2;

                showStep(
                    currentStep
                );

                return;

            }


            if (
                !agreeTerms ||
                !agreeTerms.checked
            ) {

                alert(
                    "Please accept the confirmation checkbox."
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
