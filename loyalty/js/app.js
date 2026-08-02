// =======================================
// Rio Maggi Point
// Global JavaScript
// PART 1/4
// PREMIUM GLOBAL UTILITIES
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Rio Maggi Point Loaded");

    // ---------------------------------------
    // Initialize Global UI
    // ---------------------------------------

    initializeGlobalUI();

});


// =======================================
// ---------- Helper Functions ----------
// =======================================


/**
 * Get element by ID
 */
function $(id) {

    return document.getElementById(id);

}


/**
 * Show element
 */
function showElement(id) {

    const element = $(id);

    if (!element) {

        console.warn(
            `Rio Maggi Point: Element #${id} not found.`
        );

        return;

    }

    element.style.display = "block";

}


/**
 * Hide element
 */
function hideElement(id) {

    const element = $(id);

    if (!element) {

        console.warn(
            `Rio Maggi Point: Element #${id} not found.`
        );

        return;

    }

    element.style.display = "none";

}


/**
 * Toggle element
 */
function toggleElement(id) {

    const element = $(id);

    if (!element) {

        console.warn(
            `Rio Maggi Point: Element #${id} not found.`
        );

        return;

    }

    const isHidden =

        window.getComputedStyle(
            element
        ).display === "none";


    element.style.display =

        isHidden
            ? "block"
            : "none";

}


/**
 * Add class safely
 */
function addClass(id, className) {

    const element = $(id);

    if (!element || !className) {

        return;

    }

    element.classList.add(
        className
    );

}


/**
 * Remove class safely
 */
function removeClass(id, className) {

    const element = $(id);

    if (!element || !className) {

        return;

    }

    element.classList.remove(
        className
    );

}


/**
 * Toggle class safely
 */
function toggleClass(id, className) {

    const element = $(id);

    if (!element || !className) {

        return;

    }

    element.classList.toggle(
        className
    );

}


/**
 * Check if element exists
 */
function elementExists(id) {

    return Boolean(
        $(id)
    );

}


// =======================================
// ---------- Global UI Setup ----------
// =======================================

function initializeGlobalUI() {

    // -----------------------------------
    // Mark page as ready
    // -----------------------------------

    document.body.classList.add(
        "page-ready"
    );


    // -----------------------------------
    // Remove initial loading state
    // -----------------------------------

    const pageLoader =

        document.getElementById(
            "pageLoader"
        );


    if (pageLoader) {

        pageLoader.classList.add(
            "loaded"
        );

    }


    // -----------------------------------
    // Global animated elements
    // -----------------------------------

    initializeScrollAnimations();


    // -----------------------------------
    // Global button interactions
    // -----------------------------------

    initializeButtonAnimations();


    console.log(
        "Rio Maggi Point Global UI Ready"
    );

}


// =======================================
// ---------- Scroll Animations ----------
// =======================================

function initializeScrollAnimations() {

    const animatedElements =

        document.querySelectorAll(
            "[data-animate]"
        );


    if (
        !animatedElements.length
    ) {

        return;

    }


    // -----------------------------------
    // IntersectionObserver Support
    // -----------------------------------

    if (
        "IntersectionObserver"
        in window
    ) {

        const observer =

            new IntersectionObserver(

                (entries) => {

                    entries.forEach(

                        (entry) => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "is-visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }

                    );

                },

                {

                    threshold: 0.12,

                    rootMargin:
                        "0px 0px -40px 0px"

                }

            );


        animatedElements.forEach(

            (element) => {

                observer.observe(
                    element
                );

            }

        );


        return;

    }


    // -----------------------------------
    // Fallback
    // -----------------------------------

    animatedElements.forEach(

        (element) => {

            element.classList.add(
                "is-visible"
            );

        }

    );

}


// =======================================
// ---------- Button Animations ----------
// =======================================

function initializeButtonAnimations() {

    const buttons =

        document.querySelectorAll(
            "button, .btn, [role='button']"
        );


    if (
        !buttons.length
    ) {

        return;

    }


    buttons.forEach(

        (button) => {

            // --------------------------------
            // Prevent duplicate initialization
            // --------------------------------

            if (
                button.dataset.rioButtonReady ===
                "true"
            ) {

                return;

            }


            button.dataset.rioButtonReady =
                "true";


            // --------------------------------
            // Press animation
            // --------------------------------

            button.addEventListener(

                "pointerdown",

                () => {

                    if (
                        button.disabled
                    ) {

                        return;

                    }

                    button.classList.add(
                        "button-pressed"
                    );

                }

            );


            button.addEventListener(

                "pointerup",

                () => {

                    button.classList.remove(
                        "button-pressed"
                    );

                }

            );


            button.addEventListener(

                "pointerleave",

                () => {

                    button.classList.remove(
                        "button-pressed"
                    );

                }

            );

        }

    );

}


