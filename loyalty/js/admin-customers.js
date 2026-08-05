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

// Maximum number of loyalty stamps required for one complete reward cycle.
const MAX_STAMPS = 6;

// Admin login page.
const ADMIN_LOGIN_PAGE = "admin-login.html";

// Admin dashboard page.
const ADMIN_DASHBOARD_PAGE = "admin-dashboard.html";

// Customer Firestore collection name.
const CUSTOMER_COLLECTION = "customers";

// Customer manager auto-refresh interval.
const CUSTOMER_AUTO_REFRESH_INTERVAL = 30000;


// =====================================================
// DEFAULT AVATARS
// =====================================================

const DEFAULT_MALE_AVATAR = "assets/avatars/male.png";
const DEFAULT_FEMALE_AVATAR = "assets/avatars/female.png";


// =====================================================
// DOM REFERENCES
// =====================================================

// CUSTOMER TABLE
const customerTable = document.getElementById("customerTable");

// CUSTOMER SEARCH INPUT
const searchCustomer = document.getElementById("searchCustomer");

// REFRESH BUTTON
const refreshBtn = document.getElementById("refreshBtn");

// STATISTICS
const totalCustomers = document.getElementById("totalCustomers");
const rewardReady = document.getElementById("rewardReady");
const todayJoined = document.getElementById("todayJoined");

// CUSTOMER MODAL
const customerModal = document.getElementById("customerModal");

// CLOSE MODAL BUTTON
const closeModalBtn = document.getElementById("closeModal");

// MODAL CUSTOMER DETAILS
const modalPhoto = document.getElementById("modalPhoto");
const modalName = document.getElementById("modalName");
const modalMember = document.getElementById("modalMember");
const modalMobile = document.getElementById("modalMobile");
const modalStamp = document.getElementById("modalStamp");
const modalReward = document.getElementById("modalReward");

// MODAL ACTION BUTTONS
const giveStampBtn = document.getElementById("giveStampBtn");
const removeStampBtn = document.getElementById("removeStampBtn");
const unlockRewardBtn = document.getElementById("unlockRewardBtn");
const deleteCustomerBtn = document.getElementById("deleteCustomerBtn");


// =====================================================
// GLOBAL APPLICATION STATE
// =====================================================

let customers = [];
let selectedCustomer = null;
let authenticatedUser = null;

let customersLoading = false;
let customerRefreshProcessing = false;
let refreshProcessing = false;

let customerActionProcessing = false;
let giveStampProcessing = false;
let removeStampProcessing = false;
let unlockRewardProcessing = false;
let deleteCustomerProcessing = false;

let customerAutoRefreshTimer = null;
let customerPageInitialized = false;


// =====================================================
// SAFE VALUE HELPERS
// =====================================================

function getCustomerMobile(customer) {
  if (!customer) return "-";
  const mobile = customer.mobile || customer.phone || customer.phoneNumber || "";
  const cleanMobile = String(mobile).trim();
  return cleanMobile || "-";
}

function getCustomerStamps(customer) {
  if (!customer) return 0;
  const stamps = Number(customer.stamps);
  if (!Number.isFinite(stamps)) return 0;
  return Math.min(Math.max(Math.floor(stamps), 0), MAX_STAMPS);
}

function getCustomerAvatar(customer) {
  if (!customer) return DEFAULT_MALE_AVATAR;

  const possiblePhotos = [
    customer.photoURL,
    customer.photoUrl,
    customer.photo,
    customer.avatar
  ];

  const validPhoto = possiblePhotos.find(
    (photo) => typeof photo === "string" && photo.trim() !== ""
  );

  if (validPhoto) return validPhoto;

  const gender = String(customer.gender || "").trim().toLowerCase();
  if (gender === "female" || gender === "woman" || gender === "girl") {
    return DEFAULT_FEMALE_AVATAR;
  }

  return DEFAULT_MALE_AVATAR;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =====================================================
// DATE & REWARD HELPERS
// =====================================================

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toSafeDate(value) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value.toDate === "function") {
    try {
      const date = value.toDate();
      return (date instanceof Date && !Number.isNaN(date.getTime())) ? date : null;
    } catch (error) {
      console.warn("⚠️ Unable to convert Firestore timestamp.", error);
      return null;
    }
  }

  if (value instanceof Date) {
    return !Number.isNaN(value.getTime()) ? value : null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate;
}

