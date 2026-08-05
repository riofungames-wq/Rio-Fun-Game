// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 1 OF 4 (FIXED)
//
// RESPONSIBILITY:
// - Firebase Configuration Import
// - Firestore Imports
// - Authentication Import
// - Application Constants
// - DOM References
// - Global Application State
// - Safe Customer Helpers
// - Loyalty Rule Helpers Foundation
// - Modal Foundation
//
// NO:
// - Event Listeners
// - Auth Listener
// - Customer Loading
// - Table Rendering
// - Action Handlers
//
// =====================================================


// =====================================================
// FIREBASE CONFIG
// =====================================================

import {
    auth,
    db
} from "./firebase-config.js";


// =====================================================
// FIRESTORE IMPORTS
// =====================================================

import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// FIREBASE AUTH IMPORT
// =====================================================

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// APPLICATION CONSTANTS
// =====================================================

const MAX_STAMPS = 6;

const LOYALTY_VALIDITY_DAYS = 40;

const CUSTOMER_COLLECTION = "customers";

const STAMP_HISTORY_COLLECTION = "stampHistory";

const ADMIN_LOGIN_PAGE = "admin-login.html";

const ADMIN_DASHBOARD_PAGE = "admin-dashboard.html";

const CUSTOMER_AUTO_REFRESH_INTERVAL = 30000;


// =====================================================
// DEFAULT AVATARS
// =====================================================

const DEFAULT_MALE_AVATAR =
    "assets/avatars/male.png";

const DEFAULT_FEMALE_AVATAR =
    "assets/avatars/female.png";


// =====================================================
// DOM REFERENCES
// =====================================================


// Customer table
const customerTable =
    document.getElementById("customerTable");


// Search
const searchCustomer =
    document.getElementById("searchCustomer");


// Refresh
const refreshBtn =
    document.getElementById("refreshBtn");


// Statistics

const totalCustomers =
    document.getElementById("totalCustomers");

const rewardReady =
    document.getElementById("rewardReady");

const todayJoined =
    document.getElementById("todayJoined");


// Modal

const customerModal =
    document.getElementById("customerModal");


const closeModalBtn =
    document.getElementById("closeModal");


// Modal Details

const modalPhoto =
    document.getElementById("modalPhoto");

const modalName =
    document.getElementById("modalName");

const modalMember =
    document.getElementById("modalMember");

const modalMobile =
    document.getElementById("modalMobile");

const modalStamp =
    document.getElementById("modalStamp");

const modalReward =
    document.getElementById("modalReward");


// Action Buttons

const giveStampBtn =
    document.getElementById("giveStampBtn");


const removeStampBtn =
    document.getElementById("removeStampBtn");


const unlockRewardBtn =
    document.getElementById("unlockRewardBtn");


const deleteCustomerBtn =
    document.getElementById("deleteCustomerBtn");


// Future secure reset button
const resetLoyaltyBtn =
    document.getElementById("resetLoyaltyBtn");


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================


let customers = [];

let selectedCustomer = null;

let authenticatedUser = null;


let customersLoading = false;

let refreshProcessing = false;

let customerRefreshProcessing = false;


let customerActionProcessing = false;


let giveStampProcessing = false;

let removeStampProcessing = false;

let unlockRewardProcessing = false;

let resetLoyaltyProcessing = false;

let deleteCustomerProcessing = false;


let customerAutoRefreshTimer = null;


let customerPageInitialized = false;


// =====================================================
// SAFE VALUE HELPERS
// =====================================================


function getCustomerMobile(customer){

    if(!customer) return "-";

    const mobile =
        customer.mobile ||
        customer.phone ||
        customer.phoneNumber ||
        "";

    return String(mobile).trim() || "-";
}



function getCustomerName(customer){

    if(!customer)
        return "Unknown Customer";


    return String(customer.name || "").trim()
        || "Unknown Customer";
}



function getCustomerMemberId(customer){

    if(!customer)
        return "RIO-000000";


    return String(customer.memberId || "").trim()
        || "RIO-000000";
}



function getCustomerStamps(customer){

    if(!customer)
        return 0;


    const value =
        Number(customer.stamps);


    if(!Number.isFinite(value))
        return 0;


    return Math.min(
        Math.max(Math.floor(value),0),
        MAX_STAMPS
    );
}



function escapeHtml(value){

    if(value === null || value === undefined)
        return "";


    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}



