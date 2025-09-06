
// service-worker.js
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `alchymistova-hra-${CACHE_VERSION}`;

// Kompletní precache podle struktury repozitáře
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',

  // ---- Stránky hry ----
  '/kap3.html',
  '/kap3a.html',
  '/kap4.html',
  '/kap5.html',
  '/kap7.html',
  '/kap7c.html',
  '/kap8.html',
  '/kap9.html',
  '/kap12.html',
  '/kap13.html',
  '/kap13a.html',
  '/kap14.html',
  '/kap15b.html',
  '/kap16.html',
  '/kap17.html',
  '/kap17a.html',
  '/kap18.html',
  '/kap18vestba.html',
  '/kap19.html',
  '/kap20.html',
  '/kap21.html',
  '/kap21a.html',
  '/kap22.html',
  '/kap22a.html',
  '/kap23.html',
  '/kap24.html',
  '/kap25.html',
  '/kap26.html',
  '/kap26a.html',
  '/kap27.html',

  // ---- CSS ----
  '/css/style.css',

  // ---- JS/JSON ----
  '/js/helpers.js',
  '/js/runes.js',
  '/js/runes.json',
  '/data/runes.json',

  // ---- Audio ----
  '/audio/hi.mp3',
  '/audio/huh.ogg',
  '/audio/magic.mp3',
  '/audio/ritual.mp3',
  '/audio/select_button.mp3',

  // ---- Obrázky ----
  '/img/alchemista_mavajici_usmev.png',
  '/img/alchemista_mavajici_usmev_potion.png',
  '/img/alchemista_nadseny.png',
  '/img/alchemista_nechapavy.png',
  '/img/alchemista_premysli.png',
  '/img/alchemista_smejici_orb.png',
  '/img/alchemista_spici_2.png',
  '/img/alchemista_stastny.png',
  '/img/alchemista_svitek_ukol.png',
  '/img/alchemista_ustarany.png',
  '/img/alchemista_ustarany_nastvany.png',
  '/img/alchemista_vydeseny.png',
  '/img/alchemista_vysvetlujici.png',
  '/img/alchemista_vysvetlujici_2.png',
  '/img/alchemista_vysvetlujici_smejici.png',
  '/img/alchemista_vysvetlujici_smejici_2.png',
  '/img/alchymista_axolot.png',
  '/img/alchymista_mavajici.png',
  '/img/fehu_fix_1.gif',
  '/img/fehu_fix_2.gif',
  '/img/ritual.gif',
  '/img/ritual_end-optimize.gif',

  // ---- Runes ----
  '/runes/algiz.png',
  '/runes/ansuz.png',
  '/runes/berkana.png',
  '/runes/dagaz.png',
  '/runes/ehwaz.png',
  '/runes/eihwaz.png',
  '/runes/fehu.png',
  '/runes/gebo.png',
  '/runes/hagalaz.png',
  '/runes/ingwaz.png',
  '/runes/isa.png',
  '/runes/jera.png',
  '/runes/kenaz.png',
  '/runes/laguz.png',
  '/runes/mannaz.png',
  '/runes/nauthiz.png',
  '/runes/othala.png',
  '/runes/perthro.png',
  '/runes/raido.png',
  '/runes/sowilo.png',
  '/runes/thurisaz.png',
  '/runes/tiwaz.png',
  '/runes/uruz.png',
  '/runes/wunjo.png',
  '/runes/wyrd.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Použij step-by-step místo addAll, aby instalace nespadla kvůli jedné chybě
    await Promise.all(
      PRECACHE_URLS.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'reload' });
          if (res.ok) await cache.put(url, res);
        } catch (e) {
          // ignoruj chybějící asset, instalace poběží dál
        }
      })
    );
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Speciální podpora pro Range (audio/video), aby hrálo i offline
  const rangeHeader = req.headers.get('range');
  if (rangeHeader) {
    event.respondWith(rangeResponse(req));
    return;
  }

  // HTML navigace → network-first
  const isHTMLNavigation =
    req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'));

  if (isHTMLNavigation) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const fresh = await fetch(req);
        cache.put(req.url, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await cache.match(req.url) || await cache.match(new URL(req.url).pathname);
        return cached || cache.match('/offline.html');
      }
    })());
    return;
  }

  // Ostatní soubory → cache-first
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req.url) || await cache.match(new URL(req.url).pathname);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      cache.put(req.url, fresh.clone());
      return fresh;
    } catch (e) {
      return new Response('', { status: 503 });
    }
  })());
});

async function rangeResponse(req) {
  try {
    const url = new URL(req.url);
    const cache = await caches.open(CACHE_NAME);
    // Zkus najít podle plné URL i podle cesty
    let res = await cache.match(req.url) || await cache.match(url.pathname);
    if (!res) {
      // pokud není v cache, zkus síť
      res = await fetch(req);
      return res;
    }
    const buf = await res.arrayBuffer();
    const range = /bytes=(\d+)-(\d+)?/.exec(req.headers.get('range'));
    const start = Number(range[1]);
    const end = range[2] ? Number(range[2]) : buf.byteLength - 1;
    const chunk = buf.slice(start, end + 1);
    return new Response(chunk, {
      status: 206,
      statusText: 'Partial Content',
      headers: [
        ['Content-Range', `bytes ${start}-${end}/${buf.byteLength}`],
        ['Accept-Ranges', 'bytes'],
        ['Content-Length', String(chunk.byteLength)],
        ['Content-Type', res.headers.get('Content-Type') || 'application/octet-stream']
      ]
    });
  } catch (e) {
    // Když cokoli selže, vrať běžný fetch
    return fetch(req);
  }
}