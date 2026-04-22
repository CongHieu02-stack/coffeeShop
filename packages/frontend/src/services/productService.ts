/**
 * Product Service - Các hàm CRUD sản phẩm (Create, Read, Update, Delete)
 * Data Access Layer
 */
import { supabase } from './supabaseClient'
import { Product, type ProductCategory } from '@/models'

export class ProductService {
  /**
   * Lấy tất cả sản phẩm đang hoạt động
   */
  static async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(p => Product.fromJSON(p))
  }

  /**
   * Lấy sản phẩm theo ID
   */
  static async getById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return Product.fromJSON(data)
  }

  /**
   * Lấy sản phẩm theo danh mục
   */
  static async getByCategory(category: ProductCategory): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .eq('is_available', true)
      .order('name')

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(p => Product.fromJSON(p))
  }

  /**
   * Tạo sản phẩm mới
   */
  static async create(productData: {
    name: string
    price: number
    imageUrl: string
    isAvailable: boolean
    category: ProductCategory
    isActive: boolean
  }): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        price: productData.price,
        image_url: productData.imageUrl,
        is_available: productData.isAvailable,
        category: productData.category
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return Product.fromJSON(data)
  }

  /**
   * Cập nhật sản phẩm
   */
  static async update(id: number, updates: Partial<Product>): Promise<Product> {
    const updateData: Record<string, unknown> = {}

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.price !== undefined) updateData.price = updates.price
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
    if (updates.isAvailable !== undefined) updateData.is_available = updates.isAvailable
    if (updates.category !== undefined) updateData.category = updates.category

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return Product.fromJSON(data)
  }

  /**
   * Xóa sản phẩm (soft delete - set is_available to false)
   */
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ is_available: false })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Tìm kiếm sản phẩm
   */
  static async search(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('name')

    if (error) {
      throw new Error(error.message)
    }

    return (data || []).map(p => Product.fromJSON(p))
  }
}
