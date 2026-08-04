// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 5
// GIVE STAMP + 40 DAY LOYALTY CYCLE + REWARD UNLOCK
// FIREBASE UPDATE + LOGOUT
// FINAL CLEAN REPLACEMENT
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
// GET CURRENT TIMESTAMP
// =====================================================

function getCurrentTimestamp() {

  return Date.now();

}


// =====================================================
// CONVERT FIREBASE / DATE VALUE TO DATE
// =====================================================

function normalizeDateValue(value) {

  if (!value) {
    return null;
  }

  try {

    if (
      typeof value.toDate === "function"
    ) {

      const date =
        value.toDate();

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

      const date =
        new Date(value);

      return (
        !Number.isNaN(date.getTime())
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

  // ---------------------------------------------------
  // NO ACTIVE CYCLE
  // ---------------------------------------------------

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
    getCurrentTimestamp();

  const expired =
    now >= cycleExpiryTime;

  return {

    active: true,

    expired,

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
// CHECK 40-DAY CYCLE EXPIRATION
// =====================================================

function isLoyaltyCycleExpired(customer) {

  const status =
    getLoyaltyCycleStatus(customer);

  return status.expired === true;

}


// =====================================================
// GET FRESH CUSTOMER DOCUMENT
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

  const customerData =
    customerSnapshot.data();

  const customer = {

    ...customerData,

    uid:
      customerSnapshot.id

  };

  // ---------------------------------------------------
  // NORMALIZE STAMPS
  // ---------------------------------------------------

  customer.stamps =
    getCustomerStamps(customer);


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
// UPDATE LOCAL CUSTOMER SAFELY
// =====================================================

function syncCustomerAfterStamp(customer) {

  if (!customer) {
    return;
  }

  // ---------------------------------------------------
  // LOCAL CUSTOMER ARRAY
  // ---------------------------------------------------

  if (
    typeof upsertLocalCustomer ===
    "function"
  ) {

    upsertLocalCustomer(customer);

  }


  // ---------------------------------------------------
  // CURRENT CUSTOMER
  // ---------------------------------------------------

  currentCustomer =
    customer;


  // ---------------------------------------------------
  // CUSTOMER PREVIEW
  // ---------------------------------------------------

  if (
    typeof showCustomer ===
    "function"
  ) {

    showCustomer(customer);

  }


  // ---------------------------------------------------
  // DASHBOARD STATS
  // ---------------------------------------------------

  if (
    typeof updateDashboardStats ===
    "function"
  ) {

    updateDashboardStats();

  }


  // ---------------------------------------------------
  // CUSTOMER TABLE
  // ---------------------------------------------------

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
      filterCustomers(searchValue)
    );

  }

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
  // CHECK CUSTOMER
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
  // CHECK ADMIN AUTH
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

    // =================================================
    // ALWAYS GET FRESH FIREBASE DATA
    // =================================================

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


    // =================================================
    // TODAY
    // =================================================

    const todayKey =
      getTodayKey();


    // =================================================
    // CURRENT STAMPS
    // =================================================

    let currentStamps =
      getCustomerStamps(
        freshCustomer
      );


    // =================================================
    // GET CYCLE STATUS
    // =================================================

    const cycleStatus =
      getLoyaltyCycleStatus(
        freshCustomer
      );


    let cycleExpired =
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
        "⏰ 40-day cycle expired."
      );

      console.log(
        "Old stamp count:",
        currentStamps
      );

      currentStamps =
        0;

    }


    // =================================================
    // DAILY STAMP PROTECTION
    // =================================================
    // Expired cycle can start again today.
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


    // =================================================
    // CHECK NEW CYCLE
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
        "customers",
        customerUid
      );


    // =================================================
    // FIRESTORE UPDATE
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

      updateData.loyaltyCycleStartedAt =
        serverTimestamp();

      updateData.stampCycleStartedAt =
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
    // CREATE LOCAL UPDATED CUSTOMER
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
    // LOCAL CYCLE START
    // =================================================

    if (
      isStartingNewCycle ||
      cycleExpired
    ) {

      const localCycleStart =
        new Date();

      updatedCustomer.cycleStartedAt =
        localCycleStart;

      updatedCustomer.loyaltyCycleStartedAt =
        localCycleStart;

      updatedCustomer.stampCycleStartedAt =
        localCycleStart;

    }


    // =================================================
    // SYNC EVERYTHING
    // =================================================

    syncCustomerAfterStamp(
      updatedCustomer
    );


    // =================================================
    // REFRESH TIME
    // =================================================

    if (
      typeof updateLastRefresh ===
      "function"
    ) {

      updateLastRefresh();

    }


    // =================================================
    // SCANNER STATUS
    // =================================================

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


    // =================================================
    // SUCCESS LOG
    // =================================================

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

    // =================================================
    // ERROR
    // =================================================

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

    // =================================================
    // RELEASE LOCK
    // =================================================

    stampActionProcessing =
      false;


    // =================================================
    // RESTORE BUTTON
    // =================================================

    if (giveStampBtn) {

      giveStampBtn.innerHTML =
        originalButtonContent;


      // -------------------------------------------------
      // RE-CHECK BUTTON STATE
      // -------------------------------------------------

      if (
        currentCustomer
      ) {

        const currentCount =
          getCustomerStamps(
            currentCustomer
          );

        const disabled = (

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

        giveStampBtn.disabled =
          disabled;

      }

      else {

        giveStampBtn.disabled =
          true;

      }

    }

  }

}


// =====================================================
// GIVE STAMP BUTTON
// =====================================================
// IMPORTANT:
// Part 5 owns this listener.
// Do not add another Give Stamp listener elsewhere.
// =====================================================

if (
  giveStampBtn &&
  !giveStampBtn.dataset.listenerAttached
) {

  giveStampBtn.addEventListener(
    "click",
    giveStampToCustomer
  );

  giveStampBtn.dataset.listenerAttached =
    "true";

}


// =====================================================
// LOGOUT SYSTEM
// =====================================================

async function handleAdminLogout() {

  // ---------------------------------------------------
  // PREVENT DOUBLE LOGOUT
  // ---------------------------------------------------

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

    // =================================================
    // STOP SCANNER
    // =================================================

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


    // =================================================
    // FIREBASE LOGOUT
    // =================================================

    await signOut(
      auth
    );


    console.log(
      "✅ Admin logged out successfully."
    );


    // =================================================
    // AUTH STATE LISTENER
    // HANDLES REDIRECT
    // =================================================

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
// Prevent duplicate event listener.
// =====================================================

if (
  logoutBtn &&
  !logoutBtn.dataset.listenerAttached
) {

  logoutBtn.addEventListener(
    "click",
    handleAdminLogout
  );

  logoutBtn.dataset.listenerAttached =
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
