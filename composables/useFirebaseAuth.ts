import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'

type AuthStatus = 'loading' | 'signed-out' | 'signed-in' | 'unconfigured'

export function useFirebaseAuth() {
  const user = useState<User | null>('firebase-user', () => null)
  const status = useState<AuthStatus>('firebase-auth-status', () => 'loading')
  const config = useRuntimeConfig()
  const isConfigured = Boolean(import.meta.client && config.public.firebaseApiKey && config.public.firebaseProjectId && config.public.firebaseAppId)

  if (import.meta.client && isConfigured && status.value === 'loading') {
    const { auth } = useFirebaseClient()
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult()
          if (tokenResult.claims.admin === true) {
            user.value = currentUser
            status.value = 'signed-in'
          } else {
            // Jika akun login bukan admin, otomatis tendang keluar
            await firebaseSignOut(auth)
            user.value = null
            status.value = 'signed-out'
          }
        } catch {
          await firebaseSignOut(auth)
          user.value = null
          status.value = 'signed-out'
        }
      } else {
        user.value = null
        status.value = 'signed-out'
      }
    }, () => {
      user.value = null
      status.value = 'signed-out'
    })
  } else if (import.meta.client && !isConfigured) {
    status.value = 'unconfigured'
  }

  async function signIn(email: string, password: string) {
    if (!isConfigured) throw new Error('Firebase is not configured')
    const { auth } = useFirebaseClient()
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const tokenResult = await credential.user.getIdTokenResult(true)
    if (!tokenResult.claims.admin) {
      await firebaseSignOut(auth)
      throw new Error('Akses ditolak: Akun Anda belum memiliki izin Administrator.')
    }
  }

  async function signInWithGoogle() {
    if (!isConfigured) throw new Error('Firebase is not configured')
    const { auth } = useFirebaseClient()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const credential = await signInWithPopup(auth, provider)
    const tokenResult = await credential.user.getIdTokenResult(true)
    if (!tokenResult.claims.admin) {
      await firebaseSignOut(auth)
      throw new Error('Akses ditolak: Akun Google Anda belum terdaftar sebagai Administrator.')
    }
  }

  async function signUp(email: string, password: string) {
    if (!isConfigured) throw new Error('Firebase is not configured')
    const { auth } = useFirebaseClient()
    return createUserWithEmailAndPassword(auth, email, password)
  }

  async function signOut() {
    if (!isConfigured) return
    const { auth } = useFirebaseClient()
    await firebaseSignOut(auth)
  }

  return { user, status, signIn, signInWithGoogle, signUp, signOut }
}
