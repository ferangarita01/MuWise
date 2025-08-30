
'use client';
import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, ShieldCheck, FileText, UserCheck, UserX } from "lucide-react";
import { verifySigningToken } from "@/lib/signing-links";
import { updateSignerSignatureAction } from "@/actions/agreement/sign";
import { SignatureCanvas, SignatureCanvasHandle } from "@/components/signature-canvas";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface DecodedToken {
  agreementId: string;
  signerId: string;
  email: string;
  iat: number;
  exp: number;
}

function SignPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'error' | 'unauthenticated' | 'mismatch' | 'ready'>('loading');
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const signatureRef = useRef<SignatureCanvasHandle>(null);

  useEffect(() => {
    if (!token) {
      setError("No se proporcionó un token de firma. El enlace puede ser inválido.");
      setStatus('error');
      return;
    }

    try {
      const decoded = verifySigningToken(token) as DecodedToken;
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setDecodedToken(decoded);
      } else {
        setError("El enlace de firma ha expirado o es inválido.");
        setStatus('error');
        return;
      }
    } catch (e) {
      setError("El enlace de firma es inválido o está malformado.");
      setStatus('error');
      return;
    }
  }, [token]);

  useEffect(() => {
    if (!decodedToken) return;
    if (authLoading) return;

    if (!user) {
      // User is not logged in.
      localStorage.setItem('pendingSignToken', token!);
      router.push('/auth/signin');
      setStatus('unauthenticated');
      return;
    }

    if (user.email !== decodedToken.email) {
      // Logged in user does not match the signer's email
      setError(`Has iniciado sesión como ${user.email}, pero este enlace es para ${decodedToken.email}.`);
      setStatus('mismatch');
      return;
    }

    // All checks passed, ready to sign.
    setStatus('ready');

  }, [token, decodedToken, user, authLoading, router]);

  const handleApplySignature = async () => {
    if (!decodedToken || !signature) {
      toast({ title: "Firma requerida", description: "Por favor, dibuja tu firma antes de continuar.", variant: "destructive" });
      return;
    }
    setIsSigning(true);
    
    const result = await updateSignerSignatureAction({
      agreementId: decodedToken.agreementId,
      signerId: decodedToken.signerId,
      signatureDataUrl: signature,
    });
    
    if (result.status === 'success') {
      toast({ title: '¡Éxito!', description: 'El documento ha sido firmado correctamente.' });
      router.push(`/dashboard/agreements/${decodedToken.agreementId}`);
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' });
      setIsSigning(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
      case 'unauthenticated':
        return (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4 mx-auto" />
            <p>Verificando enlace y sesión...</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mb-4 mx-auto" />
            <h2 className="text-xl font-bold text-red-300 mb-2">Error de Verificación</h2>
            <p className="text-slate-400">{error}</p>
            <Button onClick={() => router.push('/')} className="mt-6">Volver al inicio</Button>
          </div>
        );
      case 'mismatch':
        return (
          <div className="text-center">
            <UserX className="h-12 w-12 text-red-400 mb-4 mx-auto" />
            <h2 className="text-xl font-bold text-red-300 mb-2">Conflicto de Cuentas</h2>
            <p className="text-slate-400">{error}</p>
            <Button onClick={() => router.push('/auth/signin')} className="mt-6">Iniciar Sesión con otra Cuenta</Button>
          </div>
        );
      case 'ready':
        return (
          <>
            <div className="text-center">
              <UserCheck className="mx-auto h-10 w-10 text-indigo-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Solicitud de Firma</h2>
              <p className="text-slate-300 mb-6">Hola, {user?.displayName}! Estás a punto de firmar un documento.</p>
            </div>
            
            <div className="bg-slate-700/50 rounded-md p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Firmante:</span>
                    <span className="font-medium text-slate-200">{decodedToken?.email}</span>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium mb-2 block">Dibuja tu firma en el recuadro</label>
                <SignatureCanvas ref={signatureRef} onSignatureEnd={setSignature} />
                 <div className="flex justify-end mt-2">
                     <Button variant="ghost" size="sm" onClick={() => signatureRef.current?.clear()}>Limpiar</Button>
                </div>
            </div>

            <Button
              onClick={handleApplySignature}
              disabled={isSigning || !signature}
              size="lg"
              className="w-full mt-6"
            >
              {isSigning ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
              ) : (
                <><CheckCircle className="mr-2 h-4 w-4" /> Firmar y Aceptar</>
              )}
            </Button>
            <p className="text-xs text-slate-500 mt-4 text-center flex items-center justify-center gap-1.5"><ShieldCheck className="h-3 w-3"/> Al firmar, aceptas que tu firma electrónica es legalmente vinculante.</p>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-slate-800/50 p-8 shadow-2xl">
        {renderContent()}
      </div>
    </div>
  );
}

export default function SignPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <SignPageComponent />
    </Suspense>
  )
}
