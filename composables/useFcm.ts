import { getMessaging, getToken, onMessage, isSupported, type Messaging } from 'firebase/messaging'

export interface PushNotificationMessage {
  id: string
  title: string
  body: string
  receivedAt: Date
}

export function useFcm() {
  const fcmToken = useState<string | null>('fcm-token', () => null)
  const isSupportedBrowser = useState<boolean>('fcm-supported', () => false)
  const permissionStatus = useState<NotificationPermission>('fcm-permission', () => 'default')
  const incomingMessages = useState<PushNotificationMessage[]>('fcm-messages', () => [])
  const isSubscribing = useState<boolean>('fcm-subscribing', () => false)
  const errorMessage = useState<string | null>('fcm-error', () => null)

  const config = useRuntimeConfig()
  let messagingInstance: Messaging | null = null

  async function checkSupport() {
    if (!import.meta.client) return false
    try {
      const supported = await isSupported()
      isSupportedBrowser.value = supported
      if ('Notification' in window) {
        permissionStatus.value = Notification.permission
      }
      return supported
    } catch {
      isSupportedBrowser.value = false
      return false
    }
  }

  async function requestNotificationPermission(): Promise<string | null> {
    if (!import.meta.client) return null
    errorMessage.value = null
    isSubscribing.value = true

    try {
      const supported = await checkSupport()
      if (!supported) {
        throw new Error('Browser ini tidak mendukung Web Push Notification.')
      }

      const permission = await Notification.requestPermission()
      permissionStatus.value = permission

      if (permission !== 'granted') {
        throw new Error('Izin notifikasi ditolak oleh pengguna.')
      }

      const vapidKey = config.public.firebaseVapidKey
      if (!vapidKey) {
        throw new Error('VAPID Key belum diatur di file .env lokal (NUXT_PUBLIC_FIREBASE_VAPID_KEY).')
      }

      const { app } = useFirebaseClient()
      messagingInstance = getMessaging(app)

      // Pastikan service worker terdaftar dan aktif
      await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      const registration = await navigator.serviceWorker.ready

      const token = await getToken(messagingInstance, {
        vapidKey,
        serviceWorkerRegistration: registration,
      })

      if (token) {
        fcmToken.value = token
        setupForegroundListener()
        return token
      }
      throw new Error('Gagal mendapatkan FCM Device Token.')
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : 'Gagal mengaktifkan notifikasi.'
      return null
    } finally {
      isSubscribing.value = false
    }
  }

  function setupForegroundListener() {
    if (!import.meta.client || !messagingInstance) return

    onMessage(messagingInstance, (payload) => {
      const title = payload.notification?.title || payload.data?.title || 'Pemberitahuan Inventaris'
      const body = payload.notification?.body || payload.data?.body || 'Ada pembaruan data stok.'

      incomingMessages.value.unshift({
        id: crypto.randomUUID(),
        title,
        body,
        receivedAt: new Date(),
      })

      // Jika browser mengizinkan, tampilkan browser notification pop-up
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        })
      }
    })
  }

  function clearMessages() {
    incomingMessages.value = []
  }

  function dismissMessage(id: string) {
    incomingMessages.value = incomingMessages.value.filter(m => m.id !== id)
  }

  return {
    fcmToken,
    isSupportedBrowser,
    permissionStatus,
    incomingMessages,
    isSubscribing,
    errorMessage,
    checkSupport,
    requestNotificationPermission,
    clearMessages,
    dismissMessage,
  }
}
