import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarDays,
  CloudRain,
  CloudSun,
  Cctv,
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
  hideLabelWhenHelper?: boolean;
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

function temperatureFromRecord(record: WeatherRecord | null): number | null {
  if (record == null) {
    return null;
  }

  return numberField(record, ["temp", "temperature", "tempavg", "temperatureAvg"]);
}

function headlineTemperatureFromRecord(record: WeatherRecord | null): number | null {
  if (record == null) {
    return null;
  }

  return (
    numberField(record, ["tempmax", "temperatureMax", "maxTemp"]) ??
    temperatureFromRecord(record)
  );
}

function temperatureFromWeatherJson(value: JsonValue | null | undefined): number | null {
  return temperatureFromRecord(recordsFromJson(value ?? null)[0] ?? null);
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
      hideLabelWhenHelper: true,
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

  if (speed < 10) {
    return { label: labels.windCalm, tone: "emerald", width: "25%" };
  }

  if (speed <= 15) {
    return { label: labels.windModerate, tone: "sky", width: "50%" };
  }

  if (speed <= 20) {
    return { label: labels.windNoticeable, tone: "amber", width: "65%" };
  }

  if (speed <= 30) {
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

function isTruthyAttribute(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toUpperCase() === "TRUE";
  }

  return false;
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
        rel="noreferrer"
        className={`${className} transition-colors hover:bg-ocean-cyan/40`}
      >
        {children}
      </a>
    );
  }

  return <span className={className}>{children}</span>;
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
    <div
      className={`grid min-h-16 grid-cols-[auto_1fr_auto] items-center gap-x-2 rounded-2xl px-4 py-3 text-sm shadow-sm ring-1 ${toneClass}`}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <div className="min-w-0">
        {!metric.hideLabelWhenHelper || !metric.helper ? (
          <p className="text-sm font-medium leading-tight text-current/70">
            {metric.label}
          </p>
        ) : null}
        {metric.helper ? (
          <p className="text-sm font-semibold leading-tight text-current/80">
            {metric.helper}
          </p>
        ) : null}
      </div>
      <span className="self-center whitespace-nowrap text-base font-bold leading-none">
        {metric.value}
      </span>
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

function CurrentWeatherSection({
  title,
  current,
  locale,
  labels,
}: {
  title: string;
  current: Weather | null;
  locale: string;
  labels: WeatherLabels;
}) {
  if (current == null) {
    return null;
  }

  const currentWind = windInfo(current.windSpeed, labels);
  const currentConditions = conditionLabel(current.conditions, labels.t);

  return (
    <section className="rounded-4xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-[0_18px_50px_-30px_rgba(26,46,53,0.28)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            {labels.beachWeather}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-ocean-deep">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-3xl bg-white p-4 ring-1 ring-sky-200 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold text-sky-700">{labels.currentWeather}</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="text-6xl font-bold tracking-tight text-ocean-deep">
              {current.temperature != null
                ? formatMetric(locale, current.temperature, "°C")
                : labels.unknown}
            </p>
            <p className="pb-1 text-sm font-medium text-ocean-deep">
              {currentConditions ?? labels.currentDataOnly}
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
                hideLabelWhenHelper: true,
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
        </div>
      </div>
    </section>
  );
}

