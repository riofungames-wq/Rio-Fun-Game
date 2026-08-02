// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 1 OF 4
//
// RESPONSIBILITY:
// - Firebase Configuration Import
// - Firestore Imports
// - Authentication Import
// - Application Constants
// - DOM References
// - Global Application State
// - Safe Customer Helpers
// - Date Helpers
// - Reward Helpers
// - Modal Foundation
//
// IMPORTANT:
// This file is ONE ES MODULE.
//
// PART 1 MUST NOT contain:
// - Event listeners
// - Authentication listener
// - Customer loading
// - Table rendering
// - Search logic
// - Customer action handlers
// - Auto refresh
// - Duplicate declarations
//
// Those responsibilities belong to PART 2, PART 3 and PART 4.
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
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// FIREBASE AUTH IMPORTS
// =====================================================

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// APPLICATION CONSTANTS
// =====================================================

// Maximum number of loyalty stamps required
// for one complete reward cycle.
const MAX_STAMPS = 6;


// Admin login page.
// Used by the final authentication guard.
const ADMIN_LOGIN_PAGE =
  "admin-login.html";


// Admin dashboard page.
const ADMIN_DASHBOARD_PAGE =
  "admin-dashboard.html";


// Customer Firestore collection name.
const CUSTOMER_COLLECTION =
  "customers";


// Customer manager auto-refresh interval.
// Part 4 will use this value.
const CUSTOMER_AUTO_REFRESH_INTERVAL =
  30000;


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


// =====================================================
// CUSTOMER TABLE
// =====================================================

const customerTable =
  document.getElementById(
    "customerTable"
  );


// =====================================================
// CUSTOMER SEARCH INPUT
// =====================================================

const searchCustomer =
  document.getElementById(
    "searchCustomer"
  );


// =====================================================
// REFRESH BUTTON
// =====================================================

const refreshBtn =
  document.getElementById(
    "refreshBtn"
  );


// =====================================================
// STATISTICS
// =====================================================

const totalCustomers =
  document.getElementById(
    "totalCustomers"
  );


const rewardReady =
  document.getElementById(
    "rewardReady"
  );


const todayJoined =
  document.getElementById(
    "todayJoined"
  );


// =====================================================
// CUSTOMER MODAL
// =====================================================

const customerModal =
  document.getElementById(
    "customerModal"
  );


// =====================================================
// CLOSE MODAL BUTTON
// =====================================================

const closeModalBtn =
  document.getElementById(
    "closeModal"
  );


// =====================================================
// MODAL CUSTOMER PHOTO
// =====================================================

const modalPhoto =
  document.getElementById(
    "modalPhoto"
  );


// =====================================================
// MODAL CUSTOMER NAME
// =====================================================

const modalName =
  document.getElementById(
    "modalName"
  );


// =====================================================
// MODAL MEMBER ID
// =====================================================

const modalMember =
  document.getElementById(
    "modalMember"
  );


// =====================================================
// MODAL MOBILE NUMBER
// =====================================================

const modalMobile =
  document.getElementById(
    "modalMobile"
  );


// =====================================================
// MODAL STAMP COUNT
// =====================================================

const modalStamp =
  document.getElementById(
    "modalStamp"
  );


// =====================================================
// MODAL REWARD STATUS
// =====================================================

const modalReward =
  document.getElementById(
    "modalReward"
  );


// =====================================================
// MODAL ACTION BUTTONS
// =====================================================


// Give Stamp
const giveStampBtn =
  document.getElementById(
    "giveStampBtn"
  );


// Remove Stamp
const removeStampBtn =
  document.getElementById(
    "removeStampBtn"
  );


// Unlock Reward
const unlockRewardBtn =
  document.getElementById(
    "unlockRewardBtn"
  );


// Delete Customer
const deleteCustomerBtn =
  document.getElementById(
    "deleteCustomerBtn"
  );


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================
//
// IMPORTANT:
// Every global state variable is declared ONLY ONCE
// in the entire admin-customers.js file.
//
// PART 2, PART 3 and PART 4 MUST NOT redeclare these.
// =====================================================


// =====================================================
// ALL CUSTOMERS
// =====================================================

let customers = [];


// =====================================================
// CURRENTLY SELECTED CUSTOMER
// =====================================================

let selectedCustomer = null;


// =====================================================
// AUTHENTICATED USER
// =====================================================
//
// The actual Firebase auth user.
// Authentication listener is added only in PART 4.
// =====================================================

let authenticatedUser = null;


// =====================================================
// CUSTOMER DATA LOADING STATE
// =====================================================

let customersLoading = false;


// =====================================================
// GENERAL CUSTOMER REFRESH STATE
// =====================================================

let customerRefreshProcessing = false;


// =====================================================
// MANUAL REFRESH BUTTON STATE
// =====================================================

let refreshProcessing = false;


// =====================================================
// CUSTOMER ACTION STATES
// =====================================================

let customerActionProcessing = false;


let giveStampProcessing = false;


let removeStampProcessing = false;


let unlockRewardProcessing = false;


let deleteCustomerProcessing = false;


// =====================================================
// AUTO REFRESH TIMER
// =====================================================
//
// ONLY ONE auto-refresh timer is allowed.
// Part 4 will use this variable.
// =====================================================

let customerAutoRefreshTimer = null;


// =====================================================
// PAGE INITIALIZATION STATE
// =====================================================

let customerPageInitialized = false;


// =====================================================
// SAFE VALUE HELPERS
// =====================================================


// =====================================================
// GET CUSTOMER MOBILE NUMBER
// =====================================================
//
// Supported customer fields:
// - mobile
// - phone
// - phoneNumber
//
// Returns:
// A clean string or "-"
// =====================================================

function getCustomerMobile(
  customer
) {

  if (
    !customer
  ) {

    return "-";

  }


  const mobile =

    customer.mobile ||

    customer.phone ||

    customer.phoneNumber ||

    "";


  const cleanMobile =

    String(
      mobile
    ).trim();


  return cleanMobile || "-";

}


// =====================================================
// GET CUSTOMER STAMP COUNT
// =====================================================
//
// Always returns an integer between:
// 0 and MAX_STAMPS
//
// Prevents invalid values such as:
// - negative numbers
// - NaN
// - decimals
// - values above MAX_STAMPS
// =====================================================

function getCustomerStamps(
  customer
) {

  if (
    !customer
  ) {

    return 0;

  }


  const stamps =

    Number(
      customer.stamps
    );


  if (
    !Number.isFinite(
      stamps
    )
  ) {

    return 0;

  }


  return Math.min(

    Math.max(

      Math.floor(
        stamps
      ),

      0

    ),

    MAX_STAMPS

  );

}


// =====================================================
// GET CUSTOMER AVATAR
// =====================================================
//
// Avatar priority:
// 1. photoURL
// 2. photoUrl
// 3. photo
// 4. avatar
// 5. Gender-based default avatar
// 6. Male default avatar
// =====================================================

