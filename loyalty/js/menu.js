/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 1/4
   MENU CATEGORY SYSTEM
   COMPATIBLE WITH CURRENT menu.html
========================================= */


/* =========================================
   MENU CATEGORY CONFIGURATION
========================================= */

const rioMenuCategories = {

    everyday: {
        title: "Everyday Magic Maggi",
        selector: "#everyday"
    },

    cheese: {
        title: "Cheese Magic Maggi",
        selector: "#cheese"
    },

    "cheese-butter": {
        title: "Cheese Butter Magic Maggi",
        selector: "#cheese-butter"
    },

    burger: {
        title: "UFO Burger",
        selector: "#burger"
    },

    momos: {
        title: "Delicious Momos",
        selector: "#momos"
    },

    soups: {
        title: "Hot Soups",
        selector: "#soups"
    },

    corn: {
        title: "Crispy Sweet Corn",
        selector: "#corn"
    },

    bhel: {
        title: "Chips Bhel",
        selector: "#bhel"
    }

};


/* =========================================
   GLOBAL ACCESS
========================================= */

window.rioMenuCategories =
    rioMenuCategories;


/* =========================================
   DOM READY
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        /* =====================================
           GET CATEGORY GRID
        ====================================== */

        const categoryGrid =
            document.getElementById(
                "categoryGrid"
            );


        /* =====================================
           GET CATEGORY CARDS
        ====================================== */

        const categoryCards =
            document.querySelectorAll(
                ".category-card"
            );


        /* =====================================
           GET FOOD SECTIONS
        ====================================== */

        const foodSections =
            document.querySelectorAll(
                ".food-section"
            );


        /* =====================================
           SAFETY CHECK
        ====================================== */

        if (

            !categoryGrid ||

            !categoryCards.length ||

            !foodSections.length

        ) {

            console.warn(

                "Rio Menu: Required menu elements were not found."

            );

            return;

        }


        /* =====================================
           INITIAL MENU STATE
        ====================================== */

        setInitialMenuState(

            categoryCards,

            foodSections

        );


        /* =====================================
           INITIALIZE CATEGORY BUTTONS
        ====================================== */

        initializeCategoryButtons(

            categoryCards,

            foodSections

        );


        /* =====================================
           INITIALIZE IMAGE HANDLING
        ====================================== */

        initializeMenuImages();


        /* =====================================
           INITIALIZE TOUCH FEEDBACK
        ====================================== */

        initializeCategoryTouchFeedback();


        /* =====================================
           INITIALIZE BOTTOM NAVIGATION
        ====================================== */

        initializeBottomNavigation();


        /* =====================================
           PRELOAD MENU IMAGES
        ====================================== */

        preloadMenuImages();


        /* =====================================
           MENU READY
        ====================================== */

        document.body.classList.add(

            "menu-page-ready"

        );


        /* =====================================
           CUSTOM READY EVENT
        ====================================== */

        document.dispatchEvent(

            new CustomEvent(

                "rioMenuReady"

            )

        );

    }

);


/* =========================================
   SET INITIAL MENU STATE
========================================= */

function setInitialMenuState(

    categoryCards,

    foodSections

) {


    /* =====================================
       HIDE ALL FOOD SECTIONS
    ====================================== */

    foodSections.forEach(

        function (section) {

            section.classList.remove(

                "active"

            );

        }

    );


    /* =====================================
       SHOW EVERYDAY MAGIC MAGGI
       BY DEFAULT
    ====================================== */

    const defaultSection =
        document.getElementById(

            "everyday"

        );


    if (defaultSection) {

        defaultSection.classList.add(

            "active"

        );

    }


    /* =====================================
       CATEGORY CARD ACTIVE STATE
    ====================================== */

    categoryCards.forEach(

        function (card) {

            const target =
                card.dataset.target;


            if (

                target ===

                "everyday"

            ) {

                card.classList.add(

                    "active"

                );

                card.setAttribute(

                    "aria-expanded",

                    "true"

                );

            }

            else {

                card.classList.remove(

                    "active"

                );

                card.setAttribute(

                    "aria-expanded",

                    "false"

                );

            }

        }

    );

}


/* =========================================
   INITIALIZE CATEGORY BUTTONS
========================================= */

