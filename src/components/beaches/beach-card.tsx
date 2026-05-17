import Image from "next/image";
import { MapPin, Navigation, Umbrella } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { formatDistanceKm } from "@/lib/geo/distance";
import type { PoiDto } from "@/lib/types/poi";

type BeachCardProps = {
  beach: PoiDto;
  distanceKm?: number;
};

type WeatherBadge = {
  key: string;
  label: string;
  tone: "temperature" | "wind" | "uv" | "cloud" | "neutral";
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

function conditionLabel(value: string | null | undefined, t: (key: string) => string): string | null {
  if (!value) {
    return null;
  }

  const key = value.trim().toLowerCase();
  const labels: Record<string, string> = {
    clear: t("conditionClear"),
    cloudy: t("conditionCloudy"),
    overcast: t("conditionOvercast"),
    "partially cloudy": t("conditionPartiallyCloudy"),
    rain: t("conditionRain"),
    "heavy rain": t("conditionHeavyRain"),
    drizzle: t("conditionDrizzle"),
    fog: t("conditionFog"),
    mist: t("conditionMist"),
    snow: t("conditionSnow"),
    thunderstorm: t("conditionThunderstorm"),
  };

  return labels[key] ?? value;
}

function formatDecimal(value: number, locale: string, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function lowerFirst(value: string): string {
  return value.length > 0 ? value.charAt(0).toLocaleLowerCase() + value.slice(1) : value;
}

function windLabel(
  speed: number | null | undefined,
  labels: {
    calm: string;
    moderate: string;
    noticeable: string;
    strong: string;
    veryStrong: string;
  },
): string | null {
  if (speed == null) {
    return null;
  }

  if (speed < 10) {
    return labels.calm;
  }

  if (speed <= 15) {
    return labels.moderate;
  }

  if (speed <= 20) {
    return labels.noticeable;
  }

  if (speed <= 30) {
    return labels.strong;
  }

  return labels.veryStrong;
}

function uvLabel(
  value: number | null | undefined,
  labels: {
    low: string;
    moderate: string;
    high: string;
    veryHigh: string;
    extreme: string;
  },
): string | null {
  if (value == null) {
    return null;
  }

  if (value <= 2) {
    return labels.low;
  }

  if (value <= 5) {
    return labels.moderate;
  }

  if (value <= 7) {
    return labels.high;
  }

  if (value <= 10) {
    return labels.veryHigh;
  }

  return labels.extreme;
}

function weatherUvIndex(weather: PoiDto["weather"]): number | null {
  if (!weather) {
    return null;
  }

  if (weather.uvIndex != null) {
    return weather.uvIndex;
  }

  const rawWeather = weather as Record<string, unknown>;
  return typeof rawWeather.uvindex === "number" ? rawWeather.uvindex : null;
}

function weatherBadges(beach: PoiDto, locale: string, t: (key: string, values?: Record<string, string | number>) => string): WeatherBadge[] {
  const weather = beach.weather;

  if (!weather) {
    return [];
  }

  const conditions = conditionLabel(weather.conditions, (key) => t(key));
  const wind = windLabel(weather.windSpeed, {
    calm: t("windCalm"),
    moderate: t("windModerate"),
    noticeable: t("windNoticeable"),
    strong: t("windStrong"),
    veryStrong: t("windVeryStrong"),
  });
  const uvIndex = weatherUvIndex(weather);
  const uv = uvLabel(uvIndex, {
    low: t("uvLow"),
    moderate: t("uvModerate"),
    high: t("uvHigh"),
    veryHigh: t("uvVeryHigh"),
    extreme: t("uvExtreme"),
  });

  return [
    weather.temperature != null
      ? {
          key: "temperature",
          label: t("temperatureValue", {
            value: formatDecimal(weather.temperature, locale),
          }),
          tone: "temperature",
        }
      : null,
    wind
      ? {
          key: "wind",
          label: lowerFirst(wind),
          tone: "wind",
        }
      : null,
    uv
      ? {
          key: "uv",
          label: uv,
          tone: "uv",
        }
      : null,
    weather.cloudCover != null
      ? {
          key: "cloudCover",
          label: t("cloudCoverValue", {
            value: Math.round(weather.cloudCover),
          }),
          tone: "cloud",
        }
      : null,
    weather.precipitation != null
      ? {
          key: "precipitation",
          label: t("precipitationValue", {
            value: formatDecimal(weather.precipitation, locale),
          }),
          tone: "neutral",
        }
      : null,
    conditions
      ? {
          key: "conditions",
          label: conditions,
          tone: "neutral",
        }
      : null,
  ].filter((badge): badge is WeatherBadge => badge != null);
}

function weatherBadgeClass(tone: WeatherBadge["tone"]): string {
  switch (tone) {
    case "temperature":
      return "bg-white/95 text-ocean-deep";
    case "wind":
      return "bg-amber-100/95 text-amber-950";
    case "uv":
      return "bg-yellow-100/95 text-yellow-950";
    case "cloud":
      return "bg-sky-100/95 text-sky-950";
    default:
      return "bg-ocean-deep/85 text-white";
  }
}

export function BeachCard({ beach, distanceKm }: BeachCardProps) {
  const t = useTranslations("beaches");
  const locale = useLocale();
  const surface = surfaceLabel(beach.beachDetails?.beachSurface, {
    lightSand: t("surfaceLightSand"),
    volcanicSand: t("surfaceVolcanicSand"),
    stones: t("surfaceStones"),
  });
  const badges = weatherBadges(beach, locale, (key, values) => t(key, values));

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-[0_12px_40px_-20px_rgba(26,46,53,0.15)] transition-shadow hover:shadow-[0_20px_50px_-18px_rgba(64,179,194,0.3)]">
      <div className="relative aspect-[16/10] bg-ocean-cyan/30">
        {beach.photoUrl ? (
          <Image
            src={beach.photoUrl}
            alt={beach.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ocean-deep/50">
            <Umbrella className="size-10 stroke-[1.25]" aria-hidden />
            <span className="text-sm font-medium">{t("noPhoto")}</span>
          </div>
        )}
        {distanceKm != null && (
          <span className="absolute right-3 top-3 inline-flex size-14 flex-col items-center justify-center rounded-full bg-ocean-deep/85 text-center text-[0.68rem] font-bold leading-tight text-white shadow-sm backdrop-blur">
            <Navigation className="size-3.5" aria-hidden />
            <span>{formatDistanceKm(distanceKm)}</span>
          </span>
        )}
        {badges.length > 0 && (
          <ul className="absolute left-3 top-3 flex max-w-[75%] flex-col items-start gap-1.5">
            {badges.map((badge) => (
              <li
                key={badge.key}
                className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur ${weatherBadgeClass(
                  badge.tone,
                )}`}
              >
                {badge.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-h-[3.4rem]">
          <h3 className="line-clamp-1 font-heading text-lg font-bold text-ocean-deep">
            {beach.name}
          </h3>
          {(beach.municipality || beach.region) && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-1">
                {[beach.municipality, beach.region].filter(Boolean).join(" · ")}
              </span>
            </p>
          )}
        </div>

        <p className="line-clamp-2 min-h-[3.25rem] text-sm leading-relaxed text-muted-foreground">
          {beach.description}
        </p>

        <ul className="flex min-h-7 flex-wrap gap-2 text-xs font-medium">
          {!beach.isFree && (
            <li className="inline-flex items-center justify-center rounded-full bg-ocean-cyan/40 px-2.5 py-1 text-center leading-none text-ocean-deep">
              {t("paid").toLocaleLowerCase()}
            </li>
          )}
          {surface && (
            <li className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-1 text-center leading-none text-ocean-deep">
              {surface}
            </li>
          )}
          {beach.beachDetails?.hasLifeguard && (
            <li className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-1 text-center leading-none text-ocean-deep">
              {t("tagLifeguard")}
            </li>
          )}
          {beach.beachDetails?.hasShower && (
            <li className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-1 text-center leading-none text-ocean-deep">
              {t("tagShower")}
            </li>
          )}
        </ul>

        <Link
          href={`/beaches/${beach.id}`}
          className="group ml-auto mt-auto inline-flex w-fit items-center gap-1 text-sm font-bold text-ocean-deep transition-colors hover:text-ocean-teal"
        >
          <span className="bg-linear-to-r from-ocean-teal to-ocean-teal bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]">
            {t("viewDetails")}
          </span>
        </Link>
      </div>
    </article>
  );
}
