// =====================================================
// RIO MAGGI POINT
// ADMIN REWARD MANAGER
// PART 1 / 4
// =====================================================

// =====================================================
// FIREBASE IMPORTS
// =====================================================

import { auth, db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// CONFIGURATION
// =====================================================

const REWARD_STAMP_LIMIT = 6;

const CUSTOMER_COLLECTION = "customers";

const DEFAULT_MALE_AVATAR =
    "assets/avatars/male.png";

const DEFAULT_FEMALE_AVATAR =
    "assets/avatars/female.png";

const DEFAULT_MEMBER_ID =
    "RIO-000000000";


// =====================================================
// DOM ELEMENTS
// =====================================================

const rewardTable =
    document.getElementById("rewardTable");

const rewardHistoryTable =
    document.getElementById("rewardHistoryTable");

const rewardTotal =
    document.getElementById("rewardTotal");

const rewardReady =
    document.getElementById("rewardReady");

const rewardClaimed =
    document.getElementById("rewardClaimed");

const previewPhoto =
    document.getElementById("previewPhoto");

const previewName =
    document.getElementById("previewName");

const previewMember =
    document.getElementById("previewMember");

const previewStamp =
    document.getElementById("previewStamp");

const redeemRewardBtn =
    document.getElementById("redeemRewardBtn");

const searchRewardCustomer =
    document.getElementById("searchRewardCustomer");

const refreshRewardBtn =
    document.getElementById("refreshRewardBtn");

const exportRewardBtn =
    document.getElementById("exportRewardBtn");

const pendingRewardBtn =
    document.getElementById("pendingRewardBtn");

const claimedRewardBtn =
    document.getElementById("claimedRewardBtn");

const backDashboard =
    document.getElementById("backDashboard");

const lastRewardRefresh =
    document.getElementById("lastRewardRefresh");


// =====================================================
// APPLICATION STATE
// =====================================================

let customers = [];

let selectedCustomer = null;

let activeFilter = "all";

let isLoading = false;


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "admin-login.html";

        return;

    }

    await loadRewards();

});


// =====================================================
// LOAD REWARDS
// =====================================================

async function loadRewards() {

    if (isLoading) {
        return;
    }

    isLoading = true;

    setLoadingState(true);

    try {

        const snapshot = await getDocs(
            collection(
                db,
                CUSTOMER_COLLECTION
            )
        );

        customers = [];

        snapshot.forEach((customerDoc) => {

            const customerData =
                customerDoc.data();

            customers.push({

                uid: customerDoc.id,

                ...customerData

            });

        });

        updateRewardStats();

        renderRewardTable();

        renderRewardHistory();

        updateLastRefresh();

        restoreSelectedCustomer();

    } catch (error) {

        console.error(
            "Failed to load rewards:",
            error
        );

        showTableMessage(
            rewardTable,
            "Unable to load customer rewards."
        );

        showTableMessage(
            rewardHistoryTable,
            "Unable to load reward history."
        );

    } finally {

        isLoading = false;

        setLoadingState(false);

    }

}


// =====================================================
// UPDATE REWARD STATISTICS
// =====================================================

function updateRewardStats() {

    const total =
        customers.length;

    const ready =
        customers.filter(
            customer =>
                customer.rewardUnlocked === true
        ).length;

    const claimed =
        customers.filter(
            customer =>
                customer.rewardClaimed === true
        ).length;


    if (rewardTotal) {

        rewardTotal.textContent =
            total;

    }


    if (rewardReady) {

        rewardReady.textContent =
            ready;

    }


    if (rewardClaimed) {

        rewardClaimed.textContent =
            claimed;

    }

}


// =====================================================
// GET CUSTOMER AVATAR
// =====================================================

function getCustomerAvatar(customer) {

    if (
        customer &&
        customer.gender === "female"
    ) {

        return DEFAULT_FEMALE_AVATAR;

    }

    return DEFAULT_MALE_AVATAR;

}


// =====================================================
// GET CUSTOMER SEARCH TEXT
// =====================================================

