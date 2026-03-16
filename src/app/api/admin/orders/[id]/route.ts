import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { verifyToken } from '@/lib/auth';
import { realtimeBus } from '@/lib/events';

// Type definitions
type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUser(request);
    if (!user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        businessId: user.businessId,
        isDeleted: false
      },
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUser(request);
    if (!user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      status,
      notes,
      customerName,
      customerEmail,
      customerPhone,
      finalAmount,
      paymentMethod,
      staffPin
    } = body;

    // Staff PIN verification (Kitchen Performance Tracking)
    let verifiedStaffId: string | undefined;
    if (staffPin) {
      const staff = await prisma.barista.findFirst({
        where: {
          pinCode: staffPin,
          isActive: true,
          businessId: user.businessId
        }
      });
      if (!staff) {
        return NextResponse.json(
          { error: 'Hatalı Personel PIN kodu!' },
          { status: 400 }
        );
      }
      verifiedStaffId = staff.id;
    }

    // Validate status if provided
    const validStatuses: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get current order state for logging
    const currentOrder = await prisma.order.findFirst({
      where: { id: params.id, businessId: user.businessId },
      include: { payments: true }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (finalAmount !== undefined) updateData.finalAmount = parseFloat(finalAmount.toString());
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (verifiedStaffId) updateData.preparedById = verifiedStaffId;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: true,
      },
    });

    // Handle Audit Logging
    const changes: any = {};
    if (status && status !== currentOrder.status) changes.status = { from: currentOrder.status, to: status };
    if (customerName && customerName !== currentOrder.customerName) changes.customerName = { from: currentOrder.customerName, to: customerName };
    if (finalAmount && parseFloat(finalAmount.toString()) !== currentOrder.finalAmount) changes.finalAmount = { from: currentOrder.finalAmount, to: finalAmount };

    if (Object.keys(changes).length > 0) {
      await createAuditLog({
        action: 'UPDATE_ORDER',
        entity: 'Order',
        entityId: params.id,
        businessId: user.businessId,
        oldData: changes,
        newData: updateData,
        userId: user.userId,
        userEmail: user.email
      });
    }

    // Handle Payment Status Sync
    if (status === 'COMPLETED' || (paymentMethod && !status)) {
      const existingPayments = await prisma.payment.findMany({
        where: { orderId: params.id }
      });

      if (existingPayments.length > 0) {
        await prisma.payment.updateMany({
          where: { orderId: params.id },
          data: {
            status: 'COMPLETED',
            amount: updateData.finalAmount || order.finalAmount,
            method: updateData.paymentMethod || order.paymentMethod || 'CASH'
          }
        });
      } else {
        await prisma.payment.create({
          data: {
            orderId: params.id,
            amount: order.finalAmount,
            method: order.paymentMethod || 'CASH',
            status: 'COMPLETED'
          }
        });
      }
    } else if (status === 'CANCELLED') {
      await prisma.payment.updateMany({
        where: { orderId: params.id },
        data: { status: 'FAILED' }
      });
    }

    // Dispatch realtime event
    realtimeBus.publish(user.businessId, 'ORDER_STATUS_CHANGED', {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName || 'Misafir',
      finalAmount: order.finalAmount,
      isLatest: true
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUser(request);
    if (!user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get order details before delete for logging
    const orderToDelete = await prisma.order.findFirst({
      where: { id: params.id, businessId: user.businessId },
      include: { orderItems: true, payments: true }
    });

    if (!orderToDelete) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Soft delete order
    await prisma.order.update({
      where: { id: params.id },
      data: { isDeleted: true }
    });

    // Log the sensitive action
    await createAuditLog({
      action: 'DELETE_ORDER',
      entity: 'Order',
      entityId: params.id,
      businessId: user.businessId,
      oldData: orderToDelete,
      newData: { isDeleted: true },
      userId: user.userId,
      userEmail: user.email
    });

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Order deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}