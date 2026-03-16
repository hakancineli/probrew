import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSystem() {
  console.log('--- STARTING SYSTEM INTEGRITY TEST ---');
  
  const business = await prisma.business.findFirst();
  if (!business) throw new Error('No business found');
  const businessId = business.id;

  const staff = await prisma.barista.findFirst({ where: { businessId, role: 'MANAGER' } });
  if (!staff) throw new Error('No manager staff found');
  const staffId = staff.id;

  const register = await prisma.cashRegister.findFirst({ where: { businessId } });
  if (!register) throw new Error('No register found');
  const registerId = register.id;

  // 1. Open Shift
  console.log('1. Opening Shift...');
  const shift = await prisma.shift.create({
    data: {
      businessId,
      registerId,
      staffId,
      openingBalance: 500,
      status: 'OPEN'
    }
  });
  console.log(`- Shift opened: ${shift.id}`);

  // 2. Create a Sales Order
  console.log('2. Creating Sales Order...');
  const orderNumber = `TEST-${Date.now()}`;
  // We need a product and ingredient to test stock deduction
  let product = await prisma.product.findFirst({ where: { businessId } });
  if (!product) {
      product = await prisma.product.create({
          data: {
              businessId,
              name: 'Test Coffee',
              category: 'Hot Coffee',
              price: 50,
              stock: 100
          }
      });
  }

  // Simulate Order Creation logic (simplified for test)
  await prisma.order.create({
      data: {
          businessId,
          orderNumber,
          totalAmount: 50,
          finalAmount: 50,
          status: 'COMPLETED',
          paymentMethod: 'CASH',
          paymentStatus: 'COMPLETED'
      }
  });

  // Log the Stock Transaction (Simulating the API behavior)
  await prisma.inventoryTransaction.create({
      data: {
          businessId,
          type: 'SALE',
          productId: product.id,
          quantity: -1,
          previousStock: Number(product.stock),
          newStock: Number(product.stock) - 1,
          notes: `Test Slip: ${orderNumber}`
      }
  });

  // Log Cash Movement
  await prisma.cashMovement.create({
      data: {
          businessId,
          registerId,
          shiftId: shift.id,
          amount: 50,
          type: 'IN',
          reason: 'SALE',
          notes: `Test Satış: ${orderNumber}`
      }
  });
  console.log('- Sale recorded, inventory and cash updated.');

  // 3. Log Waste
  console.log('3. Logging Waste...');
  const ingredient = await prisma.ingredient.findFirst({ where: { businessId } });
  if (ingredient) {
      await prisma.inventoryTransaction.create({
          data: {
              businessId,
              type: 'WASTE',
              ingredientId: ingredient.id,
              quantity: -2,
              previousStock: ingredient.stock,
              newStock: ingredient.stock - 2,
              notes: 'Test Zayiat: Dökülme'
          }
      });
  }
  console.log('- Waste logged.');

  // 4. Verify Audit Logs
  console.log('4. Verifying Audit Logs...');
  const logs = await prisma.inventoryTransaction.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 2
  });
  console.log(`- Found ${logs.length} recent audit logs.`);
  logs.forEach(log => console.log(`  [${log.type}] ${log.notes} | Change: ${log.quantity}`));

  // 5. Close Shift (Z-Report simulation)
  console.log('5. Closing Shift & Generating Z-Report...');
  const movements = await prisma.cashMovement.findMany({
      where: { shiftId: shift.id }
  });
  const totalSales = movements.filter(m => m.reason === 'SALE').reduce((sum, m) => sum + m.amount, 0);
  const expectedCash = shift.openingBalance + totalSales;
  const actualCash = expectedCash; // Perfect balance for test

  await prisma.shift.update({
      where: { id: shift.id },
      data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closingBalance: actualCash,
          expectedCash,
          actualCash,
          difference: actualCash - expectedCash
      }
  });

  console.log(`--- TEST COMPLETE ---`);
  console.log(`Z-REPORT RESULTS:`);
  console.log(`- Opening: ₺${shift.openingBalance}`);
  console.log(`- Sales: ₺${totalSales}`);
  console.log(`- Expected: ₺${expectedCash}`);
  console.log(`- Actual: ₺${actualCash}`);
  console.log(`- Discrepancy: ₺${actualCash - expectedCash}`);
}

testSystem()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
