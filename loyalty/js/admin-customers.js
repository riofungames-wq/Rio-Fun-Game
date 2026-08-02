// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// ADMIN-CUSTOMERS.JS — PART 1
// FIREBASE IMPORTS + DOM REFERENCES + GLOBAL STATE
// CLEAN FOUNDATION — NO DUPLICATE DECLARATIONS
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
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
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


// -----------------------------------------------------
// MAXIMUM STAMPS
// -----------------------------------------------------

const MAX_STAMPS = 6;


// -----------------------------------------------------
// ADMIN LOGIN PAGE
// -----------------------------------------------------

const ADMIN_LOGIN_PAGE =
  "admin-login.html";


// -----------------------------------------------------
// DEFAULT AVATARS
// -----------------------------------------------------

const DEFAULT_MALE_AVATAR =
  "assets/avatars/male.png";

const DEFAULT_FEMALE_AVATAR =
  "assets/avatars/female.png";


// =====================================================
// DOM REFERENCES
// =====================================================


// -----------------------------------------------------
// CUSTOMER TABLE
// -----------------------------------------------------

const customerTable =
  document.getElementById(
    "customerTable"
  );


// -----------------------------------------------------
// SEARCH
// -----------------------------------------------------

const searchCustomer =
  document.getElementById(
    "searchCustomer"
  );


// -----------------------------------------------------
// REFRESH BUTTON
// -----------------------------------------------------

const refreshBtn =
  document.getElementById(
    "refreshBtn"
  );


// -----------------------------------------------------
// STATISTICS
// -----------------------------------------------------

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


// -----------------------------------------------------
// MODAL
// -----------------------------------------------------

const customerModal =
  document.getElementById(
    "customerModal"
  );


// -----------------------------------------------------
// CLOSE MODAL BUTTON
// -----------------------------------------------------

const closeModalBtn =
  document.getElementById(
    "closeModal"
  );


// -----------------------------------------------------
// MODAL PHOTO
// -----------------------------------------------------

const modalPhoto =
  document.getElementById(
    "modalPhoto"
  );


// -----------------------------------------------------
// MODAL NAME
// -----------------------------------------------------

const modalName =
  document.getElementById(
    "modalName"
  );


// -----------------------------------------------------
// MODAL MEMBER ID
// -----------------------------------------------------

const modalMember =
  document.getElementById(
    "modalMember"
  );


// -----------------------------------------------------
// MODAL MOBILE
// -----------------------------------------------------

const modalMobile =
  document.getElementById(
    "modalMobile"
  );


// -----------------------------------------------------
// MODAL STAMP COUNT
// -----------------------------------------------------

const modalStamp =
  document.getElementById(
    "modalStamp"
  );


// -----------------------------------------------------
// MODAL REWARD STATUS
// -----------------------------------------------------

const modalReward =
  document.getElementById(
    "modalReward"
  );


// =====================================================
// MODAL ACTION BUTTONS
// =====================================================


// -----------------------------------------------------
// GIVE STAMP
// -----------------------------------------------------

const giveStampBtn =
  document.getElementById(
    "giveStampBtn"
  );


// -----------------------------------------------------
// REMOVE STAMP
// -----------------------------------------------------

const removeStampBtn =
  document.getElementById(
    "removeStampBtn"
  );


// -----------------------------------------------------
// UNLOCK REWARD
// -----------------------------------------------------

const unlockRewardBtn =
  document.getElementById(
    "unlockRewardBtn"
  );


// -----------------------------------------------------
// DELETE CUSTOMER
// -----------------------------------------------------

const deleteCustomerBtn =
  document.getElementById(
    "deleteCustomerBtn"
  );


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================


// -----------------------------------------------------
// ALL CUSTOMERS
// -----------------------------------------------------
// IMPORTANT:
// This variable is declared ONLY in Part 1.
// Do not declare it again in later parts.
// -----------------------------------------------------

let customers = [];


// -----------------------------------------------------
// CURRENTLY SELECTED CUSTOMER
// -----------------------------------------------------
// This holds the customer currently open in modal.
// -----------------------------------------------------

let selectedCustomer = null;


// -----------------------------------------------------
// DASHBOARD LOADING STATE
// -----------------------------------------------------

let customersLoading = false;


// -----------------------------------------------------
// REFRESH PROCESSING STATE
// -----------------------------------------------------

let refreshProcessing = false;


// -----------------------------------------------------
// CUSTOMER ACTION PROCESSING STATE
// -----------------------------------------------------

let customerActionProcessing = false;


// -----------------------------------------------------
// AUTO REFRESH TIMER
// -----------------------------------------------------

let autoRefreshTimer = null;


