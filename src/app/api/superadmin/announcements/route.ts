import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const role = request.headers.get('x-user-role');
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const announcements = await prisma.systemAnnouncement.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(announcements);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const role = request.headers.get('x-user-role');
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, type, target, isActive } = body;

        const announcement = await prisma.systemAnnouncement.create({
            data: {
                title,
                content,
                type: type || 'INFO',
                target: target || 'ALL',
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(announcement);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const role = request.headers.get('x-user-role');
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.systemAnnouncement.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
