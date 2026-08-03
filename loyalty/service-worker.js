/* =========================================================
   RIO MAGGI POINT
   SERVICE WORKER
   COMPLETE FIXED VERSION
   GitHub Pages + PWA + Offline Support
========================================================= */


/* =========================================================
   CACHE VERSION
========================================================= */

const CACHE_NAME =
    "rio-maggi-v7";


/* =========================================================
   CACHE PREFIX
   Only our own caches will be deleted.
========================================================= */

const CACHE_PREFIX =
    "rio-maggi-";


/* =========================================================
   OFFLINE PAGE
========================================================= */

const OFFLINE_PAGE =
    "./offline.html";


/* =========================================================
   STATIC ASSETS
   IMPORTANT LOCAL FILES
========================================================= */

const STATIC_ASSETS = [

    "./",

    "./index.html",

    "./dashboard.html",

    "./profile.html",

    "./edit-profile.html",

    "./qr.html",

    "./history.html",

    "./menu.html",

    "./reward.html",

    "./feedback.html",

    "./card.html",

    "./login.html",

    "./signup.html",

    "./forgot-password.html",

    "./about.html",

    "./contact.html",

    "./privacy.html",

    "./terms.html",

    "./offline.html",

    "./404.html",


    /* =========================================
       ADMIN PAGES
    ========================================= */

    "./admin.html",

    "./admin-login.html",

    "./admin-dashboard.html",

    "./admin-customers.html",

    "./admin-export.html",

    "./admin-reports.html",

    "./admin-rewards.html",

    "./admin-settings.html",


    /* =========================================
       CORE FILES
    ========================================= */

    "./manifest.json",

    "./robots.txt",

    "./sitemap.xml",

    "./favicon.ico",

    "./icon-192.png",

    "./icon-512.png",


    /* =========================================
       QR PAGE CORE FILES
    ========================================= */

    "./qr.css",

    "./qr.js",

    "./firebase-config.js",


    /* =========================================
       COMMON ASSETS
       Add only files that actually exist.
    ========================================= */

    "./assets.gitkeep",


    /* =========================================
       AVATARS
       Keep these only if files exist.
    ========================================= */

    "./assets/avatars/male.png",

    "./assets/avatars/female.png"

];


/* =========================================================
   INSTALL EVENT
========================================================= */

self.addEventListener(

    "install",

    (event) => {

        console.log(

            "[Rio SW] Installing:",

            CACHE_NAME

        );


        event.waitUntil(

            installCache()

        );


        /*
         * Activate the new service worker
         * immediately after installation.
         */

        self.skipWaiting();

    }

);


/* =========================================================
   INSTALL CACHE
   Individual caching prevents one missing file
   from breaking the complete installation.
========================================================= */

async function installCache() {

    const cache =

        await caches.open(

            CACHE_NAME

        );


    for (

        const asset of STATIC_ASSETS

    ) {

        try {

            const response =

                await fetch(

                    asset,

                    {

                        cache:
                            "no-cache",

                        credentials:
                            "same-origin"

                    }

                );


            /*
             * Only cache valid same-origin
             * responses.
             */

            if (

                response.ok &&

                response.type ===
                    "basic"

            ) {

                await cache.put(

                    asset,

                    response.clone()

                );


                console.log(

                    "[Rio SW] Cached:",

                    asset

                );

            }

            else {

                console.warn(

                    "[Rio SW] Asset not cached:",

                    asset,

                    response.status

                );

            }

        }

        catch (error) {

            /*
             * Do not fail installation if
             * one optional asset is missing.
             */

            console.warn(

                "[Rio SW] Cache skipped:",

                asset,

                error

            );

        }

    }


    console.log(

        "[Rio SW] Installation completed:",

        CACHE_NAME

    );

}


/* =========================================================
   ACTIVATE EVENT
========================================================= */

self.addEventListener(

    "activate",

    (event) => {

        console.log(

            "[Rio SW] Activating:",

            CACHE_NAME

        );


        event.waitUntil(

            activateServiceWorker()

        );

    }

);


/* =========================================================
   ACTIVATE SERVICE WORKER
   Delete only Rio Maggi caches.
========================================================= */

async function activateServiceWorker() {

    const cacheNames =

        await caches.keys();


    await Promise.all(

        cacheNames.map(

            (cacheName) => {

                /*
                 * Delete only our own old caches.
                 * Do not delete unrelated caches
                 * from the same domain.
                 */

                if (

                    cacheName.startsWith(

                        CACHE_PREFIX

                    ) &&

                    cacheName !==
                        CACHE_NAME

                ) {

                    console.log(

                        "[Rio SW] Removing old cache:",

                        cacheName

                    );


                    return caches.delete(

                        cacheName

                    );

                }


                return Promise.resolve();

            }

        )

    );


    /*
     * Take control of currently open pages.
     */

    await self.clients.claim();


    console.log(

        "[Rio SW] Active:",

        CACHE_NAME

    );

}


/* =========================================================
   FETCH EVENT
========================================================= */