// =======================================
// ---------- Safe Text Update ----------
// =======================================

function setText(

    id,

    value

) {

    const element = $(id);

    if (!element) {

        return;

    }

    element.textContent =

        value ?? "";

}


// =======================================
// ---------- Safe HTML Update ----------
// =======================================

function setHTML(

    id,

    value

) {

    const element = $(id);

    if (!element) {

        return;

    }

    element.innerHTML =

        value ?? "";

}


// =======================================
// ---------- Safe Attribute ----------
// =======================================

function setAttributeSafe(

    id,

    attribute,

    value

) {

    const element = $(id);

    if (
        !element ||
        !attribute
    ) {

        return;

    }

    element.setAttribute(

        attribute,

        value

    );

}


// =======================================
// ---------- Safe Remove Attribute ----------
// =======================================

function removeAttributeSafe(

    id,

    attribute

) {

    const element = $(id);

    if (
        !element ||
        !attribute
    ) {

        return;

    }

    element.removeAttribute(

        attribute

    );

}


// =======================================
// ---------- Number Utility ----------
// =======================================

function getSafeNumber(

    value,

    fallback = 0

) {

    const number =

        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return fallback;

    }

    return number;

}


// =======================================
// ---------- Safe String ----------
// =======================================

function getSafeString(

    value,

    fallback = ""

) {

    if (
        value === null ||
        value === undefined
    ) {

        return fallback;

    }

    return String(
        value
    );

}


// =======================================
// ---------- Global Error Protection ----------
// =======================================

window.addEventListener(

    "error",

    (event) => {

        console.error(

            "Rio Maggi Point | Global Error:",

            event.error ||
            event.message

        );

    }

);


// =======================================
// ---------- Promise Error Protection ----------
// =======================================

window.addEventListener(

    "unhandledrejection",

    (event) => {

        console.error(

            "Rio Maggi Point | Unhandled Promise Error:",

            event.reason

        );

    }

);


// =======================================
// APP.JS PART 1/4 END
// =======================================
// =======================================
// Rio Maggi Point
// Global JavaScript
// PART 2/4
// GLOBAL NAVIGATION + MOBILE MENU
// =======================================


// =======================================
// ---------- Navigation Setup ----------
// =======================================

function initializeGlobalNavigation() {

    const navigationLinks =

        document.querySelectorAll(
            "[data-nav], .nav-link, .bottom-nav a"
        );


    if (
        !navigationLinks.length
    ) {

        return;

    }


    const currentPage =

        getCurrentPageName();


    navigationLinks.forEach(

        (link) => {

            // --------------------------------
            // Prevent duplicate initialization
            // --------------------------------

            if (
                link.dataset.rioNavReady ===
                "true"
            ) {

                return;

            }


            link.dataset.rioNavReady =
                "true";


            // --------------------------------
            // Get target page
            // --------------------------------

            const href =

                link.getAttribute(
                    "href"
                );


            if (
                !href ||
                href === "#" ||
                href.startsWith(
                    "javascript:"
                )
            ) {

                return;

            }


            const targetPage =

                getPageNameFromURL(
                    href
                );


            // --------------------------------
            // Active navigation state
            // --------------------------------

            if (

                targetPage &&
                currentPage &&
                targetPage === currentPage

            ) {

                link.classList.add(
                    "active"
                );


                link.setAttribute(
                    "aria-current",
                    "page"
                );

            }


            // --------------------------------
            // Navigation click animation
            // --------------------------------

            link.addEventListener(

                "click",

                () => {

                    link.classList.add(
                        "nav-click"
                    );


                    window.setTimeout(

                        () => {

                            link.classList.remove(
                                "nav-click"
                            );

                        },

                        250

                    );

                }

            );

        }

    );

}


// =======================================
// ---------- Get Current Page ----------
// =======================================

