// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 1
//
// RESPONSIBILITY:
// Firebase Imports
// DOM References
// Constants
// Global State
// Safe Helpers
// Modal Foundation
//
// IMPORTANT:
// This file is designed as ONE ES MODULE.
// Do NOT repeat these imports, constants, or DOM
// declarations in Part 2 or Part 3.
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

const MAX_STAMPS = 6;

const ADMIN_LOGIN_PAGE =
  "admin-login.html";

const ADMIN_DASHBOARD_PAGE =
  "admin-dashboard.html";


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
// SEARCH
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
// MODAL PHOTO
// =====================================================

const modalPhoto =
  document.getElementById(
    "modalPhoto"
  );


// =====================================================
// MODAL NAME
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
// MODAL MOBILE
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

const giveStampBtn =
  document.getElementById(
    "giveStampBtn"
  );

const removeStampBtn =
  document.getElementById(
    "removeStampBtn"
  );

const unlockRewardBtn =
  document.getElementById(
    "unlockRewardBtn"
  );

const deleteCustomerBtn =
  document.getElementById(
    "deleteCustomerBtn"
  );


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================
//
// IMPORTANT:
// These variables are declared ONLY ONCE.
// Part 2 and Part 3 MUST use these variables.
// Do NOT declare them again.
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
// AUTHENTICATION STATE
// =====================================================

let authenticatedUser = null;


// =====================================================
// LOADING STATE
// =====================================================

let customersLoading = false;


// =====================================================
// REFRESH STATE
// =====================================================

let refreshProcessing = false;


// =====================================================
// CUSTOMER ACTION STATE
// =====================================================

let customerActionProcessing = false;

let giveStampProcessing = false;

let removeStampProcessing = false;

let unlockRewardProcessing = false;

let deleteCustomerProcessing = false;


// =====================================================
// AUTO REFRESH STATE
// =====================================================

let autoRefreshTimer = null;


// =====================================================
// PAGE INITIALIZATION STATE
// =====================================================

let customerPageInitialized = false;


// =====================================================
// SAFE VALUE HELPERS
// =====================================================


// =====================================================
// GET CUSTOMER MOBILE
// =====================================================
//
// Supports:
// mobile
// phone
// phoneNumber
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


  return String(
    mobile
  ).trim() || "-";

}


// =====================================================
// GET CUSTOMER STAMP COUNT
// =====================================================
//
// Always returns a safe integer between 0 and 6.
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
// Priority:
// 1. photoURL
// 2. photoUrl
// 3. photo
// 4. female avatar
// 5. male avatar
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

      (photo) =>

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
// Used before inserting customer data into innerHTML.
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
// Returns:
// YYYY-MM-DD
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
// Firestore Timestamp
// JavaScript Date
// String
// Number
// =====================================================

