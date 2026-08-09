import { Router } from 'express';
import { login, me } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);

export default router;
