// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 1
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
// FIREBASE FIRESTORE IMPORTS
// =====================================================

import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// FIREBASE AUTH IMPORTS
// =====================================================

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// DOM REFERENCES
// =====================================================


// -----------------------------------------------------
// MAIN APP
// -----------------------------------------------------

const adminApp =
  document.getElementById("adminApp");

const dashboardWrapper =
  document.getElementById("dashboardWrapper");


// -----------------------------------------------------
// HEADER
// -----------------------------------------------------

const liveIndicator =
  document.getElementById("liveIndicator");


// -----------------------------------------------------
// NAVIGATION
// -----------------------------------------------------

const dashboardMenu =
  document.getElementById("dashboardMenu");

const scannerMenu =
  document.getElementById("scannerMenu");

const customersMenu =
  document.getElementById("customersMenu");

const stampMenu =
  document.getElementById("stampMenu");

const rewardMenu =
  document.getElementById("rewardMenu");

const reportMenu =
  document.getElementById("reportMenu");

const settingMenu =
  document.getElementById("settingMenu");

const logoutBtn =
  document.getElementById("logoutBtn");


// -----------------------------------------------------
// SCANNER SECTION
// -----------------------------------------------------

const scannerSection =
  document.getElementById("scannerSection");

const qrReader =
  document.getElementById("qr-reader");

const cameraOverlay =
  document.getElementById("cameraOverlay");

const startScannerBtn =
  document.getElementById("startScannerBtn");

const stopScannerBtn =
  document.getElementById("stopScannerBtn");

const scannerStatus =
  document.getElementById("scannerStatus");


// -----------------------------------------------------
// CUSTOMER PREVIEW
// -----------------------------------------------------

const scanCustomerPhoto =
  document.getElementById("scanCustomerPhoto");

const scanCustomerName =
  document.getElementById("scanCustomerName");

const scanMemberId =
  document.getElementById("scanMemberId");

const scanStampCount =
  document.getElementById("scanStampCount");

const todayStatus =
  document.getElementById("todayStatus");

const giveStampBtn =
  document.getElementById("giveStampBtn");

const cancelScanBtn =
  document.getElementById("cancelScanBtn");


// -----------------------------------------------------
// DASHBOARD STATISTICS
// -----------------------------------------------------

const totalCustomers =
  document.getElementById("totalCustomers");

const totalStamps =
  document.getElementById("totalStamps");

const totalRewards =
  document.getElementById("totalRewards");

const todayScans =
  document.getElementById("todayScans");


// -----------------------------------------------------
// CUSTOMER TABLE
// -----------------------------------------------------

const customerSection =
  document.getElementById("customerSection");

const customerTable =
  document.getElementById("customerTable");

const searchCustomer =
  document.getElementById("searchCustomer");


// -----------------------------------------------------
// QUICK ACTIONS
// -----------------------------------------------------

const quickActions =
  document.getElementById("quickActions");

const refreshBtn =
  document.getElementById("refreshBtn");

const exportBtn =
  document.getElementById("exportBtn");

const rewardBtn =
  document.getElementById("rewardBtn");

const settingsBtn =
  document.getElementById("settingsBtn");


// -----------------------------------------------------
// SYSTEM STATUS
// -----------------------------------------------------

const firebaseStatus =
  document.getElementById("firebaseStatus");

const adminStatus =
  document.getElementById("adminStatus");

const lastRefresh =
  document.getElementById("lastRefresh");


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================


// -----------------------------------------------------
// ALL CUSTOMERS
// -----------------------------------------------------

let customers = [];


// -----------------------------------------------------
// CURRENT CUSTOMER
// -----------------------------------------------------

let currentCustomer = null;


// -----------------------------------------------------
// TODAY'S SCAN COUNT
// -----------------------------------------------------

let todayScanCount = 0;


// -----------------------------------------------------
// TOTAL STAMP COUNT
// -----------------------------------------------------

let totalStampCount = 0;


// -----------------------------------------------------
// TOTAL REWARD COUNT
// -----------------------------------------------------

let totalRewardCount = 0;


// -----------------------------------------------------
// QR SCANNER INSTANCE
// -----------------------------------------------------

let html5QrCode = null;


// -----------------------------------------------------
// SCANNER STATE
// -----------------------------------------------------

let scannerRunning = false;


// -----------------------------------------------------
// QR PROCESSING LOCK
// -----------------------------------------------------

let processingQr = false;


// -----------------------------------------------------
// DASHBOARD LOADING STATE
// -----------------------------------------------------
// IMPORTANT:
// यह variable सिर्फ Part 1 में declare किया गया है.
// Part 3 में इसे दोबारा declare नहीं किया जाएगा.
// -----------------------------------------------------

let dashboardLoading = false;


// -----------------------------------------------------
// STAMP UPDATE STATE
// -----------------------------------------------------

let stampUpdateProcessing = false;


// -----------------------------------------------------
// STAMP ACTION STATE
// -----------------------------------------------------
// Give Stamp operation के लिए single processing lock.
// Part 5 में इसे दोबारा declare नहीं किया जाएगा.
// -----------------------------------------------------

let stampActionProcessing = false;


// -----------------------------------------------------
// LOGOUT STATE
// -----------------------------------------------------

let logoutProcessing = false;


// =====================================================
// APPLICATION CONSTANTS
// =====================================================


// -----------------------------------------------------
// MAXIMUM STAMPS
// -----------------------------------------------------

const MAX_STAMPS = 6;


// -----------------------------------------------------
// QR PREFIX
// -----------------------------------------------------

const QR_PREFIX = "RIO-MAGGI::";


// -----------------------------------------------------
// DEFAULT CUSTOMER AVATARS
// -----------------------------------------------------

const DEFAULT_MALE_AVATAR =
  "assets/avatars/male.png";

const DEFAULT_FEMALE_AVATAR =
  "assets/avatars/female.png";


// -----------------------------------------------------
// ADMIN LOGIN PAGE
// -----------------------------------------------------

const ADMIN_LOGIN_PAGE =
  "admin-login.html";


// -----------------------------------------------------
// ADMIN CUSTOMER PAGE
// -----------------------------------------------------

const ADMIN_CUSTOMERS_PAGE =
  "admin-customers.html";


// -----------------------------------------------------
// ADMIN REWARDS PAGE
// -----------------------------------------------------

const ADMIN_REWARDS_PAGE =
  "admin-rewards.html";


// -----------------------------------------------------
// ADMIN REPORTS PAGE
// -----------------------------------------------------

const ADMIN_REPORTS_PAGE =
  "admin-reports.html";


