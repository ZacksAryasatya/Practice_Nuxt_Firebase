<script setup lang="ts">
import type { Category, Product } from '~/types/inventory'

const { status, user, signIn, signOut } = useFirebaseAuth()
const inventory = useInventory()
const { exportToExcel } = useInventoryExport()
const formState = useInventoryForm(inventory)
const filterState = useInventoryFilters(inventory)
const fcm = useFcm()

type Section = 'dashboard' | 'products' | 'categories' | 'stock'
const activeSection = ref<Section>('dashboard')
const mobileMenuOpen = ref(false)

const loginEmail = ref('')
const loginError = ref('')
const isLoggingIn = ref(false)
const notice = ref('')
const previewImage = reactive({ url: null as string | null, title: '' })

const logoutModal = reactive({ isOpen: false, isProcessing: false })
const {
  deleteModal,
  executeDelete,
  confirmDeleteProduct,
  confirmDeleteCategory,
} = useProductDeleteAction(inventory, (msg) => { notice.value = msg })

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

const showFcmModal = ref(false)

async function handleEnablePushNotification() {
  const token = await fcm.requestNotificationPermission()
  if (token) {
    showFcmModal.value = true
    notice.value = 'Web Push Notification (FCM) berhasil diaktifkan pada perangkat ini.'
  } else if (fcm.errorMessage.value) {
    notice.value = fcm.errorMessage.value
  }
}

function handleTriggerTestNotification() {
  const title = 'Tes Notifikasi Berhasil!'
  const body = 'FCM push notification siap digunakan untuk alert stok.'
  if (Notification.permission === 'granted') new Notification(title, { body, icon: '/favicon.ico' })
  fcm.incomingMessages.value.unshift({ id: crypto.randomUUID(), title, body, receivedAt: new Date() })
  notice.value = 'Notifikasi uji coba berhasil dikirim!'
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
        :fcm-enabled="Boolean(fcm.fcmToken.value)"
        :fcm-loading="fcm.isSubscribing.value"
        :fcm-token="fcm.fcmToken.value"
        v-model:mobile-open="mobileMenuOpen"
        @navigate="navigate"
        @open-logout="logoutModal.isOpen = true"
        @enable-fcm="handleEnablePushNotification"
        @show-token="showFcmModal = true"
        @test-notification="handleTriggerTestNotification"
      >
        <p v-if="notice" class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{{ notice }}</p>
        <p v-if="inventory.error.value" class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">Firestore: {{ inventory.error.value }}</p>

        <!-- Incoming Push Notification Banners -->
        <div v-if="fcm.incomingMessages.value.length" class="mb-5 space-y-2">
          <div
            v-for="msg in fcm.incomingMessages.value"
            :key="msg.id"
            class="flex items-start justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/90 p-4 shadow-sm animate-slide-down"
          >
            <div class="flex items-start gap-3">
              <div class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
                !
              </div>
              <div>
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-900">{{ msg.title }}</h4>
                <p class="text-sm text-indigo-800 mt-0.5">{{ msg.body }}</p>
                <p class="text-[11px] text-indigo-500 mt-1">{{ msg.receivedAt.toLocaleTimeString('id-ID') }}</p>
              </div>
            </div>
            <button
              class="rounded-lg p-1 text-indigo-400 hover:text-indigo-800 hover:bg-indigo-100 transition"
              aria-label="Tutup notifikasi"
              @click="fcm.dismissMessage(msg.id)"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Dashboard -->
        <DashboardOverview
          v-if="activeSection === 'dashboard'"
          :products="inventory.products.value"
          :categories="inventory.categories.value"
          :product-image-urls="inventory.productImageUrls.value"
          :low-stock-threshold="inventory.lowStockThreshold.value"
          :active-products-count="filterState.activeProducts.value.length"
          :low-stock-products="filterState.lowStockProducts.value"
          :formatted-total-inventory-value="filterState.formattedTotalInventoryValue.value"
          @navigate="navigate"
          @open-product="formState.resetProductForm()"
          @open-movement="formState.openMovementForm()"
          @preview-image="(p) => { previewImage.url = p.url; previewImage.title = p.title }"
          @filter-product="(sku) => { navigate('products'); filterState.search.value = sku }"
        />

        <!-- Produk -->
        <ProductTableSection
          v-else-if="activeSection === 'products'"
          :products="filterState.filteredProducts.value"
          :categories="inventory.categories.value"
          :category-options="filterState.categoryFilterOptions.value"
          :product-image-urls="inventory.productImageUrls.value"
          v-model:search="filterState.search.value"
          v-model:category-filter="filterState.categoryFilter.value"
          v-model:status-filter="filterState.statusFilter.value"
          :low-stock-threshold="inventory.lowStockThreshold.value"
          @open-create="formState.resetProductForm()"
          @open-edit="formState.resetProductForm"
          @delete="confirmDeleteProduct"
          @open-movement="formState.openMovementForm"
          @preview-image="(p) => { previewImage.url = p.url; previewImage.title = p.title }"
        />

        <!-- Kategori -->
        <CategoryTableSection
          v-else-if="activeSection === 'categories'"
          :categories="inventory.categories.value"
          :product-counts="filterState.productCountsByCategory.value"
          @open-create="formState.resetCategoryForm()"
          @open-edit="formState.resetCategoryForm"
          @delete="confirmDeleteCategory"
        />

        <!-- Pergerakan Stok -->
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
        :category-options="filterState.categoryFormOptions.value"
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
        :product-options="filterState.productMovementOptions.value"
        :form-error="formState.formError.value"
        :is-submitting="formState.isSubmitting.value"
        @close="formState.showMovementForm.value = false"
        @submit="formState.submitMovement({ uid: user?.uid || '', email: user?.email || '' }, (msg) => notice = msg)"
      />

      <ImageLightbox
        :image-url="previewImage.url"
        :title="previewImage.title"
        @close="previewImage.url = null"
      />

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
      <FcmTokenModal
        :is-open="showFcmModal"
        :token="fcm.fcmToken.value"
        @close="showFcmModal = false"
        @test="handleTriggerTestNotification"
      />
    </template>
  </main>
</template>
