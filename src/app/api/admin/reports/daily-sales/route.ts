import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to get user from request
const getUser = (request: NextRequest) => {
    let token = request.cookies.get('auth-token')?.value;
    if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    return token ? verifyToken(token) : null;
};

export async function GET(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        if (!dateParam) {
            return NextResponse.json(
                { error: 'Date parameter is required' },
                { status: 400 }
            );
        }

        const startTimeParam = searchParams.get('startTime');
        const endTimeParam = searchParams.get('endTime');

        // Turkey Time (UTC+3)
        const startTimeStr = startTimeParam ? `${startTimeParam}:00.000` : '00:00:00.000';
        const startOfDay = new Date(`${dateParam}T${startTimeStr}Z`);
        startOfDay.setUTCHours(startOfDay.getUTCHours() - 3);

        const endTimeStr = endTimeParam ? `${endTimeParam}:59.999` : '23:59:59.999';
        const endOfDay = new Date(`${dateParam}T${endTimeStr}Z`);
        endOfDay.setUTCHours(endOfDay.getUTCHours() - 3);

        if (isNaN(startOfDay.getTime())) {
            return NextResponse.json(
                { error: 'Invalid date format' },
                { status: 400 }
            );
        }

        // 1. Get total orders count for the day (excluding cancelled) - Tenant Scoped
        const orderWhere = {
            businessId: user.businessId,
            createdAt: { gte: startOfDay, lte: endOfDay },
            status: { not: 'CANCELLED' as const },
            isDeleted: false
        };

        const totalOrders = await prisma.order.count({ where: orderWhere });

        // 2. Get actual revenue from orders
        const revenueAggregate = await prisma.order.aggregate({
            where: orderWhere,
            _sum: { finalAmount: true }
        });
        const orderRevenue = Number(revenueAggregate._sum.finalAmount) || 0;

        // 3. Get Staff Consumptions - Tenant Scoped
        const staffConsumptions = await prisma.staffConsumption.findMany({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay },
                staff: { businessId: user.businessId }
            },
            include: { items: true }
        });

        // 4. Calculate Staff Revenue
        let staffRevenue = 0;
        const staffProductMap: Record<string, { quantity: number; revenue: number }> = {};

        for (const sc of staffConsumptions) {
            for (const item of sc.items) {
                const amount = (Number(item.staffPrice) || 0) * (Number(item.quantity) || 0);
                staffRevenue += amount;

                if (!staffProductMap[item.productName]) {
                    staffProductMap[item.productName] = { quantity: 0, revenue: 0 };
                }
                staffProductMap[item.productName].quantity += (Number(item.quantity) || 0);
                staffProductMap[item.productName].revenue += amount;
            }
        }

        const totalRevenue = orderRevenue + staffRevenue;

        // 5. Get detailed orders
        const detailedOrders = await prisma.order.findMany({
            where: orderWhere,
            include: { orderItems: true }
        });

        // 6. Get all product recipes AND ingredients - Tenant Scoped
        const [allProducts, allIngredients] = await Promise.all([
            prisma.product.findMany({
                where: { businessId: user.businessId },
                include: {
                    recipes: {
                        include: {
                            items: {
                                include: { ingredient: true }
                            }
                        }
                    }
                }
            }),
            prisma.ingredient.findMany({
                where: { businessId: user.businessId }
            })
        ]);

        const productRecipeMap = new Map(allProducts.map(p => [p.name, p]));
        const ingredientMap = new Map(allIngredients.map(ing => [ing.name, ing]));

        // 7. Helper: Calculate Unit Cost
        const getUnitCost = (item: { productName: string, size?: string | null, isPorcelain?: boolean }) => {
            const prod = productRecipeMap.get(item.productName);
            if (!prod || !prod.recipes.length) return 0;

            const findRecipe = (sizeStr: string | null) => {
                const normalized = sizeStr?.trim().toUpperCase();

                // Try exact match or Standart
                let r = prod.recipes.find((r: any) =>
                    (normalized && r.size?.toUpperCase() === normalized) ||
                    (!normalized && (!r.size || r.size === 'Standart' || r.size === 'Standart / Tek Boyut'))
                );

                if (r) return r;

                // Pattern matching fallback
                if (normalized) {
                    if (normalized === 'L' || normalized === 'LARGE') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('LARGE'));
                    else if (normalized === 'M' || normalized === 'MEDIUM') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('MEDIUM'));
                    else if (normalized === 'S' || normalized === 'SMALL') r = prod.recipes.find((r: any) => r.size?.toUpperCase().includes('SMALL'));

                    if (r) return r;
                    r = prod.recipes.find((r: any) => r.size?.toUpperCase().startsWith(normalized.substring(0, 1)));
                }

                return r || prod.recipes.find((r: any) => !r.size || r.size === 'Standart' || r.size === 'Standart / Tek Boyut') || prod.recipes[0];
            }

            const recipe = findRecipe(item.size || null);
            if (!recipe) return 0;

            let cost = 0;
            let hasCupInRecipe = false;
            for (const ri of recipe.items) {
                cost += (Number(ri.quantity) || 0) * (Number(ri.ingredient.costPerUnit) || 0);
                if (ri.ingredient.name.toLowerCase().includes('bardak')) hasCupInRecipe = true;
            }

            const cupFreeCategories = ['Tatlılar', 'Kasa Önü Ürünleri', 'Ekstralar', 'Tozlar', 'Püreler', 'Yan Ürünler', 'Kahve Çekirdekleri'];
            if (!hasCupInRecipe && !item.isPorcelain && !cupFreeCategories.includes(prod.category)) {
                const isCold = prod.category.toLowerCase().includes('soğuk') || prod.name.toLowerCase().includes('iced') || prod.name.toLowerCase().includes('cool');
                const sz = (item.size || 'M').toUpperCase().substring(0, 1);
                let cupName = '';

                if (isCold) {
                    if (sz === 'L') cupName = 'Şeffaf Bardak: Large (16oz)';
                    else if (sz === 'M') cupName = 'Şeffaf Bardak: Medium (14oz)';
                    else cupName = 'Şeffaf Bardak: Small (12oz)';
                } else {
                    if (sz === 'L') cupName = 'Karton Bardak: Large (16oz)';
                    else if (sz === 'M') cupName = 'Karton Bardak: Medium (12oz)';
                    else cupName = 'Karton Bardak: Small (8oz)';
                }

                const cupIng = ingredientMap.get(cupName);
                if (cupIng) cost += (Number(cupIng.costPerUnit) || 0);
            }

            return cost;
        };

        // 8. Calculate Stats
        const productStatsMap: Record<string, { productName: string; category: string; quantity: number; revenue: number; totalCost: number; }> = {};

        for (const order of detailedOrders) {
            const orderTotalBeforeDiscount = order.orderItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
            const discountRatio = orderTotalBeforeDiscount > 0 ? (Number(order.finalAmount) || 0) / orderTotalBeforeDiscount : 1;

            for (const item of order.orderItems) {
                const prod = productRecipeMap.get(item.productName);
                if (!productStatsMap[item.productName]) {
                    productStatsMap[item.productName] = {
                        productName: item.productName,
                        category: prod?.category || 'Diğer',
                        quantity: 0,
                        revenue: 0,
                        totalCost: 0
                    };
                }

                const stats = productStatsMap[item.productName];
                const qty = Number(item.quantity) || 0;
                stats.quantity += qty;
                stats.revenue += (Number(item.totalPrice) || 0) * discountRatio;
                stats.totalCost += getUnitCost(item) * qty;
            }
        }

        for (const sc of staffConsumptions) {
            for (const item of sc.items) {
                const prod = productRecipeMap.get(item.productName);
                if (!productStatsMap[item.productName]) {
                    productStatsMap[item.productName] = {
                        productName: item.productName,
                        category: prod?.category || 'Diğer',
                        quantity: 0,
                        revenue: 0,
                        totalCost: 0
                    };
                }

                const stats = productStatsMap[item.productName];
                const qty = Number(item.quantity) || 0;
                stats.quantity += qty;
                stats.revenue += (Number(item.staffPrice) || 0) * qty;
                stats.totalCost += getUnitCost(item) * qty;
            }
        }

        // 9. Format results
        const detailedStats = Object.values(productStatsMap).map(stat => {
            const revenue = stat.revenue;
            const totalCost = stat.totalCost;
            const profit = revenue - totalCost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : (profit > 0 ? 100 : 0);
            const markup = totalCost > 0 ? (profit / totalCost) * 100 : (profit > 0 ? 100 : 0);

            return {
                productName: stat.productName,
                category: stat.category,
                quantity: stat.quantity,
                revenue: Math.round(revenue * 100) / 100,
                unitCost: stat.quantity > 0 ? Math.round((totalCost / stat.quantity) * 100) / 100 : 0,
                totalCost: Math.round(totalCost * 100) / 100,
                unitProfit: stat.quantity > 0 ? Math.round((revenue / stat.quantity - totalCost / stat.quantity) * 100) / 100 : 0,
                totalProfit: Math.round(profit * 100) / 100,
                margin: Math.round(margin * 10) / 10,
                markup: Math.round(markup * 10) / 10
            };
        }).sort((a, b) => b.revenue - a.revenue);

        const totalProductsSold = detailedStats.reduce((sum, item) => sum + item.quantity, 0);
        const totalCostSum = detailedStats.reduce((sum, item) => sum + item.totalCost, 0);
        const totalProfitSum = totalRevenue - totalCostSum;

        return NextResponse.json({
            date: dateParam,
            summary: {
                totalOrders,
                totalProductsSold,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalCost: Math.round(totalCostSum * 100) / 100,
                totalProfit: Math.round(totalProfitSum * 100) / 100,
                profitMargin: totalRevenue > 0 ? Math.round((totalProfitSum / totalRevenue) * 1000) / 10 : (totalProfitSum > 0 ? 100 : 0),
                markup: totalCostSum > 0 ? Math.round((totalProfitSum / totalCostSum) * 1000) / 10 : (totalProfitSum > 0 ? 100 : 0),
                orderRevenue: Math.round(orderRevenue * 100) / 100,
                staffRevenue: Math.round(staffRevenue * 100) / 100
            },
            products: detailedStats
        });

    } catch (error) {
        console.error('Daily sales report error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sales report' },
            { status: 500 }
        );
    }
}
