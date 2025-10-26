/**
 * AEROTECH Service Worker
 * Provides offline functionality, caching, and PWA capabilities
 */

const CACHE_VERSION = 'aerotech-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Files to cache on install
const STATIC_FILES = [
    '/',
    '/index.html',
    '/k1.html',
    '/synergia.html',
    '/sr.html',
    '/ArlistTech.html',
    '/privacy.html',
    '/css/style.css',
    '/js/script.js',
    '/js/analytics.js',
    '/manifest.json',
    '/favicon.svg',
    '/favicon.ico',
    '/favicon-192x192.png',
    '/favicon-512x512.png'
];

// Maximum number of items in dynamic cache
const MAX_DYNAMIC_CACHE_ITEMS = 50;
const MAX_IMAGE_CACHE_ITEMS = 100;

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[ServiceWorker] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[ServiceWorker] Skip waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Install failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('aerotech-') && 
                                   cacheName !== STATIC_CACHE && 
                                   cacheName !== DYNAMIC_CACHE &&
                                   cacheName !== IMAGE_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle different types of requests
    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached response and update cache in background
                    updateCache(request);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Cache successful responses
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            
                            // Determine which cache to use
                            if (isImageRequest(request)) {
                                cacheResponse(IMAGE_CACHE, request, responseClone, MAX_IMAGE_CACHE_ITEMS);
                            } else if (!isStaticFile(request)) {
                                cacheResponse(DYNAMIC_CACHE, request, responseClone, MAX_DYNAMIC_CACHE_ITEMS);
                            }
                        }
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[ServiceWorker] Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/offline.html') || 
                                   createOfflineResponse();
                        }
                        
                        // Return cached image fallback for images
                        if (isImageRequest(request)) {
                            return caches.match('/images/offline-placeholder.svg') ||
                                   createOfflineImageResponse();
                        }
                        
                        throw error;
                    });
            })
    );
});

// Helper: Update cache in background
function updateCache(request) {
    return fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                const cacheName = isImageRequest(request) ? IMAGE_CACHE : 
                                 isStaticFile(request) ? STATIC_CACHE : DYNAMIC_CACHE;
                
                return caches.open(cacheName).then((cache) => {
                    return cache.put(request, response);
                });
            }
        })
        .catch(() => {
            // Silently fail - we already have cached version
        });
}

// Helper: Cache response with size limit
function cacheResponse(cacheName, request, response, maxItems) {
    return caches.open(cacheName).then((cache) => {
        return cache.put(request, response).then(() => {
            return cache.keys().then((keys) => {
                if (keys.length > maxItems) {
                    // Remove oldest items
                    const toDelete = keys.slice(0, keys.length - maxItems);
                    return Promise.all(
                        toDelete.map((key) => cache.delete(key))
                    );
                }
            });
        });
    });
}

// Helper: Check if request is for an image
function isImageRequest(request) {
    return request.url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i);
}

// Helper: Check if request is for a static file
function isStaticFile(request) {
    return STATIC_FILES.some((file) => request.url.endsWith(file));
}

// Helper: Create offline fallback response
function createOfflineResponse() {
    const html = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline | AEROTECH</title>
            <style>
                body {
                    font-family: 'Montserrat', sans-serif;
                    background: #0a0a0a;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                }
                .offline-container {
                    text-align: center;
                    max-width: 500px;
                }
                h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    color: #00c0c0;
                }
                p {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #b0b0b0;
                }
                .icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
                .retry-btn {
                    display: inline-block;
                    margin-top: 2rem;
                    padding: 1rem 2rem;
                    background: #00c0c0;
                    color: #0a0a0a;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: 600;
                    transition: background 0.3s;
                }
                .retry-btn:hover {
                    background: #00d5d5;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="icon">✈️</div>
                <h1>Вы не в сети</h1>
                <p>Похоже, у вас нет подключения к интернету. Проверьте соединение и попробуйте снова.</p>
                <a href="/" class="retry-btn" onclick="location.reload(); return false;">Попробовать снова</a>
            </div>
        </body>
        </html>
    `;
    
    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// Helper: Create offline image placeholder
function createOfflineImageResponse() {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <rect width="400" height="300" fill="#1a1a1a"/>
            <text x="200" y="150" font-family="Arial" font-size="20" fill="#666" text-anchor="middle">
                Изображение недоступно
            </text>
        </svg>
    `;
    
    return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
    });
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        event.waitUntil(
            caches.keys().then(async (cacheNames) => {
                let totalSize = 0;
                
                for (const cacheName of cacheNames) {
                    const cache = await caches.open(cacheName);
                    const keys = await cache.keys();
                    
                    for (const request of keys) {
                        const response = await cache.match(request);
                        if (response) {
                            const blob = await response.blob();
                            totalSize += blob.size;
                        }
                    }
                }
                
                event.ports[0].postMessage({
                    type: 'CACHE_SIZE',
                    size: totalSize,
                    sizeFormatted: formatBytes(totalSize)
                });
            })
        );
    }
});

// Helper: Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-analytics') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    // This would sync offline analytics data when connection is restored
    console.log('[ServiceWorker] Syncing analytics data...');
}

// Push notification support
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Новое уведомление от AEROTECH',
        icon: '/favicon-192x192.png',
        badge: '/favicon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('AEROTECH', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

console.log('[ServiceWorker] Loaded');