function getCurrentPageName() {

    let pageName =

        window.location.pathname

            .split("/")

            .pop();


    // -----------------------------------
    // Empty pathname
    // -----------------------------------

    if (
        !pageName
    ) {

        pageName =
            "index.html";

    }


    return pageName
        .toLowerCase();

}


// =======================================
// ---------- Get Page From URL ----------
// =======================================

function getPageNameFromURL(

    url

) {

    if (
        !url
    ) {

        return "";

    }


    try {

        // --------------------------------
        // Remove query parameters
        // --------------------------------

        const cleanURL =

            url.split("?")[0]
               .split("#")[0];


        let pageName =

            cleanURL
                .split("/")
                .pop();


        // --------------------------------
        // Handle empty page
        // --------------------------------

        if (
            !pageName
        ) {

            pageName =
                "index.html";

        }


        return pageName
            .toLowerCase();

    }


    catch (
        error
    ) {

        console.error(

            "Rio Maggi Point | Navigation URL Error:",

            error

        );


        return "";

    }

}


// =======================================
// ---------- Mobile Menu ----------
// =======================================

function initializeMobileMenu() {

    const menuButton =

        document.querySelector(

            "[data-menu-toggle], " +
            "#menuToggle, " +
            ".menu-toggle"

        );


    const mobileMenu =

        document.querySelector(

            "[data-mobile-menu], " +
            "#mobileMenu, " +
            ".mobile-menu"

        );


    // -----------------------------------
    // Menu not available
    // -----------------------------------

    if (
        !menuButton ||
        !mobileMenu
    ) {

        return;

    }


    // -----------------------------------
    // Prevent duplicate listener
    // -----------------------------------

    if (
        menuButton.dataset.rioMenuReady ===
        "true"
    ) {

        return;

    }


    menuButton.dataset.rioMenuReady =
        "true";


    // -----------------------------------
    // Accessibility
    // -----------------------------------

    menuButton.setAttribute(

        "aria-expanded",

        "false"

    );


    menuButton.setAttribute(

        "aria-controls",

        mobileMenu.id ||
        "mobileMenu"

    );


    // -----------------------------------
    // Toggle menu
    // -----------------------------------

    menuButton.addEventListener(

        "click",

        () => {

            const isOpen =

                mobileMenu.classList.toggle(
                    "open"
                );


            menuButton.classList.toggle(

                "active",

                isOpen

            );


            menuButton.setAttribute(

                "aria-expanded",

                String(
                    isOpen
                )

            );


            document.body.classList.toggle(

                "menu-open",

                isOpen

            );

        }

    );


    // -----------------------------------
    // Close menu on navigation click
    // -----------------------------------

    const menuLinks =

        mobileMenu.querySelectorAll(
            "a"
        );


    menuLinks.forEach(

        (link) => {

            link.addEventListener(

                "click",

                () => {

                    closeMobileMenu(

                        menuButton,

                        mobileMenu

                    );

                }

            );

        }

    );


    // -----------------------------------
    // Close menu with Escape
    // -----------------------------------

    document.addEventListener(

        "keydown",

        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                closeMobileMenu(

                    menuButton,

                    mobileMenu

                );

            }

        }

    );


    // -----------------------------------
    // Close menu when clicking outside
    // -----------------------------------

    document.addEventListener(

        "click",

        (event) => {

            if (
                !mobileMenu.classList.contains(
                    "open"
                )
            ) {

                return;

            }


            if (

                mobileMenu.contains(
                    event.target
                ) ||

                menuButton.contains(
                    event.target
                )

            ) {

                return;

            }


            closeMobileMenu(

                menuButton,

                mobileMenu

            );

        }

    );

}


// =======================================
// ---------- Close Mobile Menu ----------
// =======================================

function closeMobileMenu(

    menuButton,

    mobileMenu

) {

    if (
        !menuButton ||
        !mobileMenu
    ) {

        return;

    }


    mobileMenu.classList.remove(

        "open"

    );


    menuButton.classList.remove(

        "active"

    );


    menuButton.setAttribute(

        "aria-expanded",

        "false"

    );


    document.body.classList.remove(

        "menu-open"

    );

}


// =======================================
// ---------- Smooth Anchor Scroll ----------
// =======================================

