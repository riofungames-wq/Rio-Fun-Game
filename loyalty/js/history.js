// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY HISTORY SYSTEM
// HISTORY.JS - PART 1
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

    getDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// GLOBAL USER
// =====================================

let currentUser = null;


// =====================================
// DOM ELEMENTS
// =====================================

const historyPhoto =

    document.getElementById(

        "historyPhoto"

    );


const historyName =

    document.getElementById(

        "historyName"

    );


const historyMember =

    document.getElementById(

        "historyMember"

    );


const historyStampCount =

    document.getElementById(

        "historyStampCount"

    );


const stampProgressFill =

    document.getElementById(

        "stampProgressFill"

    );


const historyTimeline =

    document.getElementById(

        "historyTimeline"

    );


const rewardTitle =

    document.getElementById(

        "rewardTitle"

    );


const rewardStatus =

    document.getElementById(

        "rewardStatus"

    );


const totalVisits =

    document.getElementById(

        "totalVisits"

    );


const totalRewardCount =

    document.getElementById(

        "totalRewardCount"

    );


const memberSince =

    document.getElementById(

        "memberSince"

    );


// =====================================
// DEFAULT VALUES
// =====================================

const DEFAULT_NAME =

    "Customer";


const DEFAULT_MEMBER_ID =

    "RIO-000000";


const TOTAL_STAMPS =

    6;


// =====================================
// FORMAT DATE
// =====================================

