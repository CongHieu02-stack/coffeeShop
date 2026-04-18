import { Router } from 'express'
import { getSupabase } from '../db/supabase'

const router = Router()

// Get all staff
router.get('/', async (_req, res) => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name')

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

// Create staff
router.post('/', async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body
    const supabase = getSupabase()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) throw authError

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase client lacks database schema types
      .update({ full_name, role })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileError) throw profileError

    res.json({
      success: true,
      data: profile
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

// Update staff
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase client lacks database schema types
      .update(req.body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

// Toggle staff status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const { is_active } = req.body
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('profiles')
      // @ts-expect-error - Supabase client lacks database schema types
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      data
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

export { router as staffRouter }
