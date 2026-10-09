import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
const expectedProjectId = process.env.FIREBASE_PROJECT_ID
if (!serviceAccountPath) {
  console.error('Set FIREBASE_SERVICE_ACCOUNT_PATH to the local service-account JSON file.')
  process.exit(1)
}

const serviceAccount = JSON.parse(await readFile(resolve(serviceAccountPath), 'utf8'))
if (expectedProjectId && serviceAccount.project_id !== expectedProjectId) {
  console.error(`Project mismatch: credential is for ${serviceAccount.project_id}, expected ${expectedProjectId}.`)
  process.exit(1)
}

const app = initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id })
try {
  const db = getFirestore(app)
  const products = await db.collection('products').get()
  const existingMovements = await db.collection('stockMovements').limit(1).get()
  if (!existingMovements.empty) {
    console.error('stockMovements is not empty; migration stopped to avoid duplicate opening balances.')
    process.exitCode = 1
  } else {
    let batch = db.batch()
    let operations = 0
    let migrated = 0
    for (const productDocument of products.docs) {
      const product = productDocument.data()
      const quantity = Number(product.stockQuantity ?? 0)
      if (!Number.isInteger(quantity) || quantity < 0) {
        console.error(`Invalid stock quantity on product ${productDocument.id}; migration stopped.`)
        process.exitCode = 1
        break
      }
      if (quantity === 0) continue
      const movementReference = db.collection('stockMovements').doc()
      batch.set(movementReference, {
        productId: productDocument.id,
        productName: String(product.name ?? 'Produk'),
        sku: String(product.sku ?? 'UNKNOWN'),
        type: 'in',
        quantity,
        previousStock: 0,
        newStock: quantity,
        reason: 'Saldo awal sebelum pencatatan pergerakan stok',
        adminUid: 'system-migration',
        adminEmail: 'system-migration',
        createdAt: FieldValue.serverTimestamp(),
      })
      batch.update(productDocument.ref, {
        lastStockMovementId: movementReference.id,
        updatedAt: FieldValue.serverTimestamp(),
      })
      operations += 2
      migrated += 1
      if (operations >= 450) {
        await batch.commit()
        batch = db.batch()
        operations = 0
      }
    }
    if (!process.exitCode && operations > 0) await batch.commit()
    if (!process.exitCode) console.info(`Recorded opening balances for ${migrated} existing products in ${serviceAccount.project_id}.`)
  }
} finally {
  await app.delete()
}
