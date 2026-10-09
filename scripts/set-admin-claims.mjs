import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const adminUid = process.env.FIREBASE_ADMIN_UID
const expectedProjectId = process.env.FIREBASE_PROJECT_ID

if (!serviceAccountPath || !adminUid) {
  console.error('Set FIREBASE_SERVICE_ACCOUNT_PATH and FIREBASE_ADMIN_UID before running this script.')
  process.exit(1)
}

const serviceAccount = JSON.parse(await readFile(resolve(serviceAccountPath), 'utf8'))

if (expectedProjectId && serviceAccount.project_id !== expectedProjectId) {
  console.error(`Project mismatch: credential is for "${serviceAccount.project_id}", expected "${expectedProjectId}".`)
  process.exit(1)
}

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
})

try {
  const auth = getAuth(app)
  const user = await auth.getUser(adminUid)
  const claims = {
    ...user.customClaims,
    role: 'authenticated',
    admin: true,
  }

  await auth.setCustomUserClaims(adminUid, claims)
  console.info(`Set role="authenticated" and admin=true for UID ${adminUid} in project ${serviceAccount.project_id}.`)
  console.info('Sign out and sign in again (or force-refresh the ID token) for the new claims to appear.')
} catch (error) {
  console.error('Could not set custom claims. Verify the UID and service account permissions.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
} finally {
  await app.delete()
}
