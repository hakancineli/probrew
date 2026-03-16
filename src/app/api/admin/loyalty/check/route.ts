import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
        const adminUser = getUser(request);
        if (!adminUser?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { pin } = body;

        if (!pin || pin.length !== 4) {
            return NextResponse.json({ error: 'Geçersiz PIN' }, { status: 400 });
        }

        // 1. Get Campaign Settings for this business
        const settings = await prisma.systemSettings.findFirst({
            where: { businessId: adminUser.businessId }
        });

        if (!settings || !settings.loyaltyEnabled) {
            return NextResponse.json({
                eligible: false,
                message: 'Sadakat kampanyası şu anda aktif değil.'
            });
        }

        // 2. Find User by PIN - Scoped to this business
        const user = await prisma.user.findFirst({
            where: {
                loyaltyPin: pin,
                businessId: adminUser.businessId
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
            }
        });

        if (!user) {
            return NextResponse.json({
                eligible: false,
                message: 'Bu PIN koduna ait kullanıcı bulunamadı.'
            });
        }

        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

        // 3. Check for today's orders
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const lastOrder = await prisma.order.findFirst({
            where: {
                userId: user.id,
                businessId: adminUser.businessId,
                createdAt: { gte: startOfDay },
                status: 'COMPLETED'
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!lastOrder) {
            return NextResponse.json({
                eligible: false,
                user,
                message: `Hoş geldiniz ${fullName}! Bugünün ilk alımını yaptıktan sonra 2. içeceğiniz %${settings.loyaltyDiscountRate} indirimli olacak!`
            });
        }

        // Find the qualifying drink price from the last order
        const nonBeverageCategories = ['Tatlılar', 'Tozlar', 'Ekstralar', 'Yan Ürünler', 'Atıştırmalıklar'];
        const drinks = lastOrder.orderItems.filter(item =>
            item.product && !nonBeverageCategories.includes(item.product.category)
        );

        // Use the highest unit price among beverages in that order as our reference for "1st drink"
        const lastDrinkPrice = drinks.length > 0
            ? Math.max(...drinks.map(d => Number(d.unitPrice) || 0))
            : 0;

        // 4. Check Cooldown (1 hour) and Window (12 hours)
        const orderTime = new Date(lastOrder.createdAt);
        const diffMs = now.getTime() - orderTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 1) {
            const remainingMinutes = Math.ceil(60 - (diffMs / (1000 * 60)));
            return NextResponse.json({
                eligible: false,
                isCooldown: true,
                user,
                remainingMinutes,
                message: `Hoş geldiniz ${fullName}! İndirim hakkınız için son ${remainingMinutes} dakikanız, beklemeye değer!`
            });
        }

        if (diffHours > 12) {
            return NextResponse.json({
                eligible: false,
                user,
                message: `Hoş geldiniz ${fullName}! Son siparişinizin üzerinden 12 saat geçmiş, yeni bir hak için ilk alımınızı yapmanız gerekiyor.`
            });
        }

        // 5. Eligible!
        return NextResponse.json({
            eligible: true,
            user,
            discountRate: settings.loyaltyDiscountRate,
            lastDrinkPrice: lastDrinkPrice,
            hasLoyaltyDiscount: (Number(lastOrder.discountAmount) || 0) > 0,
            message: `Hoş geldiniz ${fullName}! Bugünün 2. kahvesi bizden, %${settings.loyaltyDiscountRate} indiriminiz hazır!`
        });

    } catch (error) {
        console.error('Loyalty check error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
