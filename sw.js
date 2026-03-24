// 1. Import Workbox 6 (not 4.3.1)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log('Workbox is loaded! 🚀');

  // 2. Pull out all modules at the TOP LEVEL (not inside callbacks)
  //    This is critical — Workbox lazy-loads these, and that only works
  //    during synchronous top-level script execution
  const { precacheAndRoute, matchPrecache } = workbox.precaching;
  const { registerRoute } = workbox.routing;
  const { NetworkFirst, CacheFirst } = workbox.strategies;
  const { ExpirationPlugin } = workbox.expiration;

  // 3. Precache static assets
  precacheAndRoute([
    { url: './index.html', revision: null },
    { url: './styles.css', revision: null },
    { url: './app.js', revision: null },
    { url: './fallback.json', revision: null },
    { url: './dog.jpg', revision: null },
    { url: './', revision: null }
  ]);

  // 4. Network-first for News API
  registerRoute(
    ({ url }) => url.origin === 'https://newsapi.org',
    new NetworkFirst({
      cacheName: 'news-dynamic',
      plugins: [
        {
          handlerDidError: async () => {
            return await matchPrecache('./fallback.json');
          }
        }
      ]
    })
  );

  // 5. Cache-first for images
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'news-images',
      plugins: [
        new ExpirationPlugin({  // ✅ Add the expiration plugin
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    })
  );

} else {
  console.log('Workbox failed to load');
}


//self.addEventListener('install', e => {
    // We wrap the cache logic in waitUntil so the browser doesn't move to the 'activated' state until the files are saved.
    //e.waitUntil(
        //caches.open('news-static').then(cache => {
            //return cache.addAll(staticAssets);
        //})
    //);
//});

//self.addEventListener('fetch', e => {
    //const req = e.request; // Corrected: property, not a function
    //const url = new URL(req.url);
    //if (url.origin === location.origin) {
        //e.respondWith(cacheFirst(req));
    //} else {
        //e.respondWith(networkFirst(req));
    //}
//});

//async function cacheFirst(req) {
    //const cachedResponse = await caches.match(req);
    //return cachedResponse || fetch(req);
//}

async function networkFirst(req) {
    const cache = await caches.open('news-dynamic');

    try {
        const res = await fetch(req);
      // Only cache successful GET responses
    if (res.status === 200) {
        console.log("Caching dynamic data for:", req.url);
        cache.put(req, res.clone());
    }
    return res;
    } catch (error) {
        const cachedResponse = await cache.match(req);
        // If it's not in the dynamic cache, return the fallback JSON
        return cachedResponse || await caches.match('./fallback.json');
    }
}


