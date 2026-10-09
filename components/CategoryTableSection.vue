<script setup lang="ts">
import type { Category } from '~/types/inventory'

defineProps<{
  categories: Category[]
  productCounts: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'open-create'): void
  (e: 'open-edit', category: Category): void
  (e: 'delete', category: Category): void
}>()
</script>

<template>
  <section class="animate-fade-in space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Kategori Produk</h2>
        <p class="mt-1 text-sm text-slate-500">Atur pengelompokan produk inventaris toko.</p>
      </div>
      <button
        class="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
        @click="emit('open-create')"
      >
        + Tambah kategori
      </button>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
      <table class="w-full min-w-[650px] text-left text-sm">
        <thead class="bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
          <tr>
            <th class="px-5 py-4">Kategori</th>
            <th class="px-5 py-4">Deskripsi</th>
            <th class="px-5 py-4">Jumlah Produk</th>
            <th class="px-5 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="category in categories" :key="category.id" class="transition hover:bg-slate-50/60">
            <td class="px-5 py-4 font-semibold text-slate-900">{{ category.name }}</td>
            <td class="px-5 py-4 text-slate-500">{{ category.description || '—' }}</td>
            <td class="px-5 py-4 text-slate-700 font-medium">{{ productCounts[category.id] || 0 }} produk</td>
            <td class="whitespace-nowrap px-5 py-4 text-right space-x-3">
              <button class="font-semibold text-indigo-600 hover:text-indigo-800" @click="emit('open-edit', category)">
                Edit
              </button>
              <button class="font-semibold text-red-600 hover:text-red-800" @click="emit('delete', category)">
                Hapus
              </button>
            </td>
          </tr>
          <tr v-if="!categories.length">
            <td colspan="4" class="px-5 py-16 text-center text-slate-400">Belum ada kategori yang terdaftar.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
