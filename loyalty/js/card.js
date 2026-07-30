// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 1 OF 3
// =====================================


// =====================================
// FIREBASE IMPORT
// =====================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================
// BUSINESS CONTACT DETAILS
// =====================================

// Rio Maggi Point Phone Number
const SHOP_PHONE = "7987827979";

// WhatsApp Number
// India country code +91
const SHOP_WHATSAPP = "917987827979";


// =====================================
// HTML ELEMENTS
// =====================================

const customerName =
    document.getElementById("customerName");

const memberId =
    document.getElementById("memberId");

const customerPhoto =
    document.getElementById("customerPhoto");

const countdownDays =
    document.getElementById("countdownDays");

const rewardCircle =
    document.getElementById("rewardCircle");

const gameLink =
    document.getElementById("gameLink");

const callBtn =
    document.getElementById("callBtn");

const whatsappBtn =
    document.getElementById("whatsappBtn");

const mapBtn =
    document.getElementById("mapBtn");

const deliveryBtn =
    document.getElementById("deliveryBtn");


// =====================================
// STAMP ELEMENTS
// =====================================

const stampIds = [

    "stamp1",
    "stamp2",
    "stamp3",
    "stamp4",
    "stamp5",
    "stamp6"

];


// =====================================
// STAMP DATE ELEMENTS
// =====================================

const stampDateIds = [

    "stampDate1",
    "stampDate2",
    "stampDate3",
    "stampDate4",
    "stampDate5",
    "stampDate6"

];


// =====================================
// DEFAULT CUSTOMER DATA
// =====================================

function setDefaultData() {

    // Default customer name
    if (customerName) {

        customerName.textContent =
            "Customer";

    }


    // Default member ID
    if (memberId) {

        memberId.textContent =
            "RIO-000000";

    }


    // Default avatar
    if (customerPhoto) {

        customerPhoto.src =
            "assets/avatars/male.png";

    }

}


// =====================================
// AVATAR SYSTEM
// =====================================

function getAvatar(data) {

    // ---------------------------------
    // 1. CUSTOMER PHOTO
    // ---------------------------------

    if (data.photoURL) {

        return data.photoURL;

    }


    // ---------------------------------
    // 2. SAVED AVATAR
    // ---------------------------------

    if (data.avatar) {

        return data.avatar;

    }


    // ---------------------------------
    // 3. GENDER BASED AVATAR
    // ---------------------------------

    if (data.gender) {

        const gender =
            String(data.gender)
                .toLowerCase()
                .trim();


        // Female avatar
        if (

            gender === "female" ||
            gender === "girl" ||
            gender === "woman"

        ) {

            return "assets/avatars/female.png";

        }


        // Male avatar
        if (

            gender === "male" ||
            gender === "boy" ||
            gender === "man"

        ) {

            return "assets/avatars/male.png";

        }

    }


    // ---------------------------------
    // 4. FINAL DEFAULT
    // ---------------------------------

    return "assets/avatars/male.png";

}


// =====================================
// LOAD CUSTOMER DATA
// =====================================

async function loadCustomerData(user) {

    try {

        // Customer document reference
        const customerRef =

            doc(

                db,

                "customers",

                user.uid

            );


        // Get customer document
        const customerSnap =

            await getDoc(
                customerRef
            );


        // ---------------------------------
        // CUSTOMER DOCUMENT NOT FOUND
        // ---------------------------------

        if (
            !customerSnap.exists()
        ) {

            console.warn(
                "Customer document not found."
            );

            setDefaultData();

            return;

        }


        // Get Firestore data
        const data =
            customerSnap.data();


        // ---------------------------------
        // CUSTOMER NAME
        // ---------------------------------

        if (customerName) {

            customerName.textContent =

                data.name ||
                "Customer";

        }


        // ---------------------------------
        // MEMBER ID
        // ---------------------------------

        if (memberId) {

            memberId.textContent =

                data.memberId ||
                "RIO-000000";

        }


        // ---------------------------------
        // CUSTOMER PHOTO
        // ---------------------------------

        if (customerPhoto) {

            customerPhoto.src =
                getAvatar(data);

        }


        console.log(
            "Customer Data Loaded Successfully",
            data
        );

    }

    catch (error) {

        console.error(
            "Customer Data Load Error:",
            error
        );

        setDefaultData();

    }

}


