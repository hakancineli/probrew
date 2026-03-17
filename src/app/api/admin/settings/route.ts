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

    const businessId = user.businessId;

    let settings = await prisma.systemSettings.findUnique({
      where: { businessId },
      include: {
        business: {
          select: { name: true, slug: true, primaryColor: true, logoUrl: true }
        }
      }
    });

    // Lazy initialization for existing businesses without settings
    if (!settings) {
      const business = await prisma.business.findUnique({
        where: { id: businessId }
      });

      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }

      settings = await prisma.systemSettings.create({
        data: {
          businessId: businessId,
          brandName: business.name,
          primaryColor: business.primaryColor,
          logoUrl: business.logoUrl,
        },
        include: {
          business: { select: { slug: true } }
        }
      }) as any;
    }

    const response = {
        ...settings,
        brandName: settings?.brandName || settings?.business?.name,
        logoUrl: settings?.logoUrl || settings?.business?.logoUrl,
        primaryColor: settings?.primaryColor || settings?.business?.primaryColor,
        slug: (settings as any).business?.slug
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Settings fetch error:', error);
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
      activeTheme,
      isPaymentEnabled,
      officialName,
      officialAddress,
      officialPhone,
      taxOffice,
      taxNumber,
      isTableTransferEnabled
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
        activeTheme,
        isPaymentEnabled,
        officialName,
        officialAddress,
        officialPhone,
        taxOffice,
        taxNumber,
        isTableTransferEnabled
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
        activeTheme,
        isPaymentEnabled,
        officialName,
        officialAddress,
        officialPhone,
        taxOffice,
        taxNumber,
        isTableTransferEnabled
      }
    });

    // Sync business table branding
    await prisma.business.update({
      where: { id: businessId },
      data: {
        name: brandName || undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        primaryColor: primaryColor || undefined
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Settings update error' }, { status: 500 });
  }
}