function toSafeDate(
  value
) {

  if (
    !value
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
// rewardUnlocked === true
// OR stamps reach MAX_STAMPS.
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
// CHECK TODAY'S STAMP
// =====================================================
//
// Supports both:
// dailyStampDate
// lastStampDate
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
// RESET CUSTOMER MODAL
// =====================================================
//
// This function resets the modal to a clean state.
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
  // STAMPS
  // ---------------------------------------------------

  if (
    modalStamp
  ) {

    modalStamp.textContent =

      `0 / ${MAX_STAMPS}`;

  }


  // ---------------------------------------------------
  // REWARD
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
// SET MODAL VISIBILITY
// =====================================================
//
// Centralized modal display control.
// Part 2/3 should use this instead of an undefined
// variable such as "modal".
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

function closeCustomerModal() {

  setCustomerModalVisible(
    false
  );


  resetCustomerModal();

}


// =====================================================
// INITIAL MODAL STATE
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
  "Admin Customers JS — Part 1"
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
  "✅ DOM References Ready"
);

console.log(
  "✅ Application Constants Ready"
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
  "✅ Reward Helper Ready"
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
  "➡️ Part 2 can now be added"
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
// admin-customers.js — PART 2
//
// RESPONSIBILITY:
// Customer Loading
// Customer Table Rendering
// Search
// Statistics
// Customer Modal
// Fresh Customer Fetch
// Local State Management
//
// IMPORTANT:
// This is a continuation of PART 1.
// Do NOT add duplicate imports or declarations.
// =====================================================


// =====================================================
// LOAD CUSTOMERS FROM FIRESTORE
// =====================================================
//
// Loads all customers from:
// customers
//
// Uses the existing:
// db
// customers
// customerTable
// =====================================================

async function loadCustomers() {

  // ---------------------------------------------------
  // PREVENT DUPLICATE LOAD
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
    // FIRESTORE QUERY
    // -------------------------------------------------

    const customersRef =

      collection(
        db,
        "customers"
      );


    let snapshot;


    // -------------------------------------------------
    // TRY ORDERED QUERY FIRST
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

      // -----------------------------------------------
      // FALLBACK:
      // If some old customer document does not have
      // createdAt, load collection without orderBy.
      // -----------------------------------------------

      console.warn(

        "⚠️ Ordered customer query failed. " +

        "Loading customers without ordering.",

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
      (customerDoc) => {

        const data =
          customerDoc.data();


        loadedCustomers.push({

          ...data,

          uid:
            customerDoc.id

        });

      }

    );


    // -------------------------------------------------
    // FALLBACK SORT
    // -------------------------------------------------
    //
    // Ensures newest customers appear first when
    // createdAt exists.
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


        if (
          !dateA &&
          !dateB
        ) {

          return 0;

        }


        if (
          !dateA
        ) {

          return 1;

        }


        if (
          !dateB
        ) {

          return -1;

        }


        return (

          dateB.getTime() -

          dateA.getTime()

        );

      }

    );


    // -------------------------------------------------
    // UPDATE GLOBAL STATE
    // -------------------------------------------------

    customers =
      loadedCustomers;


    // -------------------------------------------------
    // UPDATE UI
    // -------------------------------------------------

    updateCustomerStats();

    refreshCustomerTable();


    // -------------------------------------------------
    // RESTORE SELECTED CUSTOMER
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
    // CLEAR OLD DATA IF LOAD FAILED
    // -------------------------------------------------

    customers =
      [];


    updateCustomerStats();


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
// Creates one customer row.
// No inline onclick is used.
//
// This prevents:
// - Global function pollution
// - UID escaping problems
// - Duplicate event logic
// =====================================================

function createRow(
  customer
) {

  if (
    !customerTable ||
    !customer
  ) {

    return;

  }


  const tr =
    document.createElement(
      "tr"
    );


  // ---------------------------------------------------
  // CUSTOMER DATA
  // ---------------------------------------------------

  const uid =
    String(
      customer.uid || ""
    );


  const name =

    customer.name ||

    "Unknown Customer";


  const memberId =

    customer.memberId ||

    "-";


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
  // CREATE PHOTO CELL
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // NAME CELL
  // ---------------------------------------------------

  const nameCell =
    document.createElement(
      "td"
    );


  nameCell.textContent =
    name;


  // ---------------------------------------------------
  // MEMBER ID CELL
  // ---------------------------------------------------

  const memberCell =
    document.createElement(
      "td"
    );


  memberCell.textContent =
    memberId;


  // ---------------------------------------------------
  // MOBILE CELL
  // ---------------------------------------------------

  const mobileCell =
    document.createElement(
      "td"
    );


  mobileCell.textContent =
    mobile;


  // ---------------------------------------------------
  // STAMP CELL
  // ---------------------------------------------------

  const stampCell =
    document.createElement(
      "td"
    );


  stampCell.textContent =

    `${stamps} / ${MAX_STAMPS}`;


  // ---------------------------------------------------
  // STATUS CELL
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // ACTION CELL
  // ---------------------------------------------------

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

        alert(
          "Customer data not found."
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


  // ---------------------------------------------------
  // ADD CELLS TO ROW
  // ---------------------------------------------------

  tr.append(

    photoCell,

    nameCell,

    memberCell,

    mobileCell,

    stampCell,

    statusCell,

    actionCell

  );


  // ---------------------------------------------------
  // ADD ROW TO TABLE
  // ---------------------------------------------------

  customerTable.appendChild(
    tr
  );

}


// =====================================================
// REFRESH CUSTOMER TABLE
// =====================================================
//
// Applies current search keyword and renders rows.
// =====================================================

function refreshCustomerTable() {

  if (
    !customerTable
  ) {

    return;

  }


  customerTable.innerHTML =
    "";


  const keyword =

    searchCustomer

      ? searchCustomer.value
          .trim()
          .toLowerCase()

      : "";


  const filteredCustomers =

    customers.filter(

      (
        customer
      ) => {

        if (
          !keyword
        ) {

          return true;

        }


        const name =

          String(
            customer.name || ""
          )
            .toLowerCase();


        const memberId =

          String(
            customer.memberId || ""
          )
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
  // EMPTY SEARCH RESULT
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

          No Customers Found

        </td>

      </tr>

    `;

    return;

  }


  // ---------------------------------------------------
  // RENDER ROWS
  // ---------------------------------------------------

  filteredCustomers.forEach(

    createRow

  );

}


// =====================================================
// UPDATE CUSTOMER STATISTICS
// =====================================================

function updateCustomerStats() {

  // ---------------------------------------------------
  // TOTAL CUSTOMERS
  // ---------------------------------------------------

  if (
    totalCustomers
  ) {

    totalCustomers.textContent =

      customers.length;

  }


  // ---------------------------------------------------
  // REWARD READY
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
      readyCount;

  }


  // ---------------------------------------------------
  // TODAY JOINED
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
      todayCount;

  }

}


// =====================================================
// GET FRESH CUSTOMER FROM FIRESTORE
// =====================================================
//
// Always fetches latest data before performing an
// admin action.
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

      "customers",

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
// Updates only one customer in local state.
// =====================================================

function updateLocalCustomer(
  updatedCustomer
) {

  if (

    !updatedCustomer ||

    !updatedCustomer.uid

  ) {

    return;

  }


  const index =

    customers.findIndex(

      (
        customer
      ) =>

        customer.uid ===
        updatedCustomer.uid

    );


  if (
    index === -1
  ) {

    customers.push(
      updatedCustomer
    );

    return;

  }


  customers[index] = {

    ...customers[index],

    ...updatedCustomer

  };

}


// =====================================================
// UPDATE CUSTOMER MODAL
// =====================================================
//
// showModal:
// true  = open modal
// false = update modal only
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


  selectedCustomer =
    customer;


  // ---------------------------------------------------
  // CUSTOMER AVATAR
  // ---------------------------------------------------

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

      `${customer.name || "Customer"} Photo`;

  }


  // ---------------------------------------------------
  // CUSTOMER NAME
  // ---------------------------------------------------

  if (
    modalName
  ) {

    modalName.textContent =

      customer.name ||

      "Unknown Customer";

  }


  // ---------------------------------------------------
  // MEMBER ID
  // ---------------------------------------------------

  if (
    modalMember
  ) {

    modalMember.textContent =

      customer.memberId ||

      "RIO-000000";

  }


  // ---------------------------------------------------
  // MOBILE
  // ---------------------------------------------------

  if (
    modalMobile
  ) {

    modalMobile.textContent =

      getCustomerMobile(
        customer
      );

  }


  // ---------------------------------------------------
  // STAMPS
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // REWARD STATUS
  // ---------------------------------------------------

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
  // OPEN MODAL
  // ---------------------------------------------------

  if (
    showModal
  ) {

    setCustomerModalVisible(
      true
    );

  }


  // ---------------------------------------------------
  // BUTTON STATE
  // ---------------------------------------------------

  syncActionButtons();

}


// =====================================================
// SEARCH EVENT
// =====================================================
//
// Uses "input" instead of "keyup" so it also works
// with paste, mobile keyboards, autofill, etc.
// =====================================================

searchCustomer?.addEventListener(

  "input",

  () => {

    refreshCustomerTable();

  }

);


// =====================================================
// CLOSE MODAL BUTTON
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
// CLOSE MODAL WITH ESCAPE
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


    if (
      customerModal.style.display ===
      "flex"
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
// REFRESH BUTTON
// =====================================================
//
// Only ONE refresh listener is defined here.
// Part 3 MUST NOT add another refresh listener.
// =====================================================

refreshBtn?.addEventListener(

  "click",

  async () => {

    if (
      refreshProcessing
    ) {

      return;

    }


    refreshProcessing =
      true;


    const originalContent =

      refreshBtn.innerHTML;


    refreshBtn.disabled =
      true;


    refreshBtn.innerHTML = `

      <i
        class="fa-solid fa-spinner fa-spin"
        aria-hidden="true"
      ></i>

      Loading...

    `;


    try {

      await loadCustomers();

    }

    catch (
      error
    ) {

      console.error(

        "❌ Manual Refresh Error:",

        error

      );

    }

    finally {

      refreshProcessing =
        false;


      refreshBtn.disabled =
        false;


      refreshBtn.innerHTML =

        originalContent ||

        `

          <i class="fa-solid fa-rotate"></i>

          Refresh

        `;

    }

  }

);


// =====================================================
// PART 2 API
// =====================================================
//
// Part 3 and other modules can use these functions.
// =====================================================

window.adminCustomers = {

  loadCustomers,

  createRow,

  refreshCustomerTable,

  updateCustomerStats,

  getFreshCustomer,

  updateLocalCustomer,

  updateCustomerModal,

  closeCustomerModal,

  setCustomerModalVisible

};


// =====================================================
// PART 2 READY
// =====================================================

console.log(
  "========================================"
);

console.log(
  "✅ Admin Customers Part 2 Loaded"
);

console.log(
  "✅ Customer Firestore Loading Ready"
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
  "✅ Customer Modal Ready"
);

console.log(
  "✅ Fresh Customer Fetch Ready"
);

console.log(
  "✅ Local Customer State Ready"
);

console.log(
  "✅ Single Refresh Listener Ready"
);

console.log(
  "========================================"
);

console.log(
  "➡️ Part 3 can now be added"
);

console.log(
  "========================================"


// =====================================================
// END OF PART 2
// =====================================================
  // =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// ADMIN-CUSTOMERS.JS — PART 3
// MODAL MANAGEMENT + SEARCH + REFRESH + AUTO REFRESH
// CLEAN INTEGRATION — NO DUPLICATE IMPORTS
// =====================================================


// =====================================================
// AUTO REFRESH CONFIGURATION
// =====================================================

const CUSTOMER_AUTO_REFRESH_INTERVAL = 30000;


// =====================================================
// AUTO REFRESH STATE
// =====================================================

let customerAutoRefreshTimer = null;

let customerRefreshProcessing = false;

let customerPageInitialized = false;


// =====================================================
// CLOSE CUSTOMER MODAL
// =====================================================

function closeCustomerModal() {

  if (!customerModal) {
    return;
  }

  customerModal.style.display = "none";

  selectedCustomer = null;

  resetCustomerModal();

}


// =====================================================
// OPEN CUSTOMER MODAL
// =====================================================

function openCustomerModal() {

  if (!customerModal) {
    return;
  }

  customerModal.style.display = "flex";

  syncActionButtons();

}


// =====================================================
// SYNC ACTION BUTTON STATES
// =====================================================

function syncActionButtons() {

  const hasSelectedCustomer = Boolean(
    selectedCustomer &&
    selectedCustomer.uid
  );


  // -----------------------------------------------------
  // GET CURRENT STAMP COUNT
  // -----------------------------------------------------

  const stamps = hasSelectedCustomer
    ? getCustomerStamps(selectedCustomer)
    : 0;


  // -----------------------------------------------------
  // CHECK TODAY'S STAMP
  // -----------------------------------------------------

  const alreadyStampedToday = hasSelectedCustomer
    ? hasStampToday(selectedCustomer)
    : false;


  // =====================================================
  // GIVE STAMP
  // =====================================================

  if (giveStampBtn) {

    giveStampBtn.disabled = (

      !hasSelectedCustomer ||

      giveStampProcessing ||

      alreadyStampedToday ||

      stamps >= MAX_STAMPS

    );

  }


  // =====================================================
  // REMOVE STAMP
  // =====================================================

  if (removeStampBtn) {

    removeStampBtn.disabled = (

      !hasSelectedCustomer ||

      removeStampProcessing ||

      stamps <= 0

    );

  }


  // =====================================================
  // UNLOCK REWARD
  // =====================================================

  if (unlockRewardBtn) {

    unlockRewardBtn.disabled = (

      !hasSelectedCustomer ||

      unlockRewardProcessing ||

      Boolean(
        selectedCustomer &&
        selectedCustomer.rewardUnlocked === true
      )

    );

  }


  // =====================================================
  // DELETE CUSTOMER
  // =====================================================

  if (deleteCustomerBtn) {

    deleteCustomerBtn.disabled = (

      !hasSelectedCustomer ||

      deleteCustomerProcessing

    );

  }

}


// =====================================================
// SEARCH CUSTOMER
// =====================================================

function handleCustomerSearch() {

  if (!customerTable) {
    return;
  }


  const keyword = searchCustomer
    ? searchCustomer.value
        .trim()
        .toLowerCase()
    : "";


  customerTable.innerHTML = "";


  const filteredCustomers = customers.filter(
    (customer) => {

      if (!keyword) {
        return true;
      }


      const name = String(
        customer.name || ""
      ).toLowerCase();


      const memberId = String(
        customer.memberId || ""
      ).toLowerCase();


      const mobile = getCustomerMobile(
        customer
      ).toLowerCase();


      return (

        name.includes(keyword) ||

        memberId.includes(keyword) ||

        mobile.includes(keyword)

      );

    }
  );


  if (
    filteredCustomers.length === 0
  ) {

    customerTable.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="empty-table-message"
        >

          No customers found.

        </td>

      </tr>

    `;

    return;

  }


  filteredCustomers.forEach(
    createRow
  );

}


// =====================================================
// SAFE CUSTOMER DATA REFRESH
// =====================================================

async function safeLoadCustomers(
  options = {}
) {

  const {

    preserveSelection = true,

    showLoadingState = false

  } = options;


  // -----------------------------------------------------
  // PREVENT DUPLICATE FIRESTORE REQUESTS
  // -----------------------------------------------------

  if (
    customerRefreshProcessing
  ) {

    return;

  }


  customerRefreshProcessing = true;


  // -----------------------------------------------------
  // REMEMBER SELECTED CUSTOMER
  // -----------------------------------------------------

  const previousSelectedUid = (

    preserveSelection &&

    selectedCustomer &&

    selectedCustomer.uid

  )
    ? selectedCustomer.uid
    : null;


  const originalRefreshContent =

    refreshBtn
      ? refreshBtn.innerHTML
      : "";


  try {

    // ===================================================
    // REFRESH BUTTON LOADING STATE
    // ===================================================

    if (
      refreshBtn &&
      showLoadingState
    ) {

      refreshBtn.disabled = true;

      refreshBtn.innerHTML = `

        <i
          class="fa-solid fa-spinner fa-spin"
          aria-hidden="true"
        ></i>

        Loading...

      `;

    }


    // ===================================================
    // LOAD CUSTOMER DATA
    // ===================================================

    await loadCustomers();


    // ===================================================
    // RESTORE SELECTED CUSTOMER
    // ===================================================

    if (
      previousSelectedUid
    ) {

      const refreshedCustomer =

        customers.find(

          (customer) =>

            customer.uid ===
            previousSelectedUid

        );


      if (
        refreshedCustomer
      ) {

        selectedCustomer =
          refreshedCustomer;


        updateCustomerModal(
          refreshedCustomer
        );


        // -----------------------------------------------
        // KEEP MODAL OPEN
        // -----------------------------------------------

        if (customerModal) {

          customerModal.style.display =
            "flex";

        }

      }

      else {

        closeCustomerModal();

      }

    }


    // ===================================================
    // UPDATE UI
    // ===================================================

    updateCustomerStats();

    refreshCustomerTable();

    syncActionButtons();

  }

  catch (error) {

    console.error(
      "❌ Customer Refresh Error:",
      error
    );


    if (
      customerTable &&
      customers.length === 0
    ) {

      customerTable.innerHTML = `

        <tr>

          <td
            colspan="7"
            class="empty-table-message"
          >

            Unable To Load Customers.

          </td>

        </tr>

      `;

    }

  }

  finally {

    customerRefreshProcessing = false;


    // ===================================================
    // RESTORE REFRESH BUTTON
    // ===================================================

    if (
      refreshBtn &&
      showLoadingState
    ) {

      refreshBtn.disabled = false;


      refreshBtn.innerHTML =

        originalRefreshContent ||

        `

          <i class="fa-solid fa-rotate"></i>

          Refresh

        `;

    }

  }

}


// =====================================================
// CLOSE MODAL BUTTON
// =====================================================

closeModalBtn?.addEventListener(
  "click",
  closeCustomerModal
);


// =====================================================
// CLOSE MODAL WITH ESCAPE
// =====================================================

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key !== "Escape"
    ) {

      return;

    }


    if (
      !customerModal
    ) {

      return;

    }


    if (
      customerModal.style.display === "flex"
    ) {

      closeCustomerModal();

    }

  }
);


