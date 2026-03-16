import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get current active shift for a register
export async function GET(request: NextRequest) {
  try {
    const businessId = request.headers.get('x-business-id');
    const registerId = request.nextUrl.searchParams.get('registerId');

    if (!businessId || !registerId) {
      return NextResponse.json({ error: 'Missing businessId or registerId' }, { status: 400 });
    }

    const activeShift = await prisma.shift.findFirst({
      where: {
        businessId,
        registerId,
        status: 'OPEN'
      },
      include: {
        staff: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ activeShift });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shift' }, { status: 500 });
  }
}

// POST - Open Shift
export async function POST(request: NextRequest) {
  try {
    const businessId = request.headers.get('x-business-id');
    const { registerId, staffId, openingBalance, notes } = await request.json();

    if (!businessId || !registerId || !staffId || openingBalance === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if there is already an open shift
    const existingShift = await prisma.shift.findFirst({
      where: { registerId, status: 'OPEN' }
    });

    if (existingShift) {
      return NextResponse.json({ error: 'Bu kasada zaten açık bir vardiya var.' }, { status: 400 });
    }

    const shift = await prisma.shift.create({
      data: {
        businessId,
        registerId,
        staffId,
        openingBalance: Number(openingBalance),
        notes,
        status: 'OPEN'
      }
    });

    // Log Cash Movement for Opening
    await prisma.cashMovement.create({
      data: {
        businessId,
        registerId,
        shiftId: shift.id,
        amount: Number(openingBalance),
        type: 'IN',
        reason: 'SHIFT_OPEN',
        notes: 'Vardiya açılış bakiyesi'
      }
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error('Open shift error:', error);
    return NextResponse.json({ error: 'Vardiya açılamadı.' }, { status: 500 });
  }
}

// PATCH - Close Shift (Z-Report)
export async function PATCH(request: NextRequest) {
  try {
    const businessId = request.headers.get('x-business-id');
    const { shiftId, actualCash, notes } = await request.json();

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        register: true,
        movements: {
          where: { reason: 'SALE' }
        }
      }
    });

    if (!shift || shift.status === 'CLOSED') {
      return NextResponse.json({ error: 'Geçersiz veya kapalı vardiya.' }, { status: 400 });
    }

    // Calculate totals
    const totalSales = shift.movements.reduce((sum, m) => sum + m.amount, 0);
    const expectedCash = shift.openingBalance + totalSales;
    const difference = Number(actualCash) - expectedCash;

    const closedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closingBalance: Number(actualCash),
        expectedCash,
        actualCash: Number(actualCash),
        difference,
        notes: notes || shift.notes
      }
    });

    // Update global register balance
    await prisma.cashRegister.update({
      where: { id: shift.registerId },
      data: { currentBalance: Number(actualCash) }
    });

    return NextResponse.json({
      success: true,
      report: {
        openingBalance: shift.openingBalance,
        totalSales,
        expectedCash,
        actualCash: Number(actualCash),
        difference
      }
    });
  } catch (error) {
    console.error('Close shift error:', error);
    return NextResponse.json({ error: 'Vardiya kapatılamadı.' }, { status: 500 });
  }
}
