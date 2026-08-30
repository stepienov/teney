import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronLeft, Cctv, MapPin, Waves } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BeachForecastPanel } from "@/components/beaches/beach-forecast-panel";
import {
  FeatureTag,
  PoiRatingMeters,
} from "@/components/poi-explorer/poi-live-details";
import {
  PoiLiveContactAndFacts,
  PoiLiveGallery,
} from "@/components/poi-explorer/poi-live-gallery";
import { PoiPhotoFallback } from "@/components/poi-explorer/poi-photo-fallback";
import { fetchBeachForecastWeather } from "@/lib/api/beach-forecast";
import { fetchBeachBySlug } from "@/lib/api/beach-search";
import { fetchPoiById } from "@/lib/api/generic-poi-search";
import { Link, redirect } from "@/i18n/routing";
import { beachPath, isCanonicalBeachSlugParam } from "@/lib/beach-slug";
import { buildMapsUrl } from "@/lib/geo/maps-url";
import { formatRegionDisplayName } from "@/lib/region-display-name";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function surfaceLabel(
  surface: string | null | undefined,
  labels: {
    lightSand: string;
    volcanicSand: string;
    stones: string;
  },
): string | null {
  switch (surface) {
    case "LIGHT_SAND":
      return labels.lightSand;
    case "VOLCANIC_SAND":
      return labels.volcanicSand;
    case "STONES":
      return labels.stones;
    default:
      return surface ?? null;
  }
}

function asBool(value: unknown): boolean | null {
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }
  return null;
}

export default async function BeachDetailsPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const beach = await fetchBeachBySlug(slug, locale);
  if (beach == null) {
    notFound();
  }

  if (!isCanonicalBeachSlugParam(beach, slug)) {
    redirect({ href: beachPath(beach), locale });
  }

  const [t, tDetails, forecast, poi] = await Promise.all([
    getTranslations({ locale, namespace: "beaches" }),
    getTranslations("poiDetails"),
    fetchBeachForecastWeather(beach.id),
    fetchPoiById(beach.id, locale),
  ]);

  const quality = poi?.quality ?? beach.quality;
  const popularity = poi?.popularity ?? beach.popularity;
  const surface = surfaceLabel(beach.beachDetails?.beachSurface, {
    lightSand: t("surfaceLightSand"),
    volcanicSand: t("surfaceVolcanicSand"),
    stones: t("surfaceStones"),
  });
  const webcamLink =
    typeof beach.attributes?.webcam_link === "string" &&
    beach.attributes.webcam_link.trim()
      ? beach.attributes.webcam_link.trim()
      : null;
  const locationParts = [
    beach.municipality?.trim(),
    beach.region ? formatRegionDisplayName(beach.region) : null,
  ].filter(Boolean) as string[];
  const locationLabel =
    locationParts.length > 0 ? locationParts.join(" · ") : null;
  const mapsUrl = buildMapsUrl(
    beach.coordinates,
    beach.googlePlaceId,
    beach.name,
  );

  const booleanChips: {
    key: string;
    label: string;
    value: boolean | null;
  }[] = [
    {
      key: "lifeguard",
      label: t("tagLifeguard"),
      value: asBool(beach.beachDetails?.hasLifeguard),
    },
    {
      key: "shower",
      label: t("tagShower"),
      value: asBool(beach.beachDetails?.hasShower),
    },
    {
      key: "boat",
      label: t("tagBoatOnly"),
      value: asBool(beach.beachDetails?.boatAccessOnly),
    },
    {
      key: "sunbeds",
      label: t("tagSunbeds"),
      value: asBool(beach.attributes?.sunbeds_boolean),
    },
    {
      key: "shop",
      label: t("tagShopNearby"),
      value: asBool(beach.attributes?.shop_nearby_boolean),
    },
    {
      key: "restaurant",
      label: t("tagRestaurantNearby"),
      value: asBool(beach.attributes?.restaurant_nearby_boolean),
    },
    {
      key: "dogs",
      label: t("tagDogFriendly"),
      value: asBool(beach.attributes?.dog_friendly_boolean),
    },
  ];

  const emptyPhotoLabel = tDetails("noPhoto");

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
      <header className="overflow-hidden border-b border-border bg-card sm:rounded-4xl sm:border sm:shadow-[0_18px_60px_-28px_rgba(53,51,205,0.18)]">
        <div className="flex items-center px-1 py-1 sm:px-2">
          <Link
            href="/beaches"
            className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
            aria-label={t("backToBeaches")}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
        </div>

        <Suspense
          fallback={<PoiPhotoFallback icon={Waves} label={emptyPhotoLabel} />}
        >
          <PoiLiveGallery
            poiId={beach.id}
            name={beach.name}
            icon={Waves}
            emptyLabel={emptyPhotoLabel}
          />
        </Suspense>

        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              {beach.name}
            </h1>
            {locationLabel ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span>{locationLabel}</span>
              </p>
            ) : null}
          </div>

          <PoiRatingMeters
            quality={quality}
            popularity={popularity}
            ratingLabel={tDetails("quality")}
            popularityLabel={tDetails("popularity")}
            sourceLabel={tDetails("opinionSource")}
          />

          <Suspense fallback={null}>
            <PoiLiveContactAndFacts poiId={beach.id} mapsUrl={mapsUrl} />
          </Suspense>

          {surface || booleanChips.some((chip) => chip.value === true) || webcamLink ? (
            <div className="flex flex-wrap gap-2">
              {surface ? <FeatureTag>{surface}</FeatureTag> : null}
              {booleanChips.map((chip) =>
                chip.value === true ? (
                  <FeatureTag key={chip.key}>{chip.label}</FeatureTag>
                ) : null,
              )}
              {webcamLink ? (
                <FeatureTag href={webcamLink}>
                  <Cctv className="size-3.5 shrink-0" aria-hidden />
                  {t("webcamButton")}
                </FeatureTag>
              ) : null}
            </div>
          ) : null}

          <BeachForecastPanel
            forecast={forecast}
            locale={locale}
            labels={{
              title: t("weatherNow"),
              upcomingDays: t("forecastUpcomingDays"),
              today: t("weatherToday"),
              tomorrow: t("weatherTomorrow"),
              now: t("now"),
              noWeather: t("noReadableWeather"),
            }}
          />
        </div>
      </header>
    </article>
  );
}