function initializeCategoryButtons(

    categoryCards,

    foodSections

) {


    categoryCards.forEach(

        function (categoryCard) {


            /* =================================
               CLICK EVENT
            ================================== */

            categoryCard.addEventListener(

                "click",

                function () {


                    /* =============================
                       GET TARGET CATEGORY
                    ============================== */

                    const targetId =

                        this.dataset.target;


                    /* =============================
                       SAFETY CHECK
                    ============================== */

                    if (!targetId) {

                        console.warn(

                            "Rio Menu: Category target missing."

                        );

                        return;

                    }


                    /* =============================
                       FIND TARGET SECTION
                    ============================== */

                    const targetSection =

                        document.getElementById(

                            targetId

                        );


                    /* =============================
                       TARGET NOT FOUND
                    ============================== */

                    if (!targetSection) {

                        console.warn(

                            "Rio Menu: Target section not found:",

                            targetId

                        );

                        return;

                    }


                    /* =============================
                       HIDE ALL SECTIONS
                    ============================== */

                    foodSections.forEach(

                        function (section) {

                            section.classList.remove(

                                "active"

                            );

                        }

                    );


                    /* =============================
                       SHOW SELECTED SECTION
                    ============================== */

                    targetSection.classList.add(

                        "active"

                    );


                    /* =============================
                       UPDATE CATEGORY CARDS
                    ============================== */

                    categoryCards.forEach(

                        function (card) {

                            const isActive =

                                card ===

                                categoryCard;


                            card.classList.toggle(

                                "active",

                                isActive

                            );


                            card.setAttribute(

                                "aria-expanded",

                                isActive

                                    ? "true"

                                    : "false"

                            );

                        }

                    );


                    /* =============================
                       SCROLL TO FOOD SECTION
                    ============================== */

                    requestAnimationFrame(

                        function () {

                            targetSection.scrollIntoView({

                                behavior:
                                    "smooth",

                                block:
                                    "start"

                            });

                        }

                    );

                }

            );

        }

    );

}


/* =========================================
   END MENU.JS PART 1/4
========================================= */
/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 2/4
   IMAGE HANDLING
   + TOUCH FEEDBACK
   + MENU SECTION ANIMATION
========================================= */


/* =========================================
   INITIALIZE MENU IMAGES
========================================= */

function initializeMenuImages() {


    /* =====================================
       GET ALL MENU IMAGES
    ====================================== */

    const menuImages =

        document.querySelectorAll(

            ".category-image img, " +

            ".food-image-large img"

        );


    /* =====================================
       PROCESS EACH IMAGE
    ====================================== */

    menuImages.forEach(

        function (image) {


            /* ===============================
               IMAGE ERROR HANDLING
            ================================ */

            image.addEventListener(

                "error",

                function () {

                    this.classList.add(

                        "image-error"

                    );

                }

            );


            /* ===============================
               IMAGE LOAD HANDLING
            ================================ */

            image.addEventListener(

                "load",

                function () {

                    this.classList.add(

                        "image-loaded"

                    );

                }

            );


            /* ===============================
               CHECK ALREADY LOADED IMAGE
            ================================ */

            if (

                image.complete &&

                image.naturalWidth > 0

            ) {

                image.classList.add(

                    "image-loaded"

                );

            }

        }

    );

}


/* =========================================
   CATEGORY TOUCH FEEDBACK
========================================= */

function initializeCategoryTouchFeedback() {


    /* =====================================
       GET ALL CATEGORY CARDS
    ====================================== */

    const categoryCards =

        document.querySelectorAll(

            ".category-card"

        );


    /* =====================================
       PROCESS EACH CATEGORY CARD
    ====================================== */

    categoryCards.forEach(

        function (card) {


            /* ===============================
               TOUCH START
            ================================ */

            card.addEventListener(

                "touchstart",

                function () {

                    this.classList.add(

                        "touch-active"

                    );

                },

                {

                    passive:
                        true

                }

            );


            /* ===============================
               TOUCH END
            ================================ */

            card.addEventListener(

                "touchend",

                function () {

                    this.classList.remove(

                        "touch-active"

                    );

                },

                {

                    passive:
                        true

                }

            );


            /* ===============================
               TOUCH CANCEL
            ================================ */

            card.addEventListener(

                "touchcancel",

                function () {

                    this.classList.remove(

                        "touch-active"

                    );

                },

                {

                    passive:
                        true

                }

            );


            /* ===============================
               MOUSE LEAVE
            ================================ */

            card.addEventListener(

                "mouseleave",

                function () {

                    this.classList.remove(

                        "touch-active"

                    );

                }

            );

        }

    );

}


