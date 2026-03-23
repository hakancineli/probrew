import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Frankfurt sunucusundan çalıştır (ABD IP'leri Creem tarafından engelleniyordu)
export const preferredRegion = 'fra1';
export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://probrew.com.tr';

export async function POST(request: NextRequest) {
  console.log('--- Checkout API [FRA1 + NEW KEY] Started ---');
  try {
    const body = await request.json();
    const { productId, customerEmail } = body;

    const rawApiKey = process.env.CREEM_API_KEY || '';
    const apiKey = rawApiKey.trim();

    if (!apiKey) {
      console.error('CRITICAL: CREEM_API_KEY is missing');
      return NextResponse.json({ error: 'API anahtarı bulunamadı' }, { status: 500 });
    }

    const isTestKey = apiKey.startsWith('creem_test_');
    const baseUrl = isTestKey ? 'https://test-api.creem.io/v1' : 'https://api.creem.io/v1';

    const maskedKey = `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`[AUTH] Mode: ${isTestKey ? 'TEST' : 'LIVE'} | Key: ${maskedKey} | URL: ${baseUrl}`);

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

    console.log('Payload:', JSON.stringify(requestPayload));

    const res = await fetch(`${baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Creem API Error:', res.status, errorData);
      return NextResponse.json({
        error: 'Ödeme oturumu oluşturulamadı',
        details: errorData.message || errorData.error || res.statusText,
        trace_id: errorData.trace_id,
        key_info: maskedKey,
      }, { status: res.status });
    }

    const data = await res.json();
    console.log('SUCCESS! Checkout:', data.id, data.checkout_url);

    return NextResponse.json({
      checkoutUrl: data.checkout_url,
      checkoutId: data.id,
    });
  } catch (error: any) {
    console.error('CRITICAL error:', error);
    return NextResponse.json({ error: 'Sistem hatası', details: error.message }, { status: 500 });
  }
}