function initializeSmoothScroll() {

    const anchorLinks =

        document.querySelectorAll(

            'a[href^="#"]'

        );


    if (
        !anchorLinks.length
    ) {

        return;

    }


    anchorLinks.forEach(

        (link) => {

            if (
                link.dataset.rioSmoothReady ===
                "true"
            ) {

                return;

            }


            link.dataset.rioSmoothReady =
                "true";


            link.addEventListener(

                "click",

                (event) => {

                    const targetID =

                        link.getAttribute(
                            "href"
                        );


                    if (

                        !targetID ||

                        targetID === "#"

                    ) {

                        return;

                    }


                    const targetElement =

                        document.querySelector(
                            targetID
                        );


                    if (
                        !targetElement
                    ) {

                        return;

                    }


                    event.preventDefault();


                    targetElement.scrollIntoView(

                        {

                            behavior:
                                "smooth",

                            block:
                                "start"

                        }

                    );

                }

            );

        }

    );

}


// =======================================
// ---------- Back To Top ----------
// =======================================

function initializeBackToTop() {

    const backToTopButton =

        document.querySelector(

            "[data-back-to-top], " +
            "#backToTop, " +
            ".back-to-top"

        );


    if (
        !backToTopButton
    ) {

        return;

    }


    if (
        backToTopButton.dataset.rioTopReady ===
        "true"
    ) {

        return;

    }


    backToTopButton.dataset.rioTopReady =
        "true";


    // -----------------------------------
    // Initial state
    // -----------------------------------

    backToTopButton.classList.remove(

        "visible"

    );


    // -----------------------------------
    // Scroll detection
    // -----------------------------------

    window.addEventListener(

        "scroll",

        () => {

            if (
                window.scrollY >
                400
            ) {

                backToTopButton.classList.add(

                    "visible"

                );

            }

            else {

                backToTopButton.classList.remove(

                    "visible"

                );

            }

        },

        {

            passive:
                true

        }

    );


    // -----------------------------------
    // Scroll to top
    // -----------------------------------

    backToTopButton.addEventListener(

        "click",

        () => {

            window.scrollTo(

                {

                    top:
                        0,

                    behavior:
                        "smooth"

                }

            );

        }

    );

}


// =======================================
// ---------- Initialize Navigation ----------
// =======================================

function initializeNavigationSystem() {

    initializeGlobalNavigation();

    initializeMobileMenu();

    initializeSmoothScroll();

    initializeBackToTop();


    console.log(

        "Rio Maggi Point Navigation System Ready"

    );

}


// =======================================
// ---------- PART 2 READY ----------
// =======================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initializeNavigationSystem();

    },

    {

        once:
            true

    }

);


// =======================================
// APP.JS PART 2/4 END
// =======================================
// =======================================
// Rio Maggi Point
// Global JavaScript
// app.js — PART 3
// PREMIUM PAGE + NAVIGATION HELPERS
// =======================================


// ---------- Current Page ----------

function getCurrentPage() {

    const path =
        window.location.pathname;

    const fileName =
        path
            .split("/")
            .pop()
            .toLowerCase();

    return fileName || "index.html";

}


// ---------- Get Navigation Links ----------

function getNavigationLinks() {

    return document.querySelectorAll(
        "a[data-nav], " +
        ".bottom-nav a, " +
        ".mobile-nav a, " +
        ".main-nav a"
    );

}


// ---------- Set Active Navigation ----------

function setActiveNavigation() {

    const currentPage =
        getCurrentPage();

    const links =
        getNavigationLinks();

    if (!links.length) {
        return;
    }

    links.forEach((link) => {

        const href =
            link.getAttribute("href");

        if (!href) {
            return;
        }

        const targetPage =
            href
                .split("/")
                .pop()
                .split("?")[0]
                .split("#")[0]
                .toLowerCase();

        const isActive =
            targetPage === currentPage;

        link.classList.toggle(
            "active",
            isActive
        );

        if (isActive) {

            link.setAttribute(
                "aria-current",
                "page"
            );

        } else {

            link.removeAttribute(
                "aria-current"
            );

        }

    });

}


// ---------- Navigation Click Animation ----------

function initializeNavigationAnimation() {

    const links =
        getNavigationLinks();

    if (!links.length) {
        return;
    }

    links.forEach((link) => {

        if (
            link.dataset.navAnimationReady ===
            "true"
        ) {
            return;
        }

        link.dataset.navAnimationReady =
            "true";

        link.addEventListener(
            "click",
            () => {

                link.classList.add(
                    "nav-click"
                );

                window.setTimeout(
                    () => {

                        link.classList.remove(
                            "nav-click"
                        );

                    },
                    250
                );

            }
        );

    });

}