// =====================================
// STAMP DISPLAY
// =====================================

function updateStampDisplay(
    stampCount
) {

    // Make sure stamp count
    // stays between 0 and 6

    const safeStampCount =

        Math.max(

            0,

            Math.min(

                6,

                Number(stampCount) || 0

            )

        );


    // ---------------------------------
    // UPDATE SIX STAMP CIRCLES
    // ---------------------------------

    stampIds.forEach(

        (id, index) => {

            const stamp =

                document.getElementById(
                    id
                );


            // Stamp element not found
            if (!stamp) {

                return;

            }


            // Stamp collected
            if (
                index < safeStampCount
            ) {

                stamp.classList.add(
                    "active"
                );

            }

            // Stamp not collected
            else {

                stamp.classList.remove(
                    "active"
                );

            }

        }

    );

}


// =====================================
// FORMAT STAMP DATE
// =====================================

function formatStampDate(
    dateValue
) {

    try {

        let date;


        // ---------------------------------
        // FIREBASE TIMESTAMP
        // ---------------------------------

        if (

            dateValue &&

            typeof dateValue.toDate ===
            "function"

        ) {

            date =
                dateValue.toDate();

        }


        // ---------------------------------
        // JAVASCRIPT DATE
        // ---------------------------------

        else if (

            dateValue instanceof Date

        ) {

            date =
                dateValue;

        }


        // ---------------------------------
        // STRING / NUMBER DATE
        // ---------------------------------

        else {

            date =
                new Date(
                    dateValue
                );

        }


        // Invalid date
        if (

            !date ||

            Number.isNaN(
                date.getTime()
            )

        ) {

            return "--";

        }


        // ---------------------------------
        // DISPLAY FORMAT
        // Example:
        // 30 Jul 2026
        // ---------------------------------

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
            "Stamp Date Format Error:",
            error
        );

        return "--";

    }

}


// =====================================
// STAMP DATE DISPLAY
// =====================================

function updateStampDates(
    stampDates
) {

    stampDateIds.forEach(

        (id, index) => {

            const dateElement =

                document.getElementById(
                    id
                );


            // Date element not found
            if (!dateElement) {

                return;

            }


            // ---------------------------------
            // STAMP DATE EXISTS
            // ---------------------------------

            if (

                Array.isArray(
                    stampDates
                ) &&

                stampDates[index]

            ) {

                dateElement.textContent =

                    formatStampDate(

                        stampDates[index]

                    );

            }


            // ---------------------------------
            // NO STAMP DATE
            // ---------------------------------

            else {

                dateElement.textContent =
                    "--";

            }

        }

    );

}


// =====================================
// REWARD DISPLAY
// =====================================

function updateRewardDisplay(
    stampCount
) {

    if (!rewardCircle) {

        return;

    }


    // ---------------------------------
    // KEEP REWARD TEXT
    // ---------------------------------

    rewardCircle.innerHTML = `

        <div class="reward-label">

            FREE
            <br>

            VEG
            <br>

            MAGGI

        </div>

    `;


    // ---------------------------------
    // 6 STAMPS = REWARD UNLOCKED
    // ---------------------------------

    if (

        Number(stampCount) >= 6

    ) {

        rewardCircle.classList.add(
            "active"
        );

    }


    // ---------------------------------
    // LESS THAN 6 = LOCKED
    // ---------------------------------

    else {

        rewardCircle.classList.remove(
            "active"
        );

    }

}


// =====================================
// LOAD STAMP DATA
// =====================================

