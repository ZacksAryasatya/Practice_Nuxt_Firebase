<script setup lang="ts">
defineProps<{
  activeSection: 'dashboard' | 'products' | 'categories' | 'stock'
  productCount: number
  categoryCount: number
  userEmail?: string | null
  mobileOpen: boolean
  isOnline?: boolean
  fcmEnabled?: boolean
  fcmLoading?: boolean
  fcmToken?: string | null
  unreadCount?: number
}>()

const emit = defineEmits<{
  (e: 'navigate', section: 'dashboard' | 'products' | 'categories' | 'stock'): void
  (e: 'update:mobileOpen', val: boolean): void
  (e: 'open-logout'): void
  (e: 'enable-fcm'): void
  (e: 'show-token'): void
}>()
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Backdrop Mobile -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-20 bg-slate-950/40 lg:hidden"
      @click="emit('update:mobileOpen', false)"
    />

    <!-- Sidebar Desktop & Mobile -->
    <aside
      class="fixed inset-y-0 left-0 z-30 flex w-64 -translate-x-full flex-col bg-slate-950 text-slate-300 transition-transform lg:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : ''"
    >
      <div class="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400">Inventory</p>
          <p class="text-lg font-bold tracking-tight text-white">Admin Panel</p>
        </div>
        <button
          class="ml-auto text-slate-400 lg:hidden"
          aria-label="Tutup menu"
          @click="emit('update:mobileOpen', false)"
        >
          <span class="text-2xl leading-none">×</span>
        </button>
      </div>

      <nav class="flex-1 space-y-1.5 px-3 py-6">
        <p class="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Menu Utama</p>
        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition duration-150"
          :class="activeSection === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50' : 'hover:bg-white/5 hover:text-white'"
          @click="emit('navigate', 'dashboard')"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </button>
        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition duration-150"
          :class="activeSection === 'products' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50' : 'hover:bg-white/5 hover:text-white'"
          @click="emit('navigate', 'products')"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Produk
          <span class="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">{{ productCount }}</span>
        </button>
        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition duration-150"
          :class="activeSection === 'categories' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50' : 'hover:bg-white/5 hover:text-white'"
          @click="emit('navigate', 'categories')"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
          Kategori
          <span class="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold">{{ categoryCount }}</span>
        </button>
        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition duration-150"
          :class="activeSection === 'stock' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50' : 'hover:bg-white/5 hover:text-white'"
          @click="emit('navigate', 'stock')"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
          Pergerakan stok
        </button>
      </nav>

      <div class="border-t border-white/10 p-4">
        <div class="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-500 font-bold text-white text-xs">
            {{ (userEmail || 'A').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-white">Administrator</p>
            <p class="truncate text-xs text-slate-400">{{ userEmail }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="min-h-screen lg:pl-64">
      <header class="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg p-2 text-xl hover:bg-slate-100 lg:hidden"
            aria-label="Buka menu"
            @click="emit('update:mobileOpen', true)"
          >
            <span class="block h-0.5 w-5 bg-slate-600 shadow-[0_-6px_0_#475569,0_6px_0_#475569]" />
          </button>
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {{ activeSection === 'dashboard' ? 'Overview' : activeSection === 'products' ? 'Inventory' : activeSection === 'categories' ? 'Management' : 'Stock control' }}
            </p>
            <h1 class="text-lg font-bold text-slate-900">
              {{ activeSection === 'dashboard' ? 'Dashboard' : activeSection === 'products' ? 'Produk' : activeSection === 'categories' ? 'Kategori' : 'Pergerakan Stok' }}
            </h1>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- Indikator Offline Persistence -->
          <div
            class="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold select-none"
            :class="isOnline ? 'border-slate-200 bg-white text-slate-600' : 'border-amber-300 bg-amber-50 text-amber-800'"
            :title="isOnline ? 'Terhubung ke Cloud Firestore' : 'Mode Offline Aktif: Data tersimpan di cache lokal IndexedDB & otomatis sinkron saat online'"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'"
            />
            <span class="hidden sm:inline">
              {{ isOnline ? 'Online' : 'Mode Offline' }}
            </span>
          </div>

          <!-- Tombol Push Notification FCM -->
          <button
            type="button"
            :disabled="fcmLoading"
            class="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold transition active:scale-95"
            :class="fcmEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-white text-slate-700 hover:bg-slate-50'"
            :title="fcmEnabled ? 'Lihat token FCM' : 'Aktifkan Web Push Notifikasi FCM'"
            @click="fcmEnabled ? emit('show-token') : emit('enable-fcm')"
          >
            <span class="relative flex h-2 w-2">
              <span v-if="fcmEnabled" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2" :class="fcmEnabled ? 'bg-emerald-500' : 'bg-slate-300'"></span>
            </span>
            <span class="hidden sm:inline">
              {{ fcmLoading ? 'Mendaftarkan...' : (fcmEnabled ? 'Notifikasi Aktif (Lihat Token)' : 'Aktifkan Push Notif') }}
            </span>
          </button>

          <span class="hidden text-sm text-slate-500 md:block">{{ userEmail }}</span>
          <button
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
            @click="emit('open-logout')"
          >
            Keluar
          </button>
        </div>
      </header>

      <div class="mx-auto max-w-[1500px] p-4 sm:p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
