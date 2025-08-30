// src/app/api/agreements/addSigner/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";
import { EmailService } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email, agreementId, agreementTitle } = await req.json();

    if (!email || !agreementId || !agreementTitle) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // 🔑 Generar token único para este firmante
    const token = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    // 🔹 Guardar firmante en Firestore bajo el acuerdo
    await adminDb
      .collection("agreements")
      .doc(agreementId)
      .collection("signers")
      .doc(token)
      .set({
        email,
        status: "pending",
        createdAt: new Date(),
      });

    // 🔹 Enviar email con enlace seguro
    const emailService = new EmailService();
    await emailService.sendSignatureRequest({
      email,
      agreementId: token, // usamos el token en lugar del ID real
      agreementTitle,
    });

    return NextResponse.json({ message: "Firmante agregado y correo enviado" });
  } catch (error: any) {
    console.error("Error en addSigner:", error);
    return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 500 });
  }
}
