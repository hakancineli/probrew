import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;
        const body = await request.json();
        const { isRead } = body;

        // Verify ownership and update
        const feedback = await prisma.feedback.update({
            where: { id, businessId: user.businessId },
            data: { isRead: !!isRead },
        });

        return NextResponse.json(feedback);
    } catch (error) {
        console.error('Feedback update error:', error);
        return NextResponse.json(
            { error: 'Geri bildirim güncellenirken bir hata oluştu.' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;

        // Verify ownership and delete
        await prisma.feedback.delete({
            where: { id, businessId: user.businessId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Feedback delete error:', error);
        return NextResponse.json(
            { error: 'Geri bildirim silinirken bir hata oluştu.' },
            { status: 500 }
        );
    }
}
