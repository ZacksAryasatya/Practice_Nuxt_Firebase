<script setup lang="ts">
export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: SelectOption[]
    placeholder?: string
    id?: string
    required?: boolean
    fullWidth?: boolean
  }>(),
  {
    placeholder: 'Pilih...',
    fullWidth: false,
    required: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

function select(option: SelectOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('click', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('click', handleClickOutside)
    window.removeEventListener('keydown', handleKeyDown)
  }
})
</script>

<template>
  <div
    :id="id"
    ref="containerRef"
    class="relative inline-block text-left"
    :class="fullWidth ? 'w-full' : ''"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      :class="[
        'flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium transition cursor-pointer select-none',
        'hover:bg-slate-50/80 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500',
        isOpen ? 'border-indigo-500 ring-4 ring-indigo-100 shadow-sm' : 'shadow-xs',
        fullWidth ? 'w-full' : 'min-w-[170px]',
        selectedOption ? 'text-slate-800' : 'text-slate-400',
      ]"
      @click="isOpen = !isOpen"
    >
      <span class="truncate">
        {{ selectedOption ? selectedOption.label : placeholder }}
      </span>
      <svg
        class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200"
        :class="isOpen ? 'rotate-180 text-indigo-600' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu Floating -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1.5 max-h-60 w-full min-w-[200px] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/70 focus:outline-none"
      >
        <div v-if="!options.length" class="p-3 text-center text-xs text-slate-400">
          Tidak ada pilihan
        </div>
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          :disabled="opt.disabled"
          :class="[
            'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition',
            opt.disabled ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50',
            modelValue === opt.value
              ? 'bg-indigo-50/70 font-semibold text-indigo-700'
              : 'text-slate-700 font-normal',
          ]"
          @click="select(opt)"
        >
          <div class="min-w-0 flex-1">
            <span class="block truncate">{{ opt.label }}</span>
            <span v-if="opt.description" class="block text-xs font-normal text-slate-400 truncate">
              {{ opt.description }}
            </span>
          </div>

          <!-- Checkmark Icon on Selected -->
          <svg
            v-if="modelValue === opt.value"
            class="h-4 w-4 shrink-0 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>