self.addEventListener(

    "fetch",

    (event) => {

        const request =

            event.request;


        /*
         * Only GET requests.
         */

        if (

            request.method !==
                "GET"

        ) {

            return;

        }


        const url =

            new URL(

                request.url

            );


        /*
         * Ignore external resources.
         *
         * Firebase
         * Google
         * Font Awesome CDN
         * QRCode CDN
         * Google Fonts
         * Other external services
         */

        if (

            url.origin !==
                self.location.origin

        ) {

            return;

        }


        /*
         * HTML navigation:
         * Network First
         *
         * This helps prevent old HTML
         * from remaining stuck in cache.
         */

        if (

            request.mode ===
                "navigate"

        ) {

            event.respondWith(

               handleNavigation(

                    request

                )

            );


            return;

        }


        /*
         * Static assets:
         * Cache First + Background Update
         *
         * Useful for:
         * CSS
         * JS
         * Images
         * Fonts
         * Icons
         */

        event.respondWith(

            handleStaticAsset(

                request

            )

        );

    }

);


/* =========================================================
   HANDLE HTML NAVIGATION
   NETWORK FIRST
   CACHE FALLBACK
========================================================= */

async function handleNavigation(

    request

) {

    try {

        /*
         * Always try the latest network HTML.
         */

        const networkResponse =

            await fetch(

                request,

                {

                    cache:
                        "no-store",

                    credentials:
                        "same-origin"

                }

            );


        /*
         * Cache the latest HTML in background.
         */

        if (

            isValidSameOriginResponse(

                networkResponse

            )

        ) {

            updateCacheInBackground(

                request,

                networkResponse.clone()

            );

        }


        return networkResponse;

    }

    catch (error) {

        console.warn(

            "[Rio SW] Navigation network failed:",

            request.url

        );


        /*
         * Try exact cached page.
         */

        const cachedResponse =

            await caches.match(

                request

            );


        if (

            cachedResponse

        ) {

            return cachedResponse;

        }


        /*
         * Try offline page.
         */

        const offlineResponse =

            await caches.match(

                OFFLINE_PAGE

            );


        if (

            offlineResponse

        ) {

            return offlineResponse;

        }


        /*
         * Final fallback.
         */

        return createOfflineResponse();

    }

}


/* =========================================================
   HANDLE STATIC ASSETS
   CACHE FIRST + NETWORK UPDATE
========================================================= */

async function handleStaticAsset(

    request

) {

    const cachedResponse =

        await caches.match(

            request

        );


    /*
     * If cached version exists,
     * return it immediately.
     */

    if (

        cachedResponse

    ) {

        /*
         * Update cache in background.
         * This allows CSS/JS updates
         * without blocking page load.
         */

        updateStaticAsset(

            request

        );


        return cachedResponse;

    }


    /*
     * No cache available.
     * Fetch from network.
     */

    try {

        const networkResponse =

            await fetch(

                request

            );


        if (

            isValidSameOriginResponse(

                networkResponse

            )

        ) {

            updateCacheInBackground(

                request,

                networkResponse.clone()

            );

        }


        return networkResponse;

    }

    catch (error) {

        console.warn(

            "[Rio SW] Asset unavailable:",

            request.url

        );


        return createOfflineResponse();

    }

}


/* =========================================================
   UPDATE STATIC ASSET
========================================================= */

async function updateStaticAsset(

    request

) {

    try {

        const response =

            await fetch(

                request,

                {

                    cache:
                        "no-cache"

                }

            );


        if (

            isValidSameOriginResponse(

                response

            )

        ) {

            updateCacheInBackground(

                request,

                response.clone()

            );

        }

    }

    catch (error) {

        console.warn(

            "[Rio SW] Background update failed:",

            request.url

        );

    }

}


/* =========================================================
   VALID RESPONSE CHECK
========================================================= */

function isValidSameOriginResponse(

    response

) {

    if (!response) {

        return false;

    }


    if (!response.ok) {

        return false;

    }


    if (

        response.type !==
            "basic"

    ) {

        return false;

    }


    return true;

}


/* =========================================================
   BACKGROUND CACHE UPDATE
========================================================= */

function updateCacheInBackground(

    request,

    response

) {

    caches

        .open(

            CACHE_NAME

        )

        .then(

            (cache) => {

                return cache.put(

                    request,

                    response

                );

            }

        )

        .catch(

            (error) => {

                console.warn(

                    "[Rio SW] Cache update failed:",

                    error

                );

            }

        );

}


/* =========================================================
   OFFLINE RESPONSE
========================================================= */

function createOfflineResponse() {

    return new Response(

        "You are currently offline.",

        {

            status:
                503,

            statusText:
                "Service Unavailable",

            headers: {

                "Content-Type":
                    "text/plain; charset=utf-8"

            }

        }

    );

}


/* =========================================================
   MESSAGE EVENT
   FORCE SERVICE WORKER UPDATE
========================================================= */

self.addEventListener(

    "message",

    (event) => {

        if (

            !event.data ||

            typeof event.data !==
                "object"

        ) {

            return;

        }


        /*
         * Website can send:
         *
         * {
         *     type: "SKIP_WAITING"
         * }
         */

        if (

            event.data.type ===
                "SKIP_WAITING"

        ) {

            console.log(

                "[Rio SW] Skip waiting requested."

            );


            self.skipWaiting();

        }

    }

);


/* =========================================================
   SERVICE WORKER READY
========================================================= */

console.log(

    "================================"

);

console.log(

    "RIO MAGGI POINT"

);

console.log(

    "SERVICE WORKER V7"

);

console.log(

    "NETWORK FIRST HTML"

);

console.log(

    "CACHE FIRST STATIC ASSETS"

);

console.log(

    "BACKGROUND CACHE UPDATE"

);

console.log(

    "GITHUB PAGES SAFE"

);

console.log(

    "OFFLINE FALLBACK ENABLED"

);

console.log(

    "================================"

);
