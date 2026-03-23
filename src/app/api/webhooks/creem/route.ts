import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('--- Creem Webhook Received ---');
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature');

    console.log('Webhook body (first 200 chars):', body.substring(0, 200));
    console.log('Signature present:', !!signature);

    // Verify webhook signature
    const secret = process.env.CREEM_WEBHOOK_SECRET;
    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        console.error('Expected:', expectedSignature.substring(0, 10) + '...');
        console.error('Received:', signature.substring(0, 10) + '...');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      console.log('✅ Signature verified');
    }

    const event = JSON.parse(body);
    
    // Creem sends: { id, eventType, object: { ... }, created_at }
    // OR legacy: { type, data: { ... } }
    const eventType = event.eventType || event.type;
    const eventData = event.object || event.data || {};
    const metadata = eventData.metadata || {};

    console.log('Event Type:', eventType);
    console.log('Event Data ID:', eventData.id);
    console.log('Metadata:', JSON.stringify(metadata));

    switch (eventType) {
      case 'checkout.completed': {
        console.log('✅ Ödeme başarılı!', {
          checkoutId: eventData.id,
          customerId: eventData.customer_id || eventData.customerId,
          productId: eventData.product_id || eventData.productId,
          metadata
        });

        const businessId = metadata.businessId;
        if (businessId) {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);

          await prisma.business.update({
            where: { id: businessId },
            data: {
              subscriptionStatus: 'ACTIVE',
              subscriptionEnd: endDate
            }
          });
          console.log(`✅ Business ${businessId} subscription ACTIVATED until ${endDate.toISOString()}`);
        } else {
          console.log('⚠️ checkout.completed received but no businessId in metadata');
        }
        break;
      }

      case 'subscription.active':
      case 'subscription.paid': {
        console.log(`✅ ${eventType}:`, eventData.id);
        const bizId = metadata.businessId;
        if (bizId) {
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          await prisma.business.update({
            where: { id: bizId },
            data: { subscriptionStatus: 'ACTIVE', subscriptionEnd: endDate }
          });
          console.log(`✅ Business ${bizId} subscription renewed`);
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.expired':
      case 'subscription.paused': {
        console.log(`❌ ${eventType}:`, eventData.id);
        const cancelBizId = metadata.businessId;
        if (cancelBizId) {
          await prisma.business.update({
            where: { id: cancelBizId },
            data: { subscriptionStatus: 'SUSPENDED' }
          });
          console.log(`❌ Business ${cancelBizId} subscription SUSPENDED`);
        }
        break;
      }

      default:
        console.log(`📨 Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error.message || error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}
