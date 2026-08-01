// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V4
// FIXED & SECURE STRUCTURE
// PART 1
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


// Number of scans made today
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
// HELPER FUNCTIONS
// =====================================================


// -----------------------------------------------------
// GET TODAY DATE KEY
// -----------------------------------------------------
// Example:
// 2026-08-02
// -----------------------------------------------------

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


// -----------------------------------------------------
// GET CUSTOMER AVATAR
// -----------------------------------------------------

function getCustomerAvatar(customer) {

  // If customer has an uploaded photo,
  // use it first.

  if (
    customer.photoURL &&
    typeof customer.photoURL === "string" &&
    customer.photoURL.trim() !== ""
  ) {

    return customer.photoURL;

  }


  if (
    customer.photoUrl &&
    typeof customer.photoUrl === "string" &&
    customer.photoUrl.trim() !== ""
  ) {

    return customer.photoUrl;

  }


  if (
    customer.photo &&
    typeof customer.photo === "string" &&
    customer.photo.trim() !== ""
  ) {

    return customer.photo;

  }


  // Otherwise use gender avatar.

  if (
    customer.gender &&
    customer.gender.toLowerCase() === "female"
  ) {

    return "assets/avatars/female.png";

  }


  return "assets/avatars/male.png";

}


// -----------------------------------------------------
// CHECK IF CUSTOMER ALREADY GOT TODAY'S STAMP
// -----------------------------------------------------

function hasStampToday(customer) {

  const todayKey =
    getTodayKey();


  // New recommended field
  // dailyStampDate

  if (
    customer.dailyStampDate &&
    customer.dailyStampDate === todayKey
  ) {

    return true;

  }


  // Backup field
  // lastStampDate

  if (
    customer.lastStampDate &&
    customer.lastStampDate === todayKey
  ) {

    return true;

  }


  return false;

}


// -----------------------------------------------------
// GET STAMP STATUS TEXT
// -----------------------------------------------------

function getStampStatus(customer) {

  if (!customer) {

    return "Waiting";

  }


  if (hasStampToday(customer)) {

    return "Already Stamped Today";

  }


  if (
    Number(customer.stamps || 0) >= MAX_STAMPS
  ) {

    return "Reward Ready";

  }


  return "Ready To Give Stamp";

}


// -----------------------------------------------------
// RESET CUSTOMER PREVIEW
// -----------------------------------------------------

function resetCustomerPreview() {

  currentCustomer = null;


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

    giveStampBtn.disabled = true;

  }

}


// -----------------------------------------------------
// SHOW CUSTOMER PREVIEW
// -----------------------------------------------------

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
      `${Number(customer.stamps || 0)}/${MAX_STAMPS}`;

  }


  const status =
    getStampStatus(customer);


  if (todayStatus) {

    todayStatus.textContent =
      status;


    if (hasStampToday(customer)) {

      todayStatus.className =
        "pending";

    }

    else if (
      Number(customer.stamps || 0) >= MAX_STAMPS
    ) {

      todayStatus.className =
        "success";

    }

    else {

      todayStatus.className =
        "success";

    }

  }


  // Disable Give Stamp button
  // if customer already received
  // today's stamp.

  if (giveStampBtn) {

    giveStampBtn.disabled =
      hasStampToday(customer);

  }

}


// =====================================================
// AUTHENTICATION
// =====================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      location.href =
        "admin-login.html";

      return;

    }


    try {

      await loadDashboard();

    }

    catch (error) {

      console.error(
        "Admin Dashboard Initialization Error:",
        error
      );

    }

  }
);


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

  try {

    // Clear old data

    customerTable.innerHTML = "";

    customers = [];

    todayScanCount = 0;


    let stampCount = 0;

    let rewardCount = 0;


    // Prevent duplicate customer IDs

    const uniqueCustomers =
      new Set();


    // Get today's date

    const todayKey =
      getTodayKey();


    // Get all customers

    const snapshot =
      await getDocs(
        collection(
          db,
          "customers"
        )
      );


    snapshot.forEach(
      (documentSnapshot) => {

        // Prevent duplicate records

        if (
          uniqueCustomers.has(
            documentSnapshot.id
          )
        ) {

          return;

        }


        uniqueCustomers.add(
          documentSnapshot.id
        );


        const customer =
          documentSnapshot.data();


        // Store Firebase document ID

        customer.uid =
          documentSnapshot.id;


        // Ensure stamps is a number

        customer.stamps =
          Number(
            customer.stamps || 0
          );


        // Add customer to array

        customers.push(
          customer
        );


        // Total stamps

        stampCount +=
          customer.stamps;


        // Reward count

        if (
          customer.rewardUnlocked === true
        ) {

          rewardCount++;

        }


        // Count today's stamps

        if (
          customer.dailyStampDate === todayKey ||
          customer.lastStampDate === todayKey
        ) {

          todayScanCount++;

        }


        // Create customer table row

        createCustomerRow(
          customer
        );

      }
    );


    // Update dashboard stats

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


    // Update last refresh time

    if (lastRefresh) {

      lastRefresh.textContent =
        new Date().toLocaleString();

    }


    console.log(
      "Dashboard Loaded Successfully"
    );


  }

  catch (error) {

    console.error(
      "Dashboard Load Error:",
      error
    );


    if (scannerStatus) {

      scannerStatus.textContent =
        "🔴 Dashboard Error";

    }

  }

}


