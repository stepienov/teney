import { setRequestLocale } from "next-intl/server";

import { FavoritesDashboard } from "@/components/favorites/favorites-dashboard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FavoritesDashboard />;
}
