import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const tableId = searchParams.get('tableId');

    const where: any = { businessId: user.businessId };

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.reservationDate = { gte: start, lt: end };
    }

    if (tableId) {
      where.tableId = tableId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: { table: { select: { id: true, name: true, capacity: true } } },
      orderBy: [{ reservationDate: 'asc' }, { reservationTime: 'asc' }],
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Reservations GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tableId, customerName, customerPhone, guestCount, reservationDate, reservationTime, endTime, notes } = body;

    if (!customerName || !reservationDate || !reservationTime || !guestCount) {
      return NextResponse.json({ error: 'Eksik bilgi: Müşteri adı, tarih, saat ve kişi sayısı gerekli.' }, { status: 400 });
    }

    // Check for conflicts on same table, same date, overlapping time
    if (tableId) {
      const dateStart = new Date(reservationDate);
      const dateEnd = new Date(reservationDate);
      dateEnd.setDate(dateEnd.getDate() + 1);

      const existing = await prisma.reservation.findMany({
        where: {
          tableId,
          reservationDate: { gte: dateStart, lt: dateEnd },
          status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] },
        },
      });

      // Simple time overlap check
      const newStart = reservationTime;
      const newEnd = endTime || addHours(reservationTime, 2); // default 2 hours

      const conflict = existing.find((r) => {
        const rEnd = r.endTime || addHours(r.reservationTime, 2);
        return newStart < rEnd && newEnd > r.reservationTime;
      });

      if (conflict) {
        return NextResponse.json(
          { error: `Bu masa ${conflict.reservationTime} - ${conflict.endTime || addHours(conflict.reservationTime, 2)} arası zaten rezerve.` },
          { status: 409 }
        );
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        businessId: user.businessId,
        tableId: tableId || null,
        customerName,
        customerPhone: customerPhone || null,
        guestCount: parseInt(guestCount),
        reservationDate: new Date(reservationDate),
        reservationTime,
        endTime: endTime || null,
        notes: notes || null,
      },
      include: { table: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error('Reservations POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, tableId, customerName, customerPhone, guestCount, reservationDate, reservationTime, endTime, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rezervasyon ID gerekli.' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (tableId !== undefined) updateData.tableId = tableId || null;
    if (customerName) updateData.customerName = customerName;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone || null;
    if (guestCount) updateData.guestCount = parseInt(guestCount);
    if (reservationDate) updateData.reservationDate = new Date(reservationDate);
    if (reservationTime) updateData.reservationTime = reservationTime;
    if (endTime !== undefined) updateData.endTime = endTime || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const reservation = await prisma.reservation.update({
      where: { id, businessId: user.businessId },
      data: updateData,
      include: { table: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Reservations PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });
    }

    await prisma.reservation.delete({
      where: { id, businessId: user.businessId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reservations DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Helper: add hours to time string "HH:MM"
function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const newH = (h + hours) % 24;
  return `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
