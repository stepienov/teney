"use client";

import { useTranslations } from "next-intl";
import {
  BEACH_SURFACE_OPTIONS,
  toggleFilterId,
  type BeachFilterState,
} from "@/components/beaches/beach-filter-state";
import {
  FilterMobileExpandable,
  FilterSubmenu,
  FilterSwitchRow,
} from "@/components/beaches/filter-menu";
import { formatRegionDisplayName } from "@/lib/region-display-name";

type RegionOption = { id: number; name: string };

function optionLabel(text: string): string {
  return text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : text;
}

const SURFACE_LABEL_KEYS: Record<(typeof BEACH_SURFACE_OPTIONS)[number], string> = {
  LIGHT_SAND: "surfaceLightSand",
  VOLCANIC_SAND: "surfaceVolcanicSand",
  STONES: "surfaceStones",
};

type BeachFilterPanelProps = {
  value: BeachFilterState;
  regions: RegionOption[];
  onPatch: (next: BeachFilterState) => void;
  /** desktop: podmenu po hover; mobile: sekcje rozwijane w sheet. */
  variant: "desktop" | "mobile";
};

export function BeachFilterPanel({
  value,
  regions,
  onPatch,
  variant,
}: BeachFilterPanelProps) {
  const t = useTranslations("beaches");
  const isMobile = variant === "mobile";

  function patch(partial: Partial<BeachFilterState>) {
    onPatch({ ...value, ...partial });
  }

  const attributeRows = (
    <>
      <FilterSwitchRow
        checked={value.hasLifeguard}
        label={t("filterLifeguard")}
        onChange={(checked) => patch({ hasLifeguard: checked })}
        variant={variant}
      />
      <FilterSwitchRow
        checked={value.hasShower}
        label={t("filterShower")}
        onChange={(checked) => patch({ hasShower: checked })}
        variant={variant}
      />
      <FilterSwitchRow
        checked={value.hasSunbeds}
        label={t("filterSunbeds")}
        onChange={(checked) => patch({ hasSunbeds: checked })}
        variant={variant}
      />
      <FilterSwitchRow
        checked={value.hasShopNearby}
        label={t("filterShopNearby")}
        onChange={(checked) => patch({ hasShopNearby: checked })}
        variant={variant}
      />
      <FilterSwitchRow
        checked={value.hasRestaurantNearby}
        label={t("filterRestaurantNearby")}
        onChange={(checked) => patch({ hasRestaurantNearby: checked })}
        variant={variant}
      />
      <FilterSwitchRow
        checked={value.dogFriendly}
        label={t("filterDogFriendly")}
        onChange={(checked) => patch({ dogFriendly: checked })}
        variant={variant}
      />
      <FilterSwitchRow
        checked={value.hasWebcam}
        label={t("filterWebcam")}
        onChange={(checked) => patch({ hasWebcam: checked })}
        variant={variant}
      />
    </>
  );

  const surfaceRows = BEACH_SURFACE_OPTIONS.map((surface) => (
    <FilterSwitchRow
      key={surface}
      checked={value.beachSurfaces.includes(surface)}
      label={optionLabel(t(SURFACE_LABEL_KEYS[surface]))}
      onChange={() =>
        onPatch({
          ...value,
          beachSurfaces: toggleFilterId(value.beachSurfaces, surface),
        })
      }
      variant={variant}
    />
  ));

  const regionRows = regions.map((region) => (
    <FilterSwitchRow
      key={region.id}
      checked={value.regionIds.includes(String(region.id))}
      label={formatRegionDisplayName(region.name)}
      onChange={() =>
        onPatch({
          ...value,
          regionIds: toggleFilterId(value.regionIds, String(region.id)),
        })
      }
      variant={variant}
    />
  ));

  if (isMobile) {
    return (
      <div className="flex flex-col">
        {attributeRows}
        <FilterMobileExpandable
          label={t("filterSurface")}
          hasActive={value.beachSurfaces.length > 0}
          accentLabel
        >
          {surfaceRows}
        </FilterMobileExpandable>
        <FilterMobileExpandable
          label={t("filterRegionMenu")}
          hasActive={value.regionIds.length > 0}
          accentLabel
        >
          {regionRows}
        </FilterMobileExpandable>
      </div>
    );
  }

  return (
    <div className="py-1.5">
      <div className="space-y-0.5 px-1.5">
        {attributeRows}
      </div>

      <div className="mx-2.5 my-1 border-t border-border" role="separator" />

      <div className="space-y-0.5 px-1.5 pb-0.5">
        <FilterSubmenu
          label={t("filterSurface")}
          hasActive={value.beachSurfaces.length > 0}
          accentLabel
        >
          {surfaceRows}
        </FilterSubmenu>

        <FilterSubmenu
          label={t("filterRegionMenu")}
          hasActive={value.regionIds.length > 0}
          accentLabel
        >
          {regionRows}
        </FilterSubmenu>
      </div>
    </div>
  );
}