// -----------------------------------------------------
// AUTHENTICATION STATE
// -----------------------------------------------------

let authenticatedUser = null;


// =====================================================
// SAFE VALUE HELPERS
// =====================================================


// -----------------------------------------------------
// GET CUSTOMER MOBILE
// -----------------------------------------------------

function getCustomerMobile(
  customer
) {

  if (!customer) {

    return "-";

  }


  return (

    customer.mobile ||

    customer.phone ||

    customer.phoneNumber ||

    "-"

  );

}


// -----------------------------------------------------
// GET CUSTOMER STAMP COUNT
// -----------------------------------------------------

function getCustomerStamps(
  customer
) {

  if (!customer) {

    return 0;

  }


  const stamps =
    Number(
      customer.stamps
    );


  if (

    !Number.isFinite(
      stamps
    ) ||

    stamps < 0

  ) {

    return 0;

  }


  return Math.min(

    Math.floor(
      stamps
    ),

    MAX_STAMPS

  );

}


// -----------------------------------------------------
// GET CUSTOMER AVATAR
// -----------------------------------------------------

function getCustomerAvatar(
  customer
) {

  if (!customer) {

    return DEFAULT_MALE_AVATAR;

  }


  // ---------------------------------------------------
  // CHECK CUSTOMER UPLOADED PHOTO
  // ---------------------------------------------------

  const possiblePhotos = [

    customer.photoURL,

    customer.photoUrl,

    customer.photo

  ];


  const validPhoto =

    possiblePhotos.find(

      (photo) =>

        typeof photo === "string" &&

        photo.trim() !== ""

    );


  if (validPhoto) {

    return validPhoto;

  }


  // ---------------------------------------------------
  // FALLBACK BY GENDER
  // ---------------------------------------------------

  const gender =

    String(
      customer.gender || ""
    )
      .trim()
      .toLowerCase();


  if (
    gender === "female"
  ) {

    return DEFAULT_FEMALE_AVATAR;

  }


  return DEFAULT_MALE_AVATAR;

}


// =====================================================
// ESCAPE HTML
// =====================================================
// Prevents customer data from being directly injected
// into HTML without sanitization.
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
// GET TODAY DATE KEY
// =====================================================

function getTodayKey() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =

    String(
      now.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );


  const day =

    String(
      now.getDate()
    )
      .padStart(
        2,
        "0"
      );


  return (

    `${year}-${month}-${day}`

  );

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


  const createdAt =
    customer.createdAt;


  if (!createdAt) {

    return false;

  }


  // ---------------------------------------------------
  // FIRESTORE TIMESTAMP
  // ---------------------------------------------------

  if (

    typeof createdAt.toDate ===
    "function"

  ) {

    const createdDate =
      createdAt.toDate();


    return (

      createdDate.toDateString() ===
      new Date().toDateString()

    );

  }


  // ---------------------------------------------------
  // JAVASCRIPT DATE
  // ---------------------------------------------------

  if (
    createdAt instanceof Date
  ) {

    return (

      createdAt.toDateString() ===
      new Date().toDateString()

    );

  }


  // ---------------------------------------------------
  // STRING / NUMBER DATE
  // ---------------------------------------------------

  const parsedDate =
    new Date(
      createdAt
    );


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return false;

  }


  return (

    parsedDate.toDateString() ===
    new Date().toDateString()

  );

}


// =====================================================
// CHECK REWARD READY
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

    customer.rewardUnlocked === true ||

    getCustomerStamps(
      customer
    ) >= MAX_STAMPS

  );

}


// =====================================================
// RESET CUSTOMER MODAL
// =====================================================

function resetCustomerModal() {

  selectedCustomer =
    null;


  if (modalPhoto) {

    modalPhoto.src =
      DEFAULT_MALE_AVATAR;

    modalPhoto.alt =
      "Customer Photo";

  }


  if (modalName) {

    modalName.textContent =
      "Customer Name";

  }


  if (modalMember) {

    modalMember.textContent =
      "RIO-000000";

  }


  if (modalMobile) {

    modalMobile.textContent =
      "-";

  }


  if (modalStamp) {

    modalStamp.textContent =
      `0 / ${MAX_STAMPS}`;

  }


  if (modalReward) {

    modalReward.textContent =
      "Locked";

  }


  // ---------------------------------------------------
  // RESET ACTION BUTTONS
  // ---------------------------------------------------

  if (giveStampBtn) {

    giveStampBtn.disabled =
      true;

  }


  if (removeStampBtn) {

    removeStampBtn.disabled =
      true;

  }


  if (unlockRewardBtn) {

    unlockRewardBtn.disabled =
      true;

  }


  if (deleteCustomerBtn) {

    deleteCustomerBtn.disabled =
      true;

  }

}


