import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        primaryColor: true,
        systemSettings: {
          select: {
            brandName: true,
            primaryColor: true,
            secondaryColor: true,
            logoUrl: true,
            isKitchenEnabled: true,
            isPaymentEnabled: true,
            activeTheme: true,
            // Exclude fields that might be missing in DB if push failed
          }
        },
      }
    });

    if (!business) {
        console.log(`[API] Business not found: ${params.slug}`);
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    console.error(`[API] Public business fetch error (${params.slug}):`, error.message);
    
    // Fallback: Try fetching just the business basics if systemSettings is the culprit
    try {
        const basicBusiness = await prisma.business.findUnique({
            where: { slug: params.slug },
            select: { id: true, name: true, slug: true, logoUrl: true, primaryColor: true }
        });
        if (basicBusiness) return NextResponse.json(basicBusiness);
    } catch (e) {}

    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
