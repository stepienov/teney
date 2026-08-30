"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  PageEmpty,
  PageLoading,
  PageRoot,
  PageSection,
  pageCardClass,
} from "@/components/layout/page-layout";
import { Link } from "@/i18n/routing";
import { fetchListTeaser } from "@/lib/api/list-teaser";
import { ApiError } from "@/lib/api-client";
import { resolveOwnerMediaUrl } from "@/lib/poi-media";

type ListTeaserViewProps = {
  token: string;
};

export function ListTeaserView({ token }: ListTeaserViewProps) {
  const t = useTranslations("lists.teaser");

  const teaserQuery = useQuery({
    queryKey: ["lists", "teaser", token],
    queryFn: () => fetchListTeaser(token),
    retry: (count, error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 410)) {
        return false;
      }
      return count < 1;
    },
  });

  if (teaserQuery.isLoading) {
    return <PageLoading>{t("loading")}</PageLoading>;
  }

  if (teaserQuery.isError) {
    const err = teaserQuery.error;
    let message = t("errorGeneric");
    if (err instanceof ApiError) {
      if (err.status === 410) {
        message = t("errorGone");
      } else if (err.status === 404) {
        message = t("errorNotFound");
      } else if (err.status === 429) {
        message = t("errorRateLimit");
      }
    }
    return (
      <PageRoot>
        <PageEmpty>
          <p className="text-sm text-muted-foreground">{message}</p>
        </PageEmpty>
      </PageRoot>
    );
  }

  const teaser = teaserQuery.data!;

  return (
    <PageRoot>
      <header className="mb-8">
        <p className="text-sm font-medium text-brand">{t("badge")}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {teaser.listName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("totalCount", { count: teaser.totalCount })}
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {teaser.previewPois.map((poi) => {
          const photoSrc = resolveOwnerMediaUrl(poi.photoUrl);
          return (
          <li key={poi.id} className={`overflow-hidden ${pageCardClass} p-0`}>
            <div className="relative aspect-[4/3] bg-muted">
              {photoSrc ? (
                <Image
                  src={photoSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="50vw"
                  unoptimized
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                  <MapPin className="size-8 stroke-[1.25]" aria-hidden />
                  <span className="text-sm">{t("noPhoto")}</span>
                </div>
              )}
            </div>
            <p className="px-3 py-2 text-sm font-medium text-foreground">{poi.name}</p>
          </li>
          );
        })}
      </ul>

      {teaser.totalCount > teaser.previewPois.length && (
        <p className="mt-4 text-sm text-muted-foreground">
          {t("morePlaces", {
            count: teaser.totalCount - teaser.previewPois.length,
          })}
        </p>
      )}

      {teaser.registrationRequired && (
        <PageSection className="mt-10 border-brand/20 bg-brand-muted shadow-none">
          <p className="text-sm text-foreground">{t("ctaBody")}</p>
          <Button className="mt-4" render={<Link href="/register" />}>
            {t("ctaRegister")}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("ctaLogin")}{" "}
            <Link href="/auth" className="text-brand underline">
              {t("ctaLoginLink")}
            </Link>
          </p>
        </PageSection>
      )}
    </PageRoot>
  );
}
