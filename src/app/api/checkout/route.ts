import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { creem } from '@/lib/creem';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://probrew.com.tr';

export async function POST(request: NextRequest) {
  console.log('--- Checkout API Started ---');
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { productId, customerEmail, customerName } = body;

    if (!productId) {
      console.error('Missing productId');
      return NextResponse.json(
        { error: 'Product ID gereklidir' },
        { status: 400 }
      );
    }

    // Try to get authenticated user to attach business mapping
    let userId = null;
    let businessId = null;
    const token = request.cookies.get('auth-token')?.value;
    console.log('Auth token present:', !!token);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        if (decoded && decoded.userId) {
           userId = decoded.userId;
           console.log('User ID from token:', userId);
           // If user is staff/manager, get their business
           const staff = await prisma.barista.findUnique({ where: { id: userId }, select: { businessId: true } });
           if (staff) {
               businessId = staff.businessId;
               console.log('Business ID found for staff:', businessId);
           }
        }
      } catch (e) {
        console.warn('JWT verification or Prisma lookup failed (non-critical):', e);
      }
    }

    // Sanitize metadata: only include keys that have values
    const metadata: any = {};
    if (userId) metadata.userId = userId;
    if (businessId) metadata.businessId = businessId;

    const payload: any = {
      productId: productId,
      successUrl: `${APP_URL}/odeme-basarili`,
    };

    if (Object.keys(metadata).length > 0) {
      payload.metadata = metadata;
    }

    if (customerEmail) {
      payload.customer = { email: customerEmail };
    }

    console.log('Creating checkout with payload:', JSON.stringify(payload, null, 2));
    
    // Check if SDK instance exists
    if (!creem) {
      throw new Error('Creem SDK is not initialized');
    }

    const checkout = await creem.checkouts.create(payload);
    console.log('Checkout created successfully:', checkout.id);

    return NextResponse.json({ 
      checkoutUrl: checkout.checkoutUrl,
      checkoutId: checkout.id 
    });
  } catch (error: any) {
    const errorMsg = error.message || String(error);
    console.error('CRITICAL Checkout error:', errorMsg);
    
    // If it's a Creem API error, it might have more details
    return NextResponse.json(
      { 
        error: 'Ödeme oturumu oluşturulamadı', 
        details: errorMsg,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
}
