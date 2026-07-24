// ======================================
// RIO MAGGI POINT
// ADMIN DASHBOARD
// FINAL CLEAN VERSION
// ======================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================
// HTML ELEMENTS
// ======================================

const adminName =
    document.getElementById("adminName");

const totalCustomers =
    document.getElementById("totalCustomers");

const totalStamps =
    document.getElementById("totalStamps");

const rewardUnlocked =
    document.getElementById("rewardUnlocked");

const rewardRedeemed =
    document.getElementById("rewardRedeemed");

const customerTable =
    document.getElementById("customerTable");

const firebaseStatus =
    document.getElementById("firebaseStatus");

const adminStatus =
    document.getElementById("adminStatus");

const lastRefresh =
    document.getElementById("lastRefresh");

const logoutBtn =
    document.getElementById("logoutBtn");

const refreshBtn =
    document.getElementById("refreshDataBtn");

const searchInput =
    document.getElementById("searchCustomer");

const customerModal =
    document.getElementById("customerModal");

const customerInfo =
    document.getElementById("customerInfo");

const closeModal =
    document.querySelector(".closeModal");

const exportBtn =
    document.getElementById("exportBtn");

const rewardListBtn =
    document.getElementById("rewardListBtn");

const settingsBtn =
    document.getElementById("settingsBtn");


// ======================================
// GLOBAL DATA
// ======================================

let customersData = [];


// ======================================
// ADMIN AUTH CHECK
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "admin-login.html";

        return;

    }

    try {

        firebaseStatus.textContent =
            "Connected";

        const adminRef =
            doc(db, "admins", user.uid);

        const adminSnap =
            await getDoc(adminRef);


        if (!adminSnap.exists()) {

            alert(
                "Access Denied. Admin account not found."
            );

            await signOut(auth);

            window.location.href =
                "admin-login.html";

            return;

        }


        const admin =
            adminSnap.data();


        adminName.textContent =
            admin.name || "Admin";


        adminStatus.textContent =
            "Verified";


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Admin Authentication Error:",
            error
        );

        firebaseStatus.textContent =
            "Error";

        adminStatus.textContent =
            "Failed";

    }

});


// ======================================
// LOAD DASHBOARD
// ======================================

async function loadDashboard() {

    try {

        lastRefresh.textContent =
            new Date().toLocaleString();


        const snapshot =
            await getDocs(
                collection(db, "customers")
            );


        customersData = [];


        let totalStampCount = 0;

        let unlockedCount = 0;

        let redeemedCount = 0;


        snapshot.forEach((customerDoc) => {

            const customer =
                customerDoc.data();


            const customerObject = {

                id: customerDoc.id,

                ...customer

            };


            customersData.push(
                customerObject
            );


            const stamps =
                Number(customer.stamps || 0);


            totalStampCount +=
                stamps;


            if (
                customer.rewardUnlocked === true
            ) {

                unlockedCount++;

            }


            if (
                customer.rewardRedeemed === true
            ) {

                redeemedCount++;

            }

        });


        totalCustomers.textContent =
            customersData.length;


        totalStamps.textContent =
            totalStampCount;


        rewardUnlocked.textContent =
            unlockedCount;


        rewardRedeemed.textContent =
            redeemedCount;


        renderCustomerTable(
            customersData
        );


        firebaseStatus.textContent =
            "Connected";

    }

    catch (error) {

        console.error(
            "Dashboard Load Error:",
            error
        );


        firebaseStatus.textContent =
            "Error";


        alert(
            "Unable to load customer data."
        );

    }

}


// ======================================
// RENDER CUSTOMER TABLE
// ======================================

