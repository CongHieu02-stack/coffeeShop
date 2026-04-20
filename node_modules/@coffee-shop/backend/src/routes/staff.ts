import { Router } from 'express'
import { getSupabase } from '../db/supabase'

const router = Router()

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Get all staff members
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: List of staff
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       full_name: { type: string }
 *                       role: { type: string, enum: [admin, staff] }
 *                       is_active: { type: boolean }
 *       400:
 *         description: Error
 */
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

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Create new staff member
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, full_name, role]
 *             properties:
 *               email:
 *                 type: string
 *                 example: staff@coffee.shop
 *               password:
 *                 type: string
 *                 example: staff123
 *               full_name:
 *                 type: string
 *                 example: Nguyen Van A
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *     responses:
 *       200:
 *         description: Staff created
 *       400:
 *         description: Error
 */
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

/**
 * @swagger
 * /api/staff/{id}:
 *   put:
 *     summary: Update staff member
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               role: { type: string, enum: [admin, staff] }
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Staff updated
 *       400:
 *         description: Error
 */
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

/**
 * @swagger
 * /api/staff/{id}/toggle:
 *   patch:
 *     summary: Toggle staff active status
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Status toggled
 *       400:
 *         description: Error
 */
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
