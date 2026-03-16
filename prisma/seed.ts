import { PrismaClient } from '@prisma/client';
import { allMenuItems } from '../src/data/menuItems';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Multi-tenant Database...');

  // 1. Create Initial Business (Tenant)
  console.log('Creating initial business...');
  const business = await prisma.business.upsert({
    where: { slug: 'probrew-main' },
    update: {},
    create: {
      name: 'ProBrew Ana İşletme',
      slug: 'probrew-main',
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF',
    }
  });
  console.log('Business created:', business.name);

  // 2. Seed Products linked to Business
  console.log('Seeding products for business...');
  for (const item of allMenuItems) {
    let price = 0;
    if (item.price) {
      const priceStr = String(item.price);
      price = parseFloat(priceStr.replace('₺', '').replace(',', '.'));
    } else if (item.sizes && item.sizes.length > 0) {
      price = item.sizes[0].price;
    }

    await prisma.product.upsert({
      where: { id: item.id.toString() },
      update: {
        businessId: business.id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: price,
        imageUrl: item.image,
      },
      create: {
        id: item.id.toString(),
        businessId: business.id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: price,
        imageUrl: item.image,
        isActive: true,
        stock: 100
      }
    });
  }

  // 3. Seed Staff (Barista) linked to Business
  console.log('Seeding staff for business...');
  const staffMembers = [
    { name: 'Admin ProBrew', email: 'admin@probrew.com.tr', role: 'MANAGER', password: 'password' },
    { name: 'Ceren Alper', email: 'ceren@probrew.com.tr', role: 'MANAGER', password: '123' },
    { name: 'Mutfak Ekranı', email: 'kitchen@probrew.com.tr', role: 'KITCHEN', password: 'kitchen' }
  ];

  // First ensure admin is removed from User table if they exist there from previous seeds
  await prisma.user.deleteMany({ where: { email: 'admin@probrew.com.tr' } });

  for (const member of staffMembers) {
    const hash = await bcrypt.hash(member.password, 10);
    await prisma.barista.upsert({
      where: { email: member.email },
      update: { businessId: business.id, passwordHash: hash, role: member.role as any },
      create: {
        name: member.name,
        email: member.email,
        businessId: business.id,
        role: member.role as any,
        passwordHash: hash,
        isActive: true,
        startDate: new Date(),
      }
    });
  }

  console.log('Database seeded successfully for Multi-tenant ProBrew!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });