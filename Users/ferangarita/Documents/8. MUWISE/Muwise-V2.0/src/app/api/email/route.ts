import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateSigningLink } from "@/lib/signing-links";

export async function POST(req: Request) {
  try {
    const { agreementId, participantId, participantEmail } = await req.json();

    if (!agreementId || !participantId || !participantEmail) {
      return NextResponse.json({ success: false, error: 'Missing required parameters.' }, { status: 400 });
    }

    const link = generateSigningLink(agreementId, participantId);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: participantEmail,
      subject: "Firma tu contrato",
      html: `<p>Hola, por favor firma tu contrato aquí: <a href="${link}">${link}</a></p>`,
    });

    return NextResponse.json({ success: true, link });
  } catch (error) {
     console.error('Email sending error:', error);
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
     return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
