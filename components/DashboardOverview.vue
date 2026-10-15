<script setup lang="ts">
import type { Category, Product } from '~/types/inventory'

const props = defineProps<{
  products: Product[]
  categories: Category[]
  productImageUrls: Record<string, string>
  lowStockThreshold: number
  activeProductsCount: number
  lowStockProducts: Product[]
  formattedTotalInventoryValue: string
}>()

const emit = defineEmits<{
  (e: 'navigate', section: 'products' | 'stock'): void
  (e: 'open-product'): void
  (e: 'open-movement'): void
  (e: 'preview-image', payload: { url: string; title: string }): void
  (e: 'filter-product', sku: string): void
}>()

function getCategoryName(id: string) {
  return props.categories.find(c => c.id === id)?.name ?? 'Kategori tidak ditemukan'
}
</script>

<template>
  <section class="animate-fade-in space-y-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold sm:text-3xl text-slate-900">Selamat datang, Admin</h2>
        <p class="mt-2 text-sm text-slate-500">Pantau inventaris toko dari satu tempat secara real-time.</p>
      </div>
      <div class="flex gap-2">
        <button
          class="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          @click="emit('open-movement')"
        >
          Catat stok
        </button>
        <button
          class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
          @click="emit('open-product')"
        >
          + Tambah produk
        </button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Produk</p>
        <p class="mt-2 text-3xl font-extrabold text-slate-900">{{ products.length }}</p>
      </div>
      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Kategori</p>
        <p class="mt-2 text-3xl font-extrabold text-slate-900">{{ categories.length }}</p>
      </div>
      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wider text-emerald-600">Produk Aktif</p>
        <p class="mt-2 text-3xl font-extrabold text-emerald-700">{{ activeProductsCount }}</p>
      </div>
      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wider text-amber-600">Stok Menipis (≤ {{ lowStockThreshold }})</p>
        <p class="mt-2 text-3xl font-extrabold text-amber-700">{{ lowStockProducts.length }}</p>
      </div>
    </div>

    <!-- Section Two Column -->
    <div class="grid gap-6 xl:grid-cols-3">
      <!-- Recent Products -->
      <section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 xl:col-span-2">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="font-bold text-slate-900">Produk Terbaru</h3>
            <p class="mt-0.5 text-xs text-slate-500">Nilai total inventaris: {{ formattedTotalInventoryValue }}</p>
          </div>
          <button class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition" @click="emit('navigate', 'products')">
            Lihat semua
          </button>
        </div>
        <div class="mt-3 divide-y divide-slate-100">
          <div v-for="product in products.slice(0, 5)" :key="product.id" class="flex items-center gap-3 py-3">
            <img
              v-if="productImageUrls[product.id]"
              :src="productImageUrls[product.id]"
              :alt="product.name"
              class="h-10 w-10 cursor-pointer rounded-lg object-cover transition hover:opacity-80"
              @click="emit('preview-image', { url: productImageUrls[product.id], title: product.name })"
            >
            <div v-else class="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
              IA
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-800">{{ product.name }}</p>
              <p class="text-xs text-slate-400">{{ product.sku }} · {{ getCategoryName(product.categoryId) }}</p>
            </div>
            <span class="text-sm font-semibold" :class="product.stockQuantity <= lowStockThreshold ? 'text-amber-600' : 'text-slate-700'">
              {{ product.stockQuantity }} stok
            </span>
          </div>
          <p v-if="!products.length" class="py-8 text-center text-sm text-slate-400">Belum ada produk terdaftar.</p>
        </div>
      </section>

      <!-- Restock Warning Card -->
      <section class="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold text-amber-950">Perlu Restock</h3>
            <p class="mt-1 text-xs text-amber-800">Batas ambang: ≤ {{ lowStockThreshold }}</p>
          </div>
          <span class="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">{{ lowStockProducts.length }}</span>
        </div>
        <div class="mt-4 space-y-2.5">
          <button
            v-for="product in lowStockProducts.slice(0, 5)"
            :key="product.id"
            class="flex w-full items-center justify-between rounded-xl bg-white p-3 text-left shadow-xs transition hover:shadow-sm"
            @click="emit('filter-product', product.sku)"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-800">{{ product.name }}</p>
              <p class="text-xs text-slate-400">{{ product.sku }}</p>
            </div>
            <span class="ml-3 shrink-0 font-extrabold text-amber-600">{{ product.stockQuantity }}</span>
          </button>
          <p v-if="!lowStockProducts.length" class="py-6 text-center text-sm text-amber-800">Semua stok produk aman.</p>
        </div>
      </section>
    </div>
  </section>
</template>
