
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Music, Star, Rocket, Building, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const plans = [
    {
        name: "Gratis",
        price: "$0",
        pricePeriod: "/mes",
        description: "Ideal para artistas emergentes que empiezan a gestionar sus primeros acuerdos.",
        features: [
            "Hasta 3 contratos al mes",
            "Firma digital básica",
            "Integración con Spotify limitada",
            "Soporte por email",
        ],
        buttonText: "Empieza Gratis",
        buttonClasses: "bg-primary text-primary-foreground hover:bg-primary/90",
        isFeatured: false,
        icon: Rocket,
    },
    {
        name: "Creador",
        price: "$7.99",
        pricePeriod: "/mes",
        description: "Para creadores que necesitan más flexibilidad y herramientas de reporte.",
        features: [
            "Hasta 20 contratos al mes",
            "Firma digital avanzada básica",
            "Integraciones con YouTube y Spotify limitadas",
            "Reportes básicos de regalías",
            "Soporte por email prioritario",
        ],
        buttonText: "Elegir Creador",
        buttonClasses: "bg-accent text-accent-foreground hover:bg-accent/90",
        isFeatured: false,
        icon: Shield,
    },
    {
        name: "Pro",
        price: "$15",
        pricePeriod: "/mes",
        description: "Perfecto para profesionales, bandas y managers que gestionan múltiples proyectos.",
        features: [
            "Contratos ilimitados",
            "Firma digital avanzada con API",
            "Integraciones completas con Spotify, YouTube, DistroKid",
            "Reportes avanzados y exportación",
            "Soporte chat + email",
        ],
        buttonText: "Sube a Pro",
        buttonClasses: "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90",
        isFeatured: true,
        icon: Star,
    },
    {
        name: "Empresarial",
        price: "Custom",
        pricePeriod: "",
        description: "Diseñado para sellos y agencias con necesidades a gran escala.",
        features: [
            "Todo del Pro + personalizaciones",
            "Integración API completa",
            "Soporte dedicado 24/7",
            "Consultoría legal incluida",
        ],
        buttonText: "Contactar",
        buttonClasses: "bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground",
        isFeatured: false,
        icon: Building,
    }
];

const comparisonFeatures = [
    { name: "Contratos/mes", free: "3", creator: "20", pro: "Ilimitados", business: "Ilimitados" },
    { name: "Tipos de firma", free: "Básica", creator: "Avanzada básica", pro: "Avanzada con API", business: "Avanzada con API" },
    { name: "Plataformas integradas", free: "Spotify (limitada)", creator: "YT & Spotify (limitadas)", pro: "Completas", business: "API Completa" },
    { name: "Reportes de regalías", free: "No", creator: "Básicos", pro: "Avanzados", business: "Personalizados" },
    { name: "Soporte", free: "Email", creator: "Email prioritario", pro: "Chat + Email", business: "Dedicado 24/7" },
    { name: "Consultoría legal", free: "No", creator: "No", pro: "No", business: "Incluida" },
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
                <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-primary via-background to-accent py-20 md:py-32">
                    <div className="absolute inset-0 z-0">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wave-grind.png')] opacity-5"></div>
                    </div>
                    <div className="container relative z-10 text-center text-white">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter drop-shadow-lg">
                            Planes pensados para cada ritmo y cada talento
                        </h1>
                        <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-primary-foreground/80">
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
                                src="https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/MuWise%20songwriters%20(1).png?alt=media&token=c9c22786-46c9-4acf-ba92-80cc524cb499"
                                alt="DJ mixing music"
                                width={400}
                                height={500}
                                className="rounded-lg shadow-2xl object-cover transform hover:scale-105 transition-transform duration-500"
                                data-ai-hint="DJ mixing"
                            />
                            <Image 
                                src="https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/sing1.jpg?alt=media&token=72b33a6c-5a33-466a-a1c4-1c62589bdc8c"
                                alt="Muwise app on laptop"
                                width={600}
                                height={400}
                                className="rounded-lg shadow-2xl col-span-2 transform hover:scale-105 transition-transform duration-500"
                                data-ai-hint="app mockup"
                            />
                             <Image 
                                src="https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/img03.avif?alt=media&token=a8385a81-4a57-4170-9831-4170367098e9"
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
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                            {plans.map((plan) => (
                                 <Card key={plan.name} className={cn('flex flex-col border-2 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20', plan.isFeatured ? 'border-primary shadow-2xl shadow-primary/20 scale-105' : 'border-border')}>
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
                                            {(plan.name === 'Creador' || plan.name === 'Pro') && <p className="text-xs text-muted-foreground mt-1">facturado anualmente</p>}
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
                                        <Button className={cn("w-full text-lg py-6", plan.buttonClasses)}>
                                            {plan.buttonText}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                         </div>
                    </div>
                </section>

                 {/* Comparison Table Section */}
                <section id="comparison" className="py-20 md:py-28 bg-muted/40">
                    <div className="container">
                        <h2 className="text-3xl font-bold text-center mb-12">Compara los Planes</h2>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-center">
                                <thead className="bg-muted">
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-semibold">Características</th>
                                        <th className="p-4 font-semibold">Gratis</th>
                                        <th className="p-4 font-semibold">Creador</th>
                                        <th className="p-4 font-semibold">Pro</th>
                                        <th className="p-4 font-semibold">Empresarial</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonFeatures.map((feature) => (
                                        <tr key={feature.name} className="border-b last:border-b-0">
                                            <td className="text-left font-medium p-4">{feature.name}</td>
                                            <td className="p-4 text-muted-foreground">{feature.free}</td>
                                            <td className="p-4 text-muted-foreground">{feature.creator}</td>
                                            <td className="p-4 text-muted-foreground">{feature.pro}</td>
                                            <td className="p-4 text-muted-foreground">{feature.business}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-20 bg-gradient-to-tr from-accent to-primary">
                    <div className="container text-center text-white">
                        <h2 className="text-4xl font-bold">Convierte tus acuerdos en música que fluye</h2>
                        <div className="mt-8">
                            <Button size="lg" className="bg-white text-primary hover:bg-gray-200" asChild>
                                <Link href="/auth/signup">Empieza ahora</Link>
                            </Button>
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