// =====================================================
// INITIAL MODAL STATE
// =====================================================

if (customerModal) {

  customerModal.style.display =
    "none";

}


resetCustomerModal();


// =====================================================
// DEVELOPMENT LOG
// =====================================================

console.log(
  "========================================"
);

console.log(
  "🍜 RIO MAGGI POINT"
);

console.log(
  "Premium Customer Manager"
);

console.log(
  "Admin Customers JS — Part 1"
);

console.log(
  "========================================"
);

console.log(
  "✅ Firebase Config Loaded"
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
  "✅ Global State Ready"
);

console.log(
  "✅ Customer Helper Functions Ready"
);

console.log(
  "✅ Modal Foundation Ready"
);

console.log(
  "➡️ Admin Customers JS Part 1 Loaded"
);

console.log(
  "➡️ Waiting for Part 2..."
);


// =====================================================
// END OF PART 1
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMERS
// ADMIN-CUSTOMERS.JS — PART 2
// CUSTOMER ACTIONS
// GIVE STAMP + REMOVE STAMP + UNLOCK REWARD + DELETE
// CLEAN VERSION — NO DUPLICATE ACTION LOGIC
// =====================================================


// =====================================================
// FIRESTORE IMPORTS
// =====================================================

import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// ACTION BUTTON ELEMENTS
// =====================================================

const giveStampBtn =
  document.getElementById("giveStampBtn");

const removeStampBtn =
  document.getElementById("removeStampBtn");

const unlockRewardBtn =
  document.getElementById("unlockRewardBtn");

const deleteCustomerBtn =
  document.getElementById("deleteCustomerBtn");


// =====================================================
// APPLICATION CONSTANTS
// =====================================================

const MAX_STAMPS = 6;


// =====================================================
// ACTION PROCESSING STATES
// =====================================================

let giveStampProcessing = false;

let removeStampProcessing = false;

let unlockRewardProcessing = false;

let deleteCustomerProcessing = false;


// =====================================================
// GET TODAY DATE KEY
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
// GET CUSTOMER STAMPS
// =====================================================

function getCustomerStamps(
  customer
) {

  if (!customer) {

    return 0;

  }


  const stamps =
    Number(
      customer.stamps
    );


  if (
    !Number.isFinite(stamps) ||
    stamps < 0
  ) {

    return 0;

  }


  return Math.min(
    Math.floor(stamps),
    MAX_STAMPS
  );

}


// =====================================================
// CHECK TODAY'S STAMP
// =====================================================

