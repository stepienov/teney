"use client";

import { LayoutGrid, List, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  BEACH_SURFACE_OPTIONS,
  clearBeachFilters,
  hasBeachFilters,
  toggleFilterId,
  type BeachFilterState,
} from "@/components/beaches/beach-filter-state";
import {
  FilterCheckboxRow,
  FilterMenu,
  FilterOptionRow,
  FilterSubmenu,
  SortMenu,
} from "@/components/beaches/filter-menu";
import { Button } from "@/components/ui/button";
import { uniqueRegions } from "@/lib/api/reference";
import { formatRegionDisplayName } from "@/lib/region-display-name";
import type { MunicipalityRef } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

type BeachFilterBarProps = {
  value: BeachFilterState;
  municipalities: MunicipalityRef[];
  nearMe: boolean;
  locationPending: boolean;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  onApply: (next: BeachFilterState) => void;
  onReset: () => void;
  onSortChange: (sort: string) => void;
  onDirectionToggle: () => void;
};

function optionLabel(text: string): string {
  return text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : text;
}

const SURFACE_LABEL_KEYS: Record<(typeof BEACH_SURFACE_OPTIONS)[number], string> = {
  LIGHT_SAND: "surfaceLightSand",
  VOLCANIC_SAND: "surfaceVolcanicSand",
  STONES: "surfaceStones",
};

const DEFAULT_SORT = "name";
const DEFAULT_SORT_DIRECTION = "ASC";

export function BeachFilterBar({
  value,
  municipalities,
  nearMe,
  locationPending,
  viewMode,
  onViewModeChange,
  onApply,
  onReset,
  onSortChange,
  onDirectionToggle,
}: BeachFilterBarProps) {
  const t = useTranslations("beaches");
  const regions = useMemo(() => uniqueRegions(municipalities), [municipalities]);

  const filtersActive = hasBeachFilters(value);

  const sortValue = nearMe ? "location" : value.sort;
  const sortSummary =
    sortValue === "location"
      ? locationPending
        ? t("nearMeLocating")
        : t("sortLocation")
      : sortValue === "region.name"
          ? t("sortRegion")
          : t("sortName");

  const isDefaultSort =
    !nearMe &&
    value.sort === DEFAULT_SORT &&
    value.sortDirection === DEFAULT_SORT_DIRECTION;

  const showSortDirection = !isDefaultSort;

  function patch(next: BeachFilterState) {
    onApply(next);
  }

  function handleNameChange(name: string) {
    patch({ ...value, name });
  }

  const sortOptions = [
    { value: "name", label: t("sortName") },
    { value: "location", label: locationPending ? t("nearMeLocating") : t("sortLocation") },
    { value: "region.name", label: t("sortRegion") },
  ] as const;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="relative min-w-[12rem] flex-1 sm:max-w-xs">
        <span className="sr-only">{t("searchName")}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={value.name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-9 w-full rounded-md border border-border bg-white pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      <FilterMenu
        label={t("filterMenu")}
        hasActive={filtersActive}
        clearLabel={t("clearFilters")}
        onClear={() => patch(clearBeachFilters(value))}
      >
        <div className="py-1">
          <div className="max-h-[min(16rem,50vh)] overflow-y-auto px-1">
          <p className="px-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("filterAttributes")}
          </p>
          <FilterCheckboxRow
            checked={value.hasLifeguard}
            label={t("filterLifeguard")}
            onChange={(checked) => patch({ ...value, hasLifeguard: checked })}
          />
          <FilterCheckboxRow
            checked={value.hasShower}
            label={t("filterShower")}
            onChange={(checked) => patch({ ...value, hasShower: checked })}
          />
          <FilterCheckboxRow
            checked={value.hasSunbeds}
            label={t("filterSunbeds")}
            onChange={(checked) => patch({ ...value, hasSunbeds: checked })}
          />
          <FilterCheckboxRow
            checked={value.hasShopNearby}
            label={t("filterShopNearby")}
            onChange={(checked) => patch({ ...value, hasShopNearby: checked })}
          />
          <FilterCheckboxRow
            checked={value.hasRestaurantNearby}
            label={t("filterRestaurantNearby")}
            onChange={(checked) => patch({ ...value, hasRestaurantNearby: checked })}
          />
          <FilterCheckboxRow
            checked={value.dogFriendly}
            label={t("filterDogFriendly")}
            onChange={(checked) => patch({ ...value, dogFriendly: checked })}
          />
          <FilterCheckboxRow
            checked={value.hasWebcam}
            label={t("filterWebcam")}
            onChange={(checked) => patch({ ...value, hasWebcam: checked })}
          />

          </div>

          <div className="mx-2 border-t border-border" role="separator" />

          <div className="px-1 pt-1 pb-0.5">
          <FilterSubmenu
            label={t("filterSurface")}
            hasActive={value.beachSurfaces.length > 0}
          >
            {BEACH_SURFACE_OPTIONS.map((surface) => (
              <FilterCheckboxRow
                key={surface}
                checked={value.beachSurfaces.includes(surface)}
                label={optionLabel(t(SURFACE_LABEL_KEYS[surface]))}
                onChange={() =>
                  patch({
                    ...value,
                    beachSurfaces: toggleFilterId(value.beachSurfaces, surface),
                  })
                }
              />
            ))}
          </FilterSubmenu>

          <FilterSubmenu
            label={t("filterRegionMenu")}
            hasActive={value.regionIds.length > 0}
          >
            {regions.map((region) => (
              <FilterCheckboxRow
                key={region.id}
                checked={value.regionIds.includes(String(region.id))}
                label={formatRegionDisplayName(region.name)}
                onChange={() =>
                  patch({
                    ...value,
                    regionIds: toggleFilterId(value.regionIds, String(region.id)),
                  })
                }
              />
            ))}
          </FilterSubmenu>
          </div>
        </div>
      </FilterMenu>

      <SortMenu
        sortLabel={t("sortMenu")}
        activeLabel={sortSummary}
        isActive={!isDefaultSort}
        showDirection={showSortDirection}
        sortDirection={value.sortDirection}
        directionTitle={
          value.sortDirection === "ASC" ? t("directionAsc") : t("directionDesc")
        }
        onDirectionToggle={onDirectionToggle}
      >
        {sortOptions.map((option) => (
          <FilterOptionRow
            key={option.value}
            selected={sortValue === option.value}
            label={option.label}
            onSelect={() => onSortChange(option.value)}
          />
        ))}
      </SortMenu>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="size-9 shrink-0 rounded-md border-border"
        aria-label={t("resetFilters")}
        onClick={onReset}
      >
        <X className="size-4" aria-hidden />
      </Button>

      <div
        className="ml-auto inline-flex h-9 shrink-0 rounded-md border border-border bg-white p-0.5"
        role="group"
        aria-label={t("viewModeLabel")}
      >
        <Button
          type="button"
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon-sm"
          className={cn(
            "size-7 rounded-[calc(var(--radius)-2px)]",
            viewMode === "list" && "bg-brand-muted text-brand",
          )}
          aria-pressed={viewMode === "list"}
          aria-label={t("viewList")}
          onClick={() => onViewModeChange("list")}
        >
          <List className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon-sm"
          className={cn(
            "size-7 rounded-[calc(var(--radius)-2px)]",
            viewMode === "grid" && "bg-brand-muted text-brand",
          )}
          aria-pressed={viewMode === "grid"}
          aria-label={t("viewGrid")}
          onClick={() => onViewModeChange("grid")}
        >
          <LayoutGrid className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
