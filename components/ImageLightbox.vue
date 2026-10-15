<script setup lang="ts">
defineProps<{
  imageUrl: string | null
  title?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="imageUrl" class="fixed inset-0 z-50 grid place-items-center p-4">
      <!-- Backdrop Gelap (Fade Murni) -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        appear
      >
        <div
          class="fixed inset-0 bg-slate-950/80"
          @click="emit('close')"
        />
      </Transition>

      <!-- Kotak Preview (Scale & Slide) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
        appear
      >
        <div class="relative z-10 max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl bg-white p-4 shadow-2xl">
          <div class="mb-3 flex items-center justify-between border-b pb-2">
            <h3 class="font-bold text-slate-800">{{ title || 'Foto Produk' }}</h3>
            <button class="rounded-lg p-1 text-2xl text-slate-400 hover:text-slate-800" aria-label="Tutup" @click="emit('close')">
              <span class="text-2xl leading-none">×</span>
            </button>
          </div>
          <div class="flex max-h-[75vh] items-center justify-center overflow-auto rounded-xl bg-slate-100 p-2">
            <img :src="imageUrl" :alt="title || 'Preview'" class="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-sm">
          </div>
          <div class="mt-3 flex justify-end">
            <a :href="imageUrl" target="_blank" rel="noopener noreferrer" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-slate-50">
              Buka Ukuran Penuh
            </a>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
