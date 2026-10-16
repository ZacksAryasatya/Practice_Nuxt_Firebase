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
  const isAdminVerified = useState<boolean>('firebase-admin-verified', () => false)
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
            isAdminVerified.value = true
            status.value = 'signed-in'
          } else {
            // Bukan admin: bersihkan state seketika sebelum trigger render
            isAdminVerified.value = false
            user.value = null
            status.value = 'signed-out'
            await firebaseSignOut(auth).catch(() => {})
          }
        } catch {
          isAdminVerified.value = false
          user.value = null
          status.value = 'signed-out'
          await firebaseSignOut(auth).catch(() => {})
        }
      } else {
        isAdminVerified.value = false
        user.value = null
        status.value = 'signed-out'
      }
    }, () => {
      isAdminVerified.value = false
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
      isAdminVerified.value = false
      user.value = null
      status.value = 'signed-out'
      await firebaseSignOut(auth).catch(() => {})
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
      isAdminVerified.value = false
      user.value = null
      status.value = 'signed-out'
      await firebaseSignOut(auth).catch(() => {})
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
    isAdminVerified.value = false
    user.value = null
    status.value = 'signed-out'
    await firebaseSignOut(auth).catch(() => {})
  }

  return { user, status, isAdminVerified, signIn, signInWithGoogle, signUp, signOut }
}
