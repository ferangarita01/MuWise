'use client'; // <-- Add this line

    // src/app/sign/[token]/page.tsx
    import { useEffect, useState } from "react";

    // ... the rest of your code
interface SignerData {
  email: string;
  agreementTitle: string;
  status: "pending" | "signed";
  documentUrl?: string;
}

export default function SignPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [signer, setSigner] = useState<SignerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSigner() {
      try {
        const res = await fetch(`/api/sign/getSigner?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Enlace inválido");
        } else if (data.status === "signed") {
          setError("Este acuerdo ya ha sido firmado.");
        } else {
          setSigner(data);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar la firma");
      } finally {
        setLoading(false);
      }
    }

    fetchSigner();
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

      if (!res.ok) throw new Error("No se pudo completar la firma");

      alert("Documento firmado exitosamente!");
      setSigner({ ...signer, status: "signed" });
    } catch (err: any) {
      alert(err.message || "Error al firmar");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;
  if (!signer) return <p>Firmante no encontrado</p>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h2>Firma del Acuerdo: {signer.agreementTitle}</h2>
      <p>Firmante: {signer.email}</p>

      <button
        onClick={handleSign}
        disabled={loading || signer.status === "signed"}
        style={{
          backgroundColor: "#7c3aed",
          color: "white",
          padding: "12px 24px",
          borderRadius: 8,
          fontWeight: "bold",
        }}
      >
        {loading ? "Procesando..." : "Firmar Documento"}
      </button>
    </div>
  );
}