/* =========================================
   MENU SECTION TRANSITION
========================================= */

function animateFoodSection(

    section

) {


    /* =====================================
       SAFETY CHECK
    ====================================== */

    if (!section) {

        return;

    }


    /* =====================================
       REMOVE PREVIOUS ANIMATION CLASS
    ====================================== */

    section.classList.remove(

        "food-section-enter"

    );


    /* =====================================
       FORCE BROWSER REFLOW
    ====================================== */

    void section.offsetWidth;


    /* =====================================
       ADD ANIMATION CLASS
    ====================================== */

    section.classList.add(

        "food-section-enter"

    );


    /* =====================================
       REMOVE CLASS AFTER ANIMATION
    ====================================== */

    setTimeout(

        function () {

            section.classList.remove(

                "food-section-enter"

            );

        },

        500

    );

}


/* =========================================
   ENHANCED CATEGORY CLICK HANDLER
========================================= */

document.addEventListener(

    "click",

    function (event) {


        /* =====================================
           FIND CLICKED CATEGORY CARD
        ====================================== */

        const categoryCard =

            event.target.closest(

                ".category-card"

            );


        /* =====================================
           NOT A CATEGORY CARD
        ====================================== */

        if (!categoryCard) {

            return;

        }


        /* =====================================
           GET TARGET ID
        ====================================== */

        const targetId =

            categoryCard.dataset.target;


        /* =====================================
           FIND FOOD SECTION
        ====================================== */

        const targetSection =

            document.getElementById(

                targetId

            );


        /* =====================================
           SAFETY CHECK
        ====================================== */

        if (!targetSection) {

            return;

        }


        /* =====================================
           RUN SECTION ANIMATION
        ====================================== */

        requestAnimationFrame(

            function () {

                animateFoodSection(

                    targetSection

                );

            }

        );

    }

);


/* =========================================
   CATEGORY KEYBOARD ACCESSIBILITY
========================================= */

document.addEventListener(

    "keydown",

    function (event) {


        /* =====================================
           ONLY ENTER / SPACE
        ====================================== */

        if (

            event.key !== "Enter" &&

            event.key !== " "

        ) {

            return;

        }


        /* =====================================
           FIND FOCUSED CATEGORY CARD
        ====================================== */

        const categoryCard =

            document.activeElement;


        /* =====================================
           SAFETY CHECK
        ====================================== */

        if (

            !categoryCard ||

            !categoryCard.classList.contains(

                "category-card"

            )

        ) {

            return;

        }


        /* =====================================
           PREVENT SPACE PAGE SCROLL
        ====================================== */

        if (

            event.key === " "

        ) {

            event.preventDefault();

        }


        /* =====================================
           CLICK CATEGORY CARD
        ====================================== */

        categoryCard.click();

    }

);


/* =========================================
   UPDATE ACTIVE CATEGORY ON SCROLL
========================================= */

function initializeScrollCategoryTracking() {


    /* =====================================
       GET CATEGORY CARDS
    ====================================== */

    const categoryCards =

        document.querySelectorAll(

            ".category-card"

        );


    /* =====================================
       GET FOOD SECTIONS
    ====================================== */

    const foodSections =

        document.querySelectorAll(

            ".food-section"

        );


    /* =====================================
       SAFETY CHECK
    ====================================== */

    if (

        !categoryCards.length ||

        !foodSections.length

    ) {

        return;

    }


    /* =====================================
       INTERSECTION OBSERVER
    ====================================== */

    const observer =

        new IntersectionObserver(

            function (entries) {


                entries.forEach(

                    function (entry) {


                        if (

                            !entry.isIntersecting

                        ) {

                            return;

                        }


                        const sectionId =

                            entry.target.id;


                        categoryCards.forEach(

                            function (card) {


                                const isActive =

                                    card.dataset.target ===

                                    sectionId;


                                card.classList.toggle(

                                    "active",

                                    isActive

                                );


                                card.setAttribute(

                                    "aria-expanded",

                                    isActive

                                        ? "true"

                                        : "false"

                                );

                            }

                        );

                    }

                );

            },

            {

                threshold:
                    0.35

            }

        );


    /* =====================================
       OBSERVE FOOD SECTIONS
    ====================================== */

    foodSections.forEach(

        function (section) {

            observer.observe(

                section

            );

        }

    );

}


