// Mad Minute Auto demo service worker: keeps the app working with no signal.
// Bump VERSION whenever index.html changes so phones pick up the new copy.
// The shared learning layer (shared/mm-learn.*), flashcards (shared/mm-flash.*, flashcards/*.js) are precached too;
// bump their ?v= in index.html and here when they change.
const VERSION = "mm-auto-v30";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "shared/mm-learn.css?v=1", "shared/mm-learn.js?v=1", "shared/mm-home.css?v=3", "shared/mm-home.js?v=6", "shared/mm-goals.css?v=3", "shared/mm-goals.js?v=4", "shared/mm-settings.css?v=3", "shared/mm-settings.js?v=2",
  "shared/mm-flash.css?v=3", "shared/mm-flash.js?v=4", "shared/mm-symbols.js?v=2", "flashcards/sym-e12.js?v=2", "flashcards/sym-hv.js?v=1", "flashcards/sym-net.js?v=1",
  "flashcards/auto.js?v=1", "flashcards/maint.js?v=1", "flashcards/e12.js?v=1", "flashcards/net.js?v=1", "flashcards/hv.js?v=1"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("mm-auto-") && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Other Mad Minute apps (like /biology/, /music/, /dev/, /neta/ and the /hub/ page) live under this folder with their own offline cache. Leave them alone.
  if (url.origin === location.origin && ["biology/", "music/", "dev/", "neta/", "hub/"].some(d => url.pathname.startsWith(new URL(d, self.registration.scope).pathname))) return;
  // The app page: try the network first so updates show up, fall back to the cached copy offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put("index.html", copy));
        return res;
      }).catch(() => caches.match("index.html"))
    );
    return;
  }
  // Everything else (icons, Google Fonts): cache first, then save anything new.
  const cacheable = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!cacheable) return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
