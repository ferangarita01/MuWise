
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Rocket, Shield, Star, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const plans = [
  {
    name: 'Gratis',
    price: '$0',
    description: 'Ideal para artistas emergentes que empiezan a gestionar sus primeros acuerdos.',
    features: [
      'Hasta 3 contratos al mes',
      'Firma digital básica',
      'Integración con Spotify limitada',
      'Soporte por email',
    ],
    cta: 'Empieza Gratis',
    icon: Rocket,
  },
  {
    name: 'Creador',
    price: '$7.99',
    description: 'Para creadores que necesitan más flexibilidad y herramientas de reporte.',
    features: [
      'Hasta 20 contratos al mes',
      'Firma digital avanzada básica',
      'Integraciones con YouTube y Spotify limitadas',
      'Reportes básicos de regalías',
      'Soporte por email prioritario',
    ],
    cta: 'Elegir Creador',
    icon: Shield,
  },
  {
    name: 'Pro',
    price: '$15',
    description: 'Perfecto para profesionales, bandas y managers que gestionan múltiples proyectos.',
    features: [
      'Contratos ilimitados',
      'Firma digital avanzada con API',
      'Integraciones completas con Spotify, YouTube, DistroKid',
      'Reportes avanzados y exportación',
      'Soporte chat + email',
    ],
    cta: 'Sube a Pro',
    isPopular: true,
    icon: Star,
  },
  {
    name: 'Empresarial',
    price: 'Custom',
    description: 'Diseñado para sellos y agencias con necesidades a gran escala.',
    features: [
      'Todo del Pro + personalizaciones',
      'Integración API completa',
      'Soporte dedicado 24/7',
      'Consultoría legal incluida',
    ],
    cta: 'Contactar',
    icon: Building,
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('annually');

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Planes pensados para cada ritmo y cada talento</h1>
          <p className="mt-4 text-lg text-slate-300">Ya seas artista, banda, DJ o productor, tenemos un plan que se ajusta a tu forma de trabajar.</p>
          <div className="mt-6">
            <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20">
              Ver Planes
            </Button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            <div className="md:col-span-2 rounded-lg overflow-hidden">
                 <Image src="https://picsum.photos/400/500" alt="Music artist" width={400} height={500} className="w-full h-full object-cover" data-ai-hint="music artist" />
            </div>
            <div className="rounded-lg overflow-hidden">
                 <Image src="https://picsum.photos/600/400" alt="Music studio" width={600} height={400} className="w-full h-full object-cover" data-ai-hint="music studio" />
            </div>
            <div className="md:col-span-2 rounded-lg overflow-hidden">
                <Image src="https://picsum.photos/400/500" alt="DJ performing" width={400} height={500} className="w-full h-full object-cover" data-ai-hint="dj concert" />
            </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'bg-slate-900/50 border-slate-700 flex flex-col',
                plan.isPopular && 'border-indigo-500 ring-2 ring-indigo-500'
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold">
                        Más Popular
                    </div>
                </div>
              )}
              <CardHeader className="pt-8">
                <div className="flex items-center gap-3">
                  <plan.icon className="w-6 h-6 text-indigo-400" />
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <CardDescription className="pt-2 h-20">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-slate-400">/mes</span>}
                </div>
                {plan.price !== '$0' && plan.price !== 'Custom' && (
                  <p className="text-xs text-slate-500 mt-1">facturado anualmente</p>
                )}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={cn(
                    'w-full',
                    plan.isPopular ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-white/10 hover:bg-white/20',
                    plan.name === 'Empresarial' && 'border border-slate-500'
                )}>
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