// =====================================================
// CLOSE MODAL ON BACKDROP CLICK
// =====================================================

customerModal?.addEventListener(
  "click",
  (event) => {

    if (
      event.target === customerModal
    ) {

      closeCustomerModal();

    }

  }
);


// =====================================================
// CUSTOMER IMAGE FALLBACK
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
// RESET IMAGE FALLBACK FLAG
// =====================================================

modalPhoto?.addEventListener(
  "load",
  () => {

    modalPhoto.dataset.fallbackApplied =
      "false";

  }
);


// =====================================================
// SEARCH EVENT
// =====================================================

searchCustomer?.addEventListener(
  "input",
  handleCustomerSearch
);


// =====================================================
// REFRESH BUTTON
// =====================================================

refreshBtn?.addEventListener(
  "click",
  async () => {

    await safeLoadCustomers({

      preserveSelection: true,

      showLoadingState: true

    });

  }
);


// =====================================================
// START AUTO REFRESH
// =====================================================

function startCustomerAutoRefresh() {

  // -----------------------------------------------------
  // PREVENT DUPLICATE INTERVAL
  // -----------------------------------------------------

  if (
    customerAutoRefreshTimer !== null
  ) {

    return;

  }


  customerAutoRefreshTimer =

    window.setInterval(

      async () => {

        // -----------------------------------------------
        // DON'T REFRESH IF ANOTHER REQUEST IS RUNNING
        // -----------------------------------------------

        if (
          customerRefreshProcessing
        ) {

          return;

        }


        // -----------------------------------------------
        // DON'T REFRESH HIDDEN PAGE
        // -----------------------------------------------

        if (
          document.hidden
        ) {

          return;

        }


        await safeLoadCustomers({

          preserveSelection: true,

          showLoadingState: false

        });

      },

      CUSTOMER_AUTO_REFRESH_INTERVAL

    );


  console.log(
    "✅ Customer Auto Refresh Started"
  );

}


