import {
  addDoc,
  collection,
  deleteField,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import type { Category, CategoryInput, Product, ProductInput, StockMovementInput } from '~/types/inventory'

function toDate(value: unknown): Date | null {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as any).toDate === 'function') {
    return (value as any).toDate()
  }
  return null
}

function toCategory(snapshot: QueryDocumentSnapshot<DocumentData>): Category {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    name: String(data.name ?? ''),
    normalizedName: String(data.normalizedName ?? ''),
    description: String(data.description ?? ''),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

function toProduct(snapshot: QueryDocumentSnapshot<DocumentData>): Product {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    name: String(data.name ?? ''),
    normalizedName: String(data.normalizedName ?? ''),
    sku: String(data.sku ?? ''),
    categoryId: String(data.categoryId ?? ''),
    description: String(data.description ?? ''),
    priceIdr: Number(data.priceIdr ?? 0),
    stockQuantity: Number(data.stockQuantity ?? 0),
    status: data.status === 'inactive' ? 'inactive' : 'active',
    imagePath: typeof data.imagePath === 'string' ? data.imagePath : null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('id-ID')
}

export function useInventory() {
  const categories = useState<Category[]>('inventory-categories', () => [])
  const products = useState<Product[]>('inventory-products', () => [])
  const loading = useState<boolean>('inventory-loading', () => false)
  const error = useState<string>('inventory-error', () => '')
  const productImageUrls = useState<Record<string, string>>('inventory-product-image-urls', () => ({}))

  let stopCategories: Unsubscribe | undefined
  let stopProducts: Unsubscribe | undefined

  const { db } = useFirebaseClient()
  const settingsAndMovements = useInventorySettingsAndMovements(db, (msg) => { error.value = msg })

  function subscribe() {
    if (!import.meta.client || stopCategories || stopProducts) return
    loading.value = true
    error.value = ''

    stopCategories = onSnapshot(query(collection(db, 'categories'), orderBy('name')), (snapshot) => {
      categories.value = snapshot.docs.map(toCategory)
      loading.value = false
    }, (cause) => {
      error.value = cause.message
      loading.value = false
    })

    stopProducts = onSnapshot(query(collection(db, 'products'), orderBy('name')), (snapshot) => {
      products.value = snapshot.docs.map(toProduct)
      void Promise.all(products.value.filter(p => p.imagePath && !productImageUrls.value[p.id]).map(async (p) => {
        try {
          const { getProductImageUrl } = await import('~/composables/useSupabaseStorage')
          productImageUrls.value[p.id] = await getProductImageUrl(p.imagePath!)
        } catch {
          delete productImageUrls.value[p.id]
        }
      }))
      loading.value = false
    }, (cause) => {
      error.value = cause.message
      loading.value = false
    })

    settingsAndMovements.startMovementAndSettingsListeners()
  }

  function unsubscribe() {
    stopCategories?.()
    stopProducts?.()
    stopCategories = undefined
    stopProducts = undefined
    categories.value = []
    products.value = []
    productImageUrls.value = {}
    settingsAndMovements.stopMovementAndSettingsListeners()
  }

  async function saveCategory(input: CategoryInput, id?: string) {
    const name = input.name.trim()
    if (!name) throw new Error('Nama kategori wajib diisi.')
    const normalizedName = normalize(name)
    const duplicate = categories.value.some(c => c.normalizedName === normalizedName && c.id !== id)
    if (duplicate) throw new Error('Nama kategori sudah digunakan.')

    const payload = { name, normalizedName, description: input.description.trim(), updatedAt: serverTimestamp() }
    if (id) {
      await updateDoc(doc(db, 'categories', id), payload)
    } else {
      await addDoc(collection(db, 'categories'), { ...payload, createdAt: serverTimestamp() })
    }
  }

  async function deleteCategory(id: string) {
    if (products.value.some(p => p.categoryId === id)) {
      throw new Error('Kategori masih dipakai produk. Pindahkan produk ke kategori lain dulu.')
    }
    await deleteDoc(doc(db, 'categories', id))
  }

  async function saveProduct(input: ProductInput, id?: string) {
    const name = input.name.trim()
    const sku = input.sku.trim().toLocaleUpperCase('id-ID')
    if (!name || !sku || !input.categoryId) throw new Error('Nama, SKU, dan kategori wajib diisi.')
    if (!Number.isInteger(input.priceIdr) || input.priceIdr < 0) throw new Error('Harga harus berupa bilangan bulat nol atau lebih.')
    if (products.value.some(p => p.sku === sku && p.id !== id)) throw new Error('SKU sudah digunakan.')

    const payload = {
      name,
      normalizedName: normalize(name),
      sku,
      categoryId: input.categoryId,
      description: input.description.trim(),
      priceIdr: input.priceIdr,
      status: input.status,
      updatedAt: serverTimestamp(),
    }
    const existingProduct = id ? products.value.find(p => p.id === id) : undefined
    let productId = id
    if (productId) await updateDoc(doc(db, 'products', productId), payload)
    else {
      productId = (await addDoc(collection(db, 'products'), { ...payload, stockQuantity: 0, createdAt: serverTimestamp() })).id
    }

    if (!productId) throw new Error('Gagal mendapatkan ID produk.')
    if (input.imageFile) {
      const { uploadProductImage, deleteProductImage } = await import('~/composables/useSupabaseStorage')
      const newPath = await uploadProductImage(productId, input.imageFile)
      await updateDoc(doc(db, 'products', productId), { imagePath: newPath, updatedAt: serverTimestamp() })
      if (existingProduct?.imagePath) await deleteProductImage(existingProduct.imagePath)
    } else if (input.removeImage && existingProduct?.imagePath) {
      const { deleteProductImage } = await import('~/composables/useSupabaseStorage')
      await updateDoc(doc(db, 'products', productId), { imagePath: deleteField(), updatedAt: serverTimestamp() })
      await deleteProductImage(existingProduct.imagePath)
    }
  }

  async function recordStockMovement(input: StockMovementInput, admin: { uid: string; email: string }) {
    const quantity = Number(input.quantity)
    const reason = input.reason.trim()
    if (!input.productId) throw new Error('Pilih produk terlebih dahulu.')
    if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Jumlah harus berupa bilangan bulat lebih dari nol.')
    if (!reason || reason.length > 500) throw new Error('Alasan wajib diisi (maksimal 500 karakter).')

    const productRef = doc(db, 'products', input.productId)
    const movementRef = doc(collection(db, 'stockMovements'))

    await runTransaction(db, async (transaction) => {
      const productSnapshot = await transaction.get(productRef)
      if (!productSnapshot.exists()) throw new Error('Produk tidak ditemukan.')
      const product = productSnapshot.data()
      const previousStock = Number(product.stockQuantity ?? 0)
      const newStock = input.type === 'in' ? previousStock + quantity : previousStock - quantity
      if (newStock < 0) throw new Error('Stok keluar melebihi stok yang tersedia.')

      transaction.update(productRef, {
        stockQuantity: newStock,
        lastStockMovementId: movementRef.id,
        updatedAt: serverTimestamp(),
      })
      transaction.set(movementRef, {
        productId: input.productId,
        productName: String(product.name ?? ''),
        sku: String(product.sku ?? ''),
        type: input.type,
        quantity,
        previousStock,
        newStock,
        reason,
        adminUid: admin.uid,
        adminEmail: admin.email,
        createdAt: serverTimestamp(),
      })
    })
  }

  async function deleteProduct(id: string) {
    const product = products.value.find(item => item.id === id)
    await deleteDoc(doc(db, 'products', id))
    if (product?.imagePath) {
      const { deleteProductImage } = await import('~/composables/useSupabaseStorage')
      await deleteProductImage(product.imagePath)
    }
  }

  function getCategoryName(categoryId: string) {
    return categories.value.find(c => c.id === categoryId)?.name ?? 'Kategori tidak ditemukan'
  }

  return {
    categories,
    products,
    productImageUrls,
    stockMovements: settingsAndMovements.stockMovements,
    stockMovementPage: settingsAndMovements.stockMovementPage,
    stockMovementHasNext: settingsAndMovements.stockMovementHasNext,
    lowStockThreshold: settingsAndMovements.lowStockThreshold,
    loading,
    error,
    subscribe,
    unsubscribe,
    nextStockMovementPage: settingsAndMovements.nextStockMovementPage,
    previousStockMovementPage: settingsAndMovements.previousStockMovementPage,
    saveCategory,
    deleteCategory,
    saveProduct,
    deleteProduct,
    recordStockMovement,
    saveLowStockThreshold: settingsAndMovements.saveLowStockThreshold,
    getCategoryName,
  }
}
