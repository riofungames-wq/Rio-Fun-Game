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

const editGender =
    document.getElementById("editGender");

const editDOB =
    document.getElementById("editDOB");

const dobHelp =
    document.getElementById("dobHelp");

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

let isSaving = false;


// =====================================================
// CONSTANTS
// =====================================================

const STAMP_LIMIT = 6;

const MAX_NAME_LENGTH = 50;

const MAX_PHOTO_SIZE =
    5 * 1024 * 1024;


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(message, type = "") {

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent =
        String(message || "");

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

        let date = null;


        if (
            value &&
            typeof value.toDate === "function"
        ) {

            date =
                value.toDate();

        }

        else if (
            value instanceof Date
        ) {

            date =
                value;

        }

        else if (
            typeof value === "number"
        ) {

            date =
                new Date(value);

        }

        else {

            date =
                new Date(value);

        }


        if (
            !date ||
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
// NORMALIZE DOB
// =====================================================

function normalizeDOB(value) {

    if (!value) {
        return "";
    }


    // Already YYYY-MM-DD

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        return value;

    }


    try {

        const date =
            value &&
            typeof value.toDate === "function"
                ? value.toDate()
                : new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    }

    catch {

        return "";

    }

}


// =====================================================
// VALIDATE DOB
// =====================================================

function isValidDOB(value) {

    if (!value) {
        return true;
    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    if (date > today) {
        return false;
    }


    // Prevent obviously invalid old dates.

    const minimumYear =
        1900;


    if (
        date.getFullYear() <
        minimumYear
    ) {

        return false;

    }


    return true;

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
                "flex";

        }

        return;

    }


    if (profilePhoto) {

        profilePhoto.src =
            photoURL;

        profilePhoto.style.display =
            "block";


        profilePhoto.onerror =
            () => {

                profilePhoto.style.display =
                    "none";

                if (defaultAvatar) {

                    defaultAvatar.style.display =
                        "flex";

                }

            };

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
        "female-theme",
        "other-theme"
    );


    const normalizedGender =
        String(
            gender || ""
        )
            .toLowerCase()
            .trim();


    if (
        normalizedGender ===
        "female"
    ) {

        document.body.classList.add(
            "female-theme"
        );

    }

    else if (
        normalizedGender ===
        "other"
    ) {

        document.body.classList.add(
            "other-theme"
        );

    }

    else {

        document.body.classList.add(
            "male-theme"
        );

    }

}


// =====================================================
// UPDATE DOB LOCK UI
// =====================================================

