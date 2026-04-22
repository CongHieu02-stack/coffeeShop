/**
 * Product Model - Lớp đối tượng Sản phẩm
 * Theo mẫu OOP
 */

export type ProductCategory = 'cafe' | 'trasua' | 'nuocep' | 'latte' | 'yogurt' | 'khac'

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'cafe', label: 'Cà phê' },
  { value: 'trasua', label: 'Trà sữa' },
  { value: 'nuocep', label: 'Nước ép' },
  { value: 'latte', label: 'Latte' },
  { value: 'yogurt', label: 'Yogurt' },
  { value: 'khac', label: 'Khác' }
]

export class Product {
  id: number
  name: string
  price: number
  imageUrl: string | null
  isAvailable: boolean
  category: ProductCategory
  isActive: boolean
  createdAt?: Date

  constructor(data: {
    id: number
    name: string
    price: number
    image_url?: string | null
    is_available?: boolean
    category?: ProductCategory
    is_active?: boolean
    created_at?: string
  }) {
    this.id = data.id
    this.name = data.name
    this.price = data.price
    this.imageUrl = data.image_url ?? null
    this.isAvailable = data.is_available ?? true
    this.category = data.category ?? 'khac'
    this.isActive = data.is_active ?? true
    this.createdAt = data.created_at ? new Date(data.created_at) : undefined
  }

  /**
   * Tính giá sau khi áp dụng giảm giá
   */
  getDiscountedPrice(percent: number): number {
    return Math.round(this.price * (1 - percent / 100))
  }

  /**
   * Kiểm tra sản phẩm có đang bán không
   */
  isInStock(): boolean {
    return this.isAvailable && this.isActive
  }

  /**
   * Lấy tên danh mục hiển thị
   */
  getCategoryLabel(): string {
    return PRODUCT_CATEGORIES.find(c => c.value === this.category)?.label || 'Khác'
  }

  /**
   * Format giá tiền VND
   */
  getFormattedPrice(): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(this.price)
  }

  /**
   * Chuyển đổi từ plain object sang Product instance
   */
  static fromJSON(data: Record<string, unknown>): Product {
    return new Product({
      id: data.id as number,
      name: data.name as string,
      price: data.price as number,
      image_url: data.image_url as string | null,
      is_available: data.is_available as boolean,
      category: data.category as ProductCategory,
      is_active: data.is_active as boolean,
      created_at: data.created_at as string
    })
  }

  /**
   * Chuyển đổi Product instance sang plain object (cho Supabase)
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      image_url: this.imageUrl,
      is_available: this.isAvailable,
      category: this.category,
      is_active: this.isActive,
      created_at: this.createdAt?.toISOString()
    }
  }
}
