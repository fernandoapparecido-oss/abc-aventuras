// Service worker do ABC Aventura — carrega offline e abre rápido.
// Estratégia: cache-first para o "esqueleto" do app; para o resto,
// tenta a rede e guarda no cache (ex.: clipes de áudio).
const CACHE = "abc-aventura-v1";
const ESQUELETO = [
  "./",
  "./index.html",
  "./assets/css/style.css",
  "./assets/js/data.js",
  "./assets/js/frases.js",
  "./assets/js/progresso.js",
  "./assets/js/audio.js",
  "./assets/js/app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ESQUELETO))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            try {
              if (res.ok && new URL(req.url).origin === location.origin) {
                const copy = res.clone();
                caches.open(CACHE).then((c) => c.put(req, copy));
              }
            } catch (_) {}
            return res;
          })
          .catch(() => caches.match("./index.html"))
    )
  );
});
