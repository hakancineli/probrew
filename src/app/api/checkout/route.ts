import { NextRequest, NextResponse } from 'next/server';

import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { creem } from '@/lib/creem';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://probrew.com.tr';

import https from 'https';

export async function POST(request: NextRequest) {
  console.log('--- Checkout API [NATIVE NODE.JS HTTPS] Started ---');
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
    const hostname = isTestKey ? 'test-api.creem.io' : 'api.creem.io';

    // Mask for logs & response
    const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`[AUTH] Mode: ${isTestKey ? 'TEST' : 'LIVE'} | Key: ${maskedKey} | Host: ${hostname}`);

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

    const payloadString = JSON.stringify(requestPayload);

    console.log(`Final HTTPS Request to: ${hostname}/v1/checkouts`);

    // Using native https to bypass Next.js fetch patches and Vercel proxy headers
    const data = await new Promise<any>((resolve, reject) => {
      const options = {
        hostname: hostname,
        port: 443,
        path: '/v1/checkouts',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': apiKey,
          'Content-Length': Buffer.byteLength(payloadString)
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => responseBody += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve({ statusCode: res.statusCode, parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, parsed: responseBody });
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(payloadString);
      req.end();
    });

    if (data.statusCode !== 200 && data.statusCode !== 201) {
      console.error('Creem API Rejection (Native HTTP):', data.parsed);
      return NextResponse.json({ 
        error: 'Ödeme oturumu engellendi (Native 403)', 
        details: data.parsed?.message || data.parsed,
        trace_id: data.parsed?.trace_id,
        summary: `Mod: ${isTestKey ? 'TEST' : 'LIVE'} - HTTPS Proxy Bypass`
      }, { status: data.statusCode || 500 });
    }

    console.log('SUCCESS! Checkout created:', data.parsed.id);

    return NextResponse.json({ 
      checkoutUrl: data.parsed.checkout_url,
      checkoutId: data.parsed.id 
    });

  } catch (error: any) {
    console.error('CRITICAL Internal error:', error);
    return NextResponse.json({ error: 'Sistem hatası', details: error.message }, { status: 500 });
  }
}