// =====================================================
// STOP AUTO REFRESH
// =====================================================

function stopCustomerAutoRefresh() {

  if (
    customerAutoRefreshTimer === null
  ) {

    return;

  }


  window.clearInterval(
    customerAutoRefreshTimer
  );


  customerAutoRefreshTimer = null;


  console.log(
    "⏹️ Customer Auto Refresh Stopped"
  );

}


// =====================================================
// PAGE VISIBILITY CHANGE
// =====================================================

document.addEventListener(
  "visibilitychange",
  async () => {

    // ---------------------------------------------------
    // PAGE IS VISIBLE AGAIN
    // ---------------------------------------------------

    if (
      !document.hidden
    ) {

      if (
        !customerRefreshProcessing &&
        authenticatedUser
      ) {

        await safeLoadCustomers({

          preserveSelection: true,

          showLoadingState: false

        });

      }

    }

  }
);


// =====================================================
// BEFORE PAGE UNLOAD
// =====================================================

window.addEventListener(
  "beforeunload",
  () => {

    stopCustomerAutoRefresh();

  }
);


// =====================================================
// PAGE INITIALIZATION
// =====================================================

function initializeCustomerPage() {

  if (
    customerPageInitialized
  ) {

    return;

  }


  customerPageInitialized = true;


  // -----------------------------------------------------
  // INITIAL BUTTON STATE
  // -----------------------------------------------------

  syncActionButtons();


  // -----------------------------------------------------
  // START AUTO REFRESH
  // -----------------------------------------------------

  startCustomerAutoRefresh();


  console.log(
    "✅ Customer Manager UI Initialized"
  );

}


