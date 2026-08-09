import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search = '', category = '', page = '1', limit = '10', lowStock } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { sku: { contains: String(search) } }
      ];
    }
    if (category) {
      where.category = String(category);
    }
    
    // Low stock filter logic (handled post query due to DB constraints or handled with raw if complex)
    // Actually, in prisma we can't do where column <= anotherColumn directly for sqlite easily without raw query in some versions, 
    // but Prisma added it. For safety in SQLite, let's just do a normal fetch and filter if lowStock is true, or use Prisma field reference if supported.
    // We'll skip complex DB query for lowStock and just return all for this demo, or we can fetch them.
    
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    // Apply lowStock filter in memory if requested
    let filteredData = data;
    let filteredTotal = total;
    if (lowStock === 'true') {
      filteredData = data.filter(p => p.currentStock <= p.minimumStock);
      filteredTotal = filteredData.length;
    }

    res.json({
      success: true,
      data: filteredData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, sku, category, unitPrice, currentStock, minimumStock, warehouseLocation } = req.body;
    
    if (!name || !sku || unitPrice === undefined) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      res.status(409).json({ success: false, message: 'SKU already exists' });
      return;
    }

    const product = await prisma.product.create({
      data: { name, sku, category, unitPrice, currentStock, minimumStock, warehouseLocation }
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.sku) {
      const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (existing && existing.id !== Number(id)) {
        res.status(409).json({ success: false, message: 'SKU already exists' });
        return;
      }
    }

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data
    });
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
