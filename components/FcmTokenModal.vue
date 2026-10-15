<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  token: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)

async function copyToken() {
  if (!props.token) return
  try {
    await navigator.clipboard.writeText(props.token)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // fallback
  }
}
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
      <div v-if="isOpen" class="fixed inset-0 z-50 grid place-items-center p-4">
        <!-- Backdrop Gelap -->
        <div
          class="fixed inset-0 bg-slate-950/60 transition-opacity"
          @click="emit('close')"
        />

        <!-- Kotak Modal Dialog -->
        <section class="relative z-10 w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl border border-slate-100 transition-all">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 leading-tight">FCM Device Registration Token</h3>
                <p class="text-xs text-slate-500 mt-0.5">Kunci unik browser untuk tes push notification</p>
              </div>
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

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Registration Token (Salin untuk Firebase Console)
              </label>
              <div class="relative">
                <textarea
                  readonly
                  :value="token || 'Token belum terdaftar'"
                  rows="4"
                  class="w-full font-mono text-xs rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 select-all outline-none"
                />
              </div>
            </div>

            <div class="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs text-indigo-900 leading-relaxed">
              <strong>Cara Tes di Firebase Console:</strong>
              <ol class="list-decimal list-inside mt-1 space-y-0.5">
                <li>Salin token di atas.</li>
                <li>Buka Firebase Console &rarr; <strong>Messaging</strong> &rarr; <strong>New campaign</strong>.</li>
                <li>Pilih <strong>Notification messages</strong> &rarr; Isi judul & pesan.</li>
                <li>Klik <strong>Send test message</strong> di sisi kanan &rarr; tempel token ini.</li>
              </ol>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95"
              @click="emit('close')"
            >
              Tutup
            </button>
            <button
              type="button"
              class="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
              @click="copyToken"
            >
              {{ copied ? 'Berhasil Disalin!' : 'Salin Token' }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
