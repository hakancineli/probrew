import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { businessId, type, content, customerName, customerContact } = body;

        if (!businessId) {
            return NextResponse.json(
                { error: 'İşletme kimliği zorunludur.' },
                { status: 400 }
            );
        }

        if (!type || !content) {
            return NextResponse.json(
                { error: 'Tip ve içerik alanları zorunludur.' },
                { status: 400 }
            );
        }

        // Verify business exists
        const business = await prisma.business.findUnique({
            where: { id: businessId }
        });

        if (!business) {
            return NextResponse.json({ error: 'Geçersiz işletme kimliği.' }, { status: 404 });
        }

        const feedback = await prisma.feedback.create({
            data: {
                businessId,
                type,
                content,
                customerName: customerName || null,
                customerContact: customerContact || null,
            },
        });

        return NextResponse.json({ success: true, feedback });
    } catch (error: any) {
        console.error('Feedback submission error:', error);
        return NextResponse.json(
            { error: 'Geri bildirim gönderilirken bir hata oluştu.' },
            { status: 500 }
        );
    }
}
