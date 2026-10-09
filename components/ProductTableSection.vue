<script setup lang="ts">
import type { Category, Product } from '~/types/inventory'

const props = defineProps<{
  products: Product[]
  categories: Category[]
  productImageUrls: Record<string, string>
  search: string
  categoryFilter: string
  statusFilter: string
  lowStockThreshold: number
}>()

const emit = defineEmits<{
  (e: 'update:search', val: string): void
  (e: 'update:categoryFilter', val: string): void
  (e: 'update:statusFilter', val: string): void
  (e: 'open-create'): void
  (e: 'open-edit', product: Product): void
  (e: 'delete', product: Product): void
  (e: 'open-movement', productId: string): void
  (e: 'preview-image', payload: { url: string; title: string }): void
}>()

function formatPrice(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function getCategoryName(id: string) {
  return props.categories.find(c => c.id === id)?.name ?? 'Kategori tidak ditemukan'
}

const categoryOptions = computed(() => [
  { label: 'Semua kategori', value: '' },
  ...props.categories.map(c => ({ label: c.name, value: c.id })),
])

const statusOptions = computed(() => [
  { label: 'Semua status', value: '' },
  { label: 'Aktif (Tersedia)', value: 'active' },
  { label: 'Nonaktif (Diarsipkan)', value: 'inactive' },
])
</script>

<template>
  <section class="animate-fade-in space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Semua Produk</h2>
        <p class="mt-1 text-sm text-slate-500">Kelola katalog barang toko; perubahan stok dicatat terpisah.</p>
      </div>
      <button
        class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
        @click="emit('open-create')"
      >
        + Tambah produk
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap gap-3">
      <input
        :value="search"
        aria-label="Cari produk"
        placeholder="Cari nama atau SKU..."
        class="min-w-56 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      >
      <CustomSelect
        :model-value="categoryFilter"
        :options="categoryOptions"
        placeholder="Semua kategori"
        @update:model-value="emit('update:categoryFilter', $event)"
      />
      <CustomSelect
        :model-value="statusFilter"
        :options="statusOptions"
        placeholder="Semua status"
        @update:model-value="emit('update:statusFilter', $event)"
      />
    </div>

    <!-- Data Table -->
    <div class="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
      <table class="w-full min-w-[850px] text-left text-sm">
        <thead class="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
          <tr>
            <th class="px-5 py-4">Produk</th>
            <th class="px-5 py-4">SKU</th>
            <th class="px-5 py-4">Kategori</th>
            <th class="px-5 py-4">Harga</th>
            <th class="px-5 py-4">Stok</th>
            <th class="px-5 py-4">Status</th>
            <th class="px-5 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="product in products" :key="product.id" class="transition hover:bg-slate-50/60">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <img
                  v-if="productImageUrls[product.id]"
                  :src="productImageUrls[product.id]"
                  :alt="product.name"
                  class="h-10 w-10 cursor-pointer rounded-lg object-cover transition hover:opacity-80"
                  @click="emit('preview-image', { url: productImageUrls[product.id], title: product.name })"
                >
                <div v-else class="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                  IA
                </div>
                <span class="font-semibold text-slate-900">{{ product.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5 text-slate-400 font-mono text-xs">{{ product.sku }}</td>
            <td class="px-5 py-3.5 text-slate-600">{{ getCategoryName(product.categoryId) }}</td>
            <td class="px-5 py-3.5 font-medium text-slate-900">{{ formatPrice(product.priceIdr) }}</td>
            <td class="px-5 py-3.5">
              <span :class="product.stockQuantity <= lowStockThreshold ? 'font-bold text-amber-600' : 'text-slate-700'">
                {{ product.stockQuantity }}
              </span>
              <button
                class="ml-2 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                @click="emit('open-movement', product.id)"
              >
                Ubah
              </button>
            </td>
            <td class="px-5 py-3.5">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="product.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ product.status === 'active' ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-5 py-3.5 text-right space-x-3">
              <button class="font-semibold text-indigo-600 hover:text-indigo-800" @click="emit('open-edit', product)">Edit</button>
              <button class="font-semibold text-red-600 hover:text-red-800" @click="emit('delete', product)">Hapus</button>
            </td>
          </tr>
          <tr v-if="!products.length">
            <td colspan="7" class="px-5 py-16 text-center text-slate-400">Tidak ada produk yang cocok dengan pencarian.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