function getCustomerAvatar(
  customer
) {

  if (
    !customer
  ) {

    return DEFAULT_MALE_AVATAR;

  }


  const possiblePhotos = [

    customer.photoURL,

    customer.photoUrl,

    customer.photo,

    customer.avatar

  ];


  const validPhoto =

    possiblePhotos.find(

      (
        photo
      ) =>

        typeof photo ===
        "string" &&

        photo.trim() !== ""

    );


  if (
    validPhoto
  ) {

    return validPhoto;

  }


  const gender =

    String(

      customer.gender || ""

    )

      .trim()

      .toLowerCase();


  if (

    gender === "female" ||

    gender === "woman" ||

    gender === "girl"

  ) {

    return DEFAULT_FEMALE_AVATAR;

  }


  return DEFAULT_MALE_AVATAR;

}


// =====================================================
// ESCAPE HTML
// =====================================================
//
// Used whenever dynamic customer data is inserted
// into HTML strings.
//
// Prevents HTML injection problems.
// =====================================================

function escapeHtml(
  value
) {

  if (

    value === null ||

    value === undefined

  ) {

    return "";

  }


  return String(
    value
  )

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
// GET TODAY DATE KEY
// =====================================================
//
// Returns local date in:
// YYYY-MM-DD
//
// Example:
// 2026-08-03
// =====================================================

function getTodayKey() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =

    String(

      now.getMonth() + 1

    ).padStart(

      2,

      "0"

    );


  const day =

    String(

      now.getDate()

    ).padStart(

      2,

      "0"

    );


  return (

    `${year}-${month}-${day}`

  );

}


// =====================================================
// CONVERT FIRESTORE DATE SAFELY
// =====================================================
//
// Supports:
// - Firestore Timestamp
// - JavaScript Date
// - String
// - Number
//
// Returns:
// Date object or null
// =====================================================

function toSafeDate(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return null;

  }


  // ---------------------------------------------------
  // FIRESTORE TIMESTAMP
  // ---------------------------------------------------

  if (

    typeof value.toDate ===
    "function"

  ) {

    try {

      const date =
        value.toDate();


      return (

        date instanceof Date &&

        !Number.isNaN(
          date.getTime()
        )

      )

        ? date

        : null;

    }

    catch (
      error
    ) {

      console.warn(
        "⚠️ Unable to convert Firestore timestamp.",
        error
      );


      return null;

    }

  }


  // ---------------------------------------------------
  // JAVASCRIPT DATE
  // ---------------------------------------------------

  if (
    value instanceof Date
  ) {

    return (

      !Number.isNaN(
        value.getTime()
      )

    )

      ? value

      : null;

  }


  // ---------------------------------------------------
  // STRING / NUMBER
  // ---------------------------------------------------

  const parsedDate =

    new Date(
      value
    );


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return null;

  }


  return parsedDate;

}


// =====================================================
// CHECK CUSTOMER CREATED TODAY
// =====================================================
//
// Uses the customer's createdAt field.
// =====================================================

function isCustomerCreatedToday(
  customer
) {

  if (
    !customer
  ) {

    return false;

  }


  const createdDate =

    toSafeDate(
      customer.createdAt
    );


  if (
    !createdDate
  ) {

    return false;

  }


  const today =
    new Date();


  return (

    createdDate.getFullYear() ===
    today.getFullYear()

    &&

    createdDate.getMonth() ===
    today.getMonth()

    &&

    createdDate.getDate() ===
    today.getDate()

  );

}


// =====================================================
// CHECK REWARD READY
// =====================================================
//
// Reward is considered ready when:
// 1. rewardUnlocked === true
// OR
// 2. stamps >= MAX_STAMPS
// =====================================================

function isRewardReady(
  customer
) {

  if (
    !customer
  ) {

    return false;

  }


  return (

    customer.rewardUnlocked ===
    true

    ||

    getCustomerStamps(
      customer
    ) >= MAX_STAMPS

  );

}


// =====================================================
// CHECK WHETHER CUSTOMER RECEIVED STAMP TODAY
// =====================================================
//
// Supports:
// - dailyStampDate
// - lastStampDate
//
// Used to prevent duplicate daily stamps.
// =====================================================

function hasStampToday(
  customer
) {

  if (
    !customer
  ) {

    return false;

  }


  const todayKey =
    getTodayKey();


  return (

    customer.dailyStampDate ===
    todayKey

    ||

    customer.lastStampDate ===
    todayKey

  );

}


// =====================================================
// GET CUSTOMER DISPLAY NAME
// =====================================================
//
// Centralized name fallback.
// =====================================================

function getCustomerName(
  customer
) {

  if (
    !customer
  ) {

    return "Unknown Customer";

  }


  const name =

    String(
      customer.name || ""
    ).trim();


  return (

    name ||

    "Unknown Customer"

  );

}


// =====================================================
// GET CUSTOMER MEMBER ID
// =====================================================
//
// Centralized member ID fallback.
// =====================================================

function getCustomerMemberId(
  customer
) {

  if (
    !customer
  ) {

    return "RIO-000000";

  }


  const memberId =

    String(
      customer.memberId || ""
    ).trim();


  return (

    memberId ||

    "RIO-000000"

  );

}


// =====================================================
// RESET CUSTOMER MODAL
// =====================================================
//
// Resets all modal data and action button states.
//
// IMPORTANT:
// This function does NOT close the modal.
// Modal visibility is handled separately.
// =====================================================

function resetCustomerModal() {

  selectedCustomer =
    null;


  // ---------------------------------------------------
  // PHOTO
  // ---------------------------------------------------

  if (
    modalPhoto
  ) {

    modalPhoto.src =
      DEFAULT_MALE_AVATAR;


    modalPhoto.alt =
      "Customer Photo";


    modalPhoto.dataset.fallbackApplied =
      "false";

  }


  // ---------------------------------------------------
  // NAME
  // ---------------------------------------------------

  if (
    modalName
  ) {

    modalName.textContent =
      "Customer Name";

  }


  // ---------------------------------------------------
  // MEMBER ID
  // ---------------------------------------------------

  if (
    modalMember
  ) {

    modalMember.textContent =
      "RIO-000000";

  }


  // ---------------------------------------------------
  // MOBILE
  // ---------------------------------------------------

  if (
    modalMobile
  ) {

    modalMobile.textContent =
      "-";

  }


  // ---------------------------------------------------
  // STAMP COUNT
  // ---------------------------------------------------

  if (
    modalStamp
  ) {

    modalStamp.textContent =

      `0 / ${MAX_STAMPS}`;

  }


  // ---------------------------------------------------
  // REWARD STATUS
  // ---------------------------------------------------

  if (
    modalReward
  ) {

    modalReward.textContent =
      "Locked";

  }


  // ---------------------------------------------------
  // ACTION BUTTONS
  // ---------------------------------------------------

  if (
    giveStampBtn
  ) {

    giveStampBtn.disabled =
      true;

  }


  if (
    removeStampBtn
  ) {

    removeStampBtn.disabled =
      true;

  }


  if (
    unlockRewardBtn
  ) {

    unlockRewardBtn.disabled =
      true;

  }


  if (
    deleteCustomerBtn
  ) {

    deleteCustomerBtn.disabled =
      true;

  }

}


