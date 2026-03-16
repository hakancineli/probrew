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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type');
        const isRead = searchParams.get('isRead');

        const skip = (page - 1) * limit;

        const where: any = { businessId: user.businessId };

        if (type && type !== 'ALL') {
            where.type = type;
        }
        if (isRead !== null && isRead !== undefined && isRead !== '') {
            where.isRead = isRead === 'true';
        }

        const [feedbacks, total, business] = await Promise.all([
            prisma.feedback.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.feedback.count({ where }),
            prisma.business.findUnique({
                where: { id: user.businessId },
                select: { slug: true }
            })
        ]);

        return NextResponse.json({
            feedbacks,
            businessSlug: business?.slug,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Feedback fetch error:', error);
        return NextResponse.json(
            { error: 'Geri bildirimler alınırken bir hata oluştu.' },
            { status: 500 }
        );
    }
}
