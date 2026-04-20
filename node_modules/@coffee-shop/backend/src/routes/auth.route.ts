import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'

const router = Router()

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@coffee.shop
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     email: { type: string }
 *                 session:
 *                   type: object
 *                   properties:
 *                     access_token: { type: string }
 *       400:
 *         description: Login failed
 */
router.post('/login', AuthController.login)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     email: { type: string }
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     full_name: { type: string }
 *                     role: { type: string, enum: [admin, staff] }
 *                     is_active: { type: boolean }
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Error
 */
router.get('/profile', AuthController.getProfile)

export { router as authRouter }
