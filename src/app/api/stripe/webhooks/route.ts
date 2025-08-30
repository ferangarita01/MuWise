// src/app/api/stripe/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-server';

// Esta es la clave secreta del endpoint de webhook, ¡debes obtenerla de tu Dashboard de Stripe!
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;
  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Mapear priceId de Stripe a planId de tu aplicación
  // ESTO DEBE COINCIDIR CON LOS IDs DE PRECIOS QUE CREASTE EN STRIPE
  const planMap: Record<string, string> = {
    'price_1PQRgKRxzx6g3bKHYqQDC5nU': 'creator',
    'price_1PQRhJRxzx6g3bKHj8mS4sP0': 'pro',
    'price_1PQRi6Rxzx6g3bKHeFqYqjW5': 'enterprise',
  };
  const planId = planMap[priceId] || 'free';

  // Buscar al usuario en Firestore por su stripeCustomerId
  const usersRef = adminDb.collection('users');
  const querySnapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

  if (querySnapshot.empty) {
    console.error(`Webhook Error: No user found with stripeCustomerId ${customerId}`);
    return;
  }

  const userDoc = querySnapshot.docs[0];
  const userRef = userDoc.ref;

  // Actualizar el documento del usuario con el nuevo estado de la suscripción
  await userRef.update({
    planId: planId,
    subscriptionStatus: status,
    subscriptionEndsAt: currentPeriodEnd.toISOString(),
  });

  console.log(`✅ Subscription for ${userDoc.id} updated to plan ${planId} with status ${status}.`);
}


export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET no está configurada.");
    return NextResponse.json({ error: 'El servidor no está configurado para webhooks.' }, { status: 500 });
  }

  const buf = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig!, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error al verificar la firma del webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Manejar el evento
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const usersRef = adminDb.collection('users');
      const querySnapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await userDoc.ref.update({
            planId: 'free',
            subscriptionStatus: 'canceled',
        });
        console.log(`✅ Subscription for ${userDoc.id} canceled.`);
      }
      break;
    
    default:
      console.warn(`🤷‍♀️ Evento de webhook no manejado: ${event.type}`);
  }

  // Devolver una respuesta para confirmar la recepción a Stripe
  return NextResponse.json({ received: true });
}
