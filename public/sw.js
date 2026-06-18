// Minimaler Service Worker für bada bup (Phase 2).
// Zweck: Installierbarkeit (Home-Bildschirm, Vollbild). Noch KEIN Push.
// Strategie: network-first mit Cache-Fallback für die App-Hülle.

const CACHE = "bada-bup-shell-v2";
const SHELL = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Nur GET cachen; alles andere (z. B. Server Actions / POST) durchreichen.
  if (request.method !== "GET") {
    return;
  }

  // Navigationsanfragen: erst Netz, bei Offline die zwischengespeicherte Hülle.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/").then((r) => r ?? Response.error())),
    );
    return;
  }

  // Übrige GETs: Cache-first mit Netz-Nachladung.
  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request)),
  );
});
