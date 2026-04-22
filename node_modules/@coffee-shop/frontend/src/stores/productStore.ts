/**
 * Product Store (Controller)
 * Lưu danh sách sản phẩm để hiển thị nhanh
 * Theo mẫu MVC - Controller gọi ProductService, quản lý state
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Product, PRODUCT_CATEGORIES, type ProductCategory } from '@/models'
import { ProductService } from '@/services'

// Re-export types
export type { ProductCategory }

export const useProductStore = defineStore('products', () => {
  // ==================== STATE ====================
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const availableProducts = computed(() =>
    products.value.filter(p => p.isInStock())
  )

  const getProductById = computed(() => (id: number) =>
    products.value.find(p => p.id === id)
  )

  const getProductsByCategory = computed(() => (category: ProductCategory) =>
    products.value.filter(p => p.category === category && p.isInStock())
  )

  const productsByCategory = computed(() => {
    const grouped = new Map<ProductCategory, Product[]>()
    PRODUCT_CATEGORIES.forEach(cat => {
      grouped.set(cat.value, products.value.filter(p => p.category === cat.value))
    })
    return grouped
  })

  // ==================== ACTIONS ====================

  /**
   * Load tất cả sản phẩm
   */
  const loadProducts = async () => {
    isLoading.value = true
    error.value = null

    try {
      products.value = await ProductService.getAll()
    } catch (err: any) {
      error.value = 'Không thể tải danh sách sản phẩm'
      console.error('Error loading products:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load sản phẩm theo danh mục
   */
  const loadByCategory = async (category: ProductCategory) => {
    isLoading.value = true
    error.value = null

    try {
      const categoryProducts = await ProductService.getByCategory(category)
      // Merge with existing products
      categoryProducts.forEach(newProduct => {
        const index = products.value.findIndex(p => p.id === newProduct.id)
        if (index === -1) {
          products.value.push(newProduct)
        }
      })
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tạo sản phẩm mới (Admin)
   */
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> => {
    isLoading.value = true
    error.value = null

    try {
      const newProduct = await ProductService.create(productData)
      products.value.push(newProduct)
      return newProduct
    } catch (err: any) {
      error.value = 'Không thể tạo sản phẩm'
      console.error('Error creating product:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cập nhật sản phẩm (Admin)
   */
  const updateProduct = async (id: number, updates: Partial<Product>): Promise<Product | null> => {
    isLoading.value = true
    error.value = null

    try {
      const updated = await ProductService.update(id, updates)
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updated
      }
      return updated
    } catch (err: any) {
      error.value = 'Không thể cập nhật sản phẩm'
      console.error('Error updating product:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa sản phẩm (Admin)
   */
  const deleteProduct = async (id: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await ProductService.delete(id)
      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch (err: any) {
      error.value = 'Không thể xóa sản phẩm'
      console.error('Error deleting product:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tìm kiếm sản phẩm
   */
  const searchProducts = async (query: string): Promise<Product[]> => {
    isLoading.value = true
    error.value = null

    try {
      return await ProductService.search(query)
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    products,
    isLoading,
    error,

    // Getters
    availableProducts,
    getProductById,
    getProductsByCategory,
    productsByCategory,

    // Actions
    loadProducts,
    loadByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
  }
})
