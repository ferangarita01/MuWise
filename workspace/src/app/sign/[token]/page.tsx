'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importar useRouter
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Contract, Signer } from '@/types/legacy';

interface SignerData {
  email: string;
  agreementTitle: string;
  status: "pending" | "signed";
  documentUrl?: string;
}

export default function SignPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const router = useRouter(); // Inicializar el router
  const [signer, setSigner] = useState<SignerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSigner() {
      try {
        const res = await fetch(`/api/sign/getSigner?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Enlace inválido o expirado");
        } else if (data.status === "signed") {
          setError("Este acuerdo ya ha sido firmado.");
        } else {
          setSigner(data);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar los datos de la firma");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchSigner();
    }
  }, [token]);

  const handleSign = async () => {
    if (!signer) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/sign/completeSigner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "No se pudo completar la firma");
      }

      alert("Documento firmado exitosamente. Serás redirigido.");
      router.push('/'); // Redirigir a la página de inicio
    } catch (err: any) {
      alert(err.message || "Error al firmar");
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Cargando acuerdo...</p>
        </div>
    );
  }
  
  if (error) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-center">{error}</p>
            <Button onClick={() => router.push('/')} className="mt-6">Volver al inicio</Button>
        </div>
    );
  }

  if (!signer) return null; // No mostrar nada si no hay datos de firmante

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-slate-800/50 p-8 text-center shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Solicitud de Firma</h2>
        <p className="text-slate-300 mb-6">Estás a punto de firmar el siguiente acuerdo:</p>
        
        <div className="bg-slate-700/50 rounded-md p-4 mb-8">
            <p className="text-lg font-semibold">{signer.agreementTitle}</p>
            <p className="text-sm text-slate-400">A ser firmado por: {signer.email}</p>
        </div>

        <Button
          onClick={handleSign}
          disabled={loading || signer.status === "signed"}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
            </>
          ) : "Firmar Documento"}
        </Button>
        <p className="text-xs text-slate-500 mt-4">Al hacer clic, aceptas que tu firma electrónica es legalmente vinculante.</p>
      </div>
    </div>
  );
}
