// ======================================
// RIO MAGGI POINT
// SERVICE WORKER
// PART 1
// ======================================

const CACHE_NAME = "rio-maggi-v3";

const FILES_TO_CACHE = [

    "./",

    "./index.html",

    "./card.html",

    "./qr.html",

    "./history.html",

    "./menu.html",

    "./feedback.html",

    "./profile.html",

    "./reward.html",

    "./login.html",

    "./signup.html",

    "./forgot-password.html",

    "./admin-login.html",

    "./admin.html",

    "./dashboard.html",

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
// SAFE CACHE INSTALL
// PART 2
// ======================================

self.addEventListener(

    "install",

    (event)=>{

        event.waitUntil(

            (async()=>{

                const cache =

                await caches.open(

                    CACHE_NAME

                );

                for(

                    const file

                    of

                    FILES_TO_CACHE

                ){

                    try{

                        await cache.add(file);

                    }

                    catch(error){

                        console.warn(

                            "Cache Skip:",

                            file,

                            error

                        );

                    }

                }

            })()

        );

        self.skipWaiting();

    }

);


// ======================================
// ACTIVATE
// DELETE OLD CACHE
// ======================================

self.addEventListener(

    "activate",

    (event)=>{

        event.waitUntil(

            (async()=>{

                const cacheNames =

                await caches.keys();

                await Promise.all(

                    cacheNames.map(

                        (cache)=>{

                            if(

                                cache !== CACHE_NAME

                            ){

                                return caches.delete(

                                    cache

                                );

                            }

                        }

                    )

                );

                await self.clients.claim();

            })()

        );

    }

);
// ======================================
// FETCH
// NETWORK FIRST
// PART 3
// ======================================

self.addEventListener(

    "fetch",

    (event)=>{

        // Cache only GET requests

        if(

            event.request.method !== "GET"

        ){

            return;

        }

        // Skip Firebase & external CDN requests

        const requestURL =

        new URL(

            event.request.url

        );

        if(

            requestURL.origin !== self.location.origin

        ){

            return;

        }

        event.respondWith(

            (async()=>{

                try{

                    const networkResponse =

                    await fetch(

                        event.request

                    );

                    if(

                        networkResponse &&
                        networkResponse.status === 200
                    ){

                        const cache =

                        await caches.open(

                            CACHE_NAME
                        );

                        cache.put(

                            event.request,

                            networkResponse.clone()

                        );

                    }

                    return networkResponse;

                }

                catch(error){

                    const cachedResponse =

                    await caches.match(

                        event.request

                    );

                    if(cachedResponse){

                        return cachedResponse;

                    }

                    if(

                        event.request.mode === "navigate"

                    ){

                        const offline =

                        await caches.match(

                            "./offline.html"

                        );

                        if(offline){

                            return offline;

                        }
                    }

                    return new Response(

                        "Offline",

                        {

                            status:503,

                            statusText:"Offline"

                        }

                    );

                }

            })()

        );

    }

);

// ======================================
// READY
// ======================================

console.log(

    "RIO MAGGI POINT SERVICE WORKER READY"

);
