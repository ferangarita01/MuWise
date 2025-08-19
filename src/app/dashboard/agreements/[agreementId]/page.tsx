// /src/app/dashboard/agreements/[agreementId]/page.tsx
import AgreementPageClient from "./AgreementPageClient";

export default async function AgreementPage({
  params,
}: {
  params: Promise<{ agreementId: string }>;
}) {
  // ✅ Next.js 14+: params es una Promise → usamos await
  const { agreementId } = await params;

  return <AgreementPageClient agreementId={agreementId} />;
}