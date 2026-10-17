// Service worker do ABC Aventura — carrega offline e abre rápido.
//
// Estratégia: "stale-while-revalidate" para os arquivos do próprio site.
// Serve na hora o que está no cache (rápido e funciona offline) e, em
// paralelo, busca a versão nova na rede e atualiza o cache para a próxima
// vez. Assim as atualizações aparecem sozinhas (sem prender numa versão
// velha) e o app continua abrindo sem internet.
const CACHE = "abc-aventura-v5";
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
  let mesmaOrigem = false;
  try {
    mesmaOrigem = new URL(req.url).origin === location.origin;
  } catch (_) {}
  if (!mesmaOrigem) return; // deixa o navegador cuidar de recursos externos

  // O manifesto de áudio muda quando novas vozes são publicadas: busca na
  // rede primeiro (para não ficar preso numa lista velha) e só usa o cache
  // quando estiver offline.
  if (new URL(req.url).pathname.endsWith("/assets/audio/manifest.json")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cache) => {
      const rede = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => cache || caches.match("./index.html"));
      // Serve o cache na hora (se houver) e atualiza em segundo plano.
      return cache || rede;
    })
  );
});
