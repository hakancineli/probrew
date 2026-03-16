import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { realtimeBus } from '@/lib/events';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const today = searchParams.get('today') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {
      businessId: user.businessId,
      isDeleted: false
    };

    if (today) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    if (status && status !== 'all') {
      const allowedStatuses = status.includes(',')
        ? status.split(',')
        : [status];
      where.status = { in: allowedStatuses as any };
    }

    if (search) {
      where.AND = [
        { isDeleted: false },
        {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
            { customerPhone: { contains: search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
          table: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual order creation via Admin Panel (if needed)
export async function POST(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      paymentMethod,
      notes,
    } = body;

    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name and items are required' },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );

    // --- STRICT INGREDIENT STOCK VALIDATION ---
    const UNIT_BASED_CATEGORIES = ['Meşrubatlar']; // Categories that don't require recipes

    for (const item of items) {
      const productId = item.productId.toString();

      // Get product info to check category
      const product = await prisma.product.findFirst({
        where: { id: productId, businessId: user.businessId }
      });

      if (!product) {
        return NextResponse.json({
          error: `Ürün bulunamadı: "${item.productName}"`
        }, { status: 400 });
      }

      // Find recipe for this product
      let recipe = await prisma.recipe.findFirst({
        where: { productId, OR: [{ size: item.size }, { size: null }] },
        include: { items: { include: { ingredient: true } } },
        orderBy: { size: 'desc' }
      });

      if (recipe) {
        for (const ri of recipe.items) {
          const requiredQty = (Number(ri.quantity) || 0) * (Number(item.quantity) || 0);
          if (ri.ingredient.stock < requiredQty) {
            return NextResponse.json({
              error: `Yetersiz Hammadde: "${ri.ingredient.name}" tükendiği için "${item.productName}" satılamaz! (Kalan: ${ri.ingredient.stock.toFixed(2)} ${ri.ingredient.unit})`
            }, { status: 400 });
          }
        }
      } else if (UNIT_BASED_CATEGORIES.includes(product.category)) {
        // Unit-based products: check product stock directly
        if (product.stock < item.quantity) {
          return NextResponse.json({
            error: `Yetersiz Stok: "${product.name}" tükenmiş! (Kalan: ${product.stock})`
          }, { status: 400 });
        }
      } else {
        // No recipe = Product cannot be ordered
        return NextResponse.json({
          error: `"${item.productName}" için reçete tanımlı değil! Lütfen önce ürün reçetesini oluşturun.`
        }, { status: 400 });
      }
    }
    // --- END VALIDATION ---

    // Generate NC- format order number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `NC-${timestamp}-${random}`;

    const finalAmount = Number(body.finalAmount) || totalAmount;
    const discountAmount = Number(body.discountAmount) || 0;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        businessId: user.businessId,
        customerName,
        customerPhone,
        customerEmail,
        totalAmount,
        finalAmount,
        discountAmount,
        paymentMethod: paymentMethod || null,
        notes,
        status: body.status || 'PENDING',
        paymentStatus: (body.status === 'COMPLETED' || paymentMethod) ? 'COMPLETED' : 'PENDING',
        payments: {
          create: {
            amount: finalAmount,
            method: paymentMethod || 'CASH',
            status: (body.status === 'COMPLETED' || paymentMethod) ? 'COMPLETED' : 'PENDING',
          }
        },
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            size: item.size,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
            notes: item.notes,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Increment Sales & Decrement Ingredient/Product Stock
    try {
      for (const item of items) {
        let normalizedSize = item.size;
        if (normalizedSize === 'S') normalizedSize = 'Small';
        if (normalizedSize === 'M') normalizedSize = 'Medium';
        if (normalizedSize === 'L') normalizedSize = 'Large';

        let recipe = await prisma.recipe.findUnique({
          where: {
            productId_size: {
              productId: item.productId.toString(),
              size: normalizedSize || 'Medium'
            }
          },
          include: {
            items: { include: { ingredient: true } }
          }
        });

        if (!recipe) {
          recipe = await prisma.recipe.findFirst({
            where: {
              productId: item.productId.toString(),
              size: null
            },
            include: {
              items: { include: { ingredient: true } }
            }
          });
        }

        if (recipe) {
          await prisma.product.update({
            where: { id: item.productId.toString() },
            data: { soldCount: { increment: Number(item.quantity) || 0 } }
          });

          for (const recipeItem of recipe.items) {
            const totalQuantityNeeded = (Number(recipeItem.quantity) || 0) * (Number(item.quantity) || 0);
            await prisma.ingredient.update({
              where: { id: recipeItem.ingredientId },
              data: { stock: { decrement: totalQuantityNeeded } }
            });
          }
        } else {
          await prisma.product.update({
            where: { id: item.productId.toString() },
            data: {
              stock: { decrement: Number(item.quantity) || 0 },
              soldCount: { increment: Number(item.quantity) || 0 }
            }
          });
        }
      }
    } catch (stockError) {
      console.error('Failed to update stock:', stockError);
    }

    // Dispatch realtime event
    realtimeBus.publish(user.businessId, 'NEW_ORDER', {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      totalAmount: order.totalAmount
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}