function updateDOBLock(hasExistingDOB) {

    if (!editDOB) {
        return;
    }


    if (hasExistingDOB) {

        editDOB.disabled =
            true;


        editDOB.title =
            "Date of birth is locked. Admin approval is required to change it.";


        if (dobHelp) {

            dobHelp.textContent =
                "Date of birth is locked after first save. Changes require admin approval.";

        }

    }

    else {

        editDOB.disabled =
            false;


        editDOB.removeAttribute(
            "title"
        );


        if (dobHelp) {

            dobHelp.textContent =
                "Date of birth can be set once. Changes later require admin approval.";

        }

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
            data || {};


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
            String(
                user.uid || ""
            )
                .substring(
                    0,
                    8
                )
                .toUpperCase();


        const finalMemberId =
            data.memberId ||
            generatedMemberId;


        if (memberId) {

            memberId.textContent =
                finalMemberId;

        }


        // =================================================
        // MEMBER SINCE
        // =================================================

        if (memberSince) {

            const memberDate =
                data.memberSince ||
                data.createdAt ||
                null;


            memberSince.textContent =
                memberDate
                    ? formatMemberDate(
                        memberDate
                    )
                    : "Not Available";

        }


        // =================================================
        // GENDER
        // =================================================

        const gender =
            String(
                data.gender || ""
            )
                .toLowerCase()
                .trim();


        if (editGender) {

            const validGenderValues = [
                "",
                "male",
                "female",
                "other"
            ];


            editGender.value =
                validGenderValues.includes(
                    gender
                )
                    ? gender
                    : "";

        }


        applyGenderTheme(
            gender
        );


        // =================================================
        // DOB
        // =================================================

        const existingDOB =
            normalizeDOB(
                data.dob
            );


        if (editDOB) {

            editDOB.value =
                existingDOB;

        }


        updateDOBLock(
            Boolean(
                existingDOB
            )
        );


        // =================================================
        // LOYALTY STAMPS
        // =================================================

        let stamps =
            Number(
                data.stamps ?? 0
            );


        if (
            !Number.isFinite(
                stamps
            )
        ) {

            stamps = 0;

        }


        stamps =
            Math.min(
                Math.max(
                    Math.floor(
                        stamps
                    ),
                    0
                ),
                STAMP_LIMIT
            );


        if (profileStamps) {

            profileStamps.textContent =
                `${stamps} / ${STAMP_LIMIT}`;

        }


        // =================================================
        // REWARD STATUS
        // =================================================

        const rewardUnlocked =
            data.rewardUnlocked === true;

        const rewardRedeemed =
            data.rewardRedeemed === true;


        if (
            stamps >= STAMP_LIMIT &&
            rewardUnlocked &&
            !rewardRedeemed
        ) {

            if (profileReward) {

                profileReward.textContent =
                    "FREE VEG MAGGI UNLOCKED";

            }

        }

        else if (
            rewardRedeemed
        ) {

            if (profileReward) {

                profileReward.textContent =
                    "Reward Redeemed";

            }

        }

        else {

            const remaining =
                Math.max(
                    STAMP_LIMIT - stamps,
                    0
                );


            if (profileReward) {

                profileReward.textContent =
                    `${remaining} Stamp${remaining === 1 ? "" : "s"} Left`;

            }

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
        // REMOVE LOADING
        // =================================================

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


            // =================================================
            // IMAGE TYPE CHECK
            // =================================================

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showMessage(
                    "Please select a JPG, PNG, WEBP or GIF image.",
                    "error"
                );


                photoInput.value =
                    "";


                return;

            }


            // =================================================
            // FILE SIZE CHECK
            // =================================================

            if (
                file.size >
                MAX_PHOTO_SIZE
            ) {

                showMessage(
                    "Profile photo must be smaller than 5 MB.",
                    "error"
                );


                photoInput.value =
                    "";


                return;

            }


            // =================================================
            // PREVIEW
            // =================================================

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

                    selectedPhotoDataURL =
                        null;


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

            if (isSaving) {
                return;
            }


            if (!currentUser) {

                showMessage(
                    "Please login again.",
                    "error"
                );


                return;

            }


            // =================================================
            // NAME
            // =================================================

            const newName =
                editName?.value
                    ?.trim() || "";


            if (!newName) {

                showMessage(
                    "Please enter your name.",
                    "error"
                );


                editName?.focus();


                return;

            }


            if (
                newName.length <
                2
            ) {

                showMessage(
                    "Name must contain at least 2 characters.",
                    "error"
                );


                editName?.focus();


                return;

            }


            if (
                newName.length >
                MAX_NAME_LENGTH
            ) {

                showMessage(
                    "Name cannot exceed 50 characters.",
                    "error"
                );


                editName?.focus();


                return;

            }


            // =================================================
            // GENDER
            // =================================================

            const newGender =
                String(
                    editGender?.value ||
                    ""
                )
                    .toLowerCase()
                    .trim();


            const validGenderValues = [
                "",
                "male",
                "female",
                "other"
            ];


            if (
                !validGenderValues.includes(
                    newGender
                )
            ) {

                showMessage(
                    "Please select a valid gender.",
                    "error"
                );


                editGender?.focus();


                return;

            }


            // =================================================
            // DOB
            // =================================================

            const newDOB =
                normalizeDOB(
                    editDOB?.value ||
                    ""
                );


            const oldDOB =
                normalizeDOB(
                    currentProfile.dob
                );


            // DOB is locked once already saved.

            if (
                oldDOB &&
                newDOB !== oldDOB
            ) {

                if (editDOB) {

                    editDOB.value =
                        oldDOB;

                }


                showMessage(
                    "Date of birth is locked. Changes require admin approval.",
                    "error"
                );


                return;

            }


            if (
                !oldDOB &&
                newDOB &&
                !isValidDOB(
                    newDOB
                )
            ) {

                showMessage(
                    "Please enter a valid date of birth.",
                    "error"
                );


                editDOB?.focus();


                return;

            }


            try {

                isSaving =
                    true;


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

                    gender:
                        newGender,

                    updatedAt:
                        serverTimestamp()

                };


                // =================================================
                // DOB
                //
                // Only write DOB when it has never been set.
                // =================================================

                if (
                    !oldDOB &&
                    newDOB
                ) {

                    updateData.dob =
                        newDOB;

                }


                // =================================================
                // PHOTO
                //
                // Preserves existing architecture.
                // =================================================

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
                // UPDATE LOCAL PROFILE
                // =================================================

                currentProfile = {
                    ...currentProfile,
                    ...updateData
                };


                currentProfile.name =
                    newName;

                currentProfile.gender =
                    newGender;


                if (
                    !oldDOB &&
                    newDOB
                ) {

                    currentProfile.dob =
                        newDOB;

                }


                // =================================================
                // UPDATE UI
                // =================================================

                if (profileName) {

                    profileName.textContent =
                        newName;

                }


                if (editName) {

                    editName.value =
                        newName;

                }


                if (editGender) {

                    editGender.value =
                        newGender;

                }


                if (newDOB) {

                    updateDOBLock(
                        true
                    );

                }


                applyGenderTheme(
                    newGender
                );


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

                isSaving =
                    false;


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

            if (
                logoutBtn.disabled
            ) {

                return;

            }


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
