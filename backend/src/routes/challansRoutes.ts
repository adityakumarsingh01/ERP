import { Router } from 'express';
import { getChallans, createChallan, getChallanById, confirmChallan, cancelChallan } from '../controllers/challansController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// View challans (All roles)
router.get('/', requireAuth, getChallans);
router.get('/:id', requireAuth, getChallanById);

// Manage challans (ADMIN, SALES)
router.post('/', requireAuth, requireRole(['ADMIN', 'SALES']), createChallan);
router.post('/:id/confirm', requireAuth, requireRole(['ADMIN', 'SALES']), confirmChallan);
router.post('/:id/cancel', requireAuth, requireRole(['ADMIN', 'SALES']), cancelChallan);

export default router;
