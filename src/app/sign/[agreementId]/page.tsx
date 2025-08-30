"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDatabase, ref, get } from "firebase/database";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/lib/firebase-client"; // 👈 ajusta según tu proyecto

initializeApp(firebaseConfig);

export default function SignPage() {
  const { token } = useParams() as { token: string };
  const [status, setStatus] = useState<"loading" | "invalid" | "valid">("loading");
  const [agreementId, setAgreementId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      const db = getDatabase();
      const snap = await get(ref(db, `signatures/invitations/${token}`));

      if (!snap.exists()) {
        setStatus("invalid");
        return;
      }

      const invitation = snap.val();
      if (!invitation.valid) {
        setStatus("invalid");
        return;
      }

      setAgreementId(invitation.agreementId);
      setStatus("valid");
    };

    fetchInvitation();
  }, [token]);

  if (status === "loading") return <p className="p-6">🔄 Validando invitación...</p>;

  if (status === "invalid")
    return <p className="p-6 text-red-500 font-bold">❌ Enlace inválido o expirado.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Firma de Acuerdo</h1>
      <p className="mb-4">Estás invitado a firmar el acuerdo:</p>
      <p className="font-mono bg-gray-100 p-2 rounded">{agreementId}</p>

      {/* 👇 Aquí renderizas tu componente de firma real */}
      <button className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg">
        Firmar Documento
      </button>
    </div>
  );
}