// =====================================================
// SET CUSTOMER MODAL VISIBILITY
// =====================================================
//
// Centralized modal visibility control.
//
// Part 2, Part 3 and Part 4 must use this function
// instead of directly managing different modal variables.
// =====================================================

function setCustomerModalVisible(
  visible
) {

  if (
    !customerModal
  ) {

    return;

  }


  customerModal.style.display =

    visible

      ? "flex"

      : "none";

}


// =====================================================
// CLOSE CUSTOMER MODAL
// =====================================================
//
// IMPORTANT:
// This is the ONLY closeCustomerModal() function
// in the complete file.
//
// No duplicate definition is allowed in Part 2,
// Part 3 or Part 4.
// =====================================================

function closeCustomerModal() {

  setCustomerModalVisible(
    false
  );


  resetCustomerModal();

}


// =====================================================
// INITIAL MODAL STATE
// =====================================================
//
// No event listener is registered here.
// Event listeners will be registered exactly once
// in the appropriate later part.
// =====================================================

if (
  customerModal
) {

  customerModal.style.display =
    "none";

}


resetCustomerModal();


// =====================================================
// PART 1 DEVELOPMENT LOG
// =====================================================

console.log(
  "========================================"
);


console.log(
  "🍜 RIO MAGGI POINT"
);


console.log(
  "Premium Admin Customer Manager"
);


console.log(
  "Admin Customers JS — Part 1 of 4"
);


console.log(
  "========================================"
);


console.log(
  "✅ Firebase Config Ready"
);


console.log(
  "✅ Firestore Imports Ready"
);


console.log(
  "✅ Authentication Imports Ready"
);


console.log(
  "✅ Application Constants Ready"
);


console.log(
  "✅ DOM References Ready"
);


console.log(
  "✅ Global State Ready"
);


console.log(
  "✅ Safe Customer Helpers Ready"
);


console.log(
  "✅ Date Helpers Ready"
);


console.log(
  "✅ Reward Helpers Ready"
);


console.log(
  "✅ Modal Foundation Ready"
);


console.log(
  "========================================"
);


console.log(
  "➡️ Admin Customers JS Part 1 Loaded"
);


console.log(
  "➡️ Waiting for Part 2"
);


console.log(
  "========================================"
);


// =====================================================
// END OF PART 1
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 2 OF 4
//
// RESPONSIBILITY:
// - Load Customers From Firestore
// - Sort Customers
// - Customer Table Rendering
// - Customer Search
// - Customer Statistics
// - Fresh Customer Fetch
// - Local Customer State Update
// - Customer Modal Data Update
//
// IMPORTANT:
// This is a continuation of PART 1.
//
// DO NOT ADD HERE:
// - Duplicate imports
// - Duplicate constants
// - Duplicate state variables
// - Duplicate DOM references
// - Authentication listener
// - Auto refresh system
// - Customer action handlers
//
// Those responsibilities belong to PART 3 and PART 4.
// =====================================================


// =====================================================
// LOAD CUSTOMERS FROM FIRESTORE
// =====================================================
//
// Loads all customer documents from:
// customers
//
// Uses:
// - db
// - CUSTOMER_COLLECTION
// - customers
// - customersLoading
//
// =====================================================

