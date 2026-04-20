import { Router } from 'express'
import { TableController } from '../controllers/table.controller'

const router = Router()

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: List of tables
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
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       is_occupied: { type: boolean }
 *                       is_active: { type: boolean }
 *       400:
 *         description: Error
 */
router.get('/', TableController.getAll)

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     summary: Get table by ID with current invoice
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Table details
 *       400:
 *         description: Error
 */
router.get('/:id', TableController.getById)

/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Create new table
 *     tags: [Tables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: 'Bàn 1' }
 *               is_occupied: { type: boolean, default: false }
 *     responses:
 *       200:
 *         description: Table created
 *       400:
 *         description: Error
 */
router.post('/', TableController.create)

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Update table
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               is_occupied: { type: boolean }
 *     responses:
 *       200:
 *         description: Table updated
 *       400:
 *         description: Error
 */
router.put('/:id', TableController.update)

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     summary: Delete table (soft delete)
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Table deleted
 *       400:
 *         description: Error
 */
router.delete('/:id', TableController.delete)

export { router as tablesRouter }
