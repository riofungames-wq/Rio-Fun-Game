const CACHE_NAME = "rio-maggi-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./login.html",
    "./signup.html",
    "./profile.html",
    "./qr.html",
    "./about.html",
    "./contact.html",
    "./feedback.html",
    "./privacy.html",
    "./terms.html",
    "./offline.html",
    "./404.html",
    "./manifest.json",
    "./favicon.ico",
    "./icon-192.png",
    "./icon-512.png"
];

// Install Service Worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Requests
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
        .then((response) => {
            // Save fresh response to cache
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
            });
            return response;
        })
        .catch(() => {
            return caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Show Offline Page for navigation requests
                if (event.request.mode === "navigate") {
                    return caches.match("./offline.html");
                }
            });
        })
    );
});
