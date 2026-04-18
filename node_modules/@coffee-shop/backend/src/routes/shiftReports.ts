import { Router } from 'express'
import { getSupabase } from '../db/supabase'

const router = Router()

// Get all shift reports with filters
router.get('/', async (req, res) => {
  try {
    const { staffId, startDate, endDate } = req.query
    const supabase = getSupabase()

    let query = supabase
      .from('shift_reports')
      .select(`
        *,
        staff:staff_id(id, email)
      `)
      .order('created_at', { ascending: false })

    if (staffId) query = query.eq('staff_id', staffId)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    const { data, error } = await query

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

// Get shift report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('shift_reports')
      .select(`
        *,
        staff:staff_id(id, email)
      `)
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

// Create new shift report
router.post('/', async (req, res) => {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('shift_reports')
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

export default router