// -----------------------------------------------------
// ADMIN SETTINGS PAGE
// -----------------------------------------------------

const ADMIN_SETTINGS_PAGE =
  "admin-settings.html";


// -----------------------------------------------------
// ADMIN EXPORT PAGE
// -----------------------------------------------------

const ADMIN_EXPORT_PAGE =
  "admin-export.html";


// =====================================================
// INITIAL BUTTON STATE
// =====================================================


// -----------------------------------------------------
// START SCANNER BUTTON
// -----------------------------------------------------

if (startScannerBtn) {

  startScannerBtn.disabled =
    false;

}


// -----------------------------------------------------
// STOP SCANNER BUTTON
// -----------------------------------------------------

if (stopScannerBtn) {

  stopScannerBtn.disabled =
    true;

}


// -----------------------------------------------------
// GIVE STAMP BUTTON
// -----------------------------------------------------

if (giveStampBtn) {

  giveStampBtn.disabled =
    true;

}


// =====================================================
// INITIAL SYSTEM STATUS
// =====================================================


// -----------------------------------------------------
// FIREBASE STATUS
// -----------------------------------------------------

if (firebaseStatus) {

  firebaseStatus.textContent =
    "🟡 Connecting...";

  firebaseStatus.className =
    "pending";

}


// -----------------------------------------------------
// ADMIN STATUS
// -----------------------------------------------------

if (adminStatus) {

  adminStatus.textContent =
    "🟡 Checking...";

  adminStatus.className =
    "pending";

}


// -----------------------------------------------------
// SCANNER STATUS
// -----------------------------------------------------

if (scannerStatus) {

  scannerStatus.textContent =
    "⚪ Ready";

  scannerStatus.className =
    "ready";

}


// -----------------------------------------------------
// LIVE INDICATOR
// -----------------------------------------------------

if (liveIndicator) {

  liveIndicator.textContent =
    "🟡 CONNECTING";

}


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
  "Premium Admin Dashboard"
);

console.log(
  "Admin Dashboard JS — Part 1"
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
  "✅ Application Constants Ready"
);

console.log(
  "✅ Initial UI State Ready"
);

console.log(
  "➡️ Admin Dashboard JS Part 1 Loaded"
);

console.log(
  "➡️ Waiting for Part 2..."
);


// =====================================================
// END OF PART 1
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 2
// HELPERS + CUSTOMER PREVIEW + TABLE + SEARCH
// CLEAN VERSION — NO DUPLICATE LOGIC
// =====================================================


// =====================================================
// GET TODAY DATE KEY
// =====================================================

function getTodayKey() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


// =====================================================
// GET CUSTOMER AVATAR
// =====================================================

function getCustomerAvatar(
  customer
) {

  if (!customer) {

    return DEFAULT_MALE_AVATAR;

  }


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


  const gender =
    String(
      customer.gender || ""
    )
      .trim()
      .toLowerCase();


  if (gender === "female") {

    return DEFAULT_FEMALE_AVATAR;

  }


  return DEFAULT_MALE_AVATAR;

}


// =====================================================
// GET CUSTOMER MOBILE
// =====================================================

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


// =====================================================
// GET CUSTOMER STAMP COUNT
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
// GET STAMP STATUS
// =====================================================

function getStampStatus(
  customer
) {

  if (!customer) {

    return "Waiting";

  }


  if (
    hasStampToday(customer)
  ) {

    return "Already Stamped Today";

  }


  if (
    getCustomerStamps(customer) >=
    MAX_STAMPS
  ) {

    return "Reward Ready";

  }


  return "Ready To Give Stamp";

}


// =====================================================
// ESCAPE HTML
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
// RESET CUSTOMER PREVIEW
// =====================================================

function resetCustomerPreview() {

  currentCustomer =
    null;


  if (scanCustomerPhoto) {

    scanCustomerPhoto.src =
      DEFAULT_MALE_AVATAR;

    scanCustomerPhoto.alt =
      "Customer Photo";

  }


  if (scanCustomerName) {

    scanCustomerName.textContent =
      "Waiting For Scan...";

  }


  if (scanMemberId) {

    scanMemberId.textContent =
      "RIO-000000000";

  }


  if (scanStampCount) {

    scanStampCount.textContent =
      `0 / ${MAX_STAMPS}`;

  }


  if (todayStatus) {

    todayStatus.textContent =
      "Waiting";

    todayStatus.className =
      "pending";

  }


  if (giveStampBtn) {

    giveStampBtn.disabled =
      true;

  }

}


// =====================================================
// SHOW CUSTOMER PREVIEW
// =====================================================

function showCustomer(
  customer
) {

  if (!customer) {

    resetCustomerPreview();

    return;

  }


  currentCustomer =
    customer;


  const stamps =
    getCustomerStamps(
      customer
    );


  const stampedToday =
    hasStampToday(
      customer
    );


  const rewardReady =
    stamps >= MAX_STAMPS;


  const status =
    getStampStatus(
      customer
    );


  // ---------------------------------------------------
  // CUSTOMER PHOTO
  // ---------------------------------------------------

  if (scanCustomerPhoto) {

    scanCustomerPhoto.src =
      getCustomerAvatar(
        customer
      );

    scanCustomerPhoto.alt =
      `${customer.name || "Customer"} Photo`;

  }


  // ---------------------------------------------------
  // CUSTOMER NAME
  // ---------------------------------------------------

  if (scanCustomerName) {

    scanCustomerName.textContent =

      customer.name ||

      "Unknown Customer";

  }


  // ---------------------------------------------------
  // MEMBER ID
  // ---------------------------------------------------

  if (scanMemberId) {

    scanMemberId.textContent =

      customer.memberId ||

      "RIO-000000000";

  }


  // ---------------------------------------------------
  // STAMP COUNT
  // ---------------------------------------------------

  if (scanStampCount) {

    scanStampCount.textContent =
      `${stamps} / ${MAX_STAMPS}`;

  }


  // ---------------------------------------------------
  // TODAY STATUS
  // ---------------------------------------------------

  if (todayStatus) {

    todayStatus.textContent =
      status;


    if (stampedToday) {

      todayStatus.className =
        "pending";

    }

    else if (rewardReady) {

      todayStatus.className =
        "success";

    }

    else {

      todayStatus.className =
        "success";

    }

  }


  // ---------------------------------------------------
  // GIVE STAMP BUTTON
  // ---------------------------------------------------

  if (giveStampBtn) {

    giveStampBtn.disabled = (

      stampedToday ||

      rewardReady ||

      stampActionProcessing

    );

  }

}


