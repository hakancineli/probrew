import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/auth';
import { realtimeBus } from '@/lib/events';

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

export async function POST(request: NextRequest) {
    try {
        const user = getUser(request);
        const body = await request.json();
        const { customerName, customerPhone, customerEmail, notes, items, totalAmount, status, paymentMethod, staffPin } = body;

        // Multi-tenant: Identify Business Context
        // Priority: 1. Token (if staff/user) 2. Body (from POS)
        let businessId = user?.businessId || body.businessId;

        // If still no businessId, we can't proceed safely
        if (!businessId) {
            // Fallback for isolated development/migration (remove in production)
            const firstBusiness = await prisma.business.findFirst();
            businessId = firstBusiness?.id;

            if (!businessId) {
                return NextResponse.json({ success: false, error: 'İşletme kimliği belirlenemedi.' }, { status: 400 });
            }
        }

        // Generate Order Number
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderNumber = `PB-${timestamp}-${random}`;

        let userId: string | null = body.userId || null;
        let staffId: string | undefined = undefined;
        let staffEmail: string | undefined = undefined;

        // If the request comes from a logged-in session (Staff or Customer)
        if (user) {
            if (user.isStaff) {
                staffId = user.userId;
                staffEmail = user.email;
            } else {
                userId = user.userId;
            }
        }

        // Staff Performance Integration (PIN Code) - Scoped by Business
        if (staffPin) {
            const staff = await prisma.barista.findFirst({
                where: {
                    pinCode: staffPin,
                    isActive: true,
                    businessId: businessId
                }
            });

            if (!staff) {
                return NextResponse.json({ success: false, error: 'Hatalı Personel PIN kodu!' }, { status: 400 });
            }

            staffId = staff.id;
            staffEmail = staff.email;
        }

        // Auto-Registration / Guest Linking (Global email check per current schema)
        if (!userId && customerEmail) {
            try {
                let userRecord = await prisma.user.findUnique({
                    where: { email: customerEmail }
                });

                if (!userRecord) {
                    const bcrypt = require('bcryptjs');
                    const hashedPassword = body.password
                        ? await bcrypt.hash(body.password, 10)
                        : 'GUEST_ACCOUNT';

                    const nameParts = customerName?.split(' ') || ['Misafir'];
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(' ');

                    userRecord = await prisma.user.create({
                        data: {
                            email: customerEmail,
                            passwordHash: hashedPassword,
                            firstName,
                            lastName,
                            phone: customerPhone,
                            businessId: businessId,
                            userPoints: {
                                create: {
                                    points: 0,
                                    tier: 'BRONZE'
                                }
                            }
                        }
                    });
                }
                userId = userRecord.id;
            } catch (err) {
                console.error('User linking error:', err);
            }
        }

        const orderStatus = status || 'PENDING';
        const isBranchPayment = paymentMethod === 'BRANCH';
        const method = isBranchPayment ? null : (paymentMethod || 'CASH');
        const paymentStatus = isBranchPayment ? 'PENDING' : (body.paymentStatus || (orderStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING'));

        // 1. Validate items and check stock - Scoped by Business
        const productIds = items.map((item: any) => item.productId.toString());
        const existingProducts = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                businessId: businessId
            },
            include: {
                recipes: {
                    include: {
                        items: { include: { ingredient: true } }
                    }
                }
            }
        });

        const productMap = new Map(existingProducts.map(p => [p.id, p]));
        const UNIT_BASED_CATEGORIES = ['Meşrubatlar', 'Yan Ürünler', 'Kahve Çekirdekleri', 'Çaylar', 'Şuruplar', 'Soslar', 'Püreler', 'Tozlar', 'Sütler'];
        const COLD_CATEGORIES = ['Soğuk Kahveler', 'Soğuk İçecekler', 'Frappeler', 'Bubble Tea', 'Milkshake'];

        for (const item of items) {
            const productInDb = productMap.get(item.productId.toString());
            if (!productInDb) {
                return NextResponse.json({ success: false, error: `Ürün bulunamadı: ${item.productName}` }, { status: 400 });
            }

            let normalizedSize = item.size;
            if (normalizedSize === 'S') normalizedSize = 'Small';
            else if (normalizedSize === 'M') normalizedSize = 'Medium';
            else if (normalizedSize === 'L') normalizedSize = 'Large';

            let recipe = productInDb.recipes.find(r => r.size === normalizedSize) ||
                productInDb.recipes.find(r => r.size === 'Standart') ||
                productInDb.recipes.find(r => r.size === null) ||
                (productInDb.recipes.length > 0 ? productInDb.recipes[0] : null);

            if (recipe) {
                for (const ri of recipe.items) {
                    if (ri.ingredient.stock < (Number(ri.quantity) * Number(item.quantity))) {
                        return NextResponse.json({
                            success: false,
                            error: `Yetersiz Hammadde: ${ri.ingredient.name} bittiği için ${productInDb.name} verilemez!`
                        }, { status: 400 });
                    }
                }
            } else {
                // FALLBACK: If no recipe exists, treat as UNIT-BASED (stock deduction from product itself)
                if (productInDb.stock < Number(item.quantity)) {
                    return NextResponse.json({
                        success: false,
                        error: `${productInDb.name} tükendi! (Kalan: ${productInDb.stock})`
                    }, { status: 400 });
                }
            }
        }

        // 2. Create Order
        const finalAmount = (body.finalAmount !== undefined && body.finalAmount !== null) 
            ? Number(body.finalAmount) 
            : Number(totalAmount);
        const discountAmount = Number(body.discountAmount) || 0;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                businessId,
                userId: userId || undefined,
                customerName,
                customerPhone,
                customerEmail,
                notes: isBranchPayment ? `${notes || ''} [ŞUBEDE ÖDE]`.trim() : notes,
                totalAmount: Number(totalAmount),
                finalAmount,
                discountAmount,
                status: orderStatus,
                paymentMethod: method,
                paymentStatus,
                staffId: staffId || null,
                tableId: body.tableId || null,
                payments: {
                    create: body.payments && body.payments.length > 0
                        ? body.payments.map((p: any) => ({
                            amount: Number(p.amount),
                            method: p.method,
                            status: paymentStatus
                        }))
                        : [{
                            amount: finalAmount,
                            method: method || 'CASH',
                            status: paymentStatus
                        }]
                },
                orderItems: {
                    create: items.map((item: any) => ({
                        productId: item.productId.toString(),
                        productName: item.productName,
                        size: item.size,
                        quantity: Number(item.quantity),
                        unitPrice: Number(item.unitPrice),
                        totalPrice: Number(item.totalPrice),
                        isPorcelain: item.isPorcelain || false
                    }))
                }
            }
        });

        // 3. Stock Update (Parallel)
        const updatePromises: Promise<any>[] = [];
        for (const item of items) {
            const productInDb = productMap.get(item.productId.toString())!;
            let normalizedSize = item.size;
            if (normalizedSize === 'S') normalizedSize = 'Small';
            else if (normalizedSize === 'M') normalizedSize = 'Medium';
            else if (normalizedSize === 'L') normalizedSize = 'Large';

            let recipe = productInDb.recipes.find(r => r.size === normalizedSize) ||
                productInDb.recipes.find(r => r.size === 'Standart') ||
                productInDb.recipes.find(r => r.size === null) ||
                (productInDb.recipes.length > 0 ? productInDb.recipes[0] : null);

            if (recipe) {
                updatePromises.push(prisma.product.update({
                    where: { id: productInDb.id },
                    data: { soldCount: { increment: Number(item.quantity) } }
                }));

                // Log Product Transaction (though it's usually recipes that matter, tracking the sold count is key)
                
                for (const ri of recipe.items) {
                    const decrementQty = Number(ri.quantity) * Number(item.quantity);
                    updatePromises.push(
                        prisma.$transaction(async (tx) => {
                            const ing = await tx.ingredient.findUnique({ where: { id: ri.ingredientId } });
                            if (ing) {
                                await tx.ingredient.update({
                                    where: { id: ing.id },
                                    data: { stock: { decrement: decrementQty } }
                                });
                                await tx.inventoryTransaction.create({
                                    data: {
                                        businessId,
                                        type: 'SALE',
                                        ingredientId: ing.id,
                                        quantity: -decrementQty,
                                        previousStock: ing.stock,
                                        newStock: ing.stock - decrementQty,
                                        notes: `Sipariş: ${orderNumber}`
                                    }
                                });
                            }
                        })
                    );
                }
            } else {
                const decrementQty = Number(item.quantity);
                updatePromises.push(
                    prisma.$transaction(async (tx) => {
                        const prod = await tx.product.findUnique({ where: { id: productInDb.id } });
                        if (prod) {
                            await tx.product.update({
                                where: { id: prod.id },
                                data: { 
                                    soldCount: { increment: decrementQty },
                                    stock: { decrement: decrementQty } 
                                }
                            });
                            await tx.inventoryTransaction.create({
                                data: {
                                    businessId,
                                    type: 'SALE',
                                    productId: prod.id,
                                    quantity: -decrementQty,
                                    previousStock: Number(prod.stock),
                                    newStock: Number(prod.stock) - decrementQty,
                                    notes: `Sipariş: ${orderNumber}`
                                }
                            });
                        }
                    })
                );
            }

            // Cup Deduction - Scoped by Business
            if (!item.isPorcelain) {
                const isCold = COLD_CATEGORIES.includes(productInDb.category) ||
                    productInDb.name.toLowerCase().match(/iced|buzlu|cold/);
                let cupName = '';
                const size = item.size || 'Medium';

                if (isCold) {
                    if (['Small', 'S'].includes(size)) cupName = 'Şeffaf Bardak: Small (12oz)';
                    else if (['Medium', 'M'].includes(size)) cupName = 'Şeffaf Bardak: Medium (14oz)';
                    else if (['Large', 'L'].includes(size)) cupName = 'Şeffaf Bardak: Large (16oz)';
                } else {
                    if (['Small', 'S'].includes(size)) cupName = 'Karton Bardak: Small (8oz)';
                    else if (['Medium', 'M'].includes(size)) cupName = 'Karton Bardak: Medium (14oz)';
                    else if (['Large', 'L'].includes(size)) cupName = 'Karton Bardak: Large (16oz)';
                }

                if (cupName) {
                    updatePromises.push(
                        prisma.$transaction(async (tx) => {
                            const cup = await tx.ingredient.findFirst({
                                where: { name: cupName, businessId }
                            });
                            if (cup) {
                                const decrementQty = Number(item.quantity);
                                await tx.ingredient.update({
                                    where: { id: cup.id },
                                    data: { stock: { decrement: decrementQty } }
                                });
                                await tx.inventoryTransaction.create({
                                    data: {
                                        businessId,
                                        type: 'SALE',
                                        ingredientId: cup.id,
                                        quantity: -decrementQty,
                                        previousStock: cup.stock,
                                        newStock: cup.stock - decrementQty,
                                        notes: `Sipariş Kap: ${orderNumber}`
                                    }
                                });
                            }
                        })
                    );
                }
            }
        }

        // 4. Audit Log
        if (discountAmount > 0) {
            await createAuditLog({
                action: discountAmount >= Number(totalAmount) ? 'POS_FULL_DISCOUNT' : 'POS_DISCOUNTED_ORDER',
                entity: 'Order',
                entityId: order.id,
                businessId,
                userId: staffId,
                userEmail: staffEmail,
                newData: { orderNumber, totalAmount, discountAmount, finalAmount }
            });
        }

        if (paymentStatus === 'COMPLETED' && method === 'CASH') {
            updatePromises.push(
                prisma.$transaction(async (tx) => {
                    const register = await tx.cashRegister.findFirst({
                        where: { businessId }
                    });
                    if (register) {
                        await tx.cashRegister.update({
                            where: { id: register.id },
                            data: { currentBalance: { increment: finalAmount } }
                        });
                        await tx.cashMovement.create({
                            data: {
                                businessId,
                                registerId: register.id,
                                amount: finalAmount,
                                type: 'IN',
                                reason: 'SALE',
                                notes: `Sipariş: ${orderNumber}`
                            }
                        });
                    }
                })
            );
        }

        await Promise.allSettled(updatePromises);
        
        let tableName = null;
        if (order.tableId) {
            const tbl = await prisma.table.findUnique({ where: { id: order.tableId } });
            tableName = tbl?.name;
        }

        // Dispatch realtime event
        realtimeBus.publish(businessId, 'NEW_ORDER', {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            customerName: order.customerName,
            totalAmount: order.totalAmount,
            tableId: order.tableId,
            tableName: tableName
        });

        return NextResponse.json({ success: true, orderId: order.id, orderNumber });

    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json({ success: false, error: 'Sipariş oluşturulamadı.' }, { status: 500 });
    }
}
