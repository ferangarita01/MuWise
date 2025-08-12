
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Music, Star, Rocket, Building } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const plans = [
    {
        name: "Starter",
        price: "Gratis",
        pricePeriod: "",
        description: "Ideal para artistas emergentes, samplistas o DJs que empiezan.",
        features: [
            "Contratos digitales: hasta 3 al mes.",
            "Firma digital básica.",
            "Almacenamiento: 50MB.",
            "Integración inicial con YouTube."
        ],
        buttonText: "Empieza Gratis",
        buttonVariant: "default",
        isFeatured: false,
        icon: Rocket,
    },
    {
        name: "Pro",
        price: "$15",
        pricePeriod: "/mes",
        description: "Perfecto para bandas, managers y productores.",
        features: [
            "Contratos ilimitados.",
            "Firma avanzada (DocuSign).",
            "Integraciones: Spotify, YouTube, DistroKid.",
            "Reportes de regalías.",
            "10GB almacenamiento."
        ],
        buttonText: "Probar 7 días gratis",
        buttonVariant: "accent",
        isFeatured: true,
        icon: Star,
    },
    {
        name: "Business",
        price: "Custom",
        pricePeriod: "",
        description: "Diseñado para sellos y agencias con múltiples artistas.",
        features: [
            "Todo en Pro",
            "Integraciones de pago (Stripe/PayPal)",
            "API para automatizar acuerdos.",
            "Soporte prioritario 24/7.",
            "Almacenamiento ilimitado."
        ],
        buttonText: "Solicitar Demo",
        buttonVariant: "outline",
        isFeatured: false,
        icon: Building,
    }
];

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
             <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link href="/" className="flex items-center gap-2 font-bold" prefetch={false}>
                        <Music className="h-6 w-6 text-primary" />
                        <span className="text-lg">Muwise</span>
                    </Link>
                     <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                        <Link href="/auth/signin" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                        Sign In
                        </Link>
                        <Button asChild>
                        <Link href="/auth/signup">Try for Free</Link>
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-[#007BFF] to-[#6C63FF] py-20 md:py-32">
                    <div className="absolute inset-0 z-0">
                        {/* Abstract sound wave texture */}
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wave-grind.png')] opacity-10"></div>
                    </div>
                    <div className="container relative z-10 text-center text-white">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter drop-shadow-lg">
                            Planes pensados para cada ritmo y cada talento
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-indigo-100">
                            Ya seas artista, banda, DJ o productor, tenemos un plan que se ajusta a tu forma de trabajar.
                        </p>
                        <div className="mt-8">
                            <Button size="lg" className="bg-white text-primary hover:bg-gray-200 transition-transform duration-300 ease-in-out hover:scale-105" asChild>
                                <Link href="#pricing-plans">Ver Planes</Link>
                            </Button>
                        </div>
                    </div>
                     <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
                </section>
                
                 {/* Image Collage Section */}
                <section className="-mt-24 md:-mt-32 relative z-20">
                    <div className="container">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                             <Image 
                                src="https://placehold.co/400x500.png"
                                alt="DJ mixing music"
                                width={400}
                                height={500}
                                className="rounded-lg shadow-2xl object-cover transform hover:scale-105 transition-transform duration-500"
                                data-ai-hint="DJ mixing"
                            />
                            <Image 
                                src="https://placehold.co/600x400.png"
                                alt="Muwise app on laptop"
                                width={600}
                                height={400}
                                className="rounded-lg shadow-2xl col-span-2 transform hover:scale-105 transition-transform duration-500"
                                data-ai-hint="app mockup"
                            />
                             <Image 
                                src="https://placehold.co/400x500.png"
                                alt="Guitarist playing"
                                width={400}
                                height={500}
                                className="rounded-lg shadow-2xl object-cover transform hover:scale-105 transition-transform duration-500"
                                data-ai-hint="guitarist"
                            />
                        </div>
                    </div>
                </section>


                {/* Pricing Plans Section */}
                <section id="pricing-plans" className="py-20 md:py-28">
                    <div className="container">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                            {plans.map((plan) => (
                                 <Card key={plan.name} className={`flex flex-col border-2 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 ${plan.isFeatured ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : 'border-border'}`}>
                                    <CardHeader className="p-6 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="p-3 bg-primary/10 rounded-full">
                                                <plan.icon className="h-8 w-8 text-primary" />
                                            </div>
                                        </div>
                                        <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                                        <CardDescription>{plan.description}</CardDescription>
                                        {plan.isFeatured && <div className="absolute top-0 right-4 -mt-3 bg-accent text-accent-foreground px-3 py-1 text-sm font-bold rounded-full">Más Popular</div>}
                                    </CardHeader>
                                    <CardContent className="flex-grow p-6 space-y-6">
                                        <div className="text-center">
                                            <span className="text-4xl font-extrabold">{plan.price}</span>
                                            <span className="text-muted-foreground">{plan.pricePeriod}</span>
                                            {plan.name === 'Pro' && <p className="text-xs text-muted-foreground mt-1">o $150/año (ahorra 2 meses)</p>}
                                        </div>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="p-6 mt-auto">
                                        <Button className="w-full text-lg py-6" variant={plan.buttonVariant === 'default' ? 'default' : plan.buttonVariant === 'accent' ? 'secondary' : 'outline'}>
                                            {plan.buttonText}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                         </div>
                    </div>
                </section>
            </main>

             <footer className="bg-slate-900 text-white">
                <div className="container py-8 text-center">
                    <p>© {new Date().getFullYear()} Muwise, Inc. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

    