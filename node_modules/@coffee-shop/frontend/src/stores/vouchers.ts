import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'

export interface Voucher {
  id: string
  code: string
  description: string | null
  discount_value: number
  is_percentage: boolean
  min_order_amount: number | null
  max_discount: number | null
  is_active: boolean
  expiry_date: string | null
  usage_limit: number | null
  usage_count: number
  created_at: string
}

const DEMO_VOUCHERS: Voucher[] = [
  {
    id: 'voucher-1',
    code: 'WELCOME10',
    description: 'Giảm 10% cho khách hàng mới',
    discount_value: 10,
    is_percentage: true,
    min_order_amount: 50000,
    max_discount: 50000,
    is_active: true,
    expiry_date: null,
    usage_limit: null,
    usage_count: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'voucher-2',
    code: 'FLAT20K',
    description: 'Giảm 20,000đ',
    discount_value: 20000,
    is_percentage: false,
    min_order_amount: 100000,
    max_discount: null,
    is_active: false,
    expiry_date: null,
    usage_limit: 100,
    usage_count: 0,
    created_at: new Date().toISOString()
  }
]

const DEMO_MODE = false

export const useVouchersStore = defineStore('vouchers', () => {
  const vouchers = ref<Voucher[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeVouchers = computed(() =>
    vouchers.value.filter(v => v.is_active && !isExpired(v) && !isUsageLimitReached(v))
  )

  const isExpired = (voucher: Voucher): boolean => {
    if (!voucher.expiry_date) return false
    return new Date(voucher.expiry_date) < new Date()
  }

  const isUsageLimitReached = (voucher: Voucher): boolean => {
    if (!voucher.usage_limit) return false
    return voucher.usage_count >= voucher.usage_limit
  }

  const getVoucherByCode = (code: string): Voucher | undefined => {
    return activeVouchers.value.find(v => v.code.toUpperCase() === code.toUpperCase())
  }

  const calculateDiscount = (voucher: Voucher, orderAmount: number): number => {
    // Check minimum order amount
    if (voucher.min_order_amount && orderAmount < voucher.min_order_amount) {
      return 0
    }

    let discount = 0
    if (voucher.is_percentage) {
      discount = (orderAmount * voucher.discount_value) / 100
      // Apply max discount if set
      if (voucher.max_discount && discount > voucher.max_discount) {
        discount = voucher.max_discount
      }
    } else {
      discount = voucher.discount_value
    }

    // Don't discount more than order amount
    if (discount > orderAmount) {
      discount = orderAmount
    }

    return Math.floor(discount)
  }

  const loadVouchers = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        vouchers.value = [...DEMO_VOUCHERS]
        return
      }

      const { data, error: err } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      vouchers.value = data || []
    } catch (err: any) {
      error.value = err.message
      console.error('Error loading vouchers:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createVoucher = async (voucherData: Omit<Voucher, 'id' | 'created_at' | 'usage_count'>) => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        const newVoucher: Voucher = {
          ...voucherData,
          id: `voucher-${Date.now()}`,
          created_at: new Date().toISOString(),
          usage_count: 0
        }
        vouchers.value.unshift(newVoucher)
        return newVoucher
      }

      // Clean up data before insert
      const insertData = {
        code: voucherData.code.toUpperCase(),
        description: voucherData.description || null,
        discount_value: Number(voucherData.discount_value) || 0,
        is_percentage: Boolean(voucherData.is_percentage),
        min_order_amount: voucherData.min_order_amount ? Number(voucherData.min_order_amount) : null,
        max_discount: voucherData.max_discount ? Number(voucherData.max_discount) : null,
        is_active: Boolean(voucherData.is_active),
        expiry_date: voucherData.expiry_date || null,
        usage_limit: voucherData.usage_limit ? Number(voucherData.usage_limit) : null,
        usage_count: 0
      }

      console.log('Inserting voucher:', insertData)

      const { data, error: err } = await supabase
        .from('vouchers')
        .insert(insertData)
        .select()
        .single()

      if (err) {
        console.error('Supabase insert error:', err)
        throw new Error(err.message || 'Không thể thêm voucher')
      }

      vouchers.value.unshift(data)
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error creating voucher:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateVoucher = async (id: string, updates: Partial<Voucher>) => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        const index = vouchers.value.findIndex(v => v.id === id)
        if (index > -1) {
          vouchers.value[index] = { ...vouchers.value[index], ...updates }
        }
        return vouchers.value[index]
      }

      const { data, error: err } = await supabase
        .from('vouchers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      const index = vouchers.value.findIndex(v => v.id === id)
      if (index > -1) {
        vouchers.value[index] = data
      }
      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating voucher:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const toggleVoucherStatus = async (id: string, isActive: boolean) => {
    return updateVoucher(id, { is_active: isActive })
  }

  const deleteVoucher = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        vouchers.value = vouchers.value.filter(v => v.id !== id)
        return
      }

      const { error: err } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id)

      if (err) throw err

      vouchers.value = vouchers.value.filter(v => v.id !== id)
    } catch (err: any) {
      error.value = err.message
      console.error('Error deleting voucher:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const incrementUsage = async (id: string) => {
    const voucher = vouchers.value.find(v => v.id === id)
    if (!voucher) return

    const newUsageCount = voucher.usage_count + 1
    return updateVoucher(id, { usage_count: newUsageCount })
  }

  return {
    vouchers,
    activeVouchers,
    isLoading,
    error,
    loadVouchers,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    toggleVoucherStatus,
    getVoucherByCode,
    calculateDiscount,
    incrementUsage
  }
})
