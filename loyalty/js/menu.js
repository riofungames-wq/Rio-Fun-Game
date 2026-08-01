/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 1/4
   MENU DATA + CORE INITIALIZATION
   CLEANED & OPTIMIZED VERSION
========================================= */


/* =========================================
   GLOBAL MENU DATA
========================================= */

const rioMenuData = {

    /* =================================
       01 EVERYDAY MAGIC MAGGI
    ================================== */

    "everyday-magic-maggi": {

        number: "01",

        title: "EVERYDAY MAGIC MAGGI",

        image:
            "images/menu/everyday-magic-maggi.png",

        items: [

            {
                name: "Classic",
                image:
                    "images/menu/items/classic-maggi.png",
                half: 30,
                full: 50
            },

            {
                name: "Veg",
                image:
                    "images/menu/items/veg-maggi.png",
                half: 40,
                full: 70
            },

            {
                name: "Garlic",
                image:
                    "images/menu/items/garlic-maggi.png",
                half: 40,
                full: 70
            },

            {
                name: "Corn",
                image:
                    "images/menu/items/corn-maggi.png",
                half: 40,
                full: 70
            },

            {
                name: "Schezwan",
                image:
                    "images/menu/items/schezwan-maggi.png",
                half: 40,
                full: 70
            },

            {
                name: "Veg Corn",
                image:
                    "images/menu/items/veg-corn-maggi.png",
                half: 50,
                full: 80
            },

            {
                name: "Veg Lemon",
                image:
                    "images/menu/items/veg-lemon-maggi.png",
                half: 80,
                full: 120
            },

            {
                name: "Korean",
                image:
                    "images/menu/items/korean-maggi.png",
                half: 100,
                full: 150
            }

        ]

    },


    /* =================================
       02 CHEESE MAGIC MAGGI
    ================================== */

    "cheese-magic-maggi": {

        number: "02",

        title: "CHEESE MAGIC MAGGI",

        image:
            "images/menu/cheese-magic-maggi.png",

        items: [

            {
                name: "Cheese Classic",
                image:
                    "images/menu/items/cheese-classic-maggi.png",
                half: 40,
                full: 70
            },

            {
                name: "Cheese Veg",
                image:
                    "images/menu/items/cheese-veg-maggi.png",
                half: 50,
                full: 80
            },

            {
                name: "Cheese Garlic",
                image:
                    "images/menu/items/cheese-garlic-maggi.png",
                half: 50,
                full: 80
            },

            {
                name: "Cheese Corn",
                image:
                    "images/menu/items/cheese-corn-maggi.png",
                half: 50,
                full: 80
            },

            {
                name: "Cheese Schezwan",
                image:
                    "images/menu/items/cheese-schezwan-maggi.png",
                half: 50,
                full: 80
            },

            {
                name: "Cheese Veg Corn",
                image:
                    "images/menu/items/cheese-veg-corn-maggi.png",
                half: 60,
                full: 100
            },

            {
                name: "Cheese Veg Schezwan",
                image:
                    "images/menu/items/cheese-veg-schezwan-maggi.png",
                half: 60,
                full: 100
            },

            {
                name: "Cheese Korean",
                image:
                    "images/menu/items/cheese-korean-maggi.png",
                half: 120,
                full: 180
            }

        ]

    },


    /* =================================
       03 CHEESE BUTTER MAGIC MAGGI
    ================================== */

    "cheese-butter-magic-maggi": {

        number: "03",

        title:
            "CHEESE BUTTER MAGIC MAGGI",

        image:
            "images/menu/cheese-butter-magic-maggi.png",

        items: [

            {
                name:
                    "Cheese Butter Classic",
                image:
                    "images/menu/items/cheese-butter-classic-maggi.png",
                half: 50,
                full: 80
            },

            {
                name:
                    "Cheese Butter Veg",
                image:
                    "images/menu/items/cheese-butter-veg-maggi.png",
                half: 60,
                full: 100
            },

            {
                name:
                    "Cheese Butter Garlic",
                image:
                    "images/menu/items/cheese-butter-garlic-maggi.png",
                half: 60,
                full: 100
            },

            {
                name:
                    "Cheese Butter Corn",
                image:
                    "images/menu/items/cheese-butter-corn-maggi.png",
                half: 60,
                full: 100
            },

            {
                name:
                    "Cheese Butter Schezwan",
                image:
                    "images/menu/items/cheese-butter-schezwan-maggi.png",
                half: 60,
                full: 100
            },

            {
                name:
                    "Cheese Butter Veg Corn",
                image:
                    "images/menu/items/cheese-butter-veg-corn-maggi.png",
                half: 70,
                full: 120
            },

            {
                name:
                    "Cheese Butter Veg Schezwan",
                image:
                    "images/menu/items/cheese-butter-veg-schezwan-maggi.png",
                half: 70,
                full: 120
            },

            {
                name:
                    "Cheese Butter Korean",
                image:
                    "images/menu/items/cheese-butter-korean-maggi.png",
                half: 130,
                full: 200
            }

        ]

    },


    /* =================================
       04 UFO BURGER
    ================================== */

    "ufo-burger": {

        number: "04",

        title:
            "UFO BURGER",

        image:
            "images/menu/ufo-burger.png",

        items: [

            {
                name:
                    "Veg Burger",
                image:
                    "images/menu/items/veg-burger.png",
                price: 40
            },

            {
                name:
                    "Cheese Burger",
                image:
                    "images/menu/items/cheese-burger.png",
                price: 40
            },

            {
                name:
                    "Veg Cheese Burger",
                image:
                    "images/menu/items/veg-cheese-burger.png",
                price: 50
            },

            {
                name:
                    "Cheese Garlic Burger",
                image:
                    "images/menu/items/cheese-garlic-burger.png",
                price: 50
            },

            {
                name:
                    "Schezwan Burger",
                image:
                    "images/menu/items/schezwan-burger.png",
                price: 50
            },

            {
                name:
                    "Cheese Schezwan Burger",
                image:
                    "images/menu/items/cheese-schezwan-burger.png",
                price: 60
            }

        ]

    },


    /* =================================
       05 DELICIOUS MOMOS
    ================================== */

    "delicious-momos": {

        number: "05",

        title:
            "DELICIOUS MOMOS",

        image:
            "images/menu/delicious-momos.png",

        items: [

            {
                name:
                    "Steam Momos",
                image:
                    "images/menu/items/steam-momos.png",
                price: 20
            },

            {
                name:
                    "Fried Momos",
                image:
                    "images/menu/items/fried-momos.png",
                price: 30
            },

            {
                name:
                    "Schezwan Momos",
                image:
                    "images/menu/items/schezwan-momos.png",
                price: 50
            },

            {
                name:
                    "Cheese Schezwan Momos",
                image:
                    "images/menu/items/cheese-schezwan-momos.png",
                price: 60
            }

        ]

    },


    /* =================================
       06 HOT SOUPS
    ================================== */

    "hot-soups": {

        number: "06",

        title:
            "HOT SOUPS",

        image:
            "images/menu/hot-soups.png",

        items: [

            {
                name:
                    "Corn Soup",
                image:
                    "images/menu/items/corn-soup.png",
                price: 40
            },

            {
                name:
                    "Tomato Soup",
                image:
                    "images/menu/items/tomato-soup.png",
                price: 40
            },

            {
                name:
                    "Chatpata Tomato",
                image:
                    "images/menu/items/chatpata-tomato.png",
                price: 40
            },

            {
                name:
                    "Magic Maggi Soup",
                image:
                    "images/menu/items/magic-maggi-soup.png",
                price: 50
            },

            {
                name:
                    "Manchow Soup",
                image:
                    "images/menu/items/manchow-soup.png",
                price: 50
            }

        ]

    },


    /* =================================
       07 CRISPY SWEET CORN
    ================================== */

    "crispy-sweet-corn": {

        number: "07",

        title:
            "CRISPY SWEET CORN",

        image:
            "images/menu/crispy-sweet-corn.png",

        items: [

            {
                name:
                    "Peri Peri Corn",
                image:
                    "images/menu/items/peri-peri-corn.png",
                price: 40
            },

            {
                name:
                    "Butter Corn",
                image:
                    "images/menu/items/butter-corn.png",
                price: 50
            },

            {
                name:
                    "Masala Corn",
                image:
                    "images/menu/items/masala-corn.png",
                price: 50
            },

            {
                name:
                    "Cheese Corn",
                image:
                    "images/menu/items/cheese-corn.png",
                price: 50
            },

            {
                name:
                    "Schezwan Corn",
                image:
                    "images/menu/items/schezwan-corn.png",
                price: 50
            },

            {
                name:
                    "Butter Cheese Corn",
                image:
                    "images/menu/items/butter-cheese-corn.png",
                price: 60
            }

        ]

    },


    /* =================================
       08 CHIPS BHEL
    ================================== */

    "chips-bhel": {

        number: "08",

        title:
            "CHIPS BHEL",

        image:
            "images/menu/chips-bhel.png",

        items: [

            {
                name:
                    "Chips Bhel",
                image:
                    "images/menu/items/chips-bhel.png",
                price: 50
            },

            {
                name:
                    "Kurkure Bhel",
                image:
                    "images/menu/items/kurkure-bhel.png",
                price: 50
            }

        ]

    }

};


