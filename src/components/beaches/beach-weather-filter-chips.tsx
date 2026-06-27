"use client";

import { useTranslations } from "next-intl";

import type { BeachFilterState } from "@/components/beaches/beach-filter-state";
import { FilterBadgeToggle } from "@/components/beaches/filter-menu";
import { usePoiCategoryConfig } from "@/components/poi-explorer/poi-category-context";
import { cn } from "@/lib/utils";

const WEATHER_CHIP_KEYS = [
  { key: "dryToday", labelKey: "filterDryToday" },
  { key: "lightWind", labelKey: "filterLightWind" },
  { key: "clearSky", labelKey: "filterClearSky" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<BeachFilterState, "dryToday" | "lightWind" | "clearSky">;
  labelKey: string;
}>;

type BeachWeatherFilterChipsProps = {
  value: BeachFilterState;
  onApply: (next: BeachFilterState) => void;
  className?: string;
};

export function BeachWeatherFilterChips({
  value,
  onApply,
  className,
}: BeachWeatherFilterChipsProps) {
  const { messagesNamespace } = usePoiCategoryConfig();
  const t = useTranslations(messagesNamespace);

  return (
    <div
      className={cn("flex flex-wrap gap-1.5", className)}
      role="group"
      aria-label={t("filterWeatherToday")}
    >
      {WEATHER_CHIP_KEYS.map(({ key, labelKey }) => (
        <FilterBadgeToggle
          key={key}
          checked={value[key]}
          label={t(labelKey).toLocaleLowerCase()}
          onToggle={() => onApply({ ...value, [key]: !value[key] })}
        />
      ))}
    </div>
  );
}
