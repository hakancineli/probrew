import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { creem } from '@/lib/creem';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://probrew.com.tr';

export async function POST(request: NextRequest) {
  console.log('--- Checkout API [RETRY RAW FETCH] Started ---');
  try {
    const body = await request.json();
    const { productId, customerEmail } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const apiKey = process.env.CREEM_API_KEY;
    const isTest = process.env.CREEM_TEST_MODE === 'true';
    const baseUrl = isTest ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';

    console.log(`Using Profile: ${isTest ? 'TEST' : 'LIVE'} | Host: ${baseUrl}`);
    console.log(`API Key (first 8): ${apiKey?.substring(0, 8)}...`);

    // Auth & Context
    let userId = null;
    let businessId = null;
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        if (decoded && decoded.userId) {
           userId = decoded.userId;
           const staff = await prisma.barista.findUnique({ where: { id: userId }, select: { businessId: true } });
           if (staff) businessId = staff.businessId;
        }
      } catch (e) {}
    }

    const metadata: any = {};
    if (userId) metadata.userId = userId;
    if (businessId) metadata.businessId = businessId;

    const requestPayload: any = {
      product_id: productId,
      success_url: `${APP_URL}/odeme-basarili`,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined
    };

    if (customerEmail) {
      requestPayload.customer = { email: customerEmail };
    }

    console.log('Raw fetch to:', `${baseUrl}/checkouts`);
    console.log('Payload:', JSON.stringify(requestPayload));

    const res = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Creem API Error Response:', errorData);
      return NextResponse.json({ 
        error: 'Creem API Hatası', 
        details: errorData.message || res.statusText,
        code: res.status 
      }, { status: res.status });
    }

    const data = await res.json();
    console.log('Checkout Created Successfully:', data.id);

    return NextResponse.json({ 
      checkoutUrl: data.checkout_url,
      checkoutId: data.id 
    });

  } catch (error: any) {
    console.error('CRITICAL Checkout error:', error.message || error);
    return NextResponse.json({ 
      error: 'İşlem sırasında bir hata oluştu', 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}
