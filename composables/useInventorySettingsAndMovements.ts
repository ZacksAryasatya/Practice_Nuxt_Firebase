import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  limit,
  startAfter,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import type { StockMovement } from '~/types/inventory'

export function useInventorySettingsAndMovements(
  db: any,
  onError: (msg: string) => void
) {
  const stockMovements = useState<StockMovement[]>('inventory-stock-movements', () => [])
  const stockMovementPage = useState<number>('inventory-stock-movement-page', () => 1)
  const stockMovementHasNext = useState<boolean>('inventory-stock-movement-has-next', () => false)
  const lowStockThreshold = useState<number>('inventory-low-stock-threshold', () => 5)

  let stopMovements: Unsubscribe | undefined
  let stopSettings: Unsubscribe | undefined
  let movementCursors: QueryDocumentSnapshot<DocumentData>[] = []
  let movementLastDocument: QueryDocumentSnapshot<DocumentData> | undefined

  function toDate(val: unknown): Date | null {
    if (val && typeof val === 'object' && 'toDate' in val && typeof (val as any).toDate === 'function') {
      return (val as any).toDate()
    }
    return null
  }

  function toMovement(snapshot: QueryDocumentSnapshot<DocumentData>): StockMovement {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      productId: String(data.productId ?? ''),
      productName: String(data.productName ?? ''),
      sku: String(data.sku ?? ''),
      type: data.type === 'out' ? 'out' : 'in',
      quantity: Number(data.quantity ?? 0),
      previousStock: Number(data.previousStock ?? 0),
      newStock: Number(data.newStock ?? 0),
      reason: String(data.reason ?? ''),
      adminUid: String(data.adminUid ?? ''),
      adminEmail: String(data.adminEmail ?? ''),
      createdAt: toDate(data.createdAt),
    }
  }

  function listenToMovementPage(cursor?: QueryDocumentSnapshot<DocumentData>) {
    stopMovements?.()
    const movementCol = collection(db, 'stockMovements')
    const movementQuery = cursor
      ? query(movementCol, orderBy('createdAt', 'desc'), startAfter(cursor), limit(51))
      : query(movementCol, orderBy('createdAt', 'desc'), limit(51))

    stopMovements = onSnapshot(
      movementQuery,
      (snapshot) => {
        const pageDocs = snapshot.docs.slice(0, 50)
        stockMovements.value = pageDocs.map(toMovement)
        stockMovementHasNext.value = snapshot.docs.length > 50
        movementLastDocument = pageDocs.at(-1)
      },
      (cause) => {
        onError(cause.message)
      }
    )
  }

  function startMovementAndSettingsListeners() {
    movementCursors = []
    stockMovementPage.value = 1
    stockMovementHasNext.value = false
    listenToMovementPage()

    stopSettings = onSnapshot(
      doc(db, 'settings', 'inventory'),
      (snapshot) => {
        const th = Number(snapshot.data()?.lowStockThreshold)
        if (Number.isInteger(th) && th >= 0 && th <= 999999) lowStockThreshold.value = th
      },
      (cause) => {
        onError(cause.message)
      }
    )
  }

  function stopMovementAndSettingsListeners() {
    stopMovements?.()
    stopSettings?.()
    stopMovements = undefined
    stopSettings = undefined
    stockMovements.value = []
    stockMovementPage.value = 1
    stockMovementHasNext.value = false
    movementCursors = []
    movementLastDocument = undefined
    lowStockThreshold.value = 5
  }

  function nextStockMovementPage() {
    if (!stockMovementHasNext.value || !movementLastDocument) return
    movementCursors.push(movementLastDocument)
    stockMovementPage.value += 1
    listenToMovementPage(movementLastDocument)
  }

  function previousStockMovementPage() {
    if (stockMovementPage.value <= 1) return
    movementCursors.pop()
    stockMovementPage.value -= 1
    listenToMovementPage(movementCursors.at(-1))
  }

  async function saveLowStockThreshold(value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 999999) {
      throw new Error('Ambang stok harus berupa bilangan bulat 0 sampai 999999.')
    }
    await setDoc(
      doc(db, 'settings', 'inventory'),
      {
        lowStockThreshold: value,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    lowStockThreshold.value = value
  }

  return {
    stockMovements,
    stockMovementPage,
    stockMovementHasNext,
    lowStockThreshold,
    startMovementAndSettingsListeners,
    stopMovementAndSettingsListeners,
    nextStockMovementPage,
    previousStockMovementPage,
    saveLowStockThreshold,
  }
}
