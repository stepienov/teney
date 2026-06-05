import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronLeft, Cctv, MapPin, Waves } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BeachForecastPanel } from "@/components/beaches/beach-forecast-panel";
import { fetchBeachForecastWeather } from "@/lib/api/beach-forecast";
import { fetchBeachBySlug } from "@/lib/api/beach-search";
import { Link, redirect } from "@/i18n/routing";
import { beachPath, isCanonicalBeachSlugParam } from "@/lib/beach-slug";
import { buildMapsUrl } from "@/lib/geo/maps-url";
import { formatRegionDisplayName } from "@/lib/region-display-name";
import type { Address, PoiDto } from "@/lib/types/poi";

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

function formatPrice(beach: PoiDto, locale: string): string | null {
  if (beach.ticketPrice == null) {
    return null;
  }
  const currency = beach.currencyCode ?? "EUR";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(beach.ticketPrice);
}

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

function FeatureTag({
  children,
  href,
}: {
  children: ReactNode;
  href?: string;
}) {
  const className =
    "inline-flex items-center rounded-full bg-ocean-foam px-3 py-1.5 text-xs font-semibold text-ocean-deep ring-1 ring-ocean-cyan/40";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${className} transition-colors hover:bg-ocean-cyan/40`}
      >
        {children}
      </a>
    );
  }

  return <span className={className}>{children}</span>;
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

  const t = await getTranslations({ locale, namespace: "beaches" });
  const forecast = await fetchBeachForecastWeather(beach.id);

  const address = formatAddress(beach.address);
  const price = beach.isFree === false ? formatPrice(beach, locale) : null;
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
  const beachFeatureTags = [
    beach.beachDetails?.beachSurface != null && surface
      ? { key: "surface", label: surface }
      : null,
    beach.beachDetails?.hasLifeguard === true
      ? { key: "lifeguard", label: t("tagLifeguard") }
      : null,
    beach.beachDetails?.hasShower === true
      ? { key: "shower", label: t("tagShower") }
      : null,
    beach.beachDetails?.boatAccessOnly === true
      ? { key: "boat", label: t("tagBoatOnly") }
      : null,
    beach.attributes?.sunbeds_boolean === true
      ? { key: "sunbeds", label: t("tagSunbeds") }
      : null,
    beach.attributes?.shop_nearby_boolean === true
      ? { key: "shop", label: t("tagShopNearby") }
      : null,
    beach.attributes?.restaurant_nearby_boolean === true
      ? { key: "restaurant", label: t("tagRestaurantNearby") }
      : null,
    beach.attributes?.dog_friendly_boolean === true
      ? { key: "dogs", label: t("tagDogFriendly") }
      : null,
  ].filter(
    (tag): tag is { key: string; label: string; href?: string } => tag != null,
  );

  return (
    <article className="mx-auto w-full max-w-6xl pb-6 sm:px-6 sm:pb-12 sm:pt-4">
      <header className="overflow-hidden border-b border-border bg-white sm:rounded-4xl sm:border sm:shadow-[0_18px_60px_-28px_rgba(26,46,53,0.25)]">
        <div className="flex items-center border-b border-border px-1 py-0.5 sm:px-2">
          <Link
            href="/beaches"
            className="inline-flex size-9 items-center justify-center rounded-md text-ocean-deep transition-colors hover:bg-ocean-foam"
            aria-label={t("backToBeaches")}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
        </div>

        <div className="relative aspect-[16/8] min-h-48 bg-ocean-cyan/30 sm:min-h-64">
          {beach.photoUrl ? (
            <Image
              src={beach.photoUrl}
              alt={beach.name}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1152px"
              unoptimized
              priority
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ocean-deep/45">
              <Waves className="size-12 stroke-[1.25]" aria-hidden />
              <span className="text-sm font-medium">{t("noPhoto")}</span>
            </div>
          )}
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-ocean-deep sm:text-4xl">
              {beach.name}
            </h1>
            {(locationLabel || webcamLink) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                {locationLabel && mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ocean-teal transition-colors hover:text-ocean-deep"
                  >
                    <MapPin className="size-4 shrink-0" aria-hidden />
                    <span>{locationLabel}</span>
                  </a>
                ) : locationLabel ? (
                  <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" aria-hidden />
                    <span>{locationLabel}</span>
                  </p>
                ) : null}
                {webcamLink ? (
                  <a
                    href={webcamLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-ocean-foam px-3 py-1.5 text-xs font-semibold text-ocean-deep ring-1 ring-ocean-cyan/40 transition-colors hover:bg-ocean-cyan/40"
                  >
                    <Cctv className="size-3.5 shrink-0" aria-hidden />
                    <span>{t("webcamButton")}</span>
                  </a>
                ) : null}
              </div>
            )}
          </div>

          {beach.description ? (
            <p className="max-w-3xl leading-relaxed text-muted-foreground">
              {beach.description}
            </p>
          ) : null}

          {beachFeatureTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {beachFeatureTags.map((tag) => (
                <FeatureTag key={tag.key} href={tag.href}>
                  {tag.label}
                </FeatureTag>
              ))}
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

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {price ? (
              <div className="rounded-2xl bg-ocean-foam p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                  {t("entry")}
                </dt>
                <dd className="mt-1 font-medium text-ocean-deep">{price}</dd>
              </div>
            ) : null}
            {beach.openingHours && (
              <div className="rounded-2xl bg-ocean-foam p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                  {t("openingHours")}
                </dt>
                <dd className="mt-1 font-medium text-ocean-deep">
                  {beach.openingHours}
                </dd>
              </div>
            )}
            {address && (
              <div className="rounded-2xl bg-ocean-foam p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                  {t("address")}
                </dt>
                <dd className="mt-1 font-medium text-ocean-deep">{address}</dd>
              </div>
            )}
            {beach.visitorLimit != null && (
              <div className="rounded-2xl bg-ocean-foam p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                  {t("visitorLimit")}
                </dt>
                <dd className="mt-1 font-medium text-ocean-deep">
                  {beach.visitorLimit}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </header>
    </article>
  );
}
