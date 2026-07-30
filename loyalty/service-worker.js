// ======================================
// RIO MAGGI POINT
// SERVICE WORKER
// FINAL VERSION
// PART 1 / 3
// ======================================

const VERSION = "v4";

const CACHE_NAME = `rio-maggi-${VERSION}`;

const STATIC_CACHE = [

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

const cache=

await caches.open(

CACHE_NAME

);


// Safe Cache

for(

const file

of

STATIC_CACHE

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

catch(err){

console.warn(

"Skip:",

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
// PART 2
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

(cache)=>{

if(

cache!==CACHE_NAME

){

console.log(

"Delete Old Cache:",

cache

);

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
// HTML = NETWORK FIRST
// STATIC = CACHE FIRST
// ======================================

self.addEventListener(

"fetch",

(event)=>{

if(

event.request.method!=="GET"

){

return;

}

const url=

new URL(

event.request.url

);


// NEVER CACHE FIREBASE / CDN

if(

url.origin!==self.location.origin

){

return;

}


// HTML PAGES

if(

event.request.mode==="navigate"

){

event.respondWith(

handleNavigation(

event.request

)

);

return;

}


// CSS / JS / IMAGE / ICON

event.respondWith(

handleStatic(

event.request

)

);

}
);
// ======================================
// NETWORK FIRST FOR HTML
// ======================================

async function handleNavigation(request){

try{

const networkResponse=

await fetch(request);

if(

networkResponse &&
networkResponse.ok &&
networkResponse.status===200

){

const cache=

await caches.open(

CACHE_NAME

);

cache.put(

request,

networkResponse.clone()

);

return networkResponse;

}

throw new Error("Network Error");

}

catch(error){

const cached=

await caches.match(request);

if(cached){

return cached;

}

const offline=

await caches.match("./offline.html");

if(offline){

return offline;

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
// CACHE FIRST FOR STATIC FILES
// ======================================

async function handleStatic(request){

const cached=

await caches.match(request);

if(cached){

return cached;

}

try{

const networkResponse=

await fetch(request);

if(

networkResponse &&
networkResponse.ok &&
networkResponse.status===200 &&
networkResponse.type==="basic"

){

const cache=

await caches.open(

CACHE_NAME

);

cache.put(

request,

networkResponse.clone()

);

}

return networkResponse;

}

catch(error){

return new Response(

"Resource Not Available",

{

status:404,

statusText:"Not Found"

}

);

}

}


// ======================================
// READY
// ======================================

console.log("================================");

console.log("🍜 RIO MAGGI POINT");

console.log("Service Worker v4 Loaded");

console.log("GitHub Pages Optimized");

console.log("================================");
