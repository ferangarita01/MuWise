
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Music, Star, Rocket, Building, Shield, Leaf, Mic2, Building2, BadgePercent, Stars, Sparkles, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function PricingPage() {
    const [yearly, setYearly] = useState(false);
    const [prices, setPrices] = useState({
        free: '0',
        creator: '7.99',
        pro: '15.00'
    });

    useEffect(() => {
        const priceElements = document.querySelectorAll('[data-price]');
        
        const format = (n: number | string) => {
          const num = Number(n);
          return num.toLocaleString('es-ES', { minimumFractionDigits: num % 1 ? 2 : 0, maximumFractionDigits: 2 }).replace(',', '.');
        };

        priceElements.forEach(el => {
            const monthly = el.getAttribute('data-monthly');
            const yearlyVal = el.getAttribute('data-yearly');
            const use = yearly ? yearlyVal : monthly;
            if (use) {
                el.textContent = `$${format(use)}`;
            }
        });

    }, [yearly]);

    const handleToggle = () => {
        setYearly(prev => !prev);
    }

    return (
        <div className="min-h-screen text-slate-100 bg-[#0b0d13]" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji" }}>
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-x-0 top-[-25%] h-[420px] bg-gradient-to-b from-violet-600/40 via-fuchsia-500/20 to-transparent blur-3xl"></div>
            </div>

            <header className="sticky top-0 z-30 backdrop-blur-sm bg-[#0b0d13]/70 border-b border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600/90 ring-1 ring-white/10 shadow-lg shadow-violet-600/30">
                            <Music className="h-5 w-5" />
                        </span>
                        <span className="sm:text-lg text-base font-semibold tracking-tight">MuWIse</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
                        <Link href="/#caracteristicas" className="transition hover:text-white">Características</Link>
                        <Link href="/#como-funciona" className="transition hover:text-white">Cómo funciona</Link>
                        <Link href="/#testimonios" className="transition hover:text-white">Testimonios</Link>
                        <Link href="/#precios" className="transition hover:text-white">Precios</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link href="/auth/signin" className="text-sm text-slate-300 hover:text-white transition">Iniciar sesión</Link>
                        <Button asChild>
                            <Link href="/auth/signup" className="inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 px-3.5 py-2 text-sm font-medium tracking-tight shadow-sm hover:shadow transition">
                                <Sparkles className="h-4 w-4" />
                                Probar gratis
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main>
                <section className="max-w-7xl sm:px-6 lg:px-8 sm:pt-20 mr-auto ml-auto pt-14 pr-4 pl-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            <Stars className="h-3.5 w-3.5" />
                            Nuevos planes con firmas digitales y reportes avanzados
                        </p>
                        <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                            Planes pensados para cada ritmo y cada talento
                        </h1>
                        <p className="mt-4 text-slate-300 text-base sm:text-lg">
                            Ya seas artista, banda, DJ o productor, tenemos un plan que se ajusta a tu forma de trabajar.
                        </p>
                    </div>

                    <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-6">
                        <div className="w-full sm:w-[340px] h-[220px] rounded-xl overflow-hidden ring-1 ring-white/10 bg-white/5">
                            <Image alt="Artista tocando guitarra" className="h-full w-full object-cover" width={800} height={800} src="https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/sing1.jpg?alt=media&token=72b33a6c-5a33-466a-a1c4-1c62589bdc8c" data-ai-hint="guitar artist" />
                        </div>
                        <div className="w-full sm:w-[520px] h-[220px] rounded-xl overflow-hidden ring-1 ring-white/10 bg-white/5">
                            <Image src="https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/djs.avif?alt=media&token=e43b4a30-7bd2-4d67-a031-5d75b1ab000c" alt="Estudio y mezcla" className="h-full w-full object-cover" width={1600} height={800} data-ai-hint="music studio" />
                        </div>
                        <div className="w-full sm:w-[280px] h-[220px] rounded-xl overflow-hidden ring-1 ring-white/10 bg-white/5">
                            <Image src="https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/img6.jpg?alt=media&token=8d5c0dd4-dc3d-4d48-871d-66e738b7b32b" alt="Render minimal" className="h-full w-full object-cover" width={800} height={800} data-ai-hint="minimal render" />
                        </div>
                    </div>

                    <div className="flex mt-12 items-center justify-center">
                        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2.5 py-2">
                            <span className="text-sm text-slate-300">Mensual</span>
                            <button id="billingToggle" type="button" aria-pressed={yearly} onClick={handleToggle} className={cn("relative h-7 w-12 rounded-full ring-1 ring-white/10 transition", yearly ? 'bg-violet-600' : 'bg-slate-700/60')}>
                                <span className={cn("absolute inset-y-0 left-1 my-auto h-5 w-5 rounded-full bg-white shadow-sm transition-transform", yearly ? 'translate-x-[20px]' : 'translate-x-0')}></span>
                            </button>
                            <span className="text-sm text-slate-300">Anual</span>
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 px-2 py-0.5 text-xs ring-1 ring-emerald-400/20">
                                <BadgePercent className="h-3.5 w-3.5" />
                                Ahorra 20%
                            </span>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
                            <CardHeader className="p-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold tracking-tight text-white">Gratis</h3>
                                    <Leaf className="h-5 w-5 text-slate-300" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="mt-4">
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-semibold tracking-tight" data-price data-monthly="0" data-yearly="0">$0</span>
                                        <span className="text-sm text-slate-400">/mes</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-300">Para artistas que dan sus primeros pasos.</p>
                                </div>
                                <ul className="mt-5 space-y-3 text-sm">
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5" />Hasta 3 contratos al mes</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5" />Firma digital básica</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5" />Soporte por email</li>
                                </ul>
                            </CardContent>
                            <CardFooter className="p-0">
                                <Button asChild className="mt-6 w-full">
                                    <Link href="#">Empieza Gratis</Link>
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
                            <CardHeader className="p-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold tracking-tight text-white">Creador</h3>
                                    <Mic2 className="h-5 w-5 text-slate-300" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="mt-4">
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-semibold tracking-tight" data-price data-monthly="7.99" data-yearly="6.00">$7.99</span>
                                        <span className="text-sm text-slate-400">/mes</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-300">Gestión de contratos y reportes básicos.</p>
                                </div>
                                <ul className="mt-5 space-y-3 text-sm">
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5" />Hasta 20 contratos al mes</li>
                                    <li className="flex gap-3 text-slate-200 items-start"><Check className="h-4 w-4 text-emerald-400 mt-0.5" />Firma digital avanzada básica</li>
                                    <li className="flex gap-3 text-slate-200 items-start"><Check className="h-4 w-4 text-emerald-400 mt-0.5" />Solicita firmas de los artistas</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5" />Reportes básicos de regalías</li>
                                </ul>
                            </CardContent>
                            <CardFooter className="p-0">
                                <Button asChild className="mt-6 w-full bg-violet-600/90 text-white ring-1 ring-white/10 hover:bg-violet-500 transition">
                                    <Link href="#">Elegir Creador</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        
                        <Card className="relative rounded-2xl border border-violet-400/30 bg-gradient-to-b from-violet-600/10 to-transparent p-6 shadow-[0_0_0_1px_rgba(139,92,246,0.3),0_10px_30px_-10px_rgba(139,92,246,0.5)]">
                             <div className="absolute -top-3 right-4">
                                <span className="rounded-full bg-violet-600 text-white px-2.5 py-1 text-[11px] font-medium tracking-tight shadow ring-1 ring-white/10">
                                Más popular
                                </span>
                            </div>
                            <CardHeader className="p-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold tracking-tight text-white">Pro</h3>
                                    <Star className="h-5 w-5 text-violet-300" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="mt-4">
                                    <div className="flex items-end gap-1">
                                    <span className="text-3xl font-semibold tracking-tight" data-price data-monthly="15.00" data-yearly="12.00">$15</span>
                                    <span className="text-sm text-slate-400">/mes</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-300">Para profesionales, bandas y managers con múltiples catálogos.</p>
                                </div>
                                <ul className="mt-5 space-y-3 text-sm">
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Contratos ilimitados</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Firma digital avanzada con API</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Integraciones completas (Spotify, YouTube, DistroKid)</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Reportes avanzados y dashboard</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Soporte chat + email</li>
                                </ul>
                            </CardContent>
                            <CardFooter className="p-0">
                                <Button asChild className="mt-6 w-full">
                                    <Link href="#">Sube a Pro</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        
                        <Card className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
                            <CardHeader className="p-0">
                                <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold tracking-tight text-white">Empresarial</h3>
                                <Building2 className="h-5 w-5 text-slate-300" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="mt-4">
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-semibold tracking-tight">Custom</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-300">Diseñado a medida para sellos y corporativos.</p>
                                </div>
                                <ul className="mt-5 space-y-3 text-sm">
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Todo de Pro + permisos/roles</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Integración con API completa</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Soporte dedicado 24/7</li>
                                    <li className="flex items-start gap-3 text-slate-200"><Check className="h-4 w-4 text-emerald-400 mt-0.5"/>Consultoría legal incluida</li>
                                </ul>
                            </CardContent>
                            <CardFooter className="p-0">
                                <Button asChild className="mt-6 w-full bg-violet-600/90 text-white ring-1 ring-white/10 hover:bg-violet-500 transition">
                                    <Link href="#">Contactar</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                <section id="comparison" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
                    <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-white">Compara los Planes</h2>
                    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                        <div className="hidden lg:grid grid-cols-12 bg-white/[0.03] text-sm text-slate-300">
                        <div className="col-span-4 px-4 py-3">Característica</div>
                        <div className="col-span-2 px-4 py-3 text-center">Gratis</div>
                        <div className="col-span-2 px-4 py-3 text-center">Creador</div>
                        <div className="col-span-2 px-4 py-3 text-center">Pro</div>
                        <div className="col-span-2 px-4 py-3 text-center">Empresarial</div>
                        </div>
                        <div className="divide-y divide-white/10">
                        <div className="grid grid-cols-2 lg:grid-cols-12 text-sm">
                            <div className="col-span-1 lg:col-span-4 px-4 py-3 text-slate-300">Cuota/mes</div>
                            <div className="col-span-1 lg:col-span-2 px-4 py-3 lg:text-center">$0</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">$7.99</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">$15</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Custom</div>

                            <div className="lg:hidden col-span-1 px-4 py-3 text-right">Creador: $7.99 · Pro: $15 · Emp: Custom</div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-12 text-sm">
                            <div className="col-span-1 lg:col-span-4 px-4 py-3 text-slate-300">Tipos de firma</div>
                            <div className="col-span-1 lg:col-span-2 px-4 py-3 lg:text-center">Básica</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Avanzada básica</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Avanzada con API</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Avanzada con API</div>
                            <div className="lg:hidden col-span-1 px-4 py-3 text-right">Creador: Avanzada básica · Pro/Emp: Avanzada con API</div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-12 text-sm">
                            <div className="col-span-1 lg:col-span-4 px-4 py-3 text-slate-300">Plataformas integradas</div>
                            <div className="col-span-1 lg:col-span-2 px-4 py-3 lg:text-center">Spotify (limitado)</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">YouTube + Spotify (básico)</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Completas</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">API Completa</div>
                            <div className="lg:hidden col-span-1 px-4 py-3 text-right">Creador: YT+Spotify · Pro: Completas · Emp: API</div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-12 text-sm">
                            <div className="col-span-1 lg:col-span-4 px-4 py-3 text-slate-300">Reportes de regalías</div>
                            <div className="col-span-1 lg:col-span-2 px-4 py-3 lg:text-center">Básicos</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Básicos</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Avanzados</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Personalizados</div>
                            <div className="lg:hidden col-span-1 px-4 py-3 text-right">Pro: Avanzados · Emp: Personalizados</div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-12 text-sm">
                            <div className="col-span-1 lg:col-span-4 px-4 py-3 text-slate-300">Soporte</div>
                            <div className="col-span-1 lg:col-span-2 px-4 py-3 lg:text-center">Email</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Email prioritario</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Chat + Email</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Dedicado 24/7</div>
                            <div className="lg:hidden col-span-1 px-4 py-3 text-right">Creador: Email+ · Pro: Chat · Emp: 24/7</div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-12 text-sm">
                            <div className="col-span-1 lg:col-span-4 px-4 py-3 text-slate-300">Consultoría legal</div>
                            <div className="col-span-1 lg:col-span-2 px-4 py-3 lg:text-center">No</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">No</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">No</div>
                            <div className="hidden lg:block col-span-2 px-4 py-3 text-center">Incluida</div>
                            <div className="lg:hidden col-span-1 px-4 py-3 text-right">Empresarial: Incluida</div>
                        </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl sm:px-6 lg:px-8 mt-16 mr-auto mb-16 ml-auto pr-4 pl-4">
                    <div className="relative overflow-hidden sm:p-12 bg-gradient-to-r from-violet-600/60 via-fuchsia-600/50 to-indigo-600/60 border-white/10 border rounded-3xl pt-8 pr-8 pb-8 pl-8">
                        <div className="relative z-10">
                            <h3 className="sm:text-3xl text-2xl font-semibold text-white tracking-tight">
                                Convierte tus acuerdos en música que fluye
                            </h3>
                            <p className="mt-2 text-slate-200">
                                Empieza gratis y cambia cuando lo necesites. Sin tarjetas hasta seleccionar un plan de pago.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-6 items-center">
                                <Button asChild>
                                    <Link href="#" className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2.5 text-sm font-medium tracking-tight shadow-sm hover:shadow transition">
                                        <Rocket className="h-4 w-4" />
                                        Empezar ahora
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="bg-black/20 text-white ring-1 ring-white/30 hover:bg-black/30 transition">
                                     <Link href="#" className="inline-flex items-center gap-2 rounded-xl text-white px-4 py-2.5 text-sm font-medium tracking-tight">
                                        <PlayCircle className="h-4 w-4" />
                                        Ver demo
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="border-t border-white/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Music className="h-4 w-4" />
                    <span>© 2025 Muwise, Inc. Todos los derechos reservados.</span>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-slate-400">
                    <Link href="#" className="hover:text-white transition">Privacidad</Link>
                    <Link href="#" className="hover:text-white transition">Términos</Link>
                    <Link href="#" className="hover:text-white transition">Estado</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

    
