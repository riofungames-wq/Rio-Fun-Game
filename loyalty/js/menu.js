// ======================================================
// RIO MAGGI POINT
// menu.js
// PART 1 / 4
// Premium Menu System
// ======================================================

"use strict";

// ======================================================
// DOM CACHE
// ======================================================

const categoryGrid =
document.getElementById("categoryGrid");

const categoryCards =
document.querySelectorAll(".menu-category-card");

const detailContainer =
document.getElementById("menuDetailContainer");

const heroSlider =
document.getElementById("heroSlider");

const heroSlides =
document.querySelectorAll(".hero-slide");

const floatingCards =
document.querySelectorAll(".menu-category-card");


// ======================================================
// GLOBAL STATE
// ======================================================

const MenuState = {

    currentCategory: null,

    currentSlide: 0,

    sliderTimer: null,

    initialized: false

};


// ======================================================
// MENU DATA
// ======================================================

const MENU_DATA = {

    everyday: {

        title: "Everyday Magic Maggi",

        subtitle: "Classic Rio Maggi Collection"

    },

    cheese: {

        title: "Cheese Magic Maggi",

        subtitle: "Cheesy Rio Special Collection"

    },

    cheeseButter: {

        title: "Cheese Butter Magic Maggi",

        subtitle: "Premium Cheese Butter Collection"

    },

    burger: {

        title: "UFO Burger",

        subtitle: "Premium Burger Collection"

    },

    momos: {

        title: "Delicious Momos",

        subtitle: "Hot & Tasty Momos"

    },

    soups: {

        title: "Hot Soups",

        subtitle: "Soup Collection"

    },

    corn: {

        title: "Crispy Sweet Corn",

        subtitle: "Crunchy Corn Collection"

    },

    bhel: {

        title: "Chips Bhel",

        subtitle: "Snack Collection"

    }

};


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(

    "DOMContentLoaded",

    initializeMenu

);


// ======================================================
// MAIN INITIALIZER
// ======================================================

function initializeMenu() {

    if (MenuState.initialized) return;

    MenuState.initialized = true;

    setupCategoryButtons();

    setupHeroSlider();

    setupCardAnimations();

    console.log("✅ MENU.JS PART 1 LOADED");

}
// ======================================================
// PART 2 / 4
// CATEGORY CLICK SYSTEM
// ======================================================


// ======================================================
// CATEGORY BUTTON EVENTS
// ======================================================

function setupCategoryButtons() {

    if (!categoryCards.length) return;

    categoryCards.forEach((card) => {

        card.addEventListener("click", () => {

            const target = card.dataset.target;

            if (!target) return;

            openCategory(target);

        });

    });

}



// ======================================================
// OPEN CATEGORY
// ======================================================

function openCategory(categoryName) {

    if (!MENU_DATA[categoryName]) return;

    MenuState.currentCategory = categoryName;

    updateActiveCard(categoryName);

    renderCategory(categoryName);

    scrollToDetail();

}



// ======================================================
// ACTIVE CARD
// ======================================================

function updateActiveCard(categoryName) {

    categoryCards.forEach((card) => {

        if (card.dataset.target === categoryName) {

            card.classList.add("active");

        } else {

            card.classList.remove("active");

        }

    });

}



// ======================================================
// DETAIL SECTION RENDER
// ======================================================

function renderCategory(categoryName) {

    if (!detailContainer) return;

    const menu = MENU_DATA[categoryName];

    detailContainer.innerHTML = `

<section class="menu-detail-card">

    <div class="menu-detail-header">

        <h2>${menu.title}</h2>

        <p>${menu.subtitle}</p>

    </div>

    <div id="menuTableArea"></div>

</section>

`;

    renderMenuTable(categoryName);

}



// ======================================================
// SMOOTH SCROLL
// ======================================================

function scrollToDetail() {

    if (!detailContainer) return;

    detailContainer.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}



// ======================================================
// MENU TABLE PLACEHOLDER
// ======================================================

function renderMenuTable(categoryName) {

    const area = document.getElementById("menuTableArea");

    if (!area) return;

    area.innerHTML = `

<div class="menu-loading">

    <i class="fa-solid fa-spinner fa-spin"></i>

    <span>Loading Menu...</span>

</div>

`;

    requestAnimationFrame(() => {

        loadMenuItems(categoryName);

    });

}



// ======================================================
// MENU ITEMS LOADER
// ======================================================

function loadMenuItems(categoryName) {

    const area = document.getElementById("menuTableArea");

    if (!area) return;

    area.innerHTML = "";

    // Part 3 में सभी Menu Tables आएँगी

}
// ======================================================
// PART 3 / 4
// MENU ITEMS DATABASE
// ======================================================