// =====================================================
// CREATE CUSTOMER TABLE ROW
// =====================================================

function createCustomerRow(
  customer
) {

  if (

    !customerTable ||

    !customer

  ) {

    return null;

  }


  const tr =
    document.createElement("tr");


  const avatar =
    getCustomerAvatar(
      customer
    );


  const customerName =
    customer.name ||
    "-";


  const memberId =
    customer.memberId ||
    "RIO-000000000";


  const mobile =
    getCustomerMobile(
      customer
    );


  const stamps =
    getCustomerStamps(
      customer
    );


  const rewardUnlocked =
    customer.rewardUnlocked === true;


  const rewardReady = (

    rewardUnlocked ||

    stamps >= MAX_STAMPS

  );


  const rewardText =

    rewardReady

      ? "✅ Ready"

      : "❌ Locked";


  tr.innerHTML = `

    <td>

      <img
        src="${escapeHtml(avatar)}"
        alt="${escapeHtml(customerName)} Photo"
        class="customer-table-avatar"
        loading="lazy"
      >

    </td>

    <td>

      ${escapeHtml(customerName)}

    </td>

    <td>

      ${escapeHtml(memberId)}

    </td>

    <td>

      ${escapeHtml(mobile)}

    </td>

    <td>

      <strong>
        ${stamps} / ${MAX_STAMPS}
      </strong>

    </td>

    <td>

      ${rewardText}

    </td>

    <td>

      <button
        type="button"
        class="customer-view-btn"
        data-customer-id="${escapeHtml(customer.uid || "")}"
      >
        View
      </button>

    </td>

  `;


  const viewButton =
    tr.querySelector(
      ".customer-view-btn"
    );


  if (viewButton) {

    viewButton.addEventListener(

      "click",

      () => {

        selectCustomer(
          customer.uid
        );

      }

    );

  }


  return tr;

}


// =====================================================
// FILTER CUSTOMERS
// =====================================================

function filterCustomers(
  keyword = ""
) {

  const searchTerm =

    String(keyword)

      .trim()

      .toLowerCase();


  if (!searchTerm) {

    return [...customers];

  }


  return customers.filter(

    (customer) => {

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
          getCustomerMobile(
            customer
          )
        )
          .toLowerCase();


      return (

        name.includes(
          searchTerm
        )

        ||

        memberId.includes(
          searchTerm
        )

        ||

        mobile.includes(
          searchTerm
        )

      );

    }

  );

}


// =====================================================
// RENDER CUSTOMER TABLE
// =====================================================

function renderCustomerTable(
  customerList = customers
) {

  if (!customerTable) {

    return;

  }


  customerTable.innerHTML =
    "";


  if (

    !Array.isArray(
      customerList
    ) ||

    customerList.length === 0

  ) {

    const emptyRow =
      document.createElement("tr");


    emptyRow.innerHTML = `

      <td
        colspan="7"
        class="empty-table-message"
      >
        No Customers Found
      </td>

    `;


    customerTable.appendChild(
      emptyRow
    );


    return;

  }


  const fragment =
    document.createDocumentFragment();


  customerList.forEach(

    (customer) => {

      const row =
        createCustomerRow(
          customer
        );


      if (row) {

        fragment.appendChild(
          row
        );

      }

    }

  );


  customerTable.appendChild(
    fragment
  );

}


// =====================================================
// RENDER CURRENT CUSTOMER SEARCH RESULTS
// =====================================================
// यह helper search input की current value से
// सही filtered customer array बनाकर table render करता है.
// =====================================================

function renderFilteredCustomerTable() {

  const keyword =

    searchCustomer

      ? searchCustomer.value

      : "";


  renderCustomerTable(

    filterCustomers(
      keyword
    )

  );

}


// =====================================================
// SELECT CUSTOMER
// =====================================================

function selectCustomer(
  uid
) {

  if (!uid) {

    return;

  }


  const customer =
    customers.find(

      (item) =>

        item.uid ===
        uid

    );


  if (!customer) {

    console.warn(

      "Customer not found:",

      uid

    );


    return;

  }


  showCustomer(
    customer
  );


  if (scannerSection) {

    scannerSection.scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

  }

}


// =====================================================
// GLOBAL COMPATIBILITY
// =====================================================

window.selectCustomer =
  selectCustomer;


// =====================================================
// CUSTOMER SEARCH EVENT
// =====================================================

searchCustomer?.addEventListener(

  "input",

  () => {

    renderFilteredCustomerTable();

  }

);


// =====================================================
// CUSTOMER TABLE IMAGE FALLBACK
// =====================================================

customerTable?.addEventListener(

  "error",

  (event) => {

    const image =
      event.target;


    if (

      image &&

      image.tagName ===
      "IMG"

    ) {

      if (

        image.dataset.fallbackApplied ===
        "true"

      ) {

        return;

      }


      image.dataset.fallbackApplied =
        "true";


      image.src =
        DEFAULT_MALE_AVATAR;

    }

  },

  true

);


// =====================================================
// PART 2 READY
// =====================================================

console.log(
  "✅ Part 2 Loaded"
);

console.log(
  "✅ Customer Helper Functions Ready"
);

console.log(
  "✅ Customer Preview Ready"
);

console.log(
  "✅ Customer Table Rendering Ready"
);

console.log(
  "✅ Customer Search Ready"
);

console.log(
  "✅ Customer Image Fallback Ready"
);

console.log(
  "➡️ Waiting for Part 3..."
);


// =====================================================
// END OF PART 2
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 3
// AUTHENTICATION + FIRESTORE DATA + DASHBOARD STATS
// CLEAN VERSION — NO DUPLICATE STATE / LISTENERS
// =====================================================


// =====================================================
// DASHBOARD STATUS
// =====================================================

function updateDashboardStatus(
  message,
  statusClass = ""
) {

  if (!scannerStatus) {
    return;
  }

  scannerStatus.textContent = message;

  if (statusClass) {
    scannerStatus.className = statusClass;
  }

}


// =====================================================
// LAST REFRESH TIME
// =====================================================

function updateLastRefresh() {

  if (!lastRefresh) {
    return;
  }

  lastRefresh.textContent =
    new Date().toLocaleString();

}


// =====================================================
// UPDATE DASHBOARD STATISTICS
// =====================================================

