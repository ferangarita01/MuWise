"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { Button } from "@/components/ui/button";

export default function SignPage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    async function verifyToken() {
      try {
        const res = await fetch(`/api/sign/verify?token=${token}`);
        if (!res.ok) throw new Error("Invalid token");
        const data = await res.json();
        setAgreementId(data.agreementId);
        setParticipantId(data.participantId);
        setStatus("valid");
      } catch (err) {
        console.error(err);
        setStatus("invalid");
      }
    }
    if (token) verifyToken();
  }, [token]);

  const handleSign = async () => {
    const res = await fetch(`/api/sign/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      alert("✅ Contrato firmado con éxito");
    } else {
      alert("❌ No se pudo firmar el contrato");
    }
  };

  if (status === "loading") return <p>Verificando token...</p>;
  if (status === "invalid") return <p style={{ color: "red" }}>Token inválido o expirado</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">Firma del contrato</h1>
      <p>Contrato: {agreementId}</p>
      <p>Participante: {participantId}</p>
      <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={handleSign}>
        Firmar contrato
      </Button>
    </div>
  );
}

