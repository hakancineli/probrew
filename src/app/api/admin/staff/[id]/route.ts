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

export async function PUT(
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
        const { name, email, phone, role, salary, pinCode } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Personel ID gereklidir.' },
                { status: 400 }
            );
        }

        // Ensure update is limited to current business
        const staff = await prisma.barista.update({
            where: { id, businessId: user.businessId },
            data: {
                name,
                email,
                phone,
                role,
                salary: parseFloat(salary?.toString()) || 0,
                pinCode: pinCode || null
            }
        });

        return NextResponse.json(staff);
    } catch (error) {
        console.error('Staff update error:', error);
        return NextResponse.json(
            { error: 'Personel güncellenemedi' },
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

        if (!id) {
            return NextResponse.json(
                { error: 'Personel ID gereklidir.' },
                { status: 400 }
            );
        }

        // Ensure delete is limited to current business
        await prisma.barista.delete({
            where: { id, businessId: user.businessId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Staff delete error:', error);
        return NextResponse.json(
            { error: 'Personel silinemedi' },
            { status: 500 }
        );
    }
}
