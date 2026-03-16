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

export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user?.businessId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await prisma.systemSettings.findUnique({
      where: { businessId: user.businessId }
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Settings fetch error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user?.businessId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = user.businessId;
    const body = await request.json();
    const { 
      brandName, 
      primaryColor, 
      secondaryColor, 
      logoUrl, 
      loyaltyEnabled, 
      isKitchenEnabled, 
      isInventoryEnabled, 
      isShiftEnabled,
      orderNotificationEmail,
      activeTheme
    } = body;

    const settings = await prisma.systemSettings.upsert({
      where: { businessId },
      update: {
        brandName,
        primaryColor,
        secondaryColor,
        logoUrl,
        loyaltyEnabled,
        isKitchenEnabled,
        isInventoryEnabled,
        isShiftEnabled,
        orderNotificationEmail,
        activeTheme
      },
      create: {
        businessId,
        brandName,
        primaryColor,
        secondaryColor,
        logoUrl,
        loyaltyEnabled,
        isKitchenEnabled,
        isInventoryEnabled,
        isShiftEnabled,
        orderNotificationEmail,
        activeTheme
      }
    });

    // Sync business table branding
    await prisma.business.update({
      where: { id: businessId },
      data: {
        name: brandName || undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Settings update error' }, { status: 500 });
  }
}
