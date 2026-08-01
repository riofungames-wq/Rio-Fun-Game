/* =========================================================
   RIO MAGGI POINT
   COMMON.JS
   FINAL PREMIUM SYSTEM
   PART 1/4

   CORE NAVIGATION SYSTEM
   PAGE DETECTION
   ACTIVE NAVIGATION
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       RIO COMMON CONFIG
    ===================================================== */

    const RIO_CONFIG = {

        /* -----------------------------------------------
           MAIN LOYALTY FOLDER
        ----------------------------------------------- */

        basePath:
            "/Rio-Fun-Game/loyalty/",


        /* -----------------------------------------------
           PAGE FILES
        ----------------------------------------------- */

        pages: {

            home:
                "index.html",

            qr:
                "qr.html",

            history:
                "history.html",

            menu:
                "menu.html",

            review:
                "feedback.html",

            profile:
                "profile.html"

        }

    };


    /* =====================================================
       GET CURRENT PAGE
    ===================================================== */

    function getCurrentPage() {

        const currentPath =
            window.location.pathname
                .toLowerCase()
                .split("?")[0]
                .split("#")[0];


        /* -----------------------------------------------
           GET FILE NAME
        ----------------------------------------------- */

        let fileName =
            currentPath
                .split("/")
                .filter(Boolean)
                .pop();


        /* -----------------------------------------------
           DEFAULT HOME
        ----------------------------------------------- */

        if (
            !fileName ||
            fileName === "loyalty"
        ) {

            return "home";

        }


        /* -----------------------------------------------
           NORMALIZE
        ----------------------------------------------- */

        fileName =
            fileName.toLowerCase();


        /* -----------------------------------------------
           PAGE MATCHING
        ----------------------------------------------- */

        if (
            fileName ===
            RIO_CONFIG.pages.home
        ) {

            return "home";

        }


        if (
            fileName ===
            RIO_CONFIG.pages.qr
        ) {

            return "qr";

        }


        if (
            fileName ===
            RIO_CONFIG.pages.history
        ) {

            return "history";

        }


        if (
            fileName ===
            RIO_CONFIG.pages.menu
        ) {

            return "menu";

        }


        if (
            fileName ===
            RIO_CONFIG.pages.review
        ) {

            return "review";

        }


        if (
            fileName ===
            RIO_CONFIG.pages.profile
        ) {

            return "profile";

        }


        /* -----------------------------------------------
           FALLBACK
        ----------------------------------------------- */

        return "home";

    }


    /* =====================================================
       SET ACTIVE NAVIGATION
    ===================================================== */

    function setActiveNavigation() {

        const currentPage =
            getCurrentPage();


        /* -----------------------------------------------
           ALL NAV LINKS
        ----------------------------------------------- */

        const navLinks =
            document.querySelectorAll(

                "[data-nav-page]"

            );


        if (
            !navLinks.length
        ) {

            return;

        }


        /* -----------------------------------------------
           REMOVE OLD ACTIVE
        ----------------------------------------------- */

        navLinks.forEach(

            function (link) {

                link.classList.remove(

                    "active"

                );

                link.removeAttribute(

                    "aria-current"

                );

            }

        );


        /* -----------------------------------------------
           ADD ACTIVE
        ----------------------------------------------- */

        navLinks.forEach(

            function (link) {

                const pageName =

                    (

                        link.dataset.navPage

                        ||

                        ""

                    )

                    .toLowerCase();


                if (
                    pageName ===
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


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializeRioNavigation() {

        setActiveNavigation();

    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initializeRioNavigation

        );

    }

    else {

        initializeRioNavigation();

    }


    /* =====================================================
       EXPOSE CONFIG
       Future Parts के लिए
    ===================================================== */

    window.RIO_CONFIG =
        RIO_CONFIG;


    window.RIO_NAVIGATION = {

        getCurrentPage:
            getCurrentPage,

        setActiveNavigation:
            setActiveNavigation

    };


})();


/* =========================================================
   END COMMON.JS
   FINAL PREMIUM SYSTEM
   PART 1/4
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   COMMON.JS
   FINAL PREMIUM SYSTEM
   PART 2/4

   NAVIGATION ROUTING
   CORRECT PAGE LINKS
   HOME / QR / HISTORY / MENU / REVIEW / PROFILE
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       WAIT FOR DOM
    ===================================================== */

    function initializeRioRouting() {


        /* =================================================
           CHECK CONFIG
        ================================================= */

        if (
            !window.RIO_CONFIG ||
            !window.RIO_CONFIG.pages
        ) {

            console.warn(

                "RIO_CONFIG not found."

            );

            return;

        }


        const pages =
            window.RIO_CONFIG.pages;


        /* =================================================
           GET ALL NAVIGATION LINKS
        ================================================= */

        const navLinks =

            document.querySelectorAll(

                "[data-nav-page]"

            );


        if (
            !navLinks.length
        ) {

            return;

        }


        /* =================================================
           SET CORRECT HREF
        ================================================= */

        navLinks.forEach(

            function (link) {


                const pageName =

                    (

                        link.dataset.navPage

                        ||

                        ""

                    )

                    .toLowerCase()

                    .trim();


                /* -----------------------------------------
                   IGNORE UNKNOWN PAGE
                ----------------------------------------- */

                if (
                    !pages[pageName]
                ) {

                    console.warn(

                        "Unknown navigation page:",

                        pageName

                    );

                    return;

                }


                /* -----------------------------------------
                   CREATE CORRECT URL
                ----------------------------------------- */

                const correctUrl =

    window.RIO_CONFIG.basePath +

    pages[pageName];


                /* -----------------------------------------
                   APPLY HREF
                ----------------------------------------- */

                link.setAttribute(

                    "href",

                    correctUrl

                );


            }

        );


    }


    /* =====================================================
       DOM READY
    ===================================================== */

    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initializeRioRouting

        );

    }

    else {

        initializeRioRouting();

    }


})();