// ---------- Mobile Menu ----------

function initializeMobileMenu() {

    const menuButton =
        document.querySelector(
            "[data-menu-toggle]"
        );

    const menu =
        document.querySelector(
            "[data-mobile-menu]"
        );

    if (
        !menuButton ||
        !menu
    ) {
        return;
    }

    if (
        menuButton.dataset.menuReady ===
        "true"
    ) {
        return;
    }

    menuButton.dataset.menuReady =
        "true";


    const closeMenu = () => {

        menu.classList.remove(
            "open"
        );

        menuButton.classList.remove(
            "active"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        document.body.classList.remove(
            "menu-open"
        );

    };


    const openMenu = () => {

        menu.classList.add(
            "open"
        );

        menuButton.classList.add(
            "active"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.classList.add(
            "menu-open"
        );

    };


    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                menu.classList.contains(
                    "open"
                );

            if (isOpen) {

                closeMenu();

            } else {

                openMenu();

            }

        }
    );


    menu
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                closeMenu
            );

        });


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                closeMenu();

            }

        }
    );

}


// ---------- Close Mobile Menu On Resize ----------

function initializeMenuResizeHandler() {

    if (
        window.__rioMenuResizeReady
    ) {
        return;
    }

    window.__rioMenuResizeReady =
        true;

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                900
            ) {

                document.body.classList.remove(
                    "menu-open"
                );

                const menu =
                    document.querySelector(
                        "[data-mobile-menu]"
                    );

                const button =
                    document.querySelector(
                        "[data-menu-toggle]"
                    );

                if (menu) {

                    menu.classList.remove(
                        "open"
                    );

                }

                if (button) {

                    button.classList.remove(
                        "active"
                    );

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }

        }
    );

}


// ---------- Smooth Anchor Scroll ----------

function initializeSmoothScroll() {

    const anchors =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    if (!anchors.length) {
        return;
    }

    anchors.forEach((anchor) => {

        if (
            anchor.dataset.smoothScrollReady ===
            "true"
        ) {
            return;
        }

        anchor.dataset.smoothScrollReady =
            "true";

        anchor.addEventListener(
            "click",
            (event) => {

                const targetId =
                    anchor.getAttribute(
                        "href"
                    );

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(
                        targetId
                    );

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }
        );

    });

}


// ---------- Premium Scroll Reveal ----------

function initializeScrollReveal() {

    const elements =
        document.querySelectorAll(
            "[data-reveal]"
        );

    if (!elements.length) {
        return;
    }


    if (
        !("IntersectionObserver" in window)
    ) {

        elements.forEach(
            (element) => {

                element.classList.add(
                    "is-visible"
                );

            }
        );

        return;

    }


    const observer =
        new IntersectionObserver(

            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "is-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },

            {
                threshold:
                    0.12,

                rootMargin:
                    "0px 0px -40px 0px"

            }

        );


    elements.forEach(
        (element) => {

            observer.observe(
                element
            );

        }
    );

}


// ---------- Initialize Premium Navigation ----------

function initializePremiumNavigation() {

    setActiveNavigation();

    initializeNavigationAnimation();

    initializeMobileMenu();

    initializeMenuResizeHandler();

    initializeSmoothScroll();

    initializeScrollReveal();

}


// ---------- Part 3 Ready ----------

console.log(
    "Rio Maggi Point | Premium Navigation Ready"
);
// =======================================
// Rio Maggi Point
// Global JavaScript
// app.js — PART 3/4
// PREMIUM GLOBAL INTERACTIONS
// =======================================


// =======================================
// DOM READY INITIALIZATION
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    initializeGlobalButtons();

    initializePasswordToggles();

    initializeMobileMenu();

    initializeSmoothNavigation();

    initializeScrollEffects();

});


// =======================================
// GLOBAL BUTTON INITIALIZATION
// =======================================

function initializeGlobalButtons() {

    const buttons = document.querySelectorAll(
        "button[data-action]"
    );

    buttons.forEach((button) => {

        const action =
            button.dataset.action;

        if (!action) {
            return;
        }

        button.addEventListener(
            "click",
            () => {

                handleGlobalAction(
                    action,
                    button
                );

            }
        );

    });

}


