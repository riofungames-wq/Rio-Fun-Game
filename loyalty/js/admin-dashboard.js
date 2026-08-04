// =====================================================
// RIO MAGGI POINT
// PREMIUM ADMIN DASHBOARD
// ADMIN-DASHBOARD.JS — PART 5
// GIVE STAMP + 40 DAY LOYALTY CYCLE + REWARD UNLOCK
// FIREBASE UPDATE + LOGOUT
// CLEAN VERSION
// =====================================================


// =====================================================
// IMPORTANT
// =====================================================
// stampActionProcessing is already declared in PART 1.
// DO NOT declare it again here.
//
// let stampActionProcessing = false;
// =====================================================


// =====================================================
// LOYALTY CYCLE CONFIGURATION
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
// GET CUSTOMER CYCLE START DATE
// =====================================================

function getCustomerCycleStartDate(
  customer
) {

  if (!customer) {
    return null;
  }


  // ---------------------------------------------------
  // SUPPORT MULTIPLE POSSIBLE FIELD NAMES
  // ---------------------------------------------------

  const possibleDates = [

    customer.cycleStartedAt,

    customer.loyaltyCycleStartedAt,

    customer.stampCycleStartedAt,

    customer.firstStampDate

  ];


  for (
    const value of possibleDates
  ) {

    if (!value) {
      continue;
    }


    // -------------------------------------------------
    // FIREBASE TIMESTAMP
    // -------------------------------------------------

    if (
      value &&
      typeof value.toDate === "function"
    ) {

      const date =
        value.toDate();

      if (
        date instanceof Date &&
        !Number.isNaN(
          date.getTime()
        )
      ) {

        return date;

      }

    }


    // -------------------------------------------------
    // JS DATE / STRING / NUMBER
    // -------------------------------------------------

    const date =
      new Date(value);


    if (
      date instanceof Date &&
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return date;

    }

  }


  return null;

}


// =====================================================
// CHECK WHETHER 40-DAY CYCLE HAS EXPIRED
// =====================================================

function isLoyaltyCycleExpired(
  customer
) {

  if (!customer) {
    return false;
  }


  const stamps =
    getCustomerStamps(
      customer
    );


  // ---------------------------------------------------
  // NO ACTIVE STAMP CYCLE
  // ---------------------------------------------------

  if (stamps <= 0) {
    return false;
  }


  // ---------------------------------------------------
  // IF CYCLE START DATE DOES NOT EXIST
  // ---------------------------------------------------
  // Do not automatically reset old customers because
  // legacy documents may not have cycleStartedAt.
  // ---------------------------------------------------

  const cycleStartDate =
    getCustomerCycleStartDate(
      customer
    );


  if (!cycleStartDate) {
    return false;
  }


  const cycleStartTime =
    cycleStartDate.getTime();


  const now =
    getCurrentTimestamp();


  const cycleAge =
    now -
    cycleStartTime;


  return (
    cycleAge >=
    LOYALTY_CYCLE_MS
  );

}


// =====================================================
// GET CYCLE STATUS
// =====================================================

function getLoyaltyCycleStatus(
  customer
) {

  if (!customer) {

    return {

      expired:
        false,

      active:
        false

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

      expired:
        false,

      active:
        false

    };

  }


  const cycleStartTime =
    cycleStartDate.getTime();


  const cycleExpiryTime =

    cycleStartTime +

    LOYALTY_CYCLE_MS;


  const now =
    getCurrentTimestamp();


  return {

    expired:
      now >=
      cycleExpiryTime,

    active:
      true,

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
  // PREVENT DOUBLE CLICK
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
    // CHECK 40-DAY LOYALTY CYCLE
    // =================================================

    const cycleStatus =
      getLoyaltyCycleStatus(
        freshCustomer
      );


    // =================================================
    // EXPIRED CYCLE
    // =====================================================
    // If customer had 1–5 stamps and the 40-day cycle
    // expired, old cycle is reset.
    //
    // IMPORTANT:
    // The current visit becomes STAMP #1 of a new cycle.
    // =================================================

    let cycleExpired =
      cycleStatus.expired;


    if (
      cycleExpired &&
      currentStamps > 0 &&
      currentStamps < MAX_STAMPS
    ) {

      console.log(
        "⏰ 40-day loyalty cycle expired."
      );


      console.log(
        "Old Stamps:",
        currentStamps
      );


      currentStamps =
        0;

    }


    // =================================================
    // CHECK TODAY'S STAMP
    // =================================================
    // Check only when the existing cycle is still valid.
    // If the old cycle expired, the customer can start
    // a fresh cycle today.
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
    // CHECK REWARD READY
    // =================================================
    // A completed 6-stamp cycle must not receive another
    // stamp until reward is claimed/consumed.
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
        "🎁 This customer already has a reward ready. Please claim the reward first."
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
    // CHECK WHETHER THIS IS FIRST STAMP OF NEW CYCLE
    // =================================================

    const isStartingNewCycle = (

      currentStamps === 0

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

        currentCustomer.uid

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
    // START NEW 40-DAY CYCLE
    // =================================================
    // This happens when:
    //
    // 1. Customer has 0 stamps
    // 2. Previous cycle expired and was reset
    //
    // Existing valid cycle keeps its original start date.
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
    // UPDATE FIRESTORE
    // =================================================

    await updateDoc(

      customerRef,

      updateData

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


    // ---------------------------------------------------
    // UPDATE LOCAL CYCLE START
    // ---------------------------------------------------

    if (
      isStartingNewCycle ||
      cycleExpired
    ) {

      const now =
        new Date();


      updatedCustomer.cycleStartedAt =
        now;

      updatedCustomer.loyaltyCycleStartedAt =
        now;

      updatedCustomer.stampCycleStartedAt =
        now;

    }


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

        "🎁 Congratulations! 6 valid stamps completed.\n" +

        "Customer Reward is now READY."

      );

    }

    else if (
      cycleExpired
    ) {

      alert(

        "⏰ Previous 40-day loyalty cycle expired.\n\n" +

        "🔄 Old stamp cycle has been reset.\n\n" +

        "✅ New loyalty cycle started.\n\n" +

        `Current Stamps: ${newStampCount}/${MAX_STAMPS}`

      );

    }

    else {

      alert(

        "✅ Stamp Added Successfully!\n\n" +

        `Current Stamps: ${newStampCount}/${MAX_STAMPS}\n\n` +

        "⏳ Complete 6 stamps within 40 days to unlock your reward."

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
      "40-Day Cycle Expired:",
      cycleExpired
    );

    console.log(
      "New Cycle Started:",
      isStartingNewCycle ||
      cycleExpired
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
// ONLY ONE GIVE STAMP CLICK LISTENER
// =====================================================

giveStampBtn?.addEventListener(

  "click",

  giveStampToCustomer

);


// =====================================================
// LOGOUT BUTTON
// =====================================================
// ONLY ONE LOGOUT CLICK LISTENER
// =====================================================

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
      // AUTH STATE LISTENER HANDLES REDIRECT
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
