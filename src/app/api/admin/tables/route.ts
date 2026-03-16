import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const businessId = request.headers.get('x-business-id');
    if (!businessId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tables = await prisma.table.findMany({
      where: { businessId },
      orderBy: { name: 'asc' }
    });

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { slug: true }
    });

    return NextResponse.json({ tables, businessSlug: business?.slug });
  } catch (error) {
    console.error('Tables fetch error:', error);
    return NextResponse.json({ error: 'Tables fetch error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const businessId = request.headers.get('x-business-id');
    const { name, capacity } = await request.json();

    if (!businessId || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const table = await prisma.table.create({
      data: {
        businessId,
        name,
        capacity: Number(capacity) || 2,
        status: 'AVAILABLE'
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json({ error: 'Table creation error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, capacity, status } = await request.json();
    
    const table = await prisma.table.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(status && { status })
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    return NextResponse.json({ error: 'Table update error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Table deletion error' }, { status: 500 });
  }
}
