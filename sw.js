// Mad Minute Auto demo service worker: keeps the app working with no signal.
// Bump VERSION whenever index.html changes so phones pick up the new copy.
// The shared learning layer (shared/mm-learn.*) and the Auto extras (extras/: vocabulary + diagnostic labs) are precached too;
// bump their ?v= in index.html and here when they change.
const VERSION = "mm-auto-v15";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "shared/mm-learn.css?v=1", "shared/mm-learn.js?v=1",
  "extras/mm-extras.css?v=1", "extras/mm-extras.js?v=1", "extras/vocab/auto.js?v=1", "extras/vocab/maint.js?v=1",
  "extras/vocab/e12.js?v=1", "extras/vocab/net.js?v=1", "extras/vocab/hv.js?v=1"];

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
  // Other Mad Minute apps (like /biology/, /music/ and /dev/) live under this folder with their own offline cache. Leave them alone.
  if (url.origin === location.origin && ["biology/", "music/", "dev/"].some(d => url.pathname.startsWith(new URL(d, self.registration.scope).pathname))) return;
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