function isCustomerCreatedToday(customer) {
  if (!customer) return false;
  const createdDate = toSafeDate(customer.createdAt);
  if (!createdDate) return false;

  const today = new Date();
  return (
    createdDate.getFullYear() === today.getFullYear() &&
    createdDate.getMonth() === today.getMonth() &&
    createdDate.getDate() === today.getDate()
  );
}

function isRewardReady(customer) {
  if (!customer) return false;
  return customer.rewardUnlocked === true || getCustomerStamps(customer) >= MAX_STAMPS;
}

function hasStampToday(customer) {
  if (!customer) return false;
  const todayKey = getTodayKey();
  return customer.dailyStampDate === todayKey || customer.lastStampDate === todayKey;
}

function getCustomerName(customer) {
  if (!customer) return "Unknown Customer";
  const name = String(customer.name || "").trim();
  return name || "Unknown Customer";
}

function getCustomerMemberId(customer) {
  if (!customer) return "RIO-000000";
  const memberId = String(customer.memberId || "").trim();
  return memberId || "RIO-000000";
}


// =====================================================
// MODAL FOUNDATION & CONTROLS
// =====================================================

function resetCustomerModal() {
  selectedCustomer = null;

  if (modalPhoto) {
    modalPhoto.src = DEFAULT_MALE_AVATAR;
    modalPhoto.alt = "Customer Photo";
    modalPhoto.dataset.fallbackApplied = "false";
  }

  if (modalName) modalName.textContent = "Customer Name";
  if (modalMember) modalMember.textContent = "RIO-000000";
  if (modalMobile) modalMobile.textContent = "-";
  if (modalStamp) modalStamp.textContent = `0 / ${MAX_STAMPS}`;
  if (modalReward) modalReward.textContent = "Locked";

  if (giveStampBtn) giveStampBtn.disabled = true;
  if (removeStampBtn) removeStampBtn.disabled = true;
  if (unlockRewardBtn) unlockRewardBtn.disabled = true;
  if (deleteCustomerBtn) deleteCustomerBtn.disabled = true;
}

function setCustomerModalVisible(visible) {
  if (!customerModal) return;
  customerModal.style.display = visible ? "flex" : "none";
}

// Global modal close function (Single Declaration)
function closeCustomerModal() {
  setCustomerModalVisible(false);
  resetCustomerModal();
}

if (customerModal) {
  customerModal.style.display = "none";
}

resetCustomerModal();


// =====================================================
// PART 1 DEVELOPMENT LOG
// =====================================================

console.log("========================================");
console.log("🍜 RIO MAGGI POINT - Admin Customers JS Part 1 Loaded");
console.log("========================================");

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
// Continuation of PART 1.
// No duplicate imports, constants, or global state.
// =====================================================


// =====================================================
// LOAD CUSTOMERS FROM FIRESTORE
// =====================================================