async function loadCustomers() {

  // ---------------------------------------------------
  // PREVENT DUPLICATE CUSTOMER LOADS
  // ---------------------------------------------------

  if (
    customersLoading
  ) {

    return;

  }


  customersLoading =
    true;


  // ---------------------------------------------------
  // SHOW LOADING STATE
  // ---------------------------------------------------

  if (
    customerTable
  ) {

    customerTable.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="empty-table-message"
        >

          Loading Customers...

        </td>

      </tr>

    `;

  }


  try {

    // -------------------------------------------------
    // CUSTOMER COLLECTION REFERENCE
    // -------------------------------------------------

    const customersRef =

      collection(

        db,

        CUSTOMER_COLLECTION

      );


    let snapshot;


    // -------------------------------------------------
    // TRY ORDERED QUERY
    // -------------------------------------------------
    //
    // Newer customers should appear first.
    //
    // If orderBy fails because of old/missing data,
    // the fallback query below loads the collection
    // without ordering.
    // -------------------------------------------------

    try {

      const orderedQuery =

        query(

          customersRef,

          orderBy(

            "createdAt",

            "desc"

          )

        );


      snapshot =

        await getDocs(

          orderedQuery

        );

    }

    catch (
      orderError
    ) {

      console.warn(

        "⚠️ Customer ordered query failed. " +

        "Falling back to unordered customer query.",

        orderError

      );


      snapshot =

        await getDocs(

          customersRef

        );

    }


    // -------------------------------------------------
    // BUILD CUSTOMER ARRAY
    // -------------------------------------------------

    const loadedCustomers = [];


    snapshot.forEach(

      (
        customerDoc
      ) => {

        const customerData =

          customerDoc.data();


        loadedCustomers.push({

          ...customerData,

          uid:
            customerDoc.id

        });

      }

    );


    // -------------------------------------------------
    // SAFE LOCAL SORT
    // -------------------------------------------------
    //
    // Ensures newest customers appear first even when
    // the Firestore fallback query was used.
    // -------------------------------------------------

    loadedCustomers.sort(

      (
        customerA,

        customerB

      ) => {

        const dateA =

          toSafeDate(

            customerA.createdAt

          );


        const dateB =

          toSafeDate(

            customerB.createdAt

          );


        // Both dates missing.
        if (

          !dateA &&

          !dateB

        ) {

          return 0;

        }


        // Customer A has no date.
        if (
          !dateA
        ) {

          return 1;

        }


        // Customer B has no date.
        if (
          !dateB
        ) {

          return -1;

        }


        // Newest first.
        return (

          dateB.getTime() -

          dateA.getTime()

        );

      }

    );


    // -------------------------------------------------
    // UPDATE GLOBAL CUSTOMER STATE
    // -------------------------------------------------

    customers =
      loadedCustomers;


    // -------------------------------------------------
    // UPDATE STATISTICS
    // -------------------------------------------------

    updateCustomerStats();


    // -------------------------------------------------
    // RENDER CUSTOMER TABLE
    // -------------------------------------------------

    refreshCustomerTable();


    // -------------------------------------------------
    // RESTORE SELECTED CUSTOMER
    // -------------------------------------------------
    //
    // If the modal was open and the selected customer
    // still exists after refresh, update the modal
    // with the latest Firestore data.
    // -------------------------------------------------

    if (

      selectedCustomer &&

      selectedCustomer.uid

    ) {

      const refreshedCustomer =

        customers.find(

          (
            customer
          ) =>

            customer.uid ===

            selectedCustomer.uid

        );


      if (
        refreshedCustomer
      ) {

        selectedCustomer =

          refreshedCustomer;


        updateCustomerModal(

          refreshedCustomer,

          false

        );

      }

      else {

        // Selected customer no longer exists.
        closeCustomerModal();

      }

    }


    console.log(

      `✅ ${customers.length} customers loaded`

    );

  }

  catch (
    error
  ) {

    console.error(

      "❌ Load Customers Error:",

      error

    );


    // -------------------------------------------------
    // RESET CUSTOMER STATE ON LOAD FAILURE
    // -------------------------------------------------

    customers =
      [];


    updateCustomerStats();


    // -------------------------------------------------
    // SHOW ERROR STATE
    // -------------------------------------------------

    if (
      customerTable
    ) {

      customerTable.innerHTML = `

        <tr>

          <td
            colspan="7"
            class="empty-table-message"
          >

            Unable To Load Customers

            <br>

            <small>

              Please refresh and try again.

            </small>

          </td>

        </tr>

      `;

    }

  }

  finally {

    customersLoading =
      false;

  }

}


// =====================================================
// CREATE CUSTOMER TABLE ROW
// =====================================================
//
// Creates one complete customer table row.
//
// No inline onclick is used.
//
// Customer data is stored through a normal event
// listener, preventing:
// - Global function pollution
// - UID escaping issues
// - Inline JavaScript injection
//
// =====================================================

function createCustomerRow(
  customer
) {

  if (

    !customerTable ||

    !customer

  ) {

    return;

  }


  // ---------------------------------------------------
  // CUSTOMER BASIC DATA
  // ---------------------------------------------------

  const uid =

    String(

      customer.uid || ""

    );


  if (
    !uid
  ) {

    return;

  }


  const name =

    getCustomerName(

      customer

    );


  const memberId =

    getCustomerMemberId(

      customer

    );


  const mobile =

    getCustomerMobile(

      customer

    );


  const stamps =

    getCustomerStamps(

      customer

    );


  const rewardReadyStatus =

    isRewardReady(

      customer

    );


  const avatar =

    getCustomerAvatar(

      customer

    );


  // ---------------------------------------------------
  // CREATE TABLE ROW
  // ---------------------------------------------------

  const tr =

    document.createElement(

      "tr"

    );


  // ===================================================
  // PHOTO CELL
  // ===================================================

  const photoCell =

    document.createElement(

      "td"

    );


  const photo =

    document.createElement(

      "img"

    );


  photo.src =
    avatar;


  photo.alt =

    `${name} Photo`;


  photo.loading =
    "lazy";


  photo.dataset.fallbackApplied =
    "false";


  photo.onerror =

    () => {

      if (

        photo.dataset.fallbackApplied ===

        "true"

      ) {

        return;

      }


      photo.dataset.fallbackApplied =
        "true";


      photo.src =

        DEFAULT_MALE_AVATAR;

    };


  photoCell.appendChild(

    photo

  );


  // ===================================================
  // NAME CELL
  // ===================================================

  const nameCell =

    document.createElement(

      "td"

    );


  nameCell.textContent =
    name;


  // ===================================================
  // MEMBER ID CELL
  // ===================================================

  const memberCell =

    document.createElement(

      "td"

    );


  memberCell.textContent =
    memberId;


  // ===================================================
  // MOBILE CELL
  // ===================================================

  const mobileCell =

    document.createElement(

      "td"

    );


  mobileCell.textContent =
    mobile;


  // ===================================================
  // STAMP CELL
  // ===================================================

  const stampCell =

    document.createElement(

      "td"

    );


  stampCell.textContent =

    `${stamps} / ${MAX_STAMPS}`;


  // ===================================================
  // REWARD STATUS CELL
  // ===================================================

  const statusCell =

    document.createElement(

      "td"

    );


  const statusBadge =

    document.createElement(

      "span"

    );


  statusBadge.className =

    rewardReadyStatus

      ? "customer-status ready"

      : "customer-status locked";


  statusBadge.textContent =

    rewardReadyStatus

      ? "🟢 Reward Ready"

      : "🔒 Locked";


  statusCell.appendChild(

    statusBadge

  );


  // ===================================================
  // ACTION CELL
  // ===================================================

  const actionCell =

    document.createElement(

      "td"

    );


  const actionButton =

    document.createElement(

      "button"

    );


  actionButton.type =
    "button";


  actionButton.className =
    "actionBtn";


  actionButton.textContent =
    "View";


  actionButton.dataset.uid =
    uid;


  actionButton.setAttribute(

    "aria-label",

    `View ${name} details`

  );


  // ---------------------------------------------------
  // OPEN CUSTOMER MODAL
  // ---------------------------------------------------

  actionButton.addEventListener(

    "click",

    () => {

      const customerToOpen =

        customers.find(

          (
            item
          ) =>

            item.uid ===

            uid

        );


      if (
        !customerToOpen
      ) {

        console.warn(

          "⚠️ Customer not found:",

          uid

        );


        return;

      }


      updateCustomerModal(

        customerToOpen,

        true

      );

    }

  );


  actionCell.appendChild(

    actionButton

  );


  // ===================================================
  // APPEND ALL CELLS
  // ===================================================

  tr.append(

    photoCell,

    nameCell,

    memberCell,

    mobileCell,

    stampCell,

    statusCell,

    actionCell

  );


  // ===================================================
  // ADD ROW TO TABLE
  // ===================================================

  customerTable.appendChild(

    tr

  );

}


// =====================================================
// REFRESH CUSTOMER TABLE
// =====================================================
//
// Applies the current search keyword and renders
// matching customers.
//
// This is the ONLY table filtering/render function.
// Part 3 and Part 4 MUST NOT create another search
// rendering function.
//
// =====================================================

function refreshCustomerTable() {

  if (
    !customerTable
  ) {

    return;

  }


  // ---------------------------------------------------
  // CLEAR CURRENT TABLE
  // ---------------------------------------------------

  customerTable.innerHTML =
    "";


  // ---------------------------------------------------
  // GET SEARCH KEYWORD
  // ---------------------------------------------------

  const keyword =

    searchCustomer

      ? searchCustomer.value

          .trim()

          .toLowerCase()

      : "";


  // ---------------------------------------------------
  // FILTER CUSTOMERS
  // ---------------------------------------------------

  const filteredCustomers =

    customers.filter(

      (
        customer
      ) => {

        // No search keyword.
        if (
          !keyword
        ) {

          return true;

        }


        const name =

          String(

            customer.name || ""

          )

            .trim()

            .toLowerCase();


        const memberId =

          String(

            customer.memberId || ""

          )

            .trim()

            .toLowerCase();


        const mobile =

          getCustomerMobile(

            customer

          )

            .toLowerCase();


        const email =

          String(

            customer.email || ""

          )

            .trim()

            .toLowerCase();


        return (

          name.includes(

            keyword

          )

          ||

          memberId.includes(

            keyword

          )

          ||

          mobile.includes(

            keyword

          )

          ||

          email.includes(

            keyword

          )

        );

      }

    );


  // ---------------------------------------------------
  // EMPTY RESULT
  // ---------------------------------------------------

  if (

    filteredCustomers.length ===

    0

  ) {

    customerTable.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="empty-table-message"
        >

          ${
            keyword

              ? "No Customers Found"

              : "No Customers Available"
          }

        </td>

      </tr>

    `;


    return;

  }


  // ---------------------------------------------------
  // RENDER FILTERED CUSTOMERS
  // ---------------------------------------------------

  filteredCustomers.forEach(

    createCustomerRow

  );

}


