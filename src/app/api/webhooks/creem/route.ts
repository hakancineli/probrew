import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature');

    // Verify webhook signature
    if (process.env.CREEM_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.type) {
      case 'checkout.completed':
        console.log('✅ Ödeme başarılı!', {
          checkoutId: event.data.id,
          customerId: event.data.customer_id,
          productId: event.data.product_id,
        });
        // TODO: İşletme hesabını aktifleştir, e-posta gönder
        break;

      case 'subscription.created':
        console.log('🆕 Yeni abonelik:', event.data);
        // TODO: Abonelik bilgilerini veritabanına kaydet
        break;

      case 'subscription.renewed':
        console.log('🔄 Abonelik yenilendi:', event.data);
        break;

      case 'subscription.canceled':
        console.log('❌ Abonelik iptal edildi:', event.data);
        // TODO: İşletme erişimini kısıtla
        break;

      case 'subscription.expired':
        console.log('⏰ Abonelik süresi doldu:', event.data);
        // TODO: İşletme erişimini kapat
        break;

      default:
        console.log('📨 Bilinmeyen webhook event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
