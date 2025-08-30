
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

const invoices = [
  { id: 'INV-2024-005', date: 'Julio 1, 2024', amount: '$15.00', status: 'Pagado' },
  { id: 'INV-2024-004', date: 'Junio 1, 2024', amount: '$15.00', status: 'Pagado' },
  { id: 'INV-2024-003', date: 'Mayo 1, 2024', amount: '$15.00', status: 'Pagado' },
  { id: 'INV-2024-002', date: 'Abril 1, 2024', amount: '$15.00', status: 'Pagado' },
];

const paymentMethods = [
    { id: 'pm_1', type: 'Visa', last4: '4242', expires: '08/26', isPrimary: true },
    { id: 'pm_2', type: 'Mastercard', last4: '5555', expires: '11/27', isPrimary: false }
]

export default function BillingPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Facturación</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Plan Actual</CardTitle>
                    <CardDescription>
                        Estás suscrito al Plan Creador.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 border rounded-lg bg-secondary/50 m-6 mt-0">
                   <div>
                        <Badge variant="outline" className="mb-2 bg-primary/10 border-primary/30 text-primary">Plan Creador</Badge>
                        <p className="text-2xl font-bold">$7.00 <span className="text-sm font-normal text-muted-foreground">/ mes</span></p>
                        <p className="text-sm text-muted-foreground">Tu plan se renueva el 1 de Agosto, 2024.</p>
                   </div>
                   <Button variant="outline" asChild>
                       <Link href="/pricing">Administrar Suscripción</Link>
                    </Button>
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