async function loadCustomers() {
  if (customersLoading) return;

  customersLoading = true;

  if (customerTable) {
    customerTable.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table-message">
          Loading Customers...
        </td>
      </tr>
    `;
  }

  try {
    const customersRef = collection(db, CUSTOMER_COLLECTION);
    let snapshot;

    try {
      const orderedQuery = query(customersRef, orderBy("createdAt", "desc"));
      snapshot = await getDocs(orderedQuery);
    } catch (orderError) {
      console.warn("⚠️ Customer ordered query failed. Falling back to unordered query.", orderError);
      snapshot = await getDocs(customersRef);
    }

    const loadedCustomers = [];

    snapshot.forEach((customerDoc) => {
      loadedCustomers.push({
        ...customerDoc.data(),
        uid: customerDoc.id
      });
    });

    // Safe Local Sort (Newest First)
    loadedCustomers.sort((customerA, customerB) => {
      const dateA = toSafeDate(customerA.createdAt);
      const dateB = toSafeDate(customerB.createdAt);

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return dateB.getTime() - dateA.getTime();
    });

    customers = loadedCustomers;

    updateCustomerStats();
    refreshCustomerTable();

    // Restore selected customer if modal is open
    if (selectedCustomer && selectedCustomer.uid) {
      const refreshedCustomer = customers.find(
        (customer) => customer.uid === selectedCustomer.uid
      );

      if (refreshedCustomer) {
        selectedCustomer = refreshedCustomer;
        updateCustomerModal(refreshedCustomer, false);
      } else {
        closeCustomerModal();
      }
    }

    console.log(`✅ ${customers.length} customers loaded`);
  } catch (error) {
    console.error("❌ Load Customers Error:", error);
    customers = [];
    updateCustomerStats();

    if (customerTable) {
      customerTable.innerHTML = `
        <tr>
          <td colspan="7" class="empty-table-message">
            Unable To Load Customers<br>
            <small>Please refresh and try again.</small>
          </td>
        </tr>
      `;
    }
  } finally {
    customersLoading = false;
  }
}


// =====================================================
// CREATE CUSTOMER TABLE ROW
// =====================================================

function createCustomerRow(customer) {
  if (!customerTable || !customer) return;

  const uid = String(customer.uid || "");
  if (!uid) return;

  const name = getCustomerName(customer);
  const memberId = getCustomerMemberId(customer);
  const mobile = getCustomerMobile(customer);
  const stamps = getCustomerStamps(customer);
  const rewardReadyStatus = isRewardReady(customer);
  const avatar = getCustomerAvatar(customer);

  const tr = document.createElement("tr");

  // Photo Cell
  const photoCell = document.createElement("td");
  const photo = document.createElement("img");
  photo.src = avatar;
  photo.alt = `${name} Photo`;
  photo.loading = "lazy";
  photo.dataset.fallbackApplied = "false";
  photo.onerror = () => {
    if (photo.dataset.fallbackApplied === "true") return;
    photo.dataset.fallbackApplied = "true";
    photo.src = DEFAULT_MALE_AVATAR;
  };
  photoCell.appendChild(photo);

  // Name Cell
  const nameCell = document.createElement("td");
  nameCell.textContent = name;

  // Member ID Cell
  const memberCell = document.createElement("td");
  memberCell.textContent = memberId;

  // Mobile Cell
  const mobileCell = document.createElement("td");
  mobileCell.textContent = mobile;

  // Stamp Cell
  const stampCell = document.createElement("td");
  stampCell.textContent = `${stamps} / ${MAX_STAMPS}`;

  // Reward Status Cell
  const statusCell = document.createElement("td");
  const statusBadge = document.createElement("span");
  statusBadge.className = rewardReadyStatus
    ? "customer-status ready"
    : "customer-status locked";
  statusBadge.textContent = rewardReadyStatus
    ? "🟢 Reward Ready"
    : "🔒 Locked";
  statusCell.appendChild(statusBadge);

  // Action Cell
  const actionCell = document.createElement("td");
  const actionButton = document.createElement("button");
  actionButton.type = "button";
  actionButton.className = "actionBtn";
  actionButton.textContent = "View";
  actionButton.dataset.uid = uid;
  actionButton.setAttribute("aria-label", `View ${name} details`);

  actionButton.addEventListener("click", () => {
    const customerToOpen = customers.find((item) => item.uid === uid);
    if (!customerToOpen) {
      console.warn("⚠️ Customer not found:", uid);
      return;
    }
    updateCustomerModal(customerToOpen, true);
  });

  actionCell.appendChild(actionButton);

  tr.append(
    photoCell,
    nameCell,
    memberCell,
    mobileCell,
    stampCell,
    statusCell,
    actionCell
  );

  customerTable.appendChild(tr);
}


// =====================================================
// REFRESH CUSTOMER TABLE
// =====================================================

function refreshCustomerTable() {
  if (!customerTable) return;

  customerTable.innerHTML = "";

  const keyword = searchCustomer
    ? searchCustomer.value.trim().toLowerCase()
    : "";

  const filteredCustomers = customers.filter((customer) => {
    if (!keyword) return true;

    const name = String(customer.name || "").trim().toLowerCase();
    const memberId = String(customer.memberId || "").trim().toLowerCase();
    const mobile = getCustomerMobile(customer).toLowerCase();
    const email = String(customer.email || "").trim().toLowerCase();

    return (
      name.includes(keyword) ||
      memberId.includes(keyword) ||
      mobile.includes(keyword) ||
      email.includes(keyword)
    );
  });

  if (filteredCustomers.length === 0) {
    customerTable.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table-message">
          ${keyword ? "No Customers Found" : "No Customers Available"}
        </td>
      </tr>
    `;
    return;
  }

  filteredCustomers.forEach(createCustomerRow);
}


