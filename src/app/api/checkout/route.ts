import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { creem } from '@/lib/creem';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://probrew.com.tr';

export async function POST(request: NextRequest) {
  try {
    const { productId, customerEmail, customerName } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID gereklidir' },
        { status: 400 }
      );
    }

    // Try to get authenticated user to attach business mapping
    let userId = null;
    let businessId = null;
    const token = request.cookies.get('auth-token')?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        if (decoded && decoded.userId) {
           userId = decoded.userId;
           // If user is staff/manager, get their business
           const staff = await prisma.barista.findUnique({ where: { id: userId }, select: { businessId: true } });
           if (staff) {
               businessId = staff.businessId;
           }
        }
      } catch (e) {
        console.log('Skipping auth check for checkout payload mapping', e);
      }
    }

    const payload: any = {
      productId: productId,
      successUrl: `${APP_URL}/odeme-basarili`,
      metadata: {
         userId: userId || undefined,
         businessId: businessId || undefined
      }
    };

    if (customerEmail) {
      payload.customer = { email: customerEmail };
    }

    const checkout = await creem.checkouts.create(payload);

    return NextResponse.json({ 
      checkoutUrl: checkout.checkoutUrl,
      checkoutId: checkout.id 
    });
  } catch (error: any) {
    console.error('Checkout error:', error.message || error);
    return NextResponse.json(
      { error: 'Ödeme oturumu oluşturulamadı', details: error.message || error },
      { status: 500 }
    );
  }
}
