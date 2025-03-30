/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules/workbox-sw

// Import the workbox library (which is available in the CRA service worker)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js');

// Use the default CRA service worker as a base
self.importScripts('service-worker.js');

// Add pull-to-refresh functionality
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Check if this is a pull-to-refresh request
  // We can identify this by looking for a special header or query parameter
  const url = new URL(event.request.url);
  const isPullToRefresh = url.searchParams.has('pull_to_refresh');
  
  if (isPullToRefresh) {
    event.respondWith(
      fetch(event.request).then(response => {
        // Clear the cache for this URL
        const originalUrl = new URL(event.request.url);
        originalUrl.searchParams.delete('pull_to_refresh');
        
        caches.open('runtime-cache').then(cache => {
          cache.delete(originalUrl.href);
        });
        
        return response;
      })
    );
  }
});