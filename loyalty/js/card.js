// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 1 OF 4
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
// BUSINESS DETAILS
// =====================================

const SHOP_PHONE = "7987827979";

const SHOP_WHATSAPP = "917987827979";

const FREE_GAME_URL =
    "https://riofungames-wq.github.io/Rio-Fun-Game/";

const DEFAULT_AVATAR =
    "assets/avatars/male.png";


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
// STAMP ELEMENT IDs
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
// STAMP DATE ELEMENT IDs
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


// =====================================
// AVATAR SYSTEM
// =====================================

function getAvatar(data) {

    // Customer uploaded photo
    if (
        data &&
        data.photoURL
    ) {

        return data.photoURL;

    }


    // Saved avatar
    if (
        data &&
        data.avatar
    ) {

        return data.avatar;

    }


    // Gender based avatar
    if (
        data &&
        data.gender
    ) {

        const gender =

            String(
                data.gender
            )
            .toLowerCase()
            .trim();


        // Female
        if (

            gender === "female" ||
            gender === "girl" ||
            gender === "woman"

        ) {

            return "assets/avatars/female.png";

        }


        // Male
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


// =====================================
// LOAD CUSTOMER DATA
// =====================================

async function loadCustomerData(user) {

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


        // Customer not found
        if (
            !customerSnap.exists()
        ) {

            console.warn(
                "Customer document not found."
            );

            setDefaultData();

            return;

        }


        const data =
            customerSnap.data();


        // Customer name
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


        // Customer photo
        if (customerPhoto) {

            customerPhoto.src =
                getAvatar(data);


            // If image fails
            customerPhoto.onerror = () => {

                customerPhoto.src =
                    DEFAULT_AVATAR;

            };

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


// =====================================
// FREE GAME BUTTON
// =====================================

if (gameLink) {

    gameLink.addEventListener(

        "click",

        () => {

            gameLink.classList.add(
                "game-button-clicked"
            );


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


// =====================================
// CALL BUTTON
// =====================================

if (callBtn) {

    callBtn.addEventListener(

        "click",

        () => {

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

            const whatsappURL =

                `https://wa.me/${SHOP_WHATSAPP}`;


            window.open(

                whatsappURL,

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

            showComingSoon(
                "Shop Map"
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

            showComingSoon(
                "Home Delivery"
            );

        }

    );

}


// =====================================
// COMING SOON MESSAGE
// =====================================

function showComingSoon(
    featureName
) {

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
// CARD.JS - PART 2 OF 4
// =====================================


// =====================================
// UPDATE STAMP DISPLAY
// =====================================

function updateStampDisplay(
    stampCount,
    stampDates = []
) {

    // =====================================
    // SAFE STAMP COUNT
    // =====================================

    let safeStampCount =

        Number(stampCount || 0);


    // Keep count between 0 and 6

    safeStampCount =

        Math.max(

            0,

            Math.min(

                6,

                safeStampCount

            )

        );


    // =====================================
    // UPDATE ALL 6 STAMP CIRCLES
    // =====================================

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


            // =====================================
            // DATE ELEMENT
            // =====================================

            const dateElement =

                document.getElementById(

                    stampDateIds[index]

                );


            // =====================================
            // STAMP COLLECTED
            // =====================================

            if (

                index <

                safeStampCount

            ) {

                // Active gold stamp

                stamp.classList.add(
                    "active"
                );


                // Special collected stamp

                stamp.classList.add(
                    "stamp-collected"
                );


                // Special animation

                stamp.classList.add(
                    "stamp-pop"
                );


                // =====================================
                // SHOW STAMP DATE
                // =====================================

                if (dateElement) {

                    const stampDate =

                        stampDates[index];


                    dateElement.textContent =

                        formatStampDate(
                            stampDate
                        );

                }

            }


            // =====================================
            // STAMP NOT COLLECTED
            // =====================================

            else {

                // Remove active state

                stamp.classList.remove(
                    "active"
                );


                // Remove collected state

                stamp.classList.remove(
                    "stamp-collected"
                );


                // Remove animation

                stamp.classList.remove(
                    "stamp-pop"
                );


                // =====================================
                // EMPTY DATE
                // =====================================

                if (dateElement) {

                    dateElement.textContent =
                        "--";

                }

            }

        }

    );

}


// =====================================
// FORMAT STAMP DATE
// =====================================

function formatStampDate(
    stampDate
) {

    // =====================================
    // NO DATE
    // =====================================

    if (!stampDate) {

        return "--";

    }


    try {

        let date;


        // =====================================
        // FIREBASE TIMESTAMP
        // toDate()
        // =====================================

        if (

            typeof stampDate ===
            "object" &&

            typeof stampDate.toDate ===
            "function"

        ) {

            date =

                stampDate.toDate();

        }


        // =====================================
        // FIREBASE TIMESTAMP
        // seconds
        // =====================================

        else if (

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


        // =====================================
        // NORMAL DATE
        // =====================================

        else {

            date =

                new Date(
                    stampDate
                );

        }


        // =====================================
        // INVALID DATE
        // =====================================

        if (

            !date ||

            isNaN(
                date.getTime()
            )

        ) {

            return "--";

        }


        // =====================================
        // DATE FORMAT
        // DD/MM/YYYY
        // =====================================

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


// =====================================
// UPDATE REWARD DISPLAY
// =====================================

function updateRewardDisplay(
    stampCount
) {

    // =====================================
    // REWARD ELEMENT NOT FOUND
    // =====================================

    if (!rewardCircle) {

        return;

    }


    // =====================================
    // FREE VEG MAGGI REWARD DESIGN
    // =====================================

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


    // =====================================
    // 6 STAMPS COMPLETE
    // REWARD UNLOCKED
    // =====================================

    if (

        Number(stampCount) >= 6

    ) {

        rewardCircle.classList.add(

            "active"

        );


        rewardCircle.classList.add(

            "reward-unlocked"

        );


        // Optional reward animation

        rewardCircle.classList.add(

            "reward-pop"

        );

    }


    // =====================================
    // REWARD LOCKED
    // =====================================

    else {

        rewardCircle.classList.remove(

            "active"

        );


        rewardCircle.classList.remove(

            "reward-unlocked"

        );


        rewardCircle.classList.remove(

            "reward-pop"

        );

    }

}


// =====================================
// LOAD STAMP DATA FROM FIREBASE
// =====================================

async function loadStampData(
    user
) {

    try {

        // =====================================
        // CUSTOMER DOCUMENT
        // =====================================

        const customerRef =

            doc(

                db,

                "customers",

                user.uid

            );


        // =====================================
        // GET CUSTOMER DATA
        // =====================================

        const customerSnap =

            await getDoc(

                customerRef

            );


        // =====================================
        // CUSTOMER NOT FOUND
        // =====================================

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


        // =====================================
        // CUSTOMER DATA
        // =====================================

        const data =

            customerSnap.data();


        // =====================================
        // CURRENT STAMP COUNT
        // =====================================

        const stampCount =

            Number(

                data.stamps || 0

            );


        // =====================================
        // STAMP DATE ARRAY
        // =====================================

        let stampDates = [];


        // =====================================
        // PRIMARY STAMP DATE FIELD
        // =====================================

        if (

            Array.isArray(

                data.stampDates

            )

        ) {

            stampDates =

                data.stampDates;

        }


        // =====================================
        // BACKUP STAMP HISTORY FIELD
        // =====================================

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


        // =====================================
        // UPDATE STAMP CIRCLES
        // =====================================

        updateStampDisplay(

            stampCount,

            stampDates

        );


        // =====================================
        // UPDATE REWARD
        // =====================================

        updateRewardDisplay(

            stampCount

        );


        // =====================================
        // DEBUG LOG
        // =====================================

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

        // =====================================
        // ERROR HANDLING
        // =====================================

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
// CARD.JS - PART 3 OF 4
// =====================================


// =====================================
// GET START OF DAY
// =====================================

function getStartOfDay(date) {

    const result =

        new Date(date);


    // Set time to exactly 12:00 AM

    result.setHours(

        0,

        0,

        0,

        0

    );


    return result;

}


// =====================================
// CONVERT FIREBASE DATE
// =====================================

function convertToDate(
    dateValue
) {

    // =====================================
    // NO DATE
    // =====================================

    if (!dateValue) {

        return null;

    }


    // =====================================
    // FIREBASE TIMESTAMP
    // toDate()
    // =====================================

    if (

        typeof dateValue ===
        "object" &&

        typeof dateValue.toDate ===
        "function"

    ) {

        return dateValue.toDate();

    }


    // =====================================
    // FIREBASE TIMESTAMP
    // seconds
    // =====================================

    if (

        typeof dateValue ===
        "object" &&

        dateValue.seconds

    ) {

        return new Date(

            dateValue.seconds *

            1000

        );

    }


    // =====================================
    // JAVASCRIPT DATE
    // =====================================

    if (

        dateValue instanceof Date

    ) {

        return dateValue;

    }


    // =====================================
    // STRING / NUMBER
    // =====================================

    const convertedDate =

        new Date(

            dateValue

        );


    // =====================================
    // INVALID DATE
    // =====================================

    if (

        isNaN(

            convertedDate.getTime()

        )

    ) {

        return null;

    }


    return convertedDate;

}


// =====================================
// UPDATE RESET COUNTDOWN
// CALENDAR DAY BASED
// =====================================

function updateResetCountdown(
    cycleStart
) {

    // =====================================
    // COUNTDOWN ELEMENT NOT FOUND
    // =====================================

    if (!countdownDays) {

        return;

    }


    // =====================================
    // NO ACTIVE CYCLE
    // =====================================

    if (!cycleStart) {

        countdownDays.textContent =

            "40 DAYS";

        return;

    }


    try {

        // =====================================
        // CONVERT CYCLE START DATE
        // =====================================

        const startDate =

            convertToDate(

                cycleStart

            );


        // =====================================
        // INVALID CYCLE DATE
        // =====================================

        if (!startDate) {

            countdownDays.textContent =

                "40 DAYS";

            return;

        }


        // =====================================
        // TODAY AT 12:00 AM
        // =====================================

        const today =

            getStartOfDay(

                new Date()

            );


        // =====================================
        // CYCLE START DAY AT 12:00 AM
        // =====================================

        const cycleStartDay =

            getStartOfDay(

                startDate

            );


        // =====================================
        // DIFFERENCE BETWEEN CALENDAR DAYS
        // =====================================

        const difference =

            today.getTime() -

            cycleStartDay.getTime();


        // =====================================
        // MILLISECONDS IN ONE DAY
        // =====================================

        const ONE_DAY =

            1000 *

            60 *

            60 *

            24;


        // =====================================
        // NUMBER OF FULL CALENDAR DAYS PASSED
        // =====================================

        const daysPassed =

            Math.floor(

                difference /

                ONE_DAY

            );


        // =====================================
        // 40 DAY CYCLE
        // =====================================

        let remainingDays =

            40 -

            daysPassed;


        // =====================================
        // KEEP COUNTDOWN BETWEEN 0 AND 40
        // =====================================

        remainingDays =

            Math.max(

                0,

                Math.min(

                    40,

                    remainingDays

                )

            );


        // =====================================
        // DISPLAY COUNTDOWN
        // =====================================

        countdownDays.textContent =

            remainingDays +

            " DAYS";


        // =====================================
        // DEBUG
        // =====================================

        console.log(

            "40-Day Calendar Countdown:",

            {

                cycleStart:
                    startDate,

                today:
                    today,

                daysPassed:
                    daysPassed,

                remainingDays:
                    remainingDays

            }

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


// =====================================
// LOAD COUNTDOWN DATA
// =====================================

async function loadCountdownData(
    user
) {

    try {

        // =====================================
        // CUSTOMER DOCUMENT
        // =====================================

        const customerRef =

            doc(

                db,

                "customers",

                user.uid

            );


        // =====================================
        // GET CUSTOMER DATA
        // =====================================

        const customerSnap =

            await getDoc(

                customerRef

            );


        // =====================================
        // CUSTOMER DOCUMENT NOT FOUND
        // =====================================

        if (

            !customerSnap.exists()

        ) {

            countdownDays.textContent =

                "40 DAYS";

            return;

        }


        // =====================================
        // CUSTOMER DATA
        // =====================================

        const data =

            customerSnap.data();


        // =====================================
        // NO ACTIVE CYCLE
        // =====================================

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


        // =====================================
        // UPDATE COUNTDOWN
        // =====================================

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


// =====================================
// MIDNIGHT AUTO REFRESH
// =====================================

function scheduleMidnightRefresh() {

    // =====================================
    // CURRENT DATE AND TIME
    // =====================================

    const now =

        new Date();


    // =====================================
    // CREATE TOMORROW
    // =====================================

    const tomorrow =

        new Date(

            now

        );


    tomorrow.setDate(

        tomorrow.getDate() +

        1

    );


    // =====================================
    // SET TOMORROW TO 12:00:01 AM
    // =====================================

    tomorrow.setHours(

        0,

        0,

        1,

        0

    );


    // =====================================
    // TIME UNTIL MIDNIGHT
    // =====================================

    const millisecondsUntilMidnight =

        tomorrow.getTime() -

        now.getTime();


    // =====================================
    // RUN AFTER MIDNIGHT
    // =====================================

    setTimeout(

        () => {

            // =====================================
            // IF USER IS LOGGED IN
            // =====================================

            if (

                window.currentRioUser

            ) {

                loadCountdownData(

                    window.currentRioUser

                );

            }


            // =====================================
            // SCHEDULE NEXT MIDNIGHT
            // =====================================

            scheduleMidnightRefresh();

        },

        millisecondsUntilMidnight

    );

}


// =====================================
// START MIDNIGHT REFRESH SYSTEM
// =====================================

scheduleMidnightRefresh();


// =====================================
// PAGE VISIBILITY REFRESH
// =====================================

document.addEventListener(

    "visibilitychange",

    () => {

        // =====================================
        // USER RETURNS TO PAGE
        // =====================================

        if (

            document.visibilityState ===

            "visible"

        ) {

            // =====================================
            // REFRESH COUNTDOWN
            // =====================================

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
// END OF PART 3
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY CARD SYSTEM
// CARD.JS - PART 4 OF 4
// FINAL PART
// =====================================


// =====================================
// FIREBASE AUTHENTICATION
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


            // Send user to login page

            window.location.href =

                "login.html";


            return;

        }


        // =====================================
        // SAVE CURRENT LOGGED-IN USER
        // =====================================

        window.currentRioUser =

            user;


        // =====================================
        // DEBUG LOGIN UID
        // =====================================

        console.log(

            "LOGIN UID:",

            user.uid

        );


        // =====================================
        // LOAD CUSTOMER PROFILE
        // =====================================

        await loadCustomerData(

            user

        );


        // =====================================
        // LOAD STAMP DATA
        // =====================================

        await loadStampData(

            user

        );


        // =====================================
        // LOAD 40-DAY COUNTDOWN
        // =====================================

        await loadCountdownData(

            user

        );


        // =====================================
        // FINAL SUCCESS LOG
        // =====================================

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

            "Customer UID:",

            user.uid

        );


        console.log(

            "================================"

        );

    }

);


// =====================================
// FINAL CARD.JS READY MESSAGE
// =====================================

console.log(

    "Rio Maggi Point Premium Loyalty Card System Ready"

);


// =====================================
// END OF CARD.JS
// =====================================
