import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalCustomers, totalProducts, draftChallans, confirmedChallans, allProducts] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.challan.count({ where: { status: 'DRAFT' } }),
      prisma.challan.count({ where: { status: 'CONFIRMED' } }),
      prisma.product.findMany({ select: { currentStock: true, minimumStock: true } })
    ]);

    const lowStockItems = allProducts.filter(p => p.currentStock <= p.minimumStock).length;

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        lowStockItems,
        draftChallans,
        confirmedChallans
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
