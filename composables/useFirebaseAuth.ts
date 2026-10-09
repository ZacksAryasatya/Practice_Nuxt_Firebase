import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
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
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
      status.value = currentUser ? 'signed-in' : 'signed-out'
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
    await signInWithEmailAndPassword(auth, email, password)
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

  return { user, status, signIn, signUp, signOut }
}