function HourlyWeatherSection({
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
    <section className="overflow-hidden rounded-4xl border border-sky-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold text-ocean-deep">
          {title}
        </h2>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 shadow-sm ring-1 ring-sky-200">
          {labels.hourly}
        </span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {records.map((record, index) => {
          const time = formatTimeLabel(stringField(record, ["datetime", "time"]));
          const temp = formatMetric(
            locale,
            numberField(record, ["temp", "temperature"]),
            "°C",
          );
          const conditions = conditionLabel(
            stringField(record, ["conditions", "description"]),
            labels.t,
          );
          const metrics = weatherMetrics(record, locale, labels).slice(0, 4);

          return (
            <article
              key={`${time ?? labels.now}-${index}`}
              className="rounded-3xl border border-sky-100 bg-white p-4 shadow-sm"
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
                {conditions ?? labels.currentDataOnly}
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
  t: (key: string) => string;
  currentWeather: string;
  beachWeather: string;
  hourly: string;
  daily: string;
  historical: string;
  now: string;
  unknown: string;
  noConditions: string;
  currentDataOnly: string;
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
  windNoticeable: string;
  windStrong: string;
  windVeryStrong: string;
  averageTemperature: string;
  averageTemperatureShort: string;
  todayTemperature: string;
  warmerThanAverage: string;
  colderThanAverage: string;
  similarToAverage: string;
  warmerThanToday: string;
  colderThanToday: string;
  similarToToday: string;
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
          const conditions = conditionLabel(
            stringField(record, ["conditions", "description"]),
            labels.t,
          );
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
  currentTemperature,
  locale,
  labels,
}: {
  title: string;
  points: { date: string; data: JsonValue }[];
  currentTemperature: number | null;
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
    .map((item) => temperatureFromRecord(item.record))
    .filter((temp): temp is number => temp != null);
  const averageTemp =
    historicalTemps.length > 0
      ? historicalTemps.reduce((sum, temp) => sum + temp, 0) / historicalTemps.length
      : null;
  const todayVsAverage =
    currentTemperature != null && averageTemp != null
      ? currentTemperature - averageTemp
      : null;
  const todayAverageLabel =
    todayVsAverage == null || Math.abs(todayVsAverage) < 0.5
      ? labels.similarToAverage
      : todayVsAverage > 0
        ? labels.warmerThanAverage
        : labels.colderThanAverage;

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

      <div className="mt-5 grid gap-4 lg:grid-cols-[18rem_1fr]">
        <aside className="self-start rounded-3xl bg-emerald-50 p-4 text-emerald-950 ring-1 ring-emerald-200 lg:sticky lg:top-24">
          <p className="text-sm font-semibold">{labels.todayTemperature}</p>
          <p className="mt-1 text-4xl font-bold">
            {formatMetric(locale, currentTemperature, "°C") ?? labels.unknown}
          </p>
          {averageTemp != null ? (
            <p className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold">
              {todayAverageLabel}
              {todayVsAverage != null
                ? ` (${todayVsAverage > 0 ? "+" : ""}${formatMetric(
                    locale,
                    todayVsAverage,
                    "°C",
                  )})`
                : ""}
            </p>
          ) : null}
          {averageTemp != null ? (
            <div className="mt-4 border-t border-emerald-200 pt-4">
              <p className="text-sm font-semibold">{labels.averageTemperature}</p>
              <p className="mt-1 text-2xl font-bold">
                {formatMetric(locale, averageTemp, "°C")}
              </p>
            </div>
          ) : null}
        </aside>

        <div className="grid gap-3">
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
            const conditions = conditionLabel(
              stringField(record, ["conditions", "description"]),
              labels.t,
            );
            const metrics = weatherMetrics(record, locale, labels).slice(0, 4);
            const temp = headlineTemperatureFromRecord(record);
            const diff =
              temp != null && currentTemperature != null
                ? temp - currentTemperature
                : null;
            const comparison =
              diff == null || Math.abs(diff) < 0.5
                ? labels.similarToToday
                : diff > 0
                  ? labels.warmerThanToday
                  : labels.colderThanToday;

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
                    {diff != null
                      ? ` (${diff > 0 ? "+" : ""}${formatMetric(locale, diff, "°C")})`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-3xl font-bold text-ocean-deep">
                      {range ?? labels.unknown}
                    </h3>
                    {temp != null ? (
                      <p className="mt-1 text-sm font-semibold text-ocean-teal">
                        {labels.averageTemperatureShort}:{" "}
                        {formatMetric(locale, temp, "°C")}
                      </p>
                    ) : null}
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
  const beach = await fetchBeachById({ id: beachId, locale });

  if (beach == null) {
    notFound();
  }

  const address = formatAddress(beach.address);
  const price = beach.isFree ? null : formatPrice(beach, locale);
  const surface = surfaceLabel(beach.beachDetails?.beachSurface, {
    lightSand: t("surfaceLightSand"),
    volcanicSand: t("surfaceVolcanicSand"),
    stones: t("surfaceStones"),
  });
  const webcamLink =
    typeof beach.attributes?.webcam_link === "string"
      ? beach.attributes.webcam_link
      : null;
  const beachFeatureTags = [
    surface ? { key: "surface", label: surface } : null,
    beach.beachDetails?.hasLifeguard ? { key: "lifeguard", label: t("tagLifeguard") } : null,
    beach.beachDetails?.hasShower ? { key: "shower", label: t("tagShower") } : null,
    beach.beachDetails?.boatAccessOnly ? { key: "boat", label: t("tagBoatOnly") } : null,
    isTruthyAttribute(beach.attributes?.sunbeds_boolean)
      ? { key: "sunbeds", label: t("tagSunbeds") }
      : null,
    isTruthyAttribute(beach.attributes?.shop_nearby_boolean)
      ? { key: "shop", label: t("tagShopNearby") }
      : null,
    isTruthyAttribute(beach.attributes?.restaurant_nearby_boolean)
      ? { key: "restaurant", label: t("tagRestaurantNearby") }
      : null,
    isTruthyAttribute(beach.attributes?.dog_friendly_boolean)
      ? { key: "dogs", label: t("tagDogFriendly") }
      : null,
  ].filter(
    (tag): tag is { key: string; label: string; href?: string } => tag != null,
  );
  const weatherLabels: WeatherLabels = {
    t: (key) => t(key),
    currentWeather: t("currentWeather"),
    beachWeather: t("beachForecast"),
    hourly: t("hourlyForecast"),
    daily: t("dailyForecast"),
    historical: t("historicalWeather"),
    now: t("now"),
    unknown: t("unknown"),
    noConditions: t("noConditions"),
    currentDataOnly: t("currentDataOnly"),
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
    windNoticeable: t("windNoticeable"),
    windStrong: t("windStrong"),
    windVeryStrong: t("windVeryStrong"),
    averageTemperature: t("averageTemperature"),
    averageTemperatureShort: t("averageTemperatureShort"),
    todayTemperature: t("todayTemperature"),
    warmerThanAverage: t("warmerThanAverage"),
    colderThanAverage: t("colderThanAverage"),
    similarToAverage: t("similarToAverage"),
    warmerThanToday: t("warmerThanToday"),
    colderThanToday: t("colderThanToday"),
    similarToToday: t("similarToToday"),
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

          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
            {beach.description && (
              <p className="max-w-3xl leading-relaxed text-muted-foreground">
                {beach.description}
              </p>
            )}
            {webcamLink ? (
              <a
                href={webcamLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-ocean-deep px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-teal"
              >
                <Cctv className="size-4" aria-hidden />
                {t("webcamButton")}
              </a>
            ) : null}
          </div>

          {beachFeatureTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {beachFeatureTags.map((tag) => (
                <FeatureTag key={tag.key} href={tag.href}>
                  {tag.label}
                </FeatureTag>
              ))}
            </div>
          ) : null}

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

      <div className="mt-6 grid gap-6">
        <CurrentWeatherSection
          title={t("currentWeather")}
          current={beach.weather}
          locale={locale}
          labels={weatherLabels}
        />
        <HourlyWeatherSection
          title={t("hourlyNext3")}
          value={
            beach.beachWeather?.hourlyNext3 ??
            beach.beachWeather?.todayHourlyUntil20 ??
            null
          }
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
          currentTemperature={temperatureFromWeatherJson(beach.beachWeather?.todayDaily)}
          locale={locale}
          labels={weatherLabels}
        />
      </div>
    </article>
  );
}