async function loadStampData(
    user
) {

    try {

        // Customer document
        const customerRef =

            doc(

                db,

                "customers",

                user.uid

            );


        // Get document
        const customerSnap =

            await getDoc(
                customerRef
            );


        // ---------------------------------
        // CUSTOMER NOT FOUND
        // ---------------------------------

        if (

            !customerSnap.exists()

        ) {

            updateStampDisplay(0);

            updateStampDates([]);

            updateRewardDisplay(0);

            return;

        }


        // Get data
        const data =
            customerSnap.data();


        // ---------------------------------
        // CURRENT STAMP COUNT
        // ---------------------------------

        const stampCount =

            Number(
                data.stamps || 0
            );


        // ---------------------------------
        // STAMP DATES
        // ---------------------------------

        const stampDates =

            Array.isArray(
                data.stampDates
            )

                ? data.stampDates

                : [];


        // ---------------------------------
        // UPDATE STAMP CIRCLES
        // ---------------------------------

        updateStampDisplay(
            stampCount
        );


        // ---------------------------------
        // UPDATE STAMP DATES
        // ---------------------------------

        updateStampDates(
            stampDates
        );


        // ---------------------------------
        // UPDATE REWARD
        // ---------------------------------

        updateRewardDisplay(
            stampCount
        );


        console.log(
            "Stamp Data Loaded:",
            {

                stampCount:
                    stampCount,

                stampDates:
                    stampDates

            }
        );

    }

    catch (error) {

        console.error(
            "Stamp Data Load Error:",
            error
        );

    }

}


// =====================================
// FREE GAME BUTTON
// =====================================

if (gameLink) {

    gameLink.addEventListener(

        "click",

        () => {

            // Open Rio Fun Game
            window.location.href =

                "https://riofungames-wq.github.io/Rio-Fun-Game/";

        }

    );

}


// =====================================
// CALL BUTTON
// =====================================

if (callBtn) {

    callBtn.addEventListener(

        "click",

        () => {

            // Direct phone call
            window.location.href =

                `tel:${SHOP_PHONE}`;

        }

    );

}


// =====================================
// WHATSAPP BUTTON
// =====================================

if (whatsappBtn) {

    whatsappBtn.addEventListener(

        "click",

        () => {

            // Direct WhatsApp chat
            window.open(

                `https://wa.me/${SHOP_WHATSAPP}`,

                "_blank"

            );

        }

    );

}


// =====================================
// MAP BUTTON
// CURRENTLY COMING SOON
// =====================================

if (mapBtn) {

    mapBtn.addEventListener(

        "click",

        () => {

            alert(

                "Map location is coming soon!"

            );

        }

    );

}


// =====================================
// HOME DELIVERY BUTTON
// CURRENTLY COMING SOON
// =====================================

if (deliveryBtn) {

    deliveryBtn.addEventListener(

        "click",

        () => {

            alert(

                "Home Delivery is coming soon!"

            );

        }

    );

}
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 1
// =====================================


// ============================
// FIREBASE IMPORT
// ============================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================
// HTML ELEMENTS
// ============================

const customerName =
    document.getElementById("customerName");

const memberId =
    document.getElementById("memberId");

const customerPhoto =
    document.getElementById("customerPhoto");

const countdownDays =
    document.getElementById("countdownDays");

const rewardCircle =
    document.getElementById("rewardCircle");

const gameLink =
    document.getElementById("gameLink");


// ============================
// STAMP ELEMENTS
// ============================

const stampIds = [
    "stamp1",
    "stamp2",
    "stamp3",
    "stamp4",
    "stamp5",
    "stamp6"
];


const stampDateIds = [
    "stampDate1",
    "stampDate2",
    "stampDate3",
    "stampDate4",
    "stampDate5",
    "stampDate6"
];


// ============================
// DEFAULT AVATAR
// ============================

const DEFAULT_AVATAR =
    "assets/avatars/male.png";


// ============================
// GAME WEBSITE
// ============================

const FREE_GAME_URL =
    "https://riofungames-wq.github.io/Rio-Fun-Game/";


// ============================
// SHOP PHONE NUMBER
// ============================

const SHOP_PHONE =
    "7987827979";


// ============================
// SHOP WHATSAPP NUMBER
// ============================

const SHOP_WHATSAPP =
    "917987827979";


