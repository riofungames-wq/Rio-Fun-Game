// =====================================================
// RIO MAGGI POINT
// PROFILE.JS
// PREMIUM CUSTOMER PROFILE SYSTEM
// =====================================================

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut,
    deleteUser,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// DOM ELEMENTS
// =====================================================

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profilePhoto =
    document.getElementById("profilePhoto");

const defaultAvatar =
    document.getElementById("defaultAvatar");

const photoInput =
    document.getElementById("photoInput");

const editName =
    document.getElementById("editName");

const editEmail =
    document.getElementById("editEmail");

const memberId =
    document.getElementById("memberId");

const memberSince =
    document.getElementById("memberSince");

const profileStamps =
    document.getElementById("profileStamps");

const profileReward =
    document.getElementById("profileReward");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const profileMessage =
    document.getElementById("profileMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const deleteAccountBtn =
    document.getElementById("deleteAccountBtn");


// =====================================================
// VARIABLES
// =====================================================

let currentUser = null;

let currentProfile = {};

let selectedPhotoDataURL = null;


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(message, type = "") {

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent =
        message;

    profileMessage.className =
        "profile-message";

    if (type) {
        profileMessage.classList.add(type);
    }

}


// =====================================================
// REMOVE LOADING STATE
// =====================================================

function removeLoading() {

    profileName?.classList.remove(
        "profile-loading"
    );

    profileEmail?.classList.remove(
        "profile-loading"
    );

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatMemberDate(value) {

    if (!value) {
        return "Not Available";
    }

    try {

        let date;

        if (
            value &&
            typeof value.toDate === "function"
        ) {

            date = value.toDate();

        } else if (
            value instanceof Date
        ) {

            date = value;

        } else {

            date = new Date(value);

        }

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Not Available";

        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }

    catch (error) {

        console.error(
            "Member Date Format Error:",
            error
        );

        return "Not Available";

    }

}


// =====================================================
// DISPLAY PROFILE PHOTO
// =====================================================

function displayProfilePhoto(photoURL) {

    if (!photoURL) {

        if (profilePhoto) {

            profilePhoto.removeAttribute(
                "src"
            );

            profilePhoto.style.display =
                "none";

        }

        if (defaultAvatar) {

            defaultAvatar.style.display =
                "block";

        }

        return;
    }


    if (profilePhoto) {

        profilePhoto.src =
            photoURL;

        profilePhoto.style.display =
            "block";

    }


    if (defaultAvatar) {

        defaultAvatar.style.display =
            "none";

    }

}


// =====================================================
// APPLY GENDER THEME
// =====================================================

function applyGenderTheme(gender) {

    document.body.classList.remove(
        "male-theme",
        "female-theme"
    );

    if (
        String(gender || "")
            .toLowerCase()
            .trim() === "female"
    ) {

        document.body.classList.add(
            "female-theme"
        );

    } else {

        document.body.classList.add(
            "male-theme"
        );

    }

}


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile(user) {

    if (!user) {
        return;
    }

    try {

        const userRef =
            doc(
                db,
                "customers",
                user.uid
            );


        const userSnap =
            await getDoc(
                userRef
            );


        const data =
            userSnap.exists()
                ? userSnap.data()
                : {};


        currentProfile =
            data;


        // =================================================
        // NAME
        // =================================================

        const name =
            data.name ||
            user.displayName ||
            "Customer";


        if (profileName) {

            profileName.textContent =
                name;

        }


        if (editName) {

            editName.value =
                name;

        }


        // =================================================
        // EMAIL
        // =================================================

        const email =
            data.email ||
            user.email ||
            "";


        if (profileEmail) {

            profileEmail.textContent =
                email ||
                "Email not available";

        }


        if (editEmail) {

            editEmail.value =
                email;

        }


        // =================================================
        // MEMBER ID
        // =================================================

        const generatedMemberId =
            "RIO-" +
            user.uid
                .substring(0, 8)
                .toUpperCase();


        if (memberId) {

            memberId.textContent =
                data.memberId ||
                generatedMemberId;

        }


        // =================================================
        // MEMBER SINCE
        // =================================================

        if (memberSince) {

            if (data.memberSince) {

                memberSince.textContent =
                    formatMemberDate(
                        data.memberSince
                    );

            }

            else if (data.createdAt) {

                memberSince.textContent =
                    formatMemberDate(
                        data.createdAt
                    );

            }

            else {

                memberSince.textContent =
                    "Not Available";

            }

        }


        // =================================================
        // LOYALTY STAMPS
        // =================================================

        const stamps =
            Math.min(
                Math.max(
                    Number(
                        data.stamps || 0
                    ),
                    0
                ),
                6
            );


        if (profileStamps) {

            profileStamps.textContent =
                `${stamps} / 6`;

        }


        // =================================================
        // REWARD STATUS
        // =================================================

        const rewardUnlocked =
            data.rewardUnlocked === true;

        const rewardRedeemed =
            data.rewardRedeemed === true;


        if (
            stamps >= 6 &&
            rewardUnlocked &&
            !rewardRedeemed
        ) {

            profileReward.textContent =
                "FREE VEG MAGGI UNLOCKED";

        }

        else if (
            rewardRedeemed
        ) {

            profileReward.textContent =
                "Reward Redeemed";

        }

        else {

            profileReward.textContent =
                `${6 - stamps} Stamp Left`;

        }


        // =================================================
        // PROFILE PHOTO
        // =================================================

        const photoURL =
            data.photoURL ||
            user.photoURL ||
            "";


        displayProfilePhoto(
            photoURL
        );


        // =================================================
        // GENDER THEME
        // =================================================

        applyGenderTheme(
            data.gender
        );


        removeLoading();

    }

    catch (error) {

        console.error(
            "Profile Loading Error:",
            error
        );


        if (profileName) {

            profileName.textContent =
                user.displayName ||
                "Customer";

        }


        if (profileEmail) {

            profileEmail.textContent =
                user.email ||
                "Email not available";

        }


        removeLoading();


        showMessage(
            "Unable to load some profile information.",
            "error"
        );

    }

}


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            currentUser =
                null;

            window.location.replace(
                "login.html"
            );

            return;

        }


        currentUser =
            user;


        await loadProfile(
            user
        );

    }
);