// =====================================================
// AUTH STATE HANDLER
// =====================================================

onAuthStateChanged(
  auth,
  (user) => {

    authenticatedUser = user;


    // ---------------------------------------------------
    // USER NOT LOGGED IN
    // ---------------------------------------------------

    if (
      !user
    ) {

      stopCustomerAutoRefresh();

      return;

    }


    // ---------------------------------------------------
    // USER LOGGED IN
    // ---------------------------------------------------

    initializeCustomerPage();

  }
);


// =====================================================
// GLOBAL CUSTOMER MANAGER API
// =====================================================

window.adminCustomers = {

  ...(window.adminCustomers || {}),

  closeCustomerModal,

  openCustomerModal,

  syncActionButtons,

  handleCustomerSearch,

  safeLoadCustomers,

  startCustomerAutoRefresh,

  stopCustomerAutoRefresh

};


// =====================================================
// PART 3 READY
// =====================================================

console.log(
  "========================================"
);

console.log(
  "✅ Admin Customers Part 3 Loaded"
);

console.log(
  "✅ Modal Management Ready"
);

console.log(
  "✅ Search System Ready"
);

console.log(
  "✅ Safe Refresh System Ready"
);

console.log(
  "✅ Auto Refresh Protection Ready"
);

console.log(
  "✅ Visibility Refresh Ready"
);

