
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, Shield, Briefcase, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import type { PaymentMethod, StripeCardElement } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const VisaIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" role="img" aria-labelledby="pi-visa">
        <title id="pi-visa">Visa</title>
        <g fill="none"><path fill="#28287B" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3z"/><path fill="#fff" d="M28.2 16.7c.8-.5 1.5-1.1 2-1.9H38v-.6c-1.3-1.4-2-2.1-2.2-2.3-.3-.3-.6-.5-.9-.7-.3-.2-.5-.4-.7-.5-.2-.1-.3-.2-.4-.3-.1-.1-.2-.1-.2-.2-.1 0-.1-.1-.1-.1-.1 0-.1-.1-.2-.1l-.1-.1c0-.1-.1-.1-.1-.2 0-.1-.1-.1-.1-.1v-2.3h-3.3c-.5.8-1.2 1.5-2 2-.9.5-1.8.8-2.8.8-1.3 0-2.5-.5-3.5-1.5-.9-1-1.4-2.2-1.4-3.7 0-1.4.5-2.7 1.5-3.8 1-1.1 2.2-1.6 3.7-1.6.8 0 1.6.2 2.3.6.7.4 1.2.9 1.7 1.5l.4 1-3.6.9-.5-1.2c-.3-.8-1.1-1.3-2-1.3-.8 0-1.4.3-1.8.8-.4.5-.6 1.1-.6 1.8 0 .7.2 1.3.6 1.7.4.4.9.6 1.6.6.9 0 1.7-.3 2.3-.8.6-.5 1-1.1 1.3-1.8l3.7-.9c-.4.9-1 1.7-1.7 2.4-.7.7-1.5 1.2-2.4 1.5-.9.3-1.9.5-2.9.5-1.8 0-3.4-.6-4.7-1.8-1.3-1.2-2-2.9-2-4.8 0-2.3.9-4.2 2.5-5.6 1.7-1.4 3.7-2.1 6.1-2.1.8 0 1.6.1 2.4.4.8.2 1.6.6 2.3 1 .8.4 1.5.9 2.1 1.5.6.6 1.2 1.3 1.6 2.1.4.8.7 1.7.9 2.6.2.9.3 1.8.3 2.7zm-20.9 2c-.3-.3-.5-.7-.7-1.2-.2-.5-.3-1-.3-1.6 0-1.5.5-2.7 1.5-3.6.9-.8 2.1-1.3 3.5-1.3.6 0 1.1.1 1.5.3.4.2.8.5 1.1.8l-1.9 3.2c-.4-.3-.8-.5-1.2-.5-.4 0-.8.1-1.1.4-.3.3-.5.7-.5 1.2 0 .4.2.8.5 1.1.3.3.7.4 1.1.4.4 0 .8-.1 1.1-.3l1.9 3.2c-.4.4-.9.7-1.5.9-1.5.5-3.1.2-4.2-1zm14.5.1h3.1v-8.1h-3.1v8.1zM5 8.1v8.1h3.1V8.1H5z"/></g>
    </svg>
);

const MasterCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" role="img" aria-labelledby="pi-mastercard">
        <title id="pi-mastercard">Mastercard</title>
        <g fill="none"><path fill="#EB001B" d="M15 12a7 7 0 11-7-7 7 7 0 017 7z"/><path fill="#F79E1B" d="M23 12a7 7 0 11-7-7 7 7 0 017 7z"/><path fill="#FF5F00" d="M20.6 12a7 7 0 11-11.2 0 7 7 0 0111.2 0z"/></g>
    </svg>
);

interface CheckoutFormProps {
  planName: string;
  planPrice: string;
  priceId?: string;
  onPaymentSuccess?: (paymentMethod: PaymentMethod) => void;
  onConfirmSubscription?: (priceId: string, paymentMethodId: string) => Promise<void>;
  existingPaymentMethods?: PaymentMethod[];
  userId?: string;
  userEmail?: string;
  stripeCustomerId?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ planName, planPrice, priceId, onPaymentSuccess, onConfirmSubscription, existingPaymentMethods = [], userId, userEmail, stripeCustomerId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | 'new'>(existingPaymentMethods[0]?.id || 'new');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        if (!userId) {
          toast({ title: "Error", description: "Debes iniciar sesión para realizar esta acción.", variant: "destructive"});
          return;
        }

        setIsProcessing(true);