// =====================================================
// UPDATE CUSTOMER STATISTICS
// =====================================================

function updateCustomerStats() {
  if (totalCustomers) {
    totalCustomers.textContent = String(customers.length);
  }

  const readyCount = customers.filter((customer) => isRewardReady(customer)).length;
  if (rewardReady) {
    rewardReady.textContent = String(readyCount);
  }

  const todayCount = customers.filter((customer) => isCustomerCreatedToday(customer)).length;
  if (todayJoined) {
    todayJoined.textContent = String(todayCount);
  }
}


// =====================================================
// GET FRESH CUSTOMER FROM FIRESTORE
// =====================================================

async function getFreshCustomer(uid) {
  if (!uid) return null;

  const customerRef = doc(db, CUSTOMER_COLLECTION, uid);
  const snapshot = await getDoc(customerRef);

  if (!snapshot.exists()) return null;

  return {
    ...snapshot.data(),
    uid: snapshot.id
  };
}


// =====================================================
// UPDATE LOCAL CUSTOMER
// =====================================================

function updateLocalCustomer(updatedCustomer) {
  if (!updatedCustomer || !updatedCustomer.uid) return false;

  const index = customers.findIndex(
    (customer) => customer.uid === updatedCustomer.uid
  );

  if (index === -1) {
    customers.push(updatedCustomer);
    return true;
  }

  customers[index] = {
    ...customers[index],
    ...updatedCustomer
  };

  return true;
}


// =====================================================
// UPDATE CUSTOMER MODAL
// =====================================================

function updateCustomerModal(customer, showModal = true) {
  if (!customer) return;

  selectedCustomer = customer;

  if (modalPhoto) {
    modalPhoto.dataset.fallbackApplied = "false";
    modalPhoto.src = getCustomerAvatar(customer);
    modalPhoto.alt = `${getCustomerName(customer)} Photo`;
  }

  if (modalName) modalName.textContent = getCustomerName(customer);
  if (modalMember) modalMember.textContent = getCustomerMemberId(customer);
  if (modalMobile) modalMobile.textContent = getCustomerMobile(customer);

  const stamps = getCustomerStamps(customer);
  if (modalStamp) modalStamp.textContent = `${stamps} / ${MAX_STAMPS}`;

  if (modalReward) {
    modalReward.textContent = isRewardReady(customer) ? "Ready" : "Locked";
  }

  if (typeof syncActionButtons === "function") {
    syncActionButtons();
  }

  if (showModal) {
    setCustomerModalVisible(true);
  }
}


// =====================================================
// SEARCH EVENT LISTENER
// =====================================================

searchCustomer?.addEventListener("input", () => {
  refreshCustomerTable();
});


// =====================================================
// PART 2 PUBLIC API EXPORT
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

console.log("========================================");
console.log("🍜 RIO MAGGI POINT - Admin Customers JS Part 2 Loaded");
console.log("========================================");

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
// Continuation of PART 1 + PART 2.
// No duplicate imports, constants, or global state.
// =====================================================


