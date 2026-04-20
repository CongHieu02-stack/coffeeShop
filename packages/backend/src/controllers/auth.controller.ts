import { Request, Response } from 'express'
import { AuthModel, LoginCredentials } from '../models/auth.model'

export const AuthController = {
  /**
   * POST /api/auth/login
   * Login with email and password
   */
  async login(req: Request, res: Response) {
    try {
      const credentials: LoginCredentials = req.body
      const data = await AuthModel.login(credentials)

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
  },

  /**
   * GET /api/auth/profile
   * Get current user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const token = authHeader.replace('Bearer ', '')
      const user = await AuthModel.getUserByToken(token)

      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }

      const profile = await AuthModel.getProfileByUserId(user.id)

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
  }
}