        if (selectedMethod === 'new') {
            // Create a new payment method
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                setIsProcessing(false);
                return;
            }

            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: { name: userEmail },
            });

            if (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
                setIsProcessing(false);
                return;
            }

            // Attach payment method to customer
            const attachRes = await fetch('/api/stripe/attach-payment-method', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: stripeCustomerId, paymentMethodId: paymentMethod.id }),
            });

            if (!attachRes.ok) {
                 toast({ title: "Error", description: "No se pudo guardar el método de pago.", variant: "destructive" });
                 setIsProcessing(false);
                 return;
            }

            if (onPaymentSuccess) onPaymentSuccess(paymentMethod);
            if (onConfirmSubscription && priceId) await onConfirmSubscription(priceId, paymentMethod.id);
            
        } else {
            // Use an existing payment method
            if (onConfirmSubscription && priceId) await onConfirmSubscription(priceId, selectedMethod);
        }

        setIsProcessing(false);
        document.getElementById('payment-dialog-close')?.click();
    };

    return (
        <form onSubmit={handleSubmit} className="md:w-3/5 p-8 flex flex-col">
          <DialogHeader className="mb-8 text-left">
            <DialogTitle className="text-2xl font-bold text-foreground">Completa tu pago</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Confirma tu pago para el plan seleccionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 flex-grow">
            {existingPaymentMethods.map(pm => (
                <div key={pm.id} onClick={() => setSelectedMethod(pm.id)} className={`flex items-center p-4 border rounded-lg cursor-pointer ${selectedMethod === pm.id ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
                    <input type="radio" name="paymentMethod" value={pm.id} checked={selectedMethod === pm.id} className="mr-4" onChange={() => {}}/>
                    <div className="flex items-center gap-4">
                        {pm.card?.brand === 'visa' ? <VisaIcon /> : <MasterCardIcon />}
                        <div>
                            <p className="font-medium capitalize">{pm.card?.brand} terminada en {pm.card?.last4}</p>
                            <p className="text-sm text-muted-foreground">Expira {pm.card?.exp_month}/{pm.card?.exp_year}</p>
                        </div>
                    </div>
                </div>
            ))}

            <div onClick={() => setSelectedMethod('new')} className={`p-4 border rounded-lg cursor-pointer ${selectedMethod === 'new' ? 'border-primary ring-2 ring-primary' : 'border-border'}`}>
              <div className="flex items-center mb-4">
                  <input type="radio" name="paymentMethod" value="new" checked={selectedMethod === 'new'} className="mr-4" onChange={() => {}}/>
                  <Label>Añadir nueva tarjeta</Label>
              </div>
              {selectedMethod === 'new' && (
                  <CardElement options={{
                      style: {
                          base: {
                              color: '#ffffff',
                              fontFamily: 'inherit',
                              fontSize: '16px',
                              '::placeholder': {
                                  color: '#a1a1aa',
                              },
                          },
                          invalid: {
                              color: '#ef4444',
                          },
                      },
                  }} className="p-3 bg-secondary/50 border-border rounded-md" />
              )}
            </div>
          </div>
          
          <div className="pt-4 mt-auto">
            <Button type="submit" disabled={isProcessing || !stripe || !elements} className="w-full py-3 text-base font-medium">
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 text-sm" />
              )}
              <span>{isProcessing ? 'Procesando...' : `Confirmar y Pagar ${planPrice}`}</span>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center">
              <Shield className="mr-1 h-3 w-3" />
              Tu información de pago está encriptada y segura.
            </p>
          </div>
        </form>
    );
}

interface PaymentDialogProps {
  children: React.ReactNode;
  planName: string;
  planPrice: string;
  priceId?: string; // For subscriptions
  onPaymentSuccess?: (paymentMethod: PaymentMethod) => void;
  onConfirmSubscription?: (priceId: string, paymentMethodId: string) => Promise<void>;
  existingPaymentMethods?: PaymentMethod[];
  userId?: string;
  userEmail?: string;
  stripeCustomerId?: string;
}

export function PaymentDialog({ children, ...props }: PaymentDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 border-border bg-card overflow-hidden">
        <div className="md:flex">
            <Elements stripe={stripePromise}>
              <CheckoutForm {...props} />
            </Elements>
            <div className="md:w-2/5 bg-secondary/30 p-8 border-l border-border flex flex-col">
              <h3 className="text-lg font-semibold text-foreground mb-6">Resumen del pedido</h3>
              <div className="space-y-4 mb-6 flex-grow">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                      <Briefcase className="text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-foreground">Plan {props.planName}</p>
                      <p className="text-xs text-muted-foreground">Facturación mensual</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">{props.planPrice}</p>
                </div>
              </div>
              <Separator className="my-4 bg-border"/>
              <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-sm font-medium text-foreground">{props.planPrice}</p>
                  </div>
                  <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Impuestos</p>
                  <p className="text-sm font-medium text-foreground">$0.00</p>
                  </div>
              </div>
              <Separator className="my-4 bg-border"/>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between">
                  <p className="text-base font-medium text-foreground">Total</p>
                  <p className="text-base font-bold text-foreground">{props.planPrice}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Al completar la compra, aceptas nuestros{" "}
                  <a href="#" className="text-primary hover:underline">términos y condiciones</a>.
                </p>
              </div>
            </div>
        </div>
         <DialogClose id="payment-dialog-close" className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