/* =========================================
   INITIALIZE SCROLL TRACKING
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializeScrollCategoryTracking();

    }

);


/* =========================================
   END MENU.JS PART 2/4
========================================= */
 /* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 3/4
   MENU ITEM POPUP SYSTEM
   ITEM IMAGE + PRICE DISPLAY
========================================= */


/* =========================================
   OPEN ITEM POPUP
========================================= */

function openMenuItemPopup(

    itemElement

) {


    /* =====================================
       REMOVE EXISTING POPUP
    ====================================== */

    const existingPopup =

        document.querySelector(

            ".menu-item-popup"

        );


    if (existingPopup) {

        existingPopup.remove();

    }


    /* =====================================
       GET ITEM INFORMATION
    ====================================== */

    const itemName =

        itemElement

            .querySelector(

                ".food-name"

            )?.textContent

            .trim();


    const halfPrice =

        itemElement

            .querySelector(

                ".half-price"

            )?.textContent

            .trim();


    const fullPrice =

        itemElement

            .querySelector(

                ".full-price"

            )?.textContent

            .trim();


    const singlePrice =

        itemElement

            .querySelector(

                ".single-price"

            )?.textContent

            .trim();


    /* =====================================
       GET IMAGE
    ====================================== */

    const foodSection =

        itemElement.closest(

            ".food-section"

        );


    const sectionTitle =

        foodSection

            ?.querySelector(

                ".food-header h2"

            )?.textContent

            .trim();


    const sectionImage =

        foodSection

            ?.querySelector(

                ".food-image-large img"

            )?.getAttribute(

                "src"

            );


    /* =====================================
       CREATE PRICE HTML
    ====================================== */

    let priceHTML = "";


    /* =====================================
       HALF + FULL PRICE
    ====================================== */

    if (

        halfPrice &&

        fullPrice

    ) {

        priceHTML = `

            <div class="menu-popup-price">

                <div class="popup-price-option">

                    <span>
                        Half
                    </span>

                    <strong>
                        ${halfPrice}
                    </strong>

                </div>


                <div class="popup-price-option">

                    <span>
                        Full
                    </span>

                    <strong>
                        ${fullPrice}
                    </strong>

                </div>

            </div>

        `;

    }


    /* =====================================
       SINGLE PRICE
    ====================================== */

    else if (singlePrice) {

        priceHTML = `

            <div class="menu-popup-price">

                <div class="popup-price-single">

                    ${singlePrice}

                </div>

            </div>

        `;

    }


    /* =====================================
       CREATE POPUP
    ====================================== */

    const popup =

        document.createElement(

            "div"

        );


    popup.className =

        "menu-item-popup";


    /* =====================================
       POPUP HTML
    ====================================== */

    popup.innerHTML = `

        <!-- =================================
             POPUP BACKDROP
        ================================== -->

        <div

            class="menu-popup-backdrop"

            aria-hidden="true"

        ></div>


        <!-- =================================
             POPUP CARD
        ================================== -->

        <div

            class="menu-popup-card"

            role="dialog"

            aria-modal="true"

            aria-labelledby="menuPopupTitle"

        >


            <!-- =============================
                 CLOSE BUTTON
            ============================== -->

            <button

                type="button"

                class="menu-popup-close"

                aria-label="Close item details"

            >

                <i

                    class="fa-solid fa-xmark"

                    aria-hidden="true"

                ></i>

            </button>


            <!-- =============================
                 ITEM IMAGE
            ============================== -->

            <div

                class="menu-popup-image-wrapper"

            >

                <img

                    src="${sectionImage || ""}"

                    alt="${itemName || "Food Item"}"

                    class="menu-popup-image"

                >

            </div>


            <!-- =============================
                 POPUP CONTENT
            ============================== -->

            <div

                class="menu-popup-content"

            >


                <span

                    class="menu-popup-category"

                >

                    ${sectionTitle || "Rio Maggi Point"}

                </span>


                <h2

                    id="menuPopupTitle"

                >

                    ${itemName || "Food Item"}

                </h2>


                ${priceHTML}


                <!-- =========================
                     DONE BUTTON
                ========================== -->

                <button

                    type="button"

                    class="menu-popup-done-btn"

                >

                    <i

                        class="fa-solid fa-check"

                        aria-hidden="true"

                    ></i>


                    Done

                </button>


            </div>

        </div>

    `;


    /* =====================================
       ADD POPUP TO BODY
    ====================================== */

    document.body.appendChild(

        popup

    );


    /* =====================================
       LOCK BODY SCROLL
    ====================================== */

    document.body.classList.add(

        "menu-popup-open"

    );


    /* =====================================
       SHOW POPUP
    ====================================== */

    requestAnimationFrame(

        function () {

            popup.classList.add(

                "show"

            );

        }

    );


    /* =====================================
       GET POPUP ELEMENTS
    ====================================== */

    const closeButton =

        popup.querySelector(

            ".menu-popup-close"

        );


    const doneButton =

        popup.querySelector(

            ".menu-popup-done-btn"

        );


    const backdrop =

        popup.querySelector(

            ".menu-popup-backdrop"

        );


    /* =====================================
       CLOSE POPUP FUNCTION
    ====================================== */

    function closePopup() {


        /* =================================
           REMOVE SHOW CLASS
        ================================== */

        popup.classList.remove(

            "show"

        );


        /* =================================
           UNLOCK BODY SCROLL
        ================================== */

        document.body.classList.remove(

            "menu-popup-open"

        );


        /* =================================
           REMOVE POPUP AFTER ANIMATION
        ================================== */

        setTimeout(

            function () {

                if (

                    popup.parentNode

                ) {

                    popup.remove();

                }

            },

            350

        );

    }


    /* =====================================
       CLOSE BUTTON
    ====================================== */

    if (closeButton) {

        closeButton.addEventListener(

            "click",

            closePopup

        );

    }


    /* =====================================
       DONE BUTTON
    ====================================== */

    if (doneButton) {

        doneButton.addEventListener(

            "click",

            closePopup

        );

    }


    /* =====================================
       BACKDROP CLICK
    ====================================== */

    if (backdrop) {

        backdrop.addEventListener(

            "click",

            closePopup

        );

    }


    /* =====================================
       ESCAPE KEY
    ====================================== */

    function escapeHandler(

        event

    ) {

        if (

            event.key ===

            "Escape"

        ) {

            closePopup();

        }

    }


    document.addEventListener(

        "keydown",

        escapeHandler

    );


    /* =====================================
       CLEAN ESCAPE LISTENER
    ====================================== */

    popup.addEventListener(

        "transitionend",

        function () {

            if (

                !popup.classList.contains(

                    "show"

                )

            ) {

                document.removeEventListener(

                    "keydown",

                    escapeHandler

                );

            }

        }

    );


    /* =====================================
       IMAGE ERROR HANDLING
    ====================================== */

    const popupImage =

        popup.querySelector(

            ".menu-popup-image"

        );


    if (popupImage) {

        popupImage.addEventListener(

            "error",

            function () {

                this.classList.add(

                    "image-error"

                );

            }

        );

    }


    /* =====================================
       FOCUS CLOSE BUTTON
    ====================================== */

    requestAnimationFrame(

        function () {

            if (closeButton) {

                closeButton.focus();

            }

        }

    );

}


