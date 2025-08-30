
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const { customerId, paymentMethodId } = await req.json();

        if (!customerId || !paymentMethodId) {
            return NextResponse.json({ error: 'Customer ID and Payment Method ID are required' }, { status: 400 });
        }
        
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        
        // Optional: Set as default payment method
        await stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Stripe Attach Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
