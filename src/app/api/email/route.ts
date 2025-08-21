import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateSigningLink } from "@/lib/signing-links";

export async function POST(req: Request) {
  const { agreementId, participantId, participantEmail } = await req.json();

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
}