/* =========================================
   INITIALIZE FOOD ITEM CLICK
========================================= */

function initializeFoodItemPopup() {


    /* =====================================
       GET ALL FOOD ITEMS
    ====================================== */

    const foodItems =

        document.querySelectorAll(

            ".food-item"

        );


    /* =====================================
       ADD CLICK EVENT
    ====================================== */

    foodItems.forEach(

        function (foodItem) {


            foodItem.addEventListener(

                "click",

                function () {

                    openMenuItemPopup(

                        this

                    );

                }

            );


            /* ===============================
               KEYBOARD ACCESSIBILITY
            ================================ */

            foodItem.setAttribute(

                "tabindex",

                "0"

            );


            foodItem.setAttribute(

                "role",

                "button"

            );


            foodItem.addEventListener(

                "keydown",

                function (event) {


                    if (

                        event.key ===

                        "Enter" ||

                        event.key ===

                        " "

                    ) {


                        event.preventDefault();


                        openMenuItemPopup(

                            this

                        );

                    }

                }

            );

        }

    );

}


/* =========================================
   INITIALIZE FOOD ITEMS
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializeFoodItemPopup();

    }

);


/* =========================================
   END MENU.JS PART 3/4
========================================= */
/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 4/4
   FINAL INITIALIZATION
   + POPUP SCROLL LOCK
   + NAVIGATION
   + IMAGE PRELOAD
   + FINAL CLEANUP