// =====================================================
// AVATAR HELPER
// =====================================================


function getCustomerAvatar(customer){

    if(!customer)
        return DEFAULT_MALE_AVATAR;


    const photos = [
        customer.photoURL,
        customer.photoUrl,
        customer.photo,
        customer.avatar
    ];


    const valid =
        photos.find(
            item =>
            typeof item === "string" &&
            item.trim() !== ""
        );


    if(valid)
        return valid;



    const gender =
        String(customer.gender || "")
        .toLowerCase();


    if(
        gender === "female" ||
        gender === "girl" ||
        gender === "woman"
    ){
        return DEFAULT_FEMALE_AVATAR;
    }


    return DEFAULT_MALE_AVATAR;
}


// =====================================================
// DATE HELPERS
// =====================================================


function getTodayKey(){

    const date = new Date();


    return `${date.getFullYear()}-${
        String(date.getMonth()+1).padStart(2,"0")
    }-${
        String(date.getDate()).padStart(2,"0")
    }`;
}



function toSafeDate(value){

    if(!value)
        return null;


    if(typeof value.toDate === "function"){

        const date = value.toDate();

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }


    const date = new Date(value);


    return Number.isNaN(date.getTime())
        ? null
        : date;
}



// =====================================================
// LOYALTY FOUNDATION HELPERS
// =====================================================


function isRewardReady(customer){

    if(!customer)
        return false;


    return (
        customer.rewardUnlocked === true ||
        getCustomerStamps(customer) >= MAX_STAMPS
    );
}



function hasStampToday(customer){

    if(!customer)
        return false;


    const today =
        getTodayKey();


    return (
        customer.dailyStampDate === today ||
        customer.lastStampDate === today
    );
}



function isCycleExpired(customer){

    if(!customer)
        return false;


    const expiry =
        toSafeDate(customer.cycleExpiryAt);


    if(!expiry)
        return false;


    return expiry.getTime() < Date.now();
}



function calculateCycleExpiry(startDate){

    const date =
        new Date(startDate);


    date.setDate(
        date.getDate()+LOYALTY_VALIDITY_DAYS
    );


    return date;
}



// =====================================================
// MODAL FOUNDATION
// =====================================================


function setCustomerModalVisible(status){

    if(!customerModal)
        return;


    customerModal.style.display =
        status ? "flex" : "none";
}



function resetCustomerModal(){

    selectedCustomer = null;


    if(modalPhoto){

        modalPhoto.src =
            DEFAULT_MALE_AVATAR;

        modalPhoto.alt =
            "Customer Photo";
    }


    if(modalName)
        modalName.textContent =
        "Customer Name";


    if(modalMember)
        modalMember.textContent =
        "RIO-000000";


    if(modalMobile)
        modalMobile.textContent =
        "-";


    if(modalStamp)
        modalStamp.textContent =
        `0 / ${MAX_STAMPS}`;


    if(modalReward)
        modalReward.textContent =
        "Locked";
}



function closeCustomerModal(){

    setCustomerModalVisible(false);

    resetCustomerModal();
}


if(customerModal){

    customerModal.style.display="none";

}


resetCustomerModal();



console.log(
"🍜 RIO MAGGI POINT - Admin Customers Part 1 Fixed Loaded"
);


// END PART 1
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 2 OF 4 (FIXED)
//
// RESPONSIBILITY:
// - Load Customers From Firestore
// - Sort Customers
// - Render Customer Table
// - Search Filtering
// - Statistics Update
// - Fresh Customer Fetch
// - Local State Update
// - Modal Data Update
//
// =====================================================


// =====================================================
// LOAD CUSTOMERS FROM FIRESTORE
// =====================================================

