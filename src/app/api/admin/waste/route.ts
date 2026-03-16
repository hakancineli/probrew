import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
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
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.wasteLog.findMany({
                where: { businessId: user.businessId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.wasteLog.count({
                where: { businessId: user.businessId }
            }),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Waste logs fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch waste logs' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, productName, ingredientId, ingredientName, quantity, unit, reason } = body;

        if (!quantity || (!productId && !ingredientId)) {
            return NextResponse.json(
                { error: 'Quantity and either Product or Ingredient is required' },
                { status: 400 }
            );
        }

        const qtyValue = parseFloat(quantity.toString());

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Waste Log
            const wasteLog = await tx.wasteLog.create({
                data: {
                    businessId: user.businessId,
                    productId: productId?.toString(),
                    productName,
                    ingredientId: ingredientId?.toString(),
                    ingredientName,
                    quantity: qtyValue,
                    unit,
                    reason,
                    userId: user.userId,
                    userEmail: user.email,
                },
            });

            let totalCost = 0;

            // 2. Update Stock and Calculate Cost
            if (productId) {
                const product = await tx.product.findFirst({
                    where: { id: productId.toString(), businessId: user.businessId }
                });

                if (!product) throw new Error('Product not found');

                const recipes = await tx.recipe.findMany({
                    where: { productId: product.id },
                    include: { items: { include: { ingredient: true } } }
                });

                if (recipes.length > 0) {
                    const recipe = recipes[0];
                    for (const item of recipe.items) {
                        const itemCost = (Number(item.ingredient.costPerUnit) || 0) * (Number(item.quantity) || 0) * qtyValue;
                        totalCost += itemCost;

                        const updatedIng = await tx.ingredient.update({
                            where: { id: item.ingredientId },
                            data: {
                                stock: { decrement: (Number(item.quantity) || 0) * qtyValue },
                            },
                        });

                        await tx.inventoryTransaction.create({
                            data: {
                                businessId: user.businessId,
                                type: 'WASTE',
                                ingredientId: item.ingredientId,
                                quantity: -(Number(item.quantity) || 0) * qtyValue,
                                previousStock: Number(updatedIng.stock) + (Number(item.quantity) || 0) * qtyValue,
                                newStock: updatedIng.stock,
                                notes: `Zayi (Ürün: ${product.name}): ${reason}`
                            }
                        });
                    }
                }

                await tx.product.update({
                    where: { id: productId.toString() },
                    data: { stock: { decrement: qtyValue } },
                });
            } else if (ingredientId) {
                const ingredient = await tx.ingredient.findFirst({
                    where: { id: ingredientId.toString(), businessId: user.businessId }
                });

                if (!ingredient) throw new Error('Ingredient not found');

                totalCost = (Number(ingredient.costPerUnit) || 0) * qtyValue;

                const updatedIng = await tx.ingredient.update({
                    where: { id: ingredientId.toString() },
                    data: { stock: { decrement: qtyValue } },
                });

                // Log Inventory Transaction
                await tx.inventoryTransaction.create({
                    data: {
                        businessId: user.businessId,
                        type: 'WASTE',
                        ingredientId: ingredient.id,
                        quantity: -qtyValue,
                        previousStock: ingredient.stock,
                        newStock: updatedIng.stock,
                        notes: `Zayi: ${reason}`
                    }
                });
            }

            // 3. Create Expense Record
            if (totalCost > 0) {
                const staff = await tx.barista.findFirst({
                    where: { email: user.email, businessId: user.businessId }
                });

                await tx.expense.create({
                    data: {
                        businessId: user.businessId,
                        description: `Zayi: ${productName || ingredientName} (${qtyValue} ${unit}) - ${reason}`,
                        amount: totalCost,
                        category: 'WASTE',
                        date: new Date(),
                        staffId: staff?.id || undefined,
                    }
                });
            }

            // 4. Create Audit Log
            await createAuditLog({
                action: 'CREATE_WASTE_LOG',
                entity: 'WasteLog',
                entityId: wasteLog.id,
                businessId: user.businessId,
                newData: { ...wasteLog, cost: totalCost },
                userId: user.userId,
                userEmail: user.email,
            });

            return wasteLog;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Waste log creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create waste log' },
            { status: 500 }
        );
    }
}
