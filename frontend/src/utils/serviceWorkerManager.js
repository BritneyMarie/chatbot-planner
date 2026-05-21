/**
 * Service Worker Registration and Management
 * Handles registration, updates, and offline event handling
 */

/**
 * Register Service Worker
 * Call this in main.jsx after app loads
 */
export async function registerServiceWorker() {
  // Check if Service Workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Workers not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[SW] Registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker installed, prompt user
          console.log('[SW] New version available');
          showUpdatePrompt();
        }
      });
    });

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

/**
 * Unregister Service Worker (for testing/development)
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('[SW] Unregistered successfully');
    }
  } catch (error) {
    console.error('[SW] Unregister failed:', error);
  }
}

/**
 * Show notification that new version is available
 */
function showUpdatePrompt() {
  // Create a toast or banner notifying user
  const event = new CustomEvent('sw-update-available', {
    detail: {
      message: 'New version available. Refresh to update.',
      action: 'refresh'
    }
  });
  window.dispatchEvent(event);
}

/**
 * Handle messages from Service Worker
 */
export function setupMessageListener() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[SW Message]:', event.data);

    if (event.data.type === 'CACHE_UPDATED') {
      console.log('[SW] Cache updated for:', event.data.url);
    }

    if (event.data.type === 'OFFLINE') {
      console.warn('[SW] Application is offline');
      showOfflineIndicator();
    }

    if (event.data.type === 'ONLINE') {
      console.log('[SW] Application is back online');
      hideOfflineIndicator();
    }
  });
}

/**
 * Request periodic background sync
 * Requires 'periodic-background-sync' permission
 */
export async function requestBackgroundSync() {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.warn('[SW] Background Sync not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Request to sync every 24 hours
    await registration.sync.register('sync-events');
    console.log('[SW] Background sync registered');
    return true;
  } catch (error) {
    console.error('[SW] Background sync registration failed:', error);
    return false;
  }
}

/**
 * Request notifications permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[SW] Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[SW] Push notifications not supported');
    return false;
  }

  try {
    // First get notification permission
    const permitted = await requestNotificationPermission();
    if (!permitted) {
      console.log('[SW] Notification permission denied');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY)
    });

    console.log('[SW] Subscribed to push notifications');
    
    // Send subscription to server for storage
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    return true;
  } catch (error) {
    console.error('[SW] Push subscription failed:', error);
    return false;
  }
}

/**
 * Convert VAPID key from base64
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Offline indicator management
 */
function showOfflineIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.className = 'offline-banner';
  indicator.innerHTML = `
    <div class="offline-content">
      <span>📡 You are offline. Some features may be limited.</span>
      <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
    </div>
  `;
  document.body.insertBefore(indicator, document.body.firstChild);
}

function hideOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Get cache status
 */
export async function getCacheStatus() {
  if (!('caches' in window)) return null;

  const cacheNames = await caches.keys();
  const status = {};

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }

  return status;
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
  if (!('caches' in window)) return false;

  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );

  console.log('[SW] All caches cleared');
  return true;
}

/**
 * Get online status
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function setupOnlineStatusListener(onStatusChange) {
  window.addEventListener('online', () => {
    console.log('[App] Back online');
    onStatusChange?.(true);
  });

  window.addEventListener('offline', () => {
    console.log('[App] Went offline');
    onStatusChange?.(false);
  });
}

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  setupMessageListener,
  requestBackgroundSync,
  requestNotificationPermission,
  subscribeToPushNotifications,
  getCacheStatus,
  clearAllCaches,
  isOnline,
  setupOnlineStatusListener
};
