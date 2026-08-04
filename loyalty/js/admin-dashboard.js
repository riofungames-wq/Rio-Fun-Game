// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS
// CONSOLIDATED FINAL VERSION
// PART 1 - PART 5
// CLEAN / NO DUPLICATE DECLARATIONS
// =====================================================


// =====================================================
// 1. FIREBASE IMPORTS
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
// 2. CONFIGURATION
// =====================================================

const ADMIN_LOGIN_PAGE =
  "./admin-login.html";

const CUSTOMERS_COLLECTION =
  "customers";

const MAX_STAMPS =
  6;

const LOYALTY_CYCLE_DAYS =
  40;

const LOYALTY_CYCLE_MS =
  LOYALTY_CYCLE_DAYS *
  24 *
  60 *
  60 *
  1000;

const QR_SCANNER_CONFIG = {

  fps:
    10,

  qrbox: {
    width:
      250,

    height:
      250
  },

  aspectRatio:
    1.0

};


// =====================================================
// 3. GLOBAL APPLICATION STATE
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

let customerDataInitialized =
  false;


// =====================================================
// 4. DOM ELEMENT REFERENCES
// =====================================================

// -----------------------------------------------------
// NAVIGATION
// -----------------------------------------------------

const navButtons =
  document.querySelectorAll(
    "[data-section]"
  );


// -----------------------------------------------------
// SECTIONS
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
// CUSTOMER TABLE
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
// AUTH
// -----------------------------------------------------

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );


// -----------------------------------------------------
// DASHBOARD STATS
// -----------------------------------------------------

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

const lastRefreshElement =
  document.getElementById(
    "lastRefresh"
  );


// =====================================================
// 5. SECTION MAP
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
// 6. GENERAL HELPERS
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


function getTodayKey() {

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    )
      .padStart(
        2,
        "0"
      );

  const day =
    String(
      today.getDate()
    )
      .padStart(
        2,
        "0"
      );

  return (
    `${year}-${month}-${day}`
  );

}


function normalizeDateValue(
  value
) {

  if (!value) {
    return null;
  }

  try {

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
      typeof value ===
      "number"
    ) {

      const date =
        new Date(
          value
        );

      return (
        !Number.isNaN(
          date.getTime()
        )
      )
        ? date
        : null;

    }


    if (
      typeof value ===
      "string"
    ) {

      const date =
        new Date(
          value
        );

      return (
        !Number.isNaN(
          date.getTime()
        )
      )
        ? date
        : null;

    }

  }

  catch (
    error
  ) {

    console.warn(
      "⚠️ Date conversion failed:",
      error
    );

  }

  return null;

}


// =====================================================
// 7. CUSTOMER HELPERS
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

    customer.totalStamps,

    customer.loyaltyStamps

  ];


  for (
    const value of
    possibleValues
  ) {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      continue;

    }


    const numericValue =
      Number(
        value
      );


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


function getCustomerMemberId(
  customer
) {

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


function getCustomerMobile(
  customer
) {

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

    customer.image ||

    ""

  );

}


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
// 8. REWARD STATUS
// =====================================================

function isCustomerRewardReady(
  customer
) {

  if (!customer) {
    return false;
  }

  return (

    customer.rewardUnlocked ===
    true

    ||

    customer.rewardReady ===
    true

    ||

    getCustomerStamps(
      customer
    ) >= MAX_STAMPS

  );

}


// =====================================================
// 9. CUSTOMER NORMALIZATION
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
      )

  };

}


// =====================================================
// 10. LOYALTY CYCLE HELPERS
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
    const value of
    possibleDates
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


function getLoyaltyCycleStatus(
  customer
) {

  if (!customer) {

    return {

      active:
        false,

      expired:
        false,

      cycleStartDate:
        null,

      cycleStartTime:
        null,

      cycleExpiryTime:
        null,

      remainingMs:
        0

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

      active:
        false,

      expired:
        false,

      cycleStartDate:
        null,

      cycleStartTime:
        null,

      cycleExpiryTime:
        null,

      remainingMs:
        0

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

    active:
      true,

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
// 11. SCANNER STATUS
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
// 12. LOCAL CUSTOMER DATA
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
        customer.uid ===
        uid

    ) ||

    null

  );

}


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

      customer =>

        getCustomerMemberId(
          customer
        )
          .toLowerCase() ===
        searchId

    ) ||

    null

  );

}


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
    existingIndex ===
    -1
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
        normalizedCustomer &&
        normalizedCustomer.uid
      ) {

        uniqueCustomers.set(

          normalizedCustomer.uid,

          normalizedCustomer

        );

      }

    }

  );


  customers =
    Array.from(
      uniqueCustomers.values()
    );

}


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
// 13. NAVIGATION
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


  targetSection.hidden =
    false;

  targetSection.classList.add(
    "active"
  );


  navButtons.forEach(

    button => {

      button.classList.toggle(

        "active",

        button.dataset.section ===
        sectionName

      );

    }

  );


  currentSection =
    sectionName;


  try {

    history.replaceState(

      null,

      "",

      `#${sectionName}`

    );

  }

  catch (
    error
  ) {

    console.warn(
      "⚠️ Unable to update URL hash:",
      error
    );

  }

}


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
    sectionMap[
      hash
    ]
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
// 14. CUSTOMER PREVIEW
// =====================================================

