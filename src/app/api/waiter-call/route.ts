import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { realtimeBus } from '@/lib/events';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { businessId, tableId, tableName } = body;

        if (!businessId || !tableId) {
            return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
        }

        // Emit realtime event for POS/Staff
        realtimeBus.publish(businessId, 'WAITER_CALL', {
            tableId,
            tableName: tableName || 'Bilinmeyen Masa',
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({ success: true, message: 'Garson çağrıldı.' });
    } catch (error) {
        return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
    }
}
