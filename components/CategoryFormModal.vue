<script setup lang="ts">
import type { Category } from '~/types/inventory'

defineProps<{
  isOpen: boolean
  isEditing: boolean
  form: { name: string; description: string }
  formError?: string
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-40 grid place-items-center p-4">
        <!-- Backdrop Gelap -->
        <div
          class="fixed inset-0 bg-slate-950/60 transition-opacity"
          @click="emit('close')"
        />

        <!-- Kotak Modal Dialog -->
        <section class="relative z-10 w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 transition-all">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h2 class="text-xl font-bold text-slate-900">{{ isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru' }}</h2>
              <p class="text-xs text-slate-500 mt-0.5">Kelompokkan produk ke dalam kategori yang sesuai.</p>
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
              <label for="category-name" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Nama Kategori <span class="text-red-500">*</span>
              </label>
              <input
                id="category-name"
                v-model="form.name"
                maxlength="100"
                required
                placeholder="Contoh: Makanan, Minuman, Pakaian, Elektronik"
                class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
            </div>

            <div>
              <label for="category-description" class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Deskripsi Kategori <span class="text-xs font-normal text-slate-400">(Opsional)</span>
              </label>
              <textarea
                id="category-description"
                v-model="form.description"
                maxlength="500"
                rows="3"
                placeholder="Jelaskan jenis barang atau karakteristik kategori ini..."
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
                <span>{{ isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan Kategori') }}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
