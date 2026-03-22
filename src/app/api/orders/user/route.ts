import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate User
        let token = request.cookies.get('auth-token')?.value;

        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        }

        // Verify token
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        } catch (err) {
            return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
        }

        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: 'Geçersiz kullanıcı' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get('businessId');

        // 2. Fetch User's Orders - Scoped to User
        // If businessId is provided, we filter by it. 
        // In a multi-tenant world, the user might have orders across different businesses (like a shared loyalty app)
        // or just one. We strictly scope to the userId first.
        const where: any = {
            userId: decoded.userId
        };

        if (businessId) {
            where.businessId = businessId;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: { imageUrl: true }
                        }
                    }
                },
                business: {
                    select: { name: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform data to match frontend expectations
        const transformedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            date: new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            status: order.status.toLowerCase(),
            total: Number(order.finalAmount) || Number(order.totalAmount) || 0,
            items: order.orderItems.map(item => ({
                id: item.productId,
                name: item.productName,
                quantity: item.quantity,
                price: item.unitPrice,
                image: (item as any).product?.imageUrl || '/images/logo/probrew.jpeg'
            })),
            paymentMethod: order.paymentMethod || 'Kredi Kartı',
            storeName: order.business?.name || 'ProBrew',
            storeLocation: 'Merkez Şube' // Defaulting as location isn't stored on business model in this app currently
        }));

        return NextResponse.json(transformedOrders);

    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        return NextResponse.json(
            { error: 'Siparişler getirilemedi' },
            { status: 500 }
        );
    }
}
