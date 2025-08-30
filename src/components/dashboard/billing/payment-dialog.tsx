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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Shield, HelpCircle, Briefcase, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Inline SVG components for payment icons to avoid external dependencies
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

interface PaymentDialogProps {
  children: React.ReactNode;
  planName: string;
  planPrice: string;
  onPaymentSuccess?: (cardDetails: {type: 'Visa' | 'Mastercard', last4: string}) => void;
}

export function PaymentDialog({ children, planName, planPrice, onPaymentSuccess }: PaymentDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");

  const handlePayment = () => {
    if (cardNumber.length < 16) {
        toast({ title: "Error", description: "Por favor, introduce un número de tarjeta válido.", variant: "destructive"});
        return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      const cardType = cardNumber.startsWith('4') ? 'Visa' : 'Mastercard';
      const last4 = cardNumber.slice(-4);
      
      onPaymentSuccess?.({ type: cardType, last4 });
      
      // Close the dialog by clicking the close button programmatically
      // This is a common pattern when you want to control dialog closing from within
      document.getElementById('payment-dialog-close')?.click();

    }, 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-0 border-border bg-card overflow-hidden">
        <div className="md:flex">
          <div className="md:w-3/5 p-8">
            <DialogHeader className="mb-8 text-left">
              <DialogTitle className="text-2xl font-bold text-foreground">Completa tu pago</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Ingresa los detalles de tu tarjeta para procesar tu pago.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <Label htmlFor="cardNumber" className="block text-sm font-medium text-muted-foreground mb-1">Número de tarjeta</Label>
                <div className="relative">
                  <Input 
                    id="cardNumber" 
                    type="text" 
                    placeholder="1234 5678 9012 3456" 
                    className="w-full pl-4 pr-24 py-3 bg-secondary/50 border-border focus:ring-primary" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={16}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-2">
                    <VisaIcon />
                    <MasterCardIcon />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="block text-sm font-medium text-muted-foreground mb-1">Fecha de expiración</Label>
                  <Input id="expiryDate" type="text" placeholder="MM / YY" className="w-full px-4 py-3 bg-secondary/50 border-border focus:ring-primary" />
                </div>
                <div>
                  <Label htmlFor="cvc" className="block text-sm font-medium text-muted-foreground mb-1">Código de seguridad</Label>
                  <div className="relative">
                    <Input id="cvc" type="text" placeholder="CVC" className="w-full px-4 py-3 bg-secondary/50 border-border focus:ring-primary" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="cardName" className="block text-sm font-medium text-muted-foreground mb-1">Nombre en la tarjeta</Label>
                <Input id="cardName" type="text" placeholder="Tu nombre" className="w-full px-4 py-3 bg-secondary/50 border-border focus:ring-primary" />
              </div>

              <div className="pt-4">
                <Button onClick={handlePayment} disabled={isProcessing} className="w-full py-3 text-base font-medium">
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 text-sm" />
                  )}
                  <span>{isProcessing ? 'Procesando...' : `Pagar ${planPrice}/mes`}</span>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center">
                  <Shield className="mr-1 h-3 w-3" />
                  Tu información de pago está encriptada y segura.
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/5 bg-secondary/30 p-8 border-l border-border flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-6">Resumen del pedido</h3>
            
            <div className="space-y-4 mb-6 flex-grow">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Briefcase className="text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-foreground">Plan {planName}</p>
                    <p className="text-xs text-muted-foreground">Facturación mensual</p>
                  </div>
                </div>
                <p className="text-sm font-medium">{planPrice}</p>
              </div>
            </div>
            
            <Separator className="my-4 bg-border"/>
            
            <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-sm font-medium text-foreground">{planPrice}</p>
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
                <p className="text-base font-bold text-foreground">{planPrice}</p>
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
