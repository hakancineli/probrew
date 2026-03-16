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

export async function GET(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const fixtures = await prisma.fixture.findMany({
            where: { businessId: user.businessId },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(fixtures);
    } catch (error) {
        console.error('Fetch fixtures error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, category, quantity, purchasePrice, purchaseDate, status, notes } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const fixture = await prisma.fixture.create({
            data: {
                businessId: user.businessId,
                name,
                category,
                quantity: parseInt(quantity?.toString()) || 1,
                purchasePrice: parseFloat(purchasePrice?.toString()) || null,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                status: status || 'Kullanımda',
                notes,
            },
        });

        await createAuditLog({
            action: 'CREATE_FIXTURE',
            entity: 'Fixture',
            entityId: fixture.id,
            businessId: user.businessId,
            newData: fixture,
            userId: user.userId,
            userEmail: user.email,
        });

        return NextResponse.json(fixture);
    } catch (error) {
        console.error('Create fixture error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, category, quantity, purchasePrice, purchaseDate, status, notes } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        // Verify ownership
        const currentFixture = await prisma.fixture.findFirst({
            where: { id, businessId: user.businessId }
        });

        if (!currentFixture) {
            return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
        }

        const fixture = await prisma.fixture.update({
            where: { id },
            data: {
                name,
                category,
                quantity: parseInt(quantity?.toString()) || 1,
                purchasePrice: parseFloat(purchasePrice?.toString()) || null,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                status: status || 'Kullanımda',
                notes,
            },
        });

        await createAuditLog({
            action: 'UPDATE_FIXTURE',
            entity: 'Fixture',
            entityId: id,
            businessId: user.businessId,
            oldData: currentFixture,
            newData: fixture,
            userId: user.userId,
            userEmail: user.email,
        });

        return NextResponse.json(fixture);
    } catch (error) {
        console.error('Update fixture error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const currentFixture = await prisma.fixture.findFirst({
            where: { id, businessId: user.businessId }
        });

        if (!currentFixture) {
            return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
        }

        await prisma.fixture.delete({
            where: { id },
        });

        await createAuditLog({
            action: 'DELETE_FIXTURE',
            entity: 'Fixture',
            entityId: id,
            businessId: user.businessId,
            oldData: currentFixture,
            userId: user.userId,
            userEmail: user.email,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete fixture error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
