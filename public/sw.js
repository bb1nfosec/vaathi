// Vaathi Service Worker
const CACHE_NAME = 'vaathi-v1'
const STATIC_ASSETS = ['/vaathi-logo.png', '/logo.svg', '/manifest.json']

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.filter(Boolean))
    }).catch(() => {
      // Ignore cache failures on install
    })
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: cache-first for static assets, network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      })
    )
    return
  }

  // Cache-first for static assets
  const isStaticAsset = STATIC_ASSETS.some((asset) => url.pathname === asset)
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone))
          return response
        })
      })
    )
    return
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// Push: show notification
self.addEventListener('push', (event) => {
  let body = 'You have a topic ready for review!'
  try {
    if (event.data) {
      body = event.data.text()
    }
  } catch {
    // ignore
  }

  const options = {
    body,
    icon: '/vaathi-logo.png',
    badge: '/vaathi-logo.png',
    vibrate: [100, 50, 100],
    data: { url: '/' },
    actions: [
      { action: 'open', title: 'Start Review' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('Vaathi', options)
  )
})

// Notification click: open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
