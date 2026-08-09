import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'admin@fundsroom.com', name: 'Admin User', role: 'ADMIN', passwordHash },
    { email: 'sales@fundsroom.com', name: 'Sales Rep', role: 'SALES', passwordHash },
    { email: 'warehouse@fundsroom.com', name: 'Warehouse Manager', role: 'WAREHOUSE', passwordHash },
    { email: 'accounts@fundsroom.com', name: 'Accountant', role: 'ACCOUNTS', passwordHash }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  // Update admin password exactly as requested
  await prisma.user.update({
    where: { email: 'admin@fundsroom.com' },
    data: { passwordHash: await bcrypt.hash('Admin@123', 10) }
  });

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      customerName: 'ABC Traders',
      mobileNumber: '9876543210',
      email: 'contact@abctraders.com',
      businessName: 'ABC Traders Pvt Ltd',
      customerType: 'WHOLESALE',
      status: 'ACTIVE',
      address: 'Mumbai, Maharashtra',
    }
  });

  // Create Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Laptop',
      sku: 'LAP-001',
      category: 'Electronics',
      unitPrice: 50000,
      currentStock: 10,
      minimumStock: 5,
      warehouseLocation: 'Zone A',
    }
  });

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
