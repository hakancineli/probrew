import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const role = request.headers.get('x-user-role');
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get global counts
        const [
            totalBusinesses, 
            totalOrders, 
            totalRevenue, 
            activeSubscriptions, 
            trialSubscriptions,
            suspendedSubscriptions
        ] = await Promise.all([
            prisma.business.count(),
            prisma.order.count({ where: { isDeleted: false } }),
            prisma.order.aggregate({
                where: { isDeleted: false, status: 'COMPLETED' },
                _sum: { finalAmount: true }
            }),
            prisma.business.count({ where: { subscriptionStatus: 'ACTIVE' } }),
            prisma.business.count({ where: { subscriptionStatus: 'TRIAL' } }),
            prisma.business.count({ where: { subscriptionStatus: 'SUSPENDED' } })
        ]);

        // Get last 15 orders globally
        const recentOrders = await prisma.order.findMany({
            where: { isDeleted: false },
            take: 15,
            orderBy: { createdAt: 'desc' },
            include: {
                business: {
                    select: { name: true, slug: true }
                }
            }
        });

        // Get last 20 audit logs
        const recentLogs = await prisma.auditLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                business: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json({
            stats: {
                totalBusinesses,
                totalOrders,
                totalRevenue: totalRevenue._sum.finalAmount || 0,
                activeSubscriptions,
                trialSubscriptions,
                suspendedSubscriptions
            },
            recentOrders,
            recentLogs
        });
    } catch (error) {
        console.error('Superadmin stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch global stats' }, { status: 500 });
    }
}
