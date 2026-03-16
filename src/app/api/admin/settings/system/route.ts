import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value || 
                     request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = verifyToken(token);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await prisma.systemSettings.upsert({
            where: { businessId: user.businessId },
            update: {},
            create: {
                businessId: user.businessId,
                loyaltyEnabled: false,
                loyaltyDiscountRate: 50,
                isKitchenEnabled: true,
                isInventoryEnabled: true,
                isShiftEnabled: true
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Fetch settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value || 
                     request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = verifyToken(token);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { loyaltyEnabled, loyaltyDiscountRate, isKitchenEnabled, isInventoryEnabled, isShiftEnabled, brandName } = body;

        const settings = await prisma.systemSettings.upsert({
            where: { businessId: user.businessId },
            update: {
                loyaltyEnabled: !!loyaltyEnabled,
                loyaltyDiscountRate: parseFloat(loyaltyDiscountRate) || 50,
                isKitchenEnabled: isKitchenEnabled !== undefined ? !!isKitchenEnabled : true,
                isInventoryEnabled: isInventoryEnabled !== undefined ? !!isInventoryEnabled : true,
                isShiftEnabled: isShiftEnabled !== undefined ? !!isShiftEnabled : true,
                brandName: brandName || undefined
            },
            create: {
                businessId: user.businessId,
                loyaltyEnabled: !!loyaltyEnabled,
                loyaltyDiscountRate: parseFloat(loyaltyDiscountRate) || 50,
                isKitchenEnabled: isKitchenEnabled !== undefined ? !!isKitchenEnabled : true,
                isInventoryEnabled: isInventoryEnabled !== undefined ? !!isInventoryEnabled : true,
                isShiftEnabled: isShiftEnabled !== undefined ? !!isShiftEnabled : true,
                brandName: brandName || undefined
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
