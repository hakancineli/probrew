import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Helper to get user from request with DB fallback for businessId
const getUser = async (request: NextRequest) => {
    // 1. Try headers first (passed from middleware)
    const headerUserId = request.headers.get('x-user-id');
    const headerBusinessId = request.headers.get('x-business-id');

    let userBase: any = null;

    if (headerUserId && headerBusinessId) {
        userBase = {
            userId: headerUserId,
            businessId: headerBusinessId,
            email: request.headers.get('x-user-email') || '',
            role: request.headers.get('x-user-role') || ''
        };
    } else {
        // 2. Fallback to direct token verification
        let token = request.cookies.get('auth-token')?.value;
        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        userBase = token ? verifyToken(token) : null;
    }

    // 3. Last resort: If we have a userId but no businessId, fetch from DB
    if (userBase && userBase.userId && !userBase.businessId) {
        console.log(`[AUTH] Fetching missing businessId for user ${userBase.userId}`);
        const staff = await prisma.barista.findUnique({
            where: { id: userBase.userId },
            select: { businessId: true }
        });
        if (staff) {
            userBase.businessId = staff.businessId;
        } else {
            const customer = await prisma.user.findUnique({
                where: { id: userBase.userId },
                select: { businessId: true }
            });
            if (customer) userBase.businessId = customer.businessId;
        }
    }

    return userBase;
};

// Robust numeric parser for Turkish locale (handles , as .)
const parseSafeFloat = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    const str = val.toString().trim().replace(',', '.');
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
};

