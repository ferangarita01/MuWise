
'use client'
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, FileText, Music, Zap, Github, Twitter, Linkedin, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function Home() {
  const navLinks = [
    { href: "#features", label: "Features", tablet: true, desktop: true },
    { href: "/pricing", label: "Precios", tablet: true, desktop: true },
    { href: "#testimonials", label: "Testimonials", tablet: false, desktop: true },
    { href: "/auth/signin", label: "Sign In", tablet: true, desktop: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="#" className="flex items-center gap-2 font-bold" prefetch={false}>
            <Music className="h-6 w-6 text-primary" />
            <span className="text-lg">Muwise</span>
          </Link>
          
          {/* Desktop & Tablet Navigation */}
          <nav className="ml-auto hidden items-center gap-4 sm:gap-6 md:flex">
            {navLinks.map(link => (
              <Link 
                key={link.label}
                href={link.href} 
                className={cn(
                  "text-sm font-medium hover:underline underline-offset-4",
                  link.tablet ? "md:inline-block" : "hidden md:hidden",
                  link.desktop ? "lg:inline-block" : "hidden lg:hidden"
                )} 
                prefetch={false}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild>
              <Link href="/auth/signup">Try for Free</Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="ml-auto md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm bg-background">
                <nav className="flex flex-col gap-6 p-6 text-lg font-medium">
                   <Link href="#" className="flex items-center gap-2 font-bold self-start mb-4" prefetch={false}>
                      <Music className="h-6 w-6 text-primary" />
                      <span className="text-lg">Muwise</span>
                    </Link>
                    {navLinks.map(link => (
                       <SheetClose asChild key={link.label}>
                          <Link href={link.href} className="text-muted-foreground hover:text-foreground" prefetch={false}>
                            {link.label}
                          </Link>
                       </SheetClose>
                    ))}
                     <SheetClose asChild>
                        <Button asChild className="mt-4">
                           <Link href="/auth/signup">Try for Free</Link>
                        </Button>
                     </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-gray-900 via-gray-900 to-primary/30">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
              Firma acuerdos musicales en segundos
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Digitaliza y asegura tus contratos con un clic. Muwise es la plataforma definitiva para la gestión de derechos musicales.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Probar gratis</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black">
                Solicitar demo
              </Button>
            </div>
            <div className="mt-16 relative">
              <Image 
                src="https://placehold.co/1000x600.png" 
                alt="Muwise App Mockup" 
                width={1000} 
                height={600} 
                className="rounded-lg shadow-2xl mx-auto"
                data-ai-hint="app mockup"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/40">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Características Clave</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6">
                <Zap className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">Firma rápida y segura</h3>
                <p className="text-muted-foreground mt-2">Envía y firma acuerdos en minutos con validez legal.</p>
              </Card>
              <Card className="text-center p-6">
                <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">Gestión automática</h3>
                <p className="text-muted-foreground mt-2">Tus contratos organizados y accesibles en un solo lugar.</p>
              </Card>
              <Card className="text-center p-6">
                <Music className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">Integración musical</h3>
                <p className="text-muted-foreground mt-2">Conecta con tus plataformas y distribuidoras favoritas.</p>
              </Card>
              <Card className="text-center p-6">
                <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">Seguimiento y reportes</h3>
                <p className="text-muted-foreground mt-2">Visualiza el estado de tus acuerdos y regalías al instante.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">¿Cómo Funciona?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                <Image src="https://firebasestorage.googleapis.com/v0/b/new-prototype-rmkd6.firebasestorage.app/o/MuWise.png?alt=media&token=fd763b69-ee6a-4490-8baa-1b01adab9e4a" alt="Create Agreement" width={400} height={300} className="rounded-lg mx-auto mb-4" data-ai-hint="agreement creation" />
                <h3 className="text-2xl font-semibold">1. Crea el acuerdo</h3>
                <p className="text-muted-foreground mt-2">Usa nuestras plantillas o sube tu propio documento.</p>
              </div>
              <div>
                <Image src="https://placehold.co/400x300.png" alt="Digital Signature" width={400} height={300} className="rounded-lg mx-auto mb-4" data-ai-hint="digital signature" />
                <h3 className="text-2xl font-semibold">2. Firma digitalmente</h3>
                <p className="text-muted-foreground mt-2">Invita a los colaboradores a firmar desde cualquier dispositivo.</p>
              </div>
              <div>
                <Image src="https://placehold.co/400x300.png" alt="Save and Share" width={400} height={300} className="rounded-lg mx-auto mb-4" data-ai-hint="sharing document" />
                <h3 className="text-2xl font-semibold">3. Guarda y comparte</h3>
                <p className="text-muted-foreground mt-2">Tu acuerdo queda guardado y listo para ser compartido.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-muted/40">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Lo que dicen nuestros usuarios</h2>
            <Carousel className="max-w-4xl mx-auto">
              <CarouselContent>
                <CarouselItem>
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-4">
                        <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="female producer" />
                        <AvatarFallback>AV</AvatarFallback>
                      </Avatar>
                      <p className="text-lg italic">"Muwise ha transformado la manera en que gestiono mis colaboraciones. Es rápido, fácil y súper profesional."</p>
                      <p className="font-semibold mt-4">Alina Vera</p>
                      <p className="text-sm text-muted-foreground">Productora Musical</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
                <CarouselItem>
                   <Card>
                    <CardContent className="p-8 text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-4">
                        <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="male songwriter" />
                        <AvatarFallback>LR</AvatarFallback>
                      </Avatar>
                      <p className="text-lg italic">"¡Se acabaron los correos interminables y los PDFs! Ahora todo está en un solo lugar. ¡Increíble!"</p>
                      <p className="font-semibold mt-4">Leo Rivera</p>
                      <p className="text-sm text-muted-foreground">Compositor</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-tr from-gray-900 via-gray-900 to-primary/30">
          <div className="container text-center">
            <h2 className="text-4xl font-bold text-white">Tu música, tus reglas, tus contratos.</h2>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Empieza ahora</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white">
        <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold">Muwise</h3>
            <p className="text-muted-foreground">Gestión de acuerdos musicales simplificada.</p>
          </div>
          <div>
            <h4 className="font-semibold">Producto</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="#features" className="text-muted-foreground hover:text-white">Características</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white">Precios</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white">Seguridad</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Compañía</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="#" className="text-muted-foreground hover:text-white">Sobre nosotros</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white">Contacto</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-2 space-y-1">
              <li><Link href="#" className="text-muted-foreground hover:text-white">Política de Privacidad</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-white">Términos de Servicio</Link></li>
            </ul>
             <div className="flex mt-4 space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-white"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-white"><Github className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-white"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>
        </div>
        <div className="bg-slate-950 py-4">
           <div className="container text-center text-sm text-muted-foreground">
             © {new Date().getFullYear()} Muwise, Inc. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

    