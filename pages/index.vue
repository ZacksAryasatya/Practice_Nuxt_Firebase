<script setup lang="ts">
import type { Category, Product } from '~/types/inventory'

const { status, user, signIn, signOut } = useFirebaseAuth()
const inventory = useInventory()
const { exportToExcel } = useInventoryExport()
const formState = useInventoryForm(inventory)
const filterState = useInventoryFilters(inventory)

type Section = 'dashboard' | 'products' | 'categories' | 'stock'
const activeSection = ref<Section>('dashboard')
const mobileMenuOpen = ref(false)

const loginEmail = ref('')
const loginError = ref('')
const isLoggingIn = ref(false)
const notice = ref('')
const previewImage = reactive({ url: null as string | null, title: '' })

const logoutModal = reactive({ isOpen: false, isProcessing: false })
const deleteModal = reactive({
  isOpen: false,
  title: '',
  description: '',
  action: null as (() => Promise<void>) | null,
  isProcessing: false,
})

const editingProduct = computed(() =>
  formState.editingProductId.value
    ? inventory.products.value.find(p => p.id === formState.editingProductId.value)
    : undefined
)

watch(() => status.value, (s) => {
  if (s === 'signed-in') inventory.subscribe()
  else inventory.unsubscribe()
}, { immediate: true })
onBeforeUnmount(inventory.unsubscribe)

async function handleLoginSubmit(password: string) {
  loginError.value = ''
  isLoggingIn.value = true
  try {
    await signIn(loginEmail.value, password)
  } catch {
    loginError.value = 'Login gagal. Periksa email dan kata sandi.'
  } finally {
    isLoggingIn.value = false
  }
}

async function confirmLogout() {
  logoutModal.isProcessing = true
  try {
    await signOut()
    inventory.unsubscribe()
    logoutModal.isOpen = false
  } finally {
    logoutModal.isProcessing = false
  }
}

function navigate(section: Section) {
  activeSection.value = section
  mobileMenuOpen.value = false
  notice.value = ''
}

function handleFilterProductBySku(sku: string) {
  navigate('products')
  filterState.search.value = sku
}

function promptDelete(title: string, description: string, action: () => Promise<void>) {
  deleteModal.title = title
  deleteModal.description = description
  deleteModal.action = action
  deleteModal.isProcessing = false
  deleteModal.isOpen = true
}

async function executeDelete() {
  if (!deleteModal.action) return
  deleteModal.isProcessing = true
  try {
    await deleteModal.action()
    deleteModal.isOpen = false
  } finally {
    deleteModal.isProcessing = false
  }
}

function handleDeleteProduct(product: Product) {
  promptDelete(
    'Hapus Produk',
    `Apakah Anda yakin ingin menghapus produk "${product.name}"? Foto dan data terkait akan dihapus secara permanen.`,
    async () => {
      try {
        await inventory.deleteProduct(product.id)
        notice.value = 'Produk berhasil dihapus.'
      } catch {
        notice.value = 'Produk gagal dihapus.'
      }
    }
  )
}

