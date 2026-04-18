import { Router } from 'express'
import { getSupabase } from '../db/supabase'

const router = Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    res.json({
      success: true,
      user: data.user,
      session: data.session
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = getSupabase()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) throw error || new Error('User not found')

    // Get profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    res.json({
      success: true,
      user,
      profile
    })
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    })
  }
})

export { router as authRouter }
