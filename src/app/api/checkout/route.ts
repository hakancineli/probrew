import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { creem } from '@/lib/creem';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://probrew.com.tr';

export async function POST(request: NextRequest) {
  console.log('--- Checkout API [REFINED v2] Started ---');
  try {
    const body = await request.json();
    const { productId, customerEmail } = body;

    const rawApiKey = process.env.CREEM_API_KEY || '';
    const apiKey = rawApiKey.trim();
    
    if (!apiKey) {
      console.error('CRITICAL: CREEM_API_KEY is missing or empty after trim');
      return NextResponse.json({ error: 'Sistem hatası: API anahtarı boş' }, { status: 500 });
    }

    const isTestKey = apiKey.startsWith('creem_test_');
    const baseUrl = isTestKey ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';

    // Mask for logs & response
    const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`[AUTH] Mode: ${isTestKey ? 'TEST' : 'LIVE'} | Key: ${maskedKey}`);

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

    console.log('Final Fetch Request to:', `${baseUrl}/checkouts`);
    console.log('With Header x-api-key length:', apiKey.length);

    const res = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'X-API-KEY': apiKey,
        'User-Agent': 'ProBrew/1.0',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Creem API Rejection (403):', errorData);
      return NextResponse.json({ 
        error: 'Ödeme oturumu engellendi (403)', 
        details: errorData.message || res.statusText,
        trace_id: errorData.trace_id,
        summary: `Gelen anahtar boyutu: ${apiKey.length}, Maske: ${maskedKey}, Mod: ${isTestKey ? 'TEST' : 'LIVE'}`
      }, { status: res.status });
    }

    const data = await res.json();
    console.log('SUCCESS! Checkout created:', data.id);

    return NextResponse.json({ 
      checkoutUrl: data.checkout_url,
      checkoutId: data.id 
    });

  } catch (error: any) {
    console.error('CRITICAL Internal error:', error);
    return NextResponse.json({ error: 'Sistem hatası', details: error.message }, { status: 500 });
  }
}
