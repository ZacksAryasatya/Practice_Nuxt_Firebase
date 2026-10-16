<script setup lang="ts">
defineProps<{
  email: string
  isSubmitting: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'update:email', val: string): void
  (e: 'submit', password: string): void
  (e: 'google-submit'): void
}>()

const password = ref('')
const showPassword = ref(false)

function handleSubmit() {
  emit('submit', password.value)
}
</script>

<template>
  <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-100/50 border border-slate-100 animate-slide-down">
    <h2 class="text-2xl font-bold tracking-tight text-slate-900">Selamat datang kembali</h2>
    <p class="mt-1.5 text-sm text-slate-500">Masuk untuk mengelola inventaris toko Anda.</p>

    <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" for="email">
          Email Administrator
        </label>
        <input
          id="email"
          :value="email"
          autocomplete="username"
          type="email"
          required
          placeholder="admin@tokobelajar.com"
          class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          @input="emit('update:email', ($event.target as HTMLInputElement).value)"
        >
      </div>

      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" for="password">
          Kata Sandi
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            autocomplete="current-password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="Masukkan kata sandi akun"
            class="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition focus:outline-none"
            :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            @click="showPassword = !showPassword"
          >
            <!-- Icon Eye Open -->
            <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <!-- Icon Eye Closed -->
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700" role="alert">
        {{ errorMessage }}
      </div>

      <button
        :disabled="isSubmitting"
        class="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Memproses autentikasi...' : 'Masuk ke panel' }}
      </button>

      <div class="relative flex items-center justify-center pt-2">
        <div class="border-t border-slate-200 w-full" />
        <span class="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 shrink-0 font-medium">atau</span>
        <div class="border-t border-slate-200 w-full" />
      </div>

      <!-- Google OAuth Button -->
      <button
        type="button"
        :disabled="isSubmitting"
        class="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 active:scale-98 disabled:opacity-60"
        @click="emit('google-submit')"
      >
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Masuk dengan Google</span>
      </button>

      <p class="text-center text-[11px] text-slate-400 pt-2">
        Akses khusus akun administrator terdaftar
      </p>
    </form>
  </div>
</template>
