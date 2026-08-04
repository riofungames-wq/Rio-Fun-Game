// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 1
// CORE CONFIG + DOM + STATE + AUTH + NAVIGATION
// CLEAN FOUNDATION
// =====================================================


// =====================================================
// FIREBASE IMPORTS
// =====================================================

import {
  auth,
  db
} from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


// =====================================================
// ADMIN LOGIN PAGE
// =====================================================

const ADMIN_LOGIN_PAGE =
  "./admin-login.html";


// =====================================================
// LOYALTY CONFIGURATION
// =====================================================

const MAX_STAMPS =
  6;


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================

let currentCustomer =
  null;

let customers =
  [];

let currentSection =
  "dashboard";

let stampActionProcessing =
  false;

let logoutProcessing =
  false;

let scannerRunning =
  false;

let html5QrCode =
  null;


// =====================================================
// DOM ELEMENT REFERENCES
// =====================================================

// -----------------------------------------------------
// NAVIGATION
// -----------------------------------------------------

const navButtons =
  document.querySelectorAll(
    "[data-section]"
  );


// -----------------------------------------------------
// MAIN SECTIONS
// -----------------------------------------------------

const dashboardSection =
  document.getElementById(
    "dashboardSection"
  );

const scannerSection =
  document.getElementById(
    "scannerSection"
  );

const customersSection =
  document.getElementById(
    "customersSection"
  );

const stampsSection =
  document.getElementById(
    "stampsSection"
  );

const rewardsSection =
  document.getElementById(
    "rewardsSection"
  );

const reportsSection =
  document.getElementById(
    "reportsSection"
  );

const settingsSection =
  document.getElementById(
    "settingsSection"
  );


// -----------------------------------------------------
// SCANNER
// -----------------------------------------------------

const startScannerBtn =
  document.getElementById(
    "startScannerBtn"
  );

const stopScannerBtn =
  document.getElementById(
    "stopScannerBtn"
  );

const scannerStatus =
  document.getElementById(
    "scannerStatus"
  );

const qrReader =
  document.getElementById(
    "qr-reader"
  );


// -----------------------------------------------------
// CUSTOMER PREVIEW
// -----------------------------------------------------

const customerPreview =
  document.getElementById(
    "customerPreview"
  );

const customerPhoto =
  document.getElementById(
    "customerPhoto"
  );

const customerName =
  document.getElementById(
    "customerName"
  );

const customerMemberId =
  document.getElementById(
    "customerMemberId"
  );

const customerMobile =
  document.getElementById(
    "customerMobile"
  );

const customerStamps =
  document.getElementById(
    "customerStamps"
  );

const customerDailyStatus =
  document.getElementById(
    "customerDailyStatus"
  );

const giveStampBtn =
  document.getElementById(
    "giveStampBtn"
  );

const resetCustomerBtn =
  document.getElementById(
    "resetCustomerBtn"
  );


// -----------------------------------------------------
// CUSTOMER SEARCH
// -----------------------------------------------------

const searchCustomer =
  document.getElementById(
    "searchCustomer"
  );

const customerTableBody =
  document.getElementById(
    "customerTableBody"
  );

const refreshCustomersBtn =
  document.getElementById(
    "refreshCustomersBtn"
  );

const exportCustomersBtn =
  document.getElementById(
    "exportCustomersBtn"
  );


// -----------------------------------------------------
// LOGOUT
// -----------------------------------------------------

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );


// =====================================================
// DASHBOARD STATISTICS ELEMENTS
// =====================================================

const totalCustomersElement =
  document.getElementById(
    "totalCustomers"
  );

const totalStampsElement =
  document.getElementById(
    "totalStamps"
  );

const rewardsReadyElement =
  document.getElementById(
    "rewardsReady"
  );

const todaysScansElement =
  document.getElementById(
    "todaysScans"
  );


// =====================================================
// LAST REFRESH
// =====================================================

const lastRefreshElement =
  document.getElementById(
    "lastRefresh"
  );


// =====================================================
// NAVIGATION SECTION MAP
// =====================================================

const sectionMap = {

  dashboard:
    dashboardSection,

  scanner:
    scannerSection,

  customers:
    customersSection,

  stamps:
    stampsSection,

  rewards:
    rewardsSection,

  reports:
    reportsSection,

  settings:
    settingsSection

};


// =====================================================
// SHOW DASHBOARD SECTION
// =====================================================

function showSection(
  sectionName
) {

  const targetSection =
    sectionMap[
      sectionName
    ];


  if (!targetSection) {

    console.warn(
      "⚠️ Section not found:",
      sectionName
    );

    return;

  }


  // ---------------------------------------------------
  // HIDE ALL SECTIONS
  // ---------------------------------------------------

  Object.values(
    sectionMap
  ).forEach(
    section => {

      if (!section) {
        return;
      }

      section.classList.remove(
        "active"
      );

      section.hidden =
        true;

    }
  );


  // ---------------------------------------------------
  // SHOW TARGET SECTION
  // ---------------------------------------------------

  targetSection.hidden =
    false;

  targetSection.classList.add(
    "active"
  );


  // ---------------------------------------------------
  // UPDATE ACTIVE NAV BUTTON
  // ---------------------------------------------------

  navButtons.forEach(
    button => {

      const buttonSection =
        button.dataset.section;


      button.classList.toggle(

        "active",

        buttonSection ===
        sectionName

      );

    }
  );


  // ---------------------------------------------------
  // UPDATE CURRENT SECTION
  // ---------------------------------------------------

  currentSection =
    sectionName;


  // ---------------------------------------------------
  // UPDATE URL HASH
  // ---------------------------------------------------

  try {

    history.replaceState(

      null,

      "",

      `#${sectionName}`

    );

  }

  catch (error) {

    console.warn(
      "⚠️ Unable to update URL hash:",
      error
    );

  }


  console.log(
    "📍 Active Section:",
    sectionName
  );

}


// =====================================================
// NAVIGATION EVENT LISTENER
// =====================================================

navButtons.forEach(
  button => {

    if (
      button.dataset.navigationAttached ===
      "true"
    ) {

      return;

    }


    button.addEventListener(

      "click",

      event => {

        event.preventDefault();


        const sectionName =
          button.dataset.section;


        if (!sectionName) {

          return;

        }


        showSection(
          sectionName
        );

      }

    );


    button.dataset.navigationAttached =
      "true";

  }
);


// =====================================================
// INITIAL SECTION
// =====================================================

function initializeNavigation() {

  const hash =
    window.location.hash
      .replace(
        "#",
        ""
      )
      .trim();


  if (
    hash &&
    sectionMap[hash]
  ) {

    showSection(
      hash
    );

  }

  else {

    showSection(
      "dashboard"
    );

  }

}


// =====================================================
// AUTHENTICATION CHECK
// =====================================================

function initializeAdminAuth() {

  onAuthStateChanged(

    auth,

    user => {

      if (!user) {

        console.warn(
          "⚠️ Admin not authenticated."
        );


        location.replace(
          ADMIN_LOGIN_PAGE
        );


        return;

      }


      console.log(
        "✅ Admin authenticated:",
        user.uid
      );


      initializeDashboard();

    }

  );

}


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

function initializeDashboard() {

  initializeNavigation();


  console.log(
    "✅ Admin Dashboard Core Initialized"
  );


  console.log(
    "✅ Firebase Database Ready"
  );


  console.log(
    "✅ Navigation System Ready"
  );


  console.log(
    "✅ Authentication System Ready"
  );

}


// =====================================================
// DOM READY INITIALIZATION
// =====================================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(

    "DOMContentLoaded",

    initializeAdminAuth,

    {
      once: true
    }

  );

}

else {

  initializeAdminAuth();

}


// =====================================================
// PART 1 READY
// =====================================================

console.log(
  "========================================"
);

console.log(
  "✅ ADMIN DASHBOARD PART 1 LOADED"
);

console.log(
  "✅ Core State Ready"
);

console.log(
  "✅ DOM References Ready"
);

console.log(
  "✅ Navigation Ready"
);

console.log(
  "✅ Section Switching Ready"
);

console.log(
  "✅ Firebase Auth Ready"
);

console.log(
  "========================================"
);


// =====================================================
// END OF PART 1
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 2
// CUSTOMER DATA + LOCAL STATE + SEARCH + STATISTICS
// CLEAN VERSION — NO DUPLICATE LISTENERS
// =====================================================


// =====================================================
// CUSTOMER DATA CONFIGURATION
// =====================================================

const CUSTOMERS_COLLECTION =
  "customers";


// =====================================================
// GET CUSTOMER STAMP COUNT
// =====================================================
// Centralized stamp normalization.
// All other parts must use this function.
// Do NOT create another getCustomerStamps() function.
// =====================================================

