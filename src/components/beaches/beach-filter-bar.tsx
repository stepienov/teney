"use client";

import { LayoutGrid, List, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { BeachFilterMobile } from "@/components/beaches/beach-filter-mobile";
import { BeachFilterPanel } from "@/components/beaches/beach-filter-panel";
import { BeachWeatherFilterChips } from "@/components/beaches/beach-weather-filter-chips";
import {
  clearBeachFilters,
  hasBeachFilters,
  type BeachFilterState,
} from "@/components/beaches/beach-filter-state";
import {
  FilterMenu,
  FilterOptionRow,
  SortMenu,
} from "@/components/beaches/filter-menu";
import { Button } from "@/components/ui/button";
import { uniqueRegions } from "@/lib/api/reference";
import type { MunicipalityRef } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

type BeachFilterBarProps = {
  value: BeachFilterState;
  municipalities: MunicipalityRef[];
  locationSortActive: boolean;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  onApply: (next: BeachFilterState) => void;
  onSortChange: (sort: string) => void;
};

export function BeachFilterBar({
  value,
  municipalities,
  locationSortActive,
  viewMode,
  onViewModeChange,
  onApply,
  onSortChange,
}: BeachFilterBarProps) {
  const t = useTranslations("beaches");
  const regions = useMemo(() => uniqueRegions(municipalities), [municipalities]);

  const filtersActive = hasBeachFilters(value);
  const sortValue = locationSortActive ? "location" : value.sort;

  function patch(next: BeachFilterState) {
    onApply(next);
  }

  const sortOptions = [
    { value: "weather.tempMax", label: t("sortWarmest") },
    { value: "weather.windSpeed", label: t("sortLightestWind") },
    { value: "location", label: t("sortNearest") },
    { value: "name", label: t("sortName") },
  ] as const;

  return (
    <>
      <BeachFilterMobile
        value={value}
        municipalities={municipalities}
        locationSortActive={locationSortActive}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onApply={onApply}
        onSortChange={onSortChange}
      />

      <div className="mb-4 hidden items-center gap-2 sm:flex">
        <label className="relative w-80 shrink-0">
          <span className="sr-only">{t("searchName")}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={value.name}
            onChange={(event) => patch({ ...value, name: event.target.value })}
            className="h-9 w-full rounded-md border border-border bg-white pr-3 pl-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <FilterMenu
          label={t("filterMenu")}
          hasActive={filtersActive}
          clearLabel={t("clearFilters")}
          onClear={() => patch(clearBeachFilters(value))}
        >
          <BeachFilterPanel
            value={value}
            regions={regions}
            onPatch={patch}
            variant="desktop"
          />
        </FilterMenu>

        <SortMenu sortLabel={t("sortMenu")}>
          {sortOptions.map((option) => (
            <FilterOptionRow
              key={option.value}
              selected={sortValue === option.value}
              label={option.label}
              onSelect={() => onSortChange(option.value)}
            />
          ))}
        </SortMenu>

        <div
          className="ml-auto flex shrink-0 items-center gap-1.5"
          role="group"
          aria-label={t("viewModeLabel")}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "size-9 shrink-0 rounded-md border-border bg-white shadow-sm",
              viewMode === "list" && "border-brand/50 bg-brand-muted text-brand",
            )}
            aria-pressed={viewMode === "list"}
            aria-label={t("viewList")}
            onClick={() => onViewModeChange("list")}
          >
            <List className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "size-9 shrink-0 rounded-md border-border bg-white shadow-sm",
              viewMode === "grid" && "border-brand/50 bg-brand-muted text-brand",
            )}
            aria-pressed={viewMode === "grid"}
            aria-label={t("viewGrid")}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="mb-4 hidden sm:block">
        <BeachWeatherFilterChips value={value} onApply={onApply} />
      </div>
    </>
  );
}
