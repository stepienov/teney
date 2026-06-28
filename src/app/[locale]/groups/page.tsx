import { setRequestLocale } from "next-intl/server";

import { GroupsDashboard } from "@/components/friends/groups-dashboard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GroupsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GroupsDashboard />;
}
