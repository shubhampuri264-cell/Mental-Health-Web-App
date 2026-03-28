/**
 * Manasthiti Service Worker
 *
 * CRITICAL: Pre-caches Tier 4 crisis card and core app shell
 * for offline access in low-connectivity areas.
 *
 * Safety Rule: The Tier 4 crisis card must render within 100ms —
 * cached offline via Service Worker. This is non-negotiable.
 */

const CACHE_NAME = 'manasthiti-v1';
const CRISIS_CACHE = 'manasthiti-crisis-v1';

// Core app shell files to cache
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(APP_SHELL);
      }),
      // Separate crisis cache — never evicted
      caches.open(CRISIS_CACHE).then((cache) => {
        return cache.addAll(['/']);
      }),
    ])
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== CRISIS_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — try cache
        return caches.match(event.request).then((response) => {
          return response || caches.match('/');
        });
      })
  );
});

// Push notification handler (for Exam Season Alerts)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Your mind matters too.',
    icon: '/logo192.png',
    badge: '/logo192.png',
    lang: 'ne',
    dir: 'ltr',
    tag: 'manasthiti-alert',
    data: {
      url: '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'मनस्थिति',
      options
    )
  );
});

// Notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
