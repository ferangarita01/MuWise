'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Rocket, Shield, Star, Building, Menu, Music, Twitter, Github, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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

const comparisonFeatures = [
    { feature: 'Contratos al mes', gratis: '3', creador: '20', pro: 'Ilimitados', empresarial: 'Ilimitados' },
    { feature: 'Firmantes por acuerdo', gratis: '5', creador: '10', pro: 'Ilimitados', empresarial: 'Ilimitados' },
    { feature: 'Firma digital', gratis: true, creador: true, pro: 'Avanzada', empresarial: 'Avanzada con API' },
    { feature: 'Plantillas personalizadas', gratis: false, creador: true, pro: true, empresarial: true },
    { feature: 'Integración con Spotify/YouTube', gratis: 'Básica', creador: 'Básica', pro: 'Completa', empresarial: 'Completa' },
    { feature: 'Reportes de regalías', gratis: false, creador: 'Básicos', pro: 'Avanzados', empresarial: 'Personalizados' },
    { feature: 'Soporte', gratis: 'Email', creador: 'Email Prioritario', pro: 'Chat + Email', empresarial: 'Dedicado 24/7' },
    { feature: 'Integración API', gratis: false, creador: false, pro: false, empresarial: true },
];

const navLinks = [
    { href: "/#caracteristicas", label: "Características" },
    { href: "/#como-funciona", label: "Cómo funciona" },
    { href: "/#testimonios", label: "Testimonios" },
    { href: "/pricing", label: "Precios" },
  ];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('annually');

  return (
    <div className="bg-slate-950 text-white min-h-screen">
       <header className="sticky top-0 z-30 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Music className="w-6 h-6 text-indigo-400" />
            <span className="text-slate-100 text-lg font-semibold tracking-tight">Muwise</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-slate-300 hover:text-white transition-colors">{link.label}</Link>
            ))}
          </nav>
           <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden sm:inline-flex h-9 px-4 rounded-md text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10" asChild>
                <Link href="/auth/signin">Iniciar sesión</Link>
            </Button>
             <Button className="inline-flex h-9 px-4 rounded-md text-sm text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-lg shadow-indigo-600/20" asChild>
                <Link href="/auth/signup">Probar gratis</Link>
            </Button>
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"><Menu /></Button>
                </SheetTrigger>
                <SheetContent className="bg-[#0b0f1a] border-white/10">
                   <nav className="flex flex-col gap-6 p-6 text-lg font-medium">
                      {navLinks.map(link => (
                          <SheetClose asChild key={link.href}>
                              <Link href={link.href} className="text-slate-300 hover:text-white transition-colors">{link.label}</Link>
                          </SheetClose>
                      ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Planes pensados para cada ritmo y cada talento</h1>
          <p className="mt-4 text-lg text-slate-300">Ya seas artista, banda, DJ o productor, tenemos un plan que se ajusta a tu forma de trabajar.</p>
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

        <section id="comparison" className="py-16 md:py-24 scroll-mt-20">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Compara los Planes</h2>
                <p className="mt-4 text-lg text-slate-300">Encuentra el plan perfecto que se ajusta a tus necesidades de gestión de derechos musicales.</p>
            </div>
            <div className="mt-12 overflow-x-auto rounded-lg border border-white/10 bg-white/5">
                <table className="w-full min-w-[800px] text-sm text-left">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="py-4 px-6 font-semibold text-white w-1/3">Características</th>
                            {plans.map(plan => (
                                <th key={plan.name} className="py-4 px-6 font-semibold text-white text-center">{plan.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonFeatures.map(item => (
                            <tr key={item.feature} className="border-b border-white/5 last:border-0">
                                <td className="py-4 px-6 text-slate-300">{item.feature}</td>
                                <td className="py-4 px-6 text-slate-300 text-center">
                                    {typeof item.gratis === 'boolean' ? (item.gratis ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-slate-500">-</span>) : item.gratis}
                                </td>
                                <td className="py-4 px-6 text-slate-300 text-center">
                                    {typeof item.creador === 'boolean' ? (item.creador ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-slate-500">-</span>) : item.creador}
                                </td>
                                <td className="py-4 px-6 text-slate-300 text-center">
                                    {typeof item.pro === 'boolean' ? (item.pro ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-slate-500">-</span>) : item.pro}
                                </td>
                                <td className="py-4 px-6 text-slate-300 text-center">
                                    {typeof item.empresarial === 'boolean' ? (item.empresarial ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <span className="text-slate-500">-</span>) : item.empresarial}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
      </main>

      <footer id="cta" className="relative border-t border-white/10 mt-16">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
            <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-3">
                <Music className="w-6 h-6 text-indigo-400" />
                <span className="text-slate-100 text-lg font-semibold tracking-tight">Muwise</span>
                </Link>
                <p className="mt-4 text-sm text-slate-400">Gestión de acuerdos musicales simplificada.</p>
                <div className="mt-4 flex items-center gap-3 text-slate-400">
                <Link className="hover:text-white" href="#" aria-label="X"><Twitter className="w-4 h-4" /></Link>
                <Link className="hover:text-white" href="#" aria-label="GitHub"><Github className="w-4 h-4" /></Link>
                <Link className="hover:text-white" href="#" aria-label="Mail"><Mail className="w-4 h-4" /></Link>
                </div>
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-white">Producto</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li><Link className="hover:text-white" href="/#caracteristicas">Características</Link></li>
                <li><Link className="hover:text-white" href="/pricing">Precios</Link></li>
                <li><Link className="hover:text-white" href="/#como-funciona">Guías</Link></li>
                </ul>
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-white">Compañía</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li><Link className="hover:text-white" href="#">Sobre nosotros</Link></li>
                <li><Link className="hover:text-white" href="#">Contacto</Link></li>
                <li><Link className="hover:text-white" href="#">Blog</Link></li>
                </ul>
            </div>
            <div>
                <div className="text-sm font-semibold tracking-tight text-white">Legal</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li><Link className="hover:text-white" href="#">Política de Privacidad</Link></li>
                <li><Link className="hover:text-white" href="#">Términos de Servicio</Link></li>
                </ul>
            </div>
            </div>
            <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} Muwise. Todos los derechos reservados.
            </div>
        </div>
        </footer>
    </div>
  );
}