function updateGiveStampButtonState() {

  if (!giveStampBtn) {
    return;
  }


  if (!currentCustomer) {

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

    stamps >=
    MAX_STAMPS

    ||

    rewardReady

    ||

    alreadyStampedToday

  );

}


function showCustomer(
  customer
) {

  if (!customer) {

    clearCustomerPreview();

    return;

  }


  const normalizedCustomer =
    normalizeCustomer(
      customer,
      customer.uid
    );


  if (!normalizedCustomer) {

    clearCustomerPreview();

    return;

  }


  currentCustomer =
    normalizedCustomer;


  if (customerPreview) {

    customerPreview.hidden =
      false;

    customerPreview.classList.add(
      "active"
    );

  }


  if (customerName) {

    customerName.textContent =

      getCustomerName(
        normalizedCustomer
      ) ||

      "Unknown Customer";

  }


  if (customerMemberId) {

    customerMemberId.textContent =

      getCustomerMemberId(
        normalizedCustomer
      ) ||

      "—";

  }


  if (customerMobile) {

    customerMobile.textContent =

      getCustomerMobile(
        normalizedCustomer
      ) ||

      "—";

  }


  if (customerStamps) {

    customerStamps.textContent =

      `${getCustomerStamps(
        normalizedCustomer
      )}/${MAX_STAMPS}`;

  }


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

        this.onerror =
          null;

        this.src =
          "./assets/default-profile.png";

      };

  }


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


  updateGiveStampButtonState();

}


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

}


// =====================================================
// 15. DASHBOARD STATISTICS
// =====================================================

