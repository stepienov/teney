"use client";

import { LayoutGrid, List, Map } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { BeachFilterMobile } from "@/components/beaches/beach-filter-mobile";
import { BeachNameSearch } from "@/components/beaches/beach-name-search";
import { BeachFilterPanel } from "@/components/beaches/beach-filter-panel";
import { BeachWeatherFilterChips } from "@/components/beaches/beach-weather-filter-chips";
import {
  clearBeachFilters,
  hasExplorerFilters,
  type BeachFilterState,
} from "@/components/beaches/beach-filter-state";
import {
  FilterMenu,
  FilterOptionRow,
  SortMenu,
} from "@/components/beaches/filter-menu";
import { usePoiCategoryConfig } from "@/components/poi-explorer/poi-category-context";
import { Button } from "@/components/ui/button";
import { uniqueRegions } from "@/lib/api/reference";
import type { BeachViewMode } from "@/lib/beach-view-mode";
import type { MunicipalityRef } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

type BeachFilterBarProps = {
  value: BeachFilterState;
  municipalities: MunicipalityRef[];
  locationSortActive: boolean;
  viewMode: BeachViewMode;
  onViewModeChange: (mode: BeachViewMode) => void;
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
  const { messagesNamespace, features } = usePoiCategoryConfig();
  const t = useTranslations(messagesNamespace);
  const regions = useMemo(() => uniqueRegions(municipalities), [municipalities]);

  const filtersActive = hasExplorerFilters(value, features);
  const sortValue = locationSortActive ? "location" : value.sort;

  function patch(next: BeachFilterState) {
    onApply(next);
  }

  const sortOptions = [
    ...(features.weather
      ? [
          { value: "weather.tempMax", label: t("sortWarmest") },
          { value: "weather.windSpeed", label: t("sortLightestWind") },
        ]
      : []),
    { value: "location", label: t("sortNearest") },
    { value: "quality", label: t("sortQuality") },
    { value: "popularity", label: t("sortPopularity") },
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
        <BeachNameSearch
          key={value.name}
          value={value.name}
          variant="desktop"
          onSubmit={(name) => patch({ ...value, name })}
        />

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
              "size-9 shrink-0 rounded-md border-border bg-card shadow-sm",
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
              "size-9 shrink-0 rounded-md border-border bg-card shadow-sm",
              viewMode === "grid" && "border-brand/50 bg-brand-muted text-brand",
            )}
            aria-pressed={viewMode === "grid"}
            aria-label={t("viewGrid")}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "size-9 shrink-0 rounded-md border-border bg-card shadow-sm",
              viewMode === "map" && "border-brand/50 bg-brand-muted text-brand",
            )}
            aria-pressed={viewMode === "map"}
            aria-label={t("viewMap")}
            onClick={() => onViewModeChange("map")}
          >
            <Map className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="mb-4 hidden sm:block">
        {features.weather ? (
          <BeachWeatherFilterChips value={value} onApply={onApply} />
        ) : null}
      </div>
    </>
  );
}