const MENU_ITEMS = {

    everyday: [
        ["Classic","₹30","₹50"],
        ["Veg","₹40","₹70"],
        ["Garlic","₹40","₹70"],
        ["Corn","₹40","₹70"],
        ["Schezwan","₹40","₹70"],
        ["Veg Corn","₹50","₹80"],
        ["Veg Lemon","₹80","₹120"],
        ["Korean","₹100","₹150"]
    ],

    cheese: [
        ["Cheese Classic","₹40","₹70"],
        ["Cheese Veg","₹50","₹80"],
        ["Cheese Garlic","₹50","₹80"],
        ["Cheese Corn","₹50","₹80"],
        ["Cheese Schezwan","₹50","₹80"],
        ["Cheese Veg Corn","₹60","₹100"],
        ["Cheese Veg Schezwan","₹60","₹100"],
        ["Cheese Korean","₹120","₹180"]
    ],

    cheeseButter: [
        ["Cheese Butter Classic","₹50","₹80"],
        ["Cheese Butter Veg","₹60","₹100"],
        ["Cheese Butter Garlic","₹60","₹100"],
        ["Cheese Butter Corn","₹60","₹100"],
        ["Cheese Butter Schezwan","₹60","₹100"],
        ["Cheese Butter Veg Corn","₹70","₹120"],
        ["Cheese Butter Veg Schezwan","₹70","₹120"],
        ["Cheese Butter Korean","₹130","₹200"]
    ],

    burger: [
        ["Veg Burger","₹40"],
        ["Cheese Burger","₹40"],
        ["Veg Cheese Burger","₹50"],
        ["Cheese Garlic Burger","₹50"],
        ["Schezwan Burger","₹50"],
        ["Cheese Schezwan Burger","₹60"]
    ],

    momos: [
        ["Steam Momos","₹20"],
        ["Fried Momos","₹30"],
        ["Schezwan Momos","₹50"],
        ["Cheese Schezwan Momos","₹60"]
    ],

    soups: [
        ["Corn Soup","₹40"],
        ["Tomato Soup","₹40"],
        ["Chatpata Tomato","₹40"],
        ["Magic Maggi Soup","₹50"],
        ["Manchow Soup","₹50"]
    ],

    corn: [
        ["Peri Peri Corn","₹40"],
        ["Butter Corn","₹50"],
        ["Masala Corn","₹50"],
        ["Cheese Corn","₹50"],
        ["Schezwan Corn","₹50"],
        ["Butter Cheese Corn","₹60"]
    ],

    bhel: [
        ["Chips Bhel","₹50"],
        ["Kurkure Bhel","₹50"]
    ]

};


// ======================================================
// TABLE RENDER
// ======================================================

function loadMenuItems(categoryName) {

    const area = document.getElementById("menuTableArea");

    if (!area) return;

    const items = MENU_ITEMS[categoryName];

    if (!items) {

        area.innerHTML = "<p>No Menu Available.</p>";

        return;

    }

    let html = "";

    // Half / Full Table
    if (
        categoryName === "everyday" ||
        categoryName === "cheese" ||
        categoryName === "cheeseButter"
    ) {

        html += `
        <table class="menu-table">

            <thead>

                <tr>

                    <th>Item</th>
                    <th>Half</th>
                    <th>Full</th>

                </tr>

            </thead>

            <tbody>
        `;

        items.forEach(item => {

            html += `

            <tr>

                <td>${item[0]}</td>

                <td>${item[1]}</td>

                <td>${item[2]}</td>

            </tr>

            `;

        });

        html += `
            </tbody>
        </table>
        `;

    }

    // Single Price Table
    else {

        html += `
        <table class="menu-table">

            <thead>

                <tr>

                    <th>Item</th>

                    <th>Price</th>

                </tr>

            </thead>

            <tbody>
        `;

        items.forEach(item => {

            html += `

            <tr>

                <td>${item[0]}</td>

                <td>${item[1]}</td>

            </tr>

            `;

        });

        html += `
            </tbody>
        </table>
        `;

    }

    area.innerHTML = html;

}
// ======================================================
// PART 4 / 4
// HERO SLIDER + ANIMATIONS + UTILITIES
// ======================================================

// ======================================================
// HERO SLIDER
// ======================================================

function setupHeroSlider() {

    if (!heroSlides.length) return;

    showSlide(0);

    if (MenuState.sliderTimer) {
        clearInterval(MenuState.sliderTimer);
    }

    MenuState.sliderTimer = setInterval(() => {

        MenuState.currentSlide++;

        if (MenuState.currentSlide >= heroSlides.length) {
            MenuState.currentSlide = 0;
        }

        showSlide(MenuState.currentSlide);

    }, 4000);

}

// ======================================================
// SHOW HERO SLIDE
// ======================================================

function showSlide(index) {

    heroSlides.forEach((slide, i) => {

        slide.classList.toggle("active", i === index);

    });

}

// ======================================================
// FLOATING CARD ANIMATION
// ======================================================

