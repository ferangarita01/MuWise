
import { Resend } from "resend";
import jwt from "jsonwebtoken";

// This service is now self-contained and does not depend on Firebase.

export class EmailService {
  async sendSignatureRequest({
    email,
    agreementId,
    signerId,
    agreementTitle,
  }: {
    email: string;
    agreementId: string;
    signerId: string; // Use signerId for a more specific token
    agreementTitle: string;
  }): Promise<void> {
    const { RESEND_API_KEY, EMAIL_FROM, JWT_SECRET, NEXT_PUBLIC_BASE_URL } = process.env;

    // --- MEJORA: Validación robusta de variables de entorno ---
    if (!RESEND_API_KEY) {
      console.error("Email service error: RESEND_API_KEY is not configured.");
      throw new Error("El servicio de correo no está configurado correctamente (falta la clave de API).");
    }
    if (!EMAIL_FROM) {
      console.error("Email service error: EMAIL_FROM is not configured.");
      throw new Error("El servicio de correo no está configurado correctamente (falta el remitente).");
    }
    if (!JWT_SECRET) {
      console.error("Email service error: JWT_SECRET is not configured.");
      throw new Error("La seguridad para los enlaces de firma no está configurada.");
    }
    if (!NEXT_PUBLIC_BASE_URL) {
      console.error("Email service error: NEXT_PUBLIC_BASE_URL is not configured.");
      throw new Error("La URL base de la aplicación no está configurada.");
    }
    // --- FIN DE LA MEJORA ---

    const resend = new Resend(RESEND_API_KEY);

    // Create a secure token containing the necessary info
    const token = jwt.sign(
      { agreementId, signerId, email },
      JWT_SECRET,
      { expiresIn: "7d" } // Token is valid for 7 days
    );

    // The signature link now uses the /sign route with a token parameter
    const signatureUrl = `${NEXT_PUBLIC_BASE_URL}/sign?token=${token}`;

    try {
      await resend.emails.send({
        from: `Muwise <${EMAIL_FROM}>`, // Use a static, trusted sender name
        to: email,
        subject: `Solicitud de firma para: ${agreementTitle}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Solicitud de Firma de Documento</h2>
            <p>Hola,</p>
            <p>Has sido invitado a firmar el acuerdo: <strong>"${agreementTitle}"</strong>.</p>
            <p style="margin: 20px 0;">
              <a href="${signatureUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Revisar y Firmar Acuerdo
              </a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">Enviado a través de Muwise.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending email via Resend:", error);
      // Re-throw the error so the calling action can handle it
      throw new Error("El servicio de correo no pudo enviar la solicitud. Por favor, inténtalo de nuevo más tarde.");
    }
  }
}
