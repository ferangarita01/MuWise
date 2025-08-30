// src/app/api/sign/completeSigner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

    // Buscar firmante por token
    const signerSnap = await adminDb
      .collectionGroup("signers")
      .where("__name__", "==", token)
      .get();

    if (signerSnap.empty) {
      return NextResponse.json({ error: "Token inválido" }, { status: 404 });
    }

    const docRef = signerSnap.docs[0].ref;
    const data = signerSnap.docs[0].data();

    if (data.status === "signed") {
      return NextResponse.json({ error: "Acuerdo ya firmado" }, { status: 400 });
    }

    // Marcar como firmado
    await docRef.update({
      status: "signed",
      signedAt: new Date(),
    });

    return NextResponse.json({ message: "Documento firmado correctamente" });
  } catch (error: any) {
    console.error("Error en completeSigner:", error);
    return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 500 });
  }
}
