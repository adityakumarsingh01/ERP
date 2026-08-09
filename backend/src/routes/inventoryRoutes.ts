import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/movements', requireAuth, async (req, res) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        skip,
        take: Number(limit),
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count()
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// A quick API to stock in
router.post('/movements/in', requireAuth, requireRole(['ADMIN', 'WAREHOUSE']), async (req: any, res: any) => {
  try {
    const { productId, quantity, reason } = req.body;
    
    if (!productId || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid productId and positive quantity required' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: Number(productId) },
        data: { currentStock: { increment: Number(quantity) } }
      });
      await tx.stockMovement.create({
        data: {
          productId: Number(productId),
          quantity: Number(quantity),
          movementType: 'IN',
          reason: reason || 'Manual Stock In',
          createdBy: req.user.name
        }
      });
    });

    res.json({ success: true, message: 'Stock added successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
