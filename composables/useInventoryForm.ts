import type { Category, Product, ProductInput } from '~/types/inventory'

export function useInventoryForm(inventory: ReturnType<typeof useInventory>) {
  const showProductForm = ref(false)
  const showCategoryForm = ref(false)
  const showMovementForm = ref(false)
  const formError = ref('')
  const isSubmitting = ref(false)

  const editingProductId = ref<string | undefined>()
  const editingCategoryId = ref<string | undefined>()
  const selectedImage = ref<File | null>(null)
  const removeExistingImage = ref(false)

  const productForm = reactive<Omit<ProductInput, 'imageFile' | 'removeImage'>>({
    name: '',
    sku: '',
    categoryId: '',
    description: '',
    priceIdr: 0,
    status: 'active',
  })

  const categoryForm = reactive({
    name: '',
    description: '',
  })

  const movementForm = reactive({
    productId: '',
    type: 'in' as 'in' | 'out',
    quantity: 1,
    reason: '',
  })

  function resetProductForm(product?: Product) {
    editingProductId.value = product?.id
    selectedImage.value = null
    removeExistingImage.value = false
    Object.assign(productForm, product
      ? {
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          description: product.description,
          priceIdr: product.priceIdr,
          status: product.status,
        }
      : {
          name: '',
          sku: '',
          categoryId: '',
          description: '',
          priceIdr: 0,
          status: 'active',
        })
    formError.value = ''
    showProductForm.value = true
  }

  function resetCategoryForm(category?: Category) {
    editingCategoryId.value = category?.id
    Object.assign(categoryForm, category
      ? { name: category.name, description: category.description }
      : { name: '', description: '' })
    formError.value = ''
    showCategoryForm.value = true
  }

  function openMovementForm(productId = '') {
    movementForm.productId = productId
    movementForm.type = 'in'
    movementForm.quantity = 1
    movementForm.reason = ''
    formError.value = ''
    showMovementForm.value = true
  }

  async function submitProduct(onSuccess: (msg: string) => void) {
    formError.value = ''
    isSubmitting.value = true
    try {
      await inventory.saveProduct({
        ...productForm,
        imageFile: selectedImage.value,
        removeImage: removeExistingImage.value,
      }, editingProductId.value)
      showProductForm.value = false
      onSuccess('Produk berhasil disimpan.')
    } catch (e) {
      formError.value = e instanceof Error ? e.message : 'Produk gagal disimpan.'
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitCategory(onSuccess: (msg: string) => void) {
    formError.value = ''
    isSubmitting.value = true
    try {
      await inventory.saveCategory({ ...categoryForm }, editingCategoryId.value)
      showCategoryForm.value = false
      onSuccess('Kategori berhasil disimpan.')
    } catch (e) {
      formError.value = e instanceof Error ? e.message : 'Kategori gagal disimpan.'
    } finally {
      isSubmitting.value = false
    }
  }

  async function submitMovement(admin: { uid: string; email: string }, onSuccess: (msg: string) => void) {
    formError.value = ''
    isSubmitting.value = true
    try {
      await inventory.recordStockMovement({ ...movementForm }, admin)
      showMovementForm.value = false
      onSuccess(`Pergerakan stok ${movementForm.type === 'in' ? 'masuk' : 'keluar'} berhasil dicatat.`)
    } catch (e) {
      formError.value = e instanceof Error ? e.message : 'Pergerakan stok gagal dicatat.'
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    showProductForm,
    showCategoryForm,
    showMovementForm,
    formError,
    isSubmitting,
    editingProductId,
    editingCategoryId,
    selectedImage,
    removeExistingImage,
    productForm,
    categoryForm,
    movementForm,
    resetProductForm,
    resetCategoryForm,
    openMovementForm,
    submitProduct,
    submitCategory,
    submitMovement,
  }
}
