
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-server';
import Stripe from 'stripe';

async function getOrCreateStripeCustomer(userId: string, email: string | undefined): Promise<Stripe.Customer> {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (userData?.stripeCustomerId) {
        try {
            const customer = await stripe.customers.retrieve(userData.stripeCustomerId);
            if (!customer.deleted) {
                return customer as Stripe.Customer;
            }
        } catch (e) {
            // Customer might not exist in Stripe anymore, create a new one
        }
    }

    const customer = await stripe.customers.create({
        email: email,
        metadata: { firebaseUID: userId },
    });

    await userRef.update({ stripeCustomerId: customer.id });
    return customer;
}

export async function POST(req: NextRequest) {
    try {
        const { amount, currency = 'usd', userId, userEmail } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        
        const customer = await getOrCreateStripeCustomer(userId, userEmail);

        const setupIntent = await stripe.setupIntents.create({
            customer: customer.id,
            payment_method_types: ['card'],
        });

        return NextResponse.json({ clientSecret: setupIntent.client_secret, customerId: customer.id });

    } catch (error: any) {
        console.error('Stripe Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
