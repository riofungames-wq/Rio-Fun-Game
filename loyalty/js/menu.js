/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 1/4
   MENU DATA + CATEGORY CONFIGURATION
========================================= */


/* =========================================
   DOM READY
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        /* =====================================
           MENU CATEGORY DATA
        ====================================== */

        const menuData = {


            /* =================================
               01 EVERYDAY MAGIC MAGGI
            ================================== */

            "everyday-magic-maggi": {

                number:
                    "01",

                title:
                    "EVERYDAY MAGIC MAGGI",

                image:
                    "images/menu/everyday-magic-maggi.png",

                items: [

                    {
                        name:
                            "Classic",

                        image:
                            "images/menu/items/classic-maggi.png",

                        half:
                            30,

                        full:
                            50
                    },

                    {
                        name:
                            "Veg",

                        image:
                            "images/menu/items/veg-maggi.png",

                        half:
                            40,

                        full:
                            70
                    },

                    {
                        name:
                            "Garlic",

                        image:
                            "images/menu/items/garlic-maggi.png",

                        half:
                            40,

                        full:
                            70
                    },

                    {
                        name:
                            "Corn",

                        image:
                            "images/menu/items/corn-maggi.png",

                        half:
                            40,

                        full:
                            70
                    },

                    {
                        name:
                            "Schezwan",

                        image:
                            "images/menu/items/schezwan-maggi.png",

                        half:
                            40,

                        full:
                            70
                    },

                    {
                        name:
                            "Veg Corn",

                        image:
                            "images/menu/items/veg-corn-maggi.png",

                        half:
                            50,

                        full:
                            80
                    },

                    {
                        name:
                            "Veg Lemon",

                        image:
                            "images/menu/items/veg-lemon-maggi.png",

                        half:
                            80,

                        full:
                            120
                    },

                    {
                        name:
                            "Korean",

                        image:
                            "images/menu/items/korean-maggi.png",

                        half:
                            100,

                        full:
                            150
                    }

                ]

            },


            /* =================================
               02 CHEESE MAGIC MAGGI
            ================================== */

            "cheese-magic-maggi": {

                number:
                    "02",

                title:
                    "CHEESE MAGIC MAGGI",

                image:
                    "images/menu/cheese-magic-maggi.png",

                items: [

                    {
                        name:
                            "Cheese Classic",

                        image:
                            "images/menu/items/cheese-classic-maggi.png",

                        half:
                            40,

                        full:
                            70
                    },

                    {
                        name:
                            "Cheese Veg",

                        image:
                            "images/menu/items/cheese-veg-maggi.png",

                        half:
                            50,

                        full:
                            80
                    },

                    {
                        name:
                            "Cheese Garlic",

                        image:
                            "images/menu/items/cheese-garlic-maggi.png",

                        half:
                            50,

                        full:
                            80
                    },

                    {
                        name:
                            "Cheese Corn",

                        image:
                            "images/menu/items/cheese-corn-maggi.png",

                        half:
                            50,

                        full:
                            80
                    },

                    {
                        name:
                            "Cheese Schezwan",

                        image:
                            "images/menu/items/cheese-schezwan-maggi.png",

                        half:
                            50,

                        full:
                            80
                    },

                    {
                        name:
                            "Cheese Veg Corn",

                        image:
                            "images/menu/items/cheese-veg-corn-maggi.png",

                        half:
                            60,

                        full:
                            100
                    },

                    {
                        name:
                            "Cheese Veg Schezwan",

                        image:
                            "images/menu/items/cheese-veg-schezwan-maggi.png",

                        half:
                            60,

                        full:
                            100
                    },

                    {
                        name:
                            "Cheese Korean",

                        image:
                            "images/menu/items/cheese-korean-maggi.png",

                        half:
                            120,

                        full:
                            180
                    }

                ]

            },


            /* =================================
               03 CHEESE BUTTER MAGIC MAGGI
            ================================== */

            "cheese-butter-magic-maggi": {

                number:
                    "03",

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

                        half:
                            50,

                        full:
                            80
                    },

                    {
                        name:
                            "Cheese Butter Veg",

                        image:
                            "images/menu/items/cheese-butter-veg-maggi.png",

                        half:
                            60,

                        full:
                            100
                    },

                    {
                        name:
                            "Cheese Butter Garlic",

                        image:
                            "images/menu/items/cheese-butter-garlic-maggi.png",

                        half:
                            60,

                        full:
                            100
                    },

                    {
                        name:
                            "Cheese Butter Corn",

                        image:
                            "images/menu/items/cheese-butter-corn-maggi.png",

                        half:
                            60,

                        full:
                            100
                    },

                    {
                        name:
                            "Cheese Butter Schezwan",

                        image:
                            "images/menu/items/cheese-butter-schezwan-maggi.png",

                        half:
                            60,

                        full:
                            100
                    },

                    {
                        name:
                            "Cheese Butter Veg Corn",

                        image:
                            "images/menu/items/cheese-butter-veg-corn-maggi.png",

                        half:
                            70,

                        full:
                            120
                    },

                    {
                        name:
                            "Cheese Butter Veg Schezwan",

                        image:
                            "images/menu/items/cheese-butter-veg-schezwan-maggi.png",

                        half:
                            70,

                        full:
                            120
                    },

                    {
                        name:
                            "Cheese Butter Korean",

                        image:
                            "images/menu/items/cheese-butter-korean-maggi.png",

                        half:
                            130,

                        full:
                            200
                    }

                ]

            },


            /* =================================
               04 UFO BURGER
            ================================== */

            "ufo-burger": {

                number:
                    "04",

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

                        price:
                            40
                    },

                    {
                        name:
                            "Cheese Burger",

                        image:
                            "images/menu/items/cheese-burger.png",

                        price:
                            40
                    },

                    {
                        name:
                            "Veg Cheese Burger",

                        image:
                            "images/menu/items/veg-cheese-burger.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Cheese Garlic Burger",

                        image:
                            "images/menu/items/cheese-garlic-burger.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Schezwan Burger",

                        image:
                            "images/menu/items/schezwan-burger.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Cheese Schezwan Burger",

                        image:
                            "images/menu/items/cheese-schezwan-burger.png",

                        price:
                            60
                    }

                ]

            },


            /* =================================
               05 DELICIOUS MOMOS
            ================================== */

            "delicious-momos": {

                number:
                    "05",

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

                        price:
                            20
                    },

                    {
                        name:
                            "Fried Momos",

                        image:
                            "images/menu/items/fried-momos.png",

                        price:
                            30
                    },

                    {
                        name:
                            "Schezwan Momos",

                        image:
                            "images/menu/items/schezwan-momos.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Cheese Schezwan Momos",

                        image:
                            "images/menu/items/cheese-schezwan-momos.png",

                        price:
                            60
                    }

                ]

            },


            /* =================================
               06 HOT SOUPS
            ================================== */

            "hot-soups": {

                number:
                    "06",

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

                        price:
                            40
                    },

                    {
                        name:
                            "Tomato Soup",

                        image:
                            "images/menu/items/tomato-soup.png",

                        price:
                            40
                    },

                    {
                        name:
                            "Chatpata Tomato",

                        image:
                            "images/menu/items/chatpata-tomato.png",

                        price:
                            40
                    },

                    {
                        name:
                            "Magic Maggi Soup",

                        image:
                            "images/menu/items/magic-maggi-soup.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Manchow Soup",

                        image:
                            "images/menu/items/manchow-soup.png",

                        price:
                            50
                    }

                ]

            },


            /* =================================
               07 CRISPY SWEET CORN
            ================================== */

            "crispy-sweet-corn": {

                number:
                    "07",

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

                        price:
                            40
                    },

                    {
                        name:
                            "Butter Corn",

                        image:
                            "images/menu/items/butter-corn.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Masala Corn",

                        image:
                            "images/menu/items/masala-corn.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Cheese Corn",

                        image:
                            "images/menu/items/cheese-corn.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Schezwan Corn",

                        image:
                            "images/menu/items/schezwan-corn.png",

                        price:
                            50
                    },

                    {
                        name:
                            "Butter Cheese Corn",

                        image:
                            "images/menu/items/butter-cheese-corn.png",

                        price:
                            60
                    }

                ]

            },


            /* =================================
               08 CHIPS BHEL
            ================================== */

            "chips-bhel": {

                number:
                    "08",

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

                        price:
                            50
                    },

                    {
                        name:
                            "Kurkure Bhel",

                        image:
                            "images/menu/items/kurkure-bhel.png",

                        price:
                            50
                    }

                ]

            }


        };


        /* =====================================
           SAVE DATA FOR NEXT PARTS
        ====================================== */

        window.rioMenuData =
            menuData;


    }

);


