// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V5
// CLEAN & DUPLICATE-FREE
// PART 1
// FIREBASE + DOM + GLOBALS + CONSTANTS
// =====================================================


// =====================================================
// FIREBASE IMPORTS
// =====================================================

import {
  auth,
  db
} from "./firebase-config.js";

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

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// =====================================================
// DOM ELEMENTS
// =====================================================


// -----------------------------
// DASHBOARD STATS
// -----------------------------

const totalCustomers =
  document.getElementById("totalCustomers");

const totalStamps =
  document.getElementById("totalStamps");

const totalRewards =
  document.getElementById("totalRewards");

const todayScans =
  document.getElementById("todayScans");


// -----------------------------
// CUSTOMER TABLE
// -----------------------------

const customerTable =
  document.getElementById("customerTable");

const searchCustomer =
  document.getElementById("searchCustomer");


// -----------------------------
// QUICK ACTIONS
// -----------------------------

const refreshBtn =
  document.getElementById("refreshBtn");

const exportBtn =
  document.getElementById("exportBtn");

const rewardBtn =
  document.getElementById("rewardBtn");

const settingsBtn =
  document.getElementById("settingsBtn");


// -----------------------------
// SCANNER
// -----------------------------

const startScannerBtn =
  document.getElementById("startScannerBtn");

const stopScannerBtn =
  document.getElementById("stopScannerBtn");

const giveStampBtn =
  document.getElementById("giveStampBtn");

const cancelScanBtn =
  document.getElementById("cancelScanBtn");


// -----------------------------
// SCANNER STATUS
// -----------------------------

const scannerStatus =
  document.getElementById("scannerStatus");

const lastRefresh =
  document.getElementById("lastRefresh");


// -----------------------------
// CUSTOMER PREVIEW
// -----------------------------

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


// -----------------------------
// CAMERA OVERLAY
// -----------------------------

const cameraOverlay =
  document.getElementById("cameraOverlay");


// -----------------------------
// LOGOUT
// -----------------------------

const logoutBtn =
  document.getElementById("logoutBtn");


// -----------------------------
// NAVIGATION
// -----------------------------

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


// =====================================================
// GLOBAL VARIABLES
// =====================================================


// All customers loaded from Firebase
let customers = [];


// Currently selected customer
let currentCustomer = null;


// Number of customers who received today's stamp
let todayScanCount = 0;


// HTML5 QR Scanner instance
let html5QrCode = null;


// Scanner running status
let scannerRunning = false;


// Prevent duplicate QR processing
let processingQr = false;


// =====================================================
// CONSTANTS
// =====================================================


// Maximum stamps required for free Veg Maggi
const MAX_STAMPS = 6;


// QR code prefix used by Rio Maggi Point
const QR_PREFIX = "RIO-MAGGI::";


// =====================================================
// PART 1 READY
// =====================================================

console.log(
  "🍜 Rio Maggi Point Admin Dashboard V5"
);

console.log(
  "✅ Firebase Imports Ready"
);

console.log(
  "✅ DOM Elements Ready"
);

console.log(
  "✅ Global Variables Ready"
);

console.log(
  "✅ Constants Ready"
);

console.log(
  "➡️ Waiting for Part 2..."
);


// =====================================================
// END OF PART 1
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V5
// PART 2
// HELPER FUNCTIONS + CUSTOMER TABLE + SEARCH
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

function getCustomerAvatar(customer) {

  if (
    customer &&
    customer.photoURL &&
    typeof customer.photoURL === "string" &&
    customer.photoURL.trim() !== ""
  ) {

    return customer.photoURL;

  }


  if (
    customer &&
    customer.photoUrl &&
    typeof customer.photoUrl === "string" &&
    customer.photoUrl.trim() !== ""
  ) {

    return customer.photoUrl;

  }


  if (
    customer &&
    customer.photo &&
    typeof customer.photo === "string" &&
    customer.photo.trim() !== ""
  ) {

    return customer.photo;

  }


  if (
    customer &&
    customer.gender &&
    String(
      customer.gender
    ).toLowerCase() === "female"
  ) {

    return "assets/avatars/female.png";

  }


  return "assets/avatars/male.png";

}


