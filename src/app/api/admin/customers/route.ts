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

export async function GET(request: NextRequest) {
  try {
    const adminUser = getUser(request);
    if (!adminUser?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      businessId: adminUser.businessId,
      email: {
        notIn: ['admin@probrew.com.tr', 'kitchen@probrew.com.tr']
      }
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users with their orders and points
    const [users, total] = await Promise.all([
      (prisma as any).user.findMany({
        where,
        include: {
          userPoints: true,
          orders: {
            where: { businessId: adminUser.businessId },
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: { orders: { where: { businessId: adminUser.businessId } } }
          },
          pointTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).user.count({ where }),
    ]);

    // Calculate additional stats
    const usersWithStats = users.map((user: any) => ({
      ...user,
      totalOrders: user._count.orders,
      totalSpent: user.orders.reduce((sum: number, order: any) => sum + (Number(order.totalAmount) || 0), 0),
      lastOrderDate: user.orders[0]?.createdAt || null,
      recentTransactions: user.pointTransactions.slice(0, 5),
    }));

    return NextResponse.json({
      customers: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Customers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = getUser(request);
    if (!adminUser?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      phone,
      birthDate,
      initialPoints,
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await (prisma as any).user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await (prisma as any).user.create({
      data: {
        businessId: adminUser.businessId,
        email,
        passwordHash: 'PB_GUEST_ACCOUNT',
        firstName,
        lastName,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
      include: {
        userPoints: true,
      },
    });

    // Create initial points if provided
    const pointsValue = parseInt(initialPoints?.toString() || '0');
    if (pointsValue > 0) {
      await (prisma as any).userPoints.upsert({
        where: { userId: user.id },
        update: { points: { increment: pointsValue } },
        create: {
          userId: user.id,
          points: pointsValue,
          tier: 'BRONZE',
        },
      });

      await (prisma as any).pointTransaction.create({
        data: {
          userId: user.id,
          points: pointsValue,
          transactionType: 'BONUS',
          description: 'Başlangıç puanı',
        },
      });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}