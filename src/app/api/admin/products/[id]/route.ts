import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUser(request);
    if (!user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: { id: params.id, businessId: user.businessId },
      include: {
        recipes: {
          include: {
            items: { include: { ingredient: true } }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
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
      name,
      description,
      category,
      price,
      imageUrl,
      stock,
      isActive,
      unit,
      prices,
    } = body;

    const currentProduct = await prisma.product.findFirst({
      where: { id: params.id, businessId: user.businessId }
    });

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = typeof price === 'number' ? price : parseFloat(price?.toString() || '0');
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (stock !== undefined) updateData.stock = typeof stock === 'number' ? stock : parseInt(stock?.toString() || '0');
    if (isActive !== undefined) updateData.isActive = isActive === 'on' || isActive === 'true' || isActive === true;
    if (unit !== undefined) updateData.unit = unit;
    if (prices !== undefined) updateData.prices = typeof prices === 'string' ? JSON.parse(prices) : prices;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    await createAuditLog({
      action: 'UPDATE_PRODUCT',
      entity: 'Product',
      entityId: params.id,
      businessId: user.businessId,
      oldData: currentProduct,
      newData: product,
      userId: user.userId,
      userEmail: user.email,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
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

    const currentProduct = await prisma.product.findFirst({
      where: { id: params.id, businessId: user.businessId }
    });

    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    await createAuditLog({
      action: 'DELETE_PRODUCT',
      entity: 'Product',
      entityId: params.id,
      businessId: user.businessId,
      oldData: currentProduct,
      userId: user.userId,
      userEmail: user.email,
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}