// =====================================
// RIO MAGGI POINT
// PREMIUM CUSTOMER REVIEW SYSTEM
// FEEDBACK.JS - PART 1
// =====================================


// =====================================
// FIREBASE IMPORTS
// =====================================

import {

    auth,

    db

} from "./firebase-config.js";


import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


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

    document.getElementById(

        "feedbackPhoto"

    );


const feedbackName =

    document.getElementById(

        "feedbackName"

    );


const feedbackMember =

    document.getElementById(

        "feedbackMember"

    );


const stars =

    document.querySelectorAll(

        ".star"

    );


const ratingText =

    document.getElementById(

        "ratingText"

    );


const emojiButtons =

    document.querySelectorAll(

        ".emoji-btn"

    );


const reviewText =

    document.getElementById(

        "reviewText"

    );


const charCount =

    document.getElementById(

        "charCount"

    );


const submitFeedback =

    document.getElementById(

        "submitFeedback"

    );


const thankYouBox =

    document.getElementById(

        "thankYouBox"

    );


// =====================================
// REVIEW STATE
// =====================================

let selectedRating =

    0;


let selectedEmoji =

    "";


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
// CURRENT USER
// =====================================

let currentUser =

    null;


// =====================================
// LOAD CUSTOMER PROFILE
// =====================================

async function loadCustomerProfile(

    user

) {


    try {


        const userRef =

            doc(

                db,

                "users",

                user.uid

            );


        const userSnap =

            await getDoc(

                userRef

            );


        if (

            !userSnap.exists()

        ) {


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

        if (feedbackName) {

            feedbackName.textContent =

                data.name ||

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


    }

    catch (error) {


        console.error(

            "Failed to load customer profile:",

            error

        );


    }


}


// =====================================
// AUTHENTICATION
// =====================================

onAuthStateChanged(

    auth,

    async (user) => {


        if (!user) {


            console.warn(

                "No logged-in user found."

            );


            window.location.href =

                "login.html";


            return;

        }


        currentUser =

            user;


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
// FEEDBACK.JS - PART 1 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM CUSTOMER REVIEW SYSTEM
// FEEDBACK.JS - PART 2
// =====================================


// =====================================
// STAR RATING SYSTEM
// =====================================

stars.forEach(

    star => {


        star.addEventListener(

            "click",

            () => {


                // =====================================
                // GET SELECTED RATING
                // =====================================

                selectedRating =

                    Number(

                        star.dataset.rate

                    );


                // =====================================
                // UPDATE ALL STARS
                // =====================================

                stars.forEach(

                    item => {


                        const itemRating =

                            Number(

                                item.dataset.rate

                            );


                        // =====================================
                        // FILLED STAR
                        // =====================================

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


                        // =====================================
                        // EMPTY STAR
                        // =====================================

                        else {


                            item.classList.remove(

                                "fa-solid"

                            );


                            item.classList.add(

                                "fa-regular"

                            );


                        }


                    }

                );


                // =====================================
                // UPDATE RATING TEXT
                // =====================================

                if (ratingText) {


                    ratingText.textContent =

                        ratingLabels[

                            selectedRating

                        ] || "Tap A Star";


                }


            }

        );


    }

);


// =====================================
// EMOJI SELECTION
// =====================================

emojiButtons.forEach(

    button => {


        button.addEventListener(

            "click",

            () => {


                // =====================================
                // REMOVE ACTIVE FROM ALL
                // =====================================

                emojiButtons.forEach(

                    item => {


                        item.classList.remove(

                            "active"

                        );


                    }

                );


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


    }

);


// =====================================
// CHARACTER COUNTER
// =====================================

if (reviewText) {


    reviewText.addEventListener(

        "input",

        () => {


            const currentLength =

                reviewText.value.length;


            if (charCount) {


                charCount.textContent =

                    currentLength;


            }


        }

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

                selectedRating < 1

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
            // DISABLE BUTTON
            // =====================================

            submitFeedback.disabled =

                true;


            submitFeedback.innerHTML =

                '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';


            try {


                // =====================================
                // SAVE FEEDBACK TO FIRESTORE
                // =====================================

                await addDoc(

                    collection(

                        db,

                        "feedback"

                    ),

                    {

                        userId:

                            currentUser.uid,

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
                // SHOW SUCCESS MESSAGE
                // =====================================

                if (thankYouBox) {


                    thankYouBox.style.display =

                        "block";


                }


                // =====================================
                // RESET FORM
                // =====================================

                if (reviewText) {


                    reviewText.value =

                        "";


                }


                if (charCount) {


                    charCount.textContent =

                        "0";


                }


                selectedRating =

                    0;


                selectedEmoji =

                    "";


                // =====================================
                // RESET STARS
                // =====================================

                stars.forEach(

                    star => {


                        star.classList.remove(

                            "fa-solid"

                        );


                        star.classList.add(

                            "fa-regular"

                        );


                    }

                );


                // =====================================
                // RESET EMOJI
                // =====================================

                emojiButtons.forEach(

                    button => {


                        button.classList.remove(

                            "active"

                        );


                    }

                );


                if (ratingText) {


                    ratingText.textContent =

                        "Tap A Star";


                }


                // =====================================
                // SUCCESS LOG
                // =====================================

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

                submitFeedback.disabled =

                    false;


                submitFeedback.innerHTML =

                    '<i class="fa-solid fa-paper-plane"></i> Submit Feedback';


            }


        }

    );


}


// =====================================
// FEEDBACK.JS - PART 2 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM CUSTOMER REVIEW SYSTEM
// FEEDBACK.JS - PART 3 OF 3
// FINAL PART
// =====================================


// =====================================
// THANK YOU MESSAGE AUTO HIDE
// =====================================

if (thankYouBox) {


    const observer =

        new MutationObserver(

            () => {


                if (

                    thankYouBox.style.display ===

                    "block"

                ) {


                    setTimeout(

                        () => {


                            thankYouBox.style.display =

                                "none";


                        },

                        5000

                    );


                }


            }

        );


    observer.observe(

        thankYouBox,

        {

            attributes: true,

            attributeFilter: [

                "style"

            ]

        }

    );


}


// =====================================
// REVIEW TEXT VALIDATION
// =====================================

if (reviewText) {


    reviewText.addEventListener(

        "input",

        () => {


            // =====================================
            // REMOVE EXCESS SPACES
            // =====================================

            if (

                reviewText.value.length >

                300

            ) {


                reviewText.value =

                    reviewText.value.substring(

                        0,

                        300

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
// PREVENT DOUBLE SUBMISSION
// =====================================

let isSubmitting =

    false;


if (submitFeedback) {


    submitFeedback.addEventListener(

        "click",

        () => {


            if (isSubmitting) {


                console.warn(

                    "Feedback submission already in progress."

                );


                return;

            }


            isSubmitting =

                true;


            setTimeout(

                () => {


                    isSubmitting =

                        false;


                },

                3000

            );


        }

    );


}


// =====================================
// FINAL FEEDBACK SYSTEM READY
// =====================================

console.log(

    "================================"

);


console.log(

    "🍜 Rio Maggi Point"

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
