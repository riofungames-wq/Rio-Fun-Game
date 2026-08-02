// ======================================
// RIO MAGGI POINT
// SERVICE WORKER
// STABLE PWA + CACHE SYSTEM
// COMPLETE CLEAN VERSION
// ======================================

const CACHE_NAME = "rio-maggi-v6";

const STATIC_FILES = [
    "./",
    "./index.html",
    "./card.html",
    "./login.html",
    "./signup.html",
    "./forgot-password.html",
    "./profile.html",
    "./reward.html",
    "./history.html",
    "./menu.html",
    "./feedback.html",
    "./qr.html",
    "./dashboard.html",
    "./admin.html",
    "./admin-login.html",
    "./about.html",
    "./contact.html",
    "./privacy.html",
    "./terms.html",
    "./offline.html",
    "./404.html",
    "./manifest.json",
    "./favicon.ico",
    "./icon-192.png",
    "./icon-512.png"
];


// ======================================
// INSTALL
// ======================================

self.addEventListener(
    "install",
    (event) => {

        event.waitUntil(

            (async () => {

                const cache =
                    await caches.open(
                        CACHE_NAME
                    );


                for (
                    const file
                    of STATIC_FILES
                ) {

                    try {

                        await cache.add(
                            file
                        );

                        console.log(
                            "[SW] Cached:",
                            file
                        );

                    }

                    catch (error) {

                        console.warn(
                            "[SW] Cache skipped:",
                            file,
                            error
                        );

                    }

                }

            })()

        );


        // Activate new SW immediately
        self.skipWaiting();

    }
);


// ======================================
// ACTIVATE
// REMOVE OLD CACHE VERSIONS
// ======================================

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            (async () => {

                const cacheNames =
                    await caches.keys();


                await Promise.all(

                    cacheNames.map(
                        (cacheName) => {

                            if (
                                cacheName !== CACHE_NAME
                            ) {

                                console.log(
                                    "[SW] Deleting old cache:",
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


                // Take control of all open pages
                await self.clients.claim();

            })()

        );

    }
);


// ======================================
// FETCH
// SAME-ORIGIN REQUESTS ONLY
// ======================================

self.addEventListener(
    "fetch",
    (event) => {

        // Ignore non-GET requests
        if (
            event.request.method !== "GET"
        ) {

            return;

        }


        const requestURL =
            new URL(
                event.request.url
            );


        // Ignore external resources
        // Firebase, Google Fonts,
        // Font Awesome CDN, QRCode CDN etc.
        if (
            requestURL.origin !==
            self.location.origin
        ) {

            return;

        }


        event.respondWith(

            handleFetch(
                event.request
            )

        );

    }
);


// ======================================
// FETCH HANDLER
// NETWORK FIRST
// ======================================

async function handleFetch(
    request
) {

    const cache =
        await caches.open(
            CACHE_NAME
        );


    try {

        // ==================================
        // ALWAYS TRY NETWORK FIRST
        // This prevents old QR HTML/JS/CSS
        // from being permanently served.
        // ==================================

        const networkResponse =
            await fetch(
                request
            );


        // ==================================
        // CACHE SUCCESSFUL RESPONSES
        // ==================================

        if (
            networkResponse &&
            networkResponse.ok &&
            networkResponse.type === "basic"
        ) {

            await cache.put(
                request,
                networkResponse.clone()
            );

        }


        return networkResponse;

    }


    catch (error) {

        console.warn(
            "[SW] Network failed:",
            request.url
        );


        // ==================================
        // FALLBACK TO CACHE
        // ==================================

        const cachedResponse =
            await cache.match(
                request
            );


        if (
            cachedResponse
        ) {

            return cachedResponse;

        }


        // ==================================
        // OFFLINE HTML NAVIGATION
        // ==================================

        if (
            request.mode === "navigate"
        ) {

            const offlinePage =
                await cache.match(
                    "./offline.html"
                );


            if (
                offlinePage
            ) {

                return offlinePage;

            }

        }


        // ==================================
        // FINAL OFFLINE RESPONSE
        // ==================================

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

}


// ======================================
// MESSAGE EVENT
// FORCE NEW SERVICE WORKER
// ======================================

self.addEventListener(
    "message",
    (event) => {

        if (
            event.data &&
            event.data.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


// ======================================
// SERVICE WORKER READY
// ======================================

console.log(
    "================================"
);

console.log(
    "RIO MAGGI POINT"
);

console.log(
    "Service Worker v6 Ready"
);

console.log(
    "Network First Cache Strategy"
);

console.log(
    "QR Page Cache Updated"
);

console.log(
    "GitHub Pages Compatible"
);

console.log(
    "================================"
);
