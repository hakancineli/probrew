import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { creem } from '@/lib/creem';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://probrew.com.tr';

export async function POST(request: NextRequest) {
  console.log('--- Checkout API [FINAL PUSH] Started ---');
  try {
    const body = await request.json();
    const { productId, customerEmail } = body;

    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      console.error('CRITICAL: CREEM_API_KEY is undefined in Vercel');
      return NextResponse.json({ error: 'Sistem hatası: API anahtarı yüklenemedi' }, { status: 500 });
    }

    const isTestKey = apiKey.startsWith('creem_test_');
    const baseUrl = isTestKey ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';

    // Verification Logs for User (Masked)
    const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`Verifying Mode: ${isTestKey ? 'TEST' : 'LIVE'} | Key: ${maskedKey}`);

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
    };

    if (Object.keys(metadata).length > 0) requestPayload.metadata = metadata;
    if (customerEmail) requestPayload.customer = { email: customerEmail };

    const res = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'X-API-KEY': apiKey, // Case variation
        'User-Agent': 'creem-sdk-node/0.5.0', // Mimic SDK
        'Origin': APP_URL,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Creem API Error Response (403):', errorData);
      return NextResponse.json({ 
        error: 'Ödeme oturumu oluşturulamadı (Creem)', 
        details: errorData.message || res.statusText,
        trace_id: errorData.trace_id,
        masked_key: maskedKey
      }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ 
      checkoutUrl: data.checkout_url,
      checkoutId: data.id 
    });

  } catch (error: any) {
    console.error('CRITICAL Checkout error:', error.message || error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu', details: error.message }, { status: 500 });
  }
}
