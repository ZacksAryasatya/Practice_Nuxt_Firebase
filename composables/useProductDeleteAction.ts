import type { Product, Category } from '~/types/inventory'

export function useProductDeleteAction(
  inventory: ReturnType<typeof useInventory>,
  onNotify: (msg: string) => void
) {
  const modal = reactive({
    isOpen: false,
    title: '',
    description: '',
    action: null as (() => Promise<void>) | null,
    isProcessing: false,
  })

  function prompt(title: string, description: string, action: () => Promise<void>) {
    modal.title = title
    modal.description = description
    modal.action = action
    modal.isProcessing = false
    modal.isOpen = true
  }

  async function execute() {
    if (!modal.action) return
    modal.isProcessing = true
    try {
      await modal.action()
      modal.isOpen = false
    } finally {
      modal.isProcessing = false
    }
  }

  function confirmDeleteProduct(product: Product) {
    prompt(
      'Hapus Produk',
      `Apakah Anda yakin ingin menghapus produk "${product.name}"? Foto dan data terkait akan dihapus secara permanen.`,
      async () => {
        try {
          await inventory.deleteProduct(product.id)
          onNotify('Produk berhasil dihapus.')
        } catch {
          onNotify('Produk gagal dihapus.')
        }
      }
    )
  }

  function confirmDeleteCategory(category: Category) {
    prompt(
      'Hapus Kategori',
      `Apakah Anda yakin ingin menghapus kategori "${category.name}"? Pastikan tidak ada produk yang menggunakan kategori ini.`,
      async () => {
        try {
          await inventory.deleteCategory(category.id)
          onNotify('Kategori berhasil dihapus.')
        } catch (e) {
          onNotify(e instanceof Error ? e.message : 'Kategori gagal dihapus.')
        }
      }
    )
  }

  return {
    deleteModal: modal,
    executeDelete: execute,
    confirmDeleteProduct,
    confirmDeleteCategory,
  }
}