========================================= */


/* =========================================
   INITIALIZE MENU PAGE
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        /* =====================================
           INITIALIZE MENU IMAGES
        ====================================== */

        initializeMenuImages();


        /* =====================================
           INITIALIZE FOOD ITEM POPUPS
        ====================================== */

        initializeFoodItemPopup();


        /* =====================================
           PRELOAD MENU IMAGES
        ====================================== */

        preloadMenuImages();


        /* =====================================
           INITIALIZE BOTTOM NAVIGATION
        ====================================== */

        initializeBottomNavigation();


        /* =====================================
           MARK MENU PAGE AS READY
        ====================================== */

        document.body.classList.add(

            "menu-page-ready"

        );


        /* =====================================
           DISPATCH MENU READY EVENT
        ====================================== */

        document.dispatchEvent(

            new CustomEvent(

                "rioMenuReady"

            )

        );

    }

);


/* =========================================
   PRELOAD MENU IMAGES
========================================= */

function preloadMenuImages() {


    /* =====================================
       MENU CATEGORY IMAGE PATHS
    ====================================== */

    const imagePaths = [

        "images/menu/everyday-maggi.png",

        "images/menu/cheese-maggi.png",

        "images/menu/cheese-butter-maggi.png",

        "images/menu/ufo-burger.png",

        "images/menu/momos.png",

        "images/menu/soup.png",

        "images/menu/sweet-corn.png",

        "images/menu/chips-bhel.png",

        "images/menu/everyday-maggi-large.png",

        "images/menu/cheese-maggi-large.png",

        "images/menu/cheese-butter-maggi-large.png",

        "images/menu/ufo-burger-large.png",

        "images/menu/momos-large.png",

        "images/menu/soup-large.png",

        "images/menu/sweet-corn-large.png",

        "images/menu/chips-bhel-large.png"

    ];


    /* =====================================
       PRELOAD EACH IMAGE
    ====================================== */

    imagePaths.forEach(

        function (imagePath) {


            const image =

                new Image();


            image.src =

                imagePath;


        }

    );

}


/* =========================================
   BOTTOM NAVIGATION
========================================= */

function initializeBottomNavigation() {


    /* =====================================
       GET ALL NAVIGATION LINKS
    ====================================== */

    const navigationLinks =

        document.querySelectorAll(

            ".bottom-nav a"

        );


    /* =====================================
       SAFETY CHECK
    ====================================== */

    if (

        !navigationLinks.length

    ) {

        return;

    }


    /* =====================================
       GET CURRENT PAGE
    ====================================== */

    const currentPath =

        window.location.pathname;


    /* =====================================
       FIND CURRENT FILE
    ====================================== */

    const currentFile =

        currentPath

            .split("/")

            .pop()

            .toLowerCase();


    /* =====================================
       PROCESS NAVIGATION LINKS
    ====================================== */

    navigationLinks.forEach(

        function (link) {


            /* ===============================
               GET LINK TARGET
            ================================ */

            const href =

                link.getAttribute(

                    "href"

                );


            /* ===============================
               SAFETY CHECK
            ================================ */

            if (!href) {

                return;

            }


            /* ===============================
               GET LINK FILE
            ================================ */

            const linkFile =

                href

                    .split("/")

                    .pop()

                    .split("?")[0]

                    .split("#")[0]

                    .toLowerCase();


            /* ===============================
               REMOVE ACTIVE STATE
            ================================ */

            link.classList.remove(

                "active"

            );


            link.removeAttribute(

                "aria-current"

            );


            /* ===============================
               APPLY ACTIVE STATE
            ================================ */

            if (

                linkFile ===

                currentFile

            ) {


                link.classList.add(

                    "active"

                );


                link.setAttribute(

                    "aria-current",

                    "page"

                );

            }

        }

    );

}


