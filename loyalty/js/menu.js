// =====================================
// RIO MAGGI POINT
// PREMIUM VEG FOOD MENU
// MENU.JS - PART 1
// =====================================


// =====================================
// WAIT FOR DOM
// =====================================

document.addEventListener(

    "DOMContentLoaded",

    () => {


        // =====================================
        // CATEGORY CARDS
        // =====================================

        const categoryCards =

            document.querySelectorAll(

                ".category-card"

            );


        // =====================================
        // FOOD SECTIONS
        // =====================================

        const foodSections =

            document.querySelectorAll(

                ".food-section"

            );


        // =====================================
        // CHECK CATEGORY DATA
        // =====================================

        if (

            !categoryCards.length ||

            !foodSections.length

        ) {

            console.warn(

                "Menu categories or food sections not found."

            );

            return;

        }


        // =====================================
        // CATEGORY CLICK EVENT
        // =====================================

        categoryCards.forEach(

            card => {


                card.addEventListener(

                    "click",

                    () => {


                        // =====================================
                        // GET TARGET SECTION
                        // =====================================

                        const targetId =

                            card.dataset.target;


                        // =====================================
                        // INVALID TARGET CHECK
                        // =====================================

                        if (!targetId) {

                            console.warn(

                                "Category target not found."

                            );

                            return;

                        }


                        // =====================================
                        // REMOVE ACTIVE FROM ALL
                        // =====================================

                        categoryCards.forEach(

                            item => {

                                item.classList.remove(

                                    "active"

                                );

                            }

                        );


                        // =====================================
                        // ADD ACTIVE TO CLICKED CATEGORY
                        // =====================================

                        card.classList.add(

                            "active"

                        );


                        // =====================================
                        // HIDE ALL FOOD SECTIONS
                        // =====================================

                        foodSections.forEach(

                            section => {

                                section.classList.remove(

                                    "active"

                                );

                            }

                        );


                        // =====================================
                        // FIND TARGET FOOD SECTION
                        // =====================================

                        const targetSection =

                            document.getElementById(

                                targetId

                            );


                        // =====================================
                        // SHOW TARGET SECTION
                        // =====================================

                        if (targetSection) {

                            targetSection.classList.add(

                                "active"

                            );


                            // =====================================
                            // SMOOTH SCROLL
                            // =====================================

                            targetSection.scrollIntoView({

                                behavior: "smooth",

                                block: "start"

                            });

                        }


                    }

                );


            }

        );


        // =====================================
        // MENU READY
        // =====================================

        console.log(

            "Rio Maggi Point Premium Menu Loaded Successfully"

        );


    }

);


// =====================================
// MENU.JS - PART 1 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM VEG FOOD MENU
// MENU.JS - PART 2
// =====================================


// =====================================
// CATEGORY ACTIVE STATE ON SCROLL
// =====================================

document.addEventListener(

    "DOMContentLoaded",

    () => {


        // =====================================
        // GET CATEGORY CARDS
        // =====================================

        const categoryCards =

            document.querySelectorAll(

                ".category-card"

            );


        // =====================================
        // GET FOOD SECTIONS
        // =====================================

        const foodSections =

            document.querySelectorAll(

                ".food-section"

            );


        // =====================================
        // STOP IF ELEMENTS NOT FOUND
        // =====================================

        if (

            !categoryCards.length ||

            !foodSections.length

        ) {

            return;

        }


        // =====================================
        // UPDATE ACTIVE CATEGORY
        // =====================================

        const updateActiveCategory =

            () => {


                let currentSection =

                    null;


                const scrollPosition =

                    window.scrollY + 180;


                // =====================================
                // FIND CURRENT SECTION
                // =====================================

                foodSections.forEach(

                    section => {


                        const sectionTop =

                            section.offsetTop;


                        const sectionBottom =

                            sectionTop +

                            section.offsetHeight;


                        if (

                            scrollPosition >= sectionTop &&

                            scrollPosition < sectionBottom

                        ) {

                            currentSection =

                                section.id;

                        }


                    }

                );


                // =====================================
                // UPDATE CATEGORY CARDS
                // =====================================

                if (currentSection) {


                    categoryCards.forEach(

                        card => {


                            const target =

                                card.dataset.target;


                            card.classList.toggle(

                                "active",

                                target === currentSection

                            );


                        }

                    );


                }


            };


        // =====================================
        // SCROLL EVENT
        // =====================================

        window.addEventListener(

            "scroll",

            updateActiveCategory,

            {

                passive: true

            }

        );


        // =====================================
        // INITIAL ACTIVE CATEGORY
        // =====================================

        updateActiveCategory();


    }

);


// =====================================
// MENU.JS - PART 2 END
// =====================================
// =====================================
// RIO MAGGI POINT
// PREMIUM VEG FOOD MENU
// MENU.JS - PART 3 OF 3
// FINAL PART
// =====================================


// =====================================
// ACTIVE CATEGORY ON PAGE LOAD
// =====================================

document.addEventListener(

    "DOMContentLoaded",

    () => {


        // =====================================
        // GET ALL CATEGORY CARDS
        // =====================================

        const categoryCards =

            document.querySelectorAll(

                ".category-card"

            );


        // =====================================
        // GET ALL FOOD SECTIONS
        // =====================================

        const foodSections =

            document.querySelectorAll(

                ".food-section"

            );


        // =====================================
        // CHECK ELEMENTS
        // =====================================

        if (

            !categoryCards.length ||

            !foodSections.length

        ) {

            console.warn(

                "Menu elements are missing."

            );

            return;

        }


        // =====================================
        // SHOW FIRST CATEGORY BY DEFAULT
        // =====================================

        let activeCard =

            document.querySelector(

                ".category-card.active"

            );


        // =====================================
        // IF NO ACTIVE CARD
        // =====================================

        if (!activeCard) {


            activeCard =

                categoryCards[0];


            activeCard.classList.add(

                "active"

            );


        }


        // =====================================
        // GET DEFAULT TARGET
        // =====================================

        const defaultTarget =

            activeCard.dataset.target;


        // =====================================
        // SHOW DEFAULT FOOD SECTION
        // =====================================

        foodSections.forEach(

            section => {


                if (

                    section.id ===

                    defaultTarget

                ) {


                    section.classList.add(

                        "active"

                    );


                }

                else {


                    section.classList.remove(

                        "active"

                    );


                }


            }

        );


        // =====================================
        // CATEGORY CLICK HANDLER
        // =====================================

        categoryCards.forEach(

            card => {


                card.addEventListener(

                    "click",

                    () => {


                        const targetId =

                            card.dataset.target;


                        // =====================================
                        // UPDATE ACTIVE CARD
                        // =====================================

                        categoryCards.forEach(

                            item => {

                                item.classList.remove(

                                    "active"

                                );

                            }

                        );


                        card.classList.add(

                            "active"

                        );


                        // =====================================
                        // UPDATE FOOD SECTION
                        // =====================================

                        foodSections.forEach(

                            section => {


                                section.classList.toggle(

                                    "active",

                                    section.id ===

                                    targetId

                                );


                            }

                        );


                        // =====================================
                        // SCROLL TO FOOD AREA
                        // =====================================

                        const targetSection =

                            document.getElementById(

                                targetId

                            );


                        if (targetSection) {


                            targetSection.scrollIntoView({

                                behavior: "smooth",

                                block: "start"

                            });


                        }


                    }

                );


            }

        );


        // =====================================
        // MENU SYSTEM READY
        // =====================================

        console.log(

            "🍜 Rio Maggi Point Menu System Ready"

        );


    }

);


// =====================================
// END MENU.JS
// =====================================
