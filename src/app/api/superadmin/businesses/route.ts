import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all businesses
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businesses = await prisma.business.findMany({
      include: {
        _count: {
          select: {
            baristas: true,
            products: true,
            orders: true,
          }
        },
        orders: {
            where: { isDeleted: false, status: 'COMPLETED' },
            select: { finalAmount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map revenue to each business
    const businessesWithRevenue = businesses.map(b => {
        const revenue = b.orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
        const { orders, ...rest } = b; // Don't send full orders array
        return { ...rest, totalRevenue: revenue };
    });

    return NextResponse.json(businessesWithRevenue);
  } catch (error) {
    console.error('Superadmin fetch businesses error:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}

// POST - Create new business (Onboarding)
export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, contactEmail, contactPhone, initialManagerPassword } = body;

    if (!name || !slug || !contactEmail || !initialManagerPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Business
      const business = await tx.business.create({
        data: {
          name,
          slug,
          contactEmail,
          contactPhone,
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        }
      });

      // 2. Create Manager
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(initialManagerPassword, 10);
      
      const manager = await tx.barista.create({
        data: {
          name: `${name} Manager`,
          email: contactEmail,
          passwordHash,
          role: 'MANAGER',
          businessId: business.id,
          isActive: true,
        }
      });

      // 3. Create System Settings
      await tx.systemSettings.create({
        data: {
          businessId: business.id,
          brandName: name,
          isKitchenEnabled: true,
          isInventoryEnabled: true,
          isShiftEnabled: true,
          loyaltyEnabled: false,
        }
      });

      // 4. Create Default Cash Register (Ana Kasa)
      await tx.cashRegister.create({
        data: {
          businessId: business.id,
          name: 'Ana Kasa'
        }
      });

      // 5. Create Default Tables (Onboarding Kit)
      const defaultTables = [
        { name: 'Masa 1', capacity: 2 },
        { name: 'Masa 2', capacity: 2 },
        { name: 'Masa 3', capacity: 4 },
        { name: 'Bar 1', capacity: 1 },
      ];

      for (const table of defaultTables) {
         await tx.table.create({
            data: {
               businessId: business.id,
               name: table.name,
               capacity: table.capacity,
               status: 'AVAILABLE'
            }
         });
      }

      return { business, manager };
    });

    return NextResponse.json({ 
      success: true, 
      business: result.business,
      managerId: result.manager.id 
    });

  } catch (error: any) {
    console.error('Business creation error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Bu slug veya email zaten kullanımda.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'İşletme oluşturulamadı.' }, { status: 500 });
  }
}