function renderCustomerTable(customers) {

    customerTable.innerHTML = "";


    if (customers.length === 0) {

        customerTable.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center;"
                >

                    No Customers Found

                </td>

            </tr>

        `;

        return;

    }


    customers.forEach((customer) => {

        const row =
            document.createElement("tr");


        const name =
            customer.name || "-";


        const mobile =
            customer.mobile || "-";


        const memberId =
            customer.memberId || "-";


        const stamps =
            Number(customer.stamps || 0);


        const rewardStatus =
            customer.rewardUnlocked === true

                ? "🎁 Unlocked"

                : "❌ Locked";


        row.innerHTML = `

            <td>
                ${escapeHTML(name)}
            </td>

            <td>
                ${escapeHTML(mobile)}
            </td>

            <td>
                ${escapeHTML(memberId)}
            </td>

            <td>
                ${stamps} / 6
            </td>

            <td>
                ${rewardStatus}
            </td>

            <td>

                <button
                    class="viewBtn"
                    data-id="${customer.id}"
                >

                    View

                </button>

            </td>

        `;


        customerTable.appendChild(
            row
        );

    });

}


// ======================================
// SEARCH CUSTOMER
// ======================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const value =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!value) {

                renderCustomerTable(
                    customersData
                );

                return;

            }


            const filtered =
                customersData.filter(
                    (customer) => {

                        return (

                            String(
                                customer.name || ""
                            )
                            .toLowerCase()
                            .includes(value)

                            ||

                            String(
                                customer.mobile || ""
                            )
                            .toLowerCase()
                            .includes(value)

                            ||

                            String(
                                customer.memberId || ""
                            )
                            .toLowerCase()
                            .includes(value)

                            ||

                            String(
                                customer.email || ""
                            )
                            .toLowerCase()
                            .includes(value)

                        );

                    }
                );


            renderCustomerTable(
                filtered
            );

        }
    );

}


// ======================================
// REFRESH DASHBOARD
// ======================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            refreshBtn.disabled =
                true;


            refreshBtn.textContent =
                "🔄 Loading...";


            await loadDashboard();


            refreshBtn.disabled =
                false;


            refreshBtn.textContent =
                "🔄 Refresh Data";

        }
    );

}


// ======================================
// CUSTOMER TABLE CLICK
// VIEW CUSTOMER DETAILS
// ======================================

if (customerTable) {

    customerTable.addEventListener(
        "click",
        async (event) => {

            const viewButton =
                event.target.closest(
                    ".viewBtn"
                );


            if (!viewButton) {

                return;

            }


            const customerId =
                viewButton.dataset.id;


            await showCustomerDetails(
                customerId
            );

        }
    );

}


// ======================================
// SHOW CUSTOMER DETAILS
// ======================================

async function showCustomerDetails(
    customerId
) {

    try {

        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );


        const customerSnap =
            await getDoc(
                customerRef
            );


        if (
            !customerSnap.exists()
        ) {

            alert(
                "Customer not found."
            );

            return;

        }


        const customer =
            customerSnap.data();


        const stamps =
            Number(
                customer.stamps || 0
            );


        customerInfo.innerHTML = `

            <p>
                <strong>Name:</strong>
                ${escapeHTML(
                    customer.name || "-"
                )}
            </p>

            <p>
                <strong>Mobile:</strong>
                ${escapeHTML(
                    customer.mobile || "-"
                )}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(
                    customer.email || "-"
                )}
            </p>

            <p>
                <strong>Member ID:</strong>
                ${escapeHTML(
                    customer.memberId || "-"
                )}
            </p>

            <p>
                <strong>Gender:</strong>
                ${escapeHTML(
                    customer.gender || "-"
                )}
            </p>

            <p>
                <strong>Stamps:</strong>
                ${stamps} / 6
            </p>

            <p>
                <strong>Reward Unlocked:</strong>
                ${
                    customer.rewardUnlocked
                        ? "🎁 Yes"
                        : "❌ No"
                }
            </p>

            <p>
                <strong>Reward Redeemed:</strong>
                ${
                    customer.rewardRedeemed
                        ? "✅ Yes"
                        : "❌ No"
                }
            </p>

            <hr>

            <div
                style="
                    margin-top:15px;
                    display:grid;
                    gap:10px;
                "
            >

                <button
                    id="addStampAdminBtn"
                    data-id="${customerId}"
                >

                    ⭐ Add 1 Stamp

                </button>


                <button
                    id="removeStampAdminBtn"
                    data-id="${customerId}"
                >

                    ➖ Remove 1 Stamp

                </button>


                ${
                    customer.rewardUnlocked

                    ? `

                    <button
                        id="redeemRewardAdminBtn"
                        data-id="${customerId}"
                    >

                        🎁 Redeem Free Maggi

                    </button>

                    `

                    : ""

                }

            </div>

        `;


        customerModal.style.display =
            "block";


        setupCustomerActionButtons(
            customerId,
            customer
        );

    }

    catch (error) {

        console.error(
            "Customer Details Error:",
            error
        );


        alert(
            "Unable to load customer details."
        );

    }

}


// ======================================
// CUSTOMER ACTION BUTTONS
// ======================================

function setupCustomerActionButtons(
    customerId,
    customer
) {

    const addBtn =
        document.getElementById(
            "addStampAdminBtn"
        );


    const removeBtn =
        document.getElementById(
            "removeStampAdminBtn"
        );


    const redeemBtn =
        document.getElementById(
            "redeemRewardAdminBtn"
        );


    if (addBtn) {

        addBtn.addEventListener(
            "click",
            async () => {

                await addStamp(
                    customerId
                );

            }
        );

    }


    if (removeBtn) {

        removeBtn.addEventListener(
            "click",
            async () => {

                await removeStamp(
                    customerId
                );

            }
        );

    }


    if (redeemBtn) {

        redeemBtn.addEventListener(
            "click",
            async () => {

                await redeemReward(
                    customerId
                );

            }
        );

    }

}


// ======================================
// ADD STAMP
// ======================================

async function addStamp(
    customerId
) {

    try {

        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );


        const customerSnap =
            await getDoc(
                customerRef
            );


        if (
            !customerSnap.exists()
        ) {

            alert(
                "Customer not found."
            );

            return;

        }


        const customer =
            customerSnap.data();


        const currentStamps =
            Number(
                customer.stamps || 0
            );


        if (
            currentStamps >= 6
        ) {

            alert(
                "Customer already has 6 stamps. Reward is ready to redeem."
            );

            return;

        }


        const newStampCount =
            currentStamps + 1;


        await updateDoc(
            customerRef,
            {

                stamps:
                    newStampCount,

                rewardUnlocked:
                    newStampCount >= 6,

                rewardRedeemed:
                    false,

                updatedAt:
                    serverTimestamp()

            }
        );


        if (
            newStampCount >= 6
        ) {

            alert(
                "🎉 6 Stamps Complete! Free Maggi Reward Unlocked!"
            );

        }

        else {

            alert(
                "⭐ 1 Stamp Added Successfully!"
            );

        }


        customerModal.style.display =
            "none";


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Add Stamp Error:",
            error
        );


        alert(
            "Unable to add stamp."
        );

    }

}


// ======================================
// REMOVE STAMP
// ======================================

async function removeStamp(
    customerId
) {

    try {

        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );


        const customerSnap =
            await getDoc(
                customerRef
            );


        if (
            !customerSnap.exists()
        ) {

            alert(
                "Customer not found."
            );

            return;

        }


        const customer =
            customerSnap.data();


        const currentStamps =
            Number(
                customer.stamps || 0
            );


        if (
            currentStamps <= 0
        ) {

            alert(
                "Customer has 0 stamps."
            );

            return;

        }


        const newStampCount =
            currentStamps - 1;


        await updateDoc(
            customerRef,
            {

                stamps:
                    newStampCount,

                rewardUnlocked:
                    false,

                rewardRedeemed:
                    false,

                updatedAt:
                    serverTimestamp()

            }
        );


        alert(
            "➖ 1 Stamp Removed."
        );


        customerModal.style.display =
            "none";


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Remove Stamp Error:",
            error
        );


        alert(
            "Unable to remove stamp."
        );

    }

}


// ======================================
// REDEEM REWARD
// ======================================

async function redeemReward(
    customerId
) {

    const confirmRedeem =
        confirm(
            "Confirm that the customer received the FREE Veg Maggi?"
        );


    if (!confirmRedeem) {

        return;

    }


    try {

        const customerRef =
            doc(
                db,
                "customers",
                customerId
            );


        const customerSnap =
            await getDoc(
                customerRef
            );


        if (
            !customerSnap.exists()
        ) {

            alert(
                "Customer not found."
            );

            return;

        }


        const customer =
            customerSnap.data();


        if (
            customer.rewardUnlocked !== true
        ) {

            alert(
                "Reward is not unlocked yet."
            );

            return;

        }


        await updateDoc(
            customerRef,
            {

                stamps:
                    0,

                rewardUnlocked:
                    false,

                rewardRedeemed:
                    true,

                lastRewardRedeemedAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );


        alert(
            "🎁 Reward Redeemed Successfully! Stamps Reset to 0."
        );


        customerModal.style.display =
            "none";


        await loadDashboard();

    }

    catch (error) {

        console.error(
            "Redeem Reward Error:",
            error
        );


        alert(
            "Unable to redeem reward."
        );

    }

}


// ======================================
// LOGOUT
// ======================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            const ok =
                confirm(
                    "Logout from Admin Panel?"
                );


            if (!ok) {

                return;

            }


            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "admin-login.html";

            }

            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                alert(
                    "Logout Failed."
                );

            }

        }
    );

}


// ======================================
// CLOSE CUSTOMER MODAL
// ======================================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        () => {

            customerModal.style.display =
                "none";

        }
    );

}


window.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            customerModal
        ) {

            customerModal.style.display =
                "none";

        }

    }
);


// ======================================
// EXPORT CUSTOMERS - CSV
// ======================================

if (exportBtn) {

    exportBtn.addEventListener(
        "click",
        () => {

            if (
                customersData.length === 0
            ) {

                alert(
                    "No customer data available for export."
                );

                return;

            }


            const headers = [

                "Name",

                "Mobile",

                "Email",

                "Member ID",

                "Gender",

                "Stamps",

                "Reward Unlocked",

                "Reward Redeemed"

            ];


            const rows =
                customersData.map(
                    (customer) => [

                        customer.name || "",

                        customer.mobile || "",

                        customer.email || "",

                        customer.memberId || "",

                        customer.gender || "",

                        customer.stamps || 0,

                        customer.rewardUnlocked
                            ? "Yes"
                            : "No",

                        customer.rewardRedeemed
                            ? "Yes"
                            : "No"

                    ]
                );


            const csvContent = [

                headers,

                ...rows

            ]

            .map(
                (row) =>
                    row
                        .map(
                            (value) =>
                                `"${String(value)
                                    .replace(
                                        /"/g,
                                        '""'
                                    )}"`
                        )
                        .join(",")
            )

            .join("\n");


            const blob =
                new Blob(
                    [csvContent],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                "rio-maggi-customers.csv";


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );

        }
    );

}


