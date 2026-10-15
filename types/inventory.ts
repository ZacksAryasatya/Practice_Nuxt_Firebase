export interface Category {
  id: string
  name: string
  normalizedName: string
  description: string
  createdAt: Date | null
  updatedAt: Date | null
}

export interface Product {
  id: string
  name: string
  normalizedName: string
  sku: string
  categoryId: string
  description: string
  priceIdr: number
  stockQuantity: number
  status: 'active' | 'inactive'
  imagePath?: string | null
  photoBase64?: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface CategoryInput {
  name: string
  description: string
}

export interface ProductInput {
  name: string
  sku: string
  categoryId: string
  description: string
  priceIdr: number
  status: 'active' | 'inactive'
  imageFile?: File | null
  removeImage?: boolean
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  sku: string
  type: 'in' | 'out'
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  adminUid: string
  adminEmail: string
  createdAt: Date | null
}

export interface StockMovementInput {
  productId: string
  type: 'in' | 'out'
  quantity: number
  reason: string
}
