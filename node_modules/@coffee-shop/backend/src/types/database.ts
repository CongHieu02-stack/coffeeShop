export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
      staff: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'manager' | 'staff'
          phone: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          role: 'admin' | 'manager' | 'staff'
          phone?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'manager' | 'staff'
          phone?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'admin' | 'manager' | 'staff' | null
          phone: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'staff' | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'staff' | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      tables: {
        Row: {
          id: string
          table_number: number
          capacity: number
          status: 'available' | 'occupied' | 'reserved'
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_number: number
          capacity: number
          status?: 'available' | 'occupied' | 'reserved'
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_number?: number
          capacity?: number
          status?: 'available' | 'occupied' | 'reserved'
          location?: string | null
          created_at?: string
        }
      }
    }
  }
}
