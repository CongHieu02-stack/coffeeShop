import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// DEMO MODE
const DEMO_MODE = false

const DEMO_TABLES: Table[] = [
  { id: 1, name: 'Bàn 1', is_occupied: false },
  { id: 2, name: 'Bàn 2', is_occupied: false },
  { id: 3, name: 'Bàn 3', is_occupied: false },
  { id: 4, name: 'Bàn 4', is_occupied: false },
  { id: 5, name: 'Bàn 5', is_occupied: false },
  { id: 6, name: 'Bàn 6', is_occupied: false },
  { id: 7, name: 'Bàn 7', is_occupied: false },
  { id: 8, name: 'Bàn 8', is_occupied: false },
  { id: 9, name: 'Bàn 9', is_occupied: false },
  { id: 10, name: 'Bàn 10', is_occupied: false },
  { id: 11, name: 'Bàn 11', is_occupied: false },
  { id: 12, name: 'Bàn 12', is_occupied: false },
  { id: 13, name: 'Bàn 13', is_occupied: false },
  { id: 14, name: 'Bàn 14', is_occupied: false },
  { id: 15, name: 'Bàn 15', is_occupied: false },
  { id: 16, name: 'Bàn 16', is_occupied: false }
]

export interface Table {
  id: number
  name: string
  is_occupied: boolean
}

export const useTablesStore = defineStore('tables', () => {
  // State
  const tables = ref<Table[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const availableTables = computed(() =>
    tables.value.filter(t => !t.is_occupied)
  )

  const occupiedTables = computed(() =>
    tables.value.filter(t => t.is_occupied)
  )

  // Actions
  const loadTables = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        tables.value = [...DEMO_TABLES]
        isLoading.value = false
        return
      }

      const { data, error: supabaseError } = await supabase
        .from('cafe_tables')
        .select('*')
        .order('id')

      if (supabaseError) throw supabaseError
      tables.value = data || []
    } catch (err) {
      error.value = 'Không thể tải danh sách bàn'
      console.error('Error loading tables:', err)
    } finally {
      isLoading.value = false
    }
  }

  const updateTableStatus = async (id: number, isOccupied: boolean) => {
    isLoading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        const index = tables.value.findIndex(t => t.id === id)
        if (index !== -1) {
          tables.value[index] = { ...tables.value[index], is_occupied: isOccupied }
          return tables.value[index]
        }
        return null
      }

      const { data, error: supabaseError } = await supabase
        .from('cafe_tables')
        .update({ is_occupied: isOccupied })
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      if (data) {
        const index = tables.value.findIndex(t => t.id === id)
        if (index !== -1) {
          tables.value[index] = data
        }
        return data
      }
      return null
    } catch (err) {
      error.value = 'Không thể cập nhật trạng thái bàn'
      console.error('Error updating table:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    tables,
    isLoading,
    error,
    availableTables,
    occupiedTables,
    loadTables,
    updateTableStatus
  }
})
