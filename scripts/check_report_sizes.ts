import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(2026, 2, 7, -3, 0, 0, 0)); // 2026-03-07 TR time
    const endOfDay = new Date(Date.UTC(2026, 2, 8, -3, 0, 0, 0));

    console.log(`Checking orders from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    const orders = await prisma.order.findMany({
        where: {
            createdAt: { gte: startOfDay, lt: endOfDay },
            status: { not: 'CANCELLED' },
            isDeleted: false
        },
        include: {
            orderItems: true
        }
    });

    const sizeCounts: Record<string, number> = {};

    orders.forEach(order => {
        order.orderItems.forEach(item => {
            const size = item.size || 'No Size';
            sizeCounts[size] = (sizeCounts[size] || 0) + 1;
        });
    });

    console.log('Order Item Sizes for today:');
    console.log(JSON.stringify(sizeCounts, null, 2));

    // Also check recipes for products that have L or M orders
    const productsWithIssues = ['Latte', 'Americano', 'Cappuccino', 'Flat White'];
    for (const name of productsWithIssues) {
        const product = await prisma.product.findFirst({
            where: { name },
            include: { recipes: true }
        });
        if (product) {
            console.log(`\nRecipes for ${name}:`);
            product.recipes.forEach(r => {
                console.log(`- Size: ${r.size}`);
            });
        }
    }

    await prisma.$disconnect();
}

main().catch(console.error);
