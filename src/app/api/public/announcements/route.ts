import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const announcements = await prisma.systemAnnouncement.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        return NextResponse.json(announcements[0] || null);
    } catch (error) {
        return NextResponse.json(null);
    }
}