function updateDashboardStats() {

  let stampCount = 0;

  let rewardCount = 0;

  let dailyScanCount = 0;

  const todayKey =
    getTodayKey();


  customers.forEach(
    (customer) => {

      // -------------------------------------------------
      // TOTAL STAMPS
      // -------------------------------------------------

      stampCount +=
        getCustomerStamps(
          customer
        );


      // -------------------------------------------------
      // TOTAL REWARDS
      // -------------------------------------------------

      if (
        customer.rewardUnlocked === true ||
        getCustomerStamps(customer) >= MAX_STAMPS
      ) {

        rewardCount++;

      }


      // -------------------------------------------------
      // TODAY'S SCANS / STAMPS
      // -------------------------------------------------

      if (
        customer.dailyStampDate === todayKey ||
        customer.lastStampDate === todayKey
      ) {

        dailyScanCount++;

      }

    }
  );


  // -----------------------------------------------------
  // UPDATE DOM
  // -----------------------------------------------------

  if (totalCustomers) {

    totalCustomers.textContent =
      customers.length;

  }


  if (totalStamps) {

    totalStamps.textContent =
      stampCount;

  }


  if (totalRewards) {

    totalRewards.textContent =
      rewardCount;

  }


  if (todayScans) {

    todayScans.textContent =
      dailyScanCount;

  }


  // -----------------------------------------------------
  // SYNC GLOBAL COUNTS
  // -----------------------------------------------------

  totalStampCount =
    stampCount;

  totalRewardCount =
    rewardCount;

  todayScanCount =
    dailyScanCount;

}


// =====================================================
// LOAD CUSTOMERS FROM FIRESTORE
// =====================================================

async function loadCustomers() {

  const customersSnapshot =
    await getDocs(
      collection(
        db,
        "customers"
      )
    );


  const loadedCustomers = [];


  customersSnapshot.forEach(
    (documentSnapshot) => {

      const data =
        documentSnapshot.data();


      const customer = {

        ...data,

        uid:
          documentSnapshot.id

      };


      // -------------------------------------------------
      // NORMALIZE STAMPS
      // -------------------------------------------------

      customer.stamps =
        getCustomerStamps(
          customer
        );


      // -------------------------------------------------
      // NORMALIZE MEMBER ID
      // -------------------------------------------------

      if (
        customer.memberId !== null &&
        customer.memberId !== undefined
      ) {

        customer.memberId =
          String(
            customer.memberId
          ).trim();

      }

      else {

        customer.memberId =
          "";

      }


      loadedCustomers.push(
        customer
      );

    }
  );


  return loadedCustomers;

}


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

  // -----------------------------------------------------
  // PREVENT DUPLICATE LOAD REQUESTS
  // -----------------------------------------------------

  if (dashboardLoading) {
    return;
  }


  dashboardLoading =
    true;


  try {

    // ---------------------------------------------------
    // STATUS
    // ---------------------------------------------------

    updateDashboardStatus(
      "🟡 Loading Dashboard...",
      "pending"
    );


    // ---------------------------------------------------
    // LOAD FIRESTORE CUSTOMERS
    // ---------------------------------------------------

    const loadedCustomers =
      await loadCustomers();


    // ---------------------------------------------------
    // REPLACE LOCAL CUSTOMER ARRAY
    // ---------------------------------------------------

    customers =
      loadedCustomers;


    // ---------------------------------------------------
    // RESET SELECTED CUSTOMER
    // ---------------------------------------------------

    resetCustomerPreview();


    // ---------------------------------------------------
    // RENDER CUSTOMER TABLE
    // ---------------------------------------------------

    renderCustomerTable(
      customers
    );


    // ---------------------------------------------------
    // UPDATE STATISTICS
    // ---------------------------------------------------

    updateDashboardStats();


    // ---------------------------------------------------
    // UPDATE REFRESH TIME
    // ---------------------------------------------------

    updateLastRefresh();


    // ---------------------------------------------------
    // FIREBASE STATUS
    // ---------------------------------------------------

    if (firebaseStatus) {

      firebaseStatus.textContent =
        "🟢 Connected";

      firebaseStatus.className =
        "online";

    }


    // ---------------------------------------------------
    // DASHBOARD STATUS
    // ---------------------------------------------------

    updateDashboardStatus(
      "🟢 Dashboard Ready",
      "ready"
    );


    if (liveIndicator) {

      liveIndicator.textContent =
        "🟢 LIVE";

    }


    console.log(
      "✅ Dashboard loaded successfully."
    );

    console.log(
      "Total Customers:",
      customers.length
    );

    console.log(
      "Total Stamps:",
      totalStampCount
    );

    console.log(
      "Total Rewards:",
      totalRewardCount
    );

    console.log(
      "Today's Scans:",
      todayScanCount
    );

  }

  catch (error) {

    // ---------------------------------------------------
    // ERROR LOG
    // ---------------------------------------------------

    console.error(
      "❌ Dashboard Load Error:",
      error
    );


    // ---------------------------------------------------
    // FIREBASE STATUS
    // ---------------------------------------------------

    if (firebaseStatus) {

      firebaseStatus.textContent =
        "🔴 Connection Error";

      firebaseStatus.className =
        "error";

    }


    // ---------------------------------------------------
    // DASHBOARD STATUS
    // ---------------------------------------------------

    updateDashboardStatus(
      "🔴 Dashboard Error",
      "error"
    );


    if (liveIndicator) {

      liveIndicator.textContent =
        "🔴 OFFLINE";

    }


    // ---------------------------------------------------
    // SHOW TABLE ERROR ONLY IF NO DATA EXISTS
    // ---------------------------------------------------

    if (
      customers.length === 0 &&
      customerTable
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

    dashboardLoading =
      false;

  }

}


// =====================================================
// ADMIN AUTHENTICATION STATE
// =====================================================

onAuthStateChanged(

  auth,

  async (user) => {

    // ---------------------------------------------------
    // USER NOT LOGGED IN
    // ---------------------------------------------------

    if (!user) {

      console.warn(
        "⚠️ Admin authentication required."
      );


      // -----------------------------------------------
      // STOP ACTIVE SCANNER
      // -----------------------------------------------

      if (
        scannerRunning &&
        typeof stopScanner === "function"
      ) {

        try {

          await stopScanner();

        }

        catch (error) {

          console.warn(
            "Scanner stop during logout failed:",
            error
          );

        }

      }


      // -----------------------------------------------
      // UPDATE ADMIN STATUS
      // -----------------------------------------------

      if (adminStatus) {

        adminStatus.textContent =
          "🔴 Not Authenticated";

        adminStatus.className =
          "error";

      }


      // -----------------------------------------------
      // REDIRECT TO LOGIN
      // -----------------------------------------------

      if (
        location.pathname.endsWith(
          "admin-dashboard.html"
        )
      ) {

        location.replace(
          ADMIN_LOGIN_PAGE
        );

      }


      return;

    }


    // ---------------------------------------------------
    // AUTHENTICATED ADMIN
    // ---------------------------------------------------

    console.log(
      "✅ Admin Authentication Verified"
    );


    console.log(
      "Admin UID:",
      user.uid
    );


    // ---------------------------------------------------
    // UPDATE ADMIN STATUS
    // ---------------------------------------------------

    if (adminStatus) {

      adminStatus.textContent =
        "🟢 Verified";

      adminStatus.className =
        "online";

    }


    // ---------------------------------------------------
    // LOAD DASHBOARD
    // ---------------------------------------------------

    await loadDashboard();

  }

);