console.log(
  "✅ Customer Image Fallback Ready"
);

console.log(
  "========================================"
);

console.log(
  "➡️ Waiting for Part 4..."
);

console.log(
  "========================================"
);


// =====================================================
// END OF PART 3
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// ADMIN-CUSTOMERS.JS — PART 4
// FINAL INTEGRATION + INITIAL LOAD + AUTH GUARD
// =====================================================


// =====================================================
// INITIAL CUSTOMER LOAD
// =====================================================
// Authentication के बाद customer data पहली बार load होगा.
// Part 3 के auto-refresh system के साथ conflict नहीं करेगा.
// =====================================================

async function initializeCustomerData() {

  if (
    !authenticatedUser
  ) {

    return;

  }


  if (
    customersLoading
  ) {

    return;

  }


  customersLoading = true;


  try {

    // ---------------------------------------------------
    // LOAD CUSTOMERS FROM FIRESTORE
    // ---------------------------------------------------

    await loadCustomers();


    // ---------------------------------------------------
    // UPDATE STATISTICS
    // ---------------------------------------------------

    updateCustomerStats();


    // ---------------------------------------------------
    // RENDER TABLE
    // ---------------------------------------------------

    refreshCustomerTable();


    // ---------------------------------------------------
    // RESET MODAL STATE
    // ---------------------------------------------------

    if (
      !selectedCustomer
    ) {

      resetCustomerModal();

    }


    // ---------------------------------------------------
    // SYNC BUTTONS
    // ---------------------------------------------------

    syncActionButtons();


    console.log(
      `✅ ${customers.length} customers loaded successfully`
    );

  }

  catch (error) {

    console.error(
      "❌ Initial Customer Load Error:",
      error
    );


    if (
      customerTable
    ) {

      customerTable.innerHTML = `

        <tr>

          <td
            colspan="7"
            class="empty-table-message"
          >

            Unable to load customers.

            Please refresh and try again.

          </td>

        </tr>

      `;

    }

  }

  finally {

    customersLoading = false;

  }

}


