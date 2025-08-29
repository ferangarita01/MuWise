
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
  }: {
    email: string;
    agreementId: string;
    agreementTitle: string;
    requesterName: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    const signatureUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/agreements/${agreementId}`;
    
    const mailOptions = {
      from: `"${requesterName}" <onboarding@resend.dev>`,
      to: email,
      subject: `Solicitud de firma para: ${agreementTitle}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Solicitud de Firma de Documento</h2>
          <p>Hola,</p>
          <p><strong>${requesterName}</strong> te ha invitado a firmar el acuerdo: <strong>"${agreementTitle}"</strong>.</p>
          <p>Por favor, revisa y firma el documento haciendo clic en el siguiente enlace:</p>
          <p style="margin: 20px 0;">
            <a href="${signatureUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Revisar y Firmar Acuerdo
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Enviado a través de Muwise.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