// =====================================================
// REFRESH DASHBOARD BUTTON
// =====================================================

refreshBtn?.addEventListener(

  "click",

  async () => {

    // ---------------------------------------------------
    // PREVENT DUPLICATE REFRESH
    // ---------------------------------------------------

    if (
      dashboardLoading ||
      refreshBtn.dataset.processing === "true"
    ) {

      return;

    }


    refreshBtn.dataset.processing =
      "true";


    refreshBtn.disabled =
      true;


    // ---------------------------------------------------
    // SAVE ORIGINAL BUTTON CONTENT
    // ---------------------------------------------------

    const originalContent =
      refreshBtn.innerHTML;


    // ---------------------------------------------------
    // LOADING UI
    // ---------------------------------------------------

    refreshBtn.innerHTML = `

      <i
        class="fa-solid fa-spinner fa-spin"
        aria-hidden="true"
      ></i>

      <span>
        Refreshing...
      </span>

    `;


    try {

      await loadDashboard();

    }

    finally {

      // -------------------------------------------------
      // RESTORE BUTTON
      // -------------------------------------------------

      refreshBtn.innerHTML =
        originalContent;


      refreshBtn.dataset.processing =
        "false";


      refreshBtn.disabled =
        false;

    }

  }

);


// =====================================================
// GLOBAL ADMIN DASHBOARD API
// =====================================================
// Other admin modules can safely access these methods.
// No duplicate global object declaration should exist
// elsewhere in this file.

window.adminDashboard = {

  loadDashboard,

  loadCustomers,

  updateDashboardStats,

  renderCustomerTable,

  resetCustomerPreview,

  showCustomer,

  selectCustomer

};


// =====================================================
// PART 3 READY
// =====================================================

console.log(
  "✅ Admin Dashboard Part 3 Loaded"
);

console.log(
  "✅ Firebase Authentication Ready"
);

console.log(
  "✅ Firestore Customer Loading Ready"
);

console.log(
  "✅ Dashboard Statistics Ready"
);

console.log(
  "✅ Dashboard Refresh Ready"
);

console.log(
  "➡️ Waiting for Part 4..."
);


// =====================================================
// END OF PART 3
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 4
// QR SCANNER + QR VALIDATION + CUSTOMER LOOKUP
// CLEAN VERSION — NO DUPLICATE SCANNER LOGIC
// =====================================================


// =====================================================
// SCANNER CONFIGURATION
// =====================================================

const SCANNER_CONFIG = {

  fps: 10,

  qrbox: {
    width: 250,
    height: 250
  }

};


// =====================================================
// SCANNER STATUS HELPER
// =====================================================

function setScannerStatus(
  message,
  statusClass = ""
) {

  if (!scannerStatus) {
    return;
  }

  scannerStatus.textContent =
    message;

  scannerStatus.className =
    statusClass;

}


// =====================================================
// CHECK QR SCANNER LIBRARY
// =====================================================

function isQrScannerAvailable() {

  return (
    typeof Html5Qrcode !==
    "undefined"
  );

}


// =====================================================
// RESET SCANNER UI
// =====================================================

function resetScannerUI() {

  if (startScannerBtn) {

    startScannerBtn.disabled =
      false;

  }

  if (stopScannerBtn) {

    stopScannerBtn.disabled =
      true;

  }

  if (cameraOverlay) {

    cameraOverlay.style.display =
      "flex";

  }

}


// =====================================================
// START QR SCANNER
// =====================================================

async function startScanner() {

  // ---------------------------------------------------
  // PREVENT DUPLICATE SCANNER START
  // ---------------------------------------------------

  if (scannerRunning) {
    return;
  }


  // ---------------------------------------------------
  // CHECK QR LIBRARY
  // ---------------------------------------------------

  if (
    !isQrScannerAvailable()
  ) {

    console.error(
      "❌ Html5Qrcode library is not loaded."
    );

    setScannerStatus(
      "🔴 QR Library Error",
      "error"
    );

    alert(
      "❌ QR Scanner Library Not Loaded."
    );

    return;

  }


  // ---------------------------------------------------
  // CHECK QR READER ELEMENT
  // ---------------------------------------------------

  if (!qrReader) {

    console.error(
      "❌ QR Reader Element Not Found."
    );

    setScannerStatus(
      "🔴 Scanner Element Error",
      "error"
    );

    return;

  }


  // ---------------------------------------------------
  // RESET PROCESSING LOCK
  // ---------------------------------------------------

  processingQr =
    false;


  // ---------------------------------------------------
  // CLEAN OLD INSTANCE
  // ---------------------------------------------------

  if (html5QrCode) {

    const oldScanner =
      html5QrCode;

    html5QrCode =
      null;

    try {

      await oldScanner.stop();

    }

    catch (error) {

      console.warn(
        "Previous scanner stop warning:",
        error
      );

    }

    try {

      await oldScanner.clear();

    }

    catch (error) {

      console.warn(
        "Previous scanner clear warning:",
        error
      );

    }

  }


  // ---------------------------------------------------
  // UPDATE UI BEFORE CAMERA START
  // ---------------------------------------------------

  setScannerStatus(
    "🟡 Opening Camera...",
    "pending"
  );


  if (startScannerBtn) {

    startScannerBtn.disabled =
      true;

  }


  if (stopScannerBtn) {

    stopScannerBtn.disabled =
      false;

  }


  if (cameraOverlay) {

    cameraOverlay.style.display =
      "none";

  }


  try {

    // -------------------------------------------------
    // CREATE NEW SCANNER INSTANCE
    // -------------------------------------------------

    const scanner =
      new Html5Qrcode(
        qrReader.id
      );


    html5QrCode =
      scanner;


    // -------------------------------------------------
    // START CAMERA
    // -------------------------------------------------

    await scanner.start(

      {
        facingMode:
          "environment"
      },

      SCANNER_CONFIG,

      onScanSuccess,

      onScanError

    );


    // -------------------------------------------------
    // UPDATE SCANNER STATE
    // -------------------------------------------------

    scannerRunning =
      true;

    processingQr =
      false;


    setScannerStatus(
      "🟢 Scanner Running",
      "ready"
    );


    if (startScannerBtn) {

      startScannerBtn.disabled =
        true;

    }


    if (stopScannerBtn) {

      stopScannerBtn.disabled =
        false;

    }


    console.log(
      "✅ QR Scanner Started"
    );

  }

  catch (error) {

    console.error(
      "❌ Scanner Start Error:",
      error
    );


    // -------------------------------------------------
    // RESET STATE
    // -------------------------------------------------

    scannerRunning =
      false;

    processingQr =
      false;


    // -------------------------------------------------
    // CLEAN FAILED INSTANCE
    // -------------------------------------------------

    const failedScanner =
      html5QrCode;

    html5QrCode =
      null;


    if (failedScanner) {

      try {

        await failedScanner.stop();

      }

      catch (stopError) {

        console.warn(
          "Failed scanner stop warning:",
          stopError
        );

      }


      try {

        await failedScanner.clear();

      }

      catch (clearError) {

        console.warn(
          "Failed scanner clear warning:",
          clearError
        );

      }

    }


    // -------------------------------------------------
    // RESET UI
    // -------------------------------------------------

    resetScannerUI();


    setScannerStatus(
      "🔴 Camera Error",
      "error"
    );


    alert(
      "❌ Unable To Start Camera.\n\n" +
      "Please allow camera permission and try again."
    );

  }

}


