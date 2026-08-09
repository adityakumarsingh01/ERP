import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
router.use(requireAuth);

router.get('/stats', getDashboardStats);

export default router;
