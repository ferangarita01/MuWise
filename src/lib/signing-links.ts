import jwt from "jsonwebtoken";

export function generateSigningLink(agreementId: string, participantId: string) {
  const token = jwt.sign(
    { agreementId, participantId },
    process.env.JWT_SECRET!, // usa la clave de .env.local
    { expiresIn: "7d" }      // link válido 7 días
  );

  return `${process.env.NEXT_PUBLIC_BASE_URL}/sign/${agreementId}?token=${token}`;
}

export function verifySigningToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
}