function getCustomerSearchText(customer) {

    return [

        customer.name,

        customer.memberId,

        customer.mobile

    ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();

}


// =====================================================
// GET FILTERED CUSTOMERS
// =====================================================

function getFilteredCustomers() {

    const keyword =
        searchRewardCustomer?.value
            ?.trim()
            .toLowerCase() || "";


    return customers.filter(
        (customer) => {

            const matchesSearch =
                !keyword ||
                getCustomerSearchText(
                    customer
                ).includes(keyword);


            let matchesFilter = true;


            if (
                activeFilter === "pending"
            ) {

                matchesFilter =
                    customer.rewardUnlocked === true;

            }


            if (
                activeFilter === "claimed"
            ) {

                matchesFilter =
                    customer.rewardClaimed === true;

            }


            return (
                matchesSearch &&
                matchesFilter
            );

        }
    );

}


// =====================================================
// RENDER REWARD TABLE
// =====================================================

function renderRewardTable() {

    if (!rewardTable) {
        return;
    }

    rewardTable.innerHTML = "";


    const filteredCustomers =
        getFilteredCustomers();


    if (
        filteredCustomers.length === 0
    ) {

        showTableMessage(
            rewardTable,
            "No customers found.",
            7
        );

        return;

    }


    filteredCustomers.forEach(
        createRewardRow
    );

}


// =====================================================
// CREATE REWARD TABLE ROW
// =====================================================

function createRewardRow(customer) {

    if (!rewardTable) {
        return;
    }


    const tr =
        document.createElement("tr");


    const photoTd =
        document.createElement("td");

    const photo =
        document.createElement("img");

    photo.src =
        getCustomerAvatar(customer);

    photo.alt =
        customer.name
            ? `${customer.name} profile`
            : "Customer profile";

    photo.className =
        "reward-customer-photo";

    photo.loading =
        "lazy";

    photoTd.appendChild(photo);


    const nameTd =
        document.createElement("td");

    nameTd.textContent =
        customer.name || "-";


    const memberTd =
        document.createElement("td");

    memberTd.textContent =
        customer.memberId ||
        DEFAULT_MEMBER_ID;


    const mobileTd =
        document.createElement("td");

    mobileTd.textContent =
        customer.mobile || "-";


    const stampTd =
        document.createElement("td");

    const stamps =
        Number(customer.stamps) || 0;

    stampTd.textContent =
        `${stamps}/${REWARD_STAMP_LIMIT}`;


    const statusTd =
        document.createElement("td");


    if (
        customer.rewardClaimed === true
    ) {

        statusTd.textContent =
            "🟣 Claimed";

        statusTd.className =
            "reward-status claimed";

    } else if (
        customer.rewardUnlocked === true
    ) {

        statusTd.textContent =
            "🟢 Ready";

        statusTd.className =
            "reward-status ready";

    } else {

        statusTd.textContent =
            "🔴 Locked";

        statusTd.className =
            "reward-status locked";

    }


    const actionTd =
        document.createElement("td");


    const selectBtn =
        document.createElement("button");

    selectBtn.type =
        "button";

    selectBtn.className =
        "reward-select-btn";

    selectBtn.textContent =
        "Select";


    selectBtn.addEventListener(
        "click",
        () => {

            selectRewardCustomer(
                customer.uid
            );

        }
    );


    actionTd.appendChild(
        selectBtn
    );


    tr.append(

        photoTd,

        nameTd,

        memberTd,

        mobileTd,

        stampTd,

        statusTd,

        actionTd

    );


    rewardTable.appendChild(tr);

}


// =====================================================
// SHOW TABLE MESSAGE
// =====================================================

function showTableMessage(
    tableBody,
    message,
    colspan = 1
) {

    if (!tableBody) {
        return;
    }


    const tr =
        document.createElement("tr");


    const td =
        document.createElement("td");


    td.colSpan =
        colspan;

    td.textContent =
        message;

    td.className =
        "table-message";


    tr.appendChild(td);

    tableBody.appendChild(tr);

}


// =====================================================
// LOADING STATE
// =====================================================

function setLoadingState(
    loading
) {

    if (
        refreshRewardBtn
    ) {

        refreshRewardBtn.disabled =
            loading;

        refreshRewardBtn.classList.toggle(
            "loading",
            loading
        );

    }


    if (loading) {

        if (rewardTable) {

            showTableMessage(
                rewardTable,
                "Loading customer rewards...",
                7
            );

        }

        if (rewardHistoryTable) {

            showTableMessage(
                rewardHistoryTable,
                "Loading reward history...",
                5
            );

        }

    }

}


// =====================================================
// UPDATE LAST REFRESH TIME
// =====================================================

function updateLastRefresh() {

    if (!lastRewardRefresh) {
        return;
    }


    lastRewardRefresh.textContent =
        new Date().toLocaleString();

}


// =====================================================
// SELECT CUSTOMER
// =====================================================

function selectRewardCustomer(uid) {

    const customer =
        customers.find(
            item =>
                item.uid === uid
        );


    if (!customer) {
        return;
    }


    selectedCustomer =
        customer;


    previewCustomer(
        customer
    );

}


// =====================================================
// PREVIEW CUSTOMER
// =====================================================

function previewCustomer(
    customer
) {

    if (!customer) {
        return;
    }


    if (previewPhoto) {

        previewPhoto.src =
            getCustomerAvatar(
                customer
            );

        previewPhoto.alt =
            customer.name
                ? `${customer.name} profile`
                : "Customer profile";

    }


    if (previewName) {

        previewName.textContent =
            customer.name ||
            "Unknown Customer";

    }


    if (previewMember) {

        previewMember.textContent =
            customer.memberId ||
            DEFAULT_MEMBER_ID;

    }


    if (previewStamp) {

        const stamps =
            Number(
                customer.stamps
            ) || 0;

        previewStamp.textContent =
            `${stamps}/${REWARD_STAMP_LIMIT}`;

    }


    if (redeemRewardBtn) {

        redeemRewardBtn.disabled =
            customer.rewardUnlocked !== true;

    }

}


// =====================================================
// RESTORE SELECTED CUSTOMER
// =====================================================

function restoreSelectedCustomer() {

    if (!selectedCustomer) {

        resetPreview();

        return;

    }


    const updatedCustomer =
        customers.find(
            customer =>
                customer.uid ===
                selectedCustomer.uid
        );


    if (!updatedCustomer) {

        selectedCustomer =
            null;

        resetPreview();

        return;

    }


    selectedCustomer =
        updatedCustomer;


    previewCustomer(
        updatedCustomer
    );

}


// =====================================================
// RESET PREVIEW
// =====================================================

function resetPreview() {

    selectedCustomer =
        null;


    if (previewPhoto) {

        previewPhoto.src =
            DEFAULT_MALE_AVATAR;

        previewPhoto.alt =
            "Customer";

    }


    if (previewName) {

        previewName.textContent =
            "Waiting...";

    }


    if (previewMember) {

        previewMember.textContent =
            DEFAULT_MEMBER_ID;

    }


    if (previewStamp) {

        previewStamp.textContent =
            `0/${REWARD_STAMP_LIMIT}`;

    }


    if (redeemRewardBtn) {

        redeemRewardBtn.disabled =
            true;

    }

}


// =====================================================
// SEARCH EVENT
// =====================================================

searchRewardCustomer?.addEventListener(
    "input",
    () => {

        renderRewardTable();

    }
);


// =====================================================
// REFRESH EVENT
// =====================================================

refreshRewardBtn?.addEventListener(
    "click",
    async () => {

        await loadRewards();

    }
);


// =====================================================
// FILTER: PENDING REWARDS
// =====================================================

pendingRewardBtn?.addEventListener(
    "click",
    () => {

        activeFilter =
            activeFilter === "pending"
                ? "all"
                : "pending";

        renderRewardTable();

    }
);


// =====================================================
// FILTER: CLAIMED REWARDS
// =====================================================

claimedRewardBtn?.addEventListener(
    "click",
    () => {

        activeFilter =
            activeFilter === "claimed"
                ? "all"
                : "claimed";

        renderRewardTable();

    }
);


// =====================================================
// BACK TO ADMIN DASHBOARD
// =====================================================

backDashboard?.addEventListener(
    "click",
    () => {

        window.location.href =
            "admin-dashboard.html";

    }
);


// =====================================================
// INITIAL PREVIEW
// =====================================================

resetPreview();


// =====================================================
// DEBUG LOG
// =====================================================

console.log(
    "==================================="
);

console.log(
    "🎁 Rio Maggi Point Reward Manager"
);

console.log(
    "Reward Manager Part 1 Loaded"
);

console.log(
    "==================================="
);
// =====================================================
// RIO MAGGI POINT
// ADMIN REWARD MANAGER
// PART 2 / 4
// =====================================================


// =====================================================
// REDEEM REWARD
// =====================================================

redeemRewardBtn?.addEventListener(
    "click",
    async () => {

        // ---------------------------------------------
        // CHECK SELECTED CUSTOMER
        // ---------------------------------------------

        if (!selectedCustomer) {

            alert(
                "Please select a customer first."
            );

            return;

        }


        // ---------------------------------------------
        // CHECK REWARD STATUS
        // ---------------------------------------------

        if (
            selectedCustomer.rewardUnlocked !== true
        ) {

            alert(
                "This customer is not eligible for reward redemption."
            );

            return;

        }


        // ---------------------------------------------
        // PREVENT DOUBLE CLICK
        // ---------------------------------------------

        if (
            redeemRewardBtn.disabled
        ) {

            return;

        }


        // ---------------------------------------------
        // SAVE ORIGINAL BUTTON TEXT
        // ---------------------------------------------

        const originalButtonText =
            redeemRewardBtn.textContent;


        try {

            // -----------------------------------------
            // DISABLE BUTTON WHILE PROCESSING
            // -----------------------------------------

            redeemRewardBtn.disabled =
                true;

            redeemRewardBtn.textContent =
                "Redeeming...";


            // -----------------------------------------
            // CUSTOMER DOCUMENT REFERENCE
            // -----------------------------------------

            const customerRef =
                doc(
                    db,
                    CUSTOMER_COLLECTION,
                    selectedCustomer.uid
                );


            // -----------------------------------------
            // REDEEM REWARD IN FIRESTORE
            // -----------------------------------------

            await updateDoc(
                customerRef,
                {

                    rewardUnlocked:
                        false,

                    rewardClaimed:
                        true,

                    stamps:
                        0,

                    rewardClaimedAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            // -----------------------------------------
            // UPDATE LOCAL CUSTOMER DATA
            // -----------------------------------------

            const customerIndex =
                customers.findIndex(
                    customer =>
                        customer.uid ===
                        selectedCustomer.uid
                );


            if (
                customerIndex !== -1
            ) {

                customers[
                    customerIndex
                ] = {

                    ...customers[
                        customerIndex
                    ],

                    rewardUnlocked:
                        false,

                    rewardClaimed:
                        true,

                    stamps:
                        0

                };


                selectedCustomer =
                    customers[
                        customerIndex
                    ];

            }


            // -----------------------------------------
            // UPDATE PREVIEW
            // -----------------------------------------

            previewCustomer(
                selectedCustomer
            );


            // -----------------------------------------
            // UPDATE STATISTICS
            // -----------------------------------------

            updateRewardStats();


            // -----------------------------------------
            // REFRESH TABLE
            // -----------------------------------------

            renderRewardTable();


            // -----------------------------------------
            // REFRESH HISTORY
            // -----------------------------------------

            renderRewardHistory();


            // -----------------------------------------
            // UPDATE LAST REFRESH
            // -----------------------------------------

            updateLastRefresh();


            // -----------------------------------------
            // SUCCESS MESSAGE
            // -----------------------------------------

            alert(
                "🎉 Reward redeemed successfully!"
            );


        } catch (error) {

            // -----------------------------------------
            // LOG ERROR
            // -----------------------------------------

            console.error(
                "Reward redemption failed:",
                error
            );


            // -----------------------------------------
            // ERROR MESSAGE
            // -----------------------------------------

            alert(
                "Unable to redeem reward. Please try again."
            );


        } finally {

            // -----------------------------------------
            // RESTORE BUTTON
            // -----------------------------------------

            redeemRewardBtn.textContent =
                originalButtonText;


            // -----------------------------------------
            // RE-CHECK REWARD STATUS
            // -----------------------------------------

            if (
                selectedCustomer
            ) {

                redeemRewardBtn.disabled =
                    selectedCustomer.rewardUnlocked !== true;

            } else {

                redeemRewardBtn.disabled =
                    true;

            }

        }

    }
);


// =====================================================
// REWARD REDEMPTION CONFIRMATION HELPER
// =====================================================

function canRedeemReward(
    customer
) {

    if (!customer) {

        return false;

    }


    if (!customer.uid) {

        return false;

    }


    if (
        customer.rewardUnlocked !== true
    ) {

        return false;

    }


    return true;

}


// =====================================================
// SAFE REWARD REDEMPTION CHECK
// =====================================================

function getRewardStatus(
    customer
) {

    if (!customer) {

        return "unknown";

    }


    if (
        customer.rewardClaimed === true
    ) {

        return "claimed";

    }


    if (
        customer.rewardUnlocked === true
    ) {

        return "ready";

    }


    return "locked";

}


// =====================================================
// UPDATE SELECTED CUSTOMER FROM LOCAL DATA
// =====================================================

function syncSelectedCustomer() {

    if (!selectedCustomer) {

        return;

    }


    const latestCustomer =
        customers.find(
            customer =>
                customer.uid ===
                selectedCustomer.uid
        );


    if (!latestCustomer) {

        selectedCustomer =
            null;

        resetPreview();

        return;

    }


    selectedCustomer =
        latestCustomer;


    previewCustomer(
        selectedCustomer
    );

}


// =====================================================
// REWARD STATUS DEBUG HELPER
// =====================================================

function logSelectedRewardStatus() {

    if (!selectedCustomer) {

        console.log(
            "No reward customer selected."
        );

        return;

    }


    console.log(
        "Selected Customer:",
        selectedCustomer.name ||
            "Unknown"
    );


    console.log(
        "Reward Status:",
        getRewardStatus(
            selectedCustomer
        )
    );

}


// =====================================================
// EXPOSE ONLY REQUIRED DEBUG HELPER
// =====================================================

window.rewardManagerDebug = {

    getSelectedCustomer: () =>
        selectedCustomer,

    getRewardStatus: () =>
        getRewardStatus(
            selectedCustomer
        ),

    canRedeem: () =>
        canRedeemReward(
            selectedCustomer
        ),

    syncSelectedCustomer,

    logSelectedRewardStatus

};


// =====================================================
// PART 2 READY
// =====================================================

console.log(
    "Reward Manager Part 2 Loaded"
);
// =====================================================
// RIO MAGGI POINT
// ADMIN REWARD MANAGER
// PART 3 / 4
// =====================================================


// =====================================================
// REWARD HISTORY
// =====================================================

function renderRewardHistory() {

    if (!rewardHistoryTable) {

        return;

    }


    // ---------------------------------------------
    // CLEAR OLD HISTORY
    // ---------------------------------------------

    rewardHistoryTable.innerHTML = "";


    // ---------------------------------------------
    // GET CLAIMED REWARDS
    // ---------------------------------------------

    const claimedCustomers =
        customers

            .filter(
                customer =>
                    customer.rewardClaimed === true
            )

            .sort(
                (
                    firstCustomer,
                    secondCustomer
                ) => {

                    const firstTime =
                        getTimestampValue(
                            firstCustomer.rewardClaimedAt
                        );

                    const secondTime =
                        getTimestampValue(
                            secondCustomer.rewardClaimedAt
                        );


                    return (
                        secondTime -
                        firstTime
                    );

                }
            );


    // ---------------------------------------------
    // EMPTY HISTORY
    // ---------------------------------------------

    if (
        claimedCustomers.length === 0
    ) {

        showTableMessage(
            rewardHistoryTable,
            "No reward activity found.",
            5
        );

        return;

    }


    // ---------------------------------------------
    // CREATE HISTORY ROWS
    // ---------------------------------------------

    claimedCustomers.forEach(
        createRewardHistoryRow
    );

}


// =====================================================
// CREATE REWARD HISTORY ROW
// =====================================================

function createRewardHistoryRow(
    customer
) {

    if (!rewardHistoryTable) {

        return;

    }


    const tr =
        document.createElement("tr");


    // ---------------------------------------------
    // DATE
    // ---------------------------------------------

    const dateTd =
        document.createElement("td");


    dateTd.textContent =
        formatRewardDate(
            customer.rewardClaimedAt
        );


    // ---------------------------------------------
    // CUSTOMER NAME
    // ---------------------------------------------

    const customerTd =
        document.createElement("td");


    customerTd.textContent =
        customer.name || "-";


    // ---------------------------------------------
    // MEMBER ID
    // ---------------------------------------------

    const memberTd =
        document.createElement("td");


    memberTd.textContent =
        customer.memberId ||
        DEFAULT_MEMBER_ID;


    // ---------------------------------------------
    // REWARD NAME
    // ---------------------------------------------

    const rewardTd =
        document.createElement("td");


    rewardTd.textContent =
        customer.rewardName ||
        "FREE VEG MAGGI";


    // ---------------------------------------------
    // STATUS
    // ---------------------------------------------

    const statusTd =
        document.createElement("td");


    const statusBadge =
        document.createElement("span");


    statusBadge.className =
        "reward-history-status claimed";


    statusBadge.textContent =
        "Claimed";


    statusTd.appendChild(
        statusBadge
    );


    // ---------------------------------------------
    // APPEND ROW
    // ---------------------------------------------

    tr.append(

        dateTd,

        customerTd,

        memberTd,

        rewardTd,

        statusTd

    );


    rewardHistoryTable.appendChild(
        tr
    );

}


// =====================================================
// GET FIRESTORE TIMESTAMP VALUE
// =====================================================

function getTimestampValue(
    timestamp
) {

    // ---------------------------------------------
    // EMPTY VALUE
    // ---------------------------------------------

    if (!timestamp) {

        return 0;

    }


    // ---------------------------------------------
    // FIRESTORE TIMESTAMP
    // ---------------------------------------------

    if (
        typeof timestamp.toMillis ===
        "function"
    ) {

        return timestamp.toMillis();

    }


    // ---------------------------------------------
    // FIRESTORE TIMESTAMP OBJECT
    // ---------------------------------------------

    if (
        typeof timestamp.seconds ===
        "number"
    ) {

        return (

            timestamp.seconds *
            1000

        ) + (

            Math.floor(
                timestamp.nanoseconds || 0
            ) /
            1000000

        );

    }


    // ---------------------------------------------
    // JAVASCRIPT DATE
    // ---------------------------------------------

    if (
        timestamp instanceof Date
    ) {

        return timestamp.getTime();

    }


    // ---------------------------------------------
    // NUMBER TIMESTAMP
    // ---------------------------------------------

    if (
        typeof timestamp ===
        "number"
    ) {

        return timestamp;

    }


    // ---------------------------------------------
    // STRING DATE
    // ---------------------------------------------

    if (
        typeof timestamp ===
        "string"
    ) {

        const parsedDate =
            new Date(timestamp)
                .getTime();


        return Number.isNaN(
            parsedDate
        )
            ? 0
            : parsedDate;

    }


    // ---------------------------------------------
    // INVALID VALUE
    // ---------------------------------------------

    return 0;

}


// =====================================================
// FORMAT REWARD DATE
// =====================================================

function formatRewardDate(
    timestamp
) {

    const timestampValue =
        getTimestampValue(
            timestamp
        );


    // ---------------------------------------------
    // DATE NOT AVAILABLE
    // ---------------------------------------------

    if (
        !timestampValue
    ) {

        return "--";

    }


    const date =
        new Date(
            timestampValue
        );


    // ---------------------------------------------
    // INVALID DATE
    // ---------------------------------------------

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--";

    }


    // ---------------------------------------------
    // FORMAT DATE & TIME
    // ---------------------------------------------

    return date.toLocaleString(
        undefined,
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


// =====================================================
// GET CLAIMED REWARD COUNT
// =====================================================

function getClaimedRewardCount() {

    return customers.filter(
        customer =>
            customer.rewardClaimed === true
    ).length;

}


// =====================================================
// GET READY REWARD COUNT
// =====================================================

function getReadyRewardCount() {

    return customers.filter(
        customer =>
            customer.rewardUnlocked === true
    ).length;

}


// =====================================================
// GET TOTAL REWARD RECORDS
// =====================================================

function getTotalRewardCount() {

    return customers.length;

}


// =====================================================
// REWARD HISTORY REFRESH
// =====================================================

function refreshRewardHistory() {

    renderRewardHistory();

}


// =====================================================
// UPDATE HISTORY AFTER CUSTOMER SYNC
// =====================================================

function updateRewardHistoryAfterSync() {

    syncSelectedCustomer();

    renderRewardHistory();

}


// =====================================================
// REWARD HISTORY DEBUG
// =====================================================

function logRewardHistoryStats() {

    console.log(
        "==================================="
    );

    console.log(
        "Reward History Statistics"
    );

    console.log(
        "Total Customers:",
        getTotalRewardCount()
    );

    console.log(
        "Ready Rewards:",
        getReadyRewardCount()
    );

    console.log(
        "Claimed Rewards:",
        getClaimedRewardCount()
    );

    console.log(
        "==================================="
    );

}


// =====================================================
// EXPOSE SAFE HISTORY DEBUG METHODS
// =====================================================

window.rewardManagerHistoryDebug = {

    refresh:
        refreshRewardHistory,

    getTotal:
        getTotalRewardCount,

    getReady:
        getReadyRewardCount,

    getClaimed:
        getClaimedRewardCount,

    logStats:
        logRewardHistoryStats

};


// =====================================================
// PART 3 READY
// =====================================================

console.log(
    "Reward Manager Part 3 Loaded"
);
// =====================================================
// RIO MAGGI POINT
// ADMIN REWARD MANAGER
// PART 4 / 4
// REWARD HISTORY + FILTERS + EXPORT + AUTO REFRESH
// =====================================================


// =====================================================
// REWARD HISTORY
// =====================================================

async function loadRewardHistory() {

    if (!rewardHistoryTable) {
        return;
    }

    rewardHistoryTable.innerHTML = "";

    const claimedCustomers = customers
        .filter(customer => customer.rewardClaimed === true)
        .sort((a, b) => {

            const timeA =
                a.rewardClaimedAt?.seconds ||
                0;

            const timeB =
                b.rewardClaimedAt?.seconds ||
                0;

            return timeB - timeA;

        });

    if (claimedCustomers.length === 0) {

        rewardHistoryTable.innerHTML = `
            <tr>
                <td colspan="5">
                    No Reward History Found
                </td>
            </tr>
        `;

        return;

    }

    claimedCustomers.forEach(customer => {

        const tr = document.createElement("tr");

        const claimedDate =
            formatFirestoreDate(
                customer.rewardClaimedAt
            );

        tr.innerHTML = `

            <td>
                ${claimedDate}
            </td>

            <td>
                ${escapeHTML(
                    customer.name || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    customer.memberId || "-"
                )}
            </td>

            <td>
                FREE VEG MAGGI
            </td>

            <td>
                <span class="reward-status claimed">
                    Claimed
                </span>
            </td>

        `;

        rewardHistoryTable.appendChild(tr);

    });

}


// =====================================================
// DATE FORMATTER
// =====================================================

function formatFirestoreDate(timestamp) {

    if (!timestamp) {
        return "--";
    }

    try {

        let date;

        if (
            typeof timestamp === "object" &&
            typeof timestamp.toDate === "function"
        ) {

            date = timestamp.toDate();

        } else if (
            timestamp.seconds
        ) {

            date =
                new Date(
                    timestamp.seconds * 1000
                );

        } else {

            date =
                new Date(timestamp);

        }

        if (Number.isNaN(date.getTime())) {
            return "--";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        console.error(
            "Date formatting error:",
            error
        );

        return "--";

    }

}


// =====================================================
// SEARCH + FILTER STATE
// =====================================================

let activeRewardFilter = "all";


// =====================================================
// RENDER FILTERED REWARDS
// =====================================================

function renderRewardTable() {

    if (!rewardTable) {
        return;
    }

    const keyword =
        searchRewardCustomer?.value
            ?.trim()
            .toLowerCase() || "";

    let filteredCustomers =
        [...customers];

    // -----------------------------------------------
    // STATUS FILTER
    // -----------------------------------------------

    if (
        activeRewardFilter === "pending"
    ) {

        filteredCustomers =
            filteredCustomers.filter(
                customer =>
                    customer.rewardUnlocked === true
            );

    }

    if (
        activeRewardFilter === "claimed"
    ) {

        filteredCustomers =
            filteredCustomers.filter(
                customer =>
                    customer.rewardClaimed === true
            );

    }

    // -----------------------------------------------
    // SEARCH FILTER
    // -----------------------------------------------

    if (keyword) {

        filteredCustomers =
            filteredCustomers.filter(
                customer => {

                    const name =
                        String(
                            customer.name || ""
                        ).toLowerCase();

                    const memberId =
                        String(
                            customer.memberId || ""
                        ).toLowerCase();

                    const mobile =
                        String(
                            customer.mobile || ""
                        ).toLowerCase();

                    return (
                        name.includes(keyword) ||
                        memberId.includes(keyword) ||
                        mobile.includes(keyword)
                    );

                }
            );

    }

    // -----------------------------------------------
    // CLEAR TABLE
    // -----------------------------------------------

    rewardTable.innerHTML = "";

    // -----------------------------------------------
    // EMPTY STATE
    // -----------------------------------------------

    if (
        filteredCustomers.length === 0
    ) {

        rewardTable.innerHTML = `

            <tr>

                <td colspan="7">

                    No customers found

                </td>

            </tr>

        `;

        return;

    }

    // -----------------------------------------------
    // CREATE ROWS
    // -----------------------------------------------

    filteredCustomers.forEach(
        createRewardRow
    );

}


// =====================================================
// SEARCH EVENT
// =====================================================

searchRewardCustomer?.addEventListener(
    "input",
    () => {

        activeRewardFilter = "all";

        renderRewardTable();

    }
);


// =====================================================
// PENDING REWARDS
// =====================================================

pendingRewardBtn?.addEventListener(
    "click",
    () => {

        activeRewardFilter = "pending";

        renderRewardTable();

    }
);


// =====================================================
// CLAIMED REWARDS
// =====================================================

claimedRewardBtn?.addEventListener(
    "click",
    () => {

        activeRewardFilter = "claimed";

        renderRewardTable();

    }
);


// =====================================================
// EXPORT REWARDS
// =====================================================

exportRewardBtn?.addEventListener(
    "click",
    () => {

        if (
            customers.length === 0
        ) {

            alert(
                "No reward data available for export."
            );

            return;

        }

        const headers = [
            "Name",
            "Member ID",
            "Mobile",
            "Stamps",
            "Reward Ready",
            "Reward Claimed",
            "Reward Claimed At"
        ];

        const rows =
            customers.map(
                customer => [

                    customer.name || "",

                    customer.memberId || "",

                    customer.mobile || "",

                    customer.stamps || 0,

                    customer.rewardUnlocked
                        ? "Yes"
                        : "No",

                    customer.rewardClaimed
                        ? "Yes"
                        : "No",

                    formatFirestoreDate(
                        customer.rewardClaimedAt
                    )

                ]
            );

        const csvData = [

            headers,

            ...rows

        ]

        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(value)
                                .replace(/"/g, '""')}"`
                    )
                    .join(",")
        )
        .join("\n");

        const blob =
            new Blob(
                [csvData],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `rio-maggi-rewards-${Date.now()}.csv`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    }
);


// =====================================================
// REFRESH BUTTON
// =====================================================

refreshRewardBtn?.addEventListener(
    "click",
    async () => {

        if (
            refreshRewardBtn.disabled
        ) {

            return;

        }

        try {

            refreshRewardBtn.disabled = true;

            refreshRewardBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading...
            `;

            activeRewardFilter = "all";

            await loadRewards();

            await loadRewardHistory();

        } catch (error) {

            console.error(
                "Refresh failed:",
                error
            );

            alert(
                "Unable to refresh rewards."
            );

        } finally {

            refreshRewardBtn.disabled = false;

            refreshRewardBtn.innerHTML = `
                <i class="fa-solid fa-rotate"></i>
                Refresh
            `;

        }

    }
);


// =====================================================
// BACK TO ADMIN DASHBOARD
// =====================================================

backDashboard?.addEventListener(
    "click",
    () => {

        window.location.href =
            "admin-dashboard.html";

    }
);


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "admin-login.html";

        } catch (error) {

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


// =====================================================
// AUTO REFRESH
// =====================================================

const REWARD_AUTO_REFRESH_TIME =
    60 * 1000;

setInterval(
    async () => {

        if (
            document.hidden
        ) {

            return;

        }

        try {

            await loadRewards();

            await loadRewardHistory();

        } catch (error) {

            console.error(
                "Auto refresh failed:",
                error
            );

        }

    },
    REWARD_AUTO_REFRESH_TIME
);


// =====================================================
// INITIAL PAGE READY
// =====================================================

window.addEventListener(
    "load",
    () => {

        console.log(
            "==================================="
        );

        console.log(
            "🎁 Rio Maggi Point"
        );

        console.log(
            "Reward Manager Ready"
        );

        console.log(
            "Firebase Connected"
        );

        console.log(
            "==================================="
        );

    }
);


// =====================================================
// HTML SECURITY HELPER
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// FINAL
// =====================================================

console.log(
    "✅ Admin Reward Manager Part 4 Loaded"
);
