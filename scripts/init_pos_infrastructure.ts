import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany();

  for (const business of businesses) {
    console.log(`Checking infrastructure for: ${business.name}`);

    // 1. Create Default Cash Register if not exists
    const register = await prisma.cashRegister.findFirst({
      where: { businessId: business.id }
    });

    if (!register) {
      await prisma.cashRegister.create({
        data: {
          name: 'Ana Kasa',
          businessId: business.id,
          currentBalance: 0
        }
      });
      console.log(`- Created 'Ana Kasa' for ${business.name}`);
    }

    // 2. Create Default Tables
    const tablesCount = await prisma.table.count({ where: { businessId: business.id } });
    if (tablesCount === 0) {
      const tableNames = ['Masa 1', 'Masa 2', 'Masa 3', 'Masa 4', 'Bar 1', 'Bar 2'];
      for (const name of tableNames) {
        await prisma.table.create({
          data: {
            name,
            businessId: business.id,
            capacity: 2
          }
        });
      }
      console.log(`- Created ${tableNames.length} default tables for ${business.name}`);
    }
  }

  console.log('Infrastructure initialization complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