// ============================
// AVATAR SYSTEM
// ============================

function getAvatar(data) {

    // Customer uploaded photo
    if (data.photoURL) {

        return data.photoURL;

    }


    // Saved avatar
    if (data.avatar) {

        return data.avatar;

    }


    // Gender based avatar
    if (data.gender) {

        const gender =
            String(data.gender).toLowerCase();


        if (
            gender === "female" ||
            gender === "girl" ||
            gender === "woman"
        ) {

            return "assets/avatars/female.png";

        }


        if (
            gender === "male" ||
            gender === "boy" ||
            gender === "man"
        ) {

            return "assets/avatars/male.png";

        }

    }


    // Default avatar
    return DEFAULT_AVATAR;

}


// ============================
// SET DEFAULT CUSTOMER DATA
// ============================

function setDefaultData() {

    if (customerName) {

        customerName.textContent =
            "Customer";

    }


    if (memberId) {

        memberId.textContent =
            "RIO-000000";

    }


    if (customerPhoto) {

        customerPhoto.src =
            DEFAULT_AVATAR;

    }

}


// ============================
// LOAD CUSTOMER DATA
// ============================

async function loadCustomerData(user) {

    try {

        const customerRef =
            doc(
                db,
                "customers",
                user.uid
            );


        const customerSnap =
            await getDoc(customerRef);


        // Customer document not found
        if (!customerSnap.exists()) {

            setDefaultData();

            console.warn(
                "Customer document not found."
            );

            return;

        }


        const data =
            customerSnap.data();


        // Customer Name
        if (customerName) {

            customerName.textContent =
                data.name ||
                "Customer";

        }


        // Member ID
        if (memberId) {

            memberId.textContent =
                data.memberId ||
                "RIO-000000";

        }


        // Customer Photo
        if (customerPhoto) {

            customerPhoto.src =
                getAvatar(data);

        }


        console.log(
            "Customer Data Loaded Successfully",
            data
        );

    }


    catch (error) {

        console.error(
            "Customer Load Error:",
            error
        );


        setDefaultData();

    }

}


// ============================
// FREE GAME BUTTON
// ============================

if (gameLink) {

    gameLink.addEventListener(
        "click",
        () => {

            // Premium click animation
            gameLink.classList.add(
                "game-button-clicked"
            );


            // Open Rio Fun Game
            setTimeout(
                () => {

                    window.location.href =
                        FREE_GAME_URL;

                },
                180
            );

        }
    );

}


// ============================
// CALL BUTTON
// ============================

const callBtn =
    document.getElementById(
        "callBtn"
    );


if (callBtn) {

    callBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                `tel:${SHOP_PHONE}`;

        }
    );

}


// ============================
// WHATSAPP BUTTON
// ============================

const whatsappBtn =
    document.getElementById(
        "whatsappBtn"
    );


if (whatsappBtn) {

    whatsappBtn.addEventListener(
        "click",
        () => {

            const whatsappURL =
                `https://wa.me/${SHOP_WHATSAPP}`;

            window.open(
                whatsappURL,
                "_blank"
            );

        }
    );

}


// ============================
// MAP BUTTON
// COMING SOON
// ============================

const mapBtn =
    document.getElementById(
        "mapBtn"
    );


if (mapBtn) {

    mapBtn.addEventListener(
        "click",
        () => {

            showComingSoon(
                "Shop Map"
            );

        }
    );

}


// ============================
// HOME DELIVERY BUTTON
// COMING SOON
// ============================

const deliveryBtn =
    document.getElementById(
        "deliveryBtn"
    );


if (deliveryBtn) {

    deliveryBtn.addEventListener(
        "click",
        () => {

            showComingSoon(
                "Home Delivery"
            );

        }
    );

}


// ============================
// COMING SOON MESSAGE
// ============================

function showComingSoon(featureName) {

    alert(
        `${featureName} is Coming Soon!`
    );

}


// =====================================
// END OF PART 1
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 2
// =====================================


// ============================
// UPDATE STAMP DISPLAY
// ============================

