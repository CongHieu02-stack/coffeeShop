import { getSupabase } from '../db/supabase'

export interface Staff {
  id: string
  full_name: string
  role: 'admin' | 'staff'
  is_active: boolean
  created_at?: string
}

export interface CreateStaffInput {
  email: string
  password: string
  full_name: string
  role: 'admin' | 'staff'
}

export const StaffModel = {
  /**
   * Get all active staff
   */
  async findAll() {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name')

    if (error) throw error
    return data as Staff[]
  },

  /**
   * Create new staff user
   */
  async create(input: CreateStaffInput) {
    const supabase = getSupabase()
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true
    })

    if (authError) throw authError

    // Update profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (supabase.from('profiles') as any)
      .update({ 
        full_name: input.full_name, 
        role: input.role 
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileError) throw profileError
    return profile as Staff
  },

  /**
   * Update staff
   */
  async update(id: string, updates: Partial<Staff>) {
    const supabase = getSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('profiles') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Staff
  },

  /**
   * Toggle staff active status
   */
  async toggleStatus(id: string, is_active: boolean) {
    return this.update(id, { is_active })
  }
}
