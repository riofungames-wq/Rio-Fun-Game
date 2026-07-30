// ======================================
// RIO MAGGI POINT
// SERVICE WORKER
// FINAL STABLE VERSION
// PART 1 / 3
// ======================================

const CACHE_NAME = "rio-maggi-v5";

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

(event)=>{

event.waitUntil(

(async()=>{

const cache =

await caches.open(

CACHE_NAME

);


// Safe Cache Install

for(

const file

of

STATIC_FILES

){

try{

await cache.add(

file

);

console.log(

"Cached:",

file

);

}

catch(error){

console.warn(

"Skipped:",

file

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
// REMOVE OLD CACHE
// PART 2 / 3
// ======================================

self.addEventListener(

"activate",

(event)=>{

event.waitUntil(

(async()=>{

const cacheNames=

await caches.keys();

await Promise.all(

cacheNames.map(

(cacheName)=>{

if(

cacheName!==CACHE_NAME

){

console.log(

"Delete Cache:",

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

await self.clients.claim();

})()

);

}

);


// ======================================
// FETCH
// GITHUB PAGES SAFE
// ======================================

self.addEventListener(

"fetch",

(event)=>{

// Only GET Requests

if(

event.request.method!=="GET"

){

return;

}


// Skip Firebase / Google / CDN

const url=

new URL(

event.request.url

);

if(

url.origin!==self.location.origin

){

return;

}


// Handle Request

event.respondWith(

fetchRequest(

event.request

)

);

});
// ======================================
// FETCH REQUEST
// PART 3 / 3
// ======================================

async function fetchRequest(request){

const cache = await caches.open(CACHE_NAME);

try{

const networkResponse = await fetch(request);

// Cache only successful same-origin responses

if(

networkResponse &&
networkResponse.status===200 &&
networkResponse.type==="basic"

){

cache.put(

request,

networkResponse.clone()

);

}

return networkResponse;

}

catch(error){

// Try cache

const cachedResponse =

await cache.match(request);

if(cachedResponse){

return cachedResponse;

}

// Offline page only for HTML navigation

if(request.mode==="navigate"){

const offlinePage =

await cache.match("./offline.html");

if(offlinePage){

return offlinePage;

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

}


// ======================================
// MESSAGE EVENT
// ======================================

self.addEventListener(

"message",

(event)=>{

if(

event.data &&
event.data.type==="SKIP_WAITING"

){

self.skipWaiting();

}

});


// ======================================
// READY
// ======================================

console.log("================================");

console.log("RIO MAGGI POINT");

console.log("Service Worker v5 Ready");

console.log("GitHub Pages Stable");

console.log("================================");