/* =========================================================
   END PART 2/4
========================================================= */
/* =========================================================
   RIO MAGGI POINT
   COMMON.JS
   FINAL PREMIUM SYSTEM
   PART 3/4

   NAVIGATION CLICK HANDLER
   PAGE TRANSITION
   DOUBLE CLICK PROTECTION
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       NAVIGATION INITIALIZATION
    ===================================================== */

    function initializeRioClickHandler() {


        /* =================================================
           GET ALL NAVIGATION LINKS
        ================================================= */

        const navLinks =

            document.querySelectorAll(

                "[data-nav-page]"

            );


        if (
            !navLinks.length
        ) {

            return;

        }


        /* =================================================
           CLICK HANDLER
        ================================================= */

        navLinks.forEach(

            function (link) {


                link.addEventListener(

                    "click",

                    function (event) {


                        /* ---------------------------------
                           ALLOW NEW TAB / SPECIAL CLICKS
                        --------------------------------- */

                        if (

                            event.ctrlKey ||

                            event.metaKey ||

                            event.shiftKey ||

                            event.altKey ||

                            event.button !== 0

                        ) {

                            return;

                        }


                        /* ---------------------------------
                           GET TARGET URL
                        --------------------------------- */

                        const targetUrl =

                            link.getAttribute(

                                "href"

                            );


                        /* ---------------------------------
                           STOP IF URL IS INVALID
                        --------------------------------- */

                        if (

                            !targetUrl ||

                            targetUrl === "#"

                        ) {

                            return;

                        }


                        /* ---------------------------------
                           SAME PAGE CHECK
                        --------------------------------- */

                        const currentUrl =

                            window.location.href;


                        const targetObject =

                            new URL(

                                targetUrl,

                                window.location.href

                            );


                        const currentObject =

                            new URL(

                                currentUrl

                            );


                        const samePage =

                            targetObject.pathname ===

                            currentObject.pathname;


                        /* ---------------------------------
                           SAME PAGE
                           No unnecessary reload
                        --------------------------------- */

                        if (
                            samePage
                        ) {

                            event.preventDefault();

                            return;

                        }


                        /* ---------------------------------
                           PREVENT DOUBLE CLICK
                        --------------------------------- */

                        if (
    link.dataset.navigating ===
    "true"
) {

    event.preventDefault();

    return;

}

link.dataset.navigating =
    "true";

/* ---------------------------------
   FAILSAFE
   Unlock after 3 seconds
--------------------------------- */

setTimeout(

    function () {

        delete link.dataset.navigating;

    },

    3000

);


                        /* ---------------------------------
                           PAGE TRANSITION
                        --------------------------------- */

                        document.body.classList.add(

                            "rio-page-exit"

                        );


                    },

                    false

                );


            }

        );


    }


    /* =====================================================
       PAGE EXIT ANIMATION
    ===================================================== */

    function addPageExitAnimation() {

        const style =

            document.createElement(

                "style"

            );


        style.id =

            "rio-page-exit-style";


        style.textContent = `

            .rio-page-exit {

                animation:

                    rioPageExit

                    .22s

                    ease

                    forwards;

            }

            @keyframes rioPageExit {

                from {

                    opacity: 1;

                }

                to {

                    opacity: 0;

                }

            }

        `;


        if (

            !document.getElementById(

                "rio-page-exit-style"

            )

        ) {

            document.head.appendChild(

                style

            );

        }

    }


    /* =====================================================
       DOM READY
    ===================================================== */

    function initialize() {

        addPageExitAnimation();

        initializeRioClickHandler();

    }


    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initialize

        );

    }

    else {

        initialize();

    }


})();