// =====================================================
// CHECK TODAY'S STAMP
// =====================================================

function hasStampToday(customer) {

  if (!customer) {

    return false;

  }


  const todayKey =
    getTodayKey();


  if (
    customer.dailyStampDate &&
    customer.dailyStampDate === todayKey
  ) {

    return true;

  }


  if (
    customer.lastStampDate &&
    customer.lastStampDate === todayKey
  ) {

    return true;

  }


  return false;

}


// =====================================================
// GET STAMP STATUS
// =====================================================

function getStampStatus(customer) {

  if (!customer) {

    return "Waiting";

  }


  if (
    hasStampToday(customer)
  ) {

    return "Already Stamped Today";

  }


  if (
    Number(
      customer.stamps || 0
    ) >= MAX_STAMPS
  ) {

    return "Reward Ready";

  }


  return "Ready To Give Stamp";

}


// =====================================================
// HTML ESCAPE PROTECTION
// =====================================================

function escapeHtml(value) {

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
      "assets/avatars/male.png";

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
      `0/${MAX_STAMPS}`;

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

function showCustomer(customer) {

  if (!customer) {

    return;

  }


  currentCustomer =
    customer;


  if (scanCustomerPhoto) {

    scanCustomerPhoto.src =
      getCustomerAvatar(customer);

  }


  if (scanCustomerName) {

    scanCustomerName.textContent =
      customer.name || "-";

  }


  if (scanMemberId) {

    scanMemberId.textContent =
      customer.memberId ||
      "RIO-000000000";

  }


  if (scanStampCount) {

    scanStampCount.textContent =
      `${Number(
        customer.stamps || 0
      )}/${MAX_STAMPS}`;

  }


  const status =
    getStampStatus(
      customer
    );


  if (todayStatus) {

    todayStatus.textContent =
      status;


    if (
      hasStampToday(customer)
    ) {

      todayStatus.className =
        "pending";

    }

    else if (
      Number(
        customer.stamps || 0
      ) >= MAX_STAMPS
    ) {

      todayStatus.className =
        "success";

    }

    else {

      todayStatus.className =
        "success";

    }

  }


  if (giveStampBtn) {

    giveStampBtn.disabled = (

      hasStampToday(customer) ||

      Number(
        customer.stamps || 0
      ) >= MAX_STAMPS

    );

  }

}


// =====================================================
// CREATE CUSTOMER TABLE ROW
// =====================================================

function createCustomerRow(customer) {

  if (!customerTable) {

    return;

  }


  const tr =
    document.createElement("tr");


  const avatar =
    getCustomerAvatar(
      customer
    );


  const customerName =
    customer.name || "-";


  const memberId =
    customer.memberId ||
    "RIO-000000000";


  const mobile =
    customer.mobile ||
    customer.phone ||
    customer.phoneNumber ||
    "-";


  const stamps =
    Number(
      customer.stamps || 0
    );


  const rewardUnlocked =
    customer.rewardUnlocked === true;


  const stampedToday =
    hasStampToday(
      customer
    );


  let rewardText =
    "❌ Locked";


  if (rewardUnlocked) {

    rewardText =
      "✅ Ready";

  }


  let stampStatusText =
    "Give Stamp";


  if (stampedToday) {

    stampStatusText =
      "Already Stamped";

  }


  tr.innerHTML = `

    <td>

      <img
        src="${escapeHtml(avatar)}"
        alt="Customer Photo"
        style="
          width:45px;
          height:45px;
          border-radius:50%;
          object-fit:cover;
        "
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
        ${stamps}/${MAX_STAMPS}
      </strong>

    </td>

    <td>
      ${rewardText}
    </td>

    <td>

      <button
        type="button"
        class="customer-view-btn"
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


  customerTable.appendChild(
    tr
  );

}


// =====================================================
// SELECT CUSTOMER
// =====================================================

function selectCustomer(uid) {

  if (!uid) {

    return;

  }


  const customer =
    customers.find(
      (item) =>
        item.uid === uid
    );


  if (!customer) {

    alert(
      "❌ Customer Not Found"
    );

    return;

  }


  showCustomer(
    customer
  );


  const scannerSection =
    document.getElementById(
      "scannerSection"
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
// CUSTOMER SEARCH
// =====================================================

searchCustomer?.addEventListener(
  "input",
  (event) => {

    if (!customerTable) {

      return;

    }


    const keyword =
      event.target.value
        .trim()
        .toLowerCase();


    customerTable.innerHTML =
      "";


    if (!keyword) {

      customers.forEach(
        createCustomerRow
      );

      return;

    }


    const filteredCustomers =
      customers.filter(
        (customer) => {

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

              customer.mobile ||

              customer.phone ||

              customer.phoneNumber ||

              ""

            ).toLowerCase();


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
      createCustomerRow
    );


    if (
      filteredCustomers.length === 0
    ) {

      const emptyRow =
        document.createElement("tr");


      emptyRow.innerHTML = `

        <td
          colspan="7"
          style="
            text-align:center;
            padding:25px;
          "
        >

          No Customer Found

        </td>

      `;


      customerTable.appendChild(
        emptyRow
      );

    }

  }
);


// =====================================================
// PART 2 READY
// =====================================================

console.log(
  "✅ Helper Functions Ready"
);

console.log(
  "✅ Customer Preview Ready"
);

console.log(
  "✅ Customer Table Ready"
);

console.log(
  "✅ Customer Search Ready"
);

console.log(
  "➡️ Waiting for Part 3..."
);


// =====================================================
// END OF PART 2
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V5
// PART 3
// LOAD DASHBOARD + AUTHENTICATION
// =====================================================


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

  try {

    // -------------------------------------------------
    // RESET LOCAL DATA
    // -------------------------------------------------

    if (customerTable) {

      customerTable.innerHTML =
        "";

    }


    customers =
      [];


    todayScanCount =
      0;


    let stampCount =
      0;


    let rewardCount =
      0;


    // -------------------------------------------------
    // TODAY'S DATE
    // -------------------------------------------------

    const todayKey =
      getTodayKey();


    // -------------------------------------------------
    // GET CUSTOMERS FROM FIREBASE
    // -------------------------------------------------

    const snapshot =
      await getDocs(
        collection(
          db,
          "customers"
        )
      );


    // -------------------------------------------------
    // PROCESS CUSTOMERS
    // -------------------------------------------------

    snapshot.forEach(
      (documentSnapshot) => {

        const customer = {

          ...documentSnapshot.data(),

          uid:
            documentSnapshot.id

        };


        // ------------------------------------------------
        // NORMALIZE STAMPS
        // ------------------------------------------------

        customer.stamps =
          Number(
            customer.stamps || 0
          );


        // ------------------------------------------------
        // STORE CUSTOMER
        // ------------------------------------------------

        customers.push(
          customer
        );


        // ------------------------------------------------
        // TOTAL STAMPS
        // ------------------------------------------------

        stampCount +=
          customer.stamps;


        // ------------------------------------------------
        // TOTAL REWARDS
        // ------------------------------------------------

        if (
          customer.rewardUnlocked === true
        ) {

          rewardCount++;

        }


        // ------------------------------------------------
        // TODAY'S STAMP COUNT
        // ------------------------------------------------

        if (

          customer.dailyStampDate ===
          todayKey

          ||

          customer.lastStampDate ===
          todayKey

        ) {

          todayScanCount++;

        }


        // ------------------------------------------------
        // CREATE CUSTOMER ROW
        // ------------------------------------------------

        createCustomerRow(
          customer
        );

      }
    );


    // =================================================
    // UPDATE DASHBOARD STATS
    // =================================================

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
        todayScanCount;

    }


    // =================================================
    // UPDATE LAST REFRESH
    // =================================================

    if (lastRefresh) {

      lastRefresh.textContent =
        new Date().toLocaleString();

    }


    // =================================================
    // UPDATE STATUS
    // =================================================

    if (scannerStatus) {

      scannerStatus.textContent =
        "🟢 Dashboard Ready";

    }


    console.log(
      "✅ Dashboard Loaded Successfully"
    );


    console.log(
      "Total Customers:",
      customers.length
    );


    console.log(
      "Total Stamps:",
      stampCount
    );


    console.log(
      "Total Rewards:",
      rewardCount
    );


    console.log(
      "Today's Stamps:",
      todayScanCount
    );

  }

  catch (error) {

    console.error(
      "❌ Dashboard Load Error:",
      error
    );


    if (scannerStatus) {

      scannerStatus.textContent =
        "🔴 Dashboard Error";

    }

  }

}


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    // -------------------------------------------------
    // USER NOT LOGGED IN
    // -------------------------------------------------

    if (!user) {

      location.href =
        "admin-login.html";

      return;

    }


    // -------------------------------------------------
    // USER LOGGED IN
    // -------------------------------------------------

    console.log(
      "✅ Admin Authentication Verified"
    );


    console.log(
      "Admin UID:",
      user.uid
    );


    try {

      await loadDashboard();

    }

    catch (error) {

      console.error(
        "❌ Admin Dashboard Initialization Error:",
        error
      );

    }

  }
);


// =====================================================
// REFRESH DASHBOARD
// =====================================================

refreshBtn?.addEventListener(
  "click",
  async () => {

    // Prevent multiple refresh clicks

    if (
      refreshBtn.dataset.processing ===
      "true"
    ) {

      return;

    }


    refreshBtn.dataset.processing =
      "true";


    refreshBtn.disabled =
      true;


    try {

      await loadDashboard();

    }

    catch (error) {

      console.error(
        "Refresh Error:",
        error
      );


      alert(
        "❌ Unable To Refresh Dashboard"
      );

    }

    finally {

      refreshBtn.dataset.processing =
        "false";


      refreshBtn.disabled =
        false;

    }

  }
);


// =====================================================
// RESET CUSTOMER BUTTON
// =====================================================

cancelScanBtn?.addEventListener(
  "click",
  () => {

    resetCustomerPreview();

  }
);


// =====================================================
// PART 3 READY
// =====================================================

console.log(
  "✅ Firebase Authentication Ready"
);

console.log(
  "✅ Dashboard Data Loading Ready"
);

console.log(
  "✅ Dashboard Statistics Ready"
);

console.log(
  "✅ Customer Data Loading Ready"
);

console.log(
  "✅ Refresh Button Ready"
);

console.log(
  "➡️ Waiting for Part 4..."
);


// =====================================================
// END OF PART 3
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V5
// PART 4
// QR SCANNER + QR VALIDATION + CUSTOMER SELECTION
// =====================================================


// =====================================================
// START QR SCANNER
// =====================================================

async function startScanner() {

  // ---------------------------------------------------
  // PREVENT MULTIPLE SCANNER INSTANCES
  // ---------------------------------------------------

  if (scannerRunning) {

    return;

  }


  // ---------------------------------------------------
  // CHECK QR SCANNER LIBRARY
  // ---------------------------------------------------

  if (
    typeof Html5Qrcode ===
    "undefined"
  ) {

    alert(
      "❌ QR Scanner Library Not Loaded"
    );

    console.error(
      "Html5Qrcode library is not available."
    );

    return;

  }


  // ---------------------------------------------------
  // RESET PROCESSING STATE
  // ---------------------------------------------------

  processingQr =
    false;


  // ---------------------------------------------------
  // UPDATE STATUS
  // ---------------------------------------------------

  if (scannerStatus) {

    scannerStatus.textContent =
      "🟡 Opening Camera...";

  }


  // ---------------------------------------------------
  // HIDE CAMERA OVERLAY
  // ---------------------------------------------------

  if (cameraOverlay) {

    cameraOverlay.style.display =
      "none";

  }


  try {

    // -------------------------------------------------
    // CREATE SCANNER
    // -------------------------------------------------

    html5QrCode =
      new Html5Qrcode(
        "qr-reader"
      );


    // -------------------------------------------------
    // START CAMERA
    // -------------------------------------------------

    await html5QrCode.start(

      {
        facingMode:
          "environment"
      },

      {
        fps:
          10,

        qrbox: {

          width:
            250,

          height:
            250

        }

      },

      onScanSuccess,

      onScanError

    );


    // -------------------------------------------------
    // SCANNER SUCCESSFULLY STARTED
    // -------------------------------------------------

    scannerRunning =
      true;


    if (scannerStatus) {

      scannerStatus.textContent =
        "🟢 Scanner Running";

    }


    // -------------------------------------------------
    // UPDATE BUTTONS
    // -------------------------------------------------

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


    scannerRunning =
      false;


    html5QrCode =
      null;


    // -------------------------------------------------
    // SHOW CAMERA OVERLAY
    // -------------------------------------------------

    if (cameraOverlay) {

      cameraOverlay.style.display =
        "flex";

    }


    // -------------------------------------------------
    // UPDATE STATUS
    // -------------------------------------------------

    if (scannerStatus) {

      scannerStatus.textContent =
        "🔴 Camera Error";

    }


    // -------------------------------------------------
    // RESET BUTTONS
    // -------------------------------------------------

    if (startScannerBtn) {

      startScannerBtn.disabled =
        false;

    }


    if (stopScannerBtn) {

      stopScannerBtn.disabled =
        true;

    }


    alert(

      "❌ Unable To Start Camera.\n\n" +

      "Please allow camera permission " +

      "and try again."

    );

  }

}


// =====================================================
// QR SCANNER ERROR HANDLER
// =====================================================

function onScanError(
  errorMessage
) {

  // ---------------------------------------------------
  // DO NOT SHOW ALERTS HERE
  // ---------------------------------------------------
  // QR scanner continuously reports errors
  // while searching for a QR code.
  // Showing alerts here would create hundreds
  // of popup messages.
  // ---------------------------------------------------

}


// =====================================================
// STOP QR SCANNER
// =====================================================

async function stopScanner() {

  // ---------------------------------------------------
  // NOTHING TO STOP
  // ---------------------------------------------------

  if (
    !html5QrCode ||
    !scannerRunning
  ) {

    return;

  }


  try {

    // -------------------------------------------------
    // STOP CAMERA
    // -------------------------------------------------

    await html5QrCode.stop();


    // -------------------------------------------------
    // CLEAR SCANNER
    // -------------------------------------------------

    try {

      await html5QrCode.clear();

    }

    catch (clearError) {

      console.log(
        "Scanner Clear Warning:",
        clearError
      );

    }

  }

  catch (error) {

    console.error(
      "❌ Scanner Stop Error:",
      error
    );

  }


  // ---------------------------------------------------
  // RESET SCANNER STATE
  // ---------------------------------------------------

  scannerRunning =
    false;


  html5QrCode =
    null;


  processingQr =
    false;


  // ---------------------------------------------------
  // UPDATE STATUS
  // ---------------------------------------------------

  if (scannerStatus) {

    scannerStatus.textContent =
      "⚪ Camera Stopped";

  }


  // ---------------------------------------------------
  // SHOW CAMERA OVERLAY
  // ---------------------------------------------------

  if (cameraOverlay) {

    cameraOverlay.style.display =
      "flex";

  }


  // ---------------------------------------------------
  // RESET BUTTONS
  // ---------------------------------------------------

  if (startScannerBtn) {

    startScannerBtn.disabled =
      false;

  }


  if (stopScannerBtn) {

    stopScannerBtn.disabled =
      true;

  }


  console.log(
    "✅ QR Scanner Stopped"
  );

}


// =====================================================
// START SCANNER BUTTON
// =====================================================

startScannerBtn?.addEventListener(
  "click",
  startScanner
);


// =====================================================
// STOP SCANNER BUTTON
// =====================================================

stopScannerBtn?.addEventListener(
  "click",
  stopScanner
);


// =====================================================
// QR SCAN SUCCESS
// =====================================================

async function onScanSuccess(
  decodedText
) {

  // ---------------------------------------------------
  // PREVENT DUPLICATE PROCESSING
  // ---------------------------------------------------

  if (processingQr) {

    return;

  }


  processingQr =
    true;


  try {

    // -------------------------------------------------
    // STOP CAMERA
    // -------------------------------------------------

    await stopScanner();


    // -------------------------------------------------
    // VALIDATE QR CODE
    // -------------------------------------------------

    if (
      !decodedText ||
      !decodedText.startsWith(
        QR_PREFIX
      )
    ) {

      alert(
        "❌ Invalid Rio Maggi Point QR Code"
      );

      resetCustomerPreview();

      return;

    }


    // -------------------------------------------------
    // EXTRACT MEMBER ID
    // -------------------------------------------------

    const memberId =
      decodedText
        .replace(
          QR_PREFIX,
          ""
        )
        .trim();


    // -------------------------------------------------
    // VALIDATE MEMBER ID
    // -------------------------------------------------

    if (!memberId) {

      alert(
        "❌ Invalid Member ID"
      );

      resetCustomerPreview();

      return;

    }


    console.log(
      "Scanned Member ID:",
      memberId
    );


    // -------------------------------------------------
    // SEARCH CUSTOMER
    // -------------------------------------------------

    const customerQuery =
      query(

        collection(
          db,
          "customers"
        ),

        where(
          "memberId",
          "==",
          memberId
        )

      );


    const snapshot =
      await getDocs(
        customerQuery
      );


    // -------------------------------------------------
    // CUSTOMER NOT FOUND
    // -------------------------------------------------

    if (
      snapshot.empty
    ) {

      alert(
        "❌ Customer Not Found"
      );

      resetCustomerPreview();

      return;

    }


    // -------------------------------------------------
    // GET FIRST MATCHING CUSTOMER
    // -------------------------------------------------

    let foundCustomer =
      null;


    snapshot.forEach(
      (documentSnapshot) => {

        if (
          foundCustomer
        ) {

          return;

        }


        foundCustomer = {

          ...documentSnapshot.data(),

          uid:
            documentSnapshot.id

        };

      }
    );


    // -------------------------------------------------
    // SAFETY CHECK
    // -------------------------------------------------

    if (!foundCustomer) {

      alert(
        "❌ Unable To Load Customer"
      );

      resetCustomerPreview();

      return;

    }


    // -------------------------------------------------
    // NORMALIZE STAMP COUNT
    // -------------------------------------------------

    foundCustomer.stamps =
      Number(
        foundCustomer.stamps ||
        0
      );


    // -------------------------------------------------
    // STORE CUSTOMER
    // -------------------------------------------------

    currentCustomer =
      foundCustomer;


    // -------------------------------------------------
    // ADD/UPDATE CUSTOMER IN LOCAL ARRAY
    // -------------------------------------------------

    const existingIndex =
      customers.findIndex(

        (customer) =>

          customer.uid ===
          foundCustomer.uid

      );


    if (
      existingIndex >= 0
    ) {

      customers[
        existingIndex
      ] =
        foundCustomer;

    }

    else {

      customers.push(
        foundCustomer
      );

    }


    // -------------------------------------------------
    // SHOW CUSTOMER PREVIEW
    // -------------------------------------------------

    showCustomer(
      foundCustomer
    );


    // -------------------------------------------------
    // UPDATE STATUS
    // -------------------------------------------------

    if (scannerStatus) {

      scannerStatus.textContent =
        "🟢 Customer Found";

    }


    console.log(
      "✅ Customer QR Scan Successful:",
      foundCustomer.memberId
    );

  }

  catch (error) {

    console.error(
      "❌ QR Scan Processing Error:",
      error
    );


    alert(
      "❌ Unable To Process QR Code"
    );

  }

  finally {

    // -------------------------------------------------
    // ALLOW NEXT SCAN
    // -------------------------------------------------

    processingQr =
      false;

  }

}


// =====================================================
// SCANNER MENU NAVIGATION
// =====================================================

scannerMenu?.addEventListener(
  "click",
  () => {

    const scannerSection =
      document.getElementById(
        "scannerSection"
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
);


// =====================================================
// STAMP MENU NAVIGATION
// =====================================================

stampMenu?.addEventListener(
  "click",
  () => {

    const scannerSection =
      document.getElementById(
        "scannerSection"
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
);


// =====================================================
// DASHBOARD MENU NAVIGATION
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
// PART 4 READY
// =====================================================

console.log(
  "✅ QR Scanner Ready"
);

console.log(
  "✅ QR Validation Ready"
);

console.log(
  "✅ Customer QR Lookup Ready"
);

console.log(
  "✅ Customer Selection Ready"
);

console.log(
  "➡️ Waiting for Part 5..."
);


// =====================================================
// END OF PART 4
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V4
// PART 5
// FINAL NAVIGATION + LOGOUT + SECURITY + READY
// =====================================================


// =====================================================
// EXPORT BUTTON
// =====================================================

exportBtn?.addEventListener(
  "click",
  () => {

    location.href =
      "admin-export.html";

  }
);


// =====================================================
// REWARD MANAGER
// =====================================================

rewardBtn?.addEventListener(
  "click",
  () => {

    location.href =
      "admin-rewards.html";

  }
);


// =====================================================
// REPORT NAVIGATION
// =====================================================

reportMenu?.addEventListener(
  "click",
  () => {

    location.href =
      "admin-reports.html";

  }
);


// =====================================================
// SETTINGS BUTTON
// =====================================================

settingsBtn?.addEventListener(
  "click",
  () => {

    location.href =
      "admin-settings.html";

  }
);


// =====================================================
// SETTINGS MENU NAVIGATION
// =====================================================

settingMenu?.addEventListener(
  "click",
  () => {

    location.href =
      "admin-settings.html";

  }
);


// =====================================================
// CUSTOMER MENU NAVIGATION
// =====================================================

customersMenu?.addEventListener(
  "click",
  () => {

    location.href =
      "admin-customers.html";

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
// SCANNER MENU
// =====================================================

scannerMenu?.addEventListener(
  "click",
  () => {

    const scannerSection =
      document.getElementById(
        "scannerSection"
      );


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
);


// =====================================================
// STAMP MENU
// =====================================================

stampMenu?.addEventListener(
  "click",
  () => {

    const scannerSection =
      document.getElementById(
        "scannerSection"
      );


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
);


// =====================================================
// LOGOUT
// =====================================================

logoutBtn?.addEventListener(
  "click",
  async () => {

    // -------------------------------------------------
    // PREVENT MULTIPLE LOGOUT CLICKS
    // -------------------------------------------------

    if (
      logoutBtn.dataset.processing ===
      "true"
    ) {

      return;

    }


    logoutBtn.dataset.processing =
      "true";


    logoutBtn.disabled =
      true;


    try {

      // -------------------------------------------------
      // STOP CAMERA BEFORE LOGOUT
      // -------------------------------------------------

      if (scannerRunning) {

        await stopScanner();

      }


      // -------------------------------------------------
      // FIREBASE SIGN OUT
      // -------------------------------------------------

      await signOut(
        auth
      );


      // -------------------------------------------------
      // REDIRECT TO LOGIN
      // -------------------------------------------------

      location.href =
        "admin-login.html";

    }

    catch (error) {

      console.error(
        "Logout Error:",
        error
      );


      alert(
        "❌ Logout Failed. Please try again."
      );


      logoutBtn.dataset.processing =
        "false";


      logoutBtn.disabled =
        false;

    }

  }
);


// =====================================================
// PAGE VISIBILITY
// =====================================================

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      scannerRunning
    ) {

      console.log(
        "Dashboard hidden while scanner is running."
      );

    }

  }
);


// =====================================================
// FINAL READY STATUS
// =====================================================

console.log(
  "========================================"
);


console.log(
  "🍜 RIO MAGGI POINT"
);


console.log(
  "Premium Admin Dashboard V4"
);


console.log(
  "========================================"
);


console.log(
  "✅ Firebase Authentication Ready"
);


console.log(
  "✅ Firebase Firestore Ready"
);


console.log(
  "✅ Customer Dashboard Ready"
);


console.log(
  "✅ Customer Search Ready"
);


console.log(
  "✅ Customer Selection Ready"
);


console.log(
  "✅ QR Scanner Ready"
);


console.log(
  "✅ Daily Stamp Protection Ready"
);


console.log(
  "✅ 6 Stamp Reward Unlock Ready"
);


console.log(
  "✅ Navigation Ready"
);


console.log(
  "✅ Logout Ready"
);


console.log(
  "========================================"
);


console.log(
  "🚀 Admin Dashboard V4 Fully Loaded"
);


console.log(
  "========================================"
);


// =====================================================
// END OF ADMIN-DASHBOARD.JS
// =====================================================
