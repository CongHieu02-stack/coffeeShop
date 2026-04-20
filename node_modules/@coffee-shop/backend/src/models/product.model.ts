import { getSupabase } from '../db/supabase'

export interface Product {
  id?: number
  name: string
  price: number
  image_url?: string | null
  is_available: boolean
  category: 'cafe' | 'trasua' | 'nuocep' | 'latte' | 'yogurt' | 'khac'
  is_active?: boolean
}

export const ProductModel = {
  /**
   * Get all active products
   */
  async findAll() {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data as Product[]
  },

  /**
   * Get product by ID
   */
  async findById(id: number) {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Product
  },

  /**
   * Create new product
   */
  async create(product: Omit<Product, 'id'>) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('products') as any)
      .insert(product)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  /**
   * Update product
   */
  async update(id: number, updates: Partial<Product>) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('products') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  /**
   * Soft delete product (set is_active = false)
   */
  async delete(id: number) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('products') as any)
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
    return { success: true, message: 'Product deleted' }
  }
}