/* =========================================
   MAKE MENU DATA AVAILABLE GLOBALLY
========================================= */

window.rioMenuData =
    rioMenuData;


/* =========================================
   MENU INITIALIZATION
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        /* =================================
           GET REQUIRED ELEMENTS
        ================================== */

        const categoryGrid =
            document.getElementById(
                "menuCategoryGrid"
            );


        const categoryDetailSection =
            document.getElementById(
                "categoryDetailSection"
            );


        /* =================================
           SAFETY CHECK
        ================================== */

        if (

            !categoryGrid ||

            !categoryDetailSection

        ) {

            console.warn(
                "Rio Menu: Required elements not found."
            );

            return;

        }


        /* =================================
           INITIAL CATEGORY STATE
        ================================== */

        categoryDetailSection.hidden =
            true;


        /* =================================
           INITIALIZE CATEGORY BUTTONS
        ================================== */

        initializeCategoryButtons(

            categoryGrid,

            categoryDetailSection

        );


        /* =================================
           INITIALIZE CATEGORY IMAGES
        ================================== */

        initializeCategoryImages();


        /* =================================
           INITIALIZE TOUCH FEEDBACK
        ================================== */

        initializeCategoryTouchFeedback();


        /* =================================
           INITIALIZE ACTIVE NAVIGATION
        ================================== */

        initializeActiveNavigation();


        /* =================================
           PRELOAD CATEGORY IMAGES
        ================================== */

        preloadCategoryImages();


        /* =================================
           MENU PAGE READY
        ================================== */

        document.body.classList.add(

            "menu-page-ready"

        );


        /* =================================
           DISPATCH MENU READY EVENT
        ================================== */

        document.dispatchEvent(

            new CustomEvent(

                "rioMenuReady"

            )

        );

    }

);