/* =========================================================
   END PART 3/4
========================================================= *//* =========================================================
   RIO MAGGI POINT
   COMMON.JS
   FINAL PREMIUM SYSTEM
   PART 4/4

   FINAL INITIALIZATION
   NAVIGATION CONSISTENCY
   ACTIVE STATE REFRESH
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       FINAL NAVIGATION CHECK
    ===================================================== */

    function rioFinalNavigationCheck() {


        /* =================================================
           GET CURRENT PAGE
        ================================================= */

        if (
            !window.RIO_NAVIGATION ||
            typeof window.RIO_NAVIGATION
                .getCurrentPage !==
                "function"
        ) {

            return;

        }


        const currentPage =

            window.RIO_NAVIGATION
                .getCurrentPage();


        /* =================================================
           GET NAVIGATION LINKS
        ================================================= */

        const navLinks =

            document.querySelectorAll(

                "[data-nav-page]"

            );


        if (
            !navLinks.length
        ) {

            return;

        }


        /* =================================================
           FINAL ACTIVE STATE
        ================================================= */

        navLinks.forEach(

            function (link) {


                const pageName =

                    (

                        link.dataset.navPage

                        ||

                        ""

                    )

                    .toLowerCase()

                    .trim();


                /* -----------------------------------------
                   REMOVE ACTIVE
                ----------------------------------------- */

                link.classList.remove(

                    "active"

                );

                link.removeAttribute(

                    "aria-current"

                );


                /* -----------------------------------------
                   APPLY ACTIVE
                ----------------------------------------- */

                if (
                    pageName ===
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


    /* =====================================================
       FINAL PAGE LOAD
    ===================================================== */

    function initializeRioCommonSystem() {


        /* -----------------------------------------------
           ACTIVE NAVIGATION
        ----------------------------------------------- */

        rioFinalNavigationCheck();


        /* -----------------------------------------------
           REMOVE PAGE EXIT CLASS
        ----------------------------------------------- */

        document.body.classList.remove(

            "rio-page-exit"

        );


        /* -----------------------------------------------
           MARK SYSTEM READY
        ----------------------------------------------- */

        document.documentElement.classList.add(

            "rio-common-ready"

        );


    }


    /* =====================================================
       PAGE SHOW EVENT
       Back / Forward navigation support
    ===================================================== */

    window.addEventListener(

        "pageshow",

        function () {

            rioFinalNavigationCheck();

            document.body.classList.remove(

                "rio-page-exit"

            );

        }

    );


    /* =====================================================
       DOM READY
    ===================================================== */

    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initializeRioCommonSystem

        );

    }

    else {

        initializeRioCommonSystem();

    }


    /* =====================================================
       FINAL GLOBAL API
    ===================================================== */

    window.RIO_COMMON = {

        refreshNavigation:

            rioFinalNavigationCheck

    };


})();


/* =========================================================
   END COMMON.JS
   FINAL PREMIUM SYSTEM
   PART 4/4
========================================================= */
