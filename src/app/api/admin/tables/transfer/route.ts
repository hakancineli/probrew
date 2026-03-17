import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

export async function POST(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceTableId, targetTableId } = await request.json();

    if (!sourceTableId || !targetTableId) {
      return NextResponse.json({ error: 'Source and target table IDs are required' }, { status: 400 });
    }

    // Find active orders on the source table
    const orders = await prisma.order.findMany({
      where: {
        tableId: sourceTableId,
        businessId: user.businessId,
        status: { in: ['PENDING', 'PREPARING', 'READY'] }
      }
    });

    if (orders.length === 0) {
      return NextResponse.json({ error: 'No active orders found on the source table' }, { status: 404 });
    }

    // Update all active orders to the target table
    await prisma.order.updateMany({
      where: {
        id: { in: orders.map(o => o.id) }
      },
      data: {
        tableId: targetTableId
      }
    });

    // Update table statuses
    await prisma.table.update({
      where: { id: sourceTableId },
      data: { status: 'AVAILABLE' }
    });

    await prisma.table.update({
      where: { id: targetTableId },
      data: { status: 'OCCUPIED' }
    });

    return NextResponse.json({ success: true, transferredOrders: orders.length });
  } catch (error) {
    console.error('Table transfer error:', error);
    return NextResponse.json({ error: 'Failed to transfer table' }, { status: 500 });
  }
}
