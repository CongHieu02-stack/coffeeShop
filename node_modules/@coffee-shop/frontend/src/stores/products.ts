import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// DEMO MODE
const DEMO_MODE = false

const DEMO_PRODUCTS: Product[] = [
  { id: 1, name: 'Cà phê đen', price: 25000, image_url: null, is_available: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Cà phê sữa', price: 30000, image_url: null, is_available: true, created_at: new Date().toISOString() },
  { id: 3, name: 'Bạc xỉu', price: 35000, image_url: null, is_available: true, created_at: new Date().toISOString() },
  { id: 4, name: 'Cappuccino', price: 45000, image_url: null, is_available: true, created_at: new Date().toISOString() },
  { id: 5, name: 'Latte', price: 45000, image_url: null, is_available: true, created_at: new Date().toISOString() },
  { id: 6, name: 'Espresso', price: 25000, image_url: null, is_available: true, created_at: new Date().toISOString() },
  { id: 7, name: 'Americano', price: 30000, image_url: null, is_available: true, created_at: new Date().toISOString() },
  { id: 8, name: 'Mocha', price: 50000, image_url: null, is_available: false, created_at: new Date().toISOString() }
]

export interface Product {
  id: number
  name: string
  price: number
  image_url: string | null
  is_available: boolean
  created_at?: string
}

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const availableProducts = computed(() =>
    products.value.filter(p => p.is_available)
  )

  const getProductById = computed(() => (id: number) =>
    products.value.find(p => p.id === id)
  )

  // Actions
  const loadProducts = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        products.value = [...DEMO_PRODUCTS]
        isLoading.value = false
        return
      }

      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (supabaseError) throw supabaseError
      products.value = data || []
    } catch (err) {
      error.value = 'Không thể tải danh sách sản phẩm'
      console.error('Error loading products:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      if (data) {
        products.value.push(data)
        return data
      }
      return null
    } catch (err) {
      error.value = 'Không thể tạo sản phẩm'
      console.error('Error creating product:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      if (data) {
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          products.value[index] = data
        }
        return data
      }
      return null
    } catch (err) {
      error.value = 'Không thể cập nhật sản phẩm'
      console.error('Error updating product:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteProduct = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError

      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch (err) {
      error.value = 'Không thể xóa sản phẩm'
      console.error('Error deleting product:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    isLoading,
    error,
    availableProducts,
    getProductById,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
