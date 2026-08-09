import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search = '', page = '1', limit = '10' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search ? {
      OR: [
        { customerName: { contains: String(search) } },
        { businessName: { contains: String(search) } },
        { mobileNumber: { contains: String(search) } }
      ]
    } : {};

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
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

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, mobileNumber, email, businessName, gstNumber, customerType, address, status } = req.body;
    
    if (!customerName || !mobileNumber || !customerType || !status) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const customer = await prisma.customer.create({
      data: { customerName, mobileNumber, email, businessName, gstNumber, customerType, address, status }
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: { followUps: { orderBy: { createdAt: 'desc' } }, challans: { orderBy: { createdAt: 'desc' } } }
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data
    });
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFollowUp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note, followUpDate } = req.body;

    if (!note || !followUpDate) {
      res.status(400).json({ success: false, message: 'Note and followUpDate are required' });
      return;
    }

    const followUp = await prisma.customerFollowUp.create({
      data: {
        customerId: Number(id),
        note,
        followUpDate: new Date(followUpDate),
        createdBy: req.user.name
      }
    });

    await prisma.customer.update({
      where: { id: Number(id) },
      data: { followUpDate: new Date(followUpDate) }
    });

    res.status(201).json({ success: true, data: followUp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
