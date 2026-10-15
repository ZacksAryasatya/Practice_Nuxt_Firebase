<script setup lang="ts">
defineProps<{
  title: string
  description: string
  isOpen: boolean
  isProcessing?: boolean
  confirmText?: string
  cancelText?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 grid place-items-center p-4">
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
          class="fixed inset-0 bg-slate-950/60"
          @click="emit('close')"
        />
      </Transition>

      <!-- Kotak Modal Dialog (Scale & Slide) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
        appear
      >
        <div class="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div class="flex items-center gap-3">
            <div
              class="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl font-bold"
              :class="danger ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'"
            >
              !
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">{{ title }}</h3>
              <p class="text-xs text-slate-500">{{ description }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              :disabled="isProcessing"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              @click="emit('close')"
            >
              {{ cancelText || 'Batal' }}
            </button>
            <button
              type="button"
              :disabled="isProcessing"
              class="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
              :class="danger ? 'bg-red-600 shadow-red-200 hover:bg-red-700' : 'bg-slate-900 shadow-slate-200 hover:bg-slate-800'"
              @click="emit('confirm')"
            >
              {{ isProcessing ? 'Memproses...' : (confirmText || 'Konfirmasi') }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
