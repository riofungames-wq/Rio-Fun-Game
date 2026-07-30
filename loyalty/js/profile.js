// =====================================
// RIO MAGGI POINT
// PREMIUM CUSTOMER PROFILE SYSTEM
// PROFILE.JS - PART 1 OF 3
// =====================================


// =====================================
// FIREBASE IMPORTS
// =====================================

import {

    auth,

    db

} from "./firebase.js";


import {

    onAuthStateChanged,

    signOut

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

    doc,

    getDoc,

    updateDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// DOM ELEMENTS
// =====================================

const profilePhoto =

    document.getElementById(

        "profilePhoto"

    );


const profileName =

    document.getElementById(

        "profileName"

    );


const profileMemberId =

    document.getElementById(

        "profileMemberId"

    );


const profileMobile =

    document.getElementById(

        "profileMobile"

    );


const profileEmail =

    document.getElementById(

        "profileEmail"

    );


const profileDOB =

    document.getElementById(

        "profileDOB"

    );


const profileAge =

    document.getElementById(

        "profileAge"

    );


const profileCategory =

    document.getElementById(

        "profileCategory"

    );


const profileStampCount =

    document.getElementById(

        "profileStampCount"

    );


const profileReward =

    document.getElementById(

        "profileReward"

    );


const profileMemberSince =

    document.getElementById(

        "profileMemberSince"

    );


// =====================================
// EDIT PROFILE ELEMENTS
// =====================================

const editModal =

    document.getElementById(

        "editModal"

    );


const editProfileBtn =

    document.getElementById(

        "editProfileBtn"

    );


const closeEditBtn =

    document.getElementById(

        "closeEditBtn"

    );


const saveProfileBtn =

    document.getElementById(

        "saveProfileBtn"

    );


const editName =

    document.getElementById(

        "editName"

    );


const editDOB =

    document.getElementById(

        "editDOB"

    );


const editAge =

    document.getElementById(

        "editAge"

    );


const editGender =

    document.getElementById(

        "editGender"

    );


// =====================================
// LOGOUT BUTTON
// =====================================

const logoutBtn =

    document.getElementById(

        "logoutBtn"

    );


// =====================================
// CURRENT USER
// =====================================

let currentUser =

    null;


// =====================================
// DEFAULT AVATAR
// =====================================

const defaultAvatar =

    "assets/avatars/default.png";


// =====================================
// PROFILE.JS - PART 1 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM CUSTOMER PROFILE SYSTEM
// PROFILE.JS - PART 2 OF 3
// =====================================


// =====================================
// CALCULATE AGE FROM DATE OF BIRTH
// =====================================

function calculateAge(dob) {

    if (!dob) {

        return "--";

    }


    const birthDate =

        new Date(dob);


    if (isNaN(birthDate.getTime())) {

        return "--";

    }


    const today =

        new Date();


    let age =

        today.getFullYear()

        -

        birthDate.getFullYear();


    const monthDifference =

        today.getMonth()

        -

        birthDate.getMonth();


    if (

        monthDifference < 0

        ||

        (

            monthDifference === 0

            &&

            today.getDate()

            <

            birthDate.getDate()

        )

    ) {

        age--;

    }


    return age;

}


// =====================================
// FORMAT MEMBER SINCE DATE
// =====================================

function formatMemberSince(dateValue) {

    if (!dateValue) {

        return "--";

    }


    try {

        let date;


        if (

            typeof dateValue.toDate

            ===

            "function"

        ) {

            date =

                dateValue.toDate();

        }

        else {

            date =

                new Date(dateValue);

        }


        if (isNaN(date.getTime())) {

            return "--";

        }


        return date.toLocaleDateString(

            "en-IN",

            {

                day: "numeric",

                month: "numeric",

                year: "numeric"

            }

        );

    }

    catch (error) {

        console.error(

            "Member date format error:",

            error

        );


        return "--";

    }

}


// =====================================
// LOAD CUSTOMER PROFILE
// =====================================

async function loadProfileData(user) {


    if (!user) {

        return;

    }


    try {


        // =====================================
        // FIRESTORE CUSTOMER DOCUMENT
        // =====================================

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


        if (!userSnap.exists()) {

            console.warn(

                "Customer profile not found."

            );

            return;

        }


        const data =

            userSnap.data();


        // =====================================
        // CUSTOMER NAME
        // =====================================

        const customerName =

            data.name

            ||

            data.fullName

            ||

            user.displayName

            ||

            "Customer";


        profileName.textContent =

            customerName;


        // =====================================
        // MEMBER ID
        // =====================================

        profileMemberId.textContent =

            data.memberId

            ||

            "RIO-" + user.uid.slice(

                0,

                10

            ).toUpperCase();


        // =====================================
        // MOBILE NUMBER
        // =====================================

        profileMobile.textContent =

            data.phone

            ||

            data.mobile

            ||

            user.phoneNumber

            ||

            "--";


        // =====================================
        // EMAIL
        // =====================================

        profileEmail.textContent =

            data.email

            ||

            user.email

            ||

            "--";


        // =====================================
        // DATE OF BIRTH
        // =====================================

        const dob =

            data.dob

            ||

            data.dateOfBirth

            ||

            "";


        profileDOB.textContent =

            dob

            ||

            "--";


        // =====================================
        // AGE
        // =====================================

        const calculatedAge =

            dob

            ?

            calculateAge(dob)

            :

            (

                data.age

                ||

                "--"

            );


        profileAge.textContent =

            calculatedAge;


        // =====================================
        // CATEGORY / GENDER
        // =====================================

        profileCategory.textContent =

            (

                data.gender

                ||

                data.category

                ||

                "--"

            ).toString().toUpperCase();


        // =====================================
        // CUSTOMER PHOTO
        // =====================================

        if (data.photoURL) {

            profilePhoto.src =

                data.photoURL;

        }

        else if (data.photo) {

            profilePhoto.src =

                data.photo;

        }

        else {

            profilePhoto.src =

                defaultAvatar;

        }


        // =====================================
        // CURRENT STAMPS
        // =====================================

        const currentStamps =

            Number(

                data.stamps

                ||

                data.currentStamps

                ||

                0

            );


        profileStampCount.textContent =

            Math.min(

                currentStamps,

                6

            )

            +

            " / 6";


        // =====================================
        // REWARD STATUS
        // =====================================

        if (currentStamps >= 6) {

            profileReward.textContent =

                "FREE VEG MAGGI UNLOCKED";

        }

        else {

            const remaining =

                6

                -

                currentStamps;


            profileReward.textContent =

                "Collect "

                +

                remaining

                +

                " More Stamp(s)";

        }


        // =====================================
        // MEMBER SINCE
        // =====================================

        profileMemberSince.textContent =

            formatMemberSince(

                data.createdAt

                ||

                data.memberSince

            );


        console.log(

            "Profile loaded successfully:",

            user.uid

        );


    }

    catch (error) {

        console.error(

            "Failed to load profile:",

            error

        );

    }

}


// =====================================
// PROFILE.JS - PART 2 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM CUSTOMER PROFILE SYSTEM
// PROFILE.JS - PART 3 OF 3
// FINAL PART
// =====================================


// =====================================
// OPEN EDIT PROFILE MODAL
// =====================================

editProfileBtn.addEventListener(

    "click",

    () => {


        // =====================================
        // OPEN MODAL
        // =====================================

        editModal.style.display =

            "flex";


        // =====================================
        // LOAD CURRENT NAME
        // =====================================

        editName.value =

            profileName.textContent

            !==

            "Loading..."

            ?

            profileName.textContent

            :

            "";


        // =====================================
        // LOAD CURRENT DOB
        // =====================================

        if (

            currentUser

            &&

            currentUser.profileData

        ) {

            editDOB.value =

                currentUser.profileData.dob

                ||

                "";

        }


        // =====================================
        // LOAD CURRENT AGE
        // =====================================

        editAge.value =

            profileAge.textContent

            !==

            "--"

            ?

            profileAge.textContent

            :

            "";


        // =====================================
        // LOAD CURRENT GENDER
        // =====================================

        if (

            currentUser

            &&

            currentUser.profileData

        ) {

            editGender.value =

                currentUser.profileData.gender

                ||

                "";

        }

    }

);


// =====================================
// CLOSE EDIT PROFILE MODAL
// =====================================

closeEditBtn.addEventListener(

    "click",

    () => {

        editModal.style.display =

            "none";

    }

);


// =====================================
// SAVE PROFILE
// =====================================

saveProfileBtn.addEventListener(

    "click",

    async () => {


        if (!currentUser) {

            alert(

                "Please login first."

            );

            return;

        }


        // =====================================
        // GET UPDATED VALUES
        // =====================================

        const updatedName =

            editName.value.trim();


        const updatedDOB =

            editDOB.value;


        const updatedAge =

            editAge.value;


        const updatedGender =

            editGender.value;


        // =====================================
        // VALIDATE NAME
        // =====================================

        if (!updatedName) {

            alert(

                "Please enter your name."

            );

            return;

        }


        // =====================================
        // SAVE TO FIRESTORE
        // =====================================

        try {


            saveProfileBtn.disabled =

                true;


            saveProfileBtn.innerHTML =

                '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';


            const userRef =

                doc(

                    db,

                    "customers",

                    currentUser.uid

                );


            await updateDoc(

                userRef,

                {

                    name:

                        updatedName,

                    fullName:

                        updatedName,

                    dob:

                        updatedDOB,

                    age:

                        updatedAge

                        ?

                        Number(

                            updatedAge

                        )

                        :

                        null,

                    gender:

                        updatedGender

                }

            );


            // =====================================
            // UPDATE SCREEN
            // =====================================

            profileName.textContent =

                updatedName;


            profileDOB.textContent =

                updatedDOB

                ||

                "--";


            profileAge.textContent =

                updatedDOB

                ?

                calculateAge(

                    updatedDOB

                )

                :

                (

                    updatedAge

                    ||

                    "--"

                );


            profileCategory.textContent =

                (

                    updatedGender

                    ||

                    "--"

                ).toUpperCase();


            // =====================================
            // SAVE LOCAL PROFILE DATA
            // =====================================

            currentUser.profileData = {

                name:

                    updatedName,

                dob:

                    updatedDOB,

                age:

                    updatedAge,

                gender:

                    updatedGender

            };


            // =====================================
            // CLOSE MODAL
            // =====================================

            editModal.style.display =

                "none";


            alert(

                "Profile updated successfully!"

            );


            console.log(

                "Profile updated successfully."

            );


        }

        catch (error) {


            console.error(

                "Profile update failed:",

                error

            );


            alert(

                "Unable to update profile. Please try again."

            );


        }

        finally {


            saveProfileBtn.disabled =

                false;


            saveProfileBtn.innerHTML =

                '<i class="fa-solid fa-check"></i> Save';


        }

    }

);


// =====================================
// LOGOUT
// =====================================

logoutBtn.addEventListener(

    "click",

    async () => {


        const confirmLogout =

            confirm(

                "Are you sure you want to logout?"

            );


        if (!confirmLogout) {

            return;

        }


        try {


            await signOut(

                auth

            );


            window.location.href =

                "login.html";


        }

        catch (error) {


            console.error(

                "Logout failed:",

                error

            );


            alert(

                "Logout failed. Please try again."

            );

        }

    }

);


// =====================================
// AUTHENTICATION STATE
// =====================================

onAuthStateChanged(

    auth,

    async (user) => {


        // =====================================
        // USER NOT LOGGED IN
        // =====================================

        if (!user) {

            console.warn(

                "No logged-in user found."

            );


            window.location.href =

                "login.html";


            return;

        }


        // =====================================
        // SAVE CURRENT USER
        // =====================================

        currentUser =

            user;


        // =====================================
        // LOAD PROFILE
        // =====================================

        await loadProfileData(

            user

        );


        // =====================================
        // STORE PROFILE DATA
        // =====================================

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


            if (

                userSnap.exists()

            ) {

                currentUser.profileData =

                    userSnap.data();

            }

        }

        catch (error) {


            console.error(

                "Profile cache error:",

                error

            );

        }


        // =====================================
        // PROFILE READY
        // =====================================

        console.log(

            "================================"

        );


        console.log(

            "🍜 Rio Maggi Point"

        );


        console.log(

            "Premium Customer Profile Loaded"

        );


        console.log(

            "Customer UID:",

            user.uid

        );


        console.log(

            "================================"

        );

    }

);


// =====================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================

window.addEventListener(

    "click",

    (event) => {


        if (

            event.target

            ===

            editModal

        ) {

            editModal.style.display =

                "none";

        }

    }

);


// =====================================
// PROFILE.JS READY
// =====================================

console.log(

    "Rio Maggi Point Premium Profile System Ready"

);


// =====================================
// END OF PROFILE.JS
// =====================================
