// Service worker do ABC Aventura — funciona offline e se atualiza sozinho.
//
// Estratégia: "rede primeiro" para os arquivos do próprio site. Com
// internet, busca sempre a versão mais nova (sem usar o cache do
// navegador) e guarda uma cópia; sem internet, usa a cópia guardada.
// Assim uma atualização publicada aparece já na próxima abertura.
const CACHE = "abc-aventura-v17";
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
      // cache: "reload" -> baixa do servidor, não do cache do navegador
      .then((c) => c.addAll(ESQUELETO.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Áudios e ícones: usa a cópia guardada na hora (rápido, economiza dados) e
// atualiza em segundo plano (um áudio refeito aparece na vez seguinte).
function ehEstatico(url) {
  return /\/assets\/audio\/.+\.(mp3|webm|ogg|mp4)$/.test(url.pathname) || /\/icons\//.test(url.pathname);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch (_) {
    return;
  }
  if (url.origin !== location.origin) return; // recursos externos: o navegador cuida

  const guardar = (res) => {
    if (res && res.ok) {
      const copia = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copia));
    }
    return res;
  };

  if (ehEstatico(url)) {
    e.respondWith(
      caches.match(req).then((c) => {
        const rede = fetch(req).then(guardar).catch(() => c);
        return c || rede;
      })
    );
    return;
  }

  // Páginas, scripts, estilos e manifestos: rede primeiro, cópia se offline.
  e.respondWith(
    fetch(req, { cache: "no-cache" })
      .then(guardar)
      .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
  );
});
