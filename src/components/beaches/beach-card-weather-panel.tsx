"use client";

import { BeachWeatherSummary } from "@/components/beaches/beach-weather-summary";
import { hasRenderableBeachWeather } from "@/lib/beach-display-weather";
import type { BeachDisplayWeather } from "@/lib/types/beach-list";
import { cn } from "@/lib/utils";

type BeachCardWeatherPanelProps = {
  weather: BeachDisplayWeather | null | undefined;
  className?: string;
};

export function BeachCardWeatherPanel({
  weather,
  className,
}: BeachCardWeatherPanelProps) {
  if (!hasRenderableBeachWeather(weather)) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-b border-border bg-card px-2 py-1.5",
        className,
      )}
    >
      <BeachWeatherSummary weather={weather} compact />
    </div>
  );
}