/* =========================================
   END MENU.JS PART 1/4
========================================= */
/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 2/4
   CATEGORY RENDERING + ITEM LIST
========================================= */


/* =========================================
   CATEGORY BUTTON INITIALIZATION
========================================= */

function initializeCategoryButtons(

    categoryGrid,

    categoryDetailSection

) {


    /* =====================================
       GET ALL CATEGORY CARDS
    ====================================== */

    const categoryButtons =
        categoryGrid.querySelectorAll(

            ".menu-category-card"

        );


    /* =====================================
       ADD CLICK EVENT TO EACH CATEGORY
    ====================================== */

    categoryButtons.forEach(

        function (categoryButton) {


            categoryButton.addEventListener(

                "click",

                function () {


                    /* =========================
                       GET CATEGORY ID
                    ========================== */

                    const categoryId =
                        this.dataset.category;


                    /* =========================
                       FIND CATEGORY DATA
                    ========================== */

                    const category =
                        rioMenuData[

                            categoryId

                        ];


                    /* =========================
                       SAFETY CHECK
                    ========================== */

                    if (!category) {

                        console.warn(

                            "Rio Menu: Category not found:",

                            categoryId

                        );

                        return;

                    }


                    /* =========================
                       RENDER SELECTED CATEGORY
                    ========================== */

                    renderCategory(

                        categoryId,

                        category,

                        categoryGrid,

                        categoryDetailSection

                    );

                }

            );

        }

    );

}


/* =========================================
   RENDER CATEGORY
========================================= */

