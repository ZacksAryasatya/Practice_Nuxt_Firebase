import type { Category, Product } from '~/types/inventory'
import type { SelectOption } from '~/components/CustomSelect.vue'

export function useInventoryFilters(inventory: ReturnType<typeof useInventory>) {
  const search = ref('')
  const categoryFilter = ref('')
  const statusFilter = ref('')
  const movementSearch = ref('')
  const movementTypeFilter = ref('')
  const lowStockThresholdInput = ref(5)

  function formatPrice(val: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
  }

  // Domain calculations
  const activeProducts = computed(() => inventory.products.value.filter(p => p.status === 'active'))
  const lowStockProducts = computed(() => inventory.products.value.filter(p => p.stockQuantity <= inventory.lowStockThreshold.value))
  const totalInventoryValue = computed(() => inventory.products.value.reduce((sum, p) => sum + p.priceIdr * p.stockQuantity, 0))
  const formattedTotalInventoryValue = computed(() => formatPrice(totalInventoryValue.value))

  const filteredProducts = computed(() =>
    inventory.products.value.filter((p) => {
      const term = search.value.trim().toLocaleLowerCase('id-ID')
      return `${p.name} ${p.sku}`.toLocaleLowerCase('id-ID').includes(term)
        && (!categoryFilter.value || p.categoryId === categoryFilter.value)
        && (!statusFilter.value || p.status === statusFilter.value)
    })
  )

  const filteredMovements = computed(() =>
    inventory.stockMovements.value.filter((m) => {
      const term = movementSearch.value.trim().toLocaleLowerCase('id-ID')
      return `${m.productName} ${m.sku} ${m.reason}`.toLocaleLowerCase('id-ID').includes(term)
        && (!movementTypeFilter.value || m.type === movementTypeFilter.value)
    })
  )

  const productCountsByCategory = computed(() => {
    const map: Record<string, number> = {}
    for (const p of inventory.products.value) {
      map[p.categoryId] = (map[p.categoryId] || 0) + 1
    }
    return map
  })

  // Pre-formatted Options for Dropdowns
  const categoryFilterOptions = computed<SelectOption[]>(() => [
    { label: 'Semua kategori', value: '' },
    ...inventory.categories.value.map(c => ({ label: c.name, value: c.id })),
  ])

  const categoryFormOptions = computed<SelectOption[]>(() => [
    { label: 'Pilih kategori barang', value: '', disabled: true },
    ...inventory.categories.value.map(c => ({ label: c.name, value: c.id })),
  ])

  const productMovementOptions = computed<SelectOption[]>(() => [
    { label: 'Pilih barang yang ingin disesuaikan stoknya', value: '', disabled: true },
    ...inventory.products.value.map(p => ({
      label: `${p.name} (${p.sku})`,
      value: p.id,
      description: `Sisa Stok: ${p.stockQuantity}`,
    })),
  ])

  watch(
    () => inventory.lowStockThreshold.value,
    (val) => {
      lowStockThresholdInput.value = val
    }
  )

  async function handleSaveThreshold(onSuccess: (msg: string) => void) {
    try {
      await inventory.saveLowStockThreshold(lowStockThresholdInput.value)
      onSuccess('Ambang stok berhasil disimpan.')
    } catch (e) {
      onSuccess(e instanceof Error ? e.message : 'Ambang stok gagal disimpan.')
    }
  }

  return {
    search,
    categoryFilter,
    statusFilter,
    movementSearch,
    movementTypeFilter,
    lowStockThresholdInput,
    activeProducts,
    lowStockProducts,
    totalInventoryValue,
    formattedTotalInventoryValue,
    filteredProducts,
    filteredMovements,
    productCountsByCategory,
    categoryFilterOptions,
    categoryFormOptions,
    productMovementOptions,
    handleSaveThreshold,
  }
}