function updateStampDisplay(
    stampCount,
    stampDates = []
) {

    // Make sure stamp count is valid
    let safeStampCount =
        Number(stampCount || 0);


    // Keep stamp count between 0 and 6
    safeStampCount =
        Math.max(
            0,
            Math.min(
                6,
                safeStampCount
            )
        );


    // ============================
    // UPDATE ALL 6 STAMPS
    // ============================

    stampIds.forEach(
        (id, index) => {

            const stamp =
                document.getElementById(
                    id
                );


            if (!stamp) {
                return;
            }


            // ============================
            // GET DATE ELEMENT
            // ============================

            const dateId =
                stampDateIds[index];


            const dateElement =
                document.getElementById(
                    dateId
                );


            // ============================
            // STAMP IS ACTIVE
            // ============================

            if (
                index <
                safeStampCount
            ) {

                // Add active class
                stamp.classList.add(
                    "active"
                );


                // Add special stamped class
                stamp.classList.add(
                    "stamp-collected"
                );


                // Add animation class
                stamp.classList.add(
                    "stamp-pop"
                );


                // Show stamp date
                if (dateElement) {

                    const stampDate =
                        stampDates[index];


                    dateElement.textContent =
                        formatStampDate(
                            stampDate
                        );

                }

            }


            // ============================
            // STAMP IS NOT ACTIVE
            // ============================

            else {

                stamp.classList.remove(
                    "active"
                );


                stamp.classList.remove(
                    "stamp-collected"
                );


                stamp.classList.remove(
                    "stamp-pop"
                );


                // Show placeholder
                if (dateElement) {

                    dateElement.textContent =
                        "--";

                }

            }

        }
    );

}


// ============================
// FORMAT STAMP DATE
// ============================

function formatStampDate(
    stampDate
) {

    // No date available
    if (!stampDate) {

        return "--";

    }


    try {

        let date;


        // ============================
        // FIREBASE TIMESTAMP
        // ============================

        if (
            typeof stampDate ===
            "object" &&
            stampDate.seconds
        ) {

            date =
                new Date(
                    stampDate.seconds *
                    1000
                );

        }


        // ============================
        // FIREBASE TIMESTAMP
        // toDate() SUPPORT
        // ============================

        else if (
            typeof stampDate ===
            "object" &&
            typeof stampDate.toDate ===
            "function"
        ) {

            date =
                stampDate.toDate();

        }


        // ============================
        // NORMAL DATE / STRING
        // ============================

        else {

            date =
                new Date(
                    stampDate
                );

        }


        // Invalid date check
        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "--";

        }


        // ============================
        // DATE FORMAT
        // ============================

        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const year =
            date.getFullYear();


        return (
            day +
            "/" +
            month +
            "/" +
            year
        );

    }


    catch (error) {

        console.error(
            "Stamp Date Format Error:",
            error
        );


        return "--";

    }

}


// ============================
// UPDATE REWARD DISPLAY
// ============================

function updateRewardDisplay(
    stampCount
) {

    if (!rewardCircle) {

        return;

    }


    // ============================
    // REWARD HTML
    // ============================

    rewardCircle.innerHTML = `

        <div class="reward-label">

            <i class="fa-solid fa-gift"></i>

            <span>
                FREE
            </span>

            <span>
                VEG
            </span>

            <span>
                MAGGI
            </span>

        </div>

    `;


    // ============================
    // 6 STAMPS COMPLETE
    // ============================

    if (
        Number(stampCount) >= 6
    ) {

        rewardCircle.classList.add(
            "active"
        );


        rewardCircle.classList.add(
            "reward-unlocked"
        );

    }


    // ============================
    // REWARD LOCKED
    // ============================

    else {

        rewardCircle.classList.remove(
            "active"
        );


        rewardCircle.classList.remove(
            "reward-unlocked"
        );

    }

}


// ============================
// LOAD STAMP DATA
// ============================

