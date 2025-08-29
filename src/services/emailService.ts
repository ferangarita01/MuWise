
import { createTransport } from 'nodemailer';

export class EmailService {
  private getTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email service is not configured. Please set SMTP variables in your .env file.');
    }

    return createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendSignatureRequest({
    email,
    agreementId,
    agreementTitle,
    requesterName,
    requesterEmail // Añadimos el email del solicitante para el 'reply_to'
  }: {
    email: string;
    agreementId: string;
    agreementTitle: string;
    requesterName: string;
    requesterEmail: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    const signatureUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/agreements/${agreementId}`;

    const finalRequesterName = requesterName?.trim() || 'El equipo de Muwise';

    // Según la documentación de Resend, el campo 'from' debe ser una dirección verificada.
    // Usamos la dirección de onboarding para desarrollo/pruebas. En producción, debería ser una del dominio verificado.
    // El nombre del solicitante se mueve al cuerpo del correo y al campo 'replyTo'.
    const mailOptions = {
      from: `Muwise <onboarding@resend.dev>`, // Remitente estático y verificado
      to: email,
      replyTo: `"${finalRequesterName}" <${requesterEmail}>`, // El usuario responde al solicitante real
      subject: `Solicitud de firma para: ${agreementTitle}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Solicitud de Firma de Documento</h2>
          <p>Hola,</p>
          <p><strong>${finalRequesterName}</strong> te ha invitado a firmar el acuerdo: <strong>"${agreementTitle}"</strong>.</p>
          <p>Por favor, revisa y firma el documento haciendo clic en el siguiente enlace:</p>
          <p style="margin: 20px 0;">
            <a href="${signatureUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Revisar y Firmar Acuerdo
            </a>
          </p>
          <p>Si tienes alguna pregunta sobre el acuerdo, por favor responde a este correo para contactar directamente a ${finalRequesterName}.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Enviado a través de Muwise.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
