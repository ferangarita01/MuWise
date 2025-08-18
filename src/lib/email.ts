
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendSignatureEmail(to: string, link: string) {
  try {
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject: "Signature Request from Muwise",
        html: `
        <h2>You have a pending agreement</h2>
        <p>Please click the link below to review and sign the document:</p>
        <a href="${link}" target="_blank">${link}</a>
        `,
    });
  } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Could not send signature request email.");
  }
}
