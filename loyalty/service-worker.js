// ======================================
// RIO MAGGI POINT
// SERVICE WORKER
// FINAL STABLE VERSION
// PART 1 / 3
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

self.addEventListener("install", (event) => {

    event.waitUntil(

        (async () => {

            const cache = await caches.open(CACHE_NAME);

            // Cache files individually.
            // If one file fails, installation continues.
            for (const file of STATIC_FILES) {

                try {

                    const response = await fetch(file, {
                        cache: "no-cache"
                    });

                    if (
                        response.ok &&
                        response.type === "basic"
                    ) {

                        await cache.put(
                            file,
                            response
                        );

                        console.log(
                            "[SW] Cached:",
                            file
                        );

                    }

                } catch (error) {

                    console.warn(
                        "[SW] Cache skipped:",
                        file,
                        error
                    );

                }

            }

        })()

    );

    // Activate new service worker immediately.
    self.skipWaiting();

});


// ======================================
// SERVICE WORKER PART 1 END
// NEXT: PART 2 / 3
// ======================================
// ======================================
// RIO MAGGI POINT
// SERVICE WORKER
// FINAL STABLE VERSION
// PART 2 / 3
// ======================================


// ======================================
// ACTIVATE
// REMOVE OLD CACHE
// ======================================

self.addEventListener("activate", (event) => {

    event.waitUntil(

        (async () => {

            const cacheNames =
                await caches.keys();

            await Promise.all(

                cacheNames.map((cacheName) => {

                    // Delete every old Rio cache.
                    // Keep only the current version.
                    if (
                        cacheName !== CACHE_NAME
                    ) {

                        console.log(
                            "[SW] Removing old cache:",
                            cacheName
                        );

                        return caches.delete(
                            cacheName
                        );

                    }

                    return Promise.resolve();

                })

            );

            // Take control of all open pages
            // without requiring a refresh.
            await self.clients.claim();

            console.log(
                "[SW] Activated:",
                CACHE_NAME
            );

        })()

    );

});


// ======================================
// FETCH
// GITHUB PAGES SAFE
// ======================================

self.addEventListener("fetch", (event) => {

    // Only handle GET requests.
    if (
        event.request.method !== "GET"
    ) {

        return;

    }


    const url =
        new URL(
            event.request.url
        );


    // Ignore external requests.
    // Firebase, Google CDN, QR libraries,
    // Font Awesome, etc. stay network-controlled.
    if (
        url.origin !== self.location.origin
    ) {

        return;

    }


    event.respondWith(

        handleFetch(
            event.request
        )

    );

});


// ======================================
// HANDLE FETCH
// NETWORK FIRST
// CACHE FALLBACK
// ======================================

async function handleFetch(request) {

    const cache =
        await caches.open(
            CACHE_NAME
        );


    try {

        // Always try the latest network version first.
        const networkResponse =
            await fetch(
                request
            );


        // Cache only valid same-origin responses.
        if (
            networkResponse &&
            networkResponse.ok &&
            networkResponse.type === "basic"
        ) {

            // Clone before storing because
            // a response body can only be consumed once.
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


        // If network fails,
        // try returning the cached version.
        const cachedResponse =
            await cache.match(
                request
            );


        if (cachedResponse) {

            return cachedResponse;

        }


        // For page navigation,
        // show the offline page.
        if (
            request.mode === "navigate"
        ) {

            const offlinePage =
                await cache.match(
                    "./offline.html"
                );


            if (offlinePage) {

                return offlinePage;

            }

        }


        // Final fallback.
        return new Response(

            "You are currently offline.",

            {

                status: 503,

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
// SERVICE WORKER PART 2 END
// NEXT: PART 3 / 3
// ======================================
// ======================================
// RIO MAGGI POINT
// SERVICE WORKER
// FINAL STABLE VERSION
// PART 3 / 3
// ======================================


// ======================================
// MESSAGE EVENT
// ======================================

self.addEventListener(
    "message",
    (event) => {

        if (
            !event.data ||
            typeof event.data !== "object"
        ) {

            return;

        }


        // Allow the website to force
        // immediate activation of a new SW.
        if (
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
    "Network First + Cache Fallback"
);

console.log(
    "GitHub Pages Compatible"
);

console.log(
    "Offline Fallback Ready"
);

console.log(
    "================================"
);


// ======================================
// SERVICE WORKER END
// ======================================
