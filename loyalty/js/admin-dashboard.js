// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 1
// CLEAN FOUNDATION
// CORE CONFIG + DOM + STATE + AUTH + NAVIGATION
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

const ADMIN_LOGIN_PAGE = "./admin-login.html";


// =====================================================
// LOYALTY CONFIGURATION
// =====================================================

const MAX_STAMPS = 6;

const CUSTOMERS_COLLECTION = "customers";

const LOYALTY_CYCLE_DAYS = 40;

const LOYALTY_CYCLE_MS =
  LOYALTY_CYCLE_DAYS *
  24 *
  60 *
  60 *
  1000;


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================

let currentCustomer = null;

let customers = [];

let currentSection = "dashboard";

let stampActionProcessing = false;

let logoutProcessing = false;

let scannerRunning = false;

let html5QrCode = null;


// =====================================================
// DOM ELEMENT REFERENCES
// =====================================================

// -----------------------------------------------------
// NAVIGATION
// -----------------------------------------------------

const navButtons =
  document.querySelectorAll("[data-section]");


// -----------------------------------------------------
// MAIN SECTIONS
// -----------------------------------------------------

const dashboardSection =
  document.getElementById("dashboardSection");

const scannerSection =
  document.getElementById("scannerSection");

const customersSection =
  document.getElementById("customersSection");

const stampsSection =
  document.getElementById("stampsSection");

const rewardsSection =
  document.getElementById("rewardsSection");

const reportsSection =
  document.getElementById("reportsSection");

const settingsSection =
  document.getElementById("settingsSection");


// -----------------------------------------------------
// SCANNER
// -----------------------------------------------------

const startScannerBtn =
  document.getElementById("startScannerBtn");

const stopScannerBtn =
  document.getElementById("stopScannerBtn");

const scannerStatus =
  document.getElementById("scannerStatus");

const qrReader =
  document.getElementById("qr-reader");


// -----------------------------------------------------
// CUSTOMER PREVIEW
// -----------------------------------------------------

const customerPreview =
  document.getElementById("customerPreview");

const customerPhoto =
  document.getElementById("customerPhoto");

const customerName =
  document.getElementById("customerName");

const customerMemberId =
  document.getElementById("customerMemberId");

const customerMobile =
  document.getElementById("customerMobile");

const customerStamps =
  document.getElementById("customerStamps");

const customerDailyStatus =
  document.getElementById("customerDailyStatus");

const giveStampBtn =
  document.getElementById("giveStampBtn");

const resetCustomerBtn =
  document.getElementById("resetCustomerBtn");


// -----------------------------------------------------
// CUSTOMER SEARCH
// -----------------------------------------------------

const searchCustomer =
  document.getElementById("searchCustomer");

const customerTableBody =
  document.getElementById("customerTableBody");

const refreshCustomersBtn =
  document.getElementById("refreshCustomersBtn");

const exportCustomersBtn =
  document.getElementById("exportCustomersBtn");


// -----------------------------------------------------
// LOGOUT
// -----------------------------------------------------

const logoutBtn =
  document.getElementById("logoutBtn");


// -----------------------------------------------------
// DASHBOARD STATISTICS
// -----------------------------------------------------

const totalCustomersElement =
  document.getElementById("totalCustomers");

const totalStampsElement =
  document.getElementById("totalStamps");

const rewardsReadyElement =
  document.getElementById("rewardsReady");

const todaysScansElement =
  document.getElementById("todaysScans");


// -----------------------------------------------------
// LAST REFRESH
// -----------------------------------------------------

const lastRefreshElement =
  document.getElementById("lastRefresh");


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
// SHOW SECTION
// =====================================================

