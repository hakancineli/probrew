import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const businessId = request.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const ingredientId = searchParams.get('ingredientId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        businessId,
        ...(ingredientId ? { ingredientId } : {})
      },
      include: {
        ingredient: { select: { name: true, unit: true } },
        product: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory logs' }, { status: 500 });
  }
}
