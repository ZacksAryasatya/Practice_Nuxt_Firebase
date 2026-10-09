import type { Category, Product } from '~/types/inventory'

export function useInventoryFilters(inventory: ReturnType<typeof useInventory>) {
  const search = ref('')
  const categoryFilter = ref('')
  const statusFilter = ref('')
  const movementSearch = ref('')
  const movementTypeFilter = ref('')
  const lowStockThresholdInput = ref(5)

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
    filteredProducts,
    filteredMovements,
    productCountsByCategory,
    handleSaveThreshold,
  }
}
