import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const CREEM_API_KEY = process.env.CREEM_API_KEY!;
const CREEM_BASE_URL = process.env.CREEM_TEST_MODE === 'true' ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';
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

    const checkoutPayload: Record<string, unknown> = {
      product_id: productId,
      success_url: `${APP_URL}/odeme-basarili`,
      metadata: {
        userId: userId || undefined,
        businessId: businessId || undefined
      }
    };

    if (customerEmail) {
      checkoutPayload.customer = { email: customerEmail };
    }

    const response = await fetch(`${CREEM_BASE_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_API_KEY,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Creem API error:', errorData);
      return NextResponse.json(
        { error: 'Ödeme oturumu oluşturulamadı', details: errorData },
        { status: response.status }
      );
    }

    const checkout = await response.json();

    return NextResponse.json({ 
      checkoutUrl: checkout.checkout_url,
      checkoutId: checkout.id 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Ödeme oturumu oluşturulamadı' },
      { status: 500 }
    );
  }
}
