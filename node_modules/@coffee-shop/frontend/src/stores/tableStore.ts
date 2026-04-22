/**
 * Table Store (Controller)
 * Quản lý danh sách bàn
 * Theo mẫu MVC - Controller gọi TableService, quản lý state
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Table } from '@/models'
import { TableService } from '@/services'

export const useTableStore = defineStore('tables', () => {
  // ==================== STATE ====================
  const tables = ref<Table[]>([])
  const currentTable = ref<Table | null>(null)
  const currentInvoice = ref<unknown | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== GETTERS ====================
  const availableTables = computed(() =>
    tables.value.filter(t => t.isAvailable())
  )

  const occupiedTables = computed(() =>
    tables.value.filter(t => t.isOccupied && t.isActive)
  )

  const activeTables = computed(() =>
    tables.value.filter(t => t.isActive)
  )

  // ==================== ACTIONS ====================

  /**
   * Load tất cả bàn
   */
  const loadTables = async () => {
    isLoading.value = true
    error.value = null

    try {
      tables.value = await TableService.getAll()
    } catch (err: any) {
      error.value = 'Không thể tải danh sách bàn'
      console.error('Error loading tables:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load chi tiết bàn và hóa đơn hiện tại
   */
  const loadTableDetail = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const { table, currentInvoice: invoice } = await TableService.getById(id)
      currentTable.value = table
      currentInvoice.value = invoice
      return { table, invoice }
    } catch (err: any) {
      error.value = 'Không thể tải thông tin bàn'
      console.error('Error loading table:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cập nhật trạng thái bàn
   */
  const updateTableStatus = async (id: number, isOccupied: boolean) => {
    isLoading.value = true
    error.value = null

    try {
      const updated = await TableService.update(id, { isOccupied })
      const index = tables.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tables.value[index] = updated
      }
      if (currentTable.value?.id === id) {
        currentTable.value = updated
      }
      return updated
    } catch (err: any) {
      error.value = 'Không thể cập nhật trạng thái bàn'
      console.error('Error updating table:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Đánh dấu bàn có khách
   */
  const occupyTable = async (id: number) => {
    return updateTableStatus(id, true)
  }

  /**
   * Đánh dấu bàn trống
   */
  const releaseTable = async (id: number) => {
    return updateTableStatus(id, false)
  }

  /**
   * Tạo bàn mới (Admin)
   */
  const createTable = async (name: string) => {
    isLoading.value = true
    error.value = null

    try {
      const newTable = await TableService.create(name)
      tables.value.push(newTable)
      return newTable
    } catch (err: any) {
      error.value = 'Không thể tạo bàn'
      console.error('Error creating table:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa bàn (Admin)
   */
  const deleteTable = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await TableService.delete(id)
      tables.value = tables.value.filter(t => t.id !== id)
      return true
    } catch (err: any) {
      error.value = 'Không thể xóa bàn'
      console.error('Error deleting table:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa current table
   */
  const clearCurrentTable = () => {
    currentTable.value = null
    currentInvoice.value = null
  }

  return {
    // State
    tables,
    currentTable,
    currentInvoice,
    isLoading,
    error,

    // Getters
    availableTables,
    occupiedTables,
    activeTables,

    // Actions
    loadTables,
    loadTableDetail,
    updateTableStatus,
    occupyTable,
    releaseTable,
    createTable,
    deleteTable,
    clearCurrentTable
  }
})
