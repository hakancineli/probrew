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
          metadata: event.data.metadata
        });

        const businessId = event.data.metadata?.businessId;
        if (businessId) {
          // Activating the subscription for 1 month
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);

          await prisma.business.update({
            where: { id: businessId },
            data: {
              subscriptionStatus: 'ACTIVE',
              subscriptionEnd: endDate
            }
          });
          console.log(`✅ Business ${businessId} marked as ACTIVE.`);
        }
        break;

      case 'subscription.created':
        console.log('🆕 Yeni abonelik:', event.data);
        break;

      case 'subscription.renewed':
        console.log('🔄 Abonelik yenilendi:', event.data);
        const renewBizId = event.data.metadata?.businessId;
        if (renewBizId) {
          const newEndDate = new Date();
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          await prisma.business.update({
            where: { id: renewBizId },
            data: { subscriptionStatus: 'ACTIVE', subscriptionEnd: newEndDate }
          });
        }
        break;

      case 'subscription.canceled':
      case 'subscription.expired':
        console.log('❌ Abonelik sonlandı:', event.type, event.data);
         const cancelBizId = event.data.metadata?.businessId;
        if (cancelBizId) {
          await prisma.business.update({
            where: { id: cancelBizId },
            data: { subscriptionStatus: 'SUSPENDED' }
          });
        }
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