async function loadStampData(
    user
) {

    try {

        const customerRef =
            doc(
                db,
                "customers",
                user.uid
            );


        const customerSnap =
            await getDoc(
                customerRef
            );


        // ============================
        // CUSTOMER NOT FOUND
        // ============================

        if (
            !customerSnap.exists()
        ) {

            updateStampDisplay(
                0,
                []
            );


            updateRewardDisplay(
                0
            );


            return;

        }


        // ============================
        // CUSTOMER DATA
        // ============================

        const data =
            customerSnap.data();


        // ============================
        // STAMP COUNT
        // ============================

        const stampCount =
            Number(
                data.stamps || 0
            );


        // ============================
        // STAMP DATES
        // ============================

        let stampDates = [];


        // New recommended structure
        if (
            Array.isArray(
                data.stampDates
            )
        ) {

            stampDates =
                data.stampDates;

        }


        // Alternative structure
        else if (
            Array.isArray(
                data.stampHistory
            )
        ) {

            stampDates =
                data.stampHistory.map(
                    item => {

                        if (
                            item &&
                            item.date
                        ) {

                            return item.date;

                        }

                        return null;

                    }
                );

        }


        // ============================
        // UPDATE STAMPS
        // ============================

        updateStampDisplay(
            stampCount,
            stampDates
        );


        // ============================
        // UPDATE REWARD
        // ============================

        updateRewardDisplay(
            stampCount
        );


        console.log(
            "Stamp Data Loaded Successfully"
        );


        console.log(
            "Current Stamps:",
            stampCount
        );


        console.log(
            "Stamp Dates:",
            stampDates
        );

    }


    catch (error) {

        console.error(
            "Stamp Load Error:",
            error
        );


        // Safe fallback
        updateStampDisplay(
            0,
            []
        );


        updateRewardDisplay(
            0
        );

    }

}


// =====================================
// END OF PART 2
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 3
// =====================================


// ============================
// GET START OF TODAY
// ============================

function getStartOfDay(date) {

    const result =
        new Date(date);


    result.setHours(
        0,
        0,
        0,
        0
    );


    return result;

}


// ============================
// UPDATE RESET COUNTDOWN
// CALENDAR DAY BASED
// ============================

