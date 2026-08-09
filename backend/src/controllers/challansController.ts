import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getChallans = async (req: Request, res: Response) => {
  try {
    const { search = '', status = '', page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.challanNumber = { contains: String(search) };
    }
    if (status) {
      where.status = String(status);
    }

    const [data, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: Number(limit),
        include: { customer: true, items: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.challan.count({ where })
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
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customerId, items } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Invalid challan data' });
      return;
    }

    // Generate unique challan number
    const count = await prisma.challan.count();
    const challanNumber = `CH-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    let totalQuantity = 0;
    const challanItemsData: any[] = [];

    // Fetch product details to store snapshots
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        res.status(400).json({ success: false, message: `Product ID ${item.productId} not found` });
        return;
      }
      
      totalQuantity += item.quantity;
      challanItemsData.push({
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity,
        totalPrice: item.quantity * product.unitPrice
      });
    }

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: 'DRAFT',
        createdBy: req.user.name,
        items: {
          create: challanItemsData
        }
      },
      include: { items: true }
    });

    res.status(201).json({ success: true, data: challan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const challan = await prisma.challan.findUnique({
      where: { id: Number(id) },
      include: { items: true }
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }

    if (challan.status !== 'DRAFT') {
      res.status(400).json({ success: false, message: 'Only draft challans can be confirmed' });
      return;
    }

    // 1. Verify stock availability (do not modify yet)
    for (const item of challan.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        res.status(400).json({ success: false, message: `Product ID ${item.productId} no longer exists` });
        return;
      }
      if (product.currentStock < item.quantity) {
        res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}`,
          availableStock: product.currentStock,
          requestedQuantity: item.quantity
        });
        return;
      }
    }

    // 2. Perform Transaction: Decrease stock, log movement, update challan status
    await prisma.$transaction(async (tx) => {
      for (const item of challan.items) {
        // Decrease stock
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } }
        });

        // Log movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Challan Confirmed: ${challan.challanNumber}`,
            createdBy: req.user.name
          }
        });
      }

      // Update status
      await tx.challan.update({
        where: { id: challan.id },
        data: { status: 'CONFIRMED' }
      });
    });

    res.json({ success: true, message: 'Challan confirmed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id: Number(id) },
      include: { customer: true, items: true }
    });

    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }
    res.json({ success: true, data: challan });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelChallan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({ where: { id: Number(id) } });
    if (!challan) {
      res.status(404).json({ success: false, message: 'Challan not found' });
      return;
    }
    if (challan.status === 'CONFIRMED') {
      res.status(400).json({ success: false, message: 'Cannot cancel a confirmed challan' });
      return;
    }
    await prisma.challan.update({
      where: { id: Number(id) },
      data: { status: 'CANCELLED' }
    });
    res.json({ success: true, message: 'Challan cancelled' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
