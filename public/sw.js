// My Store Asap — Service Worker v1.0
// PWA Vendor Dashboard

const CACHE_NAME = 'myasapstore-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to pre-cache (always available offline)
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline.html',
];

// Pages to cache dynamically
const CACHE_ROUTES = [
  '/dashboard',
  '/orders',
  '/products',
  '/stores',
  '/profile',
];

// ─── Install ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silent fail — assets may not exist yet
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch Strategy: Network First, Cache Fallback ─────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests, chrome extensions, and API calls
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_inertia')
  ) {
    return;
  }

  // For navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline: serve from cache if available
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline.html') || new Response(
              '<html><body style="font-family:sans-serif;text-align:center;padding:2rem"><h2>Hors ligne</h2><p>Reconnectez-vous pour accéder à votre tableau de bord.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // For static assets — Cache First
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
});

// ─── Push Notifications ────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: 'My Store Asap',
    body: 'Vous avez une nouvelle notification',
    icon: '/images/pwa/icon-192x192.png',
    badge: '/images/pwa/icon-72x72.png',
    tag: 'myasapstore-notification',
    data: { url: '/dashboard' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'Voir' },
      { action: 'dismiss', title: 'Ignorer' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── Notification Click ────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// ─── Background Sync (for offline form submissions) ────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  // Placeholder for background sync logic
  console.log('[SW] Background sync triggered');
}
