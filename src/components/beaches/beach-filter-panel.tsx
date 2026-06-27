"use client";

import { useTranslations } from "next-intl";
import {
  BEACH_SURFACE_OPTIONS,
  hasWeatherFilters,
  toggleFilterId,
  type BeachFilterState,
} from "@/components/beaches/beach-filter-state";
import {
  FilterMobileExpandable,
  FilterSubmenu,
  FilterSwitchRow,
} from "@/components/beaches/filter-menu";
import { usePoiCategoryConfig } from "@/components/poi-explorer/poi-category-context";
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
  const { messagesNamespace, features } = usePoiCategoryConfig();
  const t = useTranslations(messagesNamespace);
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

  const weatherRows = (
    <>
      <FilterSwitchRow
        checked={value.dryToday}
        label={t("filterDryToday")}
        onChange={(checked) => patch({ dryToday: checked })}
        variant={variant}
      />
      <FilterSwitchRow
        checked={value.lightWind}
        label={t("filterLightWind")}
        onChange={(checked) => patch({ lightWind: checked })}
        variant={variant}
      />
      <FilterSwitchRow
        checked={value.clearSky}
        label={t("filterClearSky")}
        onChange={(checked) => patch({ clearSky: checked })}
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
        {features.beachAttributes ? attributeRows : null}
        {features.weather ? (
          <FilterMobileExpandable
            label={t("filterWeatherToday")}
            hasActive={hasWeatherFilters(value)}
          >
            {weatherRows}
          </FilterMobileExpandable>
        ) : null}
        {features.beachAttributes ? (
          <FilterMobileExpandable
            label={t("filterSurface")}
            hasActive={value.beachSurfaces.length > 0}
          >
            {surfaceRows}
          </FilterMobileExpandable>
        ) : null}
        <FilterMobileExpandable
          label={t("filterRegionMenu")}
          hasActive={value.regionIds.length > 0}
        >
          {regionRows}
        </FilterMobileExpandable>
      </div>
    );
  }

  return (
    <div className="py-1.5">
      {features.beachAttributes ? (
        <div className="space-y-0.5 px-1.5">{attributeRows}</div>
      ) : null}

      {features.beachAttributes ? (
        <div className="mx-2.5 my-1 border-t border-border" role="separator" />
      ) : null}

      <div className="space-y-0.5 px-1.5 pb-0.5">
        {features.weather ? (
          <FilterSubmenu
            label={t("filterWeatherToday")}
            hasActive={hasWeatherFilters(value)}
            clearLabel={t("clearWeather")}
            onClear={() => patch({ dryToday: false, lightWind: false, clearSky: false })}
          >
            {weatherRows}
          </FilterSubmenu>
        ) : null}

        {features.beachAttributes ? (
          <FilterSubmenu
            label={t("filterSurface")}
            hasActive={value.beachSurfaces.length > 0}
            clearLabel={t("clearSurface")}
            onClear={() => patch({ beachSurfaces: [] })}
          >
            {surfaceRows}
          </FilterSubmenu>
        ) : null}

        <FilterSubmenu
          label={t("filterRegionMenu")}
          hasActive={value.regionIds.length > 0}
          clearLabel={t("clearRegions")}
          onClear={() => patch({ regionIds: [] })}
        >
          {regionRows}
        </FilterSubmenu>
      </div>
    </div>
  );
}
