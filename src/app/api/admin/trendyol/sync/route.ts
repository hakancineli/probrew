import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trendyol } from '@/lib/trendyol';
import { verifyToken } from '@/lib/auth';

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

        // Fetch orders from Trendyol
        const trendyolData = await trendyol.getOrders('Created');
        const orders = trendyolData.content || [];

        let syncedCount = 0;

        for (const tOrder of orders) {
            // Check if order already exists (scoped to business if externalId is unique per business)
            const existing = await prisma.order.findUnique({
                where: { externalId: tOrder.id }
            });

            if (existing) continue;

            // Create Order - Scoped to this business
            const newOrder = await prisma.order.create({
                data: {
                    businessId: user.businessId,
                    orderNumber: `TY-${tOrder.orderNumber}`,
                    externalId: tOrder.id,
                    source: 'TRENDYOL',
                    customerName: `${tOrder.customerFirstName} ${tOrder.customerLastName}`,
                    customerPhone: tOrder.customerPhoneNumber,
                    status: 'PENDING',
                    totalAmount: Number(tOrder.totalPrice) || 0,
                    finalAmount: Number(tOrder.totalPrice) || 0,
                    paymentMethod: 'MOBILE_PAYMENT',
                    paymentStatus: 'COMPLETED',
                    orderItems: {
                        create: await Promise.all(tOrder.lines.map(async (line: any) => {
                            // Try to find matching product in THIS business
                            const product = await prisma.product.findFirst({
                                where: {
                                    businessId: user.businessId,
                                    name: { contains: line.productName, mode: 'insensitive' }
                                }
                            });

                            return {
                                productId: product?.id || 'external',
                                productName: line.productName,
                                quantity: Number(line.quantity) || 0,
                                unitPrice: Number(line.price) || 0,
                                totalPrice: (Number(line.price) || 0) * (Number(line.quantity) || 0),
                            };
                        }))
                    }
                }
            });

            syncedCount++;
        }

        return NextResponse.json({ success: true, synced: syncedCount });
    } catch (error: any) {
        console.error('Trendyol Sync Error:', error.message);
        return NextResponse.json({ success: false, error: 'Trendyol senkronizasyonu başarısız oldu' }, { status: 500 });
    }
}
