// =====================================================
// RIO MAGGI POINT
// PROFILE.JS
// PREMIUM CUSTOMER PROFILE SYSTEM
// FINAL FIXED VERSION
// =====================================================


// =====================================================
// FIREBASE
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
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


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

let isDeleting = false;


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

function showMessage(
    message,
    type = ""
) {

    if (!profileMessage) {
        return;
    }

    profileMessage.textContent =
        String(message || "");

    profileMessage.className =
        "profile-message";

    if (type) {

        profileMessage.classList.add(
            type
        );

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
// FORMAT MEMBER DATE
// =====================================================

function formatMemberDate(
    value
) {

    if (!value) {
        return "Not Available";
    }

    try {

        let date = null;

        if (
            value &&
            typeof value.toDate ===
            "function"
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

        else if (
            typeof value === "string"
        ) {

            date =
                new Date(value);

        }

        else {

            return "Not Available";

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

function normalizeDOB(
    value
) {

    if (!value) {
        return "";
    }

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        return value;

    }

    try {

        const date =

            value &&
            typeof value.toDate ===
            "function"

                ?

                value.toDate()

                :

                new Date(value);

        if (
            !date ||
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
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );

        return (
            `${year}-${month}-${day}`
        );

    }

    catch {

        return "";

    }

}


// =====================================================
// VALIDATE DOB
// =====================================================

function isValidDOB(
    value
) {

    if (!value) {
        return true;
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        return false;

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

    if (
        date > today
    ) {

        return false;

    }

    if (
        date.getFullYear() < 1900
    ) {

        return false;

    }

    return true;

}


// =====================================================
// DISPLAY PROFILE PHOTO
// =====================================================

function displayProfilePhoto(
    photoURL
) {

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
// FIX:
// EMPTY GENDER NO LONGER BECOMES MALE
// =====================================================

function applyGenderTheme(
    gender
) {

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
        "male"
    ) {

        document.body.classList.add(
            "male-theme"
        );

    }

    else if (
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

}


// =====================================================
// UPDATE DOB LOCK UI
// =====================================================

function updateDOBLock(
    hasExistingDOB
) {

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
// GET SAFE STAMP COUNT
// =====================================================

function getSafeStampCount(
    data
) {

    let stamps =
        Number(
            data?.stamps ??
            data?.stampCount ??
            data?.validStamps ??
            0
        );

    if (
        !Number.isFinite(
            stamps
        )
    ) {

        stamps = 0;

    }

    return Math.min(
        Math.max(
            Math.floor(
                stamps
            ),
            0
        ),
        STAMP_LIMIT
    );

}


// =====================================================
// CHECK REWARD UNLOCK STATUS
//
// IMPORTANT:
// 6 stamps alone do NOT automatically mean
// the reward should be displayed as unlocked.
//
// The actual loyalty system should set
// rewardUnlocked / rewardUnlockAt.
//
// This profile only reads the authoritative
// reward status.
// =====================================================

function isRewardUnlocked(
    data
) {

    return (
        data?.rewardUnlocked === true
    );

}


// =====================================================
// CHECK REWARD REDEEMED STATUS
// =====================================================

function isRewardRedeemed(
    data
) {

    return (
        data?.rewardRedeemed === true ||
        data?.rewardClaimed === true ||
        data?.rewardStatus === "redeemed" ||
        data?.rewardStatus === "claimed"
    );

}


// =====================================================
// UPDATE LOYALTY UI
// =====================================================

function updateLoyaltyUI(
    data
) {

    const stamps =
        getSafeStampCount(
            data
        );

    if (profileStamps) {

        profileStamps.textContent =
            `${stamps} / ${STAMP_LIMIT}`;

    }

    if (!profileReward) {
        return;
    }

    const rewardUnlocked =
        isRewardUnlocked(
            data
        );

    const rewardRedeemed =
        isRewardRedeemed(
            data
        );

    if (
        rewardUnlocked &&
        !rewardRedeemed
    ) {

        profileReward.textContent =
            "FREE VEG MAGGI UNLOCKED";

        return;

    }

    if (rewardRedeemed) {

        profileReward.textContent =
            "Reward Redeemed";

        return;

    }

    const remaining =
        Math.max(
            STAMP_LIMIT - stamps,
            0
        );

    if (remaining === 0) {

        profileReward.textContent =
            "Reward Unlock Pending";

        return;

    }

    profileReward.textContent =
        `${remaining} Stamp${
            remaining === 1
                ? ""
                : "s"
        } Left`;

}


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile(
    user
) {

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
            String(
                data.name ||
                user.displayName ||
                "Customer"
            ).trim();

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

            /*
             * Email is controlled by Firebase Auth.
             * It should not be treated as a normal
             * Firestore profile field.
             */
            editEmail.readOnly =
                true;

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
                user.metadata?.creationTime ||
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

        const validGenderValues = [
            "",
            "male",
            "female",
            "other"
        ];

        const safeGender =
            validGenderValues.includes(
                gender
            )
                ? gender
                : "";

        if (editGender) {

            editGender.value =
                safeGender;

        }

        applyGenderTheme(
            safeGender
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
        // LOYALTY
        // =================================================

        updateLoyaltyUI(
            data
        );


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

                selectedPhotoDataURL =
                    null;

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

                selectedPhotoDataURL =
                    null;

                return;

            }


            // =================================================
            // PREVIEW
            // =================================================

            const reader =
                new FileReader();

            reader.onload =
                () => {

                    if (
                        typeof reader.result !==
                        "string"
                    ) {

                        selectedPhotoDataURL =
                            null;

                        showMessage(
                            "Unable to preview the selected photo.",
                            "error"
                        );

                        return;

                    }

                    selectedPhotoDataURL =
                        reader.result;

                    displayProfilePhoto(
                        selectedPhotoDataURL
                    );

                    showMessage(
                        "Photo selected. Click Save Profile to save your profile changes.",
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


            // =================================================
            // DOB LOCK
            // =================================================

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


            // =================================================
            // DOB VALIDATION
            // =================================================

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


            // =================================================
            // SAVE
            // =================================================

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
                // FIRESTORE UPDATE DATA
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
                // =================================================

                if (
                    !oldDOB &&
                    newDOB
                ) {

                    updateData.dob =
                        newDOB;

                }


                // =================================================
                // PROFILE PHOTO
                //
                // IMPORTANT:
                // The current firebase-config.js shown in
                // this conversation does not establish a
                // Firebase Storage upload API.
                //
                // Therefore this file NEVER pretends that
                // the Base64 preview was permanently saved.
                // =================================================

                const hasNewPhoto =
                    Boolean(
                        selectedPhotoDataURL
                    );


                // =================================================
                // SAVE FIRESTORE
                // =================================================

                await setDoc(
                    userRef,
                    updateData,
                    {
                        merge: true
                    }
                );


                // =================================================
                // UPDATE AUTH DISPLAY NAME
                // =================================================

                if (
                    currentUser.displayName !==
                    newName
                ) {

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

                }


                // =================================================
                // UPDATE LOCAL PROFILE
                //
                // Do NOT copy serverTimestamp()
                // into local state.
                // =================================================

                currentProfile = {

                    ...currentProfile,

                    name:
                        newName,

                    email:
                        currentUser.email ||
                        "",

                    gender:
                        newGender

                };


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

                if (profileEmail) {

                    profileEmail.textContent =
                        currentUser.email ||
                        "Email not available";

                }

                if (editEmail) {

                    editEmail.value =
                        currentUser.email ||
                        "";

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


                // =================================================
                // PHOTO PREVIEW
                // =================================================

                if (hasNewPhoto) {

                    displayProfilePhoto(
                        selectedPhotoDataURL
                    );

                }


                // =================================================
                // CLEAR PHOTO SELECTION
                // =================================================

                selectedPhotoDataURL =
                    null;

                if (photoInput) {

                    photoInput.value =
                        "";

                }


                // =================================================
                // SUCCESS MESSAGE
                // =================================================

                if (hasNewPhoto) {

                    showMessage(
                        "Profile updated. Photo preview is active for this session; permanent photo storage requires Firebase Storage upload.",
                        "success"
                    );

                }

                else {

                    showMessage(
                        "Profile updated successfully!",
                        "success"
                    );

                }

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

            if (isDeleting) {
                return;
            }

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

                isDeleting =
                    true;

                deleteAccountBtn.disabled =
                    true;

                deleteAccountBtn.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i><span>Deleting...</span>';


                // =================================================
                // IMPORTANT:
                //
                // AUTH ACCOUNT IS DELETED FIRST.
                //
                // We do NOT delete Firestore first.
                // This prevents the old problem where:
                //
                // Firestore deleted
                // +
                // Auth deletion failed
                //
                // = inconsistent account state.
                // =================================================

                await deleteUser(
                    currentUser
                );


                // =================================================
                // DELETE FIRESTORE PROFILE
                //
                // If Auth deletion succeeds but Firestore
                // deletion fails because of a temporary
                // network/rules problem, the Auth account is
                // already gone and the profile document can
                // be cleaned up separately.
                // =================================================

                try {

                    const userRef =
                        doc(
                            db,
                            "customers",
                            currentUser.uid
                        );

                    await deleteDoc(
                        userRef
                    );

                }

                catch (firestoreDeleteError) {

                    console.error(
                        "Firestore Profile Delete Warning:",
                        firestoreDeleteError
                    );

                }


                currentUser =
                    null;

                currentProfile =
                    {};

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

                isDeleting =
                    false;

                deleteAccountBtn.innerHTML =
                    '<i class="fa-solid fa-trash"></i><span>Delete Account</span>';


                // =================================================
                // RECENT LOGIN REQUIRED
                // =================================================

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
                        "Account deletion failed. Your account was not intentionally removed. Please try again.",
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
