
// /src/app/api/auth/session/route.ts
import { adminAuth } from '@/lib/firebase-server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Define el tiempo de vida de la sesión en milisegundos.
// 5 días, para coincidir con la validez por defecto del token de sesión de Firebase.
const expiresIn = 60 * 60 * 24 * 5 * 1000; 

// POST: Crea una cookie de sesión a partir de un ID Token de Firebase.
export async function POST(request: Request) {
  const { idToken } = await request.json();

  try {
    // Crea la cookie de sesión del lado del servidor.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    // Configura las opciones de la cookie.
    // `httpOnly` la hace inaccesible al JavaScript del cliente (más segura).
    // `secure` asegura que solo se envíe por HTTPS.
    (await
      // Configura las opciones de la cookie.
      // `httpOnly` la hace inaccesible al JavaScript del cliente (más segura).
      // `secure` asegura que solo se envíe por HTTPS.
      cookies()).set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session cookie creation failed:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to create session' }, { status: 401 });
  }
}

// DELETE: Cierra la sesión eliminando la cookie.
export async function DELETE() {
  try {
    // Elimina la cookie del navegador.
    await (await cookies()).delete('session');
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Session cookie deletion failed:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to delete session' }, { status: 500 });
  }
}