function showSection(sectionName) {

  const targetSection =
    sectionMap[sectionName];

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

  Object.values(sectionMap).forEach(
    section => {

      if (!section) {
        return;
      }

      section.classList.remove("active");

      section.hidden = true;

    }
  );


  // ---------------------------------------------------
  // SHOW TARGET SECTION
  // ---------------------------------------------------

  targetSection.hidden = false;

  targetSection.classList.add("active");


  // ---------------------------------------------------
  // UPDATE ACTIVE NAVIGATION
  // ---------------------------------------------------

  navButtons.forEach(
    button => {

      button.classList.toggle(

        "active",

        button.dataset.section ===
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
// NAVIGATION LISTENER
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
// INITIALIZE NAVIGATION
// =====================================================

function initializeNavigation() {

  const hash =
    window.location.hash
      .replace("#", "")
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
// CUSTOMER DATA + NORMALIZATION + SEARCH + STATISTICS
// CLEAN VERSION — NO DUPLICATE FUNCTIONS
// =====================================================


// =====================================================
// GET CUSTOMER STAMP COUNT
// =====================================================
// IMPORTANT:
// This is the ONLY getCustomerStamps() function.
// Do NOT define it again in Part 3, 4 or 5.
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

function getCustomerMemberId(customer) {

  if (!customer) {
    return "";
  }

  return String(

    customer.memberId ||

    customer.memberID ||

    customer.membershipId ||

    customer.member_id ||

    ""

  ).trim();

}


// =====================================================
// GET CUSTOMER NAME
// =====================================================

function getCustomerName(customer) {

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

function getCustomerMobile(customer) {

  if (!customer) {
    return "";
  }

  return String(

    customer.mobile ||

    customer.mobileNumber ||

    customer.phone ||

    customer.phoneNumber ||

    ""

  ).trim();

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
// GET CUSTOMER REWARD STATUS
// =====================================================

function isCustomerRewardReady(customer) {

  if (!customer) {
    return false;
  }

  return (

    customer.rewardUnlocked === true ||

    customer.rewardReady === true ||

    getCustomerStamps(customer) >=
    MAX_STAMPS

  );

}


// =====================================================
// GET TODAY KEY
// =====================================================
// Format: YYYY-MM-DD
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

  return `${year}-${month}-${day}`;

}


// =====================================================
// CHECK TODAY'S STAMP
// =====================================================
// This is the ONLY hasStampToday() function.
// =====================================================

function hasStampToday(customer) {

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
// NORMALIZE CUSTOMER
// =====================================================
// All customer data passes through this function.
// =====================================================

function normalizeCustomer(
  customer,
  uid = ""
) {

  if (!customer) {
    return null;
  }

  return {

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
      ),

    rewardUnlocked:
      isCustomerRewardReady(
        customer
      )

  };

}


// =====================================================
// FIND CUSTOMER BY UID
// =====================================================

function findCustomerByUid(uid) {

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
// UPSERT LOCAL CUSTOMER
// =====================================================
// Prevents duplicate customers in local memory.
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

    customers = [];

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

      if (!customer) {
        return false;
      }


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

        isCustomerRewardReady(
          customer
        )

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


  if (
    totalCustomersElement
  ) {

    totalCustomersElement.textContent =
      totalCustomers;

  }


  if (
    totalStampsElement
  ) {

    totalStampsElement.textContent =
      totalStamps;

  }


  if (
    rewardsReadyElement
  ) {

    rewardsReadyElement.textContent =
      rewardsReady;

  }


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
// UPDATE LAST REFRESH
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
// ESCAPE HTML
// =====================================================
// This is the ONLY escapeHtml() function.
// =====================================================

function escapeHtml(value) {

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
        isCustomerRewardReady(
          customer
        );


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

            src="${escapeHtml(
              safePhoto
            )}"

            alt="Customer Photo"

            class="customer-table-photo"

            loading="lazy"

            onerror="
              this.onerror=null;
              this.src='./assets/default-profile.png';
            "

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
// SELECT CUSTOMER BY UID
// =====================================================

function selectCustomerByUid(uid) {

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


  showSection(
    "scanner"
  );


  console.log(
    "✅ Customer selected:",
    customer
  );

}


// =====================================================
// CUSTOMER TABLE EVENT DELEGATION
// =====================================================
// ONE listener only.
// =====================================================

if (
  customerTableBody &&

  customerTableBody.dataset.customerTableListenerAttached !==
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


  customerTableBody.dataset.customerTableListenerAttached =
    "true";

}


// =====================================================
// CUSTOMER SEARCH EVENT
// =====================================================
// ONE listener only.
// =====================================================

if (
  searchCustomer &&

  searchCustomer.dataset.customerSearchListenerAttached !==
  "true"
) {

  searchCustomer.addEventListener(

    "input",

    () => {

      renderCustomerTable(

        filterCustomers(

          searchCustomer.value

        )

      );

    }

  );


  searchCustomer.dataset.customerSearchListenerAttached =
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
  "✅ Single Stamp Normalizer Ready"
);

console.log(
  "✅ Single Daily Stamp Helper Ready"
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
  "✅ Customer Table Ready"
);

console.log(
  "✅ Dashboard Statistics Ready"
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
// CUSTOMER PREVIEW + FIREBASE CUSTOMER LOADING
// SCANNER STATUS + CUSTOMER RESET
// CLEAN VERSION — NO DUPLICATE FUNCTIONS
// =====================================================


// =====================================================
// SET SCANNER STATUS
// =====================================================
// Centralized scanner status updater.
// =====================================================

function setScannerStatus(
  message,
  type = "default"
) {

  if (!scannerStatus) {
    return;
  }

  scannerStatus.textContent =
    message || "";

  scannerStatus.classList.remove(

    "ready",

    "error",

    "scanning",

    "success",

    "default"

  );

  scannerStatus.classList.add(
    type
  );

}


// =====================================================
// SHOW CUSTOMER PREVIEW
// =====================================================

function showCustomer(customer) {

  if (!customer) {

    clearCustomerPreview();

    return;

  }


  const normalizedCustomer =

    normalizeCustomer(

      customer,

      customer.uid

    );


  if (
    !normalizedCustomer
  ) {

    clearCustomerPreview();

    return;

  }


  currentCustomer =
    normalizedCustomer;


  // ---------------------------------------------------
  // CUSTOMER PREVIEW VISIBILITY
  // ---------------------------------------------------

  if (customerPreview) {

    customerPreview.hidden =
      false;

    customerPreview.classList.add(
      "active"
    );

  }


  // ---------------------------------------------------
  // CUSTOMER NAME
  // ---------------------------------------------------

  if (customerName) {

    customerName.textContent =

      getCustomerName(
        normalizedCustomer
      ) ||

      "Unknown Customer";

  }


  // ---------------------------------------------------
  // MEMBER ID
  // ---------------------------------------------------

  if (customerMemberId) {

    customerMemberId.textContent =

      getCustomerMemberId(
        normalizedCustomer
      ) ||

      "—";

  }


  // ---------------------------------------------------
  // MOBILE
  // ---------------------------------------------------

  if (customerMobile) {

    customerMobile.textContent =

      getCustomerMobile(
        normalizedCustomer
      ) ||

      "—";

  }


  // ---------------------------------------------------
  // STAMPS
  // ---------------------------------------------------

  const stamps =

    getCustomerStamps(
      normalizedCustomer
    );


  if (customerStamps) {

    customerStamps.textContent =

      `${stamps}/${MAX_STAMPS}`;

  }


  // ---------------------------------------------------
  // CUSTOMER PHOTO
  // ---------------------------------------------------

  if (customerPhoto) {

    const photo =

      getCustomerPhoto(
        normalizedCustomer
      );


    customerPhoto.src =

      photo ||

      "./assets/default-profile.png";


    customerPhoto.onerror =

      function () {

        this.onerror = null;

        this.src =
          "./assets/default-profile.png";

      };

  }


  // ---------------------------------------------------
  // DAILY STAMP STATUS
  // ---------------------------------------------------

  if (customerDailyStatus) {

    const alreadyStamped =

      hasStampToday(
        normalizedCustomer
      );


    if (alreadyStamped) {

      customerDailyStatus.textContent =

        "⚠️ Today's stamp already received";

      customerDailyStatus.classList.remove(
        "ready"
      );

      customerDailyStatus.classList.add(
        "warning"
      );

    }

    else {

      customerDailyStatus.textContent =

        "🟢 Eligible for today's stamp";

      customerDailyStatus.classList.remove(
        "warning"
      );

      customerDailyStatus.classList.add(
        "ready"
      );

    }

  }


  // ---------------------------------------------------
  // GIVE STAMP BUTTON STATE
  // ---------------------------------------------------

  updateGiveStampButtonState();


  console.log(

    "👤 Customer Preview Updated:",

    normalizedCustomer

  );

}


// =====================================================
// CLEAR CUSTOMER PREVIEW
// =====================================================

function clearCustomerPreview() {

  currentCustomer =
    null;


  if (customerPreview) {

    customerPreview.hidden =
      true;

    customerPreview.classList.remove(
      "active"
    );

  }


  if (customerName) {

    customerName.textContent =
      "No Customer Selected";

  }


  if (customerMemberId) {

    customerMemberId.textContent =
      "—";

  }


  if (customerMobile) {

    customerMobile.textContent =
      "—";

  }


  if (customerStamps) {

    customerStamps.textContent =
      `0/${MAX_STAMPS}`;

  }


  if (customerDailyStatus) {

    customerDailyStatus.textContent =
      "No customer selected";

    customerDailyStatus.classList.remove(

      "ready",

      "warning"

    );

  }


  if (customerPhoto) {

    customerPhoto.src =
      "./assets/default-profile.png";

  }


  updateGiveStampButtonState();


  console.log(
    "🧹 Customer Preview Cleared"
  );

}


// =====================================================
// UPDATE GIVE STAMP BUTTON STATE
// =====================================================

function updateGiveStampButtonState() {

  if (!giveStampBtn) {
    return;
  }


  if (
    !currentCustomer
  ) {

    giveStampBtn.disabled =
      true;

    return;

  }


  const stamps =

    getCustomerStamps(
      currentCustomer
    );


  const rewardReady =

    isCustomerRewardReady(
      currentCustomer
    );


  const alreadyStampedToday =

    hasStampToday(
      currentCustomer
    );


  giveStampBtn.disabled = (

    stampActionProcessing

    ||

    stamps >= MAX_STAMPS

    ||

    rewardReady

    ||

    alreadyStampedToday

  );


}


// =====================================================
// LOAD CUSTOMERS FROM FIRESTORE
// =====================================================

async function loadCustomersFromFirebase() {

  try {

    console.log(
      "🔄 Loading customers from Firebase..."
    );


    const customersRef =

      collection(

        db,

        CUSTOMERS_COLLECTION

      );


    const snapshot =

      await getDocs(
        customersRef
      );


    const loadedCustomers = [];


    snapshot.forEach(

      customerDoc => {

        const customerData =

          customerDoc.data();


        const normalizedCustomer =

          normalizeCustomer(

            customerData,

            customerDoc.id

          );


        if (
          normalizedCustomer &&
          normalizedCustomer.uid
        ) {

          loadedCustomers.push(
            normalizedCustomer
          );

        }

      }

    );


    setLocalCustomers(
      loadedCustomers
    );


    renderCustomerTable(
      customers
    );


    updateDashboardStats();


    updateLastRefresh();


    console.log(

      "✅ Customers Loaded:",

      customers.length

    );


    return customers;

  }

  catch (error) {

    console.error(

      "❌ Failed To Load Customers:",

      error

    );


    alert(

      "❌ Unable to load customers.\n\n" +

      (
        error?.message ||

        "Please check Firebase connection."

      )

    );


    return [];

  }

}


// =====================================================
// REFRESH CUSTOMERS
// =====================================================

async function refreshCustomers() {

  if (
    refreshCustomersBtn
  ) {

    refreshCustomersBtn.disabled =
      true;

  }


  try {

    await loadCustomersFromFirebase();

  }

  finally {

    if (
      refreshCustomersBtn
    ) {

      refreshCustomersBtn.disabled =
        false;

    }

  }

}


// =====================================================
// REFRESH BUTTON LISTENER
// =====================================================
// ONE listener only.
// =====================================================

if (
  refreshCustomersBtn &&

  refreshCustomersBtn.dataset.refreshListenerAttached !==
  "true"
) {

  refreshCustomersBtn.addEventListener(

    "click",

    refreshCustomers

  );


  refreshCustomersBtn.dataset.refreshListenerAttached =
    "true";

}


// =====================================================
// RESET CURRENT CUSTOMER
// =====================================================

function resetCurrentCustomer() {

  if (
    stampActionProcessing
  ) {

    return;

  }


  if (
    !currentCustomer
  ) {

    clearCustomerPreview();

    return;

  }


  const confirmed =

    window.confirm(

      "Are you sure you want to clear the selected customer?"

    );


  if (!confirmed) {

    return;

  }


  clearCustomerPreview();


  setScannerStatus(

    "🟢 Ready to scan customer QR",

    "ready"

  );


  console.log(
    "🧹 Current customer selection reset."
  );

}


// =====================================================
// RESET CUSTOMER BUTTON LISTENER
// =====================================================

if (
  resetCustomerBtn &&

  resetCustomerBtn.dataset.resetListenerAttached !==
  "true"
) {

  resetCustomerBtn.addEventListener(

    "click",

    resetCurrentCustomer

  );


  resetCustomerBtn.dataset.resetListenerAttached =
    "true";

}


// =====================================================
// LOAD SELECTED CUSTOMER FROM FIRESTORE
// =====================================================

async function loadCustomerByUid(uid) {

  if (!uid) {

    return null;

  }


  try {

    const customerRef =

      doc(

        db,

        CUSTOMERS_COLLECTION,

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


    const customer =

      normalizeCustomer(

        snapshot.data(),

        snapshot.id

      );


    if (
      customer
    ) {

      upsertLocalCustomer(
        customer
      );

    }


    return customer;

  }

  catch (error) {

    console.error(

      "❌ Failed to load customer:",

      error

    );


    return null;

  }

}


// =====================================================
// SET CURRENT CUSTOMER
// =====================================================

async function setCurrentCustomerByUid(uid) {

  if (!uid) {

    clearCustomerPreview();

    return;

  }


  const localCustomer =

    findCustomerByUid(
      uid
    );


  if (
    localCustomer
  ) {

    showCustomer(
      localCustomer
    );

  }


  const freshCustomer =

    await loadCustomerByUid(
      uid
    );


  if (
    freshCustomer
  ) {

    showCustomer(
      freshCustomer
    );

  }

  else {

    alert(
      "❌ Customer record not found."
    );

  }

}


// =====================================================
// INITIAL CUSTOMER DATA LOAD
// =====================================================

async function initializeCustomerData() {

  await loadCustomersFromFirebase();

}


// =====================================================
// PART 3 READY
// =====================================================

console.log(
  "========================================"
);

console.log(
  "✅ ADMIN DASHBOARD PART 3 LOADED"
);

console.log(
  "✅ Customer Preview Ready"
);

console.log(
  "✅ Customer Reset Ready"
);

console.log(
  "✅ Firebase Customer Loading Ready"
);

console.log(
  "✅ Customer Refresh Ready"
);

console.log(
  "✅ Customer Selection Ready"
);

console.log(
  "✅ Scanner Status Helper Ready"
);

console.log(
  "✅ Give Stamp Button State Ready"
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
// QR SCANNER + CUSTOMER LOOKUP + EXPORT
// CLEAN VERSION — NO DUPLICATE FUNCTIONS
// =====================================================


// =====================================================
// QR SCANNER CONFIGURATION
// =====================================================

const QR_SCANNER_CONFIG = {

  fps: 10,

  qrbox: {
    width: 250,
    height: 250
  },

  aspectRatio: 1.0

};


// =====================================================
// QR CODE RESULT HANDLER
// =====================================================

async function handleQrCodeResult(
  decodedText
) {

  if (!decodedText) {

    return;

  }


  const qrValue =

    String(
      decodedText
    ).trim();


  if (!qrValue) {

    return;

  }


  console.log(
    "📱 QR Code Scanned:",
    qrValue
  );


  setScannerStatus(

    "🔄 Customer खोज रहे हैं...",

    "scanning"

  );


  try {

    const customer =
      await findCustomerFromQrValue(
        qrValue
      );


    if (!customer) {

      setScannerStatus(

        "🔴 Customer नहीं मिला",

        "error"

      );


      alert(

        "❌ Customer not found.\n\n" +

        "Please scan a valid Rio Maggi Point customer QR."

      );


      return;

    }


    // -------------------------------------------------
    // STOP SCANNER AFTER SUCCESSFUL SCAN
    // -------------------------------------------------

    await stopScanner();


    // -------------------------------------------------
    // SET CUSTOMER
    // -------------------------------------------------

    currentCustomer =
      customer;


    upsertLocalCustomer(
      customer
    );


    showCustomer(
      customer
    );


    setScannerStatus(

      "🟢 Customer Successfully Selected",

      "success"

    );


    // -------------------------------------------------
    // OPEN SCANNER SECTION
    // -------------------------------------------------

    showSection(
      "scanner"
    );


    console.log(

      "✅ QR Customer Selected:",

      customer

    );

  }

  catch (error) {

    console.error(

      "❌ QR Processing Error:",

      error

    );


    setScannerStatus(

      "🔴 QR Processing Failed",

      "error"

    );


    alert(

      "❌ Unable to process QR code.\n\n" +

      (
        error?.message ||

        "Please try again."

      )

    );

  }

}


// =====================================================
// FIND CUSTOMER FROM QR VALUE
// =====================================================
// Supports:
// 1. Firebase UID
// 2. Member ID
// 3. JSON QR data
// 4. Plain text member ID
// =====================================================

async function findCustomerFromQrValue(
  qrValue
) {

  if (!qrValue) {

    return null;

  }


  const value =
    String(
      qrValue
    ).trim();


  // ---------------------------------------------------
  // TRY JSON QR DATA
  // ---------------------------------------------------

  try {

    const parsed =
      JSON.parse(
        value
      );


    if (
      parsed &&
      typeof parsed ===
      "object"
    ) {

      const possibleUid =

        parsed.uid ||

        parsed.userId ||

        parsed.customerUid ||

        parsed.customerId;


      const possibleMemberId =

        parsed.memberId ||

        parsed.memberID ||

        parsed.membershipId;


      if (
        possibleUid
      ) {

        const customer =

          await loadCustomerByUid(
            possibleUid
          );


        if (
          customer
        ) {

          return customer;

        }

      }


      if (
        possibleMemberId
      ) {

        const customer =

          findCustomerByMemberId(

            String(
              possibleMemberId
            ).trim()

          );


        if (
          customer
        ) {

          return customer;

        }

      }

    }

  }

  catch (error) {

    // QR is not JSON.
    // Continue with normal text lookup.

  }


  // ---------------------------------------------------
  // SEARCH LOCAL UID
  // ---------------------------------------------------

  const localByUid =

    findCustomerByUid(
      value
    );


  if (
    localByUid
  ) {

    return localByUid;

  }


  // ---------------------------------------------------
  // SEARCH LOCAL MEMBER ID
  // ---------------------------------------------------

  const localByMemberId =

    findCustomerByMemberId(
      value
    );


  if (
    localByMemberId
  ) {

    return localByMemberId;

  }


  // ---------------------------------------------------
  // FIREBASE UID LOOKUP
  // ---------------------------------------------------

  const firebaseCustomer =

    await loadCustomerByUid(
      value
    );


  if (
    firebaseCustomer
  ) {

    return firebaseCustomer;

  }


  // ---------------------------------------------------
  // FIREBASE MEMBER ID LOOKUP
  // ---------------------------------------------------

  const firebaseByMemberId =

    await findCustomerInFirebaseByMemberId(
      value
    );


  if (
    firebaseByMemberId
  ) {

    return firebaseByMemberId;

  }


  return null;

}


// =====================================================
// FIND LOCAL CUSTOMER BY MEMBER ID
// =====================================================

function findCustomerByMemberId(
  memberId
) {

  if (!memberId) {

    return null;

  }


  const searchId =

    String(
      memberId
    )
      .trim()
      .toLowerCase();


  return (

    customers.find(

      customer => {

        const customerId =

          getCustomerMemberId(
            customer
          )
            .trim()
            .toLowerCase();


        return (

          customerId &&

          customerId ===
          searchId

        );

      }

    ) ||

    null

  );

}


// =====================================================
// FIND CUSTOMER IN FIREBASE BY MEMBER ID
// =====================================================

async function findCustomerInFirebaseByMemberId(
  memberId
) {

  if (!memberId) {

    return null;

  }


  try {

    const customersRef =

      collection(

        db,

        CUSTOMERS_COLLECTION

      );


    const snapshot =

      await getDocs(
        customersRef
      );


    let foundCustomer =
      null;


    snapshot.forEach(

      customerDoc => {

        if (
          foundCustomer
        ) {

          return;

        }


        const customer =

          normalizeCustomer(

            customerDoc.data(),

            customerDoc.id

          );


        if (!customer) {

          return;

        }


        const customerMemberId =

          getCustomerMemberId(
            customer
          )
            .trim()
            .toLowerCase();


        if (

          customerMemberId &&

          customerMemberId ===

          String(
            memberId
          )
            .trim()
            .toLowerCase()

        ) {

          foundCustomer =
            customer;

        }

      }

    );


    if (
      foundCustomer
    ) {

      upsertLocalCustomer(
        foundCustomer
      );

    }


    return foundCustomer;

  }

  catch (error) {

    console.error(

      "❌ Firebase Member ID Search Error:",

      error

    );


    return null;

  }

}


// =====================================================
// START QR SCANNER
// =====================================================

async function startScanner() {

  if (
    scannerRunning
  ) {

    return;

  }


  if (
    !qrReader
  ) {

    console.error(
      "❌ QR reader element not found."
    );


    alert(

      "❌ QR Scanner area not found.\n\n" +

      "Please check admin-dashboard.html."

    );


    return;

  }


  if (
    typeof Html5Qrcode ===
    "undefined"
  ) {

    console.error(

      "❌ Html5Qrcode library is not loaded."

    );


    alert(

      "❌ QR Scanner library is not loaded.\n\n" +

      "Please check html5-qrcode script."

    );


    return;

  }


  try {

    setScannerStatus(

      "📷 Starting camera...",

      "scanning"

    );


    if (
      !html5QrCode
    ) {

      html5QrCode =

        new Html5Qrcode(
          "qr-reader"
        );

    }


    await html5QrCode.start(

      {
        facingMode:
          "environment"
      },

      QR_SCANNER_CONFIG,

      handleQrCodeResult,

      errorMessage => {

        // Normal scanner frame errors are ignored.
        // They are not fatal errors.

      }

    );


    scannerRunning =
      true;


    if (
      startScannerBtn
    ) {

      startScannerBtn.disabled =
        true;

    }


    if (
      stopScannerBtn
    ) {

      stopScannerBtn.disabled =
        false;

    }


    setScannerStatus(

      "🟢 Scanner Active — QR Code Scan करें",

      "scanning"

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

      "🔴 Unable To Start Scanner",

      "error"

    );


    alert(

      "❌ Unable to start camera.\n\n" +

      (
        error?.message ||

        "Please allow camera permission and try again."

      )

    );

  }

}


// =====================================================
// STOP QR SCANNER
// =====================================================

async function stopScanner() {

  if (
    !html5QrCode
  ) {

    scannerRunning =
      false;

    return;

  }


  try {

    if (
      scannerRunning
    ) {

      await html5QrCode.stop();

    }


    try {

      await html5QrCode.clear();

    }

    catch (clearError) {

      console.warn(

        "⚠️ QR Scanner clear warning:",

        clearError

      );

    }


    scannerRunning =
      false;


    html5QrCode =
      null;


    if (
      startScannerBtn
    ) {

      startScannerBtn.disabled =
        false;

    }


    if (
      stopScannerBtn
    ) {

      stopScannerBtn.disabled =
        true;

    }


    setScannerStatus(

      "🟢 Scanner Stopped",

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


    scannerRunning =
      false;

    html5QrCode =
      null;

  }

}


// =====================================================
// START SCANNER BUTTON
// =====================================================
// ONE listener only.
// =====================================================

if (
  startScannerBtn &&

  startScannerBtn.dataset.scannerStartListenerAttached !==
  "true"
) {

  startScannerBtn.addEventListener(

    "click",

    startScanner

  );


  startScannerBtn.dataset.scannerStartListenerAttached =
    "true";

}


// =====================================================
// STOP SCANNER BUTTON
// =====================================================
// ONE listener only.
// =====================================================

if (
  stopScannerBtn &&

  stopScannerBtn.dataset.scannerStopListenerAttached !==
  "true"
) {

  stopScannerBtn.addEventListener(

    "click",

    stopScanner

  );


  stopScannerBtn.dataset.scannerStopListenerAttached =
    "true";

}


// =====================================================
// EXPORT CUSTOMERS
// =====================================================

function exportCustomers() {

  if (
    !Array.isArray(
      customers
    ) ||
    customers.length === 0
  ) {

    alert(
      "⚠️ No customer data available to export."
    );

    return;

  }


  const headers = [

    "Name",

    "Member ID",

    "Mobile",

    "Stamps",

    "Reward Status"

  ];


  const rows =

    customers.map(

      customer => [

        getCustomerName(
          customer
        ),

        getCustomerMemberId(
          customer
        ),

        getCustomerMobile(
          customer
        ),

        getCustomerStamps(
          customer
        ),

        isCustomerRewardReady(
          customer
        )
          ? "Ready"
          : "Locked"

      ]

    );


  const csvContent = [

    headers,

    ...rows

  ]

    .map(

      row =>

        row.map(

          value =>

            `"${String(
              value ?? ""
            )
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

      [
        "\uFEFF" +
        csvContent
      ],

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

    `rio-maggi-customers-${getTodayKey()}.csv`;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );


  console.log(
    "✅ Customer CSV Exported"
  );

}


// =====================================================
// EXPORT BUTTON LISTENER
// =====================================================

if (
  exportCustomersBtn &&

  exportCustomersBtn.dataset.exportListenerAttached !==
  "true"
) {

  exportCustomersBtn.addEventListener(

    "click",

    exportCustomers

  );


  exportCustomersBtn.dataset.exportListenerAttached =
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
  "✅ QR Scanner Ready"
);

console.log(
  "✅ Camera Start/Stop Ready"
);

console.log(
  "✅ QR Customer Lookup Ready"
);

console.log(
  "✅ UID Lookup Ready"
);

console.log(
  "✅ Member ID Lookup Ready"
);

console.log(
  "✅ Customer CSV Export Ready"
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
// GIVE STAMP + 40-DAY LOYALTY CYCLE
// REWARD UNLOCK + FIREBASE UPDATE + LOGOUT
// FINAL PART — NO DUPLICATE FUNCTIONS
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
// NORMALIZE FIREBASE / DATE VALUE
// =====================================================

function normalizeDateValue(value) {

  if (!value) {
    return null;
  }

  try {

    if (
      value &&
      typeof value.toDate === "function"
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


    if (
      typeof value === "number"
    ) {

      const date =
        new Date(value);

      return (
        !Number.isNaN(
          date.getTime()
        )
      )
        ? date
        : null;

    }


    if (
      typeof value === "string"
    ) {

      const date =
        new Date(value);

      return (
        !Number.isNaN(
          date.getTime()
        )
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

function getCustomerCycleStartDate(
  customer
) {

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
      normalizeDateValue(
        value
      );


    if (date) {

      return date;

    }

  }


  return null;

}


// =====================================================
// GET LOYALTY CYCLE STATUS
// =====================================================

function getLoyaltyCycleStatus(
  customer
) {

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
    getCustomerStamps(
      customer
    );


  const cycleStartDate =
    getCustomerCycleStartDate(
      customer
    );


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


  const expired =

    now >=
    cycleExpiryTime;


  return {

    active: true,

    expired,

    cycleStartDate,

    cycleStartTime,

    cycleExpiryTime,

    remainingMs:

      Math.max(

        0,

        cycleExpiryTime -
        now

      )

  };

}


// =====================================================
// CHECK LOYALTY CYCLE EXPIRATION
// =====================================================

function isLoyaltyCycleExpired(
  customer
) {

  const status =

    getLoyaltyCycleStatus(
      customer
    );


  return (
    status.expired === true
  );

}


// =====================================================
// GET FRESH CUSTOMER DOCUMENT
// =====================================================

async function getCustomerDocument(
  uid
) {

  if (!uid) {

    return null;

  }


  const customerRef =

    doc(

      db,

      CUSTOMERS_COLLECTION,

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


  const customer =

    normalizeCustomer(

      customerSnapshot.data(),

      customerSnapshot.id

    );


  return customer;

}


// =====================================================
// SYNC CUSTOMER AFTER STAMP
// =====================================================

function syncCustomerAfterStamp(
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
    !normalizedCustomer
  ) {

    return;

  }


  // ---------------------------------------------------
  // UPDATE LOCAL CUSTOMER
  // ---------------------------------------------------

  upsertLocalCustomer(
    normalizedCustomer
  );


  // ---------------------------------------------------
  // UPDATE CURRENT CUSTOMER
  // ---------------------------------------------------

  currentCustomer =
    normalizedCustomer;


  // ---------------------------------------------------
  // UPDATE PREVIEW
  // ---------------------------------------------------

  showCustomer(
    normalizedCustomer
  );


  // ---------------------------------------------------
  // UPDATE DASHBOARD
  // ---------------------------------------------------

  updateDashboardStats();


  // ---------------------------------------------------
  // UPDATE CUSTOMER TABLE
  // ---------------------------------------------------

  renderCustomerTable(

    filterCustomers(

      searchCustomer
        ? searchCustomer.value
        : ""

    )

  );


}


// =====================================================
// GIVE STAMP TO CURRENT CUSTOMER
// =====================================================

async function giveStampToCustomer() {

  // ---------------------------------------------------
  // PREVENT DOUBLE CLICK
  // ---------------------------------------------------

  if (
    stampActionProcessing
  ) {

    return;

  }


  // ---------------------------------------------------
  // CUSTOMER CHECK
  // ---------------------------------------------------

  if (
    !currentCustomer ||
    !currentCustomer.uid
  ) {

    alert(

      "❌ Please scan or select a customer first."

    );

    return;

  }


  // ---------------------------------------------------
  // ADMIN AUTH CHECK
  // ---------------------------------------------------

  const currentUser =
    auth.currentUser;


  if (!currentUser) {

    alert(

      "❌ Admin session expired. Please login again."

    );


    location.replace(
      ADMIN_LOGIN_PAGE
    );


    return;

  }


  // ---------------------------------------------------
  // LOCK ACTION
  // ---------------------------------------------------

  stampActionProcessing =
    true;


  updateGiveStampButtonState();


  const originalButtonContent =

    giveStampBtn

      ? giveStampBtn.innerHTML

      : "";


  if (
    giveStampBtn
  ) {

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

    // =================================================
    // GET FRESH FIREBASE CUSTOMER
    // =================================================

    const customerUid =
      currentCustomer.uid;


    const freshCustomer =

      await getCustomerDocument(

        customerUid

      );


    if (
      !freshCustomer
    ) {

      throw new Error(

        "Customer document not found."

      );

    }


    // =================================================
    // CURRENT DATE
    // =================================================

    const todayKey =
      getTodayKey();


    // =================================================
    // CURRENT STAMP COUNT
    // =================================================

    let currentStamps =

      getCustomerStamps(

        freshCustomer

      );


    // =================================================
    // CYCLE STATUS
    // =================================================

    const cycleStatus =

      getLoyaltyCycleStatus(

        freshCustomer

      );


    const cycleExpired =

      cycleStatus.expired;


    // =================================================
    // RESET EXPIRED INCOMPLETE CYCLE
    // =================================================

    if (

      cycleExpired &&

      currentStamps > 0 &&

      currentStamps < MAX_STAMPS

    ) {

      console.log(

        "⏰ 40-day loyalty cycle expired."

      );


      console.log(

        "🔄 Resetting old stamp cycle:",

        currentStamps

      );


      currentStamps =
        0;

    }


    // =================================================
    // DAILY STAMP PROTECTION
    // =================================================

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


    // =================================================
    // REWARD ALREADY READY
    // =================================================

    if (

      currentStamps >=
      MAX_STAMPS

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


    // =================================================
    // NEW CYCLE CHECK
    // =================================================

    const isStartingNewCycle =

      currentStamps === 0;


    // =================================================
    // NEW STAMP COUNT
    // =================================================

    const newStampCount =

      Math.min(

        currentStamps + 1,

        MAX_STAMPS

      );


    // =================================================
    // REWARD UNLOCK
    // =================================================

    const rewardUnlocked =

      newStampCount >=
      MAX_STAMPS;


    // =================================================
    // FIRESTORE CUSTOMER REFERENCE
    // =================================================

    const customerRef =

      doc(

        db,

        CUSTOMERS_COLLECTION,

        customerUid

      );


    // =================================================
    // FIRESTORE UPDATE DATA
    // =================================================

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


    // =================================================
    // START / RESTART 40-DAY CYCLE
    // =================================================

    if (

      isStartingNewCycle ||

      cycleExpired

    ) {

      updateData.cycleStartedAt =

        serverTimestamp();

    }


    // =================================================
    // FIREBASE UPDATE
    // =================================================

    await updateDoc(

      customerRef,

      updateData

    );


    // =================================================
    // CREATE UPDATED LOCAL CUSTOMER
    // =================================================

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


    // ---------------------------------------------------
    // LOCAL CYCLE START
    // ---------------------------------------------------

    if (

      isStartingNewCycle ||

      cycleExpired

    ) {

      updatedCustomer.cycleStartedAt =

        new Date();

    }


    // =================================================
    // SYNC EVERYTHING
    // =================================================

    syncCustomerAfterStamp(

      updatedCustomer

    );


    // =================================================
    // UPDATE LAST REFRESH
    // =================================================

    updateLastRefresh();


    // =================================================
    // SCANNER STATUS
    // =================================================

    setScannerStatus(

      rewardUnlocked

        ? "🎁 Reward Ready"

        : "🟢 Stamp Added Successfully",

      rewardUnlocked

        ? "success"

        : "ready"

    );


    // =================================================
    // SUCCESS MESSAGE
    // =================================================

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


    console.log(

      "✅ Stamp successfully added.",

      {

        customerUid,

        newStampCount,

        cycleExpired,

        newCycleStarted:

          isStartingNewCycle ||

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


    setScannerStatus(

      "🔴 Stamp Update Failed",

      "error"

    );


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


    if (
      giveStampBtn
    ) {

      giveStampBtn.innerHTML =

        originalButtonContent;

    }


    updateGiveStampButtonState();

  }

}


// =====================================================
// GIVE STAMP BUTTON LISTENER
// =====================================================
// ONLY PART 5 OWNS THIS LISTENER.
// =====================================================

if (

  giveStampBtn &&

  giveStampBtn.dataset.stampListenerAttached !==
  "true"

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


  if (
    logoutBtn
  ) {

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

    // -------------------------------------------------
    // STOP SCANNER
    // -------------------------------------------------

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


    // -------------------------------------------------
    // FIREBASE SIGN OUT
    // -------------------------------------------------

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


    if (
      logoutBtn
    ) {

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
// ONLY PART 5 OWNS THIS LISTENER.
// =====================================================

if (

  logoutBtn &&

  logoutBtn.dataset.logoutListenerAttached !==
  "true"

) {

  logoutBtn.addEventListener(

    "click",

    handleAdminLogout

  );


  logoutBtn.dataset.logoutListenerAttached =
    "true";

}


// =====================================================
// INITIALIZE CUSTOMER DATA AFTER AUTH
// =====================================================
// PART 1 auth listener calls initializeDashboard().
// This function loads all customer data once.
// =====================================================

const originalInitializeDashboard =
  initializeDashboard;


// -----------------------------------------------------
// NOTE:
// We cannot redeclare initializeDashboard.
// Instead, load customer data through a one-time
// auth observer here.
// -----------------------------------------------------

let customerDataInitialized =
  false;


onAuthStateChanged(

  auth,

  async user => {

    if (
      !user
    ) {

      return;

    }


    if (
      customerDataInitialized
    ) {

      return;

    }


    customerDataInitialized =
      true;


    try {

      await initializeCustomerData();


      console.log(

        "✅ Initial Customer Data Loaded"

      );

    }

    catch (error) {

      console.error(

        "❌ Initial Customer Data Load Failed:",

        error

      );

    }

  }

);


// =====================================================
// PART 5 READY
// =====================================================

console.log(
  "========================================"
);

console.log(
  "✅ ADMIN DASHBOARD PART 5 LOADED"
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
  "🎉 ADMIN DASHBOARD PART 1–5 COMPLETE"
);

console.log(
  "========================================"
);


// =====================================================
// END OF ADMIN-DASHBOARD.JS
// =====================================================
