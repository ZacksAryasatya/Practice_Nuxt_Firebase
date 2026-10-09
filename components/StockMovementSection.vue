<script setup lang="ts">
import type { StockMovement } from '~/types/inventory'

defineProps<{
  movements: StockMovement[]
  productImageUrls: Record<string, string>
  search: string
  typeFilter: string
  thresholdInput: number
  currentPage: number
  hasNextPage: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', val: string): void
  (e: 'update:typeFilter', val: string): void
  (e: 'update:thresholdInput', val: number): void
  (e: 'save-threshold'): void
  (e: 'open-create'): void
  (e: 'export-excel'): void
  (e: 'prev-page'): void
  (e: 'next-page'): void
  (e: 'preview-image', payload: { url: string; title: string }): void
}>()

const typeOptions = [
  { label: 'Semua jenis', value: '' },
  { label: 'Stok masuk (In)', value: 'in' },
  { label: 'Stok keluar (Out)', value: 'out' },
]
</script>

<template>
  <section class="animate-fade-in space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Pergerakan Stok</h2>
        <p class="mt-1 text-sm text-slate-500">Setiap perubahan stok tercatat bersama admin dan alasannya.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          @click="emit('export-excel')"
        >
          Export Excel
        </button>
        <button
          class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
          @click="emit('open-create')"
        >
          + Catat pergerakan
        </button>
      </div>
    </div>

    <!-- Filters & Threshold -->
    <div class="flex flex-wrap gap-3">
      <input
        :value="search"
        aria-label="Cari riwayat stok"
        placeholder="Cari produk, SKU, atau alasan..."
        class="min-w-56 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      >
      <CustomSelect
        :model-value="typeFilter"
        :options="typeOptions"
        placeholder="Semua jenis"
        @update:model-value="emit('update:typeFilter', $event)"
      />
      <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
        Ambang menipis
        <input
          :value="thresholdInput"
          type="number"
          min="0"
          max="999999"
          class="w-20 rounded-lg border border-slate-200 px-2 py-1 text-slate-900 font-medium"
          @input="emit('update:thresholdInput', Number(($event.target as HTMLInputElement).value))"
          @change="emit('save-threshold')"
        >
      </label>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
      <table class="w-full min-w-[850px] text-left text-sm">
        <thead class="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
          <tr>
            <th class="px-5 py-4">Waktu</th>
            <th class="px-5 py-4">Produk</th>
            <th class="px-5 py-4">Jenis</th>
            <th class="px-5 py-4">Jumlah</th>
            <th class="px-5 py-4">Stok</th>
            <th class="px-5 py-4">Alasan</th>
            <th class="px-5 py-4">Admin</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="movement in movements" :key="movement.id" class="transition hover:bg-slate-50/60">
            <td class="whitespace-nowrap px-5 py-3.5 text-slate-400 text-xs">
              {{ movement.createdAt?.toLocaleString('id-ID') ?? 'Baru saja' }}
            </td>
            <td class="px-5 py-3.5 font-semibold text-slate-900">
              <div class="flex items-center gap-3">
                <img
                  v-if="productImageUrls[movement.productId]"
                  :src="productImageUrls[movement.productId]"
                  :alt="movement.productName"
                  class="h-8 w-8 cursor-pointer rounded-lg object-cover transition hover:opacity-80"
                  @click="emit('preview-image', { url: productImageUrls[movement.productId], title: movement.productName })"
                >
                <div v-else class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                  IA
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">{{ movement.productName }}</p>
                  <p class="text-xs font-mono text-slate-400 font-normal">{{ movement.sku }}</p>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="movement.type === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
              >
                {{ movement.type === 'in' ? 'Stok masuk' : 'Stok keluar' }}
              </span>
            </td>
            <td
              class="px-5 py-3.5 font-bold"
              :class="movement.type === 'in' ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ movement.type === 'in' ? '+' : '−' }}{{ movement.quantity }}
            </td>
            <td class="px-5 py-3.5 text-slate-700 font-medium">
              {{ movement.previousStock }} → {{ movement.newStock }}
            </td>
            <td class="max-w-56 truncate px-5 py-3.5 text-slate-500" :title="movement.reason">
              {{ movement.reason }}
            </td>
            <td class="px-5 py-3.5 text-xs text-slate-400 truncate max-w-44">
              {{ movement.adminEmail }}
            </td>
          </tr>
          <tr v-if="!movements.length">
            <td colspan="7" class="px-5 py-16 text-center text-slate-400">Tidak ada riwayat pergerakan stok.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div class="flex items-center justify-between text-sm text-slate-500 pt-2">
      <span class="font-medium">Halaman {{ currentPage }}</span>
      <div class="flex gap-2">
        <button
          class="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
          :disabled="currentPage <= 1"
          @click="emit('prev-page')"
        >
          Sebelumnya
        </button>
        <button
          class="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40"
          :disabled="!hasNextPage"
          @click="emit('next-page')"
        >
          Berikutnya
        </button>
      </div>
    </div>
  </section>
</template>
