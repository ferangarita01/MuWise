
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const { paymentMethodId } = await req.json();

        if (!paymentMethodId) {
            return NextResponse.json({ error: 'Payment Method ID is required' }, { status: 400 });
        }

        await stripe.paymentMethods.detach(paymentMethodId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Stripe Detach Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
