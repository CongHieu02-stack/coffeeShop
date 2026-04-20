import { Router } from 'express'
import { ProductController } from '../controllers/product.controller'

const router = Router()

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       category:
 *                         type: string
 *                         enum: [cafe, trasua, nuocep, latte, yogurt, khac]
 *                       is_available:
 *                         type: boolean
 *       400:
 *         description: Error
 */
router.get('/', ProductController.getAll)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *       400:
 *         description: Error
 */
router.get('/:id', ProductController.getById)

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category]
 *             properties:
 *               name: { type: string }
 *               price: { type: integer }
 *               category: { type: string, enum: [cafe, trasua, nuocep, latte, yogurt, khac] }
 *               is_available: { type: boolean, default: true }
 *               image_url: { type: string }
 *     responses:
 *       200:
 *         description: Product created
 *       400:
 *         description: Error
 */
router.post('/', ProductController.create)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
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
 *               price: { type: integer }
 *               category: { type: string }
 *               is_available: { type: boolean }
 *               image_url: { type: string }
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Error
 */
router.put('/:id', ProductController.update)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (soft delete)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 *       400:
 *         description: Error
 */
router.delete('/:id', ProductController.delete)

export { router as productsRouter }
