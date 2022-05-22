const FILES_TO_CACHE = [
  '/',
  './index.html',
  './css/styles.css',
  './js/idb.js',
  './js/index.js',
  './manifest.json',
  './icons/icon-512x512.png',
  './icons/icon-384x384.png',
  './icons/icon-192x192.png',
  './icons/icon-152x152.png',
  './icons/icon-144x144.png',
  './icons/icon-128x128.png',
  './icons/icon-96x96.png',
  './icons/icon-72x72.png'
];

const APP_PREFIX = 'TrackMyBudget-'
const VERSION = 'v_01'
const CACHE_NAME = APP_PREFIX + VERSION
const DATA_CACHE_NAME = 'data-cache-' + VERSION

// calls install
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Installing cache: ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
        .then(() => self.skipWaiting())
    )
})

// calls activate
self.addEventListener('activate', e => {
    // removes unwanted caches
    e.waitUntil(
        caches.keys().then(keyList => {
          // `keyList` contains cache names under username.github.io
          // filter out the ones that have this app prefix to create keeplist
          let cacheKeeplist = keyList.filter(key => {
          return key.indexOf(APP_PREFIX);
          });

          cacheKeeplist.push(CACHE_NAME);

          return Promise.all(
                keyList.map((key, i) => {
                  if (cacheKeeplist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
                })
              );
        })
    )
})

self.addEventListener('fetch', e => {
    console.log('Service Worker Fetching')
    if (e.request.url.includes("/api/")){
      e.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(e.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(e.request.url, response.clone())
            }
            return response
          })
          .catch(err => {
            return cache.match(e.request)
          })
        }).catch(err => console.log(err))
      )
      return
    }
    e.respondWith(caches.match(e.request).then(request => {
        if (request) {
            console.log('Responding with cache : ' + e.request.url)
            return request
          } else {     
            console.log('File is not cached, fetching : ' + e.request.url)
            return fetch(e.request)
          }
    })
    )
})