function getCustomerStamps(
  customer
) {

  if (!customer) {

    return 0;

  }


  const possibleValues = [

    customer.stamps,

    customer.stampCount,

    customer.totalStamps

  ];


  for (
    const value of possibleValues
  ) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      continue;

    }


    const numericValue =
      Number(value);


    if (
      Number.isFinite(
        numericValue
      )
    ) {

      return Math.max(

        0,

        Math.min(

          MAX_STAMPS,

          Math.floor(
            numericValue
          )

        )

      );

    }

  }


  return 0;

}


// =====================================================
// GET CUSTOMER MEMBER ID
// =====================================================

function getCustomerMemberId(
  customer
) {

  if (!customer) {

    return "";

  }


  return String(

    customer.memberId ||

    customer.memberID ||

    customer.member_id ||

    ""

  ).trim();

}


// =====================================================
// GET CUSTOMER NAME
// =====================================================

function getCustomerName(
  customer
) {

  if (!customer) {

    return "";

  }


  return String(

    customer.name ||

    customer.fullName ||

    customer.displayName ||

    ""

  ).trim();

}


// =====================================================
// GET CUSTOMER MOBILE
// =====================================================

function getCustomerMobile(
  customer
) {

  if (!customer) {

    return "";

  }


  return String(

    customer.mobile ||

    customer.phone ||

    customer.phoneNumber ||

    ""

  ).trim();

}


// =====================================================
// GET CUSTOMER PHOTO
// =====================================================

function getCustomerPhoto(
  customer
) {

  if (!customer) {

    return "";

  }


  return (

    customer.photoURL ||

    customer.photoUrl ||

    customer.photo ||

    customer.profilePhoto ||

    ""

  );

}


// =====================================================
// NORMALIZE CUSTOMER OBJECT
// =====================================================
// Every customer entering the application goes through
// this function so data remains consistent.
// =====================================================

function normalizeCustomer(
  customer,
  uid = ""
) {

  if (!customer) {

    return null;

  }


  const normalizedCustomer = {

    ...customer,

    uid:
      customer.uid ||
      uid ||

      "",

    name:
      getCustomerName(
        customer
      ),

    memberId:
      getCustomerMemberId(
        customer
      ),

    mobile:
      getCustomerMobile(
        customer
      ),

    stamps:
      getCustomerStamps(
        customer
      ),

    photoURL:
      getCustomerPhoto(
        customer
      )

  };


  return normalizedCustomer;

}


// =====================================================
// GET TODAY KEY
// =====================================================
// Format:
// YYYY-MM-DD
//
// Uses local browser date so daily stamp protection
// remains consistent with the admin's local day.
// =====================================================

function getTodayKey() {

  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(

      today.getMonth() + 1

    ).padStart(

      2,

      "0"

    );


  const day =
    String(

      today.getDate()

    ).padStart(

      2,

      "0"

    );


  return (

    `${year}-${month}-${day}`

  );

}


// =====================================================
// CHECK TODAY'S STAMP
// =====================================================
// Centralized daily stamp check.
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
// FIND CUSTOMER BY UID
// =====================================================

function findCustomerByUid(
  uid
) {

  if (!uid) {

    return null;

  }


  return (

    customers.find(

      customer =>

        customer &&
        customer.uid === uid

    ) ||

    null

  );

}


// =====================================================
// UPSERT CUSTOMER INTO LOCAL ARRAY
// =====================================================
// Adds a new customer or updates an existing customer.
// No duplicate customer entries.
// =====================================================

function upsertLocalCustomer(
  customer
) {

  if (!customer) {

    return;

  }


  const normalizedCustomer =

    normalizeCustomer(
      customer,
      customer.uid
    );


  if (
    !normalizedCustomer ||
    !normalizedCustomer.uid
  ) {

    console.warn(
      "⚠️ Cannot sync customer without UID."
    );

    return;

  }


  const existingIndex =

    customers.findIndex(

      item =>

        item &&
        item.uid ===
        normalizedCustomer.uid

    );


  if (
    existingIndex === -1
  ) {

    customers.push(
      normalizedCustomer
    );

  }

  else {

    customers[
      existingIndex
    ] = {

      ...customers[
        existingIndex
      ],

      ...normalizedCustomer

    };

  }

}


// =====================================================
// REPLACE LOCAL CUSTOMER ARRAY
// =====================================================

function setLocalCustomers(
  customerList
) {

  if (
    !Array.isArray(
      customerList
    )
  ) {

    customers =
      [];

    return;

  }


  const uniqueCustomers =
    new Map();


  customerList.forEach(

    customer => {

      const normalizedCustomer =

        normalizeCustomer(
          customer,
          customer?.uid
        );


      if (
        !normalizedCustomer ||
        !normalizedCustomer.uid
      ) {

        return;

      }


      uniqueCustomers.set(

        normalizedCustomer.uid,

        normalizedCustomer

      );

    }

  );


  customers =
    Array.from(
      uniqueCustomers.values()
    );

}


// =====================================================
// FILTER CUSTOMERS
// =====================================================

function filterCustomers(
  searchValue = ""
) {

  const searchText =

    String(
      searchValue || ""
    )
      .trim()
      .toLowerCase();


  if (!searchText) {

    return [

      ...customers

    ];

  }


  return customers.filter(

    customer => {

      const name =

        getCustomerName(
          customer
        )
          .toLowerCase();


      const memberId =

        getCustomerMemberId(
          customer
        )
          .toLowerCase();


      const mobile =

        getCustomerMobile(
          customer
        )
          .toLowerCase();


      return (

        name.includes(
          searchText
        )

        ||

        memberId.includes(
          searchText
        )

        ||

        mobile.includes(
          searchText
        )

      );

    }

  );

}


// =====================================================
// UPDATE DASHBOARD STATISTICS
// =====================================================

function updateDashboardStats() {

  const totalCustomers =
    customers.length;


  const totalStamps =

    customers.reduce(

      (
        total,
        customer
      ) => {

        return (

          total +

          getCustomerStamps(
            customer
          )

        );

      },

      0

    );


  const rewardsReady =

    customers.filter(

      customer =>

        getCustomerStamps(
          customer
        ) >= MAX_STAMPS

        ||

        customer.rewardUnlocked ===
        true

    ).length;


  const todayKey =
    getTodayKey();


  const todaysScans =

    customers.filter(

      customer =>

        customer.dailyStampDate ===
        todayKey

        ||

        customer.lastStampDate ===
        todayKey

    ).length;


  // ---------------------------------------------------
  // UPDATE TOTAL CUSTOMERS
  // ---------------------------------------------------

  if (
    totalCustomersElement
  ) {

    totalCustomersElement.textContent =
      totalCustomers;

  }


  // ---------------------------------------------------
  // UPDATE TOTAL STAMPS
  // ---------------------------------------------------

  if (
    totalStampsElement
  ) {

    totalStampsElement.textContent =
      totalStamps;

  }


  // ---------------------------------------------------
  // UPDATE REWARDS READY
  // ---------------------------------------------------

  if (
    rewardsReadyElement
  ) {

    rewardsReadyElement.textContent =
      rewardsReady;

  }


  // ---------------------------------------------------
  // UPDATE TODAY'S SCANS
  // ---------------------------------------------------

  if (
    todaysScansElement
  ) {

    todaysScansElement.textContent =
      todaysScans;

  }


  console.log(

    "📊 Dashboard Statistics Updated",

    {

      totalCustomers,

      totalStamps,

      rewardsReady,

      todaysScans

    }

  );

}


// =====================================================
// UPDATE LAST REFRESH TIME
// =====================================================

function updateLastRefresh() {

  if (
    !lastRefreshElement
  ) {

    return;

  }


  const now =
    new Date();


  lastRefreshElement.textContent =

    now.toLocaleString(

      "en-IN",

      {

        dateStyle:
          "medium",

        timeStyle:
          "short"

      }

    );

}


// =====================================================
// RENDER CUSTOMER TABLE
// =====================================================

