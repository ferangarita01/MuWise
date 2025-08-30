
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Rocket, Shield, Star, Building, Menu, Music, Twitter, Github, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const plans = [
  {
    name: 'Gratis',
    priceMonthly: '$0',
    priceYearly: '$0',
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
    name: 'Pro',
    priceMonthly: '$15',
    priceYearly: '$12',
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
    priceMonthly: 'Custom',
    priceYearly: 'Custom',
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

const faqItems = [
    {
        question: "Can I change my plan later?",
        answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
    },
    {
        question: "Do you offer a free trial?",
        answer: "Yes, we offer a 14-day free trial on all plans. No credit card required to start."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, PayPal, and for annual plans, we also support wire transfers."
    },
    {
        question: "Is there a discount for non-profits?",
        answer: "Yes, we offer special pricing for non-profit organizations. Please contact our sales team for details."
    }
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
    <div className="bg-black text-white font-light min-h-screen">
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
             <Button className="inline-flex h-9 px-4 rounded-md text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 shadow-lg shadow-indigo-600/20" asChild>
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

      <main className="container mx-auto px-6 py-24 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl -z-10"></div>
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Precios simples y <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">transparentes</span>
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto font-extralight">
            Elige el plan perfecto para las necesidades de tu equipo sin tarifas ocultas ni compromisos a largo plazo.
          </p>
        </div>

        <div className="flex justify-center items-center mb-12">
            <span className={cn("mr-3 font-medium", billingCycle === 'monthly' ? 'text-white' : 'text-gray-400')}>Mensual</span>
            <Switch
                checked={billingCycle === 'annually'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
                id="billing-toggle"
            />
            <span className={cn("ml-3 font-medium", billingCycle === 'annually' ? 'text-white' : 'text-gray-400')}>Anual <span className="text-xs text-indigo-400">(Ahorra 20%)</span></span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
                <div key={plan.name} className={cn(
                    "bg-gradient-to-br from-gray-900/80 to-black/80 p-8 rounded-2xl border border-gray-800 hover:border-indigo-500/30 transition-all flex flex-col h-full relative",
                    plan.isPopular && 'border-indigo-500/50 hover:border-indigo-500/80 from-indigo-900/40'
                )}>
                    {plan.isPopular && (
                        <div className="absolute top-0 right-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-normal px-3 py-1 rounded-b-md">
                            MÁS POPULAR
                        </div>
                    )}
                    <div className="mb-8">
                        <h3 className="text-xl font-normal mb-2">{plan.name}</h3>
                        <p className="text-gray-400 font-extralight text-sm mb-4 h-10">{plan.description}</p>
                        <div className="flex items-baseline">
                            <span className="text-4xl font-light">
                                {billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                            </span>
                            {plan.name !== 'Empresarial' && <span className="text-gray-400 ml-2 font-extralight">/mes</span>}
                        </div>
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                        {plan.features.map(feature => (
                            <li key={feature} className="flex items-center text-gray-300 font-extralight">
                                <Check className="w-5 h-5 mr-2 text-indigo-400 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Button variant={plan.isPopular ? "default" : "outline"} className={cn(
                        "w-full py-3",
                        plan.isPopular ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-light hover:opacity-90" : "bg-transparent border-gray-700 hover:bg-white/5"
                    )}>
                        {plan.cta}
                    </Button>
                </div>
            ))}
        </div>

        <div className="mt-24 max-w-3xl mx-auto">
            <h3 className="text-2xl font-light mb-8 text-center">Preguntas Frecuentes</h3>
            <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-800">
                        <AccordionTrigger className="text-lg font-normal hover:no-underline">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-gray-400 font-extralight pb-6">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
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
