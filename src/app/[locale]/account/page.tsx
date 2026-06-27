import { setRequestLocale } from "next-intl/server";

import { AccountDashboard } from "@/components/account/account-dashboard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AccountDashboard />;
}
