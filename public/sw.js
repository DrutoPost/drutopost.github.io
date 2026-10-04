const CACHE_NAME = 'bg-photocard-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/Logoicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.png',
  '/darklogo.png',
  '/Template BG 2.jpg',
  '/Template Fg.png',
  '/Def.png',
  '/Alert.mp3',
  '/Instant.mp3',
  '/Loud.mp3',
  '/manifest.json',
  '/fonts/Cambria.ttf',
  '/fonts/cambriab.ttf',
  '/version.json'
];

async function checkVersionAndRefreshCache() {
  try {
    const response = await fetch('/version.json?_t=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) return;

    const networkData = await response.clone().json();
    const fetchedVersion = networkData ? networkData.version : null;
    if (!fetchedVersion) return;

    let cachedVersion = null;
    const existingVersionResponse = await caches.match('/version.json');
    if (existingVersionResponse) {
      try {
        const cachedData = await existingVersionResponse.json();
        cachedVersion = cachedData ? cachedData.version : null;
      } catch (e) {
        cachedVersion = null;
      }
    }

    if (!cachedVersion || cachedVersion !== fetchedVersion) {
      console.log(`[SW] Version change detected (cached: ${cachedVersion}, fetched: ${fetchedVersion}). Clearing old assets and redownloading...`);
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      const newCache = await caches.open(CACHE_NAME);
      await newCache.put('/version.json', response);
      await newCache.addAll(ASSETS.filter(url => url !== '/version.json'));
      console.log('[SW] All assets updated successfully.');
    }
  } catch (err) {
    console.warn('[SW] Offline or failed to check version.json:', err);
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    checkVersionAndRefreshCache().then(async () => {
      const cache = await caches.open(CACHE_NAME);
      const versionCached = await caches.match('/version.json');
      if (!versionCached) {
        await cache.addAll(ASSETS);
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      checkVersionAndRefreshCache()
    ])
  );
});

self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'CHECK_VERSION' || event.data === 'CHECK_VERSION')) {
    event.waitUntil(checkVersionAndRefreshCache());
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.waitUntil(checkVersionAndRefreshCache());
  }

  if (event.request.url.includes('version.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
