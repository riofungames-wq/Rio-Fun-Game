// =====================================
// RIO MAGGI POINT
// PREMIUM CUSTOMER REVIEW SYSTEM
// FEEDBACK.JS - FINAL FIXED
// =====================================


// =====================================
// FIREBASE
// CENTRALIZED FIREBASE INITIALIZATION
// =====================================

import {
    auth,
    db
} from "./firebase.js";


// =====================================
// FIREBASE AUTH
// =====================================

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =====================================
// FIREBASE FIRESTORE
// =====================================

import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// DOM ELEMENTS
// =====================================

const feedbackPhoto =
    document.getElementById("feedbackPhoto");

const feedbackName =
    document.getElementById("feedbackName");

const feedbackMember =
    document.getElementById("feedbackMember");

const stars =
    document.querySelectorAll(".star");

const ratingText =
    document.getElementById("ratingText");

const emojiButtons =
    document.querySelectorAll(".emoji-btn");

const reviewText =
    document.getElementById("reviewText");

const charCount =
    document.getElementById("charCount");

const submitFeedback =
    document.getElementById("submitFeedback");

const thankYouBox =
    document.getElementById("thankYouBox");


// =====================================
// REVIEW STATE
// =====================================

let selectedRating = 0;

let selectedEmoji = "";

let currentUser = null;

let currentUserData = null;

let isSubmitting = false;


// =====================================
// CONSTANTS
// =====================================

const MAX_REVIEW_LENGTH = 300;


// =====================================
// RATING LABELS
// =====================================

const ratingLabels = {

    1: "Very Bad",

    2: "Not Good",

    3: "Average",

    4: "Very Good",

    5: "Excellent"

};


// =====================================
// LOAD CUSTOMER PROFILE
// =====================================

async function loadCustomerProfile(user) {

    if (!user) {
        return;
    }


    try {

        const userRef = doc(
            db,
            "users",
            user.uid
        );


        const userSnap = await getDoc(
            userRef
        );


        if (!userSnap.exists()) {

            console.warn(
                "Customer profile not found."
            );

            // Fallback to Firebase Auth data
            if (feedbackName) {

                feedbackName.textContent =
                    user.displayName ||
                    "Customer";

            }

            if (
                feedbackPhoto &&
                user.photoURL
            ) {

                feedbackPhoto.src =
                    user.photoURL;

            }

            return;

        }


        // =====================================
        // GET CUSTOMER DATA
        // =====================================

        const data =
            userSnap.data();


        currentUserData =
            data;


        // =====================================
        // CUSTOMER NAME
        // =====================================

        if (feedbackName) {

            feedbackName.textContent =
                data.name ||
                user.displayName ||
                "Customer";

        }


        // =====================================
        // MEMBER ID
        // =====================================

        if (feedbackMember) {

            feedbackMember.textContent =
                data.memberId ||
                "RIO-000000";

        }


        // =====================================
        // CUSTOMER PHOTO
        // =====================================

        if (
            feedbackPhoto &&
            data.photo
        ) {

            feedbackPhoto.src =
                data.photo;

        }
        else if (
            feedbackPhoto &&
            user.photoURL
        ) {

            feedbackPhoto.src =
                user.photoURL;

        }


    }

    catch (error) {

        console.error(
            "Failed to load customer profile:",
            error
        );

    }

}


// =====================================
// STAR RATING SYSTEM
// =====================================

stars.forEach(star => {

    star.addEventListener(
        "click",
        () => {

            selectedRating =
                Number(
                    star.dataset.rate
                );


            // =====================================
            // UPDATE STARS
            // =====================================

            stars.forEach(item => {

                const itemRating =
                    Number(
                        item.dataset.rate
                    );


                if (
                    itemRating <=
                    selectedRating
                ) {

                    item.classList.remove(
                        "fa-regular"
                    );

                    item.classList.add(
                        "fa-solid"
                    );

                }
                else {

                    item.classList.remove(
                        "fa-solid"
                    );

                    item.classList.add(
                        "fa-regular"
                    );

                }

            });


            // =====================================
            // UPDATE RATING LABEL
            // =====================================

            if (ratingText) {

                ratingText.textContent =
                    ratingLabels[
                        selectedRating
                    ] ||
                    "Tap A Star";

            }

        }
    );

});


// =====================================
// EMOJI SELECTION
// =====================================

emojiButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            // =====================================
            // REMOVE ACTIVE STATE
            // =====================================

            emojiButtons.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            // =====================================
            // SET ACTIVE EMOJI
            // =====================================

            button.classList.add(
                "active"
            );


            // =====================================
            // SAVE EMOJI
            // =====================================

            selectedEmoji =
                button.textContent.trim();

        }
    );

});


// =====================================
// REVIEW TEXT INPUT
// CHARACTER LIMIT + COUNTER
// =====================================

if (reviewText) {

    reviewText.addEventListener(
        "input",
        () => {

            // =====================================
            // LIMIT REVIEW TO 300 CHARACTERS
            // =====================================

            if (
                reviewText.value.length >
                MAX_REVIEW_LENGTH
            ) {

                reviewText.value =
                    reviewText.value.substring(
                        0,
                        MAX_REVIEW_LENGTH
                    );

            }


            // =====================================
            // UPDATE CHARACTER COUNT
            // =====================================

            if (charCount) {

                charCount.textContent =
                    reviewText.value.length;

            }

        }
    );

}


// =====================================
// RESET STAR RATING
// =====================================

function resetStars() {

    stars.forEach(star => {

        star.classList.remove(
            "fa-solid"
        );

        star.classList.add(
            "fa-regular"
        );

    });


    selectedRating = 0;


    if (ratingText) {

        ratingText.textContent =
            "Tap A Star";

    }

}


// =====================================
// RESET EMOJI
// =====================================

function resetEmojis() {

    emojiButtons.forEach(button => {

        button.classList.remove(
            "active"
        );

    });


    selectedEmoji = "";

}


// =====================================
// RESET REVIEW FORM
// =====================================

function resetFeedbackForm() {

    if (reviewText) {

        reviewText.value = "";

    }


    if (charCount) {

        charCount.textContent = "0";

    }


    resetStars();

    resetEmojis();

}


// =====================================
// SHOW THANK YOU MESSAGE
// =====================================

function showThankYouMessage() {

    if (!thankYouBox) {
        return;
    }


    thankYouBox.style.display =
        "block";


    // =====================================
    // AUTO HIDE AFTER 5 SECONDS
    // =====================================

    setTimeout(
        () => {

            thankYouBox.style.display =
                "none";

        },
        5000
    );

}


// =====================================
// SUBMIT FEEDBACK
// =====================================

if (submitFeedback) {

    submitFeedback.addEventListener(
        "click",
        async () => {

            // =====================================
            // PREVENT DOUBLE SUBMISSION
            // =====================================

            if (isSubmitting) {

                return;

            }


            // =====================================
            // CHECK LOGIN
            // =====================================

            if (!currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            // =====================================
            // CHECK RATING
            // =====================================

            if (
                selectedRating <
                1
            ) {

                alert(
                    "Please select a star rating."
                );

                return;

            }


            // =====================================
            // GET REVIEW TEXT
            // =====================================

            const review =
                reviewText
                    ? reviewText.value.trim()
                    : "";


            // =====================================
            // START SUBMISSION
            // =====================================

            isSubmitting = true;

            submitFeedback.disabled =
                true;


            submitFeedback.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';


            try {

                // =====================================
                // SAVE FEEDBACK
                // =====================================

                await addDoc(
                    collection(
                        db,
                        "feedback"
                    ),
                    {

                        userId:
                            currentUser.uid,

                        userName:
                            currentUserData?.name ||
                            currentUser.displayName ||
                            "Customer",

                        memberId:
                            currentUserData?.memberId ||
                            "RIO-000000",

                        rating:
                            selectedRating,

                        emoji:
                            selectedEmoji,

                        review:
                            review,

                        createdAt:
                            serverTimestamp()

                    }
                );


                // =====================================
                // SHOW SUCCESS
                // =====================================

                showThankYouMessage();


                // =====================================
                // RESET FORM
                // =====================================

                resetFeedbackForm();


                console.log(
                    "Feedback submitted successfully."
                );

            }

            catch (error) {

                console.error(
                    "Feedback submission failed:",
                    error
                );


                alert(
                    "Unable to submit feedback. Please try again."
                );

            }

            finally {

                // =====================================
                // RESTORE BUTTON
                // =====================================

                isSubmitting = false;

                submitFeedback.disabled =
                    false;

                submitFeedback.innerHTML =
                    '<i class="fa-solid fa-paper-plane"></i> Submit Feedback';

            }

        }
    );

}


// =====================================
// AUTHENTICATION
// =====================================

onAuthStateChanged(
    auth,
    async user => {

        // =====================================
        // USER NOT LOGGED IN
        // =====================================

        if (!user) {

            currentUser = null;

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

        await loadCustomerProfile(
            user
        );


        console.log(
            "Feedback page loaded for:",
            user.uid
        );

    }
);


// =====================================
// FINAL SYSTEM READY
// =====================================

console.log(
    "================================"
);

console.log(
    "RIO MAGGI POINT"
);

console.log(
    "Premium Customer Review System Ready"
);

console.log(
    "================================"
);


// =====================================
// END OF FEEDBACK.JS
// =====================================
