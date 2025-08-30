export async function GET() {
    return Response.json({
      RESEND_API_KEY: process.env.RESEND_API_KEY ? "✅ existe" : "❌ no existe",
      EMAIL_FROM: process.env.EMAIL_FROM ?? "❌ no existe",
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "❌ no existe",
    });
  }
  