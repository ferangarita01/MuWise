// src/app/api/stripe/webhooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

// Esta es la clave secreta del endpoint de webhook, ¡debes obtenerla de tu Dashboard de Stripe!
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
    case 'checkout.session.completed':
      // El cliente ha completado un pago
      const session = event.data.object;
      console.log('✅ Checkout Session completado para:', session.customer);
      // Aquí actualizarías tu base de datos para marcar el pedido como pagado
      break;
    
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      console.log(`Suscripción ${event.type}:`, subscription.id, 'para el cliente', subscription.customer);
      // Aquí actualizarías el estado de la suscripción del usuario en tu base de datos
      break;

    default:
      console.warn(`🤷‍♀️ Evento de webhook no manejado: ${event.type}`);
  }

  // Devolver una respuesta para confirmar la recepción a Stripe
  return NextResponse.json({ received: true });
}
