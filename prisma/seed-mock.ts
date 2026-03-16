import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Generating Fast Mock Data for Dec 2025 and Jan 2026...');

    const business = await prisma.business.findUnique({ where: { slug: 'probrew-main' } });
    if (!business) {
        console.error('Business "probrew-main" not found. Run main seed first.');
        return;
    }

    const products = await prisma.product.findMany({ 
        where: { isActive: true, businessId: business!.id } 
    });
    if (products.length === 0) {
        console.error('No products found for this business.');
        return;
    }

    const staff = await prisma.barista.findFirst({
        where: { businessId: business!.id }
    });

    // Clean up existing mock data to avoid unique constraint errors
    console.log('Cleaning up old mock data...');
    await prisma.order.deleteMany({
        where: {
            orderNumber: { startsWith: 'MOCK-' }
        }
    });
    await prisma.expense.deleteMany({
        where: {
            description: { in: ['Sarf Malzeme', 'Kira', 'Maaşlar', 'Elektrik'] },
            date: { gte: new Date(2025, 11, 1) }
        }
    });
    await prisma.wasteLog.deleteMany({
        where: {
            reason: 'Hatalı hazırlık',
            createdAt: { gte: new Date(2025, 11, 1) }
        }
    });

    // Helper to generate a batch of orders for a day
    async function seedDay(year: number, month: number, day: number) {
        const orderCount = 35; // Fixed for speed
        console.log(`Processing ${day}/${month + 1}/${year}...`);

        for (let i = 0; i < orderCount; i++) {
            const hour = 8 + (i % 14);
            const minute = (i * 7) % 60;
            const date = new Date(year, month, day, hour, minute);

            const product = products[i % products.length];
            const total = product.price;

            await prisma.order.create({
                data: {
                    businessId: business!.id,
                    orderNumber: `MOCK-${year}-${month + 1}-${day}-${i}`,
                    status: 'COMPLETED',
                    totalAmount: total,
                    finalAmount: total,
                    paymentMethod: 'CREDIT_CARD',
                    paymentStatus: 'COMPLETED',
                    createdAt: date,
                    updatedAt: date,
                    orderItems: {
                        create: {
                            productId: product.id,
                            productName: product.name,
                            quantity: 1,
                            unitPrice: product.price,
                            totalPrice: product.price,
                            createdAt: date
                        }
                    },
                    payments: {
                        create: {
                            amount: total,
                            method: 'CREDIT_CARD',
                            status: 'COMPLETED',
                            createdAt: date
                        }
                    }
                }
            });
        }

        // Daily expense
        await prisma.expense.create({
            data: {
                businessId: business!.id,
                description: 'Sarf Malzeme',
                amount: 250,
                category: 'SUPPLIES',
                date: new Date(year, month, day),
                staffId: staff?.id
            }
        });

        // Weekly waste
        if (day % 7 === 0) {
            await prisma.wasteLog.create({
                data: {
                    businessId: business!.id,
                    productId: products[0].id,
                    productName: products[0].name,
                    quantity: 2,
                    unit: 'adet',
                    reason: 'Hatalı hazırlık',
                    createdAt: new Date(year, month, day)
                }
            });
        }
    }

    // Dec 2025
    for (let d = 1; d <= 31; d++) {
        await seedDay(2025, 11, d);
    }

    // Jan 2026 (Up to Jan 4)
    for (let d = 1; d <= 4; d++) {
        await seedDay(2026, 0, d);
    }

    // Monthly fixed expenses for Dec
    const fixed = [
        { d: 'Kira', a: 45000, c: 'RENT' },
        { d: 'Maaşlar', a: 120000, c: 'SALARY' },
        { d: 'Elektrik', a: 8000, c: 'UTILITIES' }
    ];

    for (const f of fixed) {
        await prisma.expense.create({
            data: {
                businessId: business!.id,
                description: f.d,
                amount: f.a,
                category: f.c as any,
                date: new Date(2025, 11, 15),
                staffId: staff?.id
            }
        });
    }

    console.log('Mock data generation complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
