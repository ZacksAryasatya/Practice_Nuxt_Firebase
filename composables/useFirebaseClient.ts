import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'

let firestoreInstance: Firestore | null = null

export function useFirebaseClient() {
  const config = useRuntimeConfig()
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

  // Inisialisasi Firestore dengan Offline Persistence (Multi-tab IndexedDB cache)
  if (!firestoreInstance) {
    if (import.meta.client) {
      try {
        firestoreInstance = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        })
      } catch {
        // Fallback jika sudah terinisialisasi
        firestoreInstance = getFirestore(app)
      }
    } else {
      firestoreInstance = getFirestore(app)
    }
  }

  return {
    app,
    auth: getAuth(app),
    db: firestoreInstance,
  }
}