// =====================================================
// QR SCANNER ERROR CALLBACK
// =====================================================
// html5-qrcode लगातार scan attempt के दौरान इसे call
// करता है। यहाँ कोई alert नहीं दिखाना है।

function onScanError(
  errorMessage
) {

  // Intentionally empty.
  // Continuous QR scan errors are ignored.

}


// =====================================================
// STOP QR SCANNER
// =====================================================

async function stopScanner() {

  // ---------------------------------------------------
  // CAPTURE CURRENT INSTANCE
  // ---------------------------------------------------

  const scanner =
    html5QrCode;


  // ---------------------------------------------------
  // CLEAR GLOBAL STATE IMMEDIATELY
  // ---------------------------------------------------

  html5QrCode =
    null;

  scannerRunning =
    false;

  processingQr =
    false;


  // ---------------------------------------------------
  // NO ACTIVE SCANNER
  // ---------------------------------------------------

  if (!scanner) {

    resetScannerUI();

    return;

  }


  // ---------------------------------------------------
  // STOP CAMERA
  // ---------------------------------------------------

  try {

    await scanner.stop();

  }

  catch (error) {

    console.warn(
      "Scanner stop warning:",
      error
    );

  }


  // ---------------------------------------------------
  // CLEAR QR READER
  // ---------------------------------------------------

  try {

    await scanner.clear();

  }

  catch (error) {

    console.warn(
      "Scanner clear warning:",
      error
    );

  }


  // ---------------------------------------------------
  // RESET UI
  // ---------------------------------------------------

  resetScannerUI();


  setScannerStatus(
    "⚪ Camera Stopped",
    "ready"
  );


  console.log(
    "✅ QR Scanner Stopped"
  );

}


// =====================================================
// START SCANNER BUTTON
// =====================================================

startScannerBtn?.addEventListener(

  "click",

  async () => {

    if (
      startScannerBtn.disabled
    ) {

      return;

    }

    await startScanner();

  }

);


// =====================================================
// STOP SCANNER BUTTON
// =====================================================

stopScannerBtn?.addEventListener(

  "click",

  async () => {

    if (
      stopScannerBtn.disabled
    ) {

      return;

    }

    await stopScanner();

  }

);


// =====================================================
// PARSE RIO MAGGI QR
// =====================================================

function parseRioMaggiQr(
  decodedText
) {

  if (
    typeof decodedText !==
    "string"
  ) {

    return null;

  }


  const qrValue =
    decodedText.trim();


  // ---------------------------------------------------
  // VALIDATE QR PREFIX
  // ---------------------------------------------------

  if (
    !qrValue.startsWith(
      QR_PREFIX
    )
  ) {

    return null;

  }


  // ---------------------------------------------------
  // EXTRACT MEMBER ID
  // ---------------------------------------------------

  const memberId =

    qrValue

      .slice(
        QR_PREFIX.length
      )

      .trim();


  if (!memberId) {

    return null;

  }


  return memberId;

}


// =====================================================
// FIND CUSTOMER BY MEMBER ID
// =====================================================

async function findCustomerByMemberId(
  memberId
) {

  if (!memberId) {

    return null;

  }


  const normalizedMemberId =
    String(
      memberId
    ).trim();


  // ---------------------------------------------------
  // FIRST SEARCH LOCAL CUSTOMER ARRAY
  // ---------------------------------------------------

  const localCustomer =
    customers.find(

      (customer) =>

        String(
          customer.memberId || ""
        ).trim() ===
        normalizedMemberId

    );


  if (localCustomer) {

    return localCustomer;

  }


  // ---------------------------------------------------
  // SEARCH FIRESTORE
  // ---------------------------------------------------

  const customerQuery =
    query(

      collection(
        db,
        "customers"
      ),

      where(
        "memberId",
        "==",
        normalizedMemberId
      )

    );


  const snapshot =
    await getDocs(
      customerQuery
    );


  if (
    snapshot.empty
  ) {

    return null;

  }


  // ---------------------------------------------------
  // GET FIRST MATCH
  // ---------------------------------------------------

  const customerDocument =
    snapshot.docs[0];


  if (!customerDocument) {

    return null;

  }


  const customer = {

    ...customerDocument.data(),

    uid:
      customerDocument.id

  };


  // ---------------------------------------------------
  // NORMALIZE DATA
  // ---------------------------------------------------

  customer.stamps =
    getCustomerStamps(
      customer
    );


  customer.memberId =
    String(
      customer.memberId || ""
    ).trim();


  return customer;

}


// =====================================================
// UPDATE CUSTOMER IN LOCAL ARRAY
// =====================================================

function upsertLocalCustomer(
  customer
) {

  if (
    !customer ||
    !customer.uid
  ) {

    return;

  }


  const existingIndex =
    customers.findIndex(

      (item) =>

        item.uid ===
        customer.uid

    );


  // ---------------------------------------------------
  // ADD NEW CUSTOMER
  // ---------------------------------------------------

  if (
    existingIndex === -1
  ) {

    customers.push(
      customer
    );

    return;

  }


  // ---------------------------------------------------
  // UPDATE EXISTING CUSTOMER
  // ---------------------------------------------------

  customers[
    existingIndex
  ] =
    {
      ...customers[
        existingIndex
      ],

      ...customer
    };

}