// =======================================
// GLOBAL ACTION HANDLER
// =======================================

function handleGlobalAction(
    action,
    button
) {

    switch (action) {

        case "back":

            window.history.back();

            break;


        case "home":

            window.location.href =
                "index.html";

            break;


        case "dashboard":

            window.location.href =
                "dashboard.html";

            break;


        case "qr":

            window.location.href =
                "qr.html";

            break;


        case "history":

            window.location.href =
                "history.html";

            break;


        case "reward":

            window.location.href =
                "reward.html";

            break;


        case "menu":

            window.location.href =
                "menu.html";

            break;


        case "review":

            window.location.href =
                "review.html";

            break;


        default:

            console.warn(
                "Unknown global action:",
                action
            );

            break;

    }

}


// =======================================
// PASSWORD VISIBILITY TOGGLE
// =======================================

function initializePasswordToggles() {

    const toggleButtons =
        document.querySelectorAll(
            "[data-password-toggle]"
        );


    toggleButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.passwordToggle;

                    if (!targetId) {
                        return;
                    }


                    const input =
                        document.getElementById(
                            targetId
                        );


                    if (!input) {
                        return;
                    }


                    const isPassword =
                        input.type === "password";


                    input.type =
                        isPassword
                            ? "text"
                            : "password";


                    button.classList.toggle(
                        "active",
                        isPassword
                    );


                    button.setAttribute(
                        "aria-label",
                        isPassword
                            ? "Hide password"
                            : "Show password"
                    );

                }
            );

        }
    );

}


// =======================================
// MOBILE MENU
// =======================================

function initializeMobileMenu() {

    const menuButton =
        document.querySelector(
            "[data-mobile-menu-toggle]"
        );


    const mobileMenu =
        document.querySelector(
            "[data-mobile-menu]"
        );


    if (
        !menuButton ||
        !mobileMenu
    ) {

        return;

    }


    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                mobileMenu.classList.toggle(
                    "is-open"
                );


            menuButton.classList.toggle(
                "is-active",
                isOpen
            );


            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );


            document.body.classList.toggle(
                "menu-open",
                isOpen
            );

        }
    );


    const menuLinks =
        mobileMenu.querySelectorAll(
            "a"
        );


    menuLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    mobileMenu.classList.remove(
                        "is-open"
                    );


                    menuButton.classList.remove(
                        "is-active"
                    );


                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    document.body.classList.remove(
                        "menu-open"
                    );

                }
            );

        }
    );

}


// =======================================
// SMOOTH NAVIGATION
// =======================================

function initializeSmoothNavigation() {

    const navigationLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    navigationLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    target.scrollIntoView({

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


// =======================================
// SCROLL EFFECTS
// =======================================

function initializeScrollEffects() {

    const header =
        document.querySelector(
            "[data-header]"
        );


    if (!header) {

        return;

    }


    let ticking =
        false;


    function updateHeader() {

        const scrollPosition =
            window.scrollY;


        header.classList.toggle(
            "scrolled",
            scrollPosition > 20
        );


        ticking =
            false;

    }


    window.addEventListener(
        "scroll",
        () => {

            if (!ticking) {

                window.requestAnimationFrame(
                    updateHeader
                );

                ticking =
                    true;

            }

        },
        {
            passive: true
        }
    );


    updateHeader();

}


// =======================================
// PREMIUM REVEAL ANIMATIONS
// =======================================

function initializeRevealAnimations() {

    const revealElements =
        document.querySelectorAll(
            "[data-reveal]"
        );


    if (
        !revealElements.length
    ) {

        return;

    }


    if (
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach(
            (element) => {

                element.classList.add(
                    "is-visible"
                );

            }
        );

        return;

    }


    const revealObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    (entry) => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "is-visible"
                            );


                            revealObserver.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        (element) => {

            revealObserver.observe(
                element
            );

        }
    );

}


// =======================================
// ACTIVE PAGE NAVIGATION
// =======================================

function initializeActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const navigationLinks =
        document.querySelectorAll(
            "a[data-nav]"
        );


    navigationLinks.forEach(
        (link) => {

            const href =
                link.getAttribute(
                    "href"
                );


            if (!href) {

                return;

            }


            const targetPage =
                href
                    .split("/")
                    .pop()
                    .toLowerCase();


            link.classList.remove(
                "active"
            );


            link.removeAttribute(
                "aria-current"
            );


            if (
                targetPage ===
                currentPage
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


// =======================================
// RUN REVEAL + NAVIGATION
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeRevealAnimations();

        initializeActiveNavigation();

    },
    {
        once: true
    }
);


// =======================================
// PREMIUM BUTTON PRESS EFFECT
// =======================================

document.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                "button, .btn, [role='button']"
            );


        if (!button) {

            return;

        }


        button.classList.remove(
            "button-pressed"
        );


        void button.offsetWidth;


        button.classList.add(
            "button-pressed"
        );


        window.setTimeout(
            () => {

                button.classList.remove(
                    "button-pressed"
                );

            },
            250
        );

    }
);