function renderCustomerTable(
  customerList = customers
) {

  if (
    !customerTableBody
  ) {

    console.warn(
      "⚠️ Customer table body not found."
    );

    return;

  }


  customerTableBody.innerHTML =
    "";


  if (
    !Array.isArray(
      customerList
    ) ||

    customerList.length === 0
  ) {

    const emptyRow =
      document.createElement(
        "tr"
      );


    emptyRow.innerHTML = `

      <td
        colspan="7"
        class="empty-table-message"
      >
        No customers found.
      </td>

    `;


    customerTableBody.appendChild(
      emptyRow
    );


    return;

  }


  customerList.forEach(

    customer => {

      const row =
        document.createElement(
          "tr"
        );


      const stamps =
        getCustomerStamps(
          customer
        );


      const rewardReady =

        stamps >= MAX_STAMPS

        ||

        customer.rewardUnlocked ===
        true;


      const photo =
        getCustomerPhoto(
          customer
        );


      const safePhoto =

        photo ||

        "./assets/default-profile.png";


      row.innerHTML = `

        <td>

          <img

            src="${safePhoto}"

            alt="Customer Photo"

            class="customer-table-photo"

            loading="lazy"

            onerror="this.onerror=null;this.src='./assets/default-profile.png';"

          >

        </td>


        <td>

          ${escapeHtml(

            getCustomerName(
              customer
            ) ||

            "Unknown Customer"

          )}

        </td>


        <td>

          ${escapeHtml(

            getCustomerMemberId(
              customer
            ) ||

            "—"

          )}

        </td>


        <td>

          ${escapeHtml(

            getCustomerMobile(
              customer
            ) ||

            "—"

          )}

        </td>


        <td>

          <strong>

            ${stamps}/${MAX_STAMPS}

          </strong>

        </td>


        <td>

          <span

            class="reward-status ${
              rewardReady
                ? "ready"
                : "locked"
            }"

          >

            ${
              rewardReady
                ? "Ready"
                : "Locked"
            }

          </span>

        </td>


        <td>

          <button

            type="button"

            class="customer-action-btn"

            data-customer-action="select"

            data-customer-uid="${escapeHtml(

              customer.uid

            )}"

          >

            Select

          </button>

        </td>

      `;


      customerTableBody.appendChild(
        row
      );

    }

  );

}


// =====================================================
// ESCAPE HTML
// =====================================================
// Prevents customer data from being injected as HTML.
// =====================================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
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
// SELECT CUSTOMER FROM TABLE
// =====================================================

function selectCustomerByUid(
  uid
) {

  const customer =
    findCustomerByUid(
      uid
    );


  if (!customer) {

    alert(
      "❌ Customer not found."
    );

    return;

  }


  currentCustomer =
    customer;


  if (
    typeof showCustomer ===
    "function"
  ) {

    showCustomer(
      customer
    );

  }


  if (
    typeof showSection ===
    "function"
  ) {

    showSection(
      "scanner"
    );

  }


  console.log(
    "✅ Customer selected:",
    customer
  );

}


// =====================================================
// CUSTOMER TABLE EVENT DELEGATION
// =====================================================
// One listener only for all dynamic customer rows.
// =====================================================

if (
  customerTableBody &&

  customerTableBody.dataset.listenerAttached !==
  "true"
) {

  customerTableBody.addEventListener(

    "click",

    event => {

      const actionButton =

        event.target.closest(

          "[data-customer-action]"

        );


      if (
        !actionButton
      ) {

        return;

      }


      const action =

        actionButton.dataset
          .customerAction;


      const uid =

        actionButton.dataset
          .customerUid;


      if (
        action ===
        "select"
      ) {

        selectCustomerByUid(
          uid
        );

      }

    }

  );


  customerTableBody.dataset.listenerAttached =
    "true";

}


// =====================================================
// CUSTOMER SEARCH EVENT
// =====================================================
// One listener only.
// =====================================================

if (
  searchCustomer &&

  searchCustomer.dataset.listenerAttached !==
  "true"
) {

  searchCustomer.addEventListener(

    "input",

    () => {

      const filteredCustomers =

        filterCustomers(

          searchCustomer.value

        );


      renderCustomerTable(

        filteredCustomers

      );

    }

  );


  searchCustomer.dataset.listenerAttached =
    "true";

}


// =====================================================
// PART 2 READY
// =====================================================

console.log(
  "========================================"
);

console.log(
  "✅ ADMIN DASHBOARD PART 2 LOADED"
);

console.log(
  "✅ Customer Normalization Ready"
);

console.log(
  "✅ Stamp Count Normalization Ready"
);

console.log(
  "✅ Daily Stamp Protection Helper Ready"
);

console.log(
  "✅ Local Customer Store Ready"
);

console.log(
  "✅ Duplicate Customer Protection Ready"
);

console.log(
  "✅ Customer Search Ready"
);

console.log(
  "✅ Customer Table Rendering Ready"
);

console.log(
  "✅ Dashboard Statistics Ready"
);

console.log(
  "✅ Dynamic Customer Action Ready"
);

console.log(
  "========================================"
);


// =====================================================
// END OF PART 2
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 3
// CUSTOMER SEARCH + TABLE + DASHBOARD STATS
// CUSTOMER PREVIEW + LOCAL DATA SYNC
// CLEAN / NO DUPLICATE LISTENERS
// =====================================================


// =====================================================
// CUSTOMER DATA HELPERS
// =====================================================

function getCustomerStamps(customer) {

  if (!customer) {
    return 0;
  }

  const possibleValues = [

    customer.stamps,

    customer.stampCount,

    customer.totalStamps,

    customer.loyaltyStamps

  ];

  for (const value of possibleValues) {

    const number =
      Number(value);

    if (
      Number.isFinite(number) &&
      number >= 0
    ) {

      return Math.min(
        Math.floor(number),
        MAX_STAMPS
      );

    }

  }

  return 0;

}


// =====================================================
// GET CUSTOMER DISPLAY NAME
// =====================================================

function getCustomerDisplayName(customer) {

  if (!customer) {
    return "Unknown Customer";
  }

  return (

    customer.name ||

    customer.fullName ||

    customer.displayName ||

    "Unknown Customer"

  );

}


// =====================================================
// GET CUSTOMER MEMBER ID
// =====================================================

function getCustomerMemberId(customer) {

  if (!customer) {
    return "RIO-000000000";
  }

  return (

    String(
      customer.memberId ||
      customer.memberID ||
      customer.membershipId ||
      customer.uid ||
      ""
    ).trim() ||

    "RIO-000000000"

  );

}


// =====================================================
// GET CUSTOMER MOBILE
// =====================================================

function getCustomerMobile(customer) {

  if (!customer) {
    return "-";
  }

  return (

    customer.mobile ||

    customer.mobileNumber ||

    customer.phone ||

    customer.phoneNumber ||

    "-"

  );

}


// =====================================================
// GET CUSTOMER PHOTO
// =====================================================

function getCustomerPhoto(customer) {

  if (!customer) {
    return "";
  }

  return (

    customer.photoURL ||

    customer.photoUrl ||

    customer.photo ||

    customer.profilePhoto ||

    customer.image ||

    ""

  );

}


// =====================================================
// GET REWARD STATUS
// =====================================================

function isCustomerRewardReady(customer) {

  if (!customer) {
    return false;
  }

  const stamps =
    getCustomerStamps(customer);

  return (

    customer.rewardUnlocked === true ||

    customer.rewardReady === true ||

    stamps >= MAX_STAMPS

  );

}


// =====================================================
// CHECK TODAY'S STAMP
// =====================================================

function hasStampToday(customer) {

  if (!customer) {
    return false;
  }

  const todayKey =
    typeof getTodayKey === "function"
      ? getTodayKey()
      : "";

  if (!todayKey) {
    return false;
  }

  return (

    customer.dailyStampDate === todayKey ||

    customer.lastStampDate === todayKey

  );

}


// =====================================================
// NORMALIZE CUSTOMER OBJECT
// =====================================================

function normalizeCustomer(customer, uid = "") {

  if (!customer) {
    return null;
  }

  const normalized = {

    ...customer,

    uid:
      customer.uid ||
      uid ||
      "",

    name:
      getCustomerDisplayName(customer),

    memberId:
      getCustomerMemberId(customer),

    mobile:
      getCustomerMobile(customer),

    stamps:
      getCustomerStamps(customer),

    rewardUnlocked:
      isCustomerRewardReady(customer)

  };

  return normalized;

}


// =====================================================
// UPSERT CUSTOMER INTO LOCAL ARRAY
// =====================================================

function upsertLocalCustomer(customer) {

  if (!customer) {
    return;
  }

  const normalizedCustomer =
    normalizeCustomer(
      customer,
      customer.uid
    );

  if (!normalizedCustomer) {
    return;
  }

  if (
    !Array.isArray(customers)
  ) {

    customers = [];

  }

  const existingIndex =
    customers.findIndex(
      item =>
        item &&
        normalizedCustomer.uid &&
        item.uid ===
        normalizedCustomer.uid
    );

  if (
    existingIndex >= 0
  ) {

    customers[
      existingIndex
    ] = {

      ...customers[
        existingIndex
      ],

      ...normalizedCustomer

    };

  }

  else {

    customers.push(
      normalizedCustomer
    );

  }

}


