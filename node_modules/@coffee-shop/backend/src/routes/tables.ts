import { Router } from 'express'
import { getSupabase } from '../db/supabase'

const router = Router()

// Get all tables
router.get('/', async (_req, res) => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*')
      .eq('is_active', true)
      .order('name')

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

// Get table by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .select('*, current_invoice:invoices(*, items:invoice_items(*))')
      .eq('id', id)
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

// Create table
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
      .insert(req.body)
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

// Update table
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('cafe_tables')
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

// Delete table
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { error } = await supabase
      .from('cafe_tables')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    res.json({
      success: true,
      message: 'Table deleted'
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

export { router as tablesRouter }