async function loadCustomers(){

    if(customersLoading)
        return;


    customersLoading = true;


    if(customerTable){

        customerTable.innerHTML = `
            <tr>
                <td colspan="7"
                class="empty-table-message">
                    Loading Customers...
                </td>
            </tr>
        `;
    }


    try{


        const customerRef =
            collection(
                db,
                CUSTOMER_COLLECTION
            );


        let snapshot;


        try{

            const orderedQuery =
                query(
                    customerRef,
                    orderBy(
                        "createdAt",
                        "desc"
                    )
                );


            snapshot =
                await getDocs(
                    orderedQuery
                );


        }catch(error){


            console.warn(
                "Ordered customer fetch failed. Using fallback.",
                error
            );


            snapshot =
                await getDocs(
                    customerRef
                );

        }



        const loadedCustomers = [];



        snapshot.forEach(item=>{


            loadedCustomers.push({

                ...item.data(),

                uid:item.id

            });


        });



        // Safe local sorting

        loadedCustomers.sort(
            (a,b)=>{


                const dateA =
                    toSafeDate(
                        a.createdAt
                    );


                const dateB =
                    toSafeDate(
                        b.createdAt
                    );


                if(!dateA && !dateB)
                    return 0;


                if(!dateA)
                    return 1;


                if(!dateB)
                    return -1;


                return (
                    dateB.getTime()
                    -
                    dateA.getTime()
                );

            }
        );



        customers =
            loadedCustomers;



        updateCustomerStats();


        refreshCustomerTable();



        // Restore modal customer

        if(
            selectedCustomer &&
            selectedCustomer.uid
        ){


            const updated =
                customers.find(
                    item =>
                    item.uid === selectedCustomer.uid
                );



            if(updated){

                selectedCustomer =
                    updated;


                updateCustomerModal(
                    updated,
                    false
                );

            }
            else{

                closeCustomerModal();

            }

        }



        console.log(
            `✅ ${customers.length} Customers Loaded`
        );


    }catch(error){


        console.error(
            "❌ Customer Load Error:",
            error
        );


        customers=[];


        updateCustomerStats();



        if(customerTable){

            customerTable.innerHTML=`

            <tr>
                <td colspan="7"
                class="empty-table-message">

                Unable To Load Customers

                <br>

                <small>
                Please refresh again.
                </small>

                </td>
            </tr>

            `;
        }


    }
    finally{

        customersLoading=false;

    }

}




// =====================================================
// CREATE CUSTOMER TABLE ROW
// =====================================================

function createCustomerRow(customer){


    if(!customerTable || !customer)
        return;



    const uid =
        String(customer.uid || "");



    if(!uid)
        return;



    const name =
        getCustomerName(customer);


    const memberId =
        getCustomerMemberId(customer);


    const mobile =
        getCustomerMobile(customer);



    const stamps =
        getCustomerStamps(customer);



    const rewardStatus =
        isRewardReady(customer);



    const expired =
        isCycleExpired(customer);



    const avatar =
        getCustomerAvatar(customer);



    const row =
        document.createElement("tr");



    row.innerHTML = `

        <td>

            <img
            src="${escapeHtml(avatar)}"
            alt="${escapeHtml(name)}"
            loading="lazy"
            class="customer-avatar">

        </td>


        <td>
            ${escapeHtml(name)}
        </td>


        <td>
            ${escapeHtml(memberId)}
        </td>


        <td>
            ${escapeHtml(mobile)}
        </td>


        <td>

            ${stamps} / ${MAX_STAMPS}

            ${
                expired
                ?
                `<br>
                <small>
                ⏳ Expired
                </small>`
                :
                ""
            }

        </td>


        <td>

            <span class="
            customer-status
            ${rewardStatus ? "ready":"locked"}
            ">

            ${
                rewardStatus
                ?
                "🟢 Reward Ready"
                :
                "🔒 Locked"
            }

            </span>


        </td>


        <td>


            <button
            type="button"
            class="actionBtn"
            data-uid="${escapeHtml(uid)}">

                View

            </button>


        </td>

    `;



    const button =
        row.querySelector(".actionBtn");



    button?.addEventListener(
        "click",
        ()=>{


            const target =
                customers.find(
                    item =>
                    item.uid===uid
                );


            if(target){

                updateCustomerModal(
                    target,
                    true
                );

            }


        }
    );



    customerTable.appendChild(row);

}



// =====================================================
// REFRESH CUSTOMER TABLE
// =====================================================

function refreshCustomerTable(){


    if(!customerTable)
        return;



    customerTable.innerHTML="";



    const keyword =
        searchCustomer
        ?
        searchCustomer.value
        .trim()
        .toLowerCase()
        :
        "";



    const filtered =
        customers.filter(customer=>{


            if(!keyword)
                return true;



            const name =
                String(customer.name||"")
                .toLowerCase();



            const email =
                String(customer.email||"")
                .toLowerCase();



            const member =
                String(customer.memberId||"")
                .toLowerCase();



            const mobile =
                getCustomerMobile(customer)
                .toLowerCase();



            return (

                name.includes(keyword)
                ||
                email.includes(keyword)
                ||
                member.includes(keyword)
                ||
                mobile.includes(keyword)

            );


        });



    if(filtered.length===0){


        customerTable.innerHTML=`

        <tr>

        <td colspan="7"
        class="empty-table-message">

        ${
            keyword
            ?
            "No Customers Found"
            :
            "No Customers Available"
        }


        </td>

        </tr>

        `;


        return;

    }



    filtered.forEach(
        createCustomerRow
    );

}





