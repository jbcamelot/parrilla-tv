/* sw.js — Service worker de Parrilla TV.
 * Guarda la aplicación para que abra sin conexión. La guía NO pasa por aquí (se guarda en IndexedDB).
 * Al publicar cambios en la app, sube el número de VERSION para que los iPhone se actualicen.
 */
const VERSION = 'parrilla-v3';
const LOGOS = 'parrilla-logos-2';   // nombre nuevo: descarta logos mal guardados por versiones anteriores
const APP = ['./', './index.html', './guia-worker.js', './manifest.webmanifest',
             './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSION).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== LOGOS).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Ficheros de la app: primero la red (para recibir actualizaciones); sin conexión, la copia guardada.
  if (url.origin === location.origin) {
    ev.respondWith(
      fetch(req).then(r => {
        if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
        return r;
      }).catch(() => caches.match(req, {ignoreSearch: true}).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Logotipos de las cadenas: se guardan para verlos también sin conexión (solo si la descarga fue correcta).
  if (url.hostname === 'raw.githubusercontent.com' && url.pathname.includes('/picons_dobleM/')) {
    ev.respondWith(caches.open(LOGOS).then(async c => {
      const guardado = await c.match(req.url);
      if (guardado) return guardado;
      try {
        const resp = await fetch(req.url, {mode: 'cors', credentials: 'omit'});
        if (resp.ok) c.put(req.url, resp.clone());
        return resp;
      } catch (e) {
        return fetch(req);          // último recurso: petición normal del navegador
      }
    }));
    return;
  }

  // Todo lo demás (la guía, imágenes de programas) va directo a la red.
});