// =====================================================
// UPDATE CUSTOMER STATISTICS
// =====================================================
//
// Updates:
// - Total Customers
// - Reward Ready
// - Today's Customers
//
// =====================================================

function updateCustomerStats() {

  // ---------------------------------------------------
  // TOTAL CUSTOMERS
  // ---------------------------------------------------

  if (
    totalCustomers
  ) {

    totalCustomers.textContent =

      String(

        customers.length

      );

  }


  // ---------------------------------------------------
  // REWARD READY COUNT
  // ---------------------------------------------------

  const readyCount =

    customers.filter(

      (
        customer
      ) =>

        isRewardReady(

          customer

        )

    ).length;


  if (
    rewardReady
  ) {

    rewardReady.textContent =

      String(

        readyCount

      );

  }


  // ---------------------------------------------------
  // TODAY JOINED COUNT
  // ---------------------------------------------------

  const todayCount =

    customers.filter(

      (
        customer
      ) =>

        isCustomerCreatedToday(

          customer

        )

    ).length;


  if (
    todayJoined
  ) {

    todayJoined.textContent =

      String(

        todayCount

      );

  }

}


// =====================================================
// GET FRESH CUSTOMER FROM FIRESTORE
// =====================================================
//
// Always fetches the latest customer document.
//
// Used by Part 3 before:
// - Give Stamp
// - Remove Stamp
// - Unlock Reward
// - Delete Customer
//
// =====================================================

async function getFreshCustomer(
  uid
) {

  if (
    !uid
  ) {

    return null;

  }


  const customerRef =

    doc(

      db,

      CUSTOMER_COLLECTION,

      uid

    );


  const snapshot =

    await getDoc(

      customerRef

    );


  if (

    !snapshot.exists()

  ) {

    return null;

  }


  return {

    ...snapshot.data(),

    uid:

      snapshot.id

  };

}


// =====================================================
// UPDATE LOCAL CUSTOMER
// =====================================================
//
// Updates one customer inside the local customers
// array without reloading the entire collection.
//
// =====================================================

function updateLocalCustomer(
  updatedCustomer
) {

  if (

    !updatedCustomer ||

    !updatedCustomer.uid

  ) {

    return false;

  }


  const index =

    customers.findIndex(

      (
        customer
      ) =>

        customer.uid ===

        updatedCustomer.uid

    );


  // ---------------------------------------------------
  // CUSTOMER NOT FOUND LOCALLY
  // ---------------------------------------------------

  if (
    index === -1
  ) {

    customers.push(

      updatedCustomer

    );


    return true;

  }


  // ---------------------------------------------------
  // MERGE UPDATED DATA
  // ---------------------------------------------------

  customers[index] = {

    ...customers[index],

    ...updatedCustomer

  };


  return true;

}


// =====================================================
// UPDATE CUSTOMER MODAL
// =====================================================
//
// Updates the modal with selected customer data.
//
// showModal:
// true  -> update and open modal
// false -> update modal without changing visibility
//
// =====================================================

function updateCustomerModal(

  customer,

  showModal = true

) {

  if (
    !customer
  ) {

    return;

  }


  // ---------------------------------------------------
  // SAVE SELECTED CUSTOMER
  // ---------------------------------------------------

  selectedCustomer =
    customer;


  // ===================================================
  // CUSTOMER PHOTO
  // ===================================================

  if (
    modalPhoto
  ) {

    modalPhoto.dataset.fallbackApplied =
      "false";


    modalPhoto.src =

      getCustomerAvatar(

        customer

      );


    modalPhoto.alt =

      `${getCustomerName(customer)} Photo`;

  }


  // ===================================================
  // CUSTOMER NAME
  // ===================================================

  if (
    modalName
  ) {

    modalName.textContent =

      getCustomerName(

        customer

      );

  }


  // ===================================================
  // MEMBER ID
  // ===================================================

  if (
    modalMember
  ) {

    modalMember.textContent =

      getCustomerMemberId(

        customer

      );

  }


  // ===================================================
  // MOBILE
  // ===================================================

  if (
    modalMobile
  ) {

    modalMobile.textContent =

      getCustomerMobile(

        customer

      );

  }


  // ===================================================
  // STAMP COUNT
  // ===================================================

  const stamps =

    getCustomerStamps(

      customer

    );


  if (
    modalStamp
  ) {

    modalStamp.textContent =

      `${stamps} / ${MAX_STAMPS}`;

  }


  // ===================================================
  // REWARD STATUS
  // ===================================================

  if (
    modalReward
  ) {

    modalReward.textContent =

      isRewardReady(

        customer

      )

        ? "Ready"

        : "Locked";

  }


  // ---------------------------------------------------
  // MODAL VISIBILITY
  // ---------------------------------------------------
  //
  // Part 3 will provide syncActionButtons().
  // We call it safely only when available.
  //
  // ---------------------------------------------------

  if (
    typeof syncActionButtons ===
    "function"
  ) {

    syncActionButtons();

  }


  if (
    showModal
  ) {

    setCustomerModalVisible(

      true

    );

  }

}


// =====================================================
// PART 2 EVENT LISTENERS
// =====================================================
//
// IMPORTANT:
// Only SEARCH listener is registered here.
//
// Modal listeners are PART 3.
// Refresh listener is PART 4.
// Auth listener is PART 4.
//
// This prevents duplicate event listeners.
// =====================================================


// =====================================================
// CUSTOMER SEARCH EVENT
// =====================================================
//
// "input" works with:
// - Typing
// - Paste
// - Mobile keyboard
// - Autofill
//
// =====================================================

searchCustomer?.addEventListener(

  "input",

  () => {

    refreshCustomerTable();

  }

);


// =====================================================
// PART 2 PUBLIC API
// =====================================================
//
// Existing API object is merged safely.
// It does NOT overwrite future Part 3/4 functions.
//
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


// =====================================================
// PART 2 DEVELOPMENT LOG
// =====================================================

console.log(
  "========================================"
);


console.log(
  "✅ Admin Customers Part 2 Loaded"
);


console.log(
  "✅ Firestore Customer Loading Ready"
);


console.log(
  "✅ Customer Sorting Ready"
);


console.log(
  "✅ Customer Table Rendering Ready"
);


console.log(
  "✅ Customer Search Ready"
);


console.log(
  "✅ Customer Statistics Ready"
);


console.log(
  "✅ Fresh Customer Fetch Ready"
);


console.log(
  "✅ Local Customer State Update Ready"
);


console.log(
  "✅ Customer Modal Data Update Ready"
);


console.log(
  "========================================"
);


console.log(
  "➡️ Waiting for Part 3"
);


console.log(
  "========================================"
);


// =====================================================
// END OF PART 2
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 3 OF 4
//
// RESPONSIBILITY:
// - Customer Modal Events
// - Give Stamp
// - Remove Stamp
// - Unlock Reward
// - Delete Customer
// - Action Button State Management
// - Modal Close Controls
//
// IMPORTANT:
// This is a continuation of PART 1 + PART 2.
//
// DO NOT ADD HERE:
// - Duplicate imports
// - Duplicate constants
// - Duplicate DOM references
// - Duplicate global state
// - Duplicate search listener
// - Duplicate customer loading logic
// - Duplicate authentication listener
// - Duplicate refresh listener
//
// PART 4 will handle:
// - Authentication
// - Initial Page Bootstrap
// - Refresh
// - Auto Refresh
// =====================================================


