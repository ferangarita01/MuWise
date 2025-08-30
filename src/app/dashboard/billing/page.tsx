
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, PlusCircle, Trash2, Loader2, AlertTriangle, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';
import { useUserProfile } from '@/hooks/useUserProfile';
import { FormattedDate } from '@/components/formatted-date';
import { PaymentDialog } from '@/components/dashboard/billing/payment-dialog';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Stripe } from 'stripe';

const planDetails: Record<string, { name: string; price: string; nextPlan: string | null, nextPlanPrice: string | null, priceId?: string, nextPlanPriceId?: string }> = {
    'free': { name: 'Prueba Gratuita', price: '$0', nextPlan: 'Creador', nextPlanPrice: '$7', nextPlanPriceId: 'price_1PQRgKRxzx6g3bKHYqQDC5nU'},
    'creator': { name: 'Plan Creador', price: '$7', nextPlan: 'Pro', nextPlanPrice: '$20', priceId: 'price_1PQRgKRxzx6g3bKHYqQDC5nU', nextPlanPriceId: 'price_1PQRhJRxzx6g3bKHj8mS4sP0'},
    'pro': { name: 'Plan Pro', price: '$20', nextPlan: 'Empresarial', nextPlanPrice: 'Custom', priceId: 'price_1PQRhJRxzx6g3bKHj8mS4sP0' },
    'enterprise': { name: 'Plan Empresarial', price: 'Personalizado', nextPlan: null, nextPlanPrice: null, priceId: 'price_1PQRi6Rxzx6g3bKHeFqYqjW5'},
};

