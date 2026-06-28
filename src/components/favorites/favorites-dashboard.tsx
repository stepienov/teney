"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import { BeachCard } from "@/components/beaches/beach-card";
import {
  GuestPrompt,
  PageContent,
  PageEmpty,
  PageHeader,
  PageLoading,
  PageRoot,
  pageCardGridClass,
} from "@/components/layout/page-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { beachListItemToPoiDto } from "@/lib/api/beaches-search";
import { fetchFavorites } from "@/lib/api/user-me";
import { userQueryKeys } from "@/lib/query/user";
import { cn } from "@/lib/utils";

export function FavoritesDashboard() {
  const t = useTranslations("favorites");
  const locale = useLocale();
  const { status, user } = useAuth();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const favoritesQuery = useQuery({
    queryKey: userQueryKeys.favorites(locale),
    queryFn: () => fetchFavorites(locale),
    enabled: status === "authenticated",
  });

  if (!hasMounted || status === "loading") {
    return <PageLoading>{t("loading")}</PageLoading>;
  }

  if (status !== "authenticated" || user == null) {
    return (
      <GuestPrompt
        icon={User}
        title={t("guestTitle")}
        body={t("guestBody")}
        actions={
          <Button nativeButton={false} render={<Link href="/auth" />}>
            {t("authContinue")}
          </Button>
        }
      />
    );
  }

  const favorites = Array.isArray(favoritesQuery.data) ? favoritesQuery.data : [];

  return (
    <PageRoot>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle", { count: user.favoriteCount })}
      />

      <PageContent width="wide">
        {favoritesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loadingItems")}</p>
        ) : favorites.length === 0 ? (
          <PageEmpty>
            <Heart className="size-8 text-muted-foreground/60" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
            <Button className="mt-4" nativeButton={false} render={<Link href="/beaches" />}>
              {t("browseBeaches")}
            </Button>
          </PageEmpty>
        ) : (
          <ul className={cn(pageCardGridClass, "lg:grid-cols-3")}>
            {favorites.map((item) => {
              const beach = beachListItemToPoiDto(item);
              return (
                <li key={item.id}>
                  <BeachCard beach={beach} />
                </li>
              );
            })}
          </ul>
        )}
      </PageContent>
    </PageRoot>
  );
}
