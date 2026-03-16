import { prisma } from './prisma';
import { allMenuItems } from '@/data/menuItems';

export async function seedDemoData(businessId: string) {
  try {
    console.log(`Seeding demo data for business: ${businessId}`);

    // 1. Create Default Cash Register
    const register = await prisma.cashRegister.create({
      data: {
        businessId,
        name: 'Ana Kasa',
        currentBalance: 0,
      }
    });

    // 2. Create Default Tables
    const tables = ['Masa 1', 'Masa 2', 'Masa 3', 'Masa 4', 'Masa 5', 'Bahçe 1', 'Bahçe 2', 'Paket Servis'];
    await prisma.table.createMany({
      data: tables.map(name => ({
        businessId,
        name,
        status: 'AVAILABLE',
      }))
    });

    // 3. Create Default Ingredients (Cups etc. for stock logic)
    const ingredients = [
      { name: 'Karton Bardak: Small (8oz)', unit: 'adet', stock: 1000 },
      { name: 'Karton Bardak: Medium (14oz)', unit: 'adet', stock: 1000 },
      { name: 'Karton Bardak: Large (16oz)', unit: 'adet', stock: 1000 },
      { name: 'Şeffaf Bardak: Small (12oz)', unit: 'adet', stock: 1000 },
      { name: 'Şeffaf Bardak: Medium (14oz)', unit: 'adet', stock: 1000 },
      { name: 'Şeffaf Bardak: Large (16oz)', unit: 'adet', stock: 1000 },
      { name: 'Süt', unit: 'ml', stock: 50000 },
      { name: 'Espresso Çekirdek', unit: 'gr', stock: 10000 },
    ];

    await prisma.ingredient.createMany({
      data: ingredients.map(i => ({
        businessId,
        ...i,
        costPerUnit: 0
      }))
    });

    // 4. Create Products from allMenuItems
    for (const item of allMenuItems) {
      await prisma.product.create({
        data: {
          businessId,
          name: item.name,
          description: item.description,
          category: item.category,
          price: item.price || (item.sizes && item.sizes.length > 0 ? item.sizes[0].price : 0),
          imageUrl: item.image,
          isActive: true,
          stock: 9999,
          prices: item.sizes ? item.sizes : [],
          unit: 'adet'
        }
      });
    }

    console.log(`Successfully seeded ${allMenuItems.length} products for business: ${businessId}`);
    return true;
  } catch (error) {
    console.error('Demo seeding error:', error);
    return false;
  }
}
