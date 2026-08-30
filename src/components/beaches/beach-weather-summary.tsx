"use client";

import { Cloud, CloudRain, CloudSun, Droplets, Sun, Wind } from "lucide-react";
import { useLocale } from "next-intl";

import {
  cloudDisplayLevel,
  formatTempRange,
  formatWindSpeed,
  hasRenderableBeachWeather,
  precipDisplayLevel,
  windSpeedTone,
} from "@/lib/beach-display-weather";
import type { BeachDisplayWeather } from "@/lib/types/beach-list";
import { cn } from "@/lib/utils";

type BeachWeatherSummaryProps = {
  weather: BeachDisplayWeather | null | undefined;
  className?: string;
  compact?: boolean;
};

function CloudIcon({ level }: { level: ReturnType<typeof cloudDisplayLevel> }) {
  const className = "size-3.5 shrink-0 text-peach";

  if (level === "clear") {
    return <Sun className={className} aria-hidden />;
  }
  if (level === "partly") {
    return <CloudSun className={cn(className, "text-sky")} aria-hidden />;
  }
  if (level === "cloudy") {
    return <Cloud className={cn(className, "text-muted-foreground")} aria-hidden />;
  }
  return null;
}

function PrecipIcon({ level }: { level: ReturnType<typeof precipDisplayLevel> }) {
  if (level === "chance") {
    return <Droplets className="size-3 shrink-0 text-sky" aria-hidden />;
  }
  if (level === "likely") {
    return <CloudRain className="size-3.5 shrink-0 text-sky" aria-hidden />;
  }
  return null;
}

const WIND_TONE_CLASS: Record<
  NonNullable<ReturnType<typeof windSpeedTone>>,
  string
> = {
  calm: "text-sky",
  moderate: "text-coral",
  strong: "text-coral",
};

export function BeachWeatherSummary({
  weather,
  className,
  compact = false,
}: BeachWeatherSummaryProps) {
  const locale = useLocale();

  if (weather == null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>—</span>
    );
  }

  const tempRange = formatTempRange(weather.tempMin, weather.tempMax, locale);
  const cloud = cloudDisplayLevel(weather.cloudCover);
  const precip = precipDisplayLevel(weather.precipProb);
  const windTone = windSpeedTone(weather.windSpeed);
  const windLabel =
    weather.windSpeed != null && Number.isFinite(weather.windSpeed)
      ? formatWindSpeed(weather.windSpeed, locale)
      : null;

  if (!hasRenderableBeachWeather(weather)) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>—</span>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5",
        compact ? "text-xs" : "text-sm",
        className,
      )}
      title={weather.description ?? weather.conditions ?? undefined}
    >
      {tempRange ? (
        <span className="shrink-0 tabular-nums font-medium text-foreground">
          {tempRange}
        </span>
      ) : null}
      <span className="inline-flex shrink-0 items-center gap-0.5">
        <CloudIcon level={cloud} />
        <PrecipIcon level={precip} />
      </span>
      {windLabel && windTone ? (
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 font-medium tabular-nums",
            compact ? "text-[11px]" : "text-xs",
            WIND_TONE_CLASS[windTone],
          )}
        >
          <Wind className="size-3 shrink-0" aria-hidden />
          {windLabel}
        </span>
      ) : null}
    </div>
  );
}