function setupCardAnimations() {

    floatingCards.forEach((card, index) => {

        card.style.animationDelay = `${index * 0.08}s`;

        card.addEventListener("mouseenter", () => {

            card.classList.add("card-hover");

        });

        card.addEventListener("mouseleave", () => {

            card.classList.remove("card-hover");

        });

    });

}

// ======================================================
// REFRESH MENU
// ======================================================

function refreshMenu() {

    if (!MenuState.currentCategory) return;

    renderCategory(MenuState.currentCategory);

}

// ======================================================
// CLOSE DETAIL
// ======================================================

function closeMenuDetail() {

    if (!detailContainer) return;

    detailContainer.innerHTML = "";

    MenuState.currentCategory = null;

    categoryCards.forEach(card => {

        card.classList.remove("active");

    });

}

// ======================================================
// WINDOW RESIZE
// ======================================================

window.addEventListener("resize", () => {

    if (MenuState.currentCategory) {

        refreshMenu();

    }

});

// ======================================================
// PAGE VISIBILITY
// ======================================================

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        if (MenuState.sliderTimer) {

            clearInterval(MenuState.sliderTimer);

        }

    } else {

        setupHeroSlider();

    }

});

// ======================================================
// DEBUG
// ======================================================

window.MenuSystem = {

    state: MenuState,

    menu: MENU_DATA,

    items: MENU_ITEMS,

    openCategory,

    refreshMenu,

    closeMenuDetail

};

console.log("✅ MENU.JS PART 4 LOADED");
console.log("✅ MENU.JS COMPLETE");
// ======================================================
// PART 5 / 7
// PREMIUM HERO SLIDER ENHANCEMENT
// ======================================================

let sliderStartX = 0;
let sliderEndX = 0;
let sliderPaused = false;

// ======================================================
// ENHANCE HERO SLIDER
// ======================================================

function initializePremiumSlider() {

    if (!heroSlider || heroSlides.length <= 1) return;

    setupSliderHover();

    setupSliderTouch();

    setupSliderVisibility();

}

// ======================================================
// HOVER PAUSE
// ======================================================

function setupSliderHover() {

    heroSlider.addEventListener("mouseenter", () => {

        pauseHeroSlider();

    });

    heroSlider.addEventListener("mouseleave", () => {

        resumeHeroSlider();

    });

}

// ======================================================
// PAUSE
// ======================================================

function pauseHeroSlider() {

    if (sliderPaused) return;

    sliderPaused = true;

    if (MenuState.sliderTimer) {

        clearInterval(MenuState.sliderTimer);

        MenuState.sliderTimer = null;

    }

}

// ======================================================
// RESUME
// ======================================================

function resumeHeroSlider() {

    if (!sliderPaused) return;

    sliderPaused = false;

    setupHeroSlider();

}

// ======================================================
// TOUCH SUPPORT
// ======================================================

function setupSliderTouch() {

    heroSlider.addEventListener("touchstart", e => {

        sliderStartX = e.changedTouches[0].clientX;

    }, { passive: true });

    heroSlider.addEventListener("touchend", e => {

        sliderEndX = e.changedTouches[0].clientX;

        detectSliderSwipe();

    }, { passive: true });

}

// ======================================================
// SWIPE DETECTION
// ======================================================

function detectSliderSwipe() {

    const distance = sliderStartX - sliderEndX;

    if (Math.abs(distance) < 60) return;

    if (distance > 0) {

        nextHeroSlide();

    } else {

        previousHeroSlide();

    }

}

// ======================================================
// NEXT
// ======================================================

function nextHeroSlide() {

    MenuState.currentSlide++;

    if (MenuState.currentSlide >= heroSlides.length) {

        MenuState.currentSlide = 0;

    }

    showSlide(MenuState.currentSlide);

}

// ======================================================
// PREVIOUS
// ======================================================

function previousHeroSlide() {

    MenuState.currentSlide--;

    if (MenuState.currentSlide < 0) {

        MenuState.currentSlide = heroSlides.length - 1;

    }

    showSlide(MenuState.currentSlide);

}

// ======================================================
// PAGE VISIBILITY
// ======================================================

function setupSliderVisibility() {

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {

            pauseHeroSlider();

        } else {

            resumeHeroSlider();

        }

    });

}

// ======================================================
// START PREMIUM FEATURES
// ======================================================

initializePremiumSlider();

console.log("✅ MENU.JS PART 5 LOADED");
// ======================================================
// PART 6 / 7
// PREMIUM CARD ANIMATION SYSTEM
// ======================================================

// ======================================================
// SCROLL REVEAL
// ======================================================

let menuObserver = null;

