// Scripts for firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js')

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// Tangani push event ketika tab aplikasi diminimize atau ditutup
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { notification: { title: 'Notifikasi Toko', body: event.data ? event.data.text() : '' } }
  }

  const title = data.notification?.title || data.data?.title || 'Pemberitahuan Inventaris'
  const options = {
    body: data.notification?.body || data.data?.body || 'Ada pembaruan data stok.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