// =====================================================
// AUTHENTICATED CUSTOMER PAGE BOOTSTRAP
// =====================================================
// यह function केवल एक बार initial data load करता है.
// बाद में Part 3 का auto-refresh संभालेगा.
// =====================================================

async function bootstrapCustomerManager() {

  if (
    !authenticatedUser
  ) {

    return;

  }


  if (
    customersLoading
  ) {

    return;

  }


  await initializeCustomerData();


  // ---------------------------------------------------
  // INITIALIZE UI
  // ---------------------------------------------------

  initializeCustomerPage();

}


// =====================================================
// AUTH STATE MONITOR
// =====================================================
// IMPORTANT:
// यह Part 4 का एकमात्र auth listener है.
// यदि Part 1 में पहले से auth listener मौजूद है,
// तो उसी listener में bootstrapCustomerManager()
// call करना बेहतर है.
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    authenticatedUser =
      user;


    // =================================================
    // USER NOT LOGGED IN
    // =================================================

    if (
      !user
    ) {

      stopCustomerAutoRefresh();


      customers =
        [];


      selectedCustomer =
        null;


      customerPageInitialized =
        false;


      if (
        customerTable
      ) {

        customerTable.innerHTML =
          "";

      }


      if (
        customerModal
      ) {

        customerModal.style.display =
          "none";

      }


      location.href =
        ADMIN_LOGIN_PAGE;


      return;

    }


    // =================================================
    // USER LOGGED IN
    // =================================================

    await bootstrapCustomerManager();

  }
);