// =====================================================
// ACTION BUTTON STATE HELPER
// =====================================================
//
// Keeps all customer action buttons synchronized with
// the currently selected customer.
//
// =====================================================

function syncActionButtons() {

  // ---------------------------------------------------
  // CHECK SELECTED CUSTOMER
  // ---------------------------------------------------

  const hasSelectedCustomer = Boolean(

    selectedCustomer &&

    selectedCustomer.uid

  );


  // ---------------------------------------------------
  // GET CURRENT STAMP COUNT
  // ---------------------------------------------------

  const stamps =

    hasSelectedCustomer

      ? getCustomerStamps(

          selectedCustomer

        )

      : 0;


  // ---------------------------------------------------
  // CHECK WHETHER CUSTOMER ALREADY GOT TODAY'S STAMP
  // ---------------------------------------------------

  const alreadyStampedToday =

    hasSelectedCustomer

      ? hasStampToday(

          selectedCustomer

        )

      : false;


  // ===================================================
  // GIVE STAMP BUTTON
  // ===================================================

  if (
    giveStampBtn
  ) {

    giveStampBtn.disabled = (

      !hasSelectedCustomer ||

      customerActionProcessing ||

      giveStampProcessing ||

      alreadyStampedToday ||

      stamps >= MAX_STAMPS

    );

  }


  // ===================================================
  // REMOVE STAMP BUTTON
  // ===================================================

  if (
    removeStampBtn
  ) {

    removeStampBtn.disabled = (

      !hasSelectedCustomer ||

      customerActionProcessing ||

      removeStampProcessing ||

      stamps <= 0

    );

  }


  // ===================================================
  // UNLOCK REWARD BUTTON
  // ===================================================

  if (
    unlockRewardBtn
  ) {

    const rewardAlreadyUnlocked = (

      selectedCustomer &&

      selectedCustomer.rewardUnlocked === true

    );


    unlockRewardBtn.disabled = (

      !hasSelectedCustomer ||

      customerActionProcessing ||

      unlockRewardProcessing ||

      rewardAlreadyUnlocked

    );

  }


  // ===================================================
  // DELETE CUSTOMER BUTTON
  // ===================================================

  if (
    deleteCustomerBtn
  ) {

    deleteCustomerBtn.disabled = (

      !hasSelectedCustomer ||

      customerActionProcessing ||

      deleteCustomerProcessing

    );

  }

}


// =====================================================
// SET ACTION BUTTON LOADING STATE
// =====================================================
//
// Displays a temporary loading state on the button
// currently performing an action.
//
// =====================================================

function setActionButtonLoading(

  button,

  isLoading,

  loadingText,

  defaultText

) {

  if (
    !button
  ) {

    return;

  }


  if (
    isLoading
  ) {

    button.disabled = true;


    button.dataset.originalContent =

      button.innerHTML;


    button.innerHTML = `

      <i
        class="fa-solid fa-spinner fa-spin"
        aria-hidden="true"
      ></i>

      ${loadingText}

    `;


    return;

  }


  button.disabled = false;


  button.innerHTML =

    button.dataset.originalContent ||

    defaultText;

}


// =====================================================
// REFRESH SELECTED CUSTOMER FROM FIRESTORE
// =====================================================
//
// Fetches latest data before a customer action.
//
// This prevents stale local data from overwriting
// newer Firestore values.
//
// =====================================================

async function refreshSelectedCustomer() {

  if (

    !selectedCustomer ||

    !selectedCustomer.uid

  ) {

    return null;

  }


  const freshCustomer =

    await getFreshCustomer(

      selectedCustomer.uid

    );


  if (
    !freshCustomer
  ) {

    closeCustomerModal();


    return null;

  }


  selectedCustomer =

    freshCustomer;


  updateLocalCustomer(

    freshCustomer

  );


  updateCustomerModal(

    freshCustomer,

    false

  );


  syncActionButtons();


  return freshCustomer;

}


// =====================================================
// GIVE STAMP
// =====================================================
//
// Adds one stamp to the selected customer.
//
// Rules:
// - Maximum 6 stamps
// - Only one stamp per day
// - Fresh Firestore data is checked first
//
// =====================================================

async function giveCustomerStamp() {

  if (
    giveStampProcessing
  ) {

    return;

  }


  if (

    !selectedCustomer ||

    !selectedCustomer.uid

  ) {

    alert(

      "Please select a customer first."

    );


    return;

  }


  giveStampProcessing =

    true;


  customerActionProcessing =

    true;


  syncActionButtons();


  setActionButtonLoading(

    giveStampBtn,

    true,

    "Adding...",

    "➕ Give Stamp"

  );


  try {

    // -------------------------------------------------
    // GET LATEST CUSTOMER DATA
    // -------------------------------------------------

    const customer =

      await getFreshCustomer(

        selectedCustomer.uid

      );


    if (
      !customer
    ) {

      alert(

        "Customer no longer exists."

      );


      closeCustomerModal();


      return;

    }


    // -------------------------------------------------
    // CHECK TODAY'S STAMP
    // -------------------------------------------------

    if (

      hasStampToday(

        customer

      )

    ) {

      alert(

        "This customer has already received today's stamp."

      );


      selectedCustomer =

        customer;


      updateLocalCustomer(

        customer

      );


      updateCustomerModal(

        customer,

        false

      );


      return;

    }


    // -------------------------------------------------
    // GET CURRENT STAMP COUNT
    // -------------------------------------------------

    const currentStamps =

      getCustomerStamps(

        customer

      );


    // -------------------------------------------------
    // MAXIMUM STAMP CHECK
    // -------------------------------------------------

    if (

      currentStamps >=

      MAX_STAMPS

    ) {

      alert(

        "This customer already has the maximum number of stamps."

      );


      selectedCustomer =

        customer;


      updateLocalCustomer(

        customer

      );


      updateCustomerModal(

        customer,

        false

      );


      return;

    }


    // -------------------------------------------------
    // ADD ONE STAMP
    // -------------------------------------------------

    const newStampCount =

      Math.min(

        currentStamps + 1,

        MAX_STAMPS

      );


    const todayKey =

      getTodayKey();


    const customerRef =

      doc(

        db,

        CUSTOMER_COLLECTION,

        customer.uid

      );


    await updateDoc(

      customerRef,

      {

        stamps:

          newStampCount,

        dailyStampDate:

          todayKey,

        lastStampDate:

          todayKey,

        updatedAt:

          serverTimestamp()

      }

    );


    // -------------------------------------------------
    // UPDATE LOCAL CUSTOMER STATE
    // -------------------------------------------------

    const updatedCustomer = {

      ...customer,

      stamps:

        newStampCount,

      dailyStampDate:

        todayKey,

      lastStampDate:

        todayKey

    };


    selectedCustomer =

      updatedCustomer;


    updateLocalCustomer(

      updatedCustomer

    );


    // -------------------------------------------------
    // UPDATE UI
    // -------------------------------------------------

    updateCustomerStats();


    refreshCustomerTable();


    updateCustomerModal(

      updatedCustomer,

      false

    );


    syncActionButtons();


    console.log(

      `✅ Stamp added to customer: ${customer.uid}`

    );

  }

  catch (
    error
  ) {

    console.error(

      "❌ Give Stamp Error:",

      error

    );


    alert(

      "Unable to give stamp. Please try again."

    );

  }

  finally {

    giveStampProcessing =

      false;


    customerActionProcessing =

      false;


    setActionButtonLoading(

      giveStampBtn,

      false,

      "",

      "➕ Give Stamp"

    );


    syncActionButtons();

  }

}