function initializeScrollReveal() {

    if (!("IntersectionObserver" in window)) return;

    menuObserver = new IntersectionObserver(

        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("reveal-active");

                    menuObserver.unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.15,
            rootMargin: "0px 0px -80px 0px"
        }

    );

    document
        .querySelectorAll(
            ".menu-category-card,.menu-detail-header,.menu-table"
        )
        .forEach(item => {

            item.classList.add("reveal-item");

            menuObserver.observe(item);

        });

}

// ======================================================
// RIPPLE EFFECT
// ======================================================

function initializeRippleEffect() {

    categoryCards.forEach(card => {

        card.addEventListener("click", function (e) {

            const ripple =
                document.createElement("span");

            ripple.className = "menu-ripple";

            const rect =
                this.getBoundingClientRect();

            ripple.style.left =
                (e.clientX - rect.left) + "px";

            ripple.style.top =
                (e.clientY - rect.top) + "px";

            this.appendChild(ripple);

            setTimeout(() => {

                ripple.remove();

            }, 700);

        });

    });

}

// ======================================================
// FLOATING CARD EFFECT
// ======================================================

function initializeFloatingCards() {

    floatingCards.forEach((card, index) => {

        const duration =

            3000 + (index * 250);

        card.animate(

            [

                {
                    transform:
                    "translateY(0px)"
                },

                {
                    transform:
                    "translateY(-8px)"
                },

                {
                    transform:
                    "translateY(0px)"
                }

            ],

            {

                duration,

                iterations: Infinity,

                easing: "ease-in-out"

            }

        );

    });

}

// ======================================================
// TABLE FADE
// ======================================================

function animateMenuTable() {

    const table =
        document.querySelector(".menu-table");

    if (!table) return;

    table.animate(

        [

            {
                opacity: 0,
                transform:
                "translateY(30px)"
            },

            {
                opacity: 1,
                transform:
                "translateY(0px)"
            }

        ],

        {

            duration: 500,

            easing: "ease"

        }

    );

}

// ======================================================
// PATCH TABLE RENDER
// ======================================================

const originalLoadMenuItems =
loadMenuItems;

loadMenuItems = function (categoryName) {

    originalLoadMenuItems(categoryName);

    requestAnimationFrame(() => {

        animateMenuTable();

        initializeScrollReveal();

    });

};

// ======================================================
// PERFORMANCE
// ======================================================

window.addEventListener(

    "load",

    () => {

        initializeScrollReveal();

        initializeRippleEffect();

        initializeFloatingCards();

    }

);

console.log("✅ MENU.JS PART 6 LOADED");
// ======================================================
// PART 7 / 7
// FINAL POLISH + ADSENSE READY + ACCESSIBILITY
// ======================================================

// ======================================================
// SAFE BOTTOM SPACE
// ======================================================

function applySafeBottomSpacing() {

    const menuPage = document.querySelector(".menu-page");

    if (!menuPage) return;

    menuPage.style.paddingBottom = "180px";

}

// ======================================================
// ADSENSE PLACEHOLDER
// ======================================================

function initializeAdSpaces() {

    document.querySelectorAll(".ads-placeholder").forEach(ad => {

        ad.innerHTML = `
            <div class="coming-ad-box">
                Advertisement
            </div>
        `;

    });

}

// ======================================================
// KEYBOARD ACCESSIBILITY
// ======================================================

function initializeKeyboardNavigation() {

    categoryCards.forEach(card => {

        card.setAttribute("tabindex", "0");

        card.addEventListener("keydown", e => {

            if (e.key === "Enter" || e.key === " ") {

                e.preventDefault();

                card.click();

            }

        });

    });

}

// ======================================================
// IMAGE LAZY FADE
// ======================================================

function initializeImageEffects() {

    document
        .querySelectorAll(".menu-category-image")
        .forEach(img => {

            img.addEventListener("load", () => {

                img.classList.add("loaded");

            });

        });

}

// ======================================================
// SMOOTH BACK TO TOP
// ======================================================

function scrollTopMenu() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

// ======================================================
// MENU RESET
// ======================================================

function resetMenuSystem() {

    closeMenuDetail();

    scrollTopMenu();

}

// ======================================================
// GLOBAL API
// ======================================================

window.MenuSystem = {

    state: MenuState,

    menuData: MENU_DATA,

    menuItems: MENU_ITEMS,

    openCategory,

    closeMenuDetail,

    refreshMenu,

    resetMenuSystem,

    scrollTopMenu

};

// ======================================================
// FINAL INIT
// ======================================================

window.addEventListener("load", () => {

    applySafeBottomSpacing();

    initializeAdSpaces();

    initializeKeyboardNavigation();

    initializeImageEffects();

    console.log("================================");

    console.log("RIO MAGGI POINT");

    console.log("Premium Menu System Ready");

    console.log("Version 1.0");

    console.log("================================");

});

console.log("✅ MENU.JS PART 7 LOADED");
console.log("✅ MENU.JS COMPLETE");