/* =========================================
   END MENU.JS PART 1/4
========================================= */
/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 2/4
   CATEGORY CLICK + ITEM LIST RENDERING
========================================= */


/* =========================================
   MENU CATEGORY LOGIC
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        /* =====================================
           GET MENU DATA
        ====================================== */

        const menuData =
            window.rioMenuData;


        /* =====================================
           GET ELEMENTS
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

            !categoryDetailSection ||

            !menuData

        ) {

            console.warn(

                "Rio Menu: Required elements not found."

            );

            return;

        }


        /* =====================================
           GET ALL CATEGORY BUTTONS
        ====================================== */

        const categoryButtons =
            categoryGrid.querySelectorAll(

                ".menu-category-card"

            );


        /* =====================================
           CATEGORY CLICK
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
                            menuData[
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
                           RENDER CATEGORY
                        ========================== */

                        renderCategory(

                            categoryId,

                            category

                        );


                    }

                );


            }

        );


        /* =====================================
           RENDER CATEGORY FUNCTION
        ====================================== */

        function renderCategory(

            categoryId,

            category

        ) {


            /* =================================
               CREATE ITEM HTML
            ================================== */

            let itemsHTML =
                "";


            category.items.forEach(

                function (

                    item,

                    index

                ) {


                    /* =========================
                       PRICE HTML
                    ========================== */

                    let priceHTML =
                        "";


                    /* =========================
                       HALF + FULL PRICE
                    ========================== */

                    if (

                        item.half !== undefined &&

                        item.full !== undefined

                    ) {


                        priceHTML = `

                            <div class="item-size-price">

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


                    /* =========================
                       SINGLE PRICE
                    ========================== */

                    else if (

                        item.price !== undefined

                    ) {


                        priceHTML = `

                            <div class="single-item-price">

                                ₹${item.price}

                            </div>

                        `;


                    }


                    /* =========================
                       ITEM CARD
                    ========================== */

                    itemsHTML += `

                        <button

                            type="button"

                            class="category-item-card"

                            data-category-id="${categoryId}"

                            data-item-index="${index}"

                        >


                            <div class="category-item-image-wrapper">


                                <img

                                    src="${item.image}"

                                    alt="${item.name}"

                                    class="category-item-image"

                                    loading="lazy"

                                    onerror="this.classList.add('image-error')"

                                >


                            </div>


                            <div class="category-item-info">


                                <h3>

                                    ${item.name}

                                </h3>


                                ${priceHTML}


                            </div>


                        </button>

                    `;


                }

            );


            /* =================================
               CATEGORY DETAIL HTML
            ================================== */

            categoryDetailSection.innerHTML = `

                <div class="category-detail-header">


                    <div class="category-detail-icon">


                        <i class="fa-solid fa-utensils"></i>


                    </div>


                    <div class="category-detail-title">


                        <button

                            type="button"

                            class="back-category-btn"

                            id="backCategoryBtn"

                        >

                            <i class="fa-solid fa-arrow-left"></i>

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


                <div class="category-items-container">


                    ${itemsHTML}


                </div>


            `;


            /* =================================
               HIDE CATEGORY GRID
            ================================== */

            categoryGrid.style.display =
                "none";


            /* =================================
               SHOW CATEGORY DETAILS
            ================================== */

            categoryDetailSection.hidden =
                false;


            categoryDetailSection.classList.add(

                "category-detail-visible"

            );


            /* =================================
               SCROLL TO CATEGORY
            ================================== */

            categoryDetailSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });


            /* =================================
               ADD ITEM CLICK EVENTS
            ================================== */

            const itemCards =
                categoryDetailSection.querySelectorAll(

                    ".category-item-card"

                );


            itemCards.forEach(

                function (itemCard) {


                    itemCard.addEventListener(

                        "click",

                        function () {


                            const itemIndex =
                                Number(

                                    this.dataset.itemIndex

                                );


                            const selectedItem =
                                category.items[
                                    itemIndex
                                ];


                            if (!selectedItem) {

                                return;

                            }


                            /* =====================
                               OPEN ITEM POPUP
                            ====================== */

                            openItemPopup(

                                selectedItem,

                                category

                            );


                        }

                    );


                }

            );


            /* =================================
               BACK BUTTON
            ================================== */

            const backButton =
                document.getElementById(

                    "backCategoryBtn"

                );


            if (backButton) {


                backButton.addEventListener(

                    "click",

                    function () {


                        categoryDetailSection.classList.remove(

                            "category-detail-visible"

                        );


                        categoryDetailSection.hidden =
                            true;


                        categoryDetailSection.innerHTML =
                            "";


                        categoryGrid.style.display =
                            "";


                        window.scrollTo({

                            top:
                                0,

                            behavior:
                                "smooth"

                        });


                    }

                );


            }


        }


        /* =====================================
           INITIAL STATE
        ====================================== */

        categoryDetailSection.hidden =
            true;


    }

);


/* =========================================
   END MENU.JS PART 2/4
========================================= */
/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 3/4
   ITEM PNG POPUP + PRICE DISPLAY
========================================= */


/* =========================================
   ITEM POPUP FUNCTION
========================================= */

function openItemPopup(

    item,

    category

) {


    /* =====================================
       REMOVE OLD POPUP
    ====================================== */

    const oldPopup =
        document.querySelector(

            ".menu-item-popup"

        );


    if (oldPopup) {

        oldPopup.remove();

    }


    /* =====================================
       CREATE PRICE HTML
    ====================================== */

    let priceHTML =
        "";


    /* =====================================
       HALF + FULL PRICE
    ====================================== */

    if (

        item.half !== undefined &&

        item.full !== undefined

    ) {


        priceHTML = `

            <div class="menu-popup-price">


                <div class="popup-price-option">


                    <span>

                        Half

                    </span>


                    <strong>

                        ₹${item.half}

                    </strong>


                </div>


                <div class="popup-price-option">


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

    else if (

        item.price !== undefined

    ) {


        priceHTML = `

            <div class="menu-popup-price">


                <div class="popup-price-single">

                    ₹${item.price}

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

                <i class="fa-solid fa-xmark"></i>

            </button>



            <!-- ===========================
                 ITEM IMAGE
            ============================ -->

            <div class="menu-popup-image-wrapper">


                <img

                    src="${item.image}"

                    alt="${item.name}"

                    onerror="this.classList.add('image-error')"

                >


            </div>



            <!-- ===========================
                 POPUP CONTENT
            ============================ -->

            <div class="menu-popup-content">


                <span class="menu-popup-category">


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


                    <i class="fa-solid fa-check"></i>


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


        popup.classList.remove(

            "show"

        );


        document.body.classList.remove(

            "menu-popup-open"

        );


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


        document.removeEventListener(

            "keydown",

            escapeHandler

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
       PREVENT CARD CLICK PROPAGATION
    ====================================== */

    const popupCard =
        popup.querySelector(

            ".menu-popup-card"

        );


    if (popupCard) {


        popupCard.addEventListener(

            "click",

            function (

                event

            ) {


                event.stopPropagation();


            }

        );


    }


}


/* =========================================
   END MENU.JS PART 3/4
========================================= */
/* =========================================
   RIO MAGGI POINT
   MENU.JS
   PART 4/4
   FINAL POLISH + IMAGE HANDLING + CLEANUP
========================================= */


/* =========================================
   DOM READY
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    function () {


        /* =====================================
           CATEGORY IMAGE ERROR HANDLING
        ====================================== */

        const categoryImages =
            document.querySelectorAll(

                ".menu-category-image"

            );


        categoryImages.forEach(

            function (image) {


                image.addEventListener(

                    "error",

                    function () {


                        this.classList.add(

                            "image-error"

                        );


                    }

                );


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


        /* =====================================
           CATEGORY CARD TOUCH FEEDBACK
        ====================================== */

        const categoryCards =
            document.querySelectorAll(

                ".menu-category-card"

            );


        categoryCards.forEach(

            function (card) {


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


        /* =====================================
           ACTIVE MENU NAVIGATION
        ====================================== */

        const currentPage =
            window.location.pathname;


        const navigationItems =
            document.querySelectorAll(

                ".bottom-nav .nav-item"

            );


        navigationItems.forEach(

            function (navItem) {


                const link =
                    navItem.getAttribute(

                        "href"

                    );


                if (!link) {

                    return;

                }


                if (

                    currentPage.endsWith(

                        "menu.html"

                    )

                &&

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


        /* =====================================
           POPUP SCROLL LOCK
        ====================================== */

        const popupStyleObserver =
            new MutationObserver(

                function () {


                    const popup =
                        document.querySelector(

                            ".menu-item-popup"

                        );


                    if (popup) {


                        document.body.classList.add(

                            "menu-popup-open"

                        );


                    }

                    else {


                        document.body.classList.remove(

                            "menu-popup-open"

                        );


                    }


                }

            );


        popupStyleObserver.observe(

            document.body,

            {

                childList:
                    true

            }

        );


        /* =====================================
           PREVENT BACKGROUND SCROLL
           WHILE POPUP IS OPEN
        ====================================== */

        document.addEventListener(

            "touchmove",

            function (

                event

            ) {


                const popup =
                    document.querySelector(

                        ".menu-item-popup"

                    );


                if (

                    popup &&

                    !event.target.closest(

                        ".menu-popup-card"

                    )

                ) {


                    event.preventDefault();


                }


            },

            {

                passive:
                    false

            }

        );


        /* =====================================
           ESCAPE KEY SAFETY
        ====================================== */

        document.addEventListener(

            "keydown",

            function (

                event

            ) {


                if (

                    event.key !==

                    "Escape"

                ) {


                    return;

                }


                const popup =
                    document.querySelector(

                        ".menu-item-popup"

                    );


                if (!popup) {

                    return;

                }


                const closeButton =
                    popup.querySelector(

                        ".menu-popup-close"

                    );


                if (closeButton) {


                    closeButton.click();


                }


            }

        );


        /* =====================================
           PRELOAD CATEGORY IMAGES
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


        preloadImages.forEach(

            function (

                imagePath

            ) {


                const image =
                    new Image();


                image.src =
                    imagePath;


            }

        );


        /* =====================================
           FINAL MENU INITIALIZATION
        ====================================== */

        document.body.classList.add(

            "menu-page-ready"

        );


        /* =====================================
           MENU READY EVENT
        ====================================== */

        document.dispatchEvent(

            new CustomEvent(

                "rioMenuReady"

            )

        );


    }

);


/* =========================================
   FINAL CLEANUP
========================================= */

window.addEventListener(

    "beforeunload",

    function () {


        document.body.classList.remove(

            "menu-popup-open"

        );


    }

);


/* =========================================
   END MENU.JS PART 4/4
   MENU.JS COMPLETE
========================================= */