// =====================================================
// FILTER CUSTOMERS
// =====================================================

function filterCustomers(searchValue = "") {

  if (
    !Array.isArray(customers)
  ) {

    return [];

  }

  const value =
    String(
      searchValue || ""
    )
      .trim()
      .toLowerCase();

  if (!value) {

    return [
      ...customers
    ];

  }

  return customers.filter(
    customer => {

      if (!customer) {
        return false;
      }

      const name =
        String(
          getCustomerDisplayName(customer)
        )
          .toLowerCase();

      const memberId =
        String(
          getCustomerMemberId(customer)
        )
          .toLowerCase();

      const mobile =
        String(
          getCustomerMobile(customer)
        )
          .toLowerCase();

      return (

        name.includes(value) ||

        memberId.includes(value) ||

        mobile.includes(value)

      );

    }
  );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

  return String(
    value ?? ""
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
// GET CUSTOMER ROW ACTION
// =====================================================

function getCustomerActionButton(customer) {

  if (!customer) {
    return "";
  }

  const uid =
    String(
      customer.uid || ""
    );

  if (!uid) {
    return "";
  }

  return `

    <button
      type="button"
      class="customer-action-btn"
      data-action="select-customer"
      data-customer-id="${escapeHTML(uid)}"
      title="Select Customer"
    >

      <i
        class="fa-solid fa-eye"
        aria-hidden="true"
      ></i>

      <span>
        View
      </span>

    </button>

  `;

}


// =====================================================
// RENDER CUSTOMER TABLE
// =====================================================

function renderCustomerTable(
  customerList = customers
) {

  if (!customerTableBody) {
    return;
  }

  const list =
    Array.isArray(customerList)
      ? customerList
      : [];

  if (
    list.length === 0
  ) {

    customerTableBody.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="empty-table-state"
        >

          <div class="empty-state-content">

            <i
              class="fa-solid fa-users-slash"
              aria-hidden="true"
            ></i>

            <span>
              No customers found
            </span>

          </div>

        </td>

      </tr>

    `;

    return;

  }


  customerTableBody.innerHTML =

    list
      .map(
        customer => {

          const stamps =
            getCustomerStamps(
              customer
            );

          const rewardReady =
            isCustomerRewardReady(
              customer
            );

          const photo =
            getCustomerPhoto(
              customer
            );

          const customerName =
            getCustomerDisplayName(
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

          return `

            <tr
              data-customer-id="${escapeHTML(customer.uid || "")}"
            >

              <td>

                ${
                  photo

                    ? `

                      <img
                        src="${escapeHTML(photo)}"
                        alt="${escapeHTML(customerName)}"
                        class="customer-table-photo"
                        loading="lazy"
                      >

                    `

                    : `

                      <div
                        class="customer-table-photo customer-photo-placeholder"
                      >

                        <i
                          class="fa-solid fa-user"
                          aria-hidden="true"
                        ></i>

                      </div>

                    `
                }

              </td>


              <td>

                <strong>
                  ${escapeHTML(customerName)}
                </strong>

              </td>


              <td>

                ${escapeHTML(memberId)}

              </td>


              <td>

                ${escapeHTML(mobile)}

              </td>


              <td>

                <span
                  class="stamp-count-badge"
                >

                  ${stamps}/${MAX_STAMPS}

                </span>

              </td>


              <td>

                ${
                  rewardReady

                    ? `

                      <span
                        class="reward-status ready"
                      >

                        <i
                          class="fa-solid fa-gift"
                          aria-hidden="true"
                        ></i>

                        Ready

                      </span>

                    `

                    : `

                      <span
                        class="reward-status pending"
                      >

                        Pending

                      </span>

                    `
                }

              </td>


              <td>

                ${getCustomerActionButton(customer)}

              </td>

            </tr>

          `;

        }
      )
      .join("");

}


// =====================================================
// SHOW CUSTOMER PREVIEW
// =====================================================

function showCustomer(customer) {

  if (!customer) {
    return;
  }

  const normalized =
    normalizeCustomer(
      customer,
      customer.uid
    );

  if (!normalized) {
    return;
  }

  currentCustomer =
    normalized;


  // ===================================================
  // CUSTOMER NAME
  // ===================================================

  if (customerName) {

    customerName.textContent =
      getCustomerDisplayName(
        normalized
      );

  }


  // ===================================================
  // MEMBER ID
  // ===================================================

  if (customerMemberId) {

    customerMemberId.textContent =
      getCustomerMemberId(
        normalized
      );

  }


  // ===================================================
  // MOBILE
  // ===================================================

  if (customerMobile) {

    customerMobile.textContent =
      getCustomerMobile(
        normalized
      );

  }


  // ===================================================
  // STAMP COUNT
  // ===================================================

  const stamps =
    getCustomerStamps(
      normalized
    );


  if (currentStampsElement) {

    currentStampsElement.textContent =
      stamps;

  }


  if (stampProgressText) {

    stampProgressText.textContent =

      `${stamps} / ${MAX_STAMPS}`;

  }


  // ===================================================
  // STAMP PROGRESS
  // ===================================================

  if (stampProgressBar) {

    const percentage =

      Math.min(

        100,

        Math.max(

          0,

          (
            stamps /
            MAX_STAMPS
          ) *
          100

        )

      );

    stampProgressBar.style.width =

      `${percentage}%`;

  }


  // ===================================================
  // CUSTOMER PHOTO
  // ===================================================

  if (customerPhoto) {

    const photo =
      getCustomerPhoto(
        normalized
      );

    if (photo) {

      customerPhoto.src =
        photo;

      customerPhoto.alt =
        getCustomerDisplayName(
          normalized
        );

      customerPhoto.style.display =
        "";

    }

    else {

      customerPhoto.removeAttribute(
        "src"
      );

      customerPhoto.alt =
        "Customer Photo";

    }

  }


  // ===================================================
  // TODAY'S STATUS
  // ===================================================

  if (todayStatus) {

    if (
      hasStampToday(
        normalized
      )
    ) {

      todayStatus.textContent =
        "Stamped Today";

      todayStatus.classList.add(
        "success"
      );

    }

    else {

      todayStatus.textContent =
        "Waiting";

      todayStatus.classList.remove(
        "success"
      );

    }

  }


  // ===================================================
  // REWARD STATUS
  // ===================================================

  if (customerRewardStatus) {

    customerRewardStatus.textContent =

      isCustomerRewardReady(
        normalized
      )

        ? "Reward Ready"

        : "Not Ready";

  }


  // ===================================================
  // ENABLE / DISABLE GIVE STAMP
  // ===================================================

  if (giveStampBtn) {

    const shouldDisable = (

      stamps >= MAX_STAMPS ||

      hasStampToday(
        normalized
      )

    );

    giveStampBtn.disabled =
      shouldDisable;

  }


  // ===================================================
  // RESET BUTTON
  // ===================================================

  if (resetCustomerBtn) {

    resetCustomerBtn.disabled =
      false;

  }

}


// =====================================================
// CLEAR CUSTOMER PREVIEW
// =====================================================

function clearCustomerPreview() {

  currentCustomer =
    null;


  if (customerName) {

    customerName.textContent =
      "Waiting for Scan...";

  }


  if (customerMemberId) {

    customerMemberId.textContent =
      "RIO-000000000";

  }


  if (customerMobile) {

    customerMobile.textContent =
      "-";

  }


  if (currentStampsElement) {

    currentStampsElement.textContent =
      "0";

  }


  if (stampProgressText) {

    stampProgressText.textContent =

      `0 / ${MAX_STAMPS}`;

  }


  if (stampProgressBar) {

    stampProgressBar.style.width =
      "0%";

  }


  if (todayStatus) {

    todayStatus.textContent =
      "Waiting";

    todayStatus.classList.remove(
      "success"
    );

  }


  if (customerRewardStatus) {

    customerRewardStatus.textContent =
      "Not Ready";

  }


  if (customerPhoto) {

    customerPhoto.removeAttribute(
      "src"
    );

    customerPhoto.alt =
      "Customer Photo";

  }


  if (giveStampBtn) {

    giveStampBtn.disabled =
      true;

  }


  if (resetCustomerBtn) {

    resetCustomerBtn.disabled =
      true;

  }

}


// =====================================================
// SELECT CUSTOMER BY UID
// =====================================================

function selectCustomerById(
  customerId
) {

  if (!customerId) {
    return;
  }

  const customer =
    customers.find(
      item =>
        item &&
        String(item.uid) ===
        String(customerId)
    );

  if (!customer) {

    console.warn(
      "⚠️ Customer not found:",
      customerId
    );

    return;

  }

  showCustomer(
    customer
  );


  // Scroll preview into view on small screens

  if (
    window.innerWidth <= 768 &&
    customerPreview
  ) {

    customerPreview.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}


// =====================================================
// DASHBOARD STATISTICS
// =====================================================

function updateDashboardStats() {

  if (
    !Array.isArray(customers)
  ) {

    return;

  }


  // ===================================================
  // TOTAL CUSTOMERS
  // ===================================================

  const totalCustomers =
    customers.length;


  // ===================================================
  // TOTAL STAMPS
  // ===================================================

  const totalStamps =

    customers.reduce(

      (
        total,
        customer
      ) => {

        return (

          total +

          getCustomerStamps(
            customer
          )

        );

      },

      0

    );


  // ===================================================
  // REWARDS READY
  // ===================================================

  const rewardsReady =

    customers.filter(

      customer =>

        isCustomerRewardReady(
          customer
        )

    ).length;


  // ===================================================
  // TODAY'S SCANS
  // ===================================================

  const todayKey =
    typeof getTodayKey === "function"
      ? getTodayKey()
      : "";


  const todaysScans =

    todayKey

      ? customers.filter(

          customer => (

            customer &&
            (

              customer.dailyStampDate ===
              todayKey

              ||

              customer.lastStampDate ===
              todayKey

            )

          )

        ).length

      : 0;


  // ===================================================
  // UPDATE DOM
  // ===================================================

  if (totalCustomersElement) {

    totalCustomersElement.textContent =
      totalCustomers;

  }


  if (totalStampsElement) {

    totalStampsElement.textContent =
      totalStamps;

  }


  if (rewardsReadyElement) {

    rewardsReadyElement.textContent =
      rewardsReady;

  }


  if (todaysScansElement) {

    todaysScansElement.textContent =
      todaysScans;

  }

}


// =====================================================
// SEARCH CUSTOMER EVENT
// =====================================================
// ONE SEARCH LISTENER ONLY
// =====================================================

if (
  searchCustomer &&
  !searchCustomer.dataset.listenerAttached
) {

  searchCustomer.addEventListener(

    "input",

    event => {

      const value =
        event.target.value;

      const filtered =
        filterCustomers(
          value
        );

      renderCustomerTable(
        filtered
      );

    }

  );

  searchCustomer.dataset.listenerAttached =
    "true";

}


// =====================================================
// CUSTOMER TABLE ACTION EVENT
// =====================================================
// EVENT DELEGATION
// ONE LISTENER ONLY
// =====================================================

if (
  customerTableBody &&
  !customerTableBody.dataset.listenerAttached
) {

  customerTableBody.addEventListener(

    "click",

    event => {

      const button =
        event.target.closest(
          '[data-action="select-customer"]'
        );

      if (!button) {
        return;
      }

      event.preventDefault();

      const customerId =
        button.dataset.customerId;

      selectCustomerById(
        customerId
      );

    }

  );

  customerTableBody.dataset.listenerAttached =
    "true";

}


// =====================================================
// RESET CUSTOMER PREVIEW
// =====================================================

if (
  resetCustomerBtn &&
  !resetCustomerBtn.dataset.listenerAttached
) {

  resetCustomerBtn.addEventListener(

    "click",

    () => {

      clearCustomerPreview();

      if (
        typeof setScannerStatus ===
        "function"
      ) {

        setScannerStatus(

          "🟡 Ready",

          "ready"

        );

      }

    }

  );

  resetCustomerBtn.dataset.listenerAttached =
    "true";

}


// =====================================================
// PART 3 READY
// =====================================================

console.log(
  "✅ Admin Dashboard Part 3 Loaded"
);

console.log(
  "✅ Customer Data Helpers Ready"
);

console.log(
  "✅ Customer Search Ready"
);

console.log(
  "✅ Customer Table Ready"
);

console.log(
  "✅ Customer Preview Ready"
);

console.log(
  "✅ Customer Selection Ready"
);

console.log(
  "✅ Dashboard Statistics Ready"
);

console.log(
  "✅ Duplicate Search Listener Protection Ready"
);

console.log(
  "✅ Duplicate Table Listener Protection Ready"
);

console.log(
  "========================================"
);

console.log(
  "➡️ Next: ADMIN-DASHBOARD.JS — PART 4"
);

console.log(
  "========================================"
);


// =====================================================
// END OF PART 3
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 4
// QR SCANNER + FIREBASE CUSTOMER LOOKUP
// SCANNER START / STOP + CUSTOMER PREVIEW
// CLEAN VERSION — NO DUPLICATE LISTENERS
// =====================================================


// =====================================================
// SCANNER CONFIGURATION
// =====================================================

const QR_SCANNER_CONFIG = {

  fps: 10,

  qrbox: {

    width: 250,

    height: 250

  },

  aspectRatio: 1.0,

  rememberLastUsedCamera: true

};


// =====================================================
// SCANNER STATE
// =====================================================

let html5QrCode =
  null;

let scannerRunning =
  false;

let scannerStarting =
  false;

let scannerStopping =
  false;


// =====================================================
// GET SCANNER STATUS TEXT
// =====================================================

function getScannerStatusText() {

  if (scannerRunning) {

    return "🟢 Scanner Active";

  }

  return "🟡 Ready";

}


// =====================================================
// SET SCANNER STATUS
// =====================================================

function setScannerStatus(
  message,
  type = "ready"
) {

  if (!scannerStatus) {

    return;

  }


  scannerStatus.textContent =
    message;


  scannerStatus.classList.remove(

    "ready",

    "active",

    "success",

    "error",

    "warning"

  );


  scannerStatus.classList.add(
    type
  );

}


// =====================================================
// UPDATE SCANNER BUTTON STATES
// =====================================================

function updateScannerButtons() {

  if (startScannerBtn) {

    startScannerBtn.disabled = (

      scannerRunning ||

      scannerStarting

    );

  }


  if (stopScannerBtn) {

    stopScannerBtn.disabled = (

      !scannerRunning ||

      scannerStopping

    );

  }

}


// =====================================================
// CHECK HTML5 QR CODE LIBRARY
// =====================================================

function isQRScannerLibraryAvailable() {

  return (

    typeof Html5Qrcode !==
    "undefined"

  );

}


// =====================================================
// CREATE QR SCANNER INSTANCE
// =====================================================

function createQRScanner() {

  if (
    html5QrCode
  ) {

    return html5QrCode;

  }


  if (
    !isQRScannerLibraryAvailable()
  ) {

    console.error(

      "❌ Html5Qrcode library is not loaded."

    );

    return null;

  }


  if (
    !qrReader
  ) {

    console.error(

      "❌ QR reader container not found."

    );

    return null;

  }


  html5QrCode =

    new Html5Qrcode(

      qrReader.id

    );


  return html5QrCode;

}


// =====================================================
// FIND CUSTOMER BY QR VALUE
// =====================================================

function findCustomerFromQR(
  qrValue
) {

  if (!qrValue) {

    return null;

  }


  const value =

    String(
      qrValue
    )
      .trim()
      .toLowerCase();


  if (!value) {

    return null;

  }


  if (
    !Array.isArray(customers)
  ) {

    return null;

  }


  return (

    customers.find(

      customer => {

        if (!customer) {

          return false;

        }


        const uid =

          String(
            customer.uid ||
            ""
          )
            .trim()
            .toLowerCase();


        const memberId =

          String(

            customer.memberId ||

            customer.memberID ||

            ""

          )
            .trim()
            .toLowerCase();


        const mobile =

          String(

            customer.mobile ||

            customer.phone ||

            customer.phoneNumber ||

            ""

          )
            .replace(
              /\s+/g,
              ""
            )
            .toLowerCase();


        const qrCode =

          String(

            customer.qrCode ||

            customer.qrId ||

            customer.qrValue ||

            ""

          )
            .trim()
            .toLowerCase();


        return (

          value === uid ||

          value === memberId ||

          value === mobile ||

          value === qrCode

        );

      }

    ) ||

    null

  );

}


// =====================================================
// FETCH CUSTOMER FROM FIREBASE USING QR VALUE
// =====================================================

async function findCustomerInFirebase(
  qrValue
) {

  if (!qrValue) {

    return null;

  }


  const value =

    String(
      qrValue
    ).trim();


  if (!value) {

    return null;

  }


  // ---------------------------------------------------
  // FIRST: CHECK LOCAL CUSTOMERS
  // ---------------------------------------------------

  const localCustomer =

    findCustomerFromQR(
      value
    );


  if (
    localCustomer
  ) {

    return normalizeCustomer(

      localCustomer,

      localCustomer.uid

    );

  }


  // ---------------------------------------------------
  // FIRESTORE QUERY
  // ---------------------------------------------------

  const searchFields = [

    "memberId",

    "mobile",

    "phone",

    "uid"

  ];


  for (
    const field of searchFields
  ) {

    try {

      const customersQuery =

        query(

          collection(

            db,

            CUSTOMERS_COLLECTION

          ),

          where(

            field,

            "==",

            value

          ),

          limit(1)

        );


      const snapshot =

        await getDocs(

          customersQuery

        );


      if (
        !snapshot.empty
      ) {

        const customerDocument =

          snapshot.docs[0];


        const customer = {

          ...customerDocument.data(),

          uid:
            customerDocument.id

        };


        return normalizeCustomer(

          customer,

          customerDocument.id

        );

      }

    }

    catch (error) {

      console.warn(

        `⚠️ Customer lookup failed for field: ${field}`,

        error

      );

    }

  }


  return null;

}


// =====================================================
// PROCESS SCANNED QR CODE
// =====================================================

async function handleQRCodeScanned(
  decodedText
) {

  if (!decodedText) {

    return;

  }


  // ---------------------------------------------------
  // STOP REPEATED SCANS WHILE PROCESSING
  // ---------------------------------------------------

  if (
    scannerProcessing
  ) {

    return;

  }


  scannerProcessing =
    true;


  try {

    setScannerStatus(

      "🔎 Customer Found — Loading...",

      "active"

    );


    const customer =

      await findCustomerInFirebase(

        decodedText

      );


    if (!customer) {

      setScannerStatus(

        "🔴 Customer Not Found",

        "error"

      );


      alert(

        "❌ Customer not found.\n\n" +

        "Please scan a valid Rio Maggi Point customer QR."

      );


      return;

    }


    // -------------------------------------------------
    // SYNC LOCAL CUSTOMER
    // -------------------------------------------------

    upsertLocalCustomer(
      customer
    );


    // -------------------------------------------------
    // SET CURRENT CUSTOMER
    // -------------------------------------------------

    currentCustomer =
      customer;


    // -------------------------------------------------
    // SHOW CUSTOMER
    // -------------------------------------------------

    showCustomer(
      customer
    );


    // -------------------------------------------------
    // UPDATE TABLE
    // -------------------------------------------------

    if (
      searchCustomer
    ) {

      renderCustomerTable(

        filterCustomers(

          searchCustomer.value

        )

      );

    }

    else {

      renderCustomerTable(
        customers
      );

    }


    // -------------------------------------------------
    // UPDATE STATISTICS
    // -------------------------------------------------

    updateDashboardStats();


    // -------------------------------------------------
    // SUCCESS STATUS
    // -------------------------------------------------

    setScannerStatus(

      "🟢 Customer Ready",

      "success"

    );


    console.log(

      "✅ QR Customer Loaded:",

      customer

    );

  }

  catch (error) {

    console.error(

      "❌ QR Customer Processing Error:",

      error

    );


    setScannerStatus(

      "🔴 Scan Failed",

      "error"

    );


    alert(

      "❌ Unable to load customer.\n\n" +

      (
        error?.message ||

        "Please try scanning again."

      )

    );

  }

  finally {

    scannerProcessing =
      false;

  }

}


// =====================================================
// QR SCAN SUCCESS CALLBACK
// =====================================================

function onQRCodeSuccess(
  decodedText,
  decodedResult
) {

  if (!decodedText) {

    return;

  }


  console.log(

    "📷 QR Code Scanned:",

    decodedText

  );


  handleQRCodeScanned(

    decodedText

  );

}


// =====================================================
// QR SCAN ERROR CALLBACK
// =====================================================

function onQRCodeError(
  errorMessage
) {

  // ---------------------------------------------------
  // HTML5 QR CODE GENERATES MANY NORMAL SCAN ERRORS
  // WHILE SEARCHING FOR A QR CODE.
  //
  // DO NOT SHOW ALERT FOR EVERY FRAME.
  // ---------------------------------------------------

  if (!scannerRunning) {

    return;

  }


  // Keep normal scan errors silent.

}


// =====================================================
// GET AVAILABLE CAMERAS
// =====================================================

async function getAvailableCameras() {

  if (
    !isQRScannerLibraryAvailable()
  ) {

    return [];

  }


  try {

    const cameras =

      await Html5Qrcode
        .getCameras();


    return Array.isArray(
      cameras
    )

      ? cameras

      : [];

  }

  catch (error) {

    console.error(

      "❌ Unable to access cameras:",

      error

    );


    return [];

  }

}


// =====================================================
// START SCANNER
// =====================================================

async function startScanner() {

  // ---------------------------------------------------
  // PREVENT DOUBLE START
  // ---------------------------------------------------

  if (
    scannerRunning ||
    scannerStarting
  ) {

    return;

  }


  // ---------------------------------------------------
  // CHECK LIBRARY
  // ---------------------------------------------------

  if (
    !isQRScannerLibraryAvailable()
  ) {

    alert(

      "❌ QR Scanner library is not loaded.\n\n" +

      "Please check that html5-qrcode is included in admin-dashboard.html."

    );

    return;

  }


  // ---------------------------------------------------
  // CHECK HTTPS
  // ---------------------------------------------------

  if (
    location.protocol !==
      "https:" &&

    location.hostname !==
      "localhost" &&

    location.hostname !==
      "127.0.0.1"
  ) {

    console.warn(

      "⚠️ Camera access usually requires HTTPS."

    );

  }


  scannerStarting =
    true;


  updateScannerButtons();


  try {

    // -------------------------------------------------
    // CREATE SCANNER
    // -------------------------------------------------

    const scanner =
      createQRScanner();


    if (!scanner) {

      throw new Error(

        "QR scanner could not be initialized."

      );

    }


    setScannerStatus(

      "📷 Requesting Camera...",

      "active"

    );


    // -------------------------------------------------
    // GET CAMERAS
    // -------------------------------------------------

    const cameras =

      await getAvailableCameras();


    if (
      cameras.length === 0
    ) {

      throw new Error(

        "No camera found or camera permission was denied."

      );

    }


    // -------------------------------------------------
    // SELECT CAMERA
    // -------------------------------------------------

    const selectedCamera =

      cameras.find(

        camera =>

          /back|rear|environment/i.test(

            camera.label || ""

          )

      ) ||

      cameras[0];


    // -------------------------------------------------
    // START CAMERA
    // -------------------------------------------------

    await scanner.start(

      selectedCamera.id,

      QR_SCANNER_CONFIG,

      onQRCodeSuccess,

      onQRCodeError

    );


    scannerRunning =
      true;


    setScannerStatus(

      "🟢 Scanner Active — Scan Customer QR",

      "active"

    );


    console.log(

      "✅ QR Scanner Started"

    );

  }

  catch (error) {

    console.error(

      "❌ Start Scanner Error:",

      error

    );


    scannerRunning =
      false;


    setScannerStatus(

      "🔴 Camera Start Failed",

      "error"

    );


    let message =

      "Unable to start camera.";


    if (
      error?.message
    ) {

      message =
        error.message;

    }


    alert(

      "❌ Unable To Start Scanner.\n\n" +

      message +

      "\n\nPlease allow camera permission and try again."

    );

  }

  finally {

    scannerStarting =
      false;


    updateScannerButtons();

  }

}


// =====================================================
// STOP SCANNER
// =====================================================

async function stopScanner() {

  if (
    scannerStopping
  ) {

    return;

  }


  // ---------------------------------------------------
  // NOTHING TO STOP
  // ---------------------------------------------------

  if (
    !html5QrCode
  ) {

    scannerRunning =
      false;

    updateScannerButtons();

    setScannerStatus(

      "🟡 Camera Off",

      "ready"

    );

    return;

  }


  scannerStopping =
    true;


  updateScannerButtons();


  try {

    if (
      scannerRunning
    ) {

      await html5QrCode.stop();

    }


    // -------------------------------------------------
    // CLEAR CAMERA VIEW
    // -------------------------------------------------

    try {

      await html5QrCode.clear();

    }

    catch (clearError) {

      console.warn(

        "⚠️ Scanner clear warning:",

        clearError

      );

    }


    scannerRunning =
      false;


    setScannerStatus(

      "🟡 Camera Off",

      "ready"

    );


    console.log(

      "✅ QR Scanner Stopped"

    );

  }

  catch (error) {

    console.error(

      "❌ Stop Scanner Error:",

      error

    );


    // -------------------------------------------------
    // FORCE LOCAL STATE RESET
    // -------------------------------------------------

    scannerRunning =
      false;


    setScannerStatus(

      "🟡 Camera Off",

      "ready"

    );

  }

  finally {

    scannerStopping =
      false;


    updateScannerButtons();

  }

}


// =====================================================
// START SCANNER BUTTON
// =====================================================
// ONE LISTENER ONLY
// =====================================================

if (
  startScannerBtn &&

  startScannerBtn.dataset.listenerAttached !==
  "true"
) {

  startScannerBtn.addEventListener(

    "click",

    event => {

      event.preventDefault();

      startScanner();

    }

  );


  startScannerBtn.dataset.listenerAttached =
    "true";

}


// =====================================================
// STOP SCANNER BUTTON
// =====================================================
// ONE LISTENER ONLY
// =====================================================

if (
  stopScannerBtn &&

  stopScannerBtn.dataset.listenerAttached !==
  "true"
) {

  stopScannerBtn.addEventListener(

    "click",

    event => {

      event.preventDefault();

      stopScanner();

    }

  );


  stopScannerBtn.dataset.listenerAttached =
    "true";

}


// =====================================================
// PART 4 READY
// =====================================================

console.log(
  "========================================"
);

console.log(
  "✅ ADMIN DASHBOARD PART 4 LOADED"
);

console.log(
  "✅ QR Scanner System Ready"
);

console.log(
  "✅ Camera Start System Ready"
);

console.log(
  "✅ Camera Stop System Ready"
);

console.log(
  "✅ Firebase Customer QR Lookup Ready"
);

console.log(
  "✅ Local Customer Lookup Ready"
);

console.log(
  "✅ Customer Preview Integration Ready"
);

console.log(
  "✅ QR Scan Processing Ready"
);

console.log(
  "✅ Duplicate Scanner Start Protection Ready"
);

console.log(
  "✅ Duplicate Scanner Stop Protection Ready"
);

console.log(
  "========================================"
);

console.log(
  "➡️ NEXT: ADMIN-DASHBOARD.JS — PART 5"
);

console.log(
  "========================================"
);


// =====================================================
// END OF PART 4
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 5
// GIVE STAMP + 40 DAY LOYALTY CYCLE
// REWARD UNLOCK + FIREBASE UPDATE + LOGOUT
// =====================================================


// =====================================================
// 40-DAY LOYALTY CYCLE CONFIGURATION
// =====================================================

const LOYALTY_CYCLE_DAYS = 40;

const LOYALTY_CYCLE_MS =
  LOYALTY_CYCLE_DAYS *
  24 *
  60 *
  60 *
  1000;


// =====================================================
// DATE NORMALIZER
// =====================================================

function normalizeDateValue(value) {

  if (!value) {
    return null;
  }

  try {

    if (
      typeof value.toDate === "function"
    ) {

      const date = value.toDate();

      return (
        date instanceof Date &&
        !Number.isNaN(date.getTime())
      )
        ? date
        : null;

    }

    if (
      value instanceof Date
    ) {

      return (
        !Number.isNaN(value.getTime())
      )
        ? value
        : null;

    }

    if (
      typeof value === "number"
    ) {

      const date = new Date(value);

      return (
        !Number.isNaN(date.getTime())
      )
        ? date
        : null;

    }

    if (
      typeof value === "string"
    ) {

      const date = new Date(value);

      return (
        !Number.isNaN(date.getTime())
      )
        ? date
        : null;

    }

  }

  catch (error) {

    console.warn(
      "⚠️ Date conversion failed:",
      error
    );

  }

  return null;

}


// =====================================================
// GET CUSTOMER CYCLE START DATE
// =====================================================

function getCustomerCycleStartDate(customer) {

  if (!customer) {
    return null;
  }

  const possibleDates = [

    customer.cycleStartedAt,

    customer.loyaltyCycleStartedAt,

    customer.stampCycleStartedAt,

    customer.firstStampDate

  ];

  for (
    const value of possibleDates
  ) {

    const date =
      normalizeDateValue(value);

    if (date) {

      return date;

    }

  }

  return null;

}


// =====================================================
// GET LOYALTY CYCLE STATUS
// =====================================================

function getLoyaltyCycleStatus(customer) {

  if (!customer) {

    return {

      active: false,
      expired: false,
      cycleStartDate: null,
      cycleStartTime: null,
      cycleExpiryTime: null,
      remainingMs: 0

    };

  }

  const stamps =
    getCustomerStamps(customer);

  const cycleStartDate =
    getCustomerCycleStartDate(customer);

  if (
    stamps <= 0 ||
    !cycleStartDate
  ) {

    return {

      active: false,
      expired: false,
      cycleStartDate: null,
      cycleStartTime: null,
      cycleExpiryTime: null,
      remainingMs: 0

    };

  }

  const cycleStartTime =
    cycleStartDate.getTime();

  const cycleExpiryTime =
    cycleStartTime +
    LOYALTY_CYCLE_MS;

  const now =
    Date.now();

  return {

    active: true,

    expired:
      now >= cycleExpiryTime,

    cycleStartDate,

    cycleStartTime,

    cycleExpiryTime,

    remainingMs:
      Math.max(
        0,
        cycleExpiryTime - now
      )

  };

}


// =====================================================
// CHECK CYCLE EXPIRATION
// =====================================================

function isLoyaltyCycleExpired(customer) {

  return (
    getLoyaltyCycleStatus(customer).expired === true
  );

}


// =====================================================
// GET FRESH CUSTOMER FROM FIRESTORE
// =====================================================

async function getCustomerDocument(uid) {

  if (!uid) {
    return null;
  }

  const customerRef =
    doc(
      db,
      "customers",
      uid
    );

  const customerSnapshot =
    await getDoc(
      customerRef
    );

  if (
    !customerSnapshot.exists()
  ) {

    return null;

  }

  const customer = {

    ...customerSnapshot.data(),

    uid:
      customerSnapshot.id

  };

  customer.stamps =
    getCustomerStamps(customer);

  customer.memberId =
    String(
      customer.memberId || ""
    ).trim();

  return customer;

}


// =====================================================
// SYNC CUSTOMER AFTER STAMP
// =====================================================

function syncCustomerAfterStamp(customer) {

  if (!customer) {
    return;
  }

  if (
    typeof upsertLocalCustomer ===
    "function"
  ) {

    upsertLocalCustomer(
      customer
    );

  }

  currentCustomer =
    customer;

  if (
    typeof showCustomer ===
    "function"
  ) {

    showCustomer(
      customer
    );

  }

  if (
    typeof updateDashboardStats ===
    "function"
  ) {

    updateDashboardStats();

  }

  if (
    typeof renderCustomerTable ===
    "function" &&
    typeof filterCustomers ===
    "function"
  ) {

    const searchValue =
      searchCustomer
        ? searchCustomer.value
        : "";

    renderCustomerTable(
      filterCustomers(
        searchValue
      )
    );

  }

}


// =====================================================
// GIVE STAMP TO CUSTOMER
// =====================================================

async function giveStampToCustomer() {

  if (
    stampActionProcessing
  ) {

    return;

  }

  if (
    !currentCustomer ||
    !currentCustomer.uid
  ) {

    alert(
      "❌ Please scan or select a customer first."
    );

    return;

  }

  const currentUser =
    auth.currentUser;

  if (!currentUser) {

    alert(
      "❌ Admin session expired. Please login again."
    );

    if (
      typeof ADMIN_LOGIN_PAGE !==
      "undefined"
    ) {

      location.replace(
        ADMIN_LOGIN_PAGE
      );

    }

    return;

  }

  stampActionProcessing =
    true;

  const originalButtonContent =
    giveStampBtn
      ? giveStampBtn.innerHTML
      : "";

  if (giveStampBtn) {

    giveStampBtn.disabled =
      true;

    giveStampBtn.innerHTML = `

      <i
        class="fa-solid fa-spinner fa-spin"
        aria-hidden="true"
      ></i>

      <span>
        Processing...
      </span>

    `;

  }

  try {

    // -------------------------------------------------
    // GET FRESH CUSTOMER DATA
    // -------------------------------------------------

    const customerUid =
      currentCustomer.uid;

    const freshCustomer =
      await getCustomerDocument(
        customerUid
      );

    if (!freshCustomer) {

      throw new Error(
        "Customer document not found."
      );

    }


    // -------------------------------------------------
    // TODAY
    // -------------------------------------------------

    const todayKey =
      getTodayKey();


    // -------------------------------------------------
    // CURRENT STAMPS
    // -------------------------------------------------

    let currentStamps =
      getCustomerStamps(
        freshCustomer
      );


    // -------------------------------------------------
    // CHECK 40-DAY CYCLE
    // -------------------------------------------------

    const cycleStatus =
      getLoyaltyCycleStatus(
        freshCustomer
      );

    const cycleExpired =
      cycleStatus.expired;


    // -------------------------------------------------
    // RESET EXPIRED INCOMPLETE CYCLE
    // -------------------------------------------------

    if (
      cycleExpired &&
      currentStamps > 0 &&
      currentStamps < MAX_STAMPS
    ) {

      console.log(
        "⏰ 40-day loyalty cycle expired."
      );

      currentStamps =
        0;

    }


    // -------------------------------------------------
    // DAILY STAMP PROTECTION
    // -------------------------------------------------

    const alreadyStampedToday = (

      !cycleExpired &&

      (

        freshCustomer.dailyStampDate ===
        todayKey

        ||

        freshCustomer.lastStampDate ===
        todayKey

      )

    );


    if (
      alreadyStampedToday
    ) {

      const syncedCustomer = {

        ...freshCustomer,

        stamps:
          currentStamps

      };

      syncCustomerAfterStamp(
        syncedCustomer
      );

      alert(
        "⚠️ This customer has already received today's stamp."
      );

      return;

    }


    // -------------------------------------------------
    // REWARD ALREADY UNLOCKED
    // -------------------------------------------------

    if (
      currentStamps >= MAX_STAMPS
    ) {

      const syncedCustomer = {

        ...freshCustomer,

        stamps:
          MAX_STAMPS,

        rewardUnlocked:
          true

      };

      syncCustomerAfterStamp(
        syncedCustomer
      );

      alert(
        "🎁 This customer already has a reward ready. Please claim the reward first."
      );

      return;

    }


    // -------------------------------------------------
    // NEW CYCLE CHECK
    // -------------------------------------------------

    const isStartingNewCycle =
      currentStamps === 0;


    // -------------------------------------------------
    // NEW STAMP COUNT
    // -------------------------------------------------

    const newStampCount =
      Math.min(
        currentStamps + 1,
        MAX_STAMPS
      );


    // -------------------------------------------------
    // REWARD STATUS
    // -------------------------------------------------

    const rewardUnlocked =
      newStampCount >= MAX_STAMPS;


    // -------------------------------------------------
    // FIRESTORE REFERENCE
    // -------------------------------------------------

    const customerRef =
      doc(
        db,
        "customers",
        customerUid
      );


    // -------------------------------------------------
    // FIRESTORE UPDATE
    // -------------------------------------------------

    const updateData = {

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
        currentUser.uid

    };


    // -------------------------------------------------
    // START NEW 40-DAY CYCLE
    // -------------------------------------------------

    if (
      isStartingNewCycle ||
      cycleExpired
    ) {

      updateData.cycleStartedAt =
        serverTimestamp();

    }


    // -------------------------------------------------
    // UPDATE FIRESTORE
    // -------------------------------------------------

    await updateDoc(

      customerRef,

      updateData

    );


    // -------------------------------------------------
    // LOCAL UPDATED CUSTOMER
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


    // -------------------------------------------------
    // LOCAL CYCLE START
    // -------------------------------------------------

    if (
      isStartingNewCycle ||
      cycleExpired
    ) {

      updatedCustomer.cycleStartedAt =
        new Date();

    }


    // -------------------------------------------------
    // SYNC UI
    // -------------------------------------------------

    syncCustomerAfterStamp(
      updatedCustomer
    );


    // -------------------------------------------------
    // UPDATE LAST REFRESH
    // -------------------------------------------------

    if (
      typeof updateLastRefresh ===
      "function"
    ) {

      updateLastRefresh();

    }


    // -------------------------------------------------
    // UPDATE SCANNER STATUS
    // -------------------------------------------------

    if (
      typeof setScannerStatus ===
      "function"
    ) {

      setScannerStatus(

        rewardUnlocked
          ? "🎁 Reward Ready"
          : "🟢 Stamp Added Successfully",

        "ready"

      );

    }


    // -------------------------------------------------
    // SUCCESS MESSAGE
    // -------------------------------------------------

    if (
      rewardUnlocked
    ) {

      alert(

        "🎉 Stamp Added Successfully!\n\n" +

        "🎁 6 valid stamps completed.\n\n" +

        "Customer Reward is now READY."

      );

    }

    else if (
      cycleExpired
    ) {

      alert(

        "⏰ Previous 40-day loyalty cycle expired.\n\n" +

        "🔄 Old stamp cycle reset.\n\n" +

        "✅ New loyalty cycle started.\n\n" +

        `Current Stamps: ${newStampCount}/${MAX_STAMPS}`

      );

    }

    else {

      alert(

        "✅ Stamp Added Successfully!\n\n" +

        `Current Stamps: ${newStampCount}/${MAX_STAMPS}\n\n` +

        "⏳ Complete 6 valid stamps within 40 days to unlock your reward."

      );

    }


    // -------------------------------------------------
    // SUCCESS LOG
    // -------------------------------------------------

    console.log(
      "✅ Stamp successfully added.",
      {
        customerUid,
        newStampCount,
        cycleExpired,
        rewardUnlocked
      }
    );

  }

  catch (error) {

    console.error(
      "❌ Give Stamp Error:",
      error
    );

    if (
      typeof setScannerStatus ===
      "function"
    ) {

      setScannerStatus(
        "🔴 Stamp Update Failed",
        "error"
      );

    }

    alert(

      "❌ Unable To Give Stamp.\n\n" +

      (
        error?.message ||
        "Please check your internet connection and try again."
      )

    );

  }

  finally {

    stampActionProcessing =
      false;

    if (giveStampBtn) {

      giveStampBtn.innerHTML =
        originalButtonContent;

      if (
        currentCustomer
      ) {

        const currentCount =
          getCustomerStamps(
            currentCustomer
          );

        giveStampBtn.disabled = (

          currentCount >=
          MAX_STAMPS

          ||

          (
            typeof hasStampToday ===
            "function" &&

            hasStampToday(
              currentCustomer
            )
          )

        );

      }

      else {

        giveStampBtn.disabled =
          true;

      }

    }

  }

}


// =====================================================
// GIVE STAMP BUTTON LISTENER
// =====================================================

if (
  giveStampBtn &&
  !giveStampBtn.dataset.stampListenerAttached
) {

  giveStampBtn.addEventListener(
    "click",
    giveStampToCustomer
  );

  giveStampBtn.dataset.stampListenerAttached =
    "true";

}


// =====================================================
// ADMIN LOGOUT
// =====================================================

async function handleAdminLogout() {

  if (
    logoutProcessing
  ) {

    return;

  }

  logoutProcessing =
    true;

  const originalContent =
    logoutBtn
      ? logoutBtn.innerHTML
      : "";

  if (logoutBtn) {

    logoutBtn.disabled =
      true;

    logoutBtn.innerHTML = `

      <i
        class="fa-solid fa-spinner fa-spin"
        aria-hidden="true"
      ></i>

      <span>
        Logging Out...
      </span>

    `;

  }

  try {

    if (
      typeof stopScanner ===
      "function"
    ) {

      if (
        scannerRunning ||
        html5QrCode
      ) {

        await stopScanner();

      }

    }

    await signOut(
      auth
    );

    console.log(
      "✅ Admin logged out successfully."
    );

  }

  catch (error) {

    console.error(
      "❌ Logout Error:",
      error
    );

    alert(
      "❌ Unable To Logout. Please try again."
    );

    logoutProcessing =
      false;

    if (logoutBtn) {

      logoutBtn.disabled =
        false;

      logoutBtn.innerHTML =
        originalContent;

    }

  }

}


// =====================================================
// LOGOUT BUTTON LISTENER
// =====================================================

if (
  logoutBtn &&
  !logoutBtn.dataset.logoutListenerAttached
) {

  logoutBtn.addEventListener(
    "click",
    handleAdminLogout
  );

  logoutBtn.dataset.logoutListenerAttached =
    "true";

}


// =====================================================
// PART 5 READY
// =====================================================

console.log(
  "✅ Admin Dashboard Part 5 Loaded"
);

console.log(
  "✅ Give Stamp System Ready"
);

console.log(
  "✅ Duplicate Daily Stamp Protection Ready"
);

console.log(
  "✅ 40-Day Loyalty Cycle Ready"
);

console.log(
  "✅ Expired Cycle Reset Ready"
);

console.log(
  "✅ Firebase Stamp Update Ready"
);

console.log(
  "✅ 6 Valid Stamp Reward Unlock Ready"
);

console.log(
  "✅ Local Customer Sync Ready"
);

console.log(
  "✅ Dashboard Statistics Sync Ready"
);

console.log(
  "✅ Logout System Ready"
);

console.log(
  "========================================"
);

console.log(
  "🎉 ADMIN DASHBOARD PART 5 READY"
);

console.log(
  "========================================"
);


// =====================================================
// END OF PART 5
// =====================================================
