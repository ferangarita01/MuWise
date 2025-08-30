// src/app/api/sign/getSigner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

    // Buscar firmante por token
    const signerSnap = await adminDb
      .collectionGroup("signers")
      .where("__name__", "==", token)
      .get();

    if (signerSnap.empty) {
      return NextResponse.json({ error: "Token inválido" }, { status: 404 });
    }

    const docRef = signerSnap.docs[0];
    const data = docRef.data();

    return NextResponse.json({
      email: data.email,
      agreementTitle: data.agreementTitle,
      status: data.status,
      documentUrl: data.documentUrl || null,
    });
  } catch (error: any) {
    console.error("Error en getSigner:", error);
    return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 500 });
  }
}
