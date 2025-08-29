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
    requesterName
  }: {
    email: string;
    agreementId: string;
    agreementTitle: string;
    requesterName: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    const signatureUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/agreements/${agreementId}`;

    const mailOptions = {
      from: `"${requesterName} via Muwise" <${process.env.EMAIL_FROM || 'no-reply@muwise.com'}>`,
      to: email,
      subject: `Signature Request: ${agreementTitle}`,
      html: `
        <h1>Signature Request</h1>
        <p>${requesterName} has requested your signature on the agreement: "${agreementTitle}".</p>
        <p>Please review and sign the document by clicking the link below:</p>
        <a href="${signatureUrl}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Review & Sign Agreement
        </a>
        <p>If you have any questions, please contact ${requesterName} directly.</p>
        <br>
        <p>Thank you,</p>
        <p>The Muwise Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}