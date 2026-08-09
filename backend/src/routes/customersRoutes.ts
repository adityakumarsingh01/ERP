import { Router } from 'express';
import { getCustomers, createCustomer, getCustomerById, updateCustomer, addFollowUp } from '../controllers/customersController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, getCustomers);
router.post('/', requireAuth, requireRole(['ADMIN', 'SALES']), createCustomer);
router.get('/:id', requireAuth, getCustomerById);
router.put('/:id', requireAuth, requireRole(['ADMIN', 'SALES']), updateCustomer);
router.post('/:id/followups', requireAuth, requireRole(['ADMIN', 'SALES']), addFollowUp);

export default router;
