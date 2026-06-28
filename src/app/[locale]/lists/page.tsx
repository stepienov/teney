import { setRequestLocale } from "next-intl/server";

import { ListsDashboard } from "@/components/lists/lists-dashboard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ListsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ListsDashboard />;
}
