import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
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

        if (!id) {
            return NextResponse.json(
                { error: 'Gider ID gereklidir.' },
                { status: 400 }
            );
        }

        // Verify ownership
        const currentExpense = await prisma.expense.findFirst({
            where: { id, businessId: user.businessId }
        });

        if (!currentExpense) {
            return NextResponse.json({ error: 'Gider bulunamadı' }, { status: 404 });
        }

        await prisma.expense.delete({
            where: { id }
        });

        await createAuditLog({
            action: 'DELETE_EXPENSE',
            entity: 'Expense',
            entityId: id,
            businessId: user.businessId,
            oldData: currentExpense,
            userId: user.userId,
            userEmail: user.email,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Expense delete error:', error);
        return NextResponse.json(
            { error: 'Gider silinemedi' },
            { status: 500 }
        );
    }
}
