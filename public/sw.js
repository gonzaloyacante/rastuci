// Service Worker for PWA functionality
const CACHE_NAME = 'rastuci-v1';
const STATIC_CACHE = 'rastuci-static-v1';
const DYNAMIC_CACHE = 'rastuci-dynamic-v1';
const API_CACHE = 'rastuci-api-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/productos',
  '/carrito',
  '/favoritos',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical assets
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/categories',
  '/api/cart',
  '/api/wishlist',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with cache-first strategy for GET requests
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No network connection available' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    // Return a basic offline response
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'wishlist-sync') {
    event.waitUntil(syncWishlist());
  } else if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }
});

// Sync cart data when back online
async function syncCart() {
  try {
    const cartData = await getStoredData('pending-cart');
    if (cartData) {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData)
      });
      await clearStoredData('pending-cart');
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Sync wishlist data when back online
async function syncWishlist() {
  try {
    const wishlistData = await getStoredData('pending-wishlist');
    if (wishlistData) {
      await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wishlistData)
      });
      await clearStoredData('pending-wishlist');
    }
  } catch (error) {
    console.error('Wishlist sync failed:', error);
  }
}

// Sync orders when back online
async function syncOrders() {
  try {
    const orderData = await getStoredData('pending-orders');
    if (orderData) {
      await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      await clearStoredData('pending-orders');
    }
  } catch (error) {
    console.error('Order sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: 'Rastuci', body: event.data.text() };
    }
  }

  const options = {
    title: data.title || 'Rastuci',
    body: data.body || 'Nueva notificación',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    image: data.image,
    tag: data.tag || 'general',
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/icons/action-dismiss.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate || [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle notification click
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  } else if (event.data.type === 'CACHE_URLS') {
    cacheUrls(event.data.urls);
  }
});

// Schedule notification
function scheduleNotification({ options, delay }) {
  setTimeout(() => {
    self.registration.showNotification(options.title, options);
  }, delay);
}

// Cache specific URLs
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
    console.log('Service Worker: URLs cached', urls);
  } catch (error) {
    console.error('Service Worker: Failed to cache URLs', error);
  }
}

// Utility functions for IndexedDB storage
async function getStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RastuciOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => resolve(getRequest.result?.data);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    };
  });
}

async function storeData(key, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RastuciOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const putRequest = store.put({ key, data });
      
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
  });
}

async function clearStoredData(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RastuciOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const deleteRequest = store.delete(key);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // Sync product data, categories, etc.
    const response = await fetch('/api/sync/content');
    if (response.ok) {
      const data = await response.json();
      
      // Update caches with fresh data
      const cache = await caches.open(API_CACHE);
      cache.put('/api/products', new Response(JSON.stringify(data.products)));
      cache.put('/api/categories', new Response(JSON.stringify(data.categories)));
    }
  } catch (error) {
    console.error('Content sync failed:', error);
  }
}
