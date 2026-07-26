// ======================================
// RIO MAGGI POINT
// PREMIUM PROFILE
// PROFILE.JS
// ======================================

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================
// HTML ELEMENTS
// ======================================

const profileCard =
    document.getElementById("profileCard");

const previewImage =
    document.getElementById("previewImage");

const customerName =
    document.getElementById("customerName");

const memberId =
    document.getElementById("memberId");

const customerGender =
    document.getElementById("customerGender");

const photoInput =
    document.getElementById("photoInput");

const saveAvatar =
    document.getElementById("saveAvatar");

const removeAvatar =
    document.getElementById("removeAvatar");

const rewardStatus =
    document.getElementById("rewardStatus");

const stampCircles =
    document.querySelectorAll(".stamp-circle");

const avatarTypeInputs =
    document.querySelectorAll(
        'input[name="avatarType"]'
    );


// ======================================
// GLOBAL DATA
// ======================================

let currentUser = null;

let currentCustomerData = null;

let selectedAvatarType = "male";

let uploadedPhotoData = null;


// ======================================
// DEFAULT AVATARS
// ======================================

const maleAvatar =
    "assets/avatars/male.png";

const femaleAvatar =
    "assets/avatars/female.png";


// ======================================
// AUTH CHECK
// ======================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser = user;


        try {

            await loadCustomerProfile(
                user.uid
            );

        }

        catch (error) {

            console.error(
                "Profile Load Error:",
                error
            );

            alert(
                "Unable to load your profile."
            );

        }

    }
);


// ======================================
// LOAD CUSTOMER PROFILE
// ======================================

async function loadCustomerProfile(
    userId
) {

    const customerRef =
        doc(
            db,
            "customers",
            userId
        );


    const customerSnap =
        await getDoc(
            customerRef
        );


    if (
        !customerSnap.exists()
    ) {

        alert(
            "Customer profile not found."
        );

        return;

    }


    currentCustomerData =
        customerSnap.data();


    // ==================================
    // CUSTOMER NAME
    // ==================================

    if (customerName) {

        customerName.textContent =
            currentCustomerData.name ||
            "Customer";

    }


    // ==================================
    // MEMBER ID
    // ==================================

    if (memberId) {

        memberId.textContent =
            currentCustomerData.memberId ||
            "RMP000000";

    }


    // ==================================
    // GENDER
    // ==================================

    const gender =
        String(
            currentCustomerData.gender ||
            "male"
        )
        .toLowerCase();


    selectedAvatarType =
        gender === "female"
            ? "female"
            : "male";


    if (customerGender) {

        customerGender.textContent =
            selectedAvatarType === "female"
                ? "Female"
                : "Male";

    }


    // ==================================
    // SELECT GENDER RADIO
    // ==================================

    avatarTypeInputs.forEach(
        (input) => {

            input.checked =
                input.value ===
                selectedAvatarType;

        }
    );


    // ==================================
    // LOAD AVATAR
    // ==================================

    if (
        currentCustomerData.avatar
    ) {

        uploadedPhotoData =
            currentCustomerData.avatar;


        previewImage.src =
            currentCustomerData.avatar;

    }

    else {

        previewImage.src =
            selectedAvatarType === "female"
                ? femaleAvatar
                : maleAvatar;

    }


    // ==================================
    // LOAD STAMPS
    // ==================================

    const stamps =
        Number(
            currentCustomerData.stamps ||
            0
        );


    updateStampDisplay(
        stamps,
        currentCustomerData.rewardUnlocked === true
    );


    // ==================================
    // APPLY GENDER THEME
    // ==================================

    applyGenderTheme(
        selectedAvatarType
    );

}


// ======================================
// AVATAR TYPE CHANGE
// ======================================

avatarTypeInputs.forEach(
    (input) => {

        input.addEventListener(
            "change",
            () => {

                selectedAvatarType =
                    input.value;


                if (
                    !uploadedPhotoData
                ) {

                    previewImage.src =
                        selectedAvatarType ===
                        "female"

                            ? femaleAvatar

                            : maleAvatar;

                }


                if (customerGender) {

                    customerGender.textContent =
                        selectedAvatarType ===
                        "female"

                            ? "Female"

                            : "Male";

                }


                applyGenderTheme(
                    selectedAvatarType
                );

            }
        );

    }
);


// ======================================
// PHOTO UPLOAD PREVIEW
// ======================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        (event) => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    uploadedPhotoData =
                        reader.result;


                    previewImage.src =
                        uploadedPhotoData;

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ======================================
// SAVE PROFILE
// ======================================

