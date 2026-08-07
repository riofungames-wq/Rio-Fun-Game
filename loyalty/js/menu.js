/* =====================================================
   RIO MAGGI POINT
   MENU PAGE JAVASCRIPT
   PART 1/3
   HERO SLIDER SYSTEM
===================================================== */



"use strict";





/* ===============================
   DOM READY
================================ */


document.addEventListener(
    "DOMContentLoaded",
    () => {



        initHeroSlider();



    }
);








/* ===============================
   HERO SLIDER
================================ */


function initHeroSlider(){



    const track = document.querySelector(
        ".hero-track"
    );



    const slides = document.querySelectorAll(
        ".hero-slide"
    );



    const dots = document.querySelectorAll(
        ".slider-dot"
    );




    if(
        !track ||
        slides.length === 0
    ){

        return;

    }






    let currentSlide = 0;



    let autoSlideTimer = null;






    function showSlide(index){



        if(index >= slides.length){


            currentSlide = 0;


        }
        else if(index < 0){


            currentSlide = slides.length - 1;


        }
        else{


            currentSlide = index;


        }





        track.style.transform =

        `translateX(-${currentSlide * 100}%)`;






        slides.forEach(
            (slide, i)=>{


                slide.classList.toggle(

                    "active",

                    i === currentSlide

                );


            }
        );







        dots.forEach(
            (dot, i)=>{


                dot.classList.toggle(

                    "active",

                    i === currentSlide

                );


            }
        );



    }









    function nextSlide(){


        showSlide(
            currentSlide + 1
        );


    }







    function startAutoSlide(){



        stopAutoSlide();



        autoSlideTimer = setInterval(

            nextSlide,

            4000

        );


    }







    function stopAutoSlide(){



        if(autoSlideTimer){


            clearInterval(
                autoSlideTimer
            );


            autoSlideTimer = null;


        }


    }







    /* ===============================
       DOT CLICK CONTROL
    ================================ */



    dots.forEach(
        (dot,index)=>{


            dot.addEventListener(
                "click",
                ()=>{


                    showSlide(index);



                    startAutoSlide();


                }
            );


        }
    );









    /* ===============================
       PAUSE ON HOVER
    ================================ */



    const slider = document.querySelector(
        ".menu-hero-slider"
    );



    if(slider){



        slider.addEventListener(
            "mouseenter",
            stopAutoSlide
        );



        slider.addEventListener(
            "mouseleave",
            startAutoSlide
        );


    }







    // Initial Start


    showSlide(0);


    startAutoSlide();



}
/* =====================================================
   RIO MAGGI POINT
   MENU PAGE JAVASCRIPT
   PART 2/3
   CATEGORY SYSTEM
===================================================== */



"use strict";





/* ===============================
   CATEGORY MENU SYSTEM
================================ */


function initCategorySystem(){



    const categoryButtons = document.querySelectorAll(
        ".category-card"
    );



    const heroButtons = document.querySelectorAll(
        ".hero-menu-btn"
    );



    const menuSections = document.querySelectorAll(
        ".menu-category-block"
    );





    if(
        categoryButtons.length === 0 ||
        menuSections.length === 0
    ){

        return;

    }








    function openCategory(categoryName){





        /* ===============================
           ACTIVE CATEGORY BUTTON
        ================================ */


        categoryButtons.forEach(
            (button)=>{


                const target =
                button.dataset.target;



                button.classList.toggle(

                    "active",

                    target === categoryName

                );



            }
        );







        /* ===============================
           SHOW SELECTED MENU
        ================================ */


        menuSections.forEach(
            (section)=>{


                section.classList.toggle(

                    "active",

                    section.id === categoryName

                );


            }
        );







        /* ===============================
           SMOOTH SCROLL
        ================================ */


        const targetSection =
        document.getElementById(
            categoryName
        );



        if(targetSection){



            targetSection.scrollIntoView({

                behavior:"smooth",

                block:"start"

            });


        }



    }








    /* ===============================
       CATEGORY CARD CLICK
    ================================ */


    categoryButtons.forEach(
        (button)=>{


            button.addEventListener(

                "click",

                ()=>{


                    const category =
                    button.dataset.target;



                    openCategory(
                        category
                    );


                }

            );


        }
    );









    /* ===============================
       HERO BUTTON CLICK
    ================================ */


    heroButtons.forEach(
        (button)=>{


            button.addEventListener(

                "click",

                ()=>{


                    const category =
                    button.dataset.category;



                    openCategory(
                        category
                    );


                }

            );


        }
    );





}







/* ===============================
   INITIALIZE
================================ */


document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        initCategorySystem();


    }

);
/* =====================================================
   RIO MAGGI POINT
   MENU PAGE JAVASCRIPT
   PART 3/3 FINAL
   FINAL INITIALIZATION + MOBILE SUPPORT
===================================================== */



"use strict";





/* ===============================
   MOBILE SWIPE SUPPORT
================================ */


function initSliderSwipe(){



    const slider = document.querySelector(
        ".menu-hero-slider"
    );



    const track = document.querySelector(
        ".hero-track"
    );



    const slides = document.querySelectorAll(
        ".hero-slide"
    );



    if(
        !slider ||
        !track ||
        slides.length === 0
    ){

        return;

    }





    let startX = 0;

    let endX = 0;







    slider.addEventListener(

        "touchstart",

        (event)=>{


            startX =
            event.touches[0].clientX;



        },

        {
            passive:true
        }

    );







    slider.addEventListener(

        "touchend",

        (event)=>{


            endX =
            event.changedTouches[0].clientX;



            const swipeDistance =
            startX - endX;





            if(
                Math.abs(swipeDistance) < 50
            ){

                return;

            }






            const currentTransform =
            track.style.transform;





            let currentPosition = 0;





            const match =
            currentTransform.match(
                /\d+/
            );



            if(match){

                currentPosition =
                Number(match[0]);

            }





            let currentIndex =
            currentPosition / 100;







            if(
                swipeDistance > 0 &&
                currentIndex < slides.length - 1
            ){


                currentIndex++;


            }
            else if(
                swipeDistance < 0 &&
                currentIndex > 0
            ){


                currentIndex--;


            }





            track.style.transform =

            `translateX(-${currentIndex * 100}%)`;





        },

        {
            passive:true
        }

    );



}







/* ===============================
   IMAGE LOADING OPTIMIZATION
================================ */


function optimizeImages(){



    const images =
    document.querySelectorAll(
        "img"
    );



    images.forEach(
        (image)=>{


            image.loading = "lazy";



            image.addEventListener(

                "error",

                ()=>{


                    image.style.display =
                    "none";


                },

                {
                    once:true
                }

            );


        }
    );



}







/* ===============================
   FINAL INITIALIZER
================================ */



document.addEventListener(

    "DOMContentLoaded",

    ()=>{



        try {



            initHeroSlider();



            initCategorySystem();



            initSliderSwipe();



            optimizeImages();



        }

        catch(error){



            console.error(

                "Rio Menu Error:",
                error

            );


        }



    }

);