// =====================================================
// CUSTOMER TABLE EMPTY STATE
// =====================================================

function showCustomerEmptyState(
  message = "No customers found."
) {

  if (
    !customerTable
  ) {

    return;

  }


  customerTable.innerHTML = `

    <tr>

      <td
        colspan="7"
        class="empty-table-message"
      >

        ${escapeHtml(message)}

      </td>

    </tr>

  `;

}


// =====================================================
// CUSTOMER TABLE ERROR STATE
// =====================================================

function showCustomerErrorState() {

  if (
    !customerTable
  ) {

    return;

  }


  customerTable.innerHTML = `

    <tr>

      <td
        colspan="7"
        class="empty-table-message"
      >

        Something went wrong while loading customers.

        Please try again.

      </td>

    </tr>

  `;

}


// =====================================================
// CUSTOMER TABLE SAFETY CHECK
// =====================================================

function ensureCustomerTableState() {

  if (
    !customerTable
  ) {

    console.warn(
      "⚠️ Customer table element not found."
    );

    return;

  }


  if (
    customers.length === 0
  ) {

    showCustomerEmptyState();

    return;

  }


  refreshCustomerTable();

}


// =====================================================
// REFRESH CUSTOMER DATA API
// =====================================================

async function refreshCustomerData() {

  if (
    customerRefreshProcessing
  ) {

    return;

  }


  await safeLoadCustomers({

    preserveSelection:
      true,

    showLoadingState:
      true

  });

}


// =====================================================
// CUSTOMER MANAGER PUBLIC API
// =====================================================
// Existing Part 1–3 API को overwrite नहीं करता.
// केवल नए functions merge करता है.
// =====================================================

window.adminCustomers = {

  ...(window.adminCustomers || {}),

  refreshCustomerData,

  initializeCustomerData,

  bootstrapCustomerManager,

  showCustomerEmptyState,

  showCustomerErrorState,

  ensureCustomerTableState

};


// =====================================================
// FINAL INITIALIZATION LOG
// =====================================================

console.log(
  "========================================"
);

console.log(
  "🎉 RIO MAGGI POINT"
);

console.log(
  "PREMIUM ADMIN CUSTOMER MANAGER"
);

console.log(
  "========================================"
);

console.log(
  "✅ Part 1 — Firebase + DOM Foundation"
);

console.log(
  "✅ Part 2 — Customer Actions"
);

console.log(
  "✅ Part 3 — Modal + Refresh System"
);

console.log(
  "✅ Part 4 — Final Integration"
);

console.log(
  "========================================"
);

console.log(
  "🚀 Admin Customer Manager Ready"
);

console.log(
  "========================================"
);


// =====================================================
// END OF ADMIN-CUSTOMERS.JS PART 4
// =====================================================