export default function BillingPage() {
    const { user, userProfile, loading, error } = useUserProfile();
    const { toast } = useToast();
    
    const [paymentMethods, setPaymentMethods] = useState<Stripe.PaymentMethod[]>([]);
    const [invoices, setInvoices] = useState<Stripe.Invoice[]>([]);
    const [isMethodsLoading, setIsMethodsLoading] = useState(true);
    const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

    const fetchPaymentMethods = useCallback(async () => {
        if (!userProfile?.stripeCustomerId) {
            setIsMethodsLoading(false);
            return;
        }
        setIsMethodsLoading(true);
        try {
            const res = await fetch(`/api/stripe/list-payment-methods?customerId=${userProfile.stripeCustomerId}`);
            if (!res.ok) throw new Error('Failed to fetch payment methods.');
            const data = await res.json();
            setPaymentMethods(data.paymentMethods);
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "No se pudieron cargar los métodos de pago.", variant: "destructive" });
        } finally {
            setIsMethodsLoading(false);
        }
    }, [userProfile?.stripeCustomerId, toast]);

    useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    const handleNewPaymentMethod = (newMethod: Stripe.PaymentMethod) => {
        setPaymentMethods(prev => [newMethod, ...prev]);
        toast({ title: "Método de Pago Añadido", description: `Se añadió la tarjeta terminada en ${newMethod.card?.last4}.` });
    };

    const handleDeletePaymentMethod = async (paymentMethodId: string) => {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId)); // Optimistic update
        try {
            const res = await fetch(`/api/stripe/detach-payment-method`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethodId }),
            });
            if (!res.ok) {
                 throw new Error('Failed to delete payment method.');
            }
            toast({ title: "Método de Pago Eliminado", variant: "default" });
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "No se pudo eliminar el método de pago.", variant: "destructive" });
            fetchPaymentMethods(); // Re-fetch to revert optimistic update on failure
        }
    }
    
    const handleUpgradePlan = async (priceId: string, paymentMethodId: string) => {
      if (!user || !userProfile?.stripeCustomerId) return;
      setIsUpdatingPlan(true);

      try {
        const res = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: userProfile.stripeCustomerId,
            priceId: priceId,
            paymentMethodId: paymentMethodId
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Subscription failed');

        toast({ title: 'Plan actualizado!', description: 'Tu suscripción ha sido actualizada con éxito.'});
        // Here you would typically update the user's profile in your DB to reflect the new plan
        // e.g., await updateUserPlan(user.uid, newPlanId);

      } catch (err: any) {
        toast({ title: 'Error de suscripción', description: err.message, variant: 'destructive'});
      } finally {
        setIsUpdatingPlan(false);
      }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold">Error al Cargar Datos</h2>
                <p className="text-muted-foreground">No se pudo cargar la información de tu perfil. Por favor, intenta de nuevo más tarde.</p>
            </div>
        );
    }
    
    const currentPlanId = userProfile?.planId || 'free';
    const currentPlan = planDetails[currentPlanId];
    
    const renewalDate = currentPlanId === 'free' 
        ? userProfile?.trialEndsAt || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
        : userProfile?.subscriptionEndsAt || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

    const renderUpgradeButton = () => {
        if (currentPlan.nextPlan && currentPlan.nextPlanPriceId) {
            return (
                <PaymentDialog
                    userId={user?.uid}
                    userEmail={user?.email}
                    stripeCustomerId={userProfile?.stripeCustomerId}
                    planName={currentPlan.nextPlan}
                    planPrice={currentPlan.nextPlanPrice || '$0'}
                    priceId={currentPlan.nextPlanPriceId}
                    onPaymentSuccess={handleNewPaymentMethod}
                    onConfirmSubscription={handleUpgradePlan}
                    existingPaymentMethods={paymentMethods}
                >
                    <Button disabled={isUpdatingPlan}>
                         {isUpdatingPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpCircle className="mr-2 h-4 w-4" />}
                        Súbete al Plan {currentPlan.nextPlan}
                    </Button>
                </PaymentDialog>
            );
        }
        return (
            <Button variant="outline" asChild>
               <Link href="/pricing">Ver todos los planes</Link>
            </Button>
        );
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Facturación</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Plan Actual</CardTitle>
                    <CardDescription>
                        {currentPlanId === 'free'
                          ? `Estás en el período de prueba de 30 días.`
                          : `Estás suscrito al ${currentPlan.name}.`
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 border rounded-lg bg-secondary/50 m-6 mt-0">
                   <div>
                        <Badge variant="outline" className="mb-2 bg-primary/10 border-primary/30 text-primary">{currentPlan.name}</Badge>
                        <p className="text-2xl font-bold">{currentPlan.price} {currentPlanId !== 'free' && <span className="text-sm font-normal text-muted-foreground">/ mes</span>}</p>
                        <p className="text-sm text-muted-foreground">
                            {currentPlanId === 'free' ? 'Tu prueba termina el' : 'Tu plan se renueva el'} <FormattedDate dateString={renewalDate} />.
                        </p>
                   </div>
                   {renderUpgradeButton()}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Métodos de Pago</CardTitle>
                    <CardDescription>
                        Administra tus tarjetas de crédito y débito guardadas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isMethodsLoading ? (
                        <div className="flex justify-center items-center h-24">
                           <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : paymentMethods.length > 0 ? (
                        paymentMethods.map(method => (
                            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                               <div className="flex items-center gap-4">
                                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium capitalize">{method.card?.brand} terminada en {method.card?.last4}</p>
                                        <p className="text-sm text-muted-foreground">Expira {method.card?.exp_month}/{method.card?.exp_year}</p>
                                    </div>
                                    {userProfile?.defaultPaymentMethod === method.id && <Badge>Primario</Badge>}
                               </div>
                               <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDeletePaymentMethod(method.id)}>
                                   <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-6 border-dashed border-2 rounded-lg">
                            No tienes métodos de pago guardados.
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                     <PaymentDialog 
                        userId={user?.uid}
                        userEmail={user?.email}
                        stripeCustomerId={userProfile?.stripeCustomerId}
                        planName="Nuevo Método"
                        planPrice="Gratis"
                        onPaymentSuccess={handleNewPaymentMethod}
                        existingPaymentMethods={paymentMethods}
                    >
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Método de Pago
                        </Button>
                    </PaymentDialog>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Facturación</CardTitle>
                    <CardDescription>
                        Revisa y descarga tus facturas anteriores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {invoices.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Factura</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Invoice mapping will go here */}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center text-sm text-muted-foreground p-6 border-dashed border-2 rounded-lg">
                            No hay facturas disponibles.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