function renderCategory(

    categoryId,

    category,

    categoryGrid,

    categoryDetailSection

) {


    /* =====================================
       CREATE ITEM HTML
    ====================================== */

    let itemsHTML =
        "";


    /* =====================================
       LOOP THROUGH CATEGORY ITEMS
    ====================================== */

    category.items.forEach(

        function (

            item,

            index

        ) {


            /* =================================
               CREATE PRICE HTML
            ================================== */

            const priceHTML =
                createItemPriceHTML(

                    item

                );


            /* =================================
               CREATE ITEM CARD
            ================================== */

            itemsHTML += `

                <button

                    type="button"

                    class="category-item-card"

                    data-category-id="${categoryId}"

                    data-item-index="${index}"

                >


                    <div

                        class="category-item-image-wrapper"

                    >


                        <img

                            src="${item.image}"

                            alt="${item.name}"

                            class="category-item-image"

                            loading="lazy"

                            onerror="this.classList.add('image-error')"

                        >


                    </div>


                    <div

                        class="category-item-info"

                    >


                        <h3>

                            ${item.name}

                        </h3>


                        ${priceHTML}


                    </div>


                </button>

            `;

        }

    );


    /* =====================================
       CREATE CATEGORY DETAIL HTML
    ====================================== */

    categoryDetailSection.innerHTML = `

        <div

            class="category-detail-header"

        >


            <div

                class="category-detail-icon"

            >


                <i

                    class="fa-solid fa-utensils"

                ></i>


            </div>


            <div

                class="category-detail-title"

            >


                <button

                    type="button"

                    class="back-category-btn"

                    id="backCategoryBtn"

                >


                    <i

                        class="fa-solid fa-arrow-left"

                    ></i>


                    Back to Menu


                </button>


                <h2>

                    ${category.title}

                </h2>


                <p>

                    Tap any item to view its image and details.

                </p>


            </div>


        </div>


        <div

            class="category-items-container"

        >


            ${itemsHTML}


        </div>

    `;


    /* =====================================
       HIDE CATEGORY GRID
    ====================================== */

    categoryGrid.style.display =
        "none";


    /* =====================================
       SHOW CATEGORY DETAIL SECTION
    ====================================== */

    categoryDetailSection.hidden =
        false;


    categoryDetailSection.classList.add(

        "category-detail-visible"

    );


    /* =====================================
       INITIALIZE ITEM CARDS
    ====================================== */

    initializeItemCards(

        categoryDetailSection,

        category

    );


    /* =====================================
       INITIALIZE BACK BUTTON
    ====================================== */

    initializeBackButton(

        categoryGrid,

        categoryDetailSection

    );


    /* =====================================
       SCROLL TO CATEGORY DETAIL
    ====================================== */

    requestAnimationFrame(

        function () {

            categoryDetailSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }

    );

}


/* =========================================
   CREATE ITEM PRICE HTML
========================================= */

function createItemPriceHTML(

    item

) {


    /* =====================================
       HALF + FULL PRICE
    ====================================== */

    if (

        item.half !== undefined &&

        item.full !== undefined

    ) {

        return `

            <div

                class="item-size-price"

            >


                <div>


                    <span>

                        Half

                    </span>


                    <strong>

                        ₹${item.half}

                    </strong>


                </div>


                <div>


                    <span>

                        Full

                    </span>


                    <strong>

                        ₹${item.full}

                    </strong>


                </div>


            </div>

        `;

    }


    /* =====================================
       SINGLE PRICE
    ====================================== */

    if (

        item.price !== undefined

    ) {

        return `

            <div

                class="single-item-price"

            >

                ₹${item.price}

            </div>

        `;

    }


    /* =====================================
       NO PRICE
    ====================================== */

    return "";

}


/* =========================================
   ITEM CARD INITIALIZATION
========================================= */

function initializeItemCards(

    categoryDetailSection,

    category

) {


    /* =====================================
       GET ALL ITEM CARDS
    ====================================== */

    const itemCards =
        categoryDetailSection.querySelectorAll(

            ".category-item-card"

        );


    /* =====================================
       ADD CLICK EVENT
    ====================================== */

    itemCards.forEach(

        function (itemCard) {


            itemCard.addEventListener(

                "click",

                function () {


                    /* =========================
                       GET ITEM INDEX
                    ========================== */

                    const itemIndex =
                        Number(

                            this.dataset.itemIndex

                        );


                    /* =========================
                       FIND SELECTED ITEM
                    ========================== */

                    const selectedItem =
                        category.items[

                            itemIndex

                        ];


                    /* =========================
                       SAFETY CHECK
                    ========================== */

                    if (!selectedItem) {

                        console.warn(

                            "Rio Menu: Item not found:",

                            itemIndex

                        );

                        return;

                    }


                    /* =========================
                       OPEN ITEM POPUP
                    ========================== */

                    openItemPopup(

                        selectedItem,

                        category

                    );

                }

            );

        }

    );

}


