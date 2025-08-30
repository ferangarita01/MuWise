
import { Resend } from "resend";
import jwt from "jsonwebtoken";

// This service is now self-contained and does not depend on Firebase.

export class EmailService {
  async sendSignatureRequest({
    email,
    agreementId,
    signerId,
    agreementTitle,
    requesterName,
  }: {
    email: string;
    agreementId: string;
    signerId: string; // Use signerId for a more specific token
    agreementTitle: string;
    requesterName: string;
  }): Promise<void> {
    const { RESEND_API_KEY, EMAIL_FROM, JWT_SECRET, NEXT_PUBLIC_BASE_URL } = process.env;

    if (!RESEND_API_KEY) throw new Error("Resend API Key is not configured.");
    if (!EMAIL_FROM) throw new Error("Sender email (EMAIL_FROM) is not configured.");
    if (!JWT_SECRET) throw new Error("JWT_SECRET for signing links is not configured.");
    if (!NEXT_PUBLIC_BASE_URL) throw new Error("Base URL (NEXT_PUBLIC_BASE_URL) is not configured.");

    const resend = new Resend(RESEND_API_KEY);

    // Create a secure token containing the necessary info
    const token = jwt.sign(
      { agreementId, signerId, email },
      JWT_SECRET,
      { expiresIn: "7d" } // Token is valid for 7 days
    );

    // The signature link now contains the secure token
    const signatureUrl = `${NEXT_PUBLIC_BASE_URL}/sign/${agreementId}?token=${token}`;

    try {
      await resend.emails.send({
        from: `"${requesterName}" <${EMAIL_FROM}>`,
        to: email,
        subject: `Solicitud de firma para: ${agreementTitle}`,
        reply_to: EMAIL_FROM, // Ensure replies go to a monitored address
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Solicitud de Firma de Documento</h2>
            <p>Hola,</p>
            <p>Has sido invitado a firmar el acuerdo: <strong>"${agreementTitle}"</strong>.</p>
            <p>Por favor, revisa y firma el documento haciendo clic en el siguiente enlace seguro:</p>
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
      throw error;
    }
  }
}
