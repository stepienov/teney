import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  FactCard,
  FeatureTag,
  PoiRatingMeters,
} from "@/components/poi-explorer/poi-live-details";
import {
  PoiLiveContactAndFacts,
  PoiLiveGallery,
} from "@/components/poi-explorer/poi-live-gallery";
import { PoiPhotoFallback } from "@/components/poi-explorer/poi-photo-fallback";
import { fetchPoiBySlug } from "@/lib/api/generic-poi-search";
import {
  catalogEntryByPath,
  explorerConfigByPath,
} from "@/lib/poi-categories/catalog";
import { Link, redirect } from "@/i18n/routing";
import { poiMapsUrl } from "@/lib/geo/maps-url";
import {
  activeCategoryDetails,
  categoryDetailEntries,
} from "@/lib/poi-details/present";
import { isCanonicalPoiSlugParam, poiPath } from "@/lib/poi-slug";
import { formatRegionDisplayName } from "@/lib/region-display-name";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  basePath: string;
};

type DetailsT = Awaited<ReturnType<typeof getTranslations>>;

function fieldLabel(tDetails: DetailsT, key: string): string {
  const messageKey = `fields.${key}`;
  return tDetails.has(messageKey) ? tDetails(messageKey) : key;
}

function formatDetailTag(
  item: ReturnType<typeof categoryDetailEntries>[number],
  tDetails: DetailsT,
  locale: string,
): string {
  const label = fieldLabel(tDetails, item.key);
  if (item.kind === "boolean") {
    return label;
  }
  if (item.key === "hikingDistanceM" && typeof item.value === "number") {
    return tDetails("hikingDistance", { distance: item.value });
  }
  if (item.key === "visitDurationMinutes" && typeof item.value === "number") {
    return tDetails("durationMinutes", { count: item.value });
  }
  if (typeof item.value === "number") {
    return `${label}: ${new Intl.NumberFormat(locale).format(item.value)}`;
  }
  return `${label}: ${item.value}`;
}

export async function GenericPoiDetailsPage({ params, basePath }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const entry = catalogEntryByPath(basePath);
  const explorer = explorerConfigByPath(basePath);
  const poi = await fetchPoiBySlug(slug, locale);
  if (poi == null) {
    notFound();
  }

  if (!isCanonicalPoiSlugParam(poi, slug)) {
    redirect({ href: poiPath(basePath, poi), locale });
  }

  const [t, tCat, tDetails] = await Promise.all([
    getTranslations("miradores"),
    getTranslations("poiCategories"),
    getTranslations("poiDetails"),
  ]);
  const Icon = entry?.icon ?? explorer?.placeholderIcon;
  const regionLabel = formatRegionDisplayName(poi.region);
  const locationParts = [
    poi.municipality?.trim(),
    regionLabel,
  ].filter(Boolean) as string[];
  const locationLabel =
    locationParts.length > 0 ? locationParts.join(" · ") : null;
  const mapsUrl = poiMapsUrl(poi);
  const details = activeCategoryDetails(poi);
  const detailEntries = categoryDetailEntries(poi);
  const isGuachinche = details?.details.isGuachinche === true;
  const tagItems = detailEntries.filter((item) => {
    if (item.kind === "longText") {
      return false;
    }
    if (item.kind === "boolean") {
      return item.value === true;
    }
    return true;
  });
  const longItems = detailEntries.filter((item) => item.kind === "longText");
  const emptyPhotoLabel = tDetails("noPhoto");

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
      <header className="overflow-hidden border-b border-border bg-card sm:rounded-4xl sm:border sm:shadow-[0_18px_60px_-28px_rgba(53,51,205,0.18)]">
        <div className="flex items-center px-1 py-1 sm:px-2">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="size-5" aria-hidden />
            {entry ? tCat(entry.listTitleKey) : t("backToList")}
          </Link>
        </div>

        <Suspense
          fallback={<PoiPhotoFallback icon={Icon} label={emptyPhotoLabel} />}
        >
          <PoiLiveGallery
            poiId={poi.id}
            name={poi.name}
            icon={Icon}
            emptyLabel={emptyPhotoLabel}
          />
        </Suspense>

        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              {poi.name}
            </h1>
            {locationLabel ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span>{locationLabel}</span>
              </p>
            ) : null}
          </div>

          <PoiRatingMeters
            quality={poi.quality}
            popularity={poi.popularity}
            ratingLabel={tDetails("quality")}
            popularityLabel={tDetails("popularity")}
            sourceLabel={tDetails("opinionSource")}
          />

          <Suspense fallback={null}>
            <PoiLiveContactAndFacts poiId={poi.id} mapsUrl={mapsUrl} />
          </Suspense>

          {isGuachinche ? (
            <div className="flex flex-wrap gap-2">
              <FeatureTag>{tDetails("guachinche")}</FeatureTag>
            </div>
          ) : null}

          {tagItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tagItems.map((item) => (
                <FeatureTag key={item.key}>
                  {formatDetailTag(item, tDetails, locale)}
                </FeatureTag>
              ))}
            </div>
          ) : null}

          {longItems.length > 0 ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {longItems.map((item) => (
                <FactCard key={item.key} label={fieldLabel(tDetails, item.key)}>
                  {String(item.value)}
                </FactCard>
              ))}
            </dl>
          ) : null}
        </div>
      </header>
    </article>
  );
}