// GET - List all ingredients
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        const user = await getUser(request);
        if (!user?.businessId) {
            console.error('[API/INGREDIENTS] GET 401: No businessId found in token/headers/db');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const where: any = { businessId: user.businessId };
        if (search) {
            const searchLower = search.toLowerCase();
            const variations = [search, searchLower];

            if (searchLower.includes('i') || searchLower.includes('ı')) {
                variations.push(searchLower.replace(/i/g, 'ı'));
                variations.push(searchLower.replace(/ı/g, 'i'));
            }

            const uniqueVariations = Array.from(new Set(variations));

            where.OR = uniqueVariations.map(v => ({
                name: { contains: v, mode: 'insensitive' }
            }));
        }

        const ingredients = await prisma.ingredient.findMany({
            where,
            orderBy: { name: 'asc' }
        });

        // Calculate Monthly Consumption (Approximated from Sales)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyOrders = await prisma.order.findMany({
            where: {
                businessId: user.businessId,
                createdAt: { gte: startOfMonth },
                status: { not: 'CANCELLED' }
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        const allRecipes = await prisma.recipe.findMany({
            where: { product: { businessId: user.businessId } },
            include: { items: { include: { ingredient: true } } }
        });

        let monthlyConsumptionCost = 0;

        for (const order of monthlyOrders) {
            for (const item of order.orderItems) {
                // Precise matching logic
                const specificRecipe = allRecipes.find(r => r.productId === item.productId && r.size === item.size);
                const genericRecipe = allRecipes.find(r => r.productId === item.productId && r.size === null);

                const activeRecipe = specificRecipe || genericRecipe;

                if (activeRecipe) {
                    for (const ri of activeRecipe.items) {
                        if (ri.ingredient) {
                            const cost = (Number(ri.quantity) || 0) * (Number(ri.ingredient.costPerUnit) || 0);
                            monthlyConsumptionCost += cost * (Number(item.quantity) || 0);
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            items: ingredients,
            meta: {
                monthlyConsumptionCost
            }
        });

    } catch (error) {
        console.error('Ingredients fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ingredients' },
            { status: 500 }
        );
    }
}

// POST - Create new ingredient
export async function POST(request: NextRequest) {
    try {
        const user = await getUser(request);
        if (!user?.businessId) {
            console.error('[API/INGREDIENTS] POST 401: No businessId found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { name, unit, stock, costPerUnit } = body;

        if (!name || !unit) {
            return NextResponse.json(
                { error: 'Name and unit are required' },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const ingredient = await tx.ingredient.create({
                data: {
                    businessId: user.businessId,
                    name,
                    unit,
                    stock: parseSafeFloat(stock),
                    costPerUnit: parseSafeFloat(costPerUnit)
                }
            });

            const parsedStock = parseSafeFloat(stock);
            const parsedCost = parseSafeFloat(costPerUnit);

            if (parsedStock > 0 && parsedCost > 0) {
                await tx.expense.create({
                    data: {
                        businessId: user.businessId,
                        description: `Hammadde: ${name} (${parsedStock} ${unit})`,
                        amount: parsedStock * parsedCost,
                        category: 'SUPPLIES',
                        date: new Date()
                    }
                });
            }

            // Log Inventory Transaction
            await tx.inventoryTransaction.create({
                data: {
                    businessId: user.businessId,
                    type: 'PURCHASE',
                    ingredientId: ingredient.id,
                    quantity: parsedStock,
                    previousStock: 0,
                    newStock: parsedStock,
                    notes: 'Yeni hammadde kaydı'
                }
            });

            await tx.auditLog.create({
                data: {
                    businessId: user.businessId,
                    action: 'CREATE_INGREDIENT',
                    entity: 'Ingredient',
                    entityId: ingredient.id,
                    newData: ingredient as any,
                    userId: user?.userId,
                    userEmail: user?.email,
                }
            });

            return ingredient;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Ingredient creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create ingredient' },
            { status: 500 }
        );
    }
}

// PUT - Update ingredient
export async function PUT(request: NextRequest) {
    try {
        const user = await getUser(request);
        if (!user?.businessId) {
            console.error('[API/INGREDIENTS] PUT 401: No businessId found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { id, name, unit, stock, costPerUnit } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Ingredient ID is required' },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // Get existing ingredient to check stock difference - Scoped to business
            const existing = await tx.ingredient.findFirst({
                where: { id, businessId: user.businessId }
            });

            if (!existing) {
                throw new Error('Ingredient not found');
            }

            const newStock = stock !== undefined ? parseSafeFloat(stock) : undefined;
            const newCostPerUnit = costPerUnit !== undefined ? parseSafeFloat(costPerUnit) : undefined;

            const ingredient = await tx.ingredient.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(unit && { unit }),
                    ...(newStock !== undefined && { stock: newStock }),
                    ...(newCostPerUnit !== undefined && { costPerUnit: newCostPerUnit })
                }
            });

            if (newStock !== undefined && newStock !== existing.stock) {
                const diff = newStock - existing.stock;
                const unitCost = newCostPerUnit !== undefined ? newCostPerUnit : existing.costPerUnit;

                if (diff > 0 && unitCost > 0) {
                    await tx.expense.create({
                        data: {
                            businessId: user.businessId,
                            description: `Hammadde Ekleme: ${ingredient.name} (+${diff} ${ingredient.unit})`,
                            amount: diff * unitCost,
                            category: 'SUPPLIES',
                            date: new Date()
                        }
                    });
                }

                // Log Inventory Transaction
                await tx.inventoryTransaction.create({
                    data: {
                        businessId: user.businessId,
                        type: diff > 0 ? 'PURCHASE' : 'MANUAL_ADJUST',
                        ingredientId: ingredient.id,
                        quantity: diff,
                        previousStock: existing.stock,
                        newStock: newStock,
                        notes: diff > 0 ? 'Hammadde alımı/girişi' : 'Manuel stok düzeltme'
                    }
                });
            }

            await tx.auditLog.create({
                data: {
                    businessId: user.businessId,
                    action: 'UPDATE_INGREDIENT',
                    entity: 'Ingredient',
                    entityId: ingredient.id,
                    oldData: existing as any,
                    newData: ingredient as any,
                    userId: user?.userId,
                    userEmail: user?.email,
                }
            });

            return ingredient;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Ingredient update error:', error);
        return NextResponse.json(
            { error: 'Failed to update ingredient' },
            { status: 500 }
        );
    }
}

// DELETE - Delete ingredient
export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser(request);
        if (!user?.businessId) {
            console.error('[API/INGREDIENTS] DELETE 401: No businessId found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Ingredient ID is required' },
                { status: 400 }
            );
        }

        await prisma.$transaction(async (tx) => {
            const existing = await tx.ingredient.findFirst({
                where: { id, businessId: user.businessId }
            });

            if (existing) {
                await tx.ingredient.delete({
                    where: { id }
                });

                await tx.auditLog.create({
                    data: {
                        businessId: user.businessId,
                        action: 'DELETE_INGREDIENT',
                        entity: 'Ingredient',
                        entityId: id,
                        oldData: existing as any,
                        userId: user?.userId,
                        userEmail: user?.email,
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Ingredient deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete ingredient' },
            { status: 500 }
        );
    }
}
