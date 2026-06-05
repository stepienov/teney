"use client";

import { BeachWeatherSummary } from "@/components/beaches/beach-weather-summary";
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
  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-b border-border bg-white px-2 py-1.5",
        className,
      )}
    >
      <BeachWeatherSummary weather={weather} compact />
    </div>
  );
}
