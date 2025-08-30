
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const { customerId, priceId, paymentMethodId } = await req.json();

        if (!customerId || !priceId || !paymentMethodId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Set the new payment method as the default for the customer's invoices
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'],
        });

        return NextResponse.json(subscription);

    } catch (error: any) {
        console.error('Stripe Subscription Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
