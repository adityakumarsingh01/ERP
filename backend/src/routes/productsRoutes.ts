import { Router } from 'express';
import { getProducts, createProduct, getProductById, updateProduct } from '../controllers/productsController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Get all products (All roles can view)
router.get('/', requireAuth, getProducts);

// Create and update (Only ADMIN and WAREHOUSE)
router.post('/', requireAuth, requireRole(['ADMIN', 'WAREHOUSE']), createProduct);
router.get('/:id', requireAuth, getProductById);
router.put('/:id', requireAuth, requireRole(['ADMIN', 'WAREHOUSE']), updateProduct);

export default router;