function handleDeleteCategory(category: Category) {
  promptDelete(
    'Hapus Kategori',
    `Apakah Anda yakin ingin menghapus kategori "${category.name}"? Pastikan tidak ada produk yang menggunakan kategori ini.`,
    async () => {
      try {
        await inventory.deleteCategory(category.id)
        notice.value = 'Kategori berhasil dihapus.'
      } catch (e) {
        notice.value = e instanceof Error ? e.message : 'Kategori gagal dihapus.'
      }
    }
  )
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <!-- State Loading -->
    <div v-if="status === 'loading'" class="grid min-h-screen place-items-center text-sm font-medium text-slate-500">
      Memeriksa sesi...
    </div>

    <!-- State Signed Out -->
    <section v-else-if="status === 'signed-out'" class="grid min-h-screen place-items-center bg-slate-100 px-4">
      <LoginCard
        v-model:email="loginEmail"
        :is-submitting="isLoggingIn"
        :error-message="loginError"
        @submit="handleLoginSubmit"
      />
    </section>

    <!-- State Unconfigured -->
    <section v-else-if="status === 'unconfigured'" class="mx-auto max-w-3xl px-4 py-12">
      <div class="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950 font-medium">
        Firebase belum dikonfigurasi. Isi `NUXT_PUBLIC_FIREBASE_*` di `.env` lokal.
      </div>
    </section>

    <!-- State Authenticated Dashboard Shell -->
    <template v-else>
      <AdminShell
        :active-section="activeSection"
        :product-count="inventory.products.value.length"
        :category-count="inventory.categories.value.length"
        :user-email="user?.email"
        v-model:mobile-open="mobileMenuOpen"
        @navigate="navigate"
        @open-logout="logoutModal.isOpen = true"
      >
        <!-- Alerts -->
        <p v-if="notice" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">
          {{ notice }}
        </p>
        <p v-if="inventory.error.value" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
          Firestore: {{ inventory.error.value }}
        </p>

        <!-- View 1: Dashboard -->
        <DashboardOverview
          v-if="activeSection === 'dashboard'"
          :products="inventory.products.value"
          :categories="inventory.categories.value"
          :product-image-urls="inventory.productImageUrls.value"
          :low-stock-threshold="inventory.lowStockThreshold.value"
          @navigate="navigate"
          @open-product="formState.resetProductForm()"
          @open-movement="formState.openMovementForm()"
          @preview-image="(p) => { previewImage.url = p.url; previewImage.title = p.title }"
          @filter-product="handleFilterProductBySku"
        />

        <!-- View 2: Produk -->
        <ProductTableSection
          v-else-if="activeSection === 'products'"
          :products="filterState.filteredProducts.value"
          :categories="inventory.categories.value"
          :product-image-urls="inventory.productImageUrls.value"
          v-model:search="filterState.search.value"
          v-model:category-filter="filterState.categoryFilter.value"
          v-model:status-filter="filterState.statusFilter.value"
          :low-stock-threshold="inventory.lowStockThreshold.value"
          @open-create="formState.resetProductForm()"
          @open-edit="formState.resetProductForm"
          @delete="handleDeleteProduct"
          @open-movement="formState.openMovementForm"
          @preview-image="(p) => { previewImage.url = p.url; previewImage.title = p.title }"
        />

        <!-- View 3: Kategori -->
        <CategoryTableSection
          v-else-if="activeSection === 'categories'"
          :categories="inventory.categories.value"
          :product-counts="filterState.productCountsByCategory.value"
          @open-create="formState.resetCategoryForm()"
          @open-edit="formState.resetCategoryForm"
          @delete="handleDeleteCategory"
        />

        <!-- View 4: Pergerakan Stok -->
        <StockMovementSection
          v-else
          :movements="filterState.filteredMovements.value"
          :product-image-urls="inventory.productImageUrls.value"
          v-model:search="filterState.movementSearch.value"
          v-model:type-filter="filterState.movementTypeFilter.value"
          v-model:threshold-input="filterState.lowStockThresholdInput.value"
          :current-page="inventory.stockMovementPage.value"
          :has-next-page="inventory.stockMovementHasNext.value"
          @save-threshold="filterState.handleSaveThreshold((msg) => notice = msg)"
          @open-create="formState.openMovementForm()"
          @export-excel="exportToExcel(filterState.filteredMovements.value, filterState.movementSearch.value, filterState.movementTypeFilter.value)"
          @prev-page="inventory.previousStockMovementPage"
          @next-page="inventory.nextStockMovementPage"
          @preview-image="(p) => { previewImage.url = p.url; previewImage.title = p.title }"
        />
      </AdminShell>

      <!-- Form Modals -->
      <ProductFormModal
        :is-open="formState.showProductForm.value"
        :is-editing="Boolean(formState.editingProductId.value)"
        :form="formState.productForm"
        :categories="inventory.categories.value"
        :current-product="editingProduct"
        :current-image-url="formState.editingProductId.value ? inventory.productImageUrls.value[formState.editingProductId.value] : undefined"
        :remove-existing-image="formState.removeExistingImage.value"
        :form-error="formState.formError.value"
        :is-submitting="formState.isSubmitting.value"
        @close="formState.showProductForm.value = false"
        @submit="formState.submitProduct((msg) => notice = msg)"
        @update:image="formState.selectedImage.value = $event"
        @update:remove-image="formState.removeExistingImage.value = $event"
      />

      <CategoryFormModal
        :is-open="formState.showCategoryForm.value"
        :is-editing="Boolean(formState.editingCategoryId.value)"
        :form="formState.categoryForm"
        :form-error="formState.formError.value"
        :is-submitting="formState.isSubmitting.value"
        @close="formState.showCategoryForm.value = false"
        @submit="formState.submitCategory((msg) => notice = msg)"
      />

      <MovementFormModal
        :is-open="formState.showMovementForm.value"
        :form="formState.movementForm"
        :products="inventory.products.value"
        :form-error="formState.formError.value"
        :is-submitting="formState.isSubmitting.value"
        @close="formState.showMovementForm.value = false"
        @submit="formState.submitMovement({ uid: user?.uid || '', email: user?.email || '' }, (msg) => notice = msg)"
      />

      <!-- Image Lightbox -->
      <ImageLightbox
        :image-url="previewImage.url"
        :title="previewImage.title"
        @close="previewImage.url = null"
      />

      <!-- Action Confirmation Modals -->
      <ConfirmModal
        :is-open="deleteModal.isOpen"
        :title="deleteModal.title"
        :description="deleteModal.description"
        :is-processing="deleteModal.isProcessing"
        danger
        confirm-text="Ya, Hapus"
        @close="deleteModal.isOpen = false"
        @confirm="executeDelete"
      />

      <ConfirmModal
        :is-open="logoutModal.isOpen"
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari sesi admin panel?"
        :is-processing="logoutModal.isProcessing"
        confirm-text="Ya, Keluar"
        @close="logoutModal.isOpen = false"
        @confirm="confirmLogout"
      />
    </template>
  </main>
</template>