// =====================================================
// ACTION BUTTON STATE HELPER
// =====================================================

function syncActionButtons() {
  const hasSelectedCustomer = Boolean(selectedCustomer && selectedCustomer.uid);
  const stamps = hasSelectedCustomer ? getCustomerStamps(selectedCustomer) : 0;
  const alreadyStampedToday = hasSelectedCustomer ? hasStampToday(selectedCustomer) : false;

  // Give Stamp Button
  if (giveStampBtn) {
    giveStampBtn.disabled = (
      !hasSelectedCustomer ||
      customerActionProcessing ||
      giveStampProcessing ||
      alreadyStampedToday ||
      stamps >= MAX_STAMPS
    );
  }

  // Remove Stamp Button
  if (removeStampBtn) {
    removeStampBtn.disabled = (
      !hasSelectedCustomer ||
      customerActionProcessing ||
      removeStampProcessing ||
      stamps <= 0
    );
  }

  // Unlock Reward Button
  if (unlockRewardBtn) {
    const rewardAlreadyUnlocked = (
      selectedCustomer && selectedCustomer.rewardUnlocked === true
    );

    unlockRewardBtn.disabled = (
      !hasSelectedCustomer ||
      customerActionProcessing ||
      unlockRewardProcessing ||
      rewardAlreadyUnlocked
    );
  }

  // Delete Customer Button
  if (deleteCustomerBtn) {
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

function setActionButtonLoading(button, isLoading, loadingText, defaultText) {
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.dataset.originalContent = button.innerHTML;
    button.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
      ${loadingText}
    `;
    return;
  }

  button.disabled = false;
  button.innerHTML = button.dataset.originalContent || defaultText;
}


// =====================================================
// REFRESH SELECTED CUSTOMER FROM FIRESTORE
// =====================================================

async function refreshSelectedCustomer() {
  if (!selectedCustomer || !selectedCustomer.uid) return null;

  const freshCustomer = await getFreshCustomer(selectedCustomer.uid);

  if (!freshCustomer) {
    closeCustomerModal();
    return null;
  }

  selectedCustomer = freshCustomer;
  updateLocalCustomer(freshCustomer);
  updateCustomerModal(freshCustomer, false);
  syncActionButtons();

  return freshCustomer;
}


// =====================================================
// GIVE STAMP
// =====================================================

async function giveCustomerStamp() {
  if (giveStampProcessing) return;

  if (!selectedCustomer || !selectedCustomer.uid) {
    alert("Please select a customer first.");
    return;
  }

  giveStampProcessing = true;
  customerActionProcessing = true;
  syncActionButtons();

  setActionButtonLoading(giveStampBtn, true, "Adding...", "➕ Give Stamp");

  try {
    const customer = await getFreshCustomer(selectedCustomer.uid);

    if (!customer) {
      alert("Customer no longer exists.");
      closeCustomerModal();
      return;
    }

    if (hasStampToday(customer)) {
      alert("This customer has already received today's stamp.");
      selectedCustomer = customer;
      updateLocalCustomer(customer);
      updateCustomerModal(customer, false);
      return;
    }

    const currentStamps = getCustomerStamps(customer);

    if (currentStamps >= MAX_STAMPS) {
      alert("This customer already has the maximum number of stamps.");
      selectedCustomer = customer;
      updateLocalCustomer(customer);
      updateCustomerModal(customer, false);
      return;
    }

    const newStampCount = Math.min(currentStamps + 1, MAX_STAMPS);
    const todayKey = getTodayKey();
    const customerRef = doc(db, CUSTOMER_COLLECTION, customer.uid);

    await updateDoc(customerRef, {
      stamps: newStampCount,
      dailyStampDate: todayKey,
      lastStampDate: todayKey,
      updatedAt: serverTimestamp()
    });

    const updatedCustomer = {
      ...customer,
      stamps: newStampCount,
      dailyStampDate: todayKey,
      lastStampDate: todayKey
    };

    selectedCustomer = updatedCustomer;
    updateLocalCustomer(updatedCustomer);

    updateCustomerStats();
    refreshCustomerTable();
    updateCustomerModal(updatedCustomer, false);
    syncActionButtons();

    console.log(`✅ Stamp added to customer: ${customer.uid}`);
  } catch (error) {
    console.error("❌ Give Stamp Error:", error);
    alert("Unable to give stamp. Please try again.");
  } finally {
    giveStampProcessing = false;
    customerActionProcessing = false;
    setActionButtonLoading(giveStampBtn, false, "", "➕ Give Stamp");
    syncActionButtons();
  }
}


// =====================================================
// REMOVE STAMP
// =====================================================

async function removeCustomerStamp() {
  if (removeStampProcessing) return;

  if (!selectedCustomer || !selectedCustomer.uid) {
    alert("Please select a customer first.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to remove one stamp from this customer?"
  );

  if (!confirmed) return;

  removeStampProcessing = true;
  customerActionProcessing = true;
  syncActionButtons();

  setActionButtonLoading(removeStampBtn, true, "Removing...", "➖ Remove Stamp");

  try {
    const customer = await getFreshCustomer(selectedCustomer.uid);

    if (!customer) {
      alert("Customer no longer exists.");
      closeCustomerModal();
      return;
    }

    const currentStamps = getCustomerStamps(customer);

    if (currentStamps <= 0) {
      alert("Customer has no stamps to remove.");
      selectedCustomer = customer;
      updateLocalCustomer(customer);
      updateCustomerModal(customer, false);
      return;
    }

    const newStampCount = Math.max(currentStamps - 1, 0);
    const customerRef = doc(db, CUSTOMER_COLLECTION, customer.uid);

    await updateDoc(customerRef, {
      stamps: newStampCount,
      updatedAt: serverTimestamp()
    });

    const updatedCustomer = {
      ...customer,
      stamps: newStampCount
    };

    selectedCustomer = updatedCustomer;
    updateLocalCustomer(updatedCustomer);

    updateCustomerStats();
    refreshCustomerTable();
    updateCustomerModal(updatedCustomer, false);
    syncActionButtons();

    console.log(`✅ Stamp removed from customer: ${customer.uid}`);
  } catch (error) {
    console.error("❌ Remove Stamp Error:", error);
    alert("Unable to remove stamp. Please try again.");
  } finally {
    removeStampProcessing = false;
    customerActionProcessing = false;
    setActionButtonLoading(removeStampBtn, false, "", "➖ Remove Stamp");
    syncActionButtons();
  }
}


// =====================================================
// UNLOCK REWARD
// =====================================================

async function unlockCustomerReward() {
  if (unlockRewardProcessing) return;

  if (!selectedCustomer || !selectedCustomer.uid) {
    alert("Please select a customer first.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to unlock this customer's reward?"
  );

  if (!confirmed) return;

  unlockRewardProcessing = true;
  customerActionProcessing = true;
  syncActionButtons();

  setActionButtonLoading(unlockRewardBtn, true, "Unlocking...", "🎁 Unlock Reward");

  try {
    const customer = await getFreshCustomer(selectedCustomer.uid);

    if (!customer) {
      alert("Customer no longer exists.");
      closeCustomerModal();
      return;
    }

    const currentStamps = getCustomerStamps(customer);

    if (currentStamps < MAX_STAMPS) {
      alert(`Customer needs ${MAX_STAMPS} stamps before the reward can be unlocked.`);
      selectedCustomer = customer;
      updateLocalCustomer(customer);
      updateCustomerModal(customer, false);
      return;
    }

    if (customer.rewardUnlocked === true) {
      alert("Reward is already unlocked for this customer.");
      selectedCustomer = customer;
      updateLocalCustomer(customer);
      updateCustomerModal(customer, false);
      return;
    }

    const customerRef = doc(db, CUSTOMER_COLLECTION, customer.uid);

    await updateDoc(customerRef, {
      rewardUnlocked: true,
      rewardUnlockedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const updatedCustomer = {
      ...customer,
      rewardUnlocked: true
    };

    selectedCustomer = updatedCustomer;
    updateLocalCustomer(updatedCustomer);

    updateCustomerStats();
    refreshCustomerTable();
    updateCustomerModal(updatedCustomer, false);
    syncActionButtons();

    console.log(`✅ Reward unlocked for customer: ${customer.uid}`);
  } catch (error) {
    console.error("❌ Unlock Reward Error:", error);
    alert("Unable to unlock reward. Please try again.");
  } finally {
    unlockRewardProcessing = false;
    customerActionProcessing = false;
    setActionButtonLoading(unlockRewardBtn, false, "", "🎁 Unlock Reward");
    syncActionButtons();
  }
}


// =====================================================
// DELETE CUSTOMER
// =====================================================

async function deleteSelectedCustomer() {
  if (deleteCustomerProcessing) return;

  if (!selectedCustomer || !selectedCustomer.uid) {
    alert("Please select a customer first.");
    return;
  }

  const customerName = getCustomerName(selectedCustomer);

  const confirmed = window.confirm(
    `Are you sure you want to permanently delete ${customerName}? This action cannot be undone.`
  );

  if (!confirmed) return;

  deleteCustomerProcessing = true;
  customerActionProcessing = true;
  syncActionButtons();

  setActionButtonLoading(deleteCustomerBtn, true, "Deleting...", "🗑 Delete Customer");

  try {
    const customer = await getFreshCustomer(selectedCustomer.uid);

    if (!customer) {
      alert("Customer no longer exists.");
      closeCustomerModal();
      return;
    }

    const customerRef = doc(db, CUSTOMER_COLLECTION, customer.uid);

    await deleteDoc(customerRef);

    customers = customers.filter((item) => item.uid !== customer.uid);

    closeCustomerModal();
    updateCustomerStats();
    refreshCustomerTable();

    console.log(`✅ Customer deleted: ${customer.uid}`);
  } catch (error) {
    console.error("❌ Delete Customer Error:", error);
    alert("Unable to delete customer. Please try again.");
  } finally {
    deleteCustomerProcessing = false;
    customerActionProcessing = false;
    setActionButtonLoading(deleteCustomerBtn, false, "", "🗑 Delete Customer");
    syncActionButtons();
  }
}


// =====================================================
// MODAL VISIBILITY HELPERS
// =====================================================

function openCustomerModal() {
  if (!customerModal || !selectedCustomer || !selectedCustomer.uid) return;
  setCustomerModalVisible(true);
  syncActionButtons();
}


// =====================================================
// EVENT LISTENERS FOR MODAL & ACTIONS
// =====================================================

closeModalBtn?.addEventListener("click", () => {
  closeCustomerModal();
});

customerModal?.addEventListener("click", (event) => {
  if (event.target === customerModal) {
    closeCustomerModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !customerModal) return;
  if (customerModal.style.display === "flex") {
    closeCustomerModal();
  }
});

modalPhoto?.addEventListener("error", () => {
  if (modalPhoto.dataset.fallbackApplied === "true") return;
  modalPhoto.dataset.fallbackApplied = "true";
  modalPhoto.src = DEFAULT_MALE_AVATAR;
});

modalPhoto?.addEventListener("load", () => {
  modalPhoto.dataset.fallbackApplied = "false";
});

giveStampBtn?.addEventListener("click", giveCustomerStamp);
removeStampBtn?.addEventListener("click", removeCustomerStamp);
unlockRewardBtn?.addEventListener("click", unlockCustomerReward);
deleteCustomerBtn?.addEventListener("click", deleteSelectedCustomer);


// =====================================================
// PART 3 PUBLIC API EXPORT
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

console.log("========================================");
console.log("🍜 RIO MAGGI POINT - Admin Customers JS Part 3 Loaded");
console.log("========================================");

// =====================================================
// END OF PART 3
// =====================================================// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN CUSTOMER MANAGER
// admin-customers.js — PART 4 OF 4
//
// RESPONSIBILITY:
// - Authentication Listener
// - Admin Guard / Access Control
// - Application Initialization
// - Auto Refresh System
// - Manual Refresh System
// - Page Cleanup
//
// IMPORTANT:
// Final continuation of PART 1, PART 2 and PART 3.
// Completes the entire module without duplicate state.
// =====================================================


// =====================================================
// AUTHENTICATION GUARD & LISTENER
// =====================================================
//
// Ensures only logged-in admin users can view data.
// Redirects unauthorized users to the login page.
//
// =====================================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("🔒 Unauthorized access attempt. Redirecting to login...");
    authenticatedUser = null;
    stopCustomerAutoRefresh();
    window.location.href = ADMIN_LOGIN_PAGE;
    return;
  }

  authenticatedUser = user;
  console.log(`👤 Admin authenticated: ${user.email || user.uid}`);

  // Initialize page on first auth event
  if (!customerPageInitialized) {
    await initAdminCustomerManager();
  }
});


// =====================================================
// INITIALIZE ADMIN CUSTOMER MANAGER
// =====================================================

async function initAdminCustomerManager() {
  if (customerPageInitialized) return;

  customerPageInitialized = true;

  try {
    // 1. Initial Customer Data Load
    await loadCustomers();

    // 2. Start Auto Refresh Cycle
    startCustomerAutoRefresh();

    console.log("🚀 Admin Customer Manager Initialized Successfully");
  } catch (error) {
    console.error("❌ Initialization Error:", error);
  }
}


// =====================================================
// MANUAL REFRESH
// =====================================================

async function handleManualRefresh() {
  if (refreshProcessing || customerRefreshProcessing) return;

  refreshProcessing = true;
  customerRefreshProcessing = true;

  // Set loading UI on refresh button
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.classList.add("refreshing");
  }

  try {
    console.log("🔄 Performing manual customer refresh...");
    await loadCustomers();
  } catch (error) {
    console.error("❌ Manual Refresh Error:", error);
  } finally {
    refreshProcessing = false;
    customerRefreshProcessing = false;

    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.classList.remove("refreshing");
    }
  }
}


// =====================================================
// AUTO REFRESH SYSTEM
// =====================================================

function startCustomerAutoRefresh() {
  stopCustomerAutoRefresh();

  customerAutoRefreshTimer = setInterval(async () => {
    // Skip auto-refresh if an action is currently processing or user is editing
    if (
      customersLoading ||
      customerActionProcessing ||
      refreshProcessing ||
      customerRefreshProcessing
    ) {
      return;
    }

    try {
      console.log("⏱️ Auto-refreshing customer data...");
      await loadCustomers();
    } catch (error) {
      console.warn("⚠️ Auto Refresh Warning:", error);
    }
  }, CUSTOMER_AUTO_REFRESH_INTERVAL);
}

function stopCustomerAutoRefresh() {
  if (customerAutoRefreshTimer) {
    clearInterval(customerAutoRefreshTimer);
    customerAutoRefreshTimer = null;
  }
}


// =====================================================
// EVENT LISTENERS FOR PART 4
// =====================================================

refreshBtn?.addEventListener("click", handleManualRefresh);

// Stop timer when page is hidden or unloaded
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopCustomerAutoRefresh();
  } else if (authenticatedUser) {
    startCustomerAutoRefresh();
  }
});

window.addEventListener("beforeunload", () => {
  stopCustomerAutoRefresh();
});


// =====================================================
// FINAL PUBLIC API EXPORT
// =====================================================

window.adminCustomers = {
  ...(window.adminCustomers || {}),
  initAdminCustomerManager,
  handleManualRefresh,
  startCustomerAutoRefresh,
  stopCustomerAutoRefresh
};


// =====================================================
// PART 4 DEVELOPMENT LOG
// =====================================================

console.log("========================================");
console.log("🍜 RIO MAGGI POINT - Admin Customers JS Part 4 Loaded");
console.log("✅ Complete ES Module Ready");
console.log("========================================");

// =====================================================
// END OF PART 4 & COMPLETE FILE
// =====================================================