// =====================================================
// UPDATE CUSTOMER STATISTICS
// =====================================================

function updateCustomerStats(){


    if(totalCustomers){

        totalCustomers.textContent =
            customers.length;

    }



    if(rewardReady){


        rewardReady.textContent =

            customers.filter(
                customer =>
                isRewardReady(customer)
            ).length;


    }



    if(todayJoined){


        const today =
            new Date();



        const count =
            customers.filter(customer=>{


                const created =
                    toSafeDate(
                        customer.createdAt
                    );


                if(!created)
                    return false;



                return (

                    created.getDate()
                    ===
                    today.getDate()

                    &&
                    created.getMonth()
                    ===
                    today.getMonth()

                    &&
                    created.getFullYear()
                    ===
                    today.getFullYear()

                );


            }).length;



        todayJoined.textContent =
            count;

    }

}





// =====================================================
// GET FRESH CUSTOMER
// =====================================================

async function getFreshCustomer(uid){


    if(!uid)
        return null;



    const ref =
        doc(
            db,
            CUSTOMER_COLLECTION,
            uid
        );



    const snap =
        await getDoc(ref);



    if(!snap.exists())
        return null;



    return {

        ...snap.data(),

        uid:snap.id

    };


}





// =====================================================
// UPDATE LOCAL CUSTOMER
// =====================================================

function updateLocalCustomer(customer){


    if(
        !customer ||
        !customer.uid
    )
        return;



    const index =
        customers.findIndex(
            item =>
            item.uid===customer.uid
        );



    if(index===-1){

        customers.push(customer);

        return;

    }



    customers[index]={

        ...customers[index],

        ...customer

    };


}





// =====================================================
// UPDATE CUSTOMER MODAL DATA
// =====================================================

function updateCustomerModal(
    customer,
    showModal=true
){


    if(!customer)
        return;



    selectedCustomer =
        customer;



    if(modalPhoto){

        modalPhoto.src =
            getCustomerAvatar(customer);

        modalPhoto.alt =
            getCustomerName(customer);

    }



    if(modalName)
        modalName.textContent =
        getCustomerName(customer);



    if(modalMember)
        modalMember.textContent =
        getCustomerMemberId(customer);



    if(modalMobile)
        modalMobile.textContent =
        getCustomerMobile(customer);



    if(modalStamp)
        modalStamp.textContent =
        `${getCustomerStamps(customer)}
        / ${MAX_STAMPS}`;



    if(modalReward)
        modalReward.textContent =

        isRewardReady(customer)
        ?
        "Ready"
        :
        "Locked";



    if(
        typeof syncActionButtons === "function"
    ){

        syncActionButtons();

    }



    if(showModal){

        setCustomerModalVisible(true);

    }

}





// =====================================================
// EXPORT PART 2
// =====================================================

window.adminCustomers = {

    ...(window.adminCustomers || {}),


    loadCustomers,

    createCustomerRow,

    refreshCustomerTable,

    updateCustomerStats,

    getFreshCustomer,

    updateLocalCustomer,

    updateCustomerModal

};




console.log(
"🍜 RIO MAGGI POINT - Admin Customers Part 2 Fixed Loaded"
);


// END PART 2
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 3 OF 4 (FIXED)
//
// RESPONSIBILITY:
// - Customer Actions
// - Stamp Management
// - Reward Unlock
// - Loyalty Reset Foundation
// - Delete Customer
// - Modal Controls
//
// =====================================================


// =====================================================
// ACTION BUTTON STATE
// =====================================================

