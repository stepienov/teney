import { setRequestLocale } from "next-intl/server";

import { AuthPageClient } from "@/components/auth/auth-page-client";
import { getPublicGoogleClientId } from "@/lib/env";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const googleClientId = getPublicGoogleClientId();

  return <AuthPageClient googleClientId={googleClientId} mode="login" />;
}
