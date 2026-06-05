"use client";

import { useTranslations } from "next-intl";

import { BeachWeatherSummary } from "@/components/beaches/beach-weather-summary";
import { shortWeatherLabel } from "@/lib/beach-display-weather";
import type { BeachDisplayWeather } from "@/lib/types/beach-list";
import { cn } from "@/lib/utils";

type BeachListWeatherCellProps = {
  weather: BeachDisplayWeather | null | undefined;
  className?: string;
};

export function BeachListWeatherCell({
  weather,
  className,
}: BeachListWeatherCellProps) {
  const t = useTranslations("beaches");

  if (weather == null) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>—</span>
    );
  }

  const label = shortWeatherLabel(weather, t);

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <BeachWeatherSummary weather={weather} />
      {label ? (
        <span className="min-w-0 truncate text-xs text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  );
}
