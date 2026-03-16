import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.trim();
    const active = searchParams.get('active');

    const skip = (page - 1) * limit;

    const where: any = { businessId: user.businessId };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      const searchLower = search.toLowerCase();
      const variations = [search, searchLower];

      if (searchLower.includes('i') || searchLower.includes('ı')) {
        variations.push(searchLower.replace(/i/g, 'ı'));
        variations.push(searchLower.replace(/ı/g, 'i'));
      }

      const uniqueVariations = Array.from(new Set(variations));

      where.OR = [
        ...uniqueVariations.map(v => ({ name: { contains: v, mode: 'insensitive' as const } })),
        ...uniqueVariations.map(v => ({ description: { contains: v, mode: 'insensitive' as const } }))
      ];
    }

    if (active === 'true') {
      where.isActive = true;
    } else if (active === 'false') {
      where.isActive = false;
    }

    const hasRecipe = searchParams.get('hasRecipe');
    if (hasRecipe === 'true') {
      where.recipes = { some: {} };
    } else if (hasRecipe === 'false') {
      where.recipes = { none: {} };
    }

    const sort = searchParams.get('sort');

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'best-sellers') {
      orderBy = { soldCount: 'desc' };
    }

    const [products, total] = await Promise.all([
      (prisma as any).product.findMany({
        where,
        include: {
          recipes: {
            include: {
              items: {
                include: {
                  ingredient: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      (prisma as any).product.count({ where }),
    ]);

    const productsWithSales = products.map((p: any) => {
      let isAvailable = p.stock > 0;

      if (p.recipes && p.recipes.length > 0) {
        isAvailable = p.recipes.some((recipe: any) => {
          return recipe.items.every((ri: any) => {
            if (!ri.ingredient) return true;
            return ri.ingredient.stock >= ri.quantity;
          });
        });
      }

      if (p.stock <= 0 && (!p.recipes || p.recipes.length === 0)) {
        isAvailable = false;
      }

      return {
        ...p,
        salesBySize: [],
        isAvailable,
        hasRecipe: p.recipes && p.recipes.length > 0
      };
    });

    return NextResponse.json({
      products: productsWithSales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      prices
    } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    const product = await (prisma as any).product.create({
      data: {
        businessId: user.businessId,
        name,
        description,
        category,
        price: typeof price === 'number' ? price : parseFloat(price?.toString() || '0'),
        imageUrl,
        stock: typeof stock === 'number' ? stock : parseInt(stock?.toString() || '0'),
        isActive: isActive === 'on' || isActive === 'true' || isActive === true || isActive === undefined,
        unit: unit || 'adet',
        prices: prices ? (typeof prices === 'string' ? JSON.parse(prices) : prices) : null
      },
    });

    await createAuditLog({
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entityId: product.id,
      newData: product,
      userId: user.userId,
      userEmail: user.email,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}