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
        const adminUser = getUser(request);
        if (!adminUser?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch users who have orders with discountAmount > 0 for this business
        // and sort by frequency/total savings
        const topLoyalUsers = await prisma.user.findMany({
            where: {
                businessId: adminUser.businessId,
                orders: {
                    some: {
                        businessId: adminUser.businessId,
                        discountAmount: { gt: 0 },
                        status: 'COMPLETED'
                    }
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                _count: {
                    select: {
                        orders: {
                            where: {
                                businessId: adminUser.businessId,
                                discountAmount: { gt: 0 },
                                status: 'COMPLETED'
                            }
                        }
                    }
                },
                orders: {
                    where: {
                        businessId: adminUser.businessId,
                        discountAmount: { gt: 0 },
                        status: 'COMPLETED'
                    },
                    select: {
                        discountAmount: true
                    }
                }
            },
            take: 10
        });

        const formattedUsers = topLoyalUsers.map(user => ({
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            phone: user.phone,
            count: user._count.orders,
            totalSavings: user.orders.reduce((sum, order) => sum + (Number(order.discountAmount) || 0), 0)
        })).sort((a, b) => b.totalSavings - a.totalSavings);

        return NextResponse.json({ topLoyalUsers: formattedUsers });

    } catch (error) {
        console.error('Loyalty stats error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