function syncActionButtons(){


    const hasCustomer =
        Boolean(
            selectedCustomer &&
            selectedCustomer.uid
        );



    const stamps =
        hasCustomer
        ?
        getCustomerStamps(selectedCustomer)
        :
        0;



    const stampedToday =
        hasCustomer
        ?
        hasStampToday(selectedCustomer)
        :
        false;



    if(giveStampBtn){

        giveStampBtn.disabled =

            !hasCustomer
            ||
            customerActionProcessing
            ||
            giveStampProcessing
            ||
            stampedToday
            ||
            stamps >= MAX_STAMPS;

    }



    if(removeStampBtn){

        removeStampBtn.disabled =

            !hasCustomer
            ||
            customerActionProcessing
            ||
            removeStampProcessing
            ||
            stamps <=0;

    }



    if(unlockRewardBtn){

        unlockRewardBtn.disabled =

            !hasCustomer
            ||
            customerActionProcessing
            ||
            unlockRewardProcessing
            ||
            selectedCustomer.rewardUnlocked===true;

    }



    if(resetLoyaltyBtn){

        resetLoyaltyBtn.disabled =

            !hasCustomer
            ||
            customerActionProcessing
            ||
            resetLoyaltyProcessing;

    }



    if(deleteCustomerBtn){

        deleteCustomerBtn.disabled =

            !hasCustomer
            ||
            customerActionProcessing
            ||
            deleteCustomerProcessing;

    }

}





// =====================================================
// BUTTON LOADING
// =====================================================

function setActionButtonLoading(
    button,
    loading,
    loadingText
){


    if(!button)
        return;



    if(loading){

        button.disabled=true;

        button.dataset.oldText =
            button.innerHTML;


        button.innerHTML =
        `
        <i class="fa-solid fa-spinner fa-spin"></i>
        ${loadingText}
        `;


    }
    else{


        button.disabled=false;


        button.innerHTML =
            button.dataset.oldText
            ||
            button.innerHTML;

    }

}





// =====================================================
// GIVE STAMP
// =====================================================

async function giveCustomerStamp(){


    if(giveStampProcessing)
        return;



    if(!selectedCustomer)
        return;



    giveStampProcessing=true;

    customerActionProcessing=true;

    syncActionButtons();



    setActionButtonLoading(
        giveStampBtn,
        true,
        "Adding..."
    );



    try{


        const customer =
            await getFreshCustomer(
                selectedCustomer.uid
            );



        if(!customer)
            throw new Error(
                "Customer not found"
            );



        // Same calendar day protection

        if(hasStampToday(customer)){


            alert(
            "Today's stamp already given."
            );


            return;

        }



        let current =
            getCustomerStamps(customer);



        if(current>=MAX_STAMPS){


            alert(
            "Maximum stamps completed."
            );


            return;

        }




        const updateData = {


            stamps:
                current+1,


            dailyStampDate:
                getTodayKey(),


            lastStampDate:
                getTodayKey(),



            updatedAt:
                serverTimestamp()


        };




        // Start 40 day cycle on first stamp

        if(current===0){


            updateData.cycleStartedAt =
                serverTimestamp();



            updateData.cycleExpiryAt =
                calculateCycleExpiry(
                    new Date()
                );


        }





        await updateDoc(

            doc(
                db,
                CUSTOMER_COLLECTION,
                customer.uid
            ),

            updateData

        );





        const updated = {

            ...customer,

            ...updateData,

            stamps:current+1

        };



        updateLocalCustomer(updated);


        selectedCustomer=updated;


        updateCustomerStats();


        refreshCustomerTable();


        updateCustomerModal(
            updated,
            false
        );



        alert(
        "✅ Stamp Added Successfully"
        );



    }
    catch(error){


        console.error(
            "Stamp Error:",
            error
        );


        alert(
        "Unable to add stamp."
        );


    }
    finally{


        giveStampProcessing=false;

        customerActionProcessing=false;


        setActionButtonLoading(
            giveStampBtn,
            false
        );


        syncActionButtons();

    }


}






// =====================================================
// REMOVE STAMP
// =====================================================

async function removeCustomerStamp(){


    if(removeStampProcessing)
        return;



    if(!selectedCustomer)
        return;



    const confirmDelete =
        confirm(
        "Remove one stamp?"
        );


    if(!confirmDelete)
        return;



    removeStampProcessing=true;

    customerActionProcessing=true;



    try{


        const customer =
            await getFreshCustomer(
                selectedCustomer.uid
            );



        if(!customer)
            return;



        const stamps =
            getCustomerStamps(customer);



        if(stamps<=0)
            return;



        await updateDoc(

            doc(
                db,
                CUSTOMER_COLLECTION,
                customer.uid
            ),

            {

                stamps:stamps-1,

                updatedAt:
                serverTimestamp()

            }

        );



        const updated={

            ...customer,

            stamps:stamps-1

        };



        updateLocalCustomer(updated);

        selectedCustomer=updated;


        updateCustomerStats();

        refreshCustomerTable();

        updateCustomerModal(
            updated,
            false
        );



    }
    catch(error){

        console.error(
        error
        );

    }
    finally{


        removeStampProcessing=false;

        customerActionProcessing=false;

        syncActionButtons();

    }

}