/* =========================================
   BACK TO MENU BUTTON
========================================= */

function initializeBackButton(

    categoryGrid,

    categoryDetailSection

) {


    /* =====================================
       GET BACK BUTTON
    ====================================== */

    const backButton =
        document.getElementById(

            "backCategoryBtn"

        );


    /* =====================================
       SAFETY CHECK
    ====================================== */

    if (!backButton) {

        return;

    }


    /* =====================================
       BACK BUTTON CLICK
    ====================================== */

    backButton.addEventListener(

        "click",

        function () {


            /* =========================
               HIDE CATEGORY DETAILS
            ========================== */

            categoryDetailSection.classList.remove(

                "category-detail-visible"

            );


            categoryDetailSection.hidden =
                true;


            /* =========================
               CLEAR DETAIL CONTENT
            ========================== */

            categoryDetailSection.innerHTML =
                "";


            /* =========================
               SHOW CATEGORY GRID
            ========================== */

            categoryGrid.style.display =
                "";


            /* =========================
               RETURN TO TOP
            ========================== */

            window.scrollTo({

                top:
                    0,

                behavior:
                    "smooth"

            });

        }

    );

}


/* =========================================
   END MENU.JS PART 2/4
========================================= */
/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 3/4
   ITEM POPUP + PRICE DISPLAY
========================================= */


/* =========================================
   OPEN ITEM POPUP
========================================= */

