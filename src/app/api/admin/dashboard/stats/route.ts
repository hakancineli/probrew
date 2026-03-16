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

    // Check if user has staff access
    const staffRoles = ['MANAGER', 'BARISTA', 'WAITER', 'KITCHEN'];
    const hasAccess = user.isStaff || staffRoles.includes(user.role) || user.email === 'admin@probrew.com.tr';

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized - Staff access required' },
        { status: 403 }
      );
    }

    // Get current date in TR time (UTC+3)
    const nowInTR = new Date(new Date().getTime() + (3 * 60 * 60 * 1000));

    // Get starting point of today in TR time
    const startOfDay = new Date(Date.UTC(nowInTR.getUTCFullYear(), nowInTR.getUTCMonth(), nowInTR.getUTCDate(), -3, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(nowInTR.getUTCFullYear(), nowInTR.getUTCMonth(), nowInTR.getUTCDate() + 1, -3, 0, 0, 0));

    // Get current month date range in TR time
    const startOfMonth = new Date(Date.UTC(nowInTR.getUTCFullYear(), nowInTR.getUTCMonth(), 1, -3, 0, 0, 0));
    const nextMonth = new Date(Date.UTC(nowInTR.getUTCFullYear(), nowInTR.getUTCMonth() + 1, 1, -3, 0, 0, 0));

    // Get stats with businessId filter
    const [totalOrders, todayOrders, payments, staffConsumptions, pendingOrders, completedOrders, activeCustomers, lowStockCount, lowIngredientCount] = await Promise.all([
      // totalOrders (month)
      prisma.order.count({
        where: {
          businessId: user.businessId,
          createdAt: { gte: startOfMonth, lt: nextMonth },
          status: { not: 'CANCELLED' },
          isDeleted: false
        }
      }),
      // todayOrders
      prisma.order.count({
        where: {
          businessId: user.businessId,
          createdAt: { gte: startOfDay, lt: endOfDay },
          status: { not: 'CANCELLED' },
          isDeleted: false
        }
      }),
      // payments (month revenue)
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startOfMonth, lt: nextMonth },
          order: {
            businessId: user.businessId,
            isDeleted: false
          }
        },
        _sum: { amount: true }
      }),
      // staffConsumptions (month revenue)
      prisma.staffConsumption.findMany({
        where: {
          createdAt: { gte: startOfMonth, lt: nextMonth },
          staff: { businessId: user.businessId }
        },
        include: { items: true }
      }),
      // pendingOrders
      prisma.order.count({
        where: {
          businessId: user.businessId,
          status: 'PENDING',
          isDeleted: false
        }
      }),
      // completedOrders
      prisma.order.count({
        where: {
          businessId: user.businessId,
          status: 'COMPLETED',
          isDeleted: false
        }
      }),
      // activeCustomers
      prisma.user.count({
        where: { businessId: user.businessId }
      }),
      // lowStockCount
      prisma.product.count({
        where: {
          businessId: user.businessId,
          stock: { lte: 10 },
          isActive: true
        }
      }),
      // lowIngredientCount
      prisma.ingredient.count({
        where: {
          businessId: user.businessId,
          stock: { lte: 100 }
        }
      })
    ]);

    const staffRevenue = staffConsumptions.reduce((total, sc) =>
      total + sc.items.reduce((scTotal, item) => scTotal + (Number(item.staffPrice) * Number(item.quantity)), 0), 0
    );

    const totalRevenue = (Number(payments._sum.amount) || 0) + staffRevenue;

    const stats = {
      totalOrders,
      todayOrders,
      totalRevenue: Math.round(totalRevenue),
      activeCustomers,
      pendingOrders,
      completedOrders,
      lowStockCount,
      lowIngredientCount,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}