<script setup lang="ts">
import type { Product } from '~/types/inventory'
import type { SelectOption } from '~/components/CustomSelect.vue'

defineProps<{
  isOpen: boolean
  form: {
    productId: string
    type: 'in' | 'out'
    quantity: number
    reason: string
  }
  productOptions: SelectOption[]
  formError?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()
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
      <section class="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-widest text-indigo-600">Stock Control</p>
            <h2 class="text-xl font-bold text-slate-900 mt-0.5">Catat Pergerakan Stok</h2>
            <p class="text-xs text-slate-500 mt-0.5">Saldo stok & audit log disimpan dalam satu transaksi.</p>
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
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Pilih Produk <span class="text-red-500">*</span>
            </label>
            <CustomSelect
              :model-value="form.productId"
              :options="productOptions"
              placeholder="Pilih barang yang ingin disesuaikan stoknya"
              full-width
              @update:model-value="form.productId = $event"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Jenis Pergerakan <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition active:scale-95"
                :class="form.type === 'in' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                @click="form.type = 'in'"
              >
                <span class="text-base font-bold">+</span>
                Stok Masuk (In)
              </button>
              <button
                type="button"
                class="flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition active:scale-95"
                :class="form.type === 'out' ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-100' : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
                @click="form.type = 'out'"
              >
                <span class="text-base font-bold">−</span>
                Stok Keluar (Out)
              </button>
            </div>
          </div>

          <div>
            <label for="movement-quantity" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Jumlah Unit <span class="text-red-500">*</span>
            </label>
            <input
              id="movement-quantity"
              v-model.number="form.quantity"
              type="number"
              min="1"
              step="1"
              required
              placeholder="Contoh: 10"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            >
          </div>

          <div>
            <label for="movement-reason" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Alasan / Keterangan Mutasi <span class="text-red-500">*</span>
            </label>
            <textarea
              id="movement-reason"
              v-model="form.reason"
              maxlength="500"
              required
              rows="3"
              placeholder="Contoh: Restock barang dari supplier PT Sumber Jaya, Retur pelanggan, atau Barang kedaluwarsa"
              class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
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
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Mutasi Stok' }}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </Transition>
</template>