// =====================================================
// HANDLE SUCCESSFUL QR SCAN
// =====================================================

async function onScanSuccess(
  decodedText
) {

  // ---------------------------------------------------
  // PREVENT MULTIPLE QR CALLBACKS
  // ---------------------------------------------------

  if (processingQr) {

    return;

  }


  processingQr =
    true;


  try {

    // -------------------------------------------------
    // STOP CAMERA FIRST
    // -------------------------------------------------

    await stopScanner();


    // -------------------------------------------------
    // PARSE QR VALUE
    // -------------------------------------------------

    const memberId =
      parseRioMaggiQr(
        decodedText
      );


    // -------------------------------------------------
    // INVALID QR
    // -------------------------------------------------

    if (!memberId) {

      setScannerStatus(
        "🔴 Invalid QR Code",
        "error"
      );


      resetCustomerPreview();


      alert(
        "❌ Invalid Rio Maggi Point QR Code."
      );


      return;

    }


    console.log(
      "Scanned Member ID:",
      memberId
    );


    // -------------------------------------------------
    // FIND CUSTOMER
    // -------------------------------------------------

    setScannerStatus(
      "🟡 Finding Customer...",
      "pending"
    );


    const foundCustomer =
      await findCustomerByMemberId(
        memberId
      );


    // -------------------------------------------------
    // CUSTOMER NOT FOUND
    // -------------------------------------------------

    if (!foundCustomer) {

      setScannerStatus(
        "🔴 Customer Not Found",
        "error"
      );


      resetCustomerPreview();


      alert(

        "❌ Customer Not Found.\n\n" +

        `Member ID: ${memberId}`

      );


      return;

    }


    // -------------------------------------------------
    // UPDATE LOCAL CUSTOMER
    // -------------------------------------------------

    upsertLocalCustomer(
      foundCustomer
    );


    // -------------------------------------------------
    // SHOW CUSTOMER PREVIEW
    // -------------------------------------------------

    showCustomer(
      foundCustomer
    );


    // -------------------------------------------------
    // UPDATE STATUS
    // -------------------------------------------------

    setScannerStatus(
      "🟢 Customer Found",
      "ready"
    );


    // -------------------------------------------------
    // UPDATE TABLE
    // -------------------------------------------------

    const searchValue =
      searchCustomer
        ? searchCustomer.value
        : "";


    renderCustomerTable(
      filterCustomers(
        searchValue
      )
    );


    console.log(
      "✅ Customer QR Scan Successful:",
      foundCustomer.memberId
    );

  }

  catch (error) {

    console.error(
      "❌ QR Processing Error:",
      error
    );


    setScannerStatus(
      "🔴 QR Processing Error",
      "error"
    );


    alert(
      "❌ Unable To Process QR Code."
    );

  }

  finally {

    // -------------------------------------------------
    // RELEASE QR PROCESSING LOCK
    // -------------------------------------------------

    processingQr =
      false;

  }

}


// =====================================================
// SCROLL TO SCANNER
// =====================================================

function scrollToScanner() {

  if (!scannerSection) {

    return;

  }


  scannerSection.scrollIntoView({

    behavior:
      "smooth",

    block:
      "start"

  });

}


// =====================================================
// SCANNER MENU
// =====================================================

scannerMenu?.addEventListener(

  "click",

  () => {

    scrollToScanner();

  }

);


// =====================================================
// STAMP MENU
// =====================================================

stampMenu?.addEventListener(

  "click",

  () => {

    scrollToScanner();

  }

);


// =====================================================
// DASHBOARD MENU
// =====================================================

dashboardMenu?.addEventListener(

  "click",

  () => {

    window.scrollTo({

      top:
        0,

      behavior:
        "smooth"

    });

  }

);


// =====================================================
// INITIAL SCANNER UI
// =====================================================

resetScannerUI();


// =====================================================
// PART 4 READY
// =====================================================

console.log(
  "✅ Admin Dashboard Part 4 Loaded"
);

console.log(
  "✅ QR Scanner Ready"
);

console.log(
  "✅ Camera Start / Stop Ready"
);

console.log(
  "✅ QR Prefix Validation Ready"
);

console.log(
  "✅ Firebase Customer Lookup Ready"
);

console.log(
  "✅ Customer Preview Integration Ready"
);

console.log(
  "➡️ Waiting for Part 5..."
);


// =====================================================
// END OF PART 4
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 5
// GIVE STAMP + REWARD UNLOCK + FIREBASE UPDATE
// CLEAN VERSION — NO DUPLICATE STAMP LOGIC
// =====================================================


// =====================================================
// STAMP ACTION STATE
// =====================================================

let stampActionProcessing = false;


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


  // ---------------------------------------------------
  // NORMALIZE STAMP COUNT
  // ---------------------------------------------------

  customer.stamps =
    getCustomerStamps(
      customer
    );


  // ---------------------------------------------------
  // NORMALIZE MEMBER ID
  // ---------------------------------------------------

  customer.memberId =
    String(
      customer.memberId || ""
    ).trim();


  return customer;

}


// =====================================================
// GIVE STAMP TO CURRENT CUSTOMER
// =====================================================