// =====================================================
// REMOVE STAMP
// =====================================================
//
// Removes one stamp from selected customer.
//
// Never allows stamp count below zero.
//
// =====================================================

async function removeCustomerStamp() {

  if (
    removeStampProcessing
  ) {

    return;

  }


  if (

    !selectedCustomer ||

    !selectedCustomer.uid

  ) {

    alert(

      "Please select a customer first."

    );


    return;

  }


  const confirmed =

    window.confirm(

      "Are you sure you want to remove one stamp from this customer?"

    );


  if (
    !confirmed
  ) {

    return;

  }


  removeStampProcessing =

    true;


  customerActionProcessing =

    true;


  syncActionButtons();


  setActionButtonLoading(

    removeStampBtn,

    true,

    "Removing...",

    "➖ Remove Stamp"

  );


  try {

    // -------------------------------------------------
    // GET LATEST DATA
    // -------------------------------------------------

    const customer =

      await getFreshCustomer(

        selectedCustomer.uid

      );


    if (
      !customer
    ) {

      alert(

        "Customer no longer exists."

      );


      closeCustomerModal();


      return;

    }


    // -------------------------------------------------
    // CURRENT STAMPS
    // -------------------------------------------------

    const currentStamps =

      getCustomerStamps(

        customer

      );


    if (

      currentStamps <= 0

    ) {

      alert(

        "Customer has no stamps to remove."

      );


      selectedCustomer =

        customer;


      updateLocalCustomer(

        customer

      );


      updateCustomerModal(

        customer,

        false

      );


      return;

    }


    // -------------------------------------------------
    // REMOVE ONE STAMP
    // -------------------------------------------------

    const newStampCount =

      Math.max(

        currentStamps - 1,

        0

      );


    const customerRef =

      doc(

        db,

        CUSTOMER_COLLECTION,

        customer.uid

      );


    await updateDoc(

      customerRef,

      {

        stamps:

          newStampCount,

        updatedAt:

          serverTimestamp()

      }

    );


    // -------------------------------------------------
    // UPDATE LOCAL STATE
    // -------------------------------------------------

    const updatedCustomer = {

      ...customer,

      stamps:

        newStampCount

    };


    selectedCustomer =

      updatedCustomer;


    updateLocalCustomer(

      updatedCustomer

    );


    // -------------------------------------------------
    // UPDATE UI
    // -------------------------------------------------

    updateCustomerStats();


    refreshCustomerTable();


    updateCustomerModal(

      updatedCustomer,

      false

    );


    syncActionButtons();


    console.log(

      `✅ Stamp removed from customer: ${customer.uid}`

    );

  }

  catch (
    error
  ) {

    console.error(

      "❌ Remove Stamp Error:",

      error

    );


    alert(

      "Unable to remove stamp. Please try again."

    );

  }

  finally {

    removeStampProcessing =

      false;


    customerActionProcessing =

      false;


    setActionButtonLoading(

      removeStampBtn,

      false,

      "",

      "➖ Remove Stamp"

    );


    syncActionButtons();

  }

}


// =====================================================
// UNLOCK REWARD
// =====================================================
//
// Unlocks reward for selected customer.
//
// Reward can only be unlocked when customer has
// maximum required stamps.
//
// =====================================================

async function unlockCustomerReward() {

  if (
    unlockRewardProcessing
  ) {

    return;

  }


  if (

    !selectedCustomer ||

    !selectedCustomer.uid

  ) {

    alert(

      "Please select a customer first."

    );


    return;

  }


  const confirmed =

    window.confirm(

      "Are you sure you want to unlock this customer's reward?"

    );


  if (
    !confirmed
  ) {

    return;

  }


  unlockRewardProcessing =

    true;


  customerActionProcessing =

    true;


  syncActionButtons();


  setActionButtonLoading(

    unlockRewardBtn,

    true,

    "Unlocking...",

    "🎁 Unlock Reward"

  );


  try {

    // -------------------------------------------------
    // GET LATEST DATA
    // -------------------------------------------------

    const customer =

      await getFreshCustomer(

        selectedCustomer.uid

      );


    if (
      !customer
    ) {

      alert(

        "Customer no longer exists."

      );


      closeCustomerModal();


      return;

    }


    // -------------------------------------------------
    // CHECK STAMPS
    // -------------------------------------------------

    const currentStamps =

      getCustomerStamps(

        customer

      );


    if (

      currentStamps <

      MAX_STAMPS

    ) {

      alert(

        `Customer needs ${MAX_STAMPS} stamps before the reward can be unlocked.`

      );


      selectedCustomer =

        customer;


      updateLocalCustomer(

        customer

      );


      updateCustomerModal(

        customer,

        false

      );


      return;

    }


    // -------------------------------------------------
    // CHECK ALREADY UNLOCKED
    // -------------------------------------------------

    if (

      customer.rewardUnlocked ===

      true

    ) {

      alert(

        "Reward is already unlocked for this customer."

      );


      selectedCustomer =

        customer;


      updateLocalCustomer(

        customer

      );


      updateCustomerModal(

        customer,

        false

      );


      return;

    }


    // -------------------------------------------------
    // UPDATE FIRESTORE
    // -------------------------------------------------

    const customerRef =

      doc(

        db,

        CUSTOMER_COLLECTION,

        customer.uid

      );


    await updateDoc(

      customerRef,

      {

        rewardUnlocked:

          true,

        rewardUnlockedAt:

          serverTimestamp(),

        updatedAt:

          serverTimestamp()

      }

    );


    // -------------------------------------------------
    // UPDATE LOCAL STATE
    // -------------------------------------------------

    const updatedCustomer = {

      ...customer,

      rewardUnlocked:

        true

    };


    selectedCustomer =

      updatedCustomer;


    updateLocalCustomer(

      updatedCustomer

    );


    // -------------------------------------------------
    // UPDATE UI
    // -------------------------------------------------

    updateCustomerStats();


    refreshCustomerTable();


    updateCustomerModal(

      updatedCustomer,

      false

    );


    syncActionButtons();


    console.log(

      `✅ Reward unlocked for customer: ${customer.uid}`

    );

  }

  catch (
    error
  ) {

    console.error(

      "❌ Unlock Reward Error:",

      error

    );


    alert(

      "Unable to unlock reward. Please try again."

    );

  }

  finally {

    unlockRewardProcessing =

      false;


    customerActionProcessing =

      false;


    setActionButtonLoading(

      unlockRewardBtn,

      false,

      "",

      "🎁 Unlock Reward"

    );


    syncActionButtons();

  }

}