// =====================================================
// PHOTO SELECTION + PREVIEW
// =====================================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        (event) => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            // IMAGE TYPE CHECK

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showMessage(
                    "Please select a valid image.",
                    "error"
                );

                photoInput.value =
                    "";

                return;

            }


            // FILE SIZE CHECK

            const maxSize =
                5 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                showMessage(
                    "Profile photo must be smaller than 5 MB.",
                    "error"
                );

                photoInput.value =
                    "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    selectedPhotoDataURL =
                        reader.result;


                    displayProfilePhoto(
                        selectedPhotoDataURL
                    );


                    showMessage(
                        "Photo selected. Click Save Profile to save your changes.",
                        "success"
                    );

                };


            reader.onerror =
                () => {

                    showMessage(
                        "Unable to preview the selected photo.",
                        "error"
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =====================================================
// SAVE PROFILE
// =====================================================

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                showMessage(
                    "Please login again.",
                    "error"
                );

                return;

            }


            const newName =
                editName?.value
                    ?.trim() || "";


            // NAME VALIDATION

            if (!newName) {

                showMessage(
                    "Please enter your name.",
                    "error"
                );

                editName?.focus();

                return;

            }


            if (
                newName.length < 2
            ) {

                showMessage(
                    "Name must contain at least 2 characters.",
                    "error"
                );

                editName?.focus();

                return;

            }


            if (
                newName.length > 50
            ) {

                showMessage(
                    "Name cannot exceed 50 characters.",
                    "error"
                );

                editName?.focus();

                return;

            }


            try {

                saveProfileBtn.disabled =
                    true;


                saveProfileBtn.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i><span>Saving...</span>';


                const userRef =
                    doc(
                        db,
                        "customers",
                        currentUser.uid
                    );


                // =================================================
                // FIRESTORE UPDATE
                // =================================================

                const updateData = {

                    name:
                        newName,

                    email:
                        currentUser.email ||
                        "",

                    updatedAt:
                        serverTimestamp()

                };


                // PHOTO IS SAVED ONLY IF NEW PHOTO SELECTED

                if (
                    selectedPhotoDataURL
                ) {

                    updateData.photoURL =
                        selectedPhotoDataURL;

                }


                await setDoc(
                    userRef,
                    updateData,
                    {
                        merge: true
                    }
                );


                // =================================================
                // FIREBASE AUTH DISPLAY NAME
                // =================================================

                try {

                    await updateProfile(
                        currentUser,
                        {
                            displayName:
                                newName
                        }
                    );

                }

                catch (authError) {

                    console.warn(
                        "Auth Profile Update Warning:",
                        authError
                    );

                }


                // =================================================
                // UPDATE LOCAL UI
                // =================================================

                profileName.textContent =
                    newName;

                editName.value =
                    newName;


                if (
                    selectedPhotoDataURL
                ) {

                    displayProfilePhoto(
                        selectedPhotoDataURL
                    );

                }


                selectedPhotoDataURL =
                    null;


                if (photoInput) {

                    photoInput.value =
                        "";

                }


                showMessage(
                    "Profile updated successfully!",
                    "success"
                );

            }

            catch (error) {

                console.error(
                    "Profile Save Error:",
                    error
                );


                showMessage(
                    "Unable to save profile. Please try again.",
                    "error"
                );

            }

            finally {

                saveProfileBtn.disabled =
                    false;


                saveProfileBtn.innerHTML =
                    '<i class="fa-solid fa-floppy-disk"></i><span>Save Profile</span>';

            }

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            try {

                logoutBtn.disabled =
                    true;


                logoutBtn.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i><span>Logging out...</span>';


                await signOut(
                    auth
                );


                window.location.replace(
                    "login.html"
                );

            }

            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                logoutBtn.disabled =
                    false;


                logoutBtn.innerHTML =
                    '<i class="fa-solid fa-right-from-bracket"></i><span>Logout</span>';


                showMessage(
                    "Logout failed. Please try again.",
                    "error"
                );

            }

        }
    );

}