function updateDashboardStats() {

  const totalCustomers =
    customers.length;


  const totalStamps =

    customers.reduce(

      (
        total,

        customer

      ) =>

        total +

        getCustomerStamps(
          customer
        ),

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


function updateLastRefresh() {

  if (!lastRefreshElement) {
    return;
  }


  lastRefreshElement.textContent =

    new Date().toLocaleString(

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
// 16. CUSTOMER TABLE
// =====================================================

function renderCustomerTable(
  customerList = customers
) {

  if (!customerTableBody) {
    return;
  }


  customerTableBody.innerHTML =
    "";


  if (

    !Array.isArray(
      customerList
    )

    ||

    customerList.length ===
    0

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


  showCustomer(
    customer
  );


  showSection(
    "scanner"
  );

}


// =====================================================
// 17. FIREBASE CUSTOMER DATA
// =====================================================

async function loadCustomerByUid(
  uid
) {

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


    if (customer) {

      upsertLocalCustomer(
        customer
      );

    }


    return customer;

  }

  catch (
    error
  ) {

    console.error(
      "❌ Failed to load customer:",
      error
    );

    return null;

  }

}


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

        if (foundCustomer) {
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


        if (

          getCustomerMemberId(
            customer
          )
            .trim()
            .toLowerCase()

          ===

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


    if (foundCustomer) {

      upsertLocalCustomer(
        foundCustomer
      );

    }


    return foundCustomer;

  }

  catch (
    error
  ) {

    console.error(

      "❌ Firebase Member ID Search Error:",

      error

    );

    return null;

  }

}


async function loadCustomersFromFirebase() {

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


    const loadedCustomers =
      [];


    snapshot.forEach(

      customerDoc => {

        const normalizedCustomer =

          normalizeCustomer(

            customerDoc.data(),

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


    return customers;

  }

  catch (
    error
  ) {

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


async function refreshCustomers() {

  if (refreshCustomersBtn) {

    refreshCustomersBtn.disabled =
      true;

  }


  try {

    await loadCustomersFromFirebase();

  }

  finally {

    if (refreshCustomersBtn) {

      refreshCustomersBtn.disabled =
        false;

    }

  }

}


// =====================================================
// 18. QR LOOKUP
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


  if (!value) {
    return null;
  }


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


      if (possibleUid) {

        const customer =
          await loadCustomerByUid(
            possibleUid
          );


        if (customer) {
          return customer;
        }

      }


      if (possibleMemberId) {

        const customer =

          findCustomerByMemberId(

            String(
              possibleMemberId
            ).trim()

          );


        if (customer) {
          return customer;
        }

      }

    }

  }

  catch (
    error
  ) {

    // QR value is a plain string.

  }


  const localByUid =
    findCustomerByUid(
      value
    );


  if (localByUid) {
    return localByUid;
  }


  const localByMemberId =
    findCustomerByMemberId(
      value
    );


  if (localByMemberId) {
    return localByMemberId;
  }


  const firebaseCustomer =
    await loadCustomerByUid(
      value
    );


  if (firebaseCustomer) {
    return firebaseCustomer;
  }


  return await findCustomerInFirebaseByMemberId(
    value
  );

}


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


    await stopScanner();


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


    showSection(
      "scanner"
    );

  }

  catch (
    error
  ) {

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
// 19. QR SCANNER
// =====================================================

async function startScanner() {

  if (scannerRunning) {
    return;
  }


  if (!qrReader) {

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


    if (!html5QrCode) {

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

      () => {}

    );


    scannerRunning =
      true;


    if (startScannerBtn) {

      startScannerBtn.disabled =
        true;

    }


    if (stopScannerBtn) {

      stopScannerBtn.disabled =
        false;

    }


    setScannerStatus(

      "🟢 Scanner Active — QR Code Scan करें",

      "scanning"

    );

  }

  catch (
    error
  ) {

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


async function stopScanner() {

  if (!html5QrCode) {

    scannerRunning =
      false;

    return;

  }


  try {

    if (scannerRunning) {

      await html5QrCode.stop();

    }


    try {

      await html5QrCode.clear();

    }

    catch (
      clearError
    ) {

      console.warn(

        "⚠️ QR Scanner clear warning:",

        clearError

      );

    }


    scannerRunning =
      false;


    html5QrCode =
      null;


    if (startScannerBtn) {

      startScannerBtn.disabled =
        false;

    }


    if (stopScannerBtn) {

      stopScannerBtn.disabled =
        true;

    }


    setScannerStatus(

      "🟢 Scanner Stopped",

      "ready"

    );

  }

  catch (
    error
  ) {

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
// 20. STAMP ACTION
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


  if (!normalizedCustomer) {
    return;
  }


  upsertLocalCustomer(
    normalizedCustomer
  );


  currentCustomer =
    normalizedCustomer;


  showCustomer(
    normalizedCustomer
  );


  updateDashboardStats();


  renderCustomerTable(

    filterCustomers(

      searchCustomer
        ? searchCustomer.value
        : ""

    )

  );

}


async function giveStampToCustomer() {

  if (stampActionProcessing) {
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


    location.replace(
      ADMIN_LOGIN_PAGE
    );


    return;

  }


  stampActionProcessing =
    true;


  updateGiveStampButtonState();


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

    const customerUid =
      currentCustomer.uid;


    const freshCustomer =

      await loadCustomerByUid(
        customerUid
      );


    if (!freshCustomer) {

      throw new Error(

        "Customer document not found."

      );

    }


    const todayKey =
      getTodayKey();


    let currentStamps =

      getCustomerStamps(
        freshCustomer
      );


    const cycleStatus =

      getLoyaltyCycleStatus(
        freshCustomer
      );


    const cycleExpired =
      cycleStatus.expired;


    // -------------------------------------------------
    // EXPIRED INCOMPLETE CYCLE
    // -------------------------------------------------

    if (

      cycleExpired &&

      currentStamps > 0 &&

      currentStamps < MAX_STAMPS

    ) {

      currentStamps =
        0;

    }


    // -------------------------------------------------
    // DAILY DUPLICATE PROTECTION
    // -------------------------------------------------

    const alreadyStampedToday =

      !cycleExpired &&

      (

        freshCustomer.dailyStampDate ===
        todayKey

        ||

        freshCustomer.lastStampDate ===
        todayKey

      );


    if (alreadyStampedToday) {

      syncCustomerAfterStamp({

        ...freshCustomer,

        stamps:
          currentStamps

      });


      alert(

        "⚠️ This customer has already received today's stamp."

      );


      return;

    }


    // -------------------------------------------------
    // REWARD ALREADY READY
    // -------------------------------------------------

    if (

      currentStamps >=
      MAX_STAMPS

    ) {

      syncCustomerAfterStamp({

        ...freshCustomer,

        stamps:
          MAX_STAMPS,

        rewardUnlocked:
          true

      });


      alert(

        "🎁 This customer already has a reward ready. Please claim the reward first."

      );


      return;

    }


    // -------------------------------------------------
    // NEW CYCLE
    // -------------------------------------------------

    const isStartingNewCycle =

      currentStamps ===
      0;


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

        CUSTOMERS_COLLECTION,

        customerUid

      );


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


    if (

      isStartingNewCycle ||

      cycleExpired

    ) {

      updateData.cycleStartedAt =
        serverTimestamp();

    }


    await updateDoc(

      customerRef,

      updateData

    );


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


    if (

      isStartingNewCycle ||

      cycleExpired

    ) {

      updatedCustomer.cycleStartedAt =
        new Date();

    }


    syncCustomerAfterStamp(
      updatedCustomer
    );


    updateLastRefresh();


    setScannerStatus(

      rewardUnlocked

        ? "🎁 Reward Ready"

        : "🟢 Stamp Added Successfully",

      rewardUnlocked

        ? "success"

        : "ready"

    );


    if (rewardUnlocked) {

      alert(

        "🎉 Stamp Added Successfully!\n\n" +

        "🎁 6 valid stamps completed.\n\n" +

        "Customer Reward is now READY."

      );

    }

    else if (cycleExpired) {

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

  }

  catch (
    error
  ) {

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


    if (giveStampBtn) {

      giveStampBtn.innerHTML =

        originalButtonContent;

    }


    updateGiveStampButtonState();

  }

}


// =====================================================
// 21. EXPORT CUSTOMERS
// =====================================================

function exportCustomers() {

  if (

    !Array.isArray(
      customers
    )

    ||

    customers.length ===
    0

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


  const csvContent =

    [

      headers,

      ...rows

    ]

      .map(

        row =>

          row

            .map(

              value =>

                `"${String(
                  value ?? ""
                ).replace(
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

}


// =====================================================
// 22. LOGOUT
// =====================================================

async function handleAdminLogout() {

  if (logoutProcessing) {
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

      scannerRunning ||

      html5QrCode

    ) {

      await stopScanner();

    }


    await signOut(
      auth
    );

  }

  catch (
    error
  ) {

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
// 23. RESET CUSTOMER
// =====================================================

function resetCurrentCustomer() {

  if (stampActionProcessing) {
    return;
  }


  if (!currentCustomer) {

    clearCustomerPreview();

    return;

  }


  if (

    window.confirm(

      "Are you sure you want to clear the selected customer?"

    )

  ) {

    clearCustomerPreview();


    setScannerStatus(

      "🟢 Ready to scan customer QR",

      "ready"

    );

  }

}


// =====================================================
// 24. EVENT LISTENERS
// =====================================================

function setupEventListeners() {

  // ---------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------

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


          if (sectionName) {

            showSection(
              sectionName
            );

          }

        }

      );


      button.dataset.navigationAttached =
        "true";

    }

  );


  // ---------------------------------------------------
  // CUSTOMER TABLE
  // ---------------------------------------------------

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


        if (!actionButton) {
          return;
        }


        if (

          actionButton.dataset.customerAction ===
          "select"

        ) {

          selectCustomerByUid(

            actionButton.dataset.customerUid

          );

        }

      }

    );


    customerTableBody.dataset.customerTableListenerAttached =
      "true";

  }


  // ---------------------------------------------------
  // SEARCH
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // REFRESH
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // RESET
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // START SCANNER
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // STOP SCANNER
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // EXPORT
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // GIVE STAMP
  // ---------------------------------------------------

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


  // ---------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------

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

}


// =====================================================
// 25. INITIALIZATION
// =====================================================

function initializeDashboard() {

  setupEventListeners();

  initializeNavigation();

  console.log(
    "✅ Admin Dashboard Initialized"
  );

}


onAuthStateChanged(

  auth,

  async user => {

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


    if (
      !customerDataInitialized
    ) {

      customerDataInitialized =
        true;


      try {

        await loadCustomersFromFirebase();

      }

      catch (
        error
      ) {

        console.error(

          "❌ Initial Customer Data Load Failed:",

          error

        );

      }

    }

  }

);


// =====================================================
// FINAL READY LOG
// =====================================================

console.log(

  "========================================"

);

console.log(

  "✅ RIO MAGGI POINT ADMIN DASHBOARD READY"

);

console.log(

  "✅ Single Consolidated File"

);

console.log(

  "✅ No Duplicate Function Declarations"

);

console.log(

  "✅ No Duplicate LOYALTY_CYCLE_DAYS"

);

console.log(

  "✅ 40-Day Loyalty Cycle Enabled"

);

console.log(

  "✅ 6-Stamp Reward Logic Enabled"

);

console.log(

  "✅ QR Scanner Ready"

);

console.log(

  "✅ Firebase Customer Data Ready"

);

console.log(

  "========================================"

);
