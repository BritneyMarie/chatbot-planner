/**
 * Service Worker for Offline Support and PWA Functionality
 * Handles: Caching strategies, offline fallback, background sync
 * 
 * To register in main.jsx:
 * if ('serviceWorker' in navigator) {
 *   navigator.serviceWorker.register('/sw.js').catch(err => console.log(err));
 * }
 */

// Cache version - increment when updating
const CACHE_VERSION = 'v1';
const CACHE_NAME = `chatbot-planner-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
  '/src/App.css'
];

// API endpoints to cache (with stale-while-revalidate strategy)
const CACHEABLE_API_ENDPOINTS = [
  '/api/events',
  '/api/templates',
  '/api/events/month',
  '/api/events/day'
];

/**
 * Service Worker Install Event
 * Pre-cache critical assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(STATIC_ASSETS);
        console.log('[SW] Static assets cached');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[SW] Install failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Activate Event
 * Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      const cachesToDelete = cacheNames.filter(name => {
        return name !== CACHE_NAME && 
               name !== STATIC_CACHE && 
               name !== API_CACHE && 
               name !== IMAGE_CACHE;
      });

      await Promise.all(
        cachesToDelete.map(name => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
      );

      // Claim clients immediately
      await self.clients.claim();
      console.log('[SW] Activation complete');
    })()
  );
});

/**
 * Service Worker Fetch Event
 * Implement caching strategies:
 * - Network First (API calls)
 * - Stale While Revalidate (API data)
 * - Cache First (Static assets)
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // API Requests - Stale While Revalidate
  if (url.pathname.startsWith('/api')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // HTML Pages - Network First
  if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
    return;
  }

  // CSS/JS - Cache First
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Images - Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheImageFirst(request));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request));
});

/**
 * Network First Strategy
 * Try network first, fall back to cache
 * Best for: HTML pages, frequently updated content
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Using cached response:', request.url);
      return cached;
    }
    
    // No cache available
    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' })
    });
  }
}

/**
 * Cache First Strategy
 * Try cache first, fall back to network
 * Best for: Static assets, CSS, JS
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    console.log('[SW] Using cached asset:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline - Asset not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached response immediately, update in background
 * Best for: API data, less critical updates
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  // Return cached immediately if available
  const fetchPromise = fetch(request).then(response => {
    // Update cache in background
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network error, return cached or offline
    return cached || createOfflineResponse();
  });

  // Return cached response if available, otherwise wait for network
  return cached || fetchPromise;
}

/**
 * Cache First Strategy for Images
 * Optimize image serving
 */
async function cacheImageFirst(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Using cached image:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const clone = response.clone();
      cache.put(request, clone);
    }
    
    return response;
  } catch (error) {
    // Return a placeholder or cached offline image
    return new Response(
      '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">' +
      '<rect fill="#ccc" width="100" height="100"/>' +
      '<text x="50" y="50" text-anchor="middle" fill="#999" font-size="14">Offline</text>' +
      '</svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/**
 * Create offline fallback response
 */
function createOfflineResponse() {
  return new Response(
    JSON.stringify({
      error: 'You are currently offline',
      message: 'Some features are not available. Please check your connection.',
      offline: true,
      cached: true
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'application/json' })
    }
  );
}

/**
 * Handle Background Sync for offline events
 * Queue events created offline and sync when online
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-events') {
    event.waitUntil(syncOfflineEvents());
  }

  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncOfflineEvents() {
  try {
    const db = await openIndexedDB();
    const pendingEvents = await getPendingEvents(db);

    for (const event of pendingEvents) {
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });

        if (response.ok) {
          await removePendingEvent(db, event.id);
          console.log('[SW] Synced event:', event.title);
        }
      } catch (error) {
        console.error('[SW] Failed to sync event:', error);
        throw error; // Retry
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error; // Retry sync
  }
}

async function syncNotifications() {
  try {
    // Sync pending notifications
    console.log('[SW] Syncing notifications...');
    // Implementation depends on notification system
  } catch (error) {
    console.error('[SW] Notification sync failed:', error);
    throw error;
  }
}

/**
 * IndexedDB Helpers (for offline data storage)
 */
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('chatbot-planner-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-events')) {
        db.createObjectStore('pending-events', { keyPath: 'id' });
      }
    };
  });
}

async function getPendingEvents(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-events'], 'readonly');
    const store = transaction.objectStore('pending-events');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function removePendingEvent(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-events'], 'readwrite');
    const store = transaction.objectStore('pending-events');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Handle Push Notifications
 */
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[SW] Push notification without data');
    return;
  }

  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'chatbot-planner-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Chatbot Planner', options)
  );
});

/**
 * Handle Notification Clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('[SW] Service Worker loaded successfully');
