import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const users = [
    { email: 'admin@fundsroom.com', name: 'Admin User', role: 'ADMIN', passwordHash: await bcrypt.hash('Admin@123', 10) },
    { email: 'sales@fundsroom.com', name: 'Sales Rep', role: 'SALES', passwordHash: await bcrypt.hash('Sales@123', 10) },
    { email: 'warehouse@fundsroom.com', name: 'Warehouse Manager', role: 'WAREHOUSE', passwordHash: await bcrypt.hash('Warehouse@123', 10) },
    { email: 'accounts@fundsroom.com', name: 'Accountant', role: 'ACCOUNTS', passwordHash: await bcrypt.hash('Accounts@123', 10) }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: u.passwordHash },
      create: u,
    });
  }



  // Create Customers
  let customer1 = await prisma.customer.findFirst({ where: { email: 'contact@abctraders.com' } });
  if (!customer1) {
    customer1 = await prisma.customer.create({
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
  }

  // Create Products
  const product1 = await prisma.product.upsert({
    where: { sku: 'LAP-001' },
    update: {},
    create: {
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