function formatDate(

    dateValue

) {


    if (!dateValue) {

        return "--";

    }


    try {


        let date;


        if (

            dateValue.toDate

        ) {

            date =

                dateValue.toDate();

        }

        else if (

            dateValue instanceof Date

        ) {

            date =

                dateValue;

        }

        else {

            date =

                new Date(

                    dateValue

                );

        }


        if (

            isNaN(

                date.getTime()

            )

        ) {

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

    catch (

        error

    ) {


        console.error(

            "Date formatting error:",

            error

        );


        return "--";

    }

}


// =====================================
// GET STAMP COUNT
// =====================================

function getStampCount(

    data

) {


    if (!data) {

        return 0;

    }


    if (

        typeof data.stampCount ===

        "number"

    ) {

        return Math.min(

            data.stampCount,

            TOTAL_STAMPS

        );

    }


    if (

        Array.isArray(

            data.stamps

        )

    ) {

        return Math.min(

            data.stamps.length,

            TOTAL_STAMPS

        );

    }


    return 0;

}


// =====================================
// GET REWARD COUNT
// =====================================

function getRewardCount(

    data

) {


    if (!data) {

        return 0;

    }


    if (

        typeof data.rewardCount ===

        "number"

    ) {

        return data.rewardCount;

    }


    if (

        typeof data.rewardsEarned ===

        "number"

    ) {

        return data.rewardsEarned;

    }


    return 0;

}


// =====================================
// UPDATE BASIC PROFILE
// =====================================

function updateProfileData(

    data

) {


    const name =

        data?.name ||

        data?.fullName ||

        DEFAULT_NAME;


    const memberId =

        data?.memberId ||

        data?.customerId ||

        DEFAULT_MEMBER_ID;


    if (

        historyName

    ) {

        historyName.textContent =

            name;

    }


    if (

        historyMember

    ) {

        historyMember.textContent =

            memberId;

    }


    if (

        historyPhoto &&

        data?.photoURL

    ) {

        historyPhoto.src =

            data.photoURL;

    }

}


// =====================================
// UPDATE STAMP SUMMARY
// =====================================

function updateStampSummary(

    stampCount

) {


    if (

        historyStampCount

    ) {

        historyStampCount.textContent =

            `${stampCount} / ${TOTAL_STAMPS}`;

    }


    if (

        stampProgressFill

    ) {


        const progress =

            (

                stampCount /

                TOTAL_STAMPS

            ) * 100;


        stampProgressFill.style.width =

            `${progress}%`;

    }

}


// =====================================
// UPDATE REWARD STATUS
// =====================================

function updateRewardStatus(

    stampCount,

    rewardCount

) {


    if (

        totalRewardCount

    ) {

        totalRewardCount.textContent =

            rewardCount;

    }


    if (

        stampCount >= TOTAL_STAMPS

    ) {


        if (

            rewardTitle

        ) {

            rewardTitle.textContent =

                "FREE VEG MAGGI UNLOCKED";

        }


        if (

            rewardStatus

        ) {

            rewardStatus.textContent =

                "Your reward is ready to claim!";

        }


    }

    else {


        const remaining =

            TOTAL_STAMPS -

            stampCount;


        if (

            rewardTitle

        ) {

            rewardTitle.textContent =

                "FREE VEG MAGGI";

        }


        if (

            rewardStatus

        ) {

            rewardStatus.textContent =

                `Collect ${remaining} More Stamp(s)`;

        }

    }

}


// =====================================
// HISTORY.JS PART 1 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY HISTORY SYSTEM
// HISTORY.JS - PART 2
// =====================================


// =====================================
// RENDER STAMP TIMELINE
// =====================================

function renderStampTimeline(

    stamps

) {


    // =====================================
    // CHECK TIMELINE ELEMENT
    // =====================================

    if (

        !historyTimeline

    ) {

        return;

    }


    // =====================================
    // CLEAR OLD TIMELINE
    // =====================================

    historyTimeline.innerHTML = "";


    // =====================================
    // NO STAMPS FOUND
    // =====================================

    if (

        !Array.isArray(

            stamps

        ) ||

        stamps.length === 0

    ) {


        const emptyItem =

            document.createElement(

                "div"

            );


        emptyItem.className =

            "timeline-item empty";


        emptyItem.innerHTML = `

            <div class="timeline-icon">

                🍜

            </div>

            <div class="timeline-content">

                <h3>

                    Welcome To Rio Maggi Point

                </h3>

                <p>

                    Your loyalty journey starts here.

                </p>

            </div>

        `;


        historyTimeline.appendChild(

            emptyItem

        );


        return;

    }


    // =====================================
    // SORT STAMPS
    // NEWEST FIRST
    // =====================================

    const sortedStamps =

        [...stamps].sort(

            (

                a,

                b

            ) => {


                const dateA =

                    a?.date?.toDate

                        ? a.date.toDate()

                        : new Date(

                            a?.date || 0

                        );


                const dateB =

                    b?.date?.toDate

                        ? b.date.toDate()

                        : new Date(

                            b?.date || 0

                        );


                return (

                    dateB -

                    dateA

                );

            }

        );


    // =====================================
    // CREATE TIMELINE ITEMS
    // =====================================

    sortedStamps.forEach(

        (

            stamp,

            index

        ) => {


            const item =

                document.createElement(

                    "div"

                );


            item.className =

                "timeline-item";


            // =====================================
            // STAMP NUMBER
            // =====================================

            const stampNumber =

                stamp?.stampNumber ||

                (

                    sortedStamps.length -

                    index

                );


            // =====================================
            // STAMP DATE
            // =====================================

            const stampDate =

                formatDate(

                    stamp?.date

                );


            // =====================================
            // PURCHASE TYPE
            // =====================================

            const purchaseType =

                stamp?.purchaseType ||

                "Daily Purchase";


            // =====================================
            // TIMELINE HTML
            // =====================================

            item.innerHTML = `

                <div class="timeline-icon">

                    🍜

                </div>


                <div class="timeline-content">


                    <h3>

                        Stamp ${stampNumber} Collected

                    </h3>


                    <p>

                        ${purchaseType}

                    </p>


                    <span class="timeline-date">

                        ${stampDate}

                    </span>


                </div>

            `;


            historyTimeline.appendChild(

                item

            );

        }

    );

}


// =====================================
// LOAD CUSTOMER DATA
// =====================================

async function loadCustomerData(

    user

) {


    if (

        !user

    ) {

        return null;

    }


    try {


        // =====================================
        // FIRESTORE CUSTOMER DOCUMENT
        // =====================================

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


        // =====================================
        // CUSTOMER NOT FOUND
        // =====================================

        if (

            !customerSnap.exists()

        ) {


            console.warn(

                "Customer profile not found."

            );


            updateProfileData(

                {

                    name:

                        user.displayName ||

                        DEFAULT_NAME,

                    memberId:

                        DEFAULT_MEMBER_ID,

                    photoURL:

                        user.photoURL ||

                        ""

                }

            );


            return null;

        }


        // =====================================
        // CUSTOMER DATA
        // =====================================

        const customerData =

            customerSnap.data();


        // =====================================
        // UPDATE PROFILE
        // =====================================

        updateProfileData(

            customerData

        );


        // =====================================
        // MEMBER SINCE
        // =====================================

        if (

            memberSince

        ) {


            const joinedDate =

                customerData.memberSince ||

                customerData.createdAt;


            memberSince.textContent =

                formatDate(

                    joinedDate

                );

        }


        // =====================================
        // TOTAL VISITS
        // =====================================

        if (

            totalVisits

        ) {


            const visits =

                customerData.totalVisits ||

                customerData.visits ||

                0;


            totalVisits.textContent =

                visits;

        }


        // =====================================
        // STAMP COUNT
        // =====================================

        const stampCount =

            getStampCount(

                customerData

            );


        // =====================================
        // REWARD COUNT
        // =====================================

        const rewardCount =

            getRewardCount(

                customerData

            );


        // =====================================
        // UPDATE UI
        // =====================================

        updateStampSummary(

            stampCount

        );


        updateRewardStatus(

            stampCount,

            rewardCount

        );


        // =====================================
        // RENDER TIMELINE
        // =====================================

        renderStampTimeline(

            customerData.stamps || []

        );


        // =====================================
        // RETURN DATA
        // =====================================

        return customerData;


    }

    catch (

        error

    ) {


        console.error(

            "Error loading customer history:",

            error

        );


        return null;

    }

}


// =====================================
// HISTORY.JS PART 2 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM LOYALTY HISTORY SYSTEM
// HISTORY.JS - PART 3
// FINAL PART
// =====================================


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


            // =====================================
            // REDIRECT TO LOGIN
            // =====================================

            window.location.href =

                "login.html";


            return;

        }


        // =====================================
        // SAVE CURRENT USER
        // =====================================

        currentUser =

            user;


        window.currentRioUser =

            user;


        // =====================================
        // DEBUG USER UID
        // =====================================

        console.log(

            "History User UID:",

            user.uid

        );


        // =====================================
        // LOAD CUSTOMER HISTORY
        // =====================================

        await loadCustomerData(

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

            "Premium Loyalty History Loaded"

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
// FINAL HISTORY.JS READY MESSAGE
// =====================================

console.log(

    "Rio Maggi Point Premium Loyalty History System Ready"

);


// =====================================
// END OF HISTORY.JS
// =====================================
``
