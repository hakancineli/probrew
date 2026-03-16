import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allMenuItems } from '@/data/menuItems';
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

export async function POST(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const results = [];

        // Get all products from DB for THIS business
        const dbProducts = await prisma.product.findMany({
            where: { businessId: user.businessId }
        });

        for (const dbProduct of dbProducts) {
            // Find matching item in static data
            const staticItem = allMenuItems.find(m => m.name === dbProduct.name);

            if (staticItem && staticItem.sizes && staticItem.sizes.length > 0) {
                // Update DB product with sizes
                await prisma.product.update({
                    where: { id: dbProduct.id },
                    data: {
                        prices: staticItem.sizes // This stores as JSON
                    }
                });
                results.push({ name: dbProduct.name, status: 'updated', sizes: staticItem.sizes.length });
            } else {
                results.push({ name: dbProduct.name, status: 'skipped (no sizes)' });
            }
        }

        return NextResponse.json({
            message: 'Migration completed',
            total: dbProducts.length,
            updated: results.filter(r => r.status === 'updated').length,
            details: results
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
    }
}
