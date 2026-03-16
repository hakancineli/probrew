import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import jwt from 'jsonwebtoken';

// Helper to authenticate user
const getUserIdFromToken = (request: NextRequest) => {
    let token = request.cookies.get('auth-token')?.value;
    if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
        return decoded.userId;
    } catch (err) {
        return null;
    }
};

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id;
        const userId = getUserIdFromToken(request);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch order with ownership check
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId: userId }
        });

        if (!order) {
            return NextResponse.json({ error: 'Sipariş bulunamadı veya bu işlem için yetkiniz yok.' }, { status: 404 });
        }

        // Check if cancellable
        const ALLOWED_STATUSES = ['PENDING'];
        if (!ALLOWED_STATUSES.includes(order.status)) {
            return NextResponse.json(
                { error: 'Siparişiniz hazırlanmaya başlandığı veya tamamlandığı için iptal edilemez. Lütfen işletmeyle iletişime geçin.' },
                { status: 400 }
            );
        }

        // Cancel order
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }
        });

        // Audit Log
        await createAuditLog({
            action: 'CANCEL_ORDER_USER',
            entity: 'Order',
            entityId: orderId,
            businessId: order.businessId,
            newData: { status: 'CANCELLED' },
            userId: userId,
            userEmail: 'CUSTOMER_ACTION'
        });

        return NextResponse.json({ success: true, message: 'Siparişiniz başarıyla iptal edildi' });
    } catch (error) {
        console.error('Cancel order error:', error);
        return NextResponse.json(
            { error: 'İptal işlemi gerçekleştirilemedi' },
            { status: 500 }
        );
    }
}
