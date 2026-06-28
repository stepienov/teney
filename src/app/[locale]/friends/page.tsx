import { setRequestLocale } from "next-intl/server";

import { FriendsDashboard } from "@/components/friends/friends-dashboard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FriendsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FriendsDashboard />;
}
