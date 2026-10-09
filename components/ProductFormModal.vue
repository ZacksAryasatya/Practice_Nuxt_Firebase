<script setup lang="ts">
import type { Category, Product } from '~/types/inventory'

const props = defineProps<{
  isOpen: boolean
  isEditing: boolean
  form: {
    name: string
    sku: string
    categoryId: string
    description: string
    priceIdr: number
    status: 'active' | 'inactive'
  }
  categories: Category[]
  currentProduct?: Product
  currentImageUrl?: string
  removeExistingImage: boolean
  formError?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'update:image', file: File | null): void
  (e: 'update:removeImage', val: boolean): void
}>()

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  emit('update:image', file)
  emit('update:removeImage', false)
}

const formattedPrice = computed({
  get() {
    if (!props.form.priceIdr && props.form.priceIdr !== 0) return ''
    if (props.form.priceIdr === 0) return '0'
    return new Intl.NumberFormat('id-ID').format(props.form.priceIdr)
  },
  set(val: string) {
    const rawNumber = Number(val.replace(/\D/g, ''))
    props.form.priceIdr = isNaN(rawNumber) ? 0 : rawNumber
  },
})

function handlePriceInput(event: Event) {
  const target = event.target as HTMLInputElement
  const rawNumber = Number(target.value.replace(/\D/g, ''))
  props.form.priceIdr = isNaN(rawNumber) ? 0 : rawNumber
  target.value = props.form.priceIdr === 0 ? '0' : new Intl.NumberFormat('id-ID').format(props.form.priceIdr)
}

const categoryOptions = computed(() => [
  { label: 'Pilih kategori barang', value: '', disabled: true },
  ...props.categories.map(c => ({ label: c.name, value: c.id })),
])

const statusOptions = [
  { label: 'Aktif (Tersedia)', value: 'active' },
  { label: 'Nonaktif (Diarsipkan)', value: 'inactive' },
]
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs"
      @click.self="emit('close')"
    >
      <section class="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 class="text-xl font-bold text-slate-900">{{ isEditing ? 'Edit Data Produk' : 'Tambah Produk Baru' }}</h2>
            <p class="text-xs text-slate-500 mt-0.5">Lengkapi rincian informasi katalog barang.</p>
          </div>
          <button
            type="button"
            class="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Tutup"
            @click="emit('close')"
          >
            <span class="text-2xl leading-none">×</span>
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="emit('submit')">
          <div>
            <label for="product-name" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Nama Produk <span class="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              v-model="form.name"
              maxlength="150"
              required
              placeholder="Contoh: Kopi Robusta Lampung 250g"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            >
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="product-sku" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Kode SKU <span class="text-red-500">*</span>
              </label>
              <input
                id="product-sku"
                v-model="form.sku"
                maxlength="50"
                required
                placeholder="Contoh: KOP-ROB-001"
                class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 uppercase"
              >
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Kategori <span class="text-red-500">*</span>
              </label>
              <CustomSelect
                :model-value="form.categoryId"
                :options="categoryOptions"
                placeholder="Pilih kategori barang"
                full-width
                @update:model-value="form.categoryId = $event"
              />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="product-price" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Harga Jual (IDR) <span class="text-red-500">*</span>
              </label>
              <div class="relative flex items-center">
                <span class="pointer-events-none absolute left-4 text-sm font-bold text-slate-400 select-none">
                  Rp
                </span>
                <input
                  id="product-price"
                  :value="formattedPrice"
                  type="text"
                  inputmode="numeric"
                  required
                  placeholder="0"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  @input="handlePriceInput"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Status Katalog
              </label>
              <CustomSelect
                :model-value="form.status"
                :options="statusOptions"
                placeholder="Pilih status"
                full-width
                @update:model-value="form.status = ($event as 'active' | 'inactive')"
              />
            </div>
          </div>

          <div class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-900 flex items-center gap-2">
            <span class="font-bold shrink-0">Info Stok:</span>
            <span>Produk baru dimulai dengan 0 stok. Penambahan/pengurangan dilakukan melalui menu <strong>Pergerakan stok</strong>.</span>
          </div>

          <div>
            <label for="product-description" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Deskripsi Produk <span class="text-xs font-normal text-slate-400">(Opsional)</span>
            </label>
            <textarea
              id="product-description"
              v-model="form.description"
              maxlength="2000"
              rows="3"
              placeholder="Tuliskan spesifikasi, deskripsi kemasan, atau catatan penting produk..."
              class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label for="product-image" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Foto Produk <span class="text-xs font-normal text-slate-400">(JPEG, PNG, WebP · maks. 5 MB)</span>
            </label>
            <input
              id="product-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-700 transition"
              @change="handleFileChange"
            >
            <div v-if="isEditing && currentImageUrl && !removeExistingImage" class="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <img
                :src="currentImageUrl"
                alt="Foto produk saat ini"
                class="h-12 w-12 rounded-lg object-cover border border-slate-200"
              >
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-700 truncate">Foto produk saat ini tersimpan</p>
                <button
                  type="button"
                  class="mt-0.5 text-xs font-semibold text-red-600 hover:text-red-800 transition"
                  @click="emit('update:removeImage', true); emit('update:image', null)"
                >
                  Hapus foto ini
                </button>
              </div>
            </div>
            <p v-else-if="removeExistingImage" class="mt-2 text-xs font-medium text-amber-600">
              Foto saat ini akan dihapus saat produk disimpan.
            </p>
          </div>

          <div v-if="formError" class="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700" role="alert">
            {{ formError }}
          </div>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              :disabled="isSubmitting"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
              @click="emit('close')"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg v-if="isSubmitting" class="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{{ isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan Produk') }}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </Transition>
</template>
