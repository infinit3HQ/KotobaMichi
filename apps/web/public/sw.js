/* KotobaMichi service worker.
 * - Hashed build assets, icons, and exam figures: cache first (they never change at a URL).
 * - Pages and RSC payloads: network first, cached copy when offline, then /offline.html.
 * - The API lives on another origin and is never intercepted, so account data is never cached.
 * Bump VERSION to drop every cache on the next visit.
 */
const VERSION = "v1";
const STATIC_CACHE = `kotoba-static-${VERSION}`;
const PAGE_CACHE = `kotoba-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const MAX_PAGES = 60;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("kotoba-") && key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/exams/")
  );
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i += 1) await cache.delete(keys[i]);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, isNavigation) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(PAGE_CACHE);
      await cache.put(request, response.clone());
      void trim(PAGE_CACHE, MAX_PAGES);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (isNavigation) {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Runtime config and the worker itself must always come from the network.
  if (url.pathname === "/env.js" || url.pathname === "/sw.js") return;

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  const isNavigation = request.mode === "navigate";
  const isRsc = request.headers.get("RSC") === "1" || url.searchParams.has("_rsc");
  if (isNavigation || isRsc) {
    event.respondWith(networkFirst(request, isNavigation));
  }
});
