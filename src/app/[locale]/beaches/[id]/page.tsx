import Image from "next/image";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  MapPin,
  Sun,
  ThermometerSun,
  Umbrella,
  Wind,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { fetchBeachById } from "@/lib/api/beach-search";
import { resolveBeachPointTypeId } from "@/lib/api/reference";
import { Link } from "@/i18n/routing";
import type { Address, JsonValue, PoiDto, Weather } from "@/lib/types/poi";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

type WeatherRecord = Record<string, JsonValue>;

type WeatherMetric = {
  label: string;
  value: string | null;
  icon: typeof Wind;
  helper?: string | null;
  tone?: "sky" | "amber" | "emerald" | "rose";
};

const numberFormatterOptions = {
  maximumFractionDigits: 1,
} satisfies Intl.NumberFormatOptions;

function isRecord(value: JsonValue | undefined): value is WeatherRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordsFromJson(value: JsonValue | null): WeatherRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (isRecord(value)) {
    const nestedDays = value.days;
    const nestedHours = value.hours;

    if (Array.isArray(nestedDays)) {
      return nestedDays.filter(isRecord);
    }

    if (Array.isArray(nestedHours)) {
      return nestedHours.filter(isRecord);
    }

    return [value];
  }

  return [];
}

function numberField(record: WeatherRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function stringField(record: WeatherRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function formatNumber(locale: string, value: number): string {
  return new Intl.NumberFormat(locale, numberFormatterOptions).format(value);
}

function formatMetric(locale: string, value: number | null, unit: string): string | null {
  if (value == null) {
    return null;
  }

  return `${formatNumber(locale, value)}${unit}`;
}

function formatPercent(locale: string, value: number | null): string | null {
  if (value == null) {
    return null;
  }

  return `${formatNumber(locale, value)}%`;
}

function formatTimeLabel(value: string | null): string | null {
  if (value == null) {
    return null;
  }

  const [hour, minute = "00"] = value.split(":");

  if (!hour) {
    return value;
  }

  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function formatDateLabel(value: string | null, locale: string): string | null {
  if (value == null) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatDateWithYearLabel(value: string | null, locale: string): string | null {
  if (value == null) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTemperatureRange(
  record: WeatherRecord,
  locale: string,
): string | null {
  const max = numberField(record, ["tempmax", "temperatureMax", "maxTemp"]);
  const min = numberField(record, ["tempmin", "temperatureMin", "minTemp"]);

  if (max == null && min == null) {
    return formatMetric(locale, numberField(record, ["temp", "temperature"]), "°C");
  }

  return [
    max != null ? formatMetric(locale, max, "°C") : null,
    min != null ? formatMetric(locale, min, "°C") : null,
  ]
    .filter(Boolean)
    .join(" / ");
}

function weatherMetrics(
  record: WeatherRecord,
  locale: string,
  labels: WeatherLabels,
): WeatherMetric[] {
  const windSpeed = numberField(record, ["windspeed", "windSpeed"]);
  const wind = windInfo(windSpeed, labels);

  return [
    {
      label: labels.feelsLike,
      value: formatMetric(
        locale,
        numberField(record, ["feelslike", "feelsLike", "apparentTemperature"]),
        "°C",
      ),
      icon: ThermometerSun,
    },
    {
      label: labels.wind,
      value: formatMetric(locale, windSpeed, " km/h"),
      icon: Wind,
      helper: wind?.label,
      tone: wind?.tone,
    },
    {
      label: labels.humidity,
      value: formatPercent(locale, numberField(record, ["humidity"])),
      icon: Droplets,
    },
    {
      label: labels.precipitation,
      value: formatMetric(locale, numberField(record, ["precip", "precipitation"]), " mm"),
      icon: CloudRain,
    },
    {
      label: labels.rainChance,
      value: formatPercent(locale, numberField(record, ["precipprob", "precipProbability"])),
      icon: Umbrella,
    },
    {
      label: labels.uvIndex,
      value: formatMetric(locale, numberField(record, ["uvindex", "uvIndex"]), ""),
      icon: Sun,
    },
    {
      label: labels.cloudCover,
      value: formatPercent(locale, numberField(record, ["cloudcover", "cloudCover"])),
      icon: CloudSun,
    },
  ].filter((metric) => metric.value != null);
}

function windInfo(
  speed: number | null,
  labels: WeatherLabels,
): { label: string; tone: WeatherMetric["tone"]; width: string } | null {
  if (speed == null) {
    return null;
  }

  if (speed < 15) {
    return { label: labels.windCalm, tone: "emerald", width: "25%" };
  }

  if (speed < 30) {
    return { label: labels.windModerate, tone: "sky", width: "50%" };
  }

  if (speed < 45) {
    return { label: labels.windStrong, tone: "amber", width: "75%" };
  }

  return { label: labels.windVeryStrong, tone: "rose", width: "100%" };
}

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

function MetricPill({ metric }: { metric: WeatherMetric }) {
  const Icon = metric.icon;
  const toneClass = {
    sky: "bg-sky-50 text-sky-950 ring-sky-200 [&_svg]:text-sky-600",
    amber: "bg-amber-50 text-amber-950 ring-amber-200 [&_svg]:text-amber-600",
    emerald:
      "bg-emerald-50 text-emerald-950 ring-emerald-200 [&_svg]:text-emerald-600",
    rose: "bg-rose-50 text-rose-950 ring-rose-200 [&_svg]:text-rose-600",
  }[metric.tone ?? "sky"];

  return (
    <div className={`rounded-2xl px-3 py-2 text-sm shadow-sm ring-1 ${toneClass}`}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="text-current/70">{metric.label}</span>
        <span className="ml-auto font-semibold">{metric.value}</span>
      </div>
      {metric.helper ? (
        <p className="mt-1 text-xs font-medium text-current/75">{metric.helper}</p>
      ) : null}
    </div>
  );
}

function EmptyWeatherState({ label }: { label: string }) {
  return (
    <div className="mt-4 rounded-2xl bg-ocean-foam p-4 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function HourlyWeatherSection({
  title,
  value,
  current,
  locale,
  labels,
}: {
  title: string;
  value: JsonValue | null;
  current: Weather | null;
  locale: string;
  labels: WeatherLabels;
}) {
  const records = recordsFromJson(value);

  if (!records.length && current == null) {
    return null;
  }

  const currentWind = windInfo(current?.windSpeed ?? null, labels);

  return (
    <section className="overflow-hidden rounded-4xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-[0_18px_50px_-30px_rgba(26,46,53,0.28)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            {labels.currentAndHourly}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-ocean-deep">
            {title}
          </h2>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-sky-900 shadow-sm ring-1 ring-sky-200">
          {labels.hourly}
        </span>
      </div>

      {current ? (
        <div className="mt-5 grid gap-4 rounded-3xl bg-white p-4 ring-1 ring-sky-200 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold text-sky-700">{labels.currentWeather}</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <p className="text-5xl font-bold tracking-tight text-ocean-deep">
                {current.temperature != null
                  ? formatMetric(locale, current.temperature, "°C")
                  : labels.unknown}
              </p>
              <p className="pb-1 text-sm font-medium text-ocean-deep">
                {current.conditions ?? labels.noConditions}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricPill
              metric={{
                label: labels.wind,
                value: formatMetric(locale, current.windSpeed, " km/h"),
                icon: Wind,
                helper: currentWind?.label,
                tone: currentWind?.tone,
              }}
            />
            <MetricPill
              metric={{
                label: labels.cloudCover,
                value: formatPercent(locale, current.cloudCover),
                icon: CloudSun,
                tone: "sky",
              }}
            />
            <MetricPill
              metric={{
                label: labels.precipitation,
                value: formatMetric(locale, current.precipitation, " mm"),
                icon: CloudRain,
                tone: current.precipitation ? "amber" : "emerald",
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {records.map((record, index) => {
          const time = formatTimeLabel(stringField(record, ["datetime", "time"]));
          const temp = formatMetric(
            locale,
            numberField(record, ["temp", "temperature"]),
            "°C",
          );
          const conditions = stringField(record, ["conditions", "description"]);
          const metrics = weatherMetrics(record, locale, labels).slice(0, 4);

          return (
            <article
              key={`${time ?? labels.now}-${index}`}
              className="min-w-[15rem] rounded-3xl bg-white p-4 shadow-sm ring-1 ring-sky-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-sky-700">
                    {time ?? labels.now}
                  </p>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-ocean-deep">
                    {temp ?? labels.unknown}
                  </p>
                </div>
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <CloudSun className="size-7" aria-hidden />
                </div>
              </div>
              <p className="mt-2 min-h-5 text-sm font-medium text-ocean-deep">
                {conditions ?? labels.noConditions}
              </p>
              <div className="mt-4 grid gap-2">
                {metrics.map((metric) => (
                  <MetricPill key={metric.label} metric={metric} />
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

type WeatherLabels = {
  currentAndHourly: string;
  currentWeather: string;
  hourly: string;
  daily: string;
  historical: string;
  now: string;
  unknown: string;
  noConditions: string;
  feelsLike: string;
  wind: string;
  humidity: string;
  precipitation: string;
  rainChance: string;
  uvIndex: string;
  cloudCover: string;
  highLow: string;
  noReadableWeather: string;
  windCalm: string;
  windModerate: string;
  windStrong: string;
  windVeryStrong: string;
  averageTemperature: string;
  warmerThanAverage: string;
  colderThanAverage: string;
  similarToAverage: string;
};

function DailyForecastSection({
  title,
  value,
  locale,
  labels,
}: {
  title: string;
  value: JsonValue | null;
  locale: string;
  labels: WeatherLabels;
}) {
  const records = recordsFromJson(value);

  if (!records.length) {
    return null;
  }

  return (
    <section className="rounded-4xl border border-border bg-white/95 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold text-ocean-deep">
          {title}
        </h2>
        <span className="rounded-full bg-ocean-foam px-3 py-1 text-xs font-semibold text-ocean-teal">
          {labels.daily}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {records.slice(0, 3).map((record, index) => {
          const date = formatDateLabel(
            stringField(record, ["datetime", "date"]),
            locale,
          );
          const conditions = stringField(record, ["conditions", "description"]);
          const range = formatTemperatureRange(record, locale);
          const metrics = weatherMetrics(record, locale, labels).filter(
            (metric) =>
              [labels.wind, labels.rainChance, labels.uvIndex, labels.humidity].includes(
                metric.label,
              ),
          );

          return (
            <article
              key={`${date ?? title}-${index}`}
              className="rounded-3xl bg-gradient-to-br from-ocean-foam to-white p-5 ring-1 ring-ocean-cyan/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ocean-teal">
                    <CalendarDays className="size-4" aria-hidden />
                    {date ?? labels.daily}
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-ocean-deep">
                    {range ?? labels.unknown}
                  </h3>
                </div>
                <CloudSun className="size-10 text-ocean-teal" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-medium text-ocean-deep">
                {conditions ?? labels.noConditions}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {labels.highLow}
              </p>
              <div className="mt-4 grid gap-2">
                {metrics.map((metric) => (
                  <MetricPill key={metric.label} metric={metric} />
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HistoricalWeatherSection({
  title,
  points,
  locale,
  labels,
}: {
  title: string;
  points: { date: string; data: JsonValue }[];
  locale: string;
  labels: WeatherLabels;
}) {
  if (!points.length) {
    return null;
  }

  const historicalRecords = points
    .map((point) => ({
      point,
      record: recordsFromJson(point.data)[0],
    }))
    .filter((item): item is { point: { date: string; data: JsonValue }; record: WeatherRecord } =>
      item.record != null,
    );
  const historicalTemps = historicalRecords
    .map((item) => numberField(item.record, ["temp", "temperature"]))
    .filter((temp): temp is number => temp != null);
  const averageTemp =
    historicalTemps.length > 0
      ? historicalTemps.reduce((sum, temp) => sum + temp, 0) / historicalTemps.length
      : null;

  return (
    <section className="rounded-4xl border border-border bg-white/95 p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold text-ocean-deep">
          {title}
        </h2>
        <span className="rounded-full bg-ocean-foam px-3 py-1 text-xs font-semibold text-ocean-teal">
          {labels.historical}
        </span>
      </div>

      {averageTemp != null ? (
        <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-emerald-950 ring-1 ring-emerald-200">
          <p className="text-sm font-semibold">{labels.averageTemperature}</p>
          <p className="mt-1 text-3xl font-bold">
            {formatMetric(locale, averageTemp, "°C")}
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        {points.map((point) => {
          const record = recordsFromJson(point.data)[0];
          const date = formatDateWithYearLabel(point.date, locale) ?? point.date;

          if (!record) {
            return (
              <article key={point.date} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <h3 className="font-semibold text-ocean-deep">{date}</h3>
                <EmptyWeatherState label={labels.noReadableWeather} />
              </article>
            );
          }

          const range = formatTemperatureRange(record, locale);
          const conditions = stringField(record, ["conditions", "description"]);
          const metrics = weatherMetrics(record, locale, labels).slice(0, 4);
          const temp = numberField(record, ["temp", "temperature"]);
          const diff = temp != null && averageTemp != null ? temp - averageTemp : null;
          const comparison =
            diff == null || Math.abs(diff) < 0.5
              ? labels.similarToAverage
              : diff > 0
                ? labels.warmerThanAverage
                : labels.colderThanAverage;

          return (
            <article
              key={point.date}
              className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[0.8fr_1.2fr]"
            >
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ocean-teal">
                  <Gauge className="size-4" aria-hidden />
                  {date}
                </p>
                <p className="mt-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {comparison}
                  {diff != null ? ` (${diff > 0 ? "+" : ""}${formatMetric(locale, diff, "°C")})` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-bold text-ocean-deep">
                    {range ?? labels.unknown}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-ocean-deep">
                    {conditions ?? labels.noConditions}
                  </p>
                </div>
                <CloudSun className="size-9 text-ocean-teal" aria-hidden />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:col-span-2">
                {metrics.map((metric) => (
                  <MetricPill key={metric.label} metric={metric} />
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default async function BeachDetailsPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const beachId = Number(id);
  if (!Number.isInteger(beachId) || beachId <= 0) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "beaches" });
  const beachPointTypeId = await resolveBeachPointTypeId();
  const beach = await fetchBeachById({ id: beachId, locale, beachPointTypeId });

  if (beach == null) {
    notFound();
  }

  const address = formatAddress(beach.address);
  const price = formatPrice(beach, locale);
  const weatherLabels: WeatherLabels = {
    currentAndHourly: t("currentAndHourly"),
    currentWeather: t("currentWeather"),
    hourly: t("hourlyForecast"),
    daily: t("dailyForecast"),
    historical: t("historicalWeather"),
    now: t("now"),
    unknown: t("unknown"),
    noConditions: t("noConditions"),
    feelsLike: t("feelsLike"),
    wind: t("wind"),
    humidity: t("humidity"),
    precipitation: t("precipitation"),
    rainChance: t("rainChance"),
    uvIndex: t("uvIndex"),
    cloudCover: t("cloudCover"),
    highLow: t("highLow"),
    noReadableWeather: t("noReadableWeather"),
    windCalm: t("windCalm"),
    windModerate: t("windModerate"),
    windStrong: t("windStrong"),
    windVeryStrong: t("windVeryStrong"),
    averageTemperature: t("averageTemperature"),
    warmerThanAverage: t("warmerThanAverage"),
    colderThanAverage: t("colderThanAverage"),
    similarToAverage: t("similarToAverage"),
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <Link
        href="/beaches"
        className="text-sm font-semibold text-ocean-teal hover:text-ocean-deep"
      >
        {t("backToBeaches")}
      </Link>

      <header className="mt-6 overflow-hidden rounded-4xl border border-border bg-white shadow-[0_18px_60px_-28px_rgba(26,46,53,0.25)]">
        <div className="relative aspect-[16/8] min-h-64 bg-ocean-cyan/30">
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
            <div className="flex h-full flex-col items-center justify-center gap-3 text-ocean-deep/50">
              <Umbrella className="size-14 stroke-[1.25]" aria-hidden />
              <span className="text-sm font-medium">{t("noPhoto")}</span>
            </div>
          )}
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-ocean-deep sm:text-4xl">
              {beach.name}
            </h1>
            {(beach.municipality || beach.region) && (
              <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {[beach.municipality, beach.region].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          {beach.description && (
            <p className="max-w-3xl leading-relaxed text-muted-foreground">
              {beach.description}
            </p>
          )}

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-ocean-foam p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                {t("entry")}
              </dt>
              <dd className="mt-1 font-medium text-ocean-deep">
                {beach.isFree ? t("free") : price ?? t("paid")}
              </dd>
            </div>
            {beach.beachDetails?.beachSurface && (
              <div className="rounded-2xl bg-ocean-foam p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                  {t("filterSurface")}
                </dt>
                <dd className="mt-1 font-medium text-ocean-deep">
                  {t("surface", { value: beach.beachDetails.beachSurface })}
                </dd>
              </div>
            )}
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
          </dl>
        </div>
      </header>

      <div className="mt-8 grid gap-6">
        <section className="rounded-3xl border border-border bg-white/90 p-5 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-ocean-deep">
            {t("beachDetails")}
          </h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-ocean-foam p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                {t("filterLifeguard")}
              </dt>
              <dd className="mt-1 font-medium text-ocean-deep">
                {beach.beachDetails?.hasLifeguard ? t("yes") : t("unknown")}
              </dd>
            </div>
            <div className="rounded-2xl bg-ocean-foam p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                {t("filterShower")}
              </dt>
              <dd className="mt-1 font-medium text-ocean-deep">
                {beach.beachDetails?.hasShower ? t("yes") : t("unknown")}
              </dd>
            </div>
            <div className="rounded-2xl bg-ocean-foam p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                {t("boatAccessOnly")}
              </dt>
              <dd className="mt-1 font-medium text-ocean-deep">
                {beach.beachDetails?.boatAccessOnly ? t("yes") : t("no")}
              </dd>
            </div>
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
        </section>
      </div>

      <div className="mt-6 grid gap-6">
        <HourlyWeatherSection
          title={t("todayHourlyUntil20")}
          value={beach.beachWeather?.todayHourlyUntil20 ?? null}
          current={beach.weather}
          locale={locale}
          labels={weatherLabels}
        />
        <DailyForecastSection
          title={t("forecastNext3Days")}
          value={beach.beachWeather?.forecastNext3Days ?? null}
          locale={locale}
          labels={weatherLabels}
        />

        <HistoricalWeatherSection
          title={t("historicalSameDay")}
          points={beach.beachWeather?.historicalSameDay ?? []}
          locale={locale}
          labels={weatherLabels}
        />
      </div>
    </article>
  );
}