// =====================================================
// DELETE ACCOUNT
// =====================================================

if (deleteAccountBtn) {

    deleteAccountBtn.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                showMessage(
                    "Please login again.",
                    "error"
                );

                return;

            }


            const confirmed =
                window.confirm(

                    "⚠️ WARNING\n\n" +

                    "Are you sure you want to permanently delete your account?\n\n" +

                    "Your Firebase Authentication account and customer profile data will be deleted.\n\n" +

                    "This action cannot be undone."

                );


            if (!confirmed) {
                return;
            }


            try {

                deleteAccountBtn.disabled =
                    true;


                deleteAccountBtn.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i><span>Deleting...</span>';


                // =================================================
                // DELETE CUSTOMER PROFILE
                // =================================================

                const userRef =
                    doc(
                        db,
                        "customers",
                        currentUser.uid
                    );


                await deleteDoc(
                    userRef
                );


                // =================================================
                // DELETE AUTH ACCOUNT
                // =================================================

                await deleteUser(
                    currentUser
                );


                window.location.replace(
                    "signup.html"
                );

            }

            catch (error) {

                console.error(
                    "Delete Account Error:",
                    error
                );


                deleteAccountBtn.disabled =
                    false;


                deleteAccountBtn.innerHTML =
                    '<i class="fa-solid fa-trash"></i><span>Delete Account</span>';


                if (
                    error.code ===
                    "auth/requires-recent-login"
                ) {

                    showMessage(
                        "For security, please login again before deleting your account.",
                        "error"
                    );

                }

                else {

                    showMessage(
                        "Account deletion failed. Please try again.",
                        "error"
                    );

                }

            }

        }
    );

}


// =====================================================
// PAGE READY
// =====================================================

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "page-loaded"
        );

    }
);


// =====================================================
// DEBUG / READY LOG
// =====================================================

console.log(
    "================================"
);

console.log(
    "RIO MAGGI POINT"
);

console.log(
    "Premium Profile Ready"
);

console.log(
    "Firebase Connected"
);

console.log(
    "Profile System Loaded"
);

console.log(
    "================================"
);