async function giveStampToCustomer() {

  // ---------------------------------------------------
  // PREVENT DOUBLE CLICK / DUPLICATE REQUEST
  // ---------------------------------------------------

  if (
    stampActionProcessing
  ) {

    return;

  }


  // ---------------------------------------------------
  // CHECK SELECTED CUSTOMER
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
  // CHECK ADMIN AUTHENTICATION
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
  // START PROCESSING
  // ---------------------------------------------------

  stampActionProcessing =
    true;


  if (giveStampBtn) {

    giveStampBtn.disabled =
      true;

  }


  const originalButtonContent =

    giveStampBtn
      ? giveStampBtn.innerHTML
      : "";


  // ---------------------------------------------------
  // BUTTON LOADING STATE
  // ---------------------------------------------------

  if (giveStampBtn) {

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
    // ALWAYS FETCH FRESH CUSTOMER DATA
    // =================================================

    const freshCustomer =
      await getCustomerDocument(
        currentCustomer.uid
      );


    if (!freshCustomer) {

      throw new Error(
        "Customer document not found."
      );

    }


    // =================================================
    // GET CURRENT STAMPS
    // =================================================

    const currentStamps =
      getCustomerStamps(
        freshCustomer
      );


    const todayKey =
      getTodayKey();


    // =================================================
    // CHECK TODAY'S STAMP
    // =================================================

    const alreadyStampedToday = (

      freshCustomer.dailyStampDate ===
      todayKey

      ||

      freshCustomer.lastStampDate ===
      todayKey

    );


    if (
      alreadyStampedToday
    ) {

      const syncedCustomer = {

        ...freshCustomer,

        stamps:
          currentStamps

      };


      upsertLocalCustomer(
        syncedCustomer
      );


      currentCustomer =
        syncedCustomer;


      showCustomer(
        syncedCustomer
      );


      updateDashboardStats();


      alert(
        "⚠️ This customer has already received today's stamp."
      );


      return;

    }


    // =================================================
    // CHECK REWARD READY STATE
    // =================================================

    if (
      currentStamps >=
      MAX_STAMPS
    ) {

      const syncedCustomer = {

        ...freshCustomer,

        stamps:
          currentStamps

      };


      upsertLocalCustomer(
        syncedCustomer
      );


      currentCustomer =
        syncedCustomer;


      showCustomer(
        syncedCustomer
      );


      updateDashboardStats();


      alert(
        "🎁 This customer already has a reward ready."
      );


      return;

    }


    // =================================================
    // CALCULATE NEW STAMP COUNT
    // =================================================

    const newStampCount =
      Math.min(

        currentStamps + 1,

        MAX_STAMPS

      );


    // =================================================
    // CHECK REWARD UNLOCK
    // =================================================

    const rewardUnlocked =

      newStampCount >=
      MAX_STAMPS;


    // =================================================
    // CUSTOMER FIRESTORE REFERENCE
    // =================================================

    const customerRef =
      doc(

        db,

        "customers",

        currentCustomer.uid

      );


    // =================================================
    // UPDATE CUSTOMER DOCUMENT
    // =================================================

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
          currentUser.uid

      }

    );


    // =================================================
    // CREATE UPDATED CUSTOMER OBJECT
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


    // =================================================
    // UPDATE LOCAL CUSTOMER ARRAY
    // =================================================

    upsertLocalCustomer(
      updatedCustomer
    );


    // =================================================
    // UPDATE CURRENT CUSTOMER
    // =================================================

    currentCustomer =
      updatedCustomer;


    // =================================================
    // UPDATE CUSTOMER PREVIEW
    // =================================================

    showCustomer(
      updatedCustomer
    );


    // =================================================
    // UPDATE DASHBOARD STATISTICS
    // =================================================

    updateDashboardStats();


    // =================================================
    // REFRESH CUSTOMER TABLE
    // =================================================

    const searchValue =
      searchCustomer
        ? searchCustomer.value
        : "";


    renderCustomerTable(
      filterCustomers(
        searchValue
      )
    );


    // =================================================
    // UPDATE REFRESH TIME
    // =================================================

    updateLastRefresh();


    // =================================================
    // UPDATE STATUS
    // =================================================

    setScannerStatus(

      rewardUnlocked

        ? "🎁 Reward Ready"

        : "🟢 Stamp Added Successfully",

      "ready"

    );


    // =================================================
    // SUCCESS MESSAGE
    // =================================================

    if (
      rewardUnlocked
    ) {

      alert(

        "🎉 Stamp Added Successfully!\n\n" +

        "🎁 Congratulations! Customer Reward is now READY."

      );

    }

    else {

      alert(

        "✅ Stamp Added Successfully!\n\n" +

        `Current Stamps: ${newStampCount}/${MAX_STAMPS}`

      );

    }


    // =================================================
    // SUCCESS LOG
    // =================================================

    console.log(
      "========================================"
    );

    console.log(
      "✅ Stamp Added Successfully"
    );

    console.log(
      "Customer:",
      updatedCustomer.name || "-"
    );

    console.log(
      "Member ID:",
      updatedCustomer.memberId || "-"
    );

    console.log(
      "New Stamps:",
      `${newStampCount}/${MAX_STAMPS}`
    );

    console.log(
      "Reward Unlocked:",
      rewardUnlocked
    );

    console.log(
      "========================================"
    );

  }

  catch (error) {

    // =================================================
    // ERROR HANDLING
    // =================================================

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

      "Please check your internet connection " +

      "and try again."

    );

  }

  finally {

    // =================================================
    // RELEASE PROCESSING LOCK
    // =================================================

    stampActionProcessing =
      false;


    // =================================================
    // RESTORE BUTTON CONTENT
    // =================================================

    if (giveStampBtn) {

      giveStampBtn.innerHTML =
        originalButtonContent;

    }


    // =================================================
    // RE-EVALUATE GIVE STAMP BUTTON
    // =================================================

    if (
      giveStampBtn
    ) {

      if (
        currentCustomer
      ) {

        giveStampBtn.disabled = (

          hasStampToday(
            currentCustomer
          )

          ||

          getCustomerStamps(
            currentCustomer
          ) >= MAX_STAMPS

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
// GIVE STAMP BUTTON EVENT
// =====================================================
// IMPORTANT:
// This is the ONLY Give Stamp click listener.
// Do not add another giveStampBtn listener elsewhere.

giveStampBtn?.addEventListener(

  "click",

  giveStampToCustomer

);


// =====================================================
// LOGOUT BUTTON
// =====================================================
// Logout logic is kept here as the single logout handler.

logoutBtn?.addEventListener(

  "click",

  async () => {

    // -------------------------------------------------
    // PREVENT MULTIPLE LOGOUT REQUESTS
    // -------------------------------------------------

    if (
      logoutProcessing
    ) {

      return;

    }


    logoutProcessing =
      true;


    if (logoutBtn) {

      logoutBtn.disabled =
        true;

    }


    const originalContent =
      logoutBtn
        ? logoutBtn.innerHTML
        : "";


    if (logoutBtn) {

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
      // STOP SCANNER BEFORE LOGOUT
      // -------------------------------------------------

      if (
        scannerRunning ||
        html5QrCode
      ) {

        await stopScanner();

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


      // -------------------------------------------------
      // AUTH STATE LISTENER WILL HANDLE REDIRECT
      // -------------------------------------------------

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

);


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
  "✅ Firebase Stamp Update Ready"
);

console.log(
  "✅ 6 Stamp Reward Unlock Ready"
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
  "🎉 ADMIN-DASHBOARD.JS PART 1–5 FOUNDATION COMPLETE"
);

console.log(
  "➡️ Next: Remaining Admin Dashboard Features"
);

console.log(
  "========================================"
);


// =====================================================
// END OF PART 5
// =====================================================
