import { NextRequest, NextResponse } from 'next/server';

const CREEM_API_KEY = process.env.CREEM_API_KEY!;
const CREEM_BASE_URL = 'https://api.creem.io/v1';
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

    const checkoutPayload: Record<string, unknown> = {
      product_id: productId,
      success_url: `${APP_URL}/odeme-basarili`,
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