// =====================================================
// DELETE CUSTOMER
// =====================================================
//
// Permanently deletes selected customer.
//
// Confirmation is required.
//
// =====================================================

async function deleteSelectedCustomer() {

  if (
    deleteCustomerProcessing
  ) {

    return;

  }


  if (

    !selectedCustomer ||

    !selectedCustomer.uid

  ) {

    alert(

      "Please select a customer first."

    );


    return;

  }


  const customerName =

    getCustomerName(

      selectedCustomer

    );


  const confirmed =

    window.confirm(

      `Are you sure you want to permanently delete ${customerName}? This action cannot be undone.`

    );


  if (
    !confirmed
  ) {

    return;

  }


  deleteCustomerProcessing =

    true;


  customerActionProcessing =

    true;


  syncActionButtons();


  setActionButtonLoading(

    deleteCustomerBtn,

    true,

    "Deleting...",

    "🗑 Delete Customer"

  );


  try {

    // -------------------------------------------------
    // VERIFY CUSTOMER STILL EXISTS
    // -------------------------------------------------

    const customer =

      await getFreshCustomer(

        selectedCustomer.uid

      );


    if (
      !customer
    ) {

      alert(

        "Customer no longer exists."

      );


      closeCustomerModal();


      return;

    }


    // -------------------------------------------------
    // DELETE CUSTOMER
    // -------------------------------------------------

    const customerRef =

      doc(

        db,

        CUSTOMER_COLLECTION,

        customer.uid

      );


    await deleteDoc(

      customerRef

    );


    // -------------------------------------------------
    // REMOVE FROM LOCAL STATE
    // -------------------------------------------------

    customers =

      customers.filter(

        (
          item
        ) =>

          item.uid !==

          customer.uid

      );


    // -------------------------------------------------
    // CLOSE MODAL
    // -------------------------------------------------

    closeCustomerModal();


    // -------------------------------------------------
    // UPDATE UI
    // -------------------------------------------------

    updateCustomerStats();


    refreshCustomerTable();


    console.log(

      `✅ Customer deleted: ${customer.uid}`

    );

  }

  catch (
    error
  ) {

    console.error(

      "❌ Delete Customer Error:",

      error

    );


    alert(

      "Unable to delete customer. Please try again."

    );

  }

  finally {

    deleteCustomerProcessing =

      false;


    customerActionProcessing =

      false;


    setActionButtonLoading(

      deleteCustomerBtn,

      false,

      "",

      "🗑 Delete Customer"

    );


    syncActionButtons();

  }

}


// =====================================================
// OPEN CUSTOMER MODAL
// =====================================================
//
// Public helper for opening the modal when a selected
// customer already exists.
//
// =====================================================

function openCustomerModal() {

  if (
    !customerModal
  ) {

    return;

  }


  if (

    !selectedCustomer ||

    !selectedCustomer.uid

  ) {

    return;

  }


  setCustomerModalVisible(

    true

  );


  syncActionButtons();

}


// =====================================================
// CLOSE CUSTOMER MODAL
// =====================================================
//
// Uses the centralized modal visibility function
// from Part 1.
//
// =====================================================

function closeCustomerModal() {

  setCustomerModalVisible(

    false

  );


  resetCustomerModal();


  // ---------------------------------------------------
  // RESET ACTION PROCESSING FLAGS
  // ---------------------------------------------------

  customerActionProcessing =
    false;

}


// =====================================================
// CLOSE MODAL BUTTON EVENT
// =====================================================

closeModalBtn?.addEventListener(

  "click",

  () => {

    closeCustomerModal();

  }

);


// =====================================================
// CLOSE MODAL ON BACKDROP CLICK
// =====================================================

customerModal?.addEventListener(

  "click",

  (
    event
  ) => {

    if (

      event.target ===

      customerModal

    ) {

      closeCustomerModal();

    }

  }

);


// =====================================================
// CLOSE MODAL WITH ESCAPE KEY
// =====================================================

document.addEventListener(

  "keydown",

  (
    event
  ) => {

    if (

      event.key !==

      "Escape"

    ) {

      return;

    }


    if (
      !customerModal
    ) {

      return;

    }


    const isModalVisible =

      customerModal.style.display ===

      "flex";


    if (
      isModalVisible
    ) {

      closeCustomerModal();

    }

  }

);


// =====================================================
// MODAL PHOTO FALLBACK
// =====================================================

modalPhoto?.addEventListener(

  "error",

  () => {

    if (

      modalPhoto.dataset.fallbackApplied ===

      "true"

    ) {

      return;

    }


    modalPhoto.dataset.fallbackApplied =

      "true";


    modalPhoto.src =

      DEFAULT_MALE_AVATAR;

  }

);


// =====================================================
// MODAL PHOTO FALLBACK RESET
// =====================================================

modalPhoto?.addEventListener(

  "load",

  () => {

    modalPhoto.dataset.fallbackApplied =

      "false";

  }

);


// =====================================================
// CUSTOMER ACTION EVENTS
// =====================================================
//
// These are the ONLY listeners for customer action
// buttons.
//
// =====================================================

giveStampBtn?.addEventListener(

  "click",

  giveCustomerStamp

);


removeStampBtn?.addEventListener(

  "click",

  removeCustomerStamp

);


unlockRewardBtn?.addEventListener(

  "click",

  unlockCustomerReward

);


deleteCustomerBtn?.addEventListener(

  "click",

  deleteSelectedCustomer

);


// =====================================================
// PART 3 PUBLIC API
// =====================================================
//
// Safely merges Part 3 functions into the existing
// global API created by Part 2.
//
// =====================================================

window.adminCustomers = {

  ...(window.adminCustomers || {}),

  syncActionButtons,

  setActionButtonLoading,

  refreshSelectedCustomer,

  giveCustomerStamp,

  removeCustomerStamp,

  unlockCustomerReward,

  deleteSelectedCustomer,

  openCustomerModal,

  closeCustomerModal

};


// =====================================================
// PART 3 DEVELOPMENT LOG
// =====================================================

console.log(
  "========================================"
);


console.log(
  "✅ Admin Customers Part 3 Loaded"
);


console.log(
  "✅ Action Button State System Ready"
);


console.log(
  "✅ Give Stamp System Ready"
);


console.log(
  "✅ Remove Stamp System Ready"
);


console.log(
  "✅ Unlock Reward System Ready"
);


console.log(
  "✅ Delete Customer System Ready"
);


console.log(
  "✅ Customer Modal Controls Ready"
);


console.log(
  "✅ Modal Backdrop Close Ready"
);


console.log(
  "✅ Escape Key Close Ready"
);


console.log(
  "✅ Customer Image Fallback Ready"
);


console.log(
  "========================================"
);


console.log(
  "➡️ Waiting for Part 4"
);


console.log(
  "========================================"
);


// =====================================================
// END OF PART 3
// =====================================================