// =====================================================
// END OF PART 1
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V4
// PART 2
// CUSTOMER TABLE + SEARCH + CUSTOMER SELECTION
// =====================================================


// =====================================================
// CREATE CUSTOMER TABLE ROW
// =====================================================

function createCustomerRow(customer) {

  if (!customerTable) {

    return;

  }


  const tr =
    document.createElement("tr");


  // ---------------------------------------------------
  // CUSTOMER AVATAR
  // ---------------------------------------------------

  const avatar =
    getCustomerAvatar(customer);


  // ---------------------------------------------------
  // CUSTOMER DATA
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // TODAY'S STAMP STATUS
  // ---------------------------------------------------

  const stampedToday =
    hasStampToday(customer);


  // ---------------------------------------------------
  // REWARD STATUS
  // ---------------------------------------------------

  let rewardText =
    "❌ Locked";


  if (rewardUnlocked) {

    rewardText =
      "✅ Ready";

  }


  // ---------------------------------------------------
  // DAILY STATUS
  // ---------------------------------------------------

  let stampStatusText =
    "Give Stamp";


  if (stampedToday) {

    stampStatusText =
      "Already Stamped";

  }


  // ---------------------------------------------------
  // CREATE ROW
  // ---------------------------------------------------

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
        data-customer-id="${escapeHtml(customer.uid)}"
      >

        View

      </button>

    </td>

  `;


  // ---------------------------------------------------
  // VIEW BUTTON
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // ADD ROW TO TABLE
  // ---------------------------------------------------

  customerTable.appendChild(
    tr
  );

}


// =====================================================
// HTML ESCAPE PROTECTION
// =====================================================
// Prevent customer data from injecting HTML/JS
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
// SEARCH CUSTOMER
// =====================================================

searchCustomer?.addEventListener(
  "input",
  (event) => {

    const keyword =
      event.target.value
        .trim()
        .toLowerCase();


    // Clear current table

    customerTable.innerHTML = "";


    // If search box is empty,
    // show all customers.

    if (!keyword) {

      customers.forEach(
        createCustomerRow
      );

      return;

    }


    // -------------------------------------------------
    // FILTER CUSTOMERS
    // -------------------------------------------------

    const filteredCustomers =
      customers.filter(
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
              customer.mobile ||
              customer.phone ||
              customer.phoneNumber ||
              ""
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


    // -------------------------------------------------
    // DISPLAY RESULTS
    // -------------------------------------------------

    filteredCustomers.forEach(
      createCustomerRow
    );


    // -------------------------------------------------
    // NO RESULT MESSAGE
    // -------------------------------------------------

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
// SELECT CUSTOMER
// =====================================================

function selectCustomer(uid) {

  if (!uid) {

    return;

  }


  // Find customer in local array

  const customer =
    customers.find(
      (item) =>
        item.uid === uid
    );


  // Customer not found

  if (!customer) {

    alert(
      "Customer Not Found"
    );

    return;

  }


  // Show selected customer

  showCustomer(
    customer
  );


  // Scroll to scanner/customer preview

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
// GLOBAL SELECT CUSTOMER
// =====================================================
// Allows compatibility with old HTML code
// =====================================================

window.selectCustomer =
  selectCustomer;


// =====================================================
// CUSTOMER PREVIEW BUTTON RESET
// =====================================================

cancelScanBtn?.addEventListener(
  "click",
  () => {

    resetCustomerPreview();

  }
);


// =====================================================
// REFRESH BUTTON
// =====================================================

refreshBtn?.addEventListener(
  "click",
  async () => {

    if (refreshBtn) {

      refreshBtn.disabled =
        true;

    }


    try {

      await loadDashboard();

    }

    catch (error) {

      console.error(
        "Refresh Error:",
        error
      );

    }

    finally {

      if (refreshBtn) {

        refreshBtn.disabled =
          false;

      }

    }

  }
);


// =====================================================
// AUTO REFRESH STATUS
// =====================================================

console.log(
  "Customer Table Module Ready"
);


console.log(
  "Customer Search Module Ready"
);


console.log(
  "Customer Selection Module Ready"
);


// =====================================================
// END OF PART 2
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V4
// PART 3
// LIVE QR SCANNER + QR VALIDATION
// =====================================================


// =====================================================
// CAMERA QR SCANNER
// =====================================================


// -----------------------------------------------------
// START SCANNER
// -----------------------------------------------------

async function startScanner() {

  // Prevent multiple scanner instances

  if (scannerRunning) {

    return;

  }


  // Check HTML5 QR Scanner library

  if (
    typeof Html5Qrcode ===
    "undefined"
  ) {

    alert(
      "QR Scanner Library Not Loaded"
    );

    console.error(
      "Html5Qrcode library is not available."
    );

    return;

  }


  // Prevent duplicate QR processing

  processingQr = false;


  // Update status

  if (scannerStatus) {

    scannerStatus.textContent =
      "🟡 Opening Camera...";

  }


  // Hide camera overlay

  if (cameraOverlay) {

    cameraOverlay.style.display =
      "none";

  }


  try {

    // -------------------------------------------------
    // CREATE SCANNER INSTANCE
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
        fps: 10,

        qrbox: {
          width: 250,
          height: 250
        }

      },

      onScanSuccess,

      onScanError

    );


    // Scanner successfully started

    scannerRunning =
      true;


    // Update status

    if (scannerStatus) {

      scannerStatus.textContent =
        "🟢 Scanner Running";

    }


    // Update buttons

    if (startScannerBtn) {

      startScannerBtn.disabled =
        true;

    }


    if (stopScannerBtn) {

      stopScannerBtn.disabled =
        false;

    }


    console.log(
      "QR Scanner Started"
    );

  }

  catch (error) {

    console.error(
      "Scanner Start Error:",
      error
    );


    scannerRunning =
      false;


    html5QrCode =
      null;


    // Show overlay again

    if (cameraOverlay) {

      cameraOverlay.style.display =
        "flex";

    }


    // Update status

    if (scannerStatus) {

      scannerStatus.textContent =
        "🔴 Camera Error";

    }


    // Reset buttons

    if (startScannerBtn) {

      startScannerBtn.disabled =
        false;

    }


    if (stopScannerBtn) {

      stopScannerBtn.disabled =
        true;

    }


    alert(
      "Unable to start camera. Please allow camera permission and try again."
    );

  }

}


// =====================================================
// SCANNER ERROR HANDLER
// =====================================================

function onScanError(errorMessage) {

  // QR scanner continuously reports
  // "QR code not found" while searching.
  //
  // We intentionally do not show alerts here.
  //
  // This prevents hundreds of alerts
  // while the camera is running.

}


// =====================================================
// STOP SCANNER
// =====================================================

async function stopScanner() {

  // Nothing to stop

  if (
    !html5QrCode ||
    !scannerRunning
  ) {

    return;

  }


  try {

    await html5QrCode.stop();


    // Clear scanner camera area

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
      "Scanner Stop Error:",
      error
    );

  }


  // Reset scanner state

  scannerRunning =
    false;


  html5QrCode =
    null;


  processingQr =
    false;


  // Update status

  if (scannerStatus) {

    scannerStatus.textContent =
      "⚪ Camera Stopped";

  }


  // Show camera overlay

  if (cameraOverlay) {

    cameraOverlay.style.display =
      "flex";

  }


  // Reset buttons

  if (startScannerBtn) {

    startScannerBtn.disabled =
      false;

  }


  if (stopScannerBtn) {

    stopScannerBtn.disabled =
      true;

  }


  console.log(
    "QR Scanner Stopped"
  );

}


// =====================================================
// START / STOP BUTTON EVENTS
// =====================================================

startScannerBtn?.addEventListener(
  "click",
  startScanner
);


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

  // Prevent duplicate processing
  // while the same QR is detected
  // multiple times by the camera.

  if (processingQr) {

    return;

  }


  processingQr =
    true;


  try {

    // -------------------------------------------------
    // STOP CAMERA IMMEDIATELY
    // -------------------------------------------------

    await stopScanner();


    // -------------------------------------------------
    // VALIDATE QR PREFIX
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


    // Validate Member ID

    if (!memberId) {

      alert(
        "❌ Invalid Member ID"
      );

      return;

    }


    console.log(
      "Scanned Member ID:",
      memberId
    );


    // -------------------------------------------------
    // SEARCH CUSTOMER IN FIREBASE
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
    // GET CUSTOMER DOCUMENT
    // -------------------------------------------------

    let foundCustomer =
      null;


    snapshot.forEach(
      (documentSnapshot) => {

        // Only select first valid result

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


    // Safety check

    if (!foundCustomer) {

      alert(
        "❌ Unable To Load Customer"
      );

      return;

    }


    // -------------------------------------------------
    // NORMALIZE CUSTOMER DATA
    // -------------------------------------------------

    foundCustomer.stamps =
      Number(
        foundCustomer.stamps ||
        0
      );


    // -------------------------------------------------
    // STORE CURRENT CUSTOMER
    // -------------------------------------------------

    currentCustomer =
      foundCustomer;


    // -------------------------------------------------
    // SHOW CUSTOMER
    // -------------------------------------------------

    showCustomer(
      foundCustomer
    );


    // -------------------------------------------------
    // INCREMENT TODAY'S SCAN COUNT
    // -------------------------------------------------

    todayScanCount++;


    if (todayScans) {

      todayScans.textContent =
        todayScanCount;

    }


    // -------------------------------------------------
    // SUCCESS MESSAGE
    // -------------------------------------------------

    console.log(
      "Customer QR Scan Successful:",
      foundCustomer.memberId
    );


  }

  catch (error) {

    console.error(
      "QR Scan Processing Error:",
      error
    );


    alert(
      "❌ Unable To Process QR Code"
    );

  }

  finally {

    // Allow next QR scan

    processingQr =
      false;

  }

}


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
// STAMP MENU
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
// END OF PART 3
// =====================================================
// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD V4
// PART 4
// GIVE STAMP + DAILY PROTECTION + REWARD UNLOCK
// =====================================================


// =====================================================
// GIVE STAMP BUTTON
// =====================================================

giveStampBtn?.addEventListener(
  "click",
  async () => {

    // -------------------------------------------------
    // CHECK CUSTOMER
    // -------------------------------------------------

    if (!currentCustomer) {

      alert(
        "❌ Please scan or select a customer first."
      );

      return;

    }


    // -------------------------------------------------
    // PREVENT DOUBLE CLICK
    // -------------------------------------------------

    if (
      giveStampBtn.dataset.processing ===
      "true"
    ) {

      return;

    }


    // Lock button

    giveStampBtn.dataset.processing =
      "true";


    giveStampBtn.disabled =
      true;


    try {

      // -------------------------------------------------
      // GET CUSTOMER DOCUMENT
      // -------------------------------------------------

      const customerRef =
        doc(
          db,
          "customers",
          currentCustomer.uid
        );


      // -------------------------------------------------
      // GET LATEST CUSTOMER DATA
      // -------------------------------------------------
      // This is important because another admin/device
      // may have changed the customer's stamps after
      // the dashboard was loaded.
      // -------------------------------------------------

      const customerSnapshot =
        await getDoc(
          customerRef
        );


      // Customer document no longer exists

      if (
        !customerSnapshot.exists()
      ) {

        alert(
          "❌ Customer account not found."
        );

        resetCustomerPreview();

        return;

      }


      // -------------------------------------------------
      // GET FRESH FIREBASE DATA
      // -------------------------------------------------

      const latestCustomer =
        customerSnapshot.data();


      latestCustomer.uid =
        currentCustomer.uid;


      latestCustomer.stamps =
        Number(
          latestCustomer.stamps ||
          0
        );


      // -------------------------------------------------
      // CHECK TODAY'S STAMP
      // -------------------------------------------------

      if (
        hasStampToday(
          latestCustomer
        )
      ) {

        alert(
          "⚠️ This customer has already received today's stamp."
        );


        // Update local customer data

        currentCustomer =
          latestCustomer;


        showCustomer(
          latestCustomer
        );


        return;

      }


      // -------------------------------------------------
      // CHECK MAXIMUM STAMPS
      // -------------------------------------------------

      let currentStamps =
        latestCustomer.stamps;


      if (
        currentStamps >=
        MAX_STAMPS
      ) {

        alert(
          "🎁 This customer already has a reward ready."
        );


        currentCustomer =
          latestCustomer;


        showCustomer(
          latestCustomer
        );


        return;

      }


      // -------------------------------------------------
      // ADD ONE STAMP
      // -------------------------------------------------

      const newStampCount =
        currentStamps + 1;


      // -------------------------------------------------
      // CHECK REWARD UNLOCK
      // -------------------------------------------------

      const rewardUnlocked =
        newStampCount >=
        MAX_STAMPS;


      // -------------------------------------------------
      // TODAY'S DATE
      // -------------------------------------------------

      const todayKey =
        getTodayKey();


      // -------------------------------------------------
      // UPDATE FIREBASE
      // -------------------------------------------------

      await updateDoc(

        customerRef,

        {

          // Current stamp count

          stamps:
            newStampCount,


          // Unlock reward on 6th stamp

          rewardUnlocked:
            rewardUnlocked,


          // Store today's stamp date

          dailyStampDate:
            todayKey,


          // Backup date field

          lastStampDate:
            todayKey,


          // Exact timestamp

          lastStampAt:
            serverTimestamp(),


          // Last updated timestamp

          updatedAt:
            serverTimestamp()

        }

      );


      // -------------------------------------------------
      // UPDATE LOCAL CUSTOMER
      // -------------------------------------------------

      currentCustomer =
        {

          ...latestCustomer,

          uid:
            currentCustomer.uid,

          stamps:
            newStampCount,

          rewardUnlocked:
            rewardUnlocked,

          dailyStampDate:
            todayKey,

          lastStampDate:
            todayKey

        };


      // -------------------------------------------------
      // SHOW UPDATED CUSTOMER
      // -------------------------------------------------

      showCustomer(
        currentCustomer
      );


      // -------------------------------------------------
      // UPDATE TODAY SCAN COUNT
      // -------------------------------------------------

      todayScanCount++;


      if (todayScans) {

        todayScans.textContent =
          todayScanCount;

      }


      // -------------------------------------------------
      // SUCCESS MESSAGE
      // -------------------------------------------------

      if (
        rewardUnlocked
      ) {

        alert(

          "🎉 Congratulations!\n\n" +

          "6 Stamps Completed!\n\n" +

          "🎁 Free Veg Maggi Reward Unlocked!"

        );

      }

      else {

        alert(

          "✅ Stamp Added Successfully!\n\n" +

          `Current Stamps: ${newStampCount}/${MAX_STAMPS}`

        );

      }


      // -------------------------------------------------
      // REFRESH DASHBOARD DATA
      // -------------------------------------------------

      await loadDashboard();


      // -------------------------------------------------
      // RESTORE CURRENT CUSTOMER
      // -------------------------------------------------

      const refreshedCustomer =
        customers.find(

          (customer) =>

            customer.uid ===
            currentCustomer.uid

        );


      if (
        refreshedCustomer
      ) {

        currentCustomer =
          refreshedCustomer;


        showCustomer(
          refreshedCustomer
        );

      }


    }

    catch (error) {

      console.error(
        "Give Stamp Error:",
        error
      );


      alert(

        "❌ Failed To Give Stamp.\n\n" +

        "Please check your internet connection and try again."

      );

    }

    finally {

      // -------------------------------------------------
      // UNLOCK BUTTON
      // -------------------------------------------------

      giveStampBtn.dataset.processing =
        "false";


      // Re-enable only if customer
      // is allowed to receive stamp

      if (
        currentCustomer &&
        !hasStampToday(
          currentCustomer
        ) &&
        Number(
          currentCustomer.stamps ||
          0
        ) <
        MAX_STAMPS
      ) {

        giveStampBtn.disabled =
          false;

      }

      else {

        giveStampBtn.disabled =
          true;

      }

    }

  }
);


// =====================================================
// REWARD UNLOCK CHECK
// =====================================================

function checkRewardStatus(
  customer
) {

  if (!customer) {

    return false;

  }


  const stamps =
    Number(
      customer.stamps ||
      0
    );


  return (

    stamps >=
    MAX_STAMPS

  );

}


// =====================================================
// CUSTOMER REWARD STATUS
// =====================================================

function getRewardStatusText(
  customer
) {

  if (!customer) {

    return "Locked";

  }


  if (
    customer.rewardUnlocked ===
    true
  ) {

    return "🎁 Reward Ready";

  }


  const stamps =
    Number(
      customer.stamps ||
      0
    );


  if (
    stamps >=
    MAX_STAMPS
  ) {

    return "🎁 Reward Ready";

  }


  return (

    `${stamps}/${MAX_STAMPS} Stamps`

  );

}


// =====================================================
// END OF PART 4
// =====================================================