/* =========================================
   POPUP SCROLL LOCK
========================================= */

document.addEventListener(

    "touchmove",

    function (event) {


        /* =====================================
           FIND OPEN POPUP
        ====================================== */

        const popup =

            document.querySelector(

                ".menu-item-popup.show"

            );


        /* =====================================
           NO POPUP
        ====================================== */

        if (!popup) {

            return;

        }


        /* =====================================
           CHECK POPUP CARD
        ====================================== */

        const popupCard =

            event.target.closest(

                ".menu-popup-card"

            );


        /* =====================================
           ALLOW TOUCH INSIDE POPUP
        ====================================== */

        if (popupCard) {

            return;

        }


        /* =====================================
           PREVENT BACKGROUND SCROLL
        ====================================== */

        event.preventDefault();

    },

    {

        passive:

            false

    }

);


/* =========================================
   POPUP ESCAPE KEY SAFETY
========================================= */

document.addEventListener(

    "keydown",

    function (event) {


        /* =====================================
           ONLY ESCAPE KEY
        ====================================== */

        if (

            event.key !==

            "Escape"

        ) {

            return;

        }


        /* =====================================
           FIND OPEN POPUP
        ====================================== */

        const popup =

            document.querySelector(

                ".menu-item-popup.show"

            );


        /* =====================================
           NO POPUP
        ====================================== */

        if (!popup) {

            return;

        }


        /* =====================================
           CLICK CLOSE BUTTON
        ====================================== */

        const closeButton =

            popup.querySelector(

                ".menu-popup-close"

            );


        if (closeButton) {

            closeButton.click();

        }

    }

);


/* =========================================
   POPUP BACKGROUND CLICK SAFETY
========================================= */

document.addEventListener(

    "click",

    function (event) {


        /* =====================================
           CHECK BACKDROP
        ====================================== */

        if (

            !event.target.classList.contains(

                "menu-popup-backdrop"

            )

        ) {

            return;

        }


        /* =====================================
           FIND POPUP
        ====================================== */

        const popup =

            event.target.closest(

                ".menu-item-popup"

            );


        /* =====================================
           FIND CLOSE BUTTON
        ====================================== */

        const closeButton =

            popup?.querySelector(

                ".menu-popup-close"

            );


        /* =====================================
           CLOSE POPUP
        ====================================== */

        if (closeButton) {

            closeButton.click();

        }

    }

);


/* =========================================
   POPUP BODY SCROLL STATE
========================================= */

const menuPopupScrollObserver =

    new MutationObserver(

        function () {


            /* =================================
               CHECK OPEN POPUP
            ================================== */

            const popup =

                document.querySelector(

                    ".menu-item-popup.show"

                );


            /* =================================
               APPLY BODY LOCK
            ================================== */

            document.body.classList.toggle(

                "menu-popup-open",

                Boolean(popup)

            );

        }

    );


/* =========================================
   START POPUP OBSERVER
========================================= */

if (

    document.body

) {

    menuPopupScrollObserver.observe(

        document.body,

        {

            childList:

                true,

            subtree:

                true

        }

    );

}


/* =========================================
   CLEANUP BEFORE PAGE LEAVE
========================================= */

window.addEventListener(

    "beforeunload",

    function () {


        /* =====================================
           REMOVE POPUP SCROLL LOCK
        ====================================== */

        document.body.classList.remove(

            "menu-popup-open"

        );


        /* =====================================
           REMOVE PAGE READY STATE
        ====================================== */

        document.body.classList.remove(

            "menu-page-ready"

        );

    }

);


/* =========================================
   FINAL MENU READY LOG
========================================= */

console.log(

    "Rio Maggi Point Menu JS Loaded Successfully"

);


/* =========================================
   END MENU.JS
   PART 4/4
   MENU.JS COMPLETE
========================================= */
