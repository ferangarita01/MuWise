
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

const invoices = [
  { id: 'INV-2024-005', date: 'Julio 1, 2024', amount: '$15.00', status: 'Pagado' },
  { id: 'INV-2024-004', date: 'Junio 1, 2024', amount: '$15.00', status: 'Pagado' },
  { id: 'INV-2024-003', date: 'Mayo 1, 2024', amount: '$15.00', status: 'Pagado' },
  { id: 'INV-2024-002', date: 'Abril 1, 2024', amount: '$15.00', status: 'Pagado' },
];

const paymentMethods = [
    { id: 'pm_1', type: 'Visa', last4: '4242', expires: '08/26', isPrimary: true },
    { id: 'pm_2', type: 'Mastercard', last4: '5555', expires: '11/27', isPrimary: false }
];

const planDetails: Record<string, { name: string; price: string; nextPlan: string | null, nextPlanPrice: string | null }> = {
    'free': { name: 'Plan Gratuito', price: '$0', nextPlan: 'Creador', nextPlanPrice: '$7' },
    'creator': { name: 'Plan Creador', price: '$7', nextPlan: 'Pro', nextPlanPrice: '$20' },
    'pro': { name: 'Plan Pro', price: '$20', nextPlan: 'Empresarial', nextPlanPrice: 'Custom' },
    'enterprise': { name: 'Plan Empresarial', price: 'Personalizado', nextPlan: null, nextPlanPrice: null },
};

export default function BillingPage() {
    const { userProfile, loading, error } = useUserProfile();

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
    const renewalDate = userProfile?.trialEndsAt || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

    const renderUpgradeButton = () => {
        if (currentPlan.nextPlan) {
            return (
                <PaymentDialog 
                    planName={currentPlan.nextPlan}
                    planPrice={currentPlan.nextPlanPrice || '$0'}
                >
                    <Button>
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
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
                        Estás suscrito al {currentPlan.name}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 border rounded-lg bg-secondary/50 m-6 mt-0">
                   <div>
                        <Badge variant="outline" className="mb-2 bg-primary/10 border-primary/30 text-primary">{currentPlan.name}</Badge>
                        <p className="text-2xl font-bold">{currentPlan.price} <span className="text-sm font-normal text-muted-foreground">/ mes</span></p>
                        <p className="text-sm text-muted-foreground">
                            Tu plan se renueva el <FormattedDate dateString={renewalDate} />.
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
                    {paymentMethods.map(method => (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-4">
                                <CreditCard className="w-8 h-8 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{method.type} terminada en {method.last4}</p>
                                    <p className="text-sm text-muted-foreground">Expira {method.expires}</p>
                                </div>
                                {method.isPrimary && <Badge>Primario</Badge>}
                           </div>
                           <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                               <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Método de Pago
                    </Button>
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
                            {invoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