// =====================================================
// UNLOCK REWARD
// =====================================================

async function unlockCustomerReward(){


    if(unlockRewardProcessing)
        return;



    if(!selectedCustomer)
        return;



    unlockRewardProcessing=true;

    customerActionProcessing=true;



    try{


        const customer =
            await getFreshCustomer(
                selectedCustomer.uid
            );



        if(
            getCustomerStamps(customer)
            <
            MAX_STAMPS
        ){

            alert(
            "Complete 6 stamps first."
            );

            return;

        }




        await updateDoc(

            doc(
                db,
                CUSTOMER_COLLECTION,
                customer.uid
            ),

            {

                rewardUnlocked:true,


                rewardUnlockedAt:
                serverTimestamp(),


                updatedAt:
                serverTimestamp()

            }

        );



        const updated={

            ...customer,

            rewardUnlocked:true

        };



        updateLocalCustomer(updated);

        selectedCustomer=updated;


        updateCustomerStats();

        refreshCustomerTable();

        updateCustomerModal(
            updated,
            false
        );


        alert(
        "🎁 Reward Unlocked"
        );


    }
    catch(error){


        console.error(error);


    }
    finally{


        unlockRewardProcessing=false;

        customerActionProcessing=false;


        syncActionButtons();

    }

}





// =====================================================
// RESET LOYALTY FOUNDATION
// =====================================================

async function resetCustomerLoyalty(){


    if(resetLoyaltyProcessing)
        return;



    if(!selectedCustomer)
        return;



    const ok =
        confirm(
        "Reset loyalty cycle?"
        );


    if(!ok)
        return;



    resetLoyaltyProcessing=true;


    try{


        await updateDoc(

            doc(
                db,
                CUSTOMER_COLLECTION,
                selectedCustomer.uid
            ),

            {


            stamps:0,


            rewardUnlocked:false,


            cycleStartedAt:null,


            cycleExpiryAt:null,


            updatedAt:
            serverTimestamp()


            }

        );



        await refreshSelectedCustomer();



        alert(
        "Loyalty Cycle Reset"
        );



    }
    catch(error){


        console.error(error);


    }
    finally{


        resetLoyaltyProcessing=false;

        syncActionButtons();

    }


}





// =====================================================
// DELETE CUSTOMER
// =====================================================

async function deleteSelectedCustomer(){


    if(deleteCustomerProcessing)
        return;



    if(!selectedCustomer)
        return;



    const ok =
        confirm(
        "Delete customer permanently?"
        );



    if(!ok)
        return;



    deleteCustomerProcessing=true;


    try{


        await deleteDoc(

            doc(
                db,
                CUSTOMER_COLLECTION,
                selectedCustomer.uid
            )

        );



        customers =
            customers.filter(
                item =>
                item.uid !== selectedCustomer.uid
            );



        closeCustomerModal();


        updateCustomerStats();


        refreshCustomerTable();



    }
    catch(error){

        console.error(error);

    }
    finally{


        deleteCustomerProcessing=false;

        syncActionButtons();

    }


}




// =====================================================
// REFRESH SELECTED CUSTOMER
// =====================================================

async function refreshSelectedCustomer(){


    if(
        !selectedCustomer ||
        !selectedCustomer.uid
    )
        return;



    const fresh =
        await getFreshCustomer(
            selectedCustomer.uid
        );



    if(!fresh){

        closeCustomerModal();

        return;

    }



    selectedCustomer=fresh;


    updateLocalCustomer(fresh);


    updateCustomerModal(
        fresh,
        false
    );

}





// =====================================================
// EXPORT PART 3
// =====================================================

window.adminCustomers={

...(window.adminCustomers||{}),

syncActionButtons,

setActionButtonLoading,

giveCustomerStamp,

removeCustomerStamp,

unlockCustomerReward,

resetCustomerLoyalty,

deleteSelectedCustomer,

refreshSelectedCustomer,

closeCustomerModal

};