function updateResetCountdown(
    cycleStart
) {

    if (!countdownDays) {

        return;

    }


    // ============================
    // NO CYCLE START
    // ============================

    if (!cycleStart) {

        countdownDays.textContent =
            "40 DAYS";

        return;

    }


    try {

        let startDate;


        // ============================
        // FIREBASE TIMESTAMP
        // ============================

        if (
            typeof cycleStart ===
            "object" &&
            typeof cycleStart.toDate ===
            "function"
        ) {

            startDate =
                cycleStart.toDate();

        }


        // ============================
        // FIREBASE SECONDS
        // ============================

        else if (
            typeof cycleStart ===
            "object" &&
            cycleStart.seconds
        ) {

            startDate =
                new Date(
                    cycleStart.seconds *
                    1000
                );

        }


        // ============================
        // NORMAL DATE
        // ============================

        else {

            startDate =
                new Date(
                    cycleStart
                );

        }


        // ============================
        // INVALID DATE
        // ============================

        if (
            isNaN(
                startDate.getTime()
            )
        ) {

            countdownDays.textContent =
                "40 DAYS";

            return;

        }


        // ============================
        // TODAY START
        // ============================

        const today =
            getStartOfDay(
                new Date()
            );


        // ============================
        // CYCLE START DAY
        // ============================

        const cycleDay =
            getStartOfDay(
                startDate
            );


        // ============================
        // DIFFERENCE IN CALENDAR DAYS
        // ============================

        const difference =
            today.getTime() -
            cycleDay.getTime();


        const daysPassed =
            Math.floor(
                difference /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        // ============================
        // REMAINING DAYS
        // ============================

        let remainingDays =
            40 -
            daysPassed;


        // ============================
        // KEEP BETWEEN 0 AND 40
        // ============================

        remainingDays =
            Math.max(
                0,
                Math.min(
                    40,
                    remainingDays
                )
            );


        // ============================
        // DISPLAY
        // ============================

        countdownDays.textContent =
            remainingDays +
            " DAYS";


        console.log(
            "Stamp Reset Countdown:",
            remainingDays,
            "Days"
        );

    }


    catch (error) {

        console.error(
            "Countdown Calculation Error:",
            error
        );


        countdownDays.textContent =
            "40 DAYS";

    }

}


// ============================
// LOAD COUNTDOWN DATA
// ============================

async function loadCountdownData(
    user
) {

    try {

        const customerRef =
            doc(
                db,
                "customers",
                user.uid
            );


        const customerSnap =
            await getDoc(
                customerRef
            );


        // ============================
        // CUSTOMER NOT FOUND
        // ============================

        if (
            !customerSnap.exists()
        ) {

            countdownDays.textContent =
                "40 DAYS";

            return;

        }


        const data =
            customerSnap.data();


        // ============================
        // NO STAMP CYCLE START
        // ============================

        if (
            !data.cycleStart
        ) {

            countdownDays.textContent =
                "40 DAYS";

            console.log(
                "No active stamp cycle."
            );

            return;

        }


        // ============================
        // UPDATE COUNTDOWN
        // ============================

        updateResetCountdown(
            data.cycleStart
        );

    }


    catch (error) {

        console.error(
            "Countdown Load Error:",
            error
        );


        countdownDays.textContent =
            "40 DAYS";

    }

}


// ============================
// MIDNIGHT COUNTDOWN REFRESH
// ============================

// This refreshes the countdown
// when the calendar day changes.

function scheduleMidnightRefresh() {

    const now =
        new Date();


    const tomorrow =
        new Date(
            now
        );


    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    tomorrow.setHours(
        0,
        0,
        1,
        0
    );


    const millisecondsUntilMidnight =
        tomorrow.getTime() -
        now.getTime();


    setTimeout(
        () => {

            if (
                window.currentRioUser
            ) {

                loadCountdownData(
                    window.currentRioUser
                );

            }


            // Schedule next midnight
            scheduleMidnightRefresh();

        },
        millisecondsUntilMidnight
    );

}


// ============================
// START MIDNIGHT REFRESH
// ============================

scheduleMidnightRefresh();


// =====================================
// END OF PART 3
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 4
// FINAL PART
// =====================================


// ============================
// AUTHENTICATION START
// ============================

onAuthStateChanged(

    auth,

    async (user) => {


        // ============================
        // USER NOT LOGGED IN
        // ============================

        if (!user) {

            console.warn(
                "No logged-in user found."
            );


            // Send customer to login
            window.location.href =
                "login.html";


            return;

        }


        // ============================
        // SAVE CURRENT USER
        // ============================

        window.currentRioUser =
            user;


        console.log(
            "LOGIN UID:",
            user.uid
        );


        // ============================
        // LOAD CUSTOMER PROFILE
        // ============================

        await loadCustomerData(
            user
        );


        // ============================
        // LOAD LOYALTY STAMPS
        // ============================

        await loadStampData(
            user
        );


        // ============================
        // LOAD 40-DAY COUNTDOWN
        // ============================

        await loadCountdownData(
            user
        );


        // ============================
        // FINAL SUCCESS LOG
        // ============================

        console.log(
            "================================"
        );


        console.log(
            "🍜 Rio Maggi Point"
        );


        console.log(
            "Premium Loyalty Card Loaded Successfully"
        );


        console.log(
            "Customer:",
            user.uid
        );


        console.log(
            "================================"
        );

    }

);


// =====================================
// PAGE VISIBILITY REFRESH
// =====================================

// When customer comes back to the
// loyalty card after another tab/app,
// refresh the countdown.

document.addEventListener(
    "visibilitychange",
    () => {


        if (
            document.visibilityState ===
            "visible"
        ) {


            if (
                window.currentRioUser
            ) {


                loadCountdownData(
                    window.currentRioUser
                );


            }

        }

    }
);


// =====================================
// FINAL CARD.JS STATUS
// =====================================

console.log(
    "Rio Maggi Point Card System Ready"
);


// =====================================
// END OF CARD.JS
// =====================================
