import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Mountain } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { fetchMiradorBySlug } from "@/lib/api/mirador-search";
import { Link, redirect } from "@/i18n/routing";
import { buildMapsUrl } from "@/lib/geo/maps-url";
import {
  isCanonicalMiradorSlugParam,
  miradorPath,
} from "@/lib/mirador-slug";
import { formatRegionDisplayName } from "@/lib/region-display-name";
import type { Address } from "@/lib/types/poi";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function formatAddress(address: Address | null): string | null {
  if (address == null) {
    return null;
  }
  const street = [address.street, address.houseNumber]
    .filter(Boolean)
    .join(" ");
  const city = [address.postalCode, address.city].filter(Boolean).join(" ");
  return [street, city, address.extraInfo].filter(Boolean).join(", ") || null;
}

export default async function MiradorDetailsPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const mirador = await fetchMiradorBySlug(slug, locale);
  if (mirador == null) {
    notFound();
  }

  if (!isCanonicalMiradorSlugParam(mirador, slug)) {
    redirect({ href: miradorPath(mirador), locale });
  }

  const t = await getTranslations("miradores");
  const regionLabel = formatRegionDisplayName(mirador.region);
  const addressLabel = formatAddress(mirador.address);
  const mapsUrl = buildMapsUrl(mirador.coordinates, mirador.googlePlaceId, mirador.name);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/miradores"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {t("backToList")}
      </Link>

      <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="relative aspect-[16/9] bg-muted">
          {mirador.photoUrl ? (
            <Image
              src={mirador.photoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Mountain className="size-10 stroke-[1.25]" aria-hidden />
            </div>
          )}
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {mirador.name}
            </h1>
            {regionLabel ? (
              <p className="mt-1 text-sm text-muted-foreground">{regionLabel}</p>
            ) : null}
          </header>

          {addressLabel || mapsUrl ? (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground hover:underline"
                >
                  {addressLabel ?? t("openInMaps")}
                </a>
              ) : (
                <span>{addressLabel}</span>
              )}
            </div>
          ) : null}

          {mirador.description ? (
            <p className="text-sm leading-relaxed text-foreground">
              {mirador.description}
            </p>
          ) : null}

          {mirador.tips ? (
            <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t("tipsTitle")}</p>
              <p className="mt-1 whitespace-pre-line">{mirador.tips}</p>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