console.log(
"🍜 RIO MAGGI POINT - Admin Customers Part 3 Fixed Loaded"
);


// END PART 3
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 4 OF 4 (FIXED)
//
// RESPONSIBILITY:
// - Admin Authentication Guard
// - Page Initialization
// - Manual Refresh
// - Auto Refresh
// - Cleanup
// - Final Module Export
//
// =====================================================


// =====================================================
// AUTHENTICATION GUARD
// =====================================================

onAuthStateChanged(auth, async (user)=>{


    if(!user){


        console.warn(
            "🔒 Unauthorized Admin Access"
        );


        authenticatedUser=null;


        stopCustomerAutoRefresh();



        window.location.href =
            ADMIN_LOGIN_PAGE;



        return;

    }



    authenticatedUser=user;



    console.log(
        "👤 Admin Logged:",
        user.email || user.uid
    );



    if(!customerPageInitialized){


        await initAdminCustomerManager();


    }


});




// =====================================================
// INITIALIZE ADMIN CUSTOMER MANAGER
// =====================================================

async function initAdminCustomerManager(){


    if(customerPageInitialized)
        return;



    customerPageInitialized=true;



    try{


        await loadCustomers();



        startCustomerAutoRefresh();



        console.log(
            "🚀 Admin Customer Manager Ready"
        );



    }
    catch(error){


        console.error(
            "Initialization Error:",
            error
        );


    }


}





// =====================================================
// MANUAL REFRESH
// =====================================================

async function handleManualRefresh(){


    if(
        refreshProcessing ||
        customerRefreshProcessing
    )
        return;



    refreshProcessing=true;

    customerRefreshProcessing=true;



    if(refreshBtn){


        refreshBtn.disabled=true;

        refreshBtn.classList.add(
            "refreshing"
        );


    }



    try{


        console.log(
            "🔄 Manual Customer Refresh"
        );



        await loadCustomers();



    }
    catch(error){


        console.error(
            "Refresh Error:",
            error
        );


    }
    finally{


        refreshProcessing=false;

        customerRefreshProcessing=false;



        if(refreshBtn){


            refreshBtn.disabled=false;


            refreshBtn.classList.remove(
                "refreshing"
            );


        }


    }


}





// =====================================================
// AUTO REFRESH SYSTEM
// =====================================================

function startCustomerAutoRefresh(){



    stopCustomerAutoRefresh();




    customerAutoRefreshTimer = setInterval(
        async ()=>{


            if(
                customersLoading ||
                customerActionProcessing ||
                refreshProcessing ||
                customerRefreshProcessing
            ){

                return;

            }



            try{


                console.log(
                    "⏱ Auto Refresh Customers"
                );



                await loadCustomers();



            }
            catch(error){


                console.warn(
                    "Auto Refresh Error:",
                    error
                );


            }



        },
        CUSTOMER_AUTO_REFRESH_INTERVAL
    );


}





function stopCustomerAutoRefresh(){



    if(customerAutoRefreshTimer){


        clearInterval(
            customerAutoRefreshTimer
        );


        customerAutoRefreshTimer=null;


    }


}





// =====================================================
// PAGE VISIBILITY CONTROL
// =====================================================

document.addEventListener(
    "visibilitychange",
    ()=>{


        if(document.hidden){


            stopCustomerAutoRefresh();


        }
        else if(authenticatedUser){


            startCustomerAutoRefresh();


        }


    }
);




// =====================================================
// PAGE CLOSE CLEANUP
// =====================================================

window.addEventListener(
    "beforeunload",
    ()=>{


        stopCustomerAutoRefresh();


    }
);




// =====================================================
// EVENT LISTENERS
// =====================================================

refreshBtn?.addEventListener(
    "click",
    handleManualRefresh
);





// =====================================================
// FINAL PUBLIC API
// =====================================================

window.adminCustomers={

    ...(window.adminCustomers || {}),


    initAdminCustomerManager,


    handleManualRefresh,


    startCustomerAutoRefresh,


    stopCustomerAutoRefresh

};





console.log(
"🍜 RIO MAGGI POINT - Admin Customers Part 4 Fixed Loaded"
);


console.log(
"✅ COMPLETE admin-customers.js READY"
);


// =====================================================
// END PART 4 / COMPLETE FILE
// =====================================================
