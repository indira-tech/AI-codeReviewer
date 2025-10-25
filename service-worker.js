const CACHE_NAME = 'ai-code-reviewer-v10'; // Incremented cache version
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/constants.ts',
  '/examples.ts',
  '/metadata.json',
  '/services/geminiService.ts',
  '/services/offlineAnalysisService.ts',
  '/components/Header.tsx',
  '/components/CodeInput.tsx',
  '/components/ReviewOutput.tsx',
  '/components/Loader.tsx',
  // CDNs
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/ace/1.33.0/ace.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  // React via import map
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://aistudiocdn.com/@google/genai@^1.27.0'
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs to the cache. Using fetch to handle opaque responses from CDNs.
        const promises = urlsToCache.map(url => {
            return fetch(new Request(url, { mode: 'no-cors' })).then(response => {
                if (response.status === 200 || response.type === 'opaque') {
                    return cache.put(url, response);
                }
                console.warn(`Skipping caching for ${url}. Status: ${response.status}`);
                return Promise.resolve();
            }).catch(err => {
                console.error(`Failed to fetch and cache ${url}`, err);
            });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});