function hasStampToday(
  customer
) {

  if (!customer) {

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
// GET FRESH CUSTOMER
// =====================================================

async function getFreshCustomer(
  uid
) {

  if (!uid) {

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

      (customer) =>

        customer.uid ===
        updatedCustomer.uid

    );


  if (
    index === -1
  ) {

    customers.push(
      updatedCustomer
    );

  }

  else {

    customers[index] = {

      ...customers[index],

      ...updatedCustomer

    };

  }

}


// =====================================================
// REFRESH CUSTOMER TABLE
// =====================================================

function refreshCustomerTable() {

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

      (customer) => {

        if (!keyword) {

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

          String(
            customer.mobile || ""
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

        );

      }

    );


  filteredCustomers.forEach(
    createRow
  );

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateCustomerStats() {

  const rewardCount =

    customers.filter(

      (customer) =>

        customer.rewardUnlocked === true

    ).length;


  if (totalCustomers) {

    totalCustomers.textContent =
      customers.length;

  }


  if (rewardReady) {

    rewardReady.textContent =
      rewardCount;

  }


  // ---------------------------------------------------
  // TODAY'S CUSTOMERS
  // ---------------------------------------------------
  // createdAt Firestore Timestamp
  // या createdAt Date/String को safely handle करता है.
  // ---------------------------------------------------

  const todayKey =
    getTodayKey();


  const todayCount =

    customers.filter(

      (customer) => {

        if (
          !customer.createdAt
        ) {

          return false;

        }


        let date;


        if (
          typeof customer.createdAt.toDate ===
          "function"
        ) {

          date =
            customer.createdAt.toDate();

        }

        else {

          date =
            new Date(
              customer.createdAt
            );

        }


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return false;

        }


        const year =
          date.getFullYear();


        const month =
          String(
            date.getMonth() + 1
          ).padStart(
            2,
            "0"
          );


        const day =
          String(
            date.getDate()
          ).padStart(
            2,
            "0"
          );


        const customerDate =

          `${year}-${month}-${day}`;


        return (
          customerDate ===
          todayKey
        );

      }

    ).length;


  if (todayJoined) {

    todayJoined.textContent =
      todayCount;

  }

}


// =====================================================
// UPDATE MODAL
// =====================================================

function updateCustomerModal(
  customer
) {

  if (
    !customer
  ) {

    return;

  }


  selectedCustomer =
    customer;


  const stamps =
    getCustomerStamps(
      customer
    );


  if (modalPhoto) {

    modalPhoto.src =

      customer.gender ===
      "female"

        ? "assets/avatars/female.png"

        : "assets/avatars/male.png";

  }


  if (modalName) {

    modalName.textContent =

      customer.name ||

      "-";

  }


  if (modalMember) {

    modalMember.textContent =

      customer.memberId ||

      "-";

  }


  if (modalMobile) {

    modalMobile.textContent =

      customer.mobile ||

      "-";

  }


  if (modalStamp) {

    modalStamp.textContent =

      `${stamps}/${MAX_STAMPS}`;

  }


  if (modalReward) {

    modalReward.textContent =

      customer.rewardUnlocked === true

        ? "Ready"

        : "Locked";

  }

}


// =====================================================
// GIVE STAMP
// =====================================================

async function giveStamp() {

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


  if (
    !auth.currentUser
  ) {

    alert(
      "Admin session expired. Please login again."
    );

    location.href =
      "admin-login.html";

    return;

  }


  giveStampProcessing =
    true;


  if (giveStampBtn) {

    giveStampBtn.disabled =
      true;

    giveStampBtn.innerHTML =
      "Processing...";

  }


  try {

    // -------------------------------------------------
    // ALWAYS FETCH FRESH DATA
    // -------------------------------------------------

    const freshCustomer =
      await getFreshCustomer(
        selectedCustomer.uid
      );


    if (!freshCustomer) {

      throw new Error(
        "Customer not found."
      );

    }


    const currentStamps =
      getCustomerStamps(
        freshCustomer
      );


    // -------------------------------------------------
    // CHECK TODAY'S STAMP
    // -------------------------------------------------

    if (
      hasStampToday(
        freshCustomer
      )
    ) {

      alert(
        "⚠️ This customer has already received today's stamp."
      );

      updateCustomerModal(
        freshCustomer
      );

      return;

    }


    // -------------------------------------------------
    // CHECK MAX STAMPS
    // -------------------------------------------------

    if (
      currentStamps >=
      MAX_STAMPS
    ) {

      alert(
        "🎁 Customer already has 6 stamps. Reward is ready."
      );

      updateCustomerModal(
        freshCustomer
      );

      return;

    }


    const todayKey =
      getTodayKey();


    const newStampCount =

      Math.min(

        currentStamps + 1,

        MAX_STAMPS

      );


    const rewardUnlocked =

      newStampCount >=
      MAX_STAMPS;


    const customerRef =
      doc(

        db,

        "customers",

        freshCustomer.uid

      );


    // -------------------------------------------------
    // FIRESTORE UPDATE
    // -------------------------------------------------

    await updateDoc(

      customerRef,

      {

        stamps:
          newStampCount,

        dailyStampDate:
          todayKey,

        lastStampDate:
          todayKey,

        rewardUnlocked:
          rewardUnlocked,

        updatedAt:
          serverTimestamp(),

        lastStampBy:
          auth.currentUser.uid

      }

    );


    // -------------------------------------------------
    // LOCAL UPDATE
    // -------------------------------------------------

    const updatedCustomer = {

      ...freshCustomer,

      stamps:
        newStampCount,

      dailyStampDate:
        todayKey,

      lastStampDate:
        todayKey,

      rewardUnlocked:
        rewardUnlocked

    };


    updateLocalCustomer(
      updatedCustomer
    );


    updateCustomerModal(
      updatedCustomer
    );


    refreshCustomerTable();

    updateCustomerStats();


    alert(

      rewardUnlocked

        ? "🎉 Stamp Added! Reward is now READY."

        : `✅ Stamp Added Successfully!\n\nStamps: ${newStampCount}/${MAX_STAMPS}`

    );


  }

  catch (error) {

    console.error(
      "❌ Give Stamp Error:",
      error
    );


    alert(
      "❌ Unable to give stamp. Please try again."
    );

  }

  finally {

    giveStampProcessing =
      false;


    if (giveStampBtn) {

      giveStampBtn.disabled =
        false;

      giveStampBtn.innerHTML =

        "➕ Give Stamp";

    }

  }

}


// =====================================================
// REMOVE STAMP
// =====================================================

async function removeStamp() {

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


  if (
    !auth.currentUser
  ) {

    alert(
      "Admin session expired."
    );

    return;

  }


  const confirmed =

    confirm(

      "Are you sure you want to remove one stamp from this customer?"

    );


  if (
    !confirmed
  ) {

    return;

  }


  removeStampProcessing =
    true;


  if (removeStampBtn) {

    removeStampBtn.disabled =
      true;

    removeStampBtn.innerHTML =
      "Processing...";

  }


  try {

    const freshCustomer =
      await getFreshCustomer(
        selectedCustomer.uid
      );


    if (!freshCustomer) {

      throw new Error(
        "Customer not found."
      );

    }


    const currentStamps =
      getCustomerStamps(
        freshCustomer
      );


    if (
      currentStamps <= 0
    ) {

      alert(
        "⚠️ Customer has no stamps to remove."
      );

      return;

    }


    const newStampCount =

      Math.max(

        currentStamps - 1,

        0

      );


    const customerRef =
      doc(

        db,

        "customers",

        freshCustomer.uid

      );


    await updateDoc(

      customerRef,

      {

        stamps:
          newStampCount,

        rewardUnlocked:
          false,

        updatedAt:
          serverTimestamp(),

        lastStampBy:
          auth.currentUser.uid

      }

    );


    const updatedCustomer = {

      ...freshCustomer,

      stamps:
        newStampCount,

      rewardUnlocked:
        false

    };


    updateLocalCustomer(
      updatedCustomer
    );


    updateCustomerModal(
      updatedCustomer
    );


    refreshCustomerTable();

    updateCustomerStats();


    alert(

      `✅ Stamp Removed Successfully!\n\nStamps: ${newStampCount}/${MAX_STAMPS}`

    );

  }

  catch (error) {

    console.error(
      "❌ Remove Stamp Error:",
      error
    );


    alert(
      "❌ Unable to remove stamp."
    );

  }

  finally {

    removeStampProcessing =
      false;


    if (removeStampBtn) {

      removeStampBtn.disabled =
        false;

      removeStampBtn.innerHTML =

        "➖ Remove Stamp";

    }

  }

}


// =====================================================
// UNLOCK REWARD
// =====================================================

async function unlockReward() {

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


  if (
    !auth.currentUser
  ) {

    alert(
      "Admin session expired."
    );

    return;

  }


  const confirmed =

    confirm(

      "Are you sure you want to unlock the reward manually?"

    );


  if (
    !confirmed
  ) {

    return;

  }


  unlockRewardProcessing =
    true;


  if (unlockRewardBtn) {

    unlockRewardBtn.disabled =
      true;

    unlockRewardBtn.innerHTML =
      "Processing...";

  }


  try {

    const freshCustomer =
      await getFreshCustomer(
        selectedCustomer.uid
      );


    if (!freshCustomer) {

      throw new Error(
        "Customer not found."
      );

    }


    const customerRef =
      doc(

        db,

        "customers",

        freshCustomer.uid

      );


    await updateDoc(

      customerRef,

      {

        rewardUnlocked:
          true,

        updatedAt:
          serverTimestamp(),

        rewardUnlockedBy:
          auth.currentUser.uid

      }

    );


    const updatedCustomer = {

      ...freshCustomer,

      rewardUnlocked:
        true

    };


    updateLocalCustomer(
      updatedCustomer
    );


    updateCustomerModal(
      updatedCustomer
    );


    refreshCustomerTable();

    updateCustomerStats();


    alert(
      "🎁 Reward unlocked successfully!"
    );

  }

  catch (error) {

    console.error(
      "❌ Unlock Reward Error:",
      error
    );


    alert(
      "❌ Unable to unlock reward."
    );

  }

  finally {

    unlockRewardProcessing =
      false;


    if (unlockRewardBtn) {

      unlockRewardBtn.disabled =
        false;

      unlockRewardBtn.innerHTML =

        "🎁 Unlock Reward";

    }

  }

}


// =====================================================
// DELETE CUSTOMER
// =====================================================

async function deleteCustomer() {

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


  if (
    !auth.currentUser
  ) {

    alert(
      "Admin session expired."
    );

    return;

  }


  const customerName =

    selectedCustomer.name ||

    "this customer";


  const confirmed =

    confirm(

      `⚠️ DELETE CUSTOMER\n\n` +

      `Are you sure you want to permanently delete ${customerName}?\n\n` +

      `This action cannot be undone.`

    );


  if (
    !confirmed
  ) {

    return;

  }


  deleteCustomerProcessing =
    true;


  if (deleteCustomerBtn) {

    deleteCustomerBtn.disabled =
      true;

    deleteCustomerBtn.innerHTML =
      "Deleting...";

  }


  try {

    const customerRef =
      doc(

        db,

        "customers",

        selectedCustomer.uid

      );


    await deleteDoc(
      customerRef
    );


    customers =

      customers.filter(

        (customer) =>

          customer.uid !==
          selectedCustomer.uid

      );


    selectedCustomer =
      null;


    refreshCustomerTable();

    updateCustomerStats();


    if (modal) {

      modal.style.display =
        "none";

    }


    alert(
      "✅ Customer deleted successfully."
    );

  }

  catch (error) {

    console.error(
      "❌ Delete Customer Error:",
      error
    );


    alert(
      "❌ Unable to delete customer."
    );

  }

  finally {

    deleteCustomerProcessing =
      false;


    if (deleteCustomerBtn) {

      deleteCustomerBtn.disabled =
        false;

      deleteCustomerBtn.innerHTML =

        "🗑 Delete Customer";

    }

  }

}


// =====================================================
// BUTTON EVENTS
// =====================================================

// Give Stamp

giveStampBtn?.addEventListener(

  "click",

  giveStamp

);


// Remove Stamp

removeStampBtn?.addEventListener(

  "click",

  removeStamp

);


// Unlock Reward

unlockRewardBtn?.addEventListener(

  "click",

  unlockReward

);


// Delete Customer

deleteCustomerBtn?.addEventListener(

  "click",

  deleteCustomer

);


// =====================================================
// GLOBAL CUSTOMER ACTION API
// =====================================================
// Other admin modules can access these functions
// without creating duplicate event listeners.

window.adminCustomers = {

  giveStamp,

  removeStamp,

  unlockReward,

  deleteCustomer,

  updateCustomerModal,

  refreshCustomerTable,

  updateCustomerStats

};


// =====================================================
// PART 2 READY
// =====================================================

console.log(
  "✅ Admin Customers Part 2 Loaded"
);

console.log(
  "✅ Give Stamp System Ready"
);

console.log(
  "✅ Remove Stamp System Ready"
);

console.log(
  "✅ Manual Reward Unlock Ready"
);

console.log(
  "✅ Customer Delete System Ready"
);

console.log(
  "✅ Customer Modal Actions Ready"
);

console.log(
  "========================================"
);

console.log(
  "➡️ Waiting for Part 3..."
);

console.log(
  "========================================"


// =====================================================
// END OF PART 2
// =====================================================
  // =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMERS
// ADMIN-CUSTOMERS.JS — PART 3
// AUTO REFRESH + MODAL CLEANUP + UI STATE
// FINAL INTEGRATION CLEANUP
// =====================================================


// =====================================================
// AUTO REFRESH CONFIGURATION
// =====================================================

const CUSTOMER_AUTO_REFRESH_INTERVAL =
  30000;


// =====================================================
// AUTO REFRESH STATE
// =====================================================

let customerAutoRefreshTimer =
  null;

let customerRefreshProcessing =
  false;

let customerPageInitialized =
  false;


// =====================================================
// SAFE LOAD CUSTOMERS
// =====================================================
// Part 1 के loadCustomers() को replace नहीं करता.
// यह wrapper duplicate requests रोकता है.
// =====================================================

async function safeLoadCustomers(
  options = {}
) {

  const {

    preserveSelection = true,

    showLoadingState = false

  } = options;


  if (
    customerRefreshProcessing
  ) {

    return;

  }


  customerRefreshProcessing =
    true;


  const previousSelectedUid =

    preserveSelection &&

    selectedCustomer

      ? selectedCustomer.uid

      : null;


  const originalRefreshContent =

    refreshBtn

      ? refreshBtn.innerHTML

      : "";


  try {

    // -------------------------------------------------
    // REFRESH BUTTON LOADING STATE
    // -------------------------------------------------

    if (
      refreshBtn &&
      showLoadingState
    ) {

      refreshBtn.disabled =
        true;

      refreshBtn.innerHTML = `

        <i
          class="fa-solid fa-spinner fa-spin"
          aria-hidden="true"
        ></i>

        Loading...

      `;

    }


    // -------------------------------------------------
    // LOAD FIRESTORE DATA
    // -------------------------------------------------

    await loadCustomers();


    // -------------------------------------------------
    // RESTORE SELECTED CUSTOMER
    // -------------------------------------------------

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

      }

      else {

        // ---------------------------------------------
        // SELECTED CUSTOMER NO LONGER EXISTS
        // ---------------------------------------------

        selectedCustomer =
          null;


        closeCustomerModal();

      }

    }


    // -------------------------------------------------
    // UPDATE UI
    // -------------------------------------------------

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

            Unable To Load Customers

          </td>

        </tr>

      `;

    }

  }

  finally {

    customerRefreshProcessing =
      false;


    // -------------------------------------------------
    // RESTORE REFRESH BUTTON
    // -------------------------------------------------

    if (
      refreshBtn &&
      showLoadingState
    ) {

      refreshBtn.disabled =
        false;

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
// CLOSE CUSTOMER MODAL
// =====================================================

function closeCustomerModal() {

  if (!modal) {

    return;

  }


  modal.style.display =
    "none";


  // ---------------------------------------------------
  // CLEAR SELECTED CUSTOMER
  // ---------------------------------------------------

  selectedCustomer =
    null;


  // ---------------------------------------------------
  // RESET MODAL CONTENT
  // ---------------------------------------------------

  if (modalPhoto) {

    modalPhoto.src =
      "assets/avatars/male.png";

    modalPhoto.alt =
      "Customer Photo";

  }


  if (modalName) {

    modalName.textContent =
      "Customer Name";

  }


  if (modalMember) {

    modalMember.textContent =
      "RIO-000000";

  }


  if (modalMobile) {

    modalMobile.textContent =
      "-";

  }


  if (modalStamp) {

    modalStamp.textContent =
      `0/${MAX_STAMPS}`;

  }


  if (modalReward) {

    modalReward.textContent =
      "Locked";

  }


  // ---------------------------------------------------
  // RESTORE ACTION BUTTONS
  // ---------------------------------------------------

  syncActionButtons();

}


// =====================================================
// SYNC ACTION BUTTON STATES
// =====================================================

function syncActionButtons() {

  const hasSelectedCustomer = (

    selectedCustomer !== null &&

    selectedCustomer !== undefined &&

    Boolean(
      selectedCustomer.uid
    )

  );


  // ---------------------------------------------------
  // GIVE STAMP BUTTON
  // ---------------------------------------------------

  if (giveStampBtn) {

    const stamps =

      getCustomerStamps(
        selectedCustomer
      );


    const alreadyStampedToday =

      hasStampToday(
        selectedCustomer
      );


    giveStampBtn.disabled = (

      !hasSelectedCustomer ||

      giveStampProcessing ||

      alreadyStampedToday ||

      stamps >= MAX_STAMPS

    );

  }


  // ---------------------------------------------------
  // REMOVE STAMP BUTTON
  // ---------------------------------------------------

  if (removeStampBtn) {

    const stamps =

      getCustomerStamps(
        selectedCustomer
      );


    removeStampBtn.disabled = (

      !hasSelectedCustomer ||

      removeStampProcessing ||

      stamps <= 0

    );

  }


  // ---------------------------------------------------
  // UNLOCK REWARD BUTTON
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // DELETE CUSTOMER BUTTON
  // ---------------------------------------------------

  if (deleteCustomerBtn) {

    deleteCustomerBtn.disabled = (

      !hasSelectedCustomer ||

      deleteCustomerProcessing

    );

  }

}


// =====================================================
// CUSTOMER MODAL OPEN HANDLER
// =====================================================
// Existing Part 1 के viewCustomer() को override नहीं करता.
// सिर्फ modal खुलने के बाद button state sync करता है.
// =====================================================

function handleCustomerModalOpened() {

  syncActionButtons();

}


// =====================================================
// MODAL CLOSE BUTTON
// =====================================================

closeModal?.addEventListener(

  "click",

  () => {

    closeCustomerModal();

  }

);


// =====================================================
// CLOSE MODAL WITH ESCAPE KEY
// =====================================================

document.addEventListener(

  "keydown",

  (event) => {

    if (
      event.key !==
      "Escape"
    ) {

      return;

    }


    if (
      !modal
    ) {

      return;

    }


    const isVisible =

      modal.style.display ===
      "flex";


    if (
      isVisible
    ) {

      closeCustomerModal();

    }

  }

);


// =====================================================
// CLOSE MODAL WHEN CLICKING BACKDROP
// =====================================================

window.addEventListener(

  "click",

  (event) => {

    if (
      event.target !==
      modal
    ) {

      return;

    }


    closeCustomerModal();

  }

);


// =====================================================
// CUSTOMER IMAGE FALLBACK
// =====================================================

modalPhoto?.addEventListener(

  "error",

  () => {

    // -------------------------------------------------
    // PREVENT INFINITE IMAGE ERROR LOOP
    // -------------------------------------------------

    if (
      modalPhoto.dataset.fallbackApplied ===
      "true"
    ) {

      return;

    }


    modalPhoto.dataset.fallbackApplied =
      "true";


    modalPhoto.src =
      "assets/avatars/male.png";

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
// REFRESH BUTTON
// =====================================================
// Part 1 के पुराने refresh listener को हटाना संभव नहीं है,
// इसलिए यह listener duplicate request को safeLoadCustomers()
// के lock से control करता है.
// =====================================================

refreshBtn?.addEventListener(

  "click",

  async () => {

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

);


// =====================================================
// AUTO REFRESH START
// =====================================================

function startCustomerAutoRefresh() {

  // ---------------------------------------------------
  // PREVENT DUPLICATE INTERVAL
  // ---------------------------------------------------

  if (
    customerAutoRefreshTimer
  ) {

    return;

  }


  customerAutoRefreshTimer =

    setInterval(

      async () => {

        // ---------------------------------------------
        // DO NOT REFRESH WHILE ANOTHER REFRESH RUNS
        // ---------------------------------------------

        if (
          customerRefreshProcessing
        ) {

          return;

        }


        // ---------------------------------------------
        // DO NOT REFRESH IF PAGE IS HIDDEN
        // ---------------------------------------------

        if (
          document.hidden
        ) {

          return;

        }


        await safeLoadCustomers({

          preserveSelection:
            true,

          showLoadingState:
            false

        });

      },

      CUSTOMER_AUTO_REFRESH_INTERVAL

    );


  console.log(
    "✅ Customer Auto Refresh Started"
  );

}


// =====================================================
// STOP CUSTOMER AUTO REFRESH
// =====================================================

function stopCustomerAutoRefresh() {

  if (
    !customerAutoRefreshTimer
  ) {

    return;

  }


  clearInterval(
    customerAutoRefreshTimer
  );


  customerAutoRefreshTimer =
    null;


  console.log(
    "⏹️ Customer Auto Refresh Stopped"
  );

}


// =====================================================
// PAGE VISIBILITY HANDLER
// =====================================================

document.addEventListener(

  "visibilitychange",

  async () => {

    // -------------------------------------------------
    // PAGE BECOMES VISIBLE
    // -------------------------------------------------

    if (
      !document.hidden
    ) {

      if (
        !customerRefreshProcessing
      ) {

        await safeLoadCustomers({

          preserveSelection:
            true,

          showLoadingState:
            false

        });

      }

      return;

    }


    // -------------------------------------------------
    // PAGE BECOMES HIDDEN
    // -------------------------------------------------

    // Interval चलता रह सकता है लेकिन callback ऊपर
    // document.hidden check करके Firestore request रोकेगा.

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
// CUSTOMER PAGE INITIALIZATION
// =====================================================

function initializeCustomerPage() {

  if (
    customerPageInitialized
  ) {

    return;

  }


  customerPageInitialized =
    true;


  // ---------------------------------------------------
  // INITIAL ACTION BUTTON STATE
  // ---------------------------------------------------

  syncActionButtons();


  // ---------------------------------------------------
  // START AUTO REFRESH
  // ---------------------------------------------------

  startCustomerAutoRefresh();


  console.log(
    "✅ Customer Manager UI Initialized"
  );

}


// =====================================================
// AUTHENTICATION-SAFE INITIALIZATION
// =====================================================

onAuthStateChanged(

  auth,

  (user) => {

    if (
      !user
    ) {

      stopCustomerAutoRefresh();

      return;

    }


    initializeCustomerPage();

  }

);


// =====================================================
// EXTEND EXISTING GLOBAL API
// =====================================================

if (
  window.adminCustomers
) {

  Object.assign(

    window.adminCustomers,

    {

      closeCustomerModal,

      syncActionButtons,

      safeLoadCustomers,

      startCustomerAutoRefresh,

      stopCustomerAutoRefresh

    }

  );

}

else {

  // ---------------------------------------------------
  // FALLBACK ONLY
  // ---------------------------------------------------
  // अगर Part 2 किसी कारण से load नहीं हुआ,
  // तो नया object बनाया जाएगा.
  // ---------------------------------------------------

  window.adminCustomers = {

    closeCustomerModal,

    syncActionButtons,

    safeLoadCustomers,

    startCustomerAutoRefresh,

    stopCustomerAutoRefresh

  };

}


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
  "✅ Safe Customer Refresh Ready"
);

console.log(
  "✅ Modal Cleanup Ready"
);

console.log(
  "✅ Escape Key Modal Close Ready"
);

console.log(
  "✅ Customer Image Fallback Ready"
);

console.log(
  "✅ Action Button State Sync Ready"
);

console.log(
  "✅ Auto Refresh Protection Ready"
);

console.log(
  "✅ Page Visibility Refresh Protection Ready"
);

console.log(
  "✅ Final Customer Manager Integration Ready"
);

console.log(
  "========================================"
);

console.log(
  "🎉 ADMIN-CUSTOMERS.JS PART 1–3 COMPLETE"
);

console.log(
  "========================================"
);


// =====================================================
// END OF PART 3
// =====================================================