// ======================================
// REWARD LIST
// ======================================

if (rewardListBtn) {

    rewardListBtn.addEventListener(
        "click",
        () => {

            const rewards =
                customersData.filter(
                    (customer) =>
                        customer.rewardUnlocked === true
                );


            if (
                rewards.length === 0
            ) {

                alert(
                    "🎁 No rewards are currently waiting for redemption."
                );

                return;

            }


            const names =
                rewards.map(
                    (customer, index) =>

                        `${index + 1}. ${
                            customer.name || "Customer"
                        } - ${
                            customer.mobile || "No Mobile"
                        }`

                )
                .join("\n");


            alert(
                `🎁 REWARD LIST\n\n${names}`
            );

        }
    );

}


// ======================================
// SETTINGS
// ======================================

if (settingsBtn) {

    settingsBtn.addEventListener(
        "click",
        () => {

            alert(
                "⚙️ Settings section will be added in the next phase."
            );

        }
    );

}


// ======================================
// ESCAPE HTML
// ======================================

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


// ======================================
// STARTUP
// ======================================

console.log(
    "==================================="
);

console.log(
    "RIO MAGGI POINT"
);

console.log(
    "ADMIN DASHBOARD LOADED SUCCESSFULLY"
);

console.log(
    "Firebase Dashboard Ready"
);

console.log(
    "==================================="
);