// =======================================
// GLOBAL ESCAPE KEY HANDLER
// =======================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        document.body.classList.remove(
            "menu-open"
        );


        document
            .querySelectorAll(
                "[data-mobile-menu].is-open"
            )
            .forEach(
                (menu) => {

                    menu.classList.remove(
                        "is-open"
                    );

                }
            );


        document
            .querySelectorAll(
                "[data-mobile-menu-toggle].is-active"
            )
            .forEach(
                (button) => {

                    button.classList.remove(
                        "is-active"
                    );


                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

    }
);


// =======================================
// GLOBAL ERROR LOGGING
// =======================================

window.addEventListener(
    "error",
    (event) => {

        console.error(
            "RIO MAGGI POINT | Global Error:",
            event.error ||
            event.message
        );

    }
);


// =======================================
// UNHANDLED PROMISE ERROR
// =======================================

window.addEventListener(
    "unhandledrejection",
    (event) => {

        console.error(
            "RIO MAGGI POINT | Unhandled Promise:",
            event.reason
        );

    }
);


// =======================================
// PART 3 READY
// =======================================

console.log(
    "RIO MAGGI POINT | app.js Part 3 Loaded"
);
// =======================================
// Rio Maggi Point
// Global JavaScript
// app.js — PART 4/4
// PREMIUM FINAL UTILITIES
// =======================================


// =======================================
// INITIALIZE ALL GLOBAL SYSTEMS
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeGlobalSystems();

    },
    {
        once: true
    }
);


// =======================================
// GLOBAL SYSTEM INITIALIZER
// =======================================

function initializeGlobalSystems() {

    initializeRevealAnimations();

    initializeActiveNavigation();

    initializeLazyImages();

    initializeExternalLinks();

    initializeCardInteractions();

    initializeBackToTop();

}


// =======================================
// LAZY IMAGE LOADING
// =======================================

function initializeLazyImages() {

    const images =
        document.querySelectorAll(
            "img[data-src]"
        );


    if (!images.length) {

        return;

    }


    images.forEach(
        (image) => {

            const source =
                image.dataset.src;


            if (!source) {

                return;

            }


            image.src =
                source;


            image.removeAttribute(
                "data-src"
            );


            image.addEventListener(
                "load",
                () => {

                    image.classList.add(
                        "image-loaded"
                    );

                },
                {
                    once: true
                }
            );


            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-error"
                    );

                },
                {
                    once: true
                }
            );

        }
    );

}


// =======================================
// EXTERNAL LINK SAFETY
// =======================================

function initializeExternalLinks() {

    const links =
        document.querySelectorAll(
            'a[target="_blank"]'
        );


    links.forEach(
        (link) => {

            const currentRel =
                link.getAttribute(
                    "rel"
                ) || "";


            const relValues =
                new Set(
                    currentRel
                        .split(" ")
                        .filter(Boolean)
                );


            relValues.add(
                "noopener"
            );


            relValues.add(
                "noreferrer"
            );


            link.setAttribute(
                "rel",
                [...relValues].join(" ")
            );

        }
    );

}


// =======================================
// PREMIUM CARD INTERACTIONS
// =======================================

function initializeCardInteractions() {

    const cards =
        document.querySelectorAll(
            "[data-premium-card]"
        );


    if (!cards.length) {

        return;

    }


    cards.forEach(
        (card) => {

            card.addEventListener(
                "mouseenter",
                () => {

                    card.classList.add(
                        "card-hover"
                    );

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    card.classList.remove(
                        "card-hover"
                    );

                }
            );


            card.addEventListener(
                "touchstart",
                () => {

                    card.classList.add(
                        "card-touch"
                    );

                },
                {
                    passive: true
                }
            );


            card.addEventListener(
                "touchend",
                () => {

                    window.setTimeout(
                        () => {

                            card.classList.remove(
                                "card-touch"
                            );

                        },
                        300
                    );

                },
                {
                    passive: true
                }
            );

        }
    );

}