if (saveAvatar) {

    saveAvatar.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            try {

                saveAvatar.disabled =
                    true;


                saveAvatar.textContent =
                    "💾 Saving...";


                const customerRef =
                    doc(
                        db,
                        "customers",
                        currentUser.uid
                    );


                const updateData = {

                    gender:
                        selectedAvatarType,

                    updatedAt:
                        serverTimestamp()

                };


                if (
                    uploadedPhotoData
                ) {

                    updateData.avatar =
                        uploadedPhotoData;

                }


                await updateDoc(
                    customerRef,
                    updateData
                );


                currentCustomerData = {

                    ...currentCustomerData,

                    ...updateData

                };


                alert(
                    "✅ Profile Updated Successfully!"
                );

            }

            catch (error) {

                console.error(
                    "Save Profile Error:",
                    error
                );


                alert(
                    "Unable to save profile."
                );

            }

            finally {

                saveAvatar.disabled =
                    false;


                saveAvatar.textContent =
                    "💾 Save Profile";

            }

        }
    );

}


// ======================================
// REMOVE PHOTO
// ======================================

if (removeAvatar) {

    removeAvatar.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                return;

            }


            const confirmRemove =
                confirm(
                    "Remove your profile photo?"
                );


            if (
                !confirmRemove
            ) {

                return;

            }


            try {

                const customerRef =
                    doc(
                        db,
                        "customers",
                        currentUser.uid
                    );


                await updateDoc(
                    customerRef,
                    {

                        avatar: null,

                        updatedAt:
                            serverTimestamp()

                    }
                );


                uploadedPhotoData =
                    null;


                previewImage.src =
                    selectedAvatarType ===
                    "female"

                        ? femaleAvatar

                        : maleAvatar;


                alert(
                    "🗑 Profile photo removed."
                );

            }

            catch (error) {

                console.error(
                    "Remove Photo Error:",
                    error
                );


                alert(
                    "Unable to remove photo."
                );

            }

        }
    );

}


// ======================================
// STAMP DISPLAY
// ======================================

function updateStampDisplay(
    stamps,
    rewardUnlocked
) {

    const safeStamps =
        Math.max(
            0,
            Math.min(
                7,
                stamps
            )
        );


    stampCircles.forEach(
        (circle) => {

            const stampNumber =
                Number(
                    circle.dataset.stamp
                );


            // ==========================
            // NORMAL STAMPS 1-6
            // ==========================

            if (
                stampNumber >= 1 &&
                stampNumber <= 6
            ) {

                if (
                    stampNumber <=
                    safeStamps
                ) {

                    circle.classList.add(
                        "completed"
                    );

                    circle.innerHTML =
                        "⭐";

                }

                else {

                    circle.classList.remove(
                        "completed"
                    );

                    circle.innerHTML = `

                        <span>
                            ${stampNumber}
                        </span>

                    `;

                }

            }


            // ==========================
            // 7TH FREE MAGGI
            // ==========================

            if (
                stampNumber === 7
            ) {

                if (
                    safeStamps >= 7 ||
                    rewardUnlocked
                ) {

                    circle.classList.add(
                        "completed"
                    );

                    circle.innerHTML = `

                        🎁

                        <small>
                            FREE
                        </small>

                    `;

                }

                else {

                    circle.classList.remove(
                        "completed"
                    );

                    circle.innerHTML = `

                        🎁

                        <small>
                            FREE
                        </small>

                    `;

                }

            }


            // ==========================
            // 8TH HAPPY EMOJI
            // ==========================

            if (
                stampNumber === 8
            ) {

                if (
                    safeStamps >= 7 ||
                    rewardUnlocked
                ) {

                    circle.classList.add(
                        "unlocked"
                    );

                }

                else {

                    circle.classList.remove(
                        "unlocked"
                    );

                }

            }

        }
    );


    // ==================================
    // REWARD STATUS
    // ==================================

    if (
        safeStamps >= 7 ||
        rewardUnlocked
    ) {

        rewardStatus.textContent =
            "🎉 Congratulations! Your FREE Veg Maggi reward is unlocked!";

        rewardStatus.classList.add(
            "unlocked"
        );

    }

    else {

        const remaining =
            7 - safeStamps;


        rewardStatus.textContent =
            `⭐ ${remaining} more stamp${
                remaining === 1
                    ? ""
                    : "s"
            } to unlock your FREE Veg Maggi!`;

        rewardStatus.classList.remove(
            "unlocked"
        );

    }

}


// ======================================
// GENDER THEME
// ======================================

function applyGenderTheme(
    gender
) {

    if (!profileCard) {

        return;

    }


    profileCard.classList.remove(
        "boy-theme",
        "girl-theme"
    );


    if (
        gender === "female"
    ) {

        profileCard.classList.add(
            "girl-theme"
        );

    }

    else {

        profileCard.classList.add(
            "boy-theme"
        );

    }

}


// ======================================
// STARTUP
// ======================================

console.log(
    "==================================="
);

console.log(
    "RIO MAGGI POINT"
);

console.log(
    "PREMIUM PROFILE READY"
);

console.log(
    "FIREBASE PROFILE CONNECTED"
);

console.log(
    "==================================="
);