function openItemPopup(

    item,

    category

) {


    /* =====================================
       REMOVE ANY EXISTING POPUP
    ====================================== */

    const existingPopup =
        document.querySelector(

            ".menu-item-popup"

        );


    if (existingPopup) {

        existingPopup.remove();

    }


    /* =====================================
       CREATE PRICE HTML
    ====================================== */

    const priceHTML =
        createPopupPriceHTML(

            item

        );


    /* =====================================
       CREATE POPUP ELEMENT
    ====================================== */

    const popup =
        document.createElement(

            "div"

        );


    /* =====================================
       POPUP CLASS
    ====================================== */

    popup.className =
        "menu-item-popup";


    /* =====================================
       POPUP HTML
    ====================================== */

    popup.innerHTML = `

        <!-- ===============================
             POPUP BACKDROP
        ================================ -->

        <div

            class="menu-popup-backdrop"

            data-popup-close="true"

        ></div>


        <!-- ===============================
             POPUP CARD
        ================================ -->

        <div

            class="menu-popup-card"

            role="dialog"

            aria-modal="true"

            aria-label="${item.name}"

        >


            <!-- ===========================
                 CLOSE BUTTON
            ============================ -->

            <button

                type="button"

                class="menu-popup-close"

                aria-label="Close item details"

            >


                <i

                    class="fa-solid fa-xmark"

                ></i>


            </button>


            <!-- ===========================
                 ITEM IMAGE
            ============================ -->

            <div

                class="menu-popup-image-wrapper"

            >


                <img

                    src="${item.image}"

                    alt="${item.name}"

                    loading="eager"

                    onerror="this.classList.add('image-error')"

                >


            </div>


            <!-- ===========================
                 POPUP CONTENT
            ============================ -->

            <div

                class="menu-popup-content"

            >


                <span

                    class="menu-popup-category"

                >

                    ${category.title}

                </span>


                <h2>

                    ${item.name}

                </h2>


                ${priceHTML}


                <!-- =======================
                     DONE BUTTON
                ======================== -->

                <button

                    type="button"

                    class="menu-popup-done-btn"

                >


                    <i

                        class="fa-solid fa-check"

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


    const popupCard =
        popup.querySelector(

            ".menu-popup-card"

        );


    /* =====================================
       CLOSE POPUP FUNCTION
    ====================================== */

    function closePopup() {


        /* ================================
           PREVENT MULTIPLE CLOSE CALLS
        ================================= */

        if (

            popup.dataset.closing ===

            "true"

        ) {

            return;

        }


        popup.dataset.closing =
            "true";


        /* ================================
           REMOVE VISIBLE STATE
        ================================= */

        popup.classList.remove(

            "show"

        );


        /* ================================
           UNLOCK BODY SCROLL
        ================================= */

        document.body.classList.remove(

            "menu-popup-open"

        );


        /* ================================
           REMOVE ESCAPE LISTENER
        ================================= */

        document.removeEventListener(

            "keydown",

            escapeHandler

        );


        /* ================================
           REMOVE POPUP AFTER ANIMATION
        ================================= */

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
       CLOSE BUTTON EVENT
    ====================================== */

    if (closeButton) {

        closeButton.addEventListener(

            "click",

            closePopup

        );

    }


    /* =====================================
       DONE BUTTON EVENT
    ====================================== */

    if (doneButton) {

        doneButton.addEventListener(

            "click",

            closePopup

        );

    }


    /* =====================================
       BACKDROP CLICK EVENT
    ====================================== */

    if (backdrop) {

        backdrop.addEventListener(

            "click",

            closePopup

        );

    }


    /* =====================================
       ESCAPE KEY HANDLER
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


    /* =====================================
       ADD ESCAPE KEY LISTENER
    ====================================== */

    document.addEventListener(

        "keydown",

        escapeHandler

    );


    /* =====================================
       PREVENT POPUP CARD CLOSING
    ====================================== */

    if (popupCard) {

        popupCard.addEventListener(

            "click",

            function (event) {

                event.stopPropagation();

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
   CREATE POPUP PRICE HTML
========================================= */

function createPopupPriceHTML(

    item

) {


    /* =====================================
       HALF + FULL PRICE
    ====================================== */

    if (

        item.half !== undefined &&

        item.full !== undefined

    ) {

        return `

            <div

                class="menu-popup-price"

            >


                <div

                    class="popup-price-option"

                >


                    <span>

                        Half

                    </span>


                    <strong>

                        ₹${item.half}

                    </strong>


                </div>


                <div

                    class="popup-price-option"

                >


                    <span>

                        Full

                    </span>


                    <strong>

                        ₹${item.full}

                    </strong>


                </div>


            </div>

        `;

    }


    /* =====================================
       SINGLE PRICE
    ====================================== */

    if (

        item.price !== undefined

    ) {

        return `

            <div

                class="menu-popup-price"

            >


                <div

                    class="popup-price-single"

                >

                    ₹${item.price}

                </div>


            </div>

        `;

    }


    /* =====================================
       NO PRICE
    ====================================== */

    return "";

}


/* =========================================
   END MENU.JS PART 3/4
========================================= */
/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 4/4
   FINAL INITIALIZATION + IMAGE HANDLING
   + NAVIGATION + POPUP SCROLL LOCK
========================================= */


/* =========================================
   MENU DOM INITIALIZATION
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        /* =====================================
           GET MENU ELEMENTS
        ====================================== */

        const categoryGrid =
            document.getElementById(

                "menuCategoryGrid"

            );


        const categoryDetailSection =
            document.getElementById(

                "categoryDetailSection"

            );


        /* =====================================
           SAFETY CHECK
        ====================================== */

        if (

            !categoryGrid ||

            !categoryDetailSection

        ) {

            console.warn(

                "Rio Menu: Required menu elements not found."

            );

            return;

        }


        /* =====================================
           INITIAL CATEGORY DETAIL STATE
        ====================================== */

        categoryDetailSection.hidden =
            true;


        categoryDetailSection.classList.remove(

            "category-detail-visible"

        );


        /* =====================================
           INITIALIZE CATEGORY BUTTONS
        ====================================== */

        initializeCategoryButtons(

            categoryGrid,

            categoryDetailSection

        );


        /* =====================================
           CATEGORY IMAGE HANDLING
        ====================================== */

        initializeCategoryImages();


        /* =====================================
           CATEGORY CARD TOUCH FEEDBACK
        ====================================== */

        initializeCategoryTouchFeedback();


        /* =====================================
           ACTIVE MENU NAVIGATION
        ====================================== */

        initializeActiveMenuNavigation();


        /* =====================================
           PRELOAD CATEGORY IMAGES
        ====================================== */

        preloadCategoryImages();


        /* =====================================
           MENU PAGE READY CLASS
        ====================================== */

        document.body.classList.add(

            "menu-page-ready"

        );


        /* =====================================
           MENU READY CUSTOM EVENT
        ====================================== */

        document.dispatchEvent(

            new CustomEvent(

                "rioMenuReady"

            )

        );


    }

);


/* =========================================
   CATEGORY IMAGE INITIALIZATION
========================================= */

function initializeCategoryImages() {


    /* =====================================
       GET CATEGORY IMAGES
    ====================================== */

    const categoryImages =
        document.querySelectorAll(

            ".menu-category-image"

        );


    /* =====================================
       IMAGE EVENTS
    ====================================== */

    categoryImages.forEach(

        function (image) {


            /* ===============================
               IMAGE ERROR
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
               IMAGE LOADED
            ================================ */

            image.addEventListener(

                "load",

                function () {

                    this.classList.add(

                        "image-loaded"

                    );

                }

            );


        }

    );

}


/* =========================================
   CATEGORY TOUCH FEEDBACK
========================================= */

function initializeCategoryTouchFeedback() {


    /* =====================================
       GET CATEGORY CARDS
    ====================================== */

    const categoryCards =
        document.querySelectorAll(

            ".menu-category-card"

        );


    /* =====================================
       ADD TOUCH EVENTS
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


        }

    );

}


/* =========================================
   ACTIVE MENU NAVIGATION
========================================= */

function initializeActiveMenuNavigation() {


    /* =====================================
       CURRENT PAGE
    ====================================== */

    const currentPage =
        window.location.pathname;


    /* =====================================
       GET NAVIGATION ITEMS
    ====================================== */

    const navigationItems =
        document.querySelectorAll(

            ".bottom-nav .nav-item"

        );


    /* =====================================
       LOOP NAVIGATION
    ====================================== */

    navigationItems.forEach(

        function (navItem) {


            const link =
                navItem.getAttribute(

                    "href"

                );


            /* ===============================
               SAFETY CHECK
            ================================ */

            if (!link) {

                return;

            }


            /* ===============================
               MENU ACTIVE STATE
            ================================ */

            if (

                currentPage.endsWith(

                    "menu.html"

                ) &&

                link ===

                    "menu.html"

            ) {


                navItem.classList.add(

                    "active",

                    "menu-active"

                );


                navItem.setAttribute(

                    "aria-current",

                    "page"

                );


            }


        }

    );

}


/* =========================================
   PRELOAD CATEGORY IMAGES
========================================= */

function preloadCategoryImages() {


    /* =====================================
       CATEGORY IMAGE PATHS
    ====================================== */

    const preloadImages = [

        "images/menu/everyday-magic-maggi.png",

        "images/menu/cheese-magic-maggi.png",

        "images/menu/cheese-butter-magic-maggi.png",

        "images/menu/ufo-burger.png",

        "images/menu/delicious-momos.png",

        "images/menu/hot-soups.png",

        "images/menu/crispy-sweet-corn.png",

        "images/menu/chips-bhel.png"

    ];


    /* =====================================
       PRELOAD EACH IMAGE
    ====================================== */

    preloadImages.forEach(

        function (imagePath) {


            const image =
                new Image();


            image.src =
                imagePath;


        }

    );

}


/* =========================================
   POPUP SCROLL LOCK OBSERVER
========================================= */

const menuPopupObserver =

    new MutationObserver(

        function () {


            /* =================================
               CHECK POPUP
            ================================== */

            const popup =
                document.querySelector(

                    ".menu-item-popup"

                );


            /* =================================
               APPLY BODY SCROLL LOCK
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

    menuPopupObserver.observe(

        document.body,

        {

            childList:
                true

        }

    );

}


/* =========================================
   PREVENT BACKGROUND TOUCH SCROLL
========================================= */

document.addEventListener(

    "touchmove",

    function (event) {


        /* =====================================
           FIND OPEN POPUP
        ====================================== */

        const popup =
            document.querySelector(

                ".menu-item-popup"

            );


        /* =====================================
           NO POPUP = NORMAL SCROLL
        ====================================== */

        if (!popup) {

            return;

        }


        /* =====================================
           ALLOW SCROLL INSIDE POPUP CARD
        ====================================== */

        if (

            event.target.closest(

                ".menu-popup-card"

            )

        ) {

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
   BEFORE UNLOAD CLEANUP
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
           REMOVE MENU READY CLASS
        ====================================== */

        document.body.classList.remove(

            "menu-page-ready"

        );


    }

);


/* =========================================
   END MENU.JS
   PART 4/4
   MENU.JS COMPLETE
========================================= */