// =======================================
// BACK TO TOP BUTTON
// =======================================

function initializeBackToTop() {

    const backToTop =
        document.querySelector(
            "[data-back-to-top]"
        );


    if (!backToTop) {

        return;

    }


    const updateBackToTop =
        () => {

            backToTop.classList.toggle(
                "visible",
                window.scrollY >
                400
            );

        };


    window.addEventListener(
        "scroll",
        updateBackToTop,
        {
            passive: true
        }
    );


    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );


    updateBackToTop();

}


// =======================================
// ONLINE / OFFLINE STATUS
// =======================================

function initializeNetworkStatus() {

    const updateStatus =
        () => {

            document.body.classList.toggle(
                "offline-mode",
                !navigator.onLine
            );


            document.body.classList.toggle(
                "online-mode",
                navigator.onLine
            );

        };


    window.addEventListener(
        "online",
        updateStatus
    );


    window.addEventListener(
        "offline",
        updateStatus
    );


    updateStatus();

}


initializeNetworkStatus();


// =======================================
// PREVENT DOUBLE SUBMIT
// =======================================

document.addEventListener(
    "submit",
    (event) => {

        const form =
            event.target;


        if (
            !form ||
            form.dataset.submitting ===
            "true"
        ) {

            return;

        }


        const submitButton =
            form.querySelector(
                'button[type="submit"], input[type="submit"]'
            );


        if (!submitButton) {

            return;

        }


        form.addEventListener(
            "submit",
            () => {

                form.dataset.submitting =
                    "true";


                submitButton.disabled =
                    true;


                submitButton.setAttribute(
                    "aria-disabled",
                    "true"
                );

            },
            {
                once: true
            }
        );

    }
);


// =======================================
// RESTORE FORM AFTER BROWSER BACK
// =======================================

window.addEventListener(
    "pageshow",
    () => {

        document
            .querySelectorAll(
                "form[data-submitting='true']"
            )
            .forEach(
                (form) => {

                    delete form.dataset.submitting;


                    const submitButton =
                        form.querySelector(
                            'button[type="submit"], input[type="submit"]'
                        );


                    if (submitButton) {

                        submitButton.disabled =
                            false;


                        submitButton.removeAttribute(
                            "aria-disabled"
                        );

                    }

                }
            );

    }
);


// =======================================
// CURRENT YEAR
// =======================================

function initializeCurrentYear() {

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );


    if (!yearElements.length) {

        return;

    }


    const currentYear =
        new Date().getFullYear();


    yearElements.forEach(
        (element) => {

            element.textContent =
                currentYear;

        }
    );

}


initializeCurrentYear();


// =======================================
// FOCUS ACCESSIBILITY
// =======================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Tab"
        ) {

            return;

        }


        document.body.classList.add(
            "keyboard-navigation"
        );

    },
    {
        once: false
    }
);


document.addEventListener(
    "mousedown",
    () => {

        document.body.classList.remove(
            "keyboard-navigation"
        );

    }
);


// =======================================
// PAGE READY CLASS
// =======================================

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "page-loaded"
        );

    },
    {
        once: true
    }
);


// =======================================
// GLOBAL APP STATUS
// =======================================

window.RioMaggiPoint =
    window.RioMaggiPoint || {};


window.RioMaggiPoint.version =
    "1.0.0";


window.RioMaggiPoint.ready =
    true;


// =======================================
// FINAL READY MESSAGE
// =======================================

console.log(
    "======================================="
);

console.log(
    "🍜 RIO MAGGI POINT"
);

console.log(
    "PREMIUM GLOBAL JAVASCRIPT READY"
);

console.log(
    "GLOBAL HELPERS ACTIVE"
);

console.log(
    "NAVIGATION SYSTEM ACTIVE"
);

console.log(
    "MOBILE MENU ACTIVE"
);

console.log(
    "PREMIUM INTERACTIONS ACTIVE"
);

console.log(
    "ACCESSIBILITY SUPPORT ACTIVE"
);

console.log(
    "FINAL APP.JS PART 4/4 LOADED"
);

console.log(
    "======================================="
);
