"use client";

import { ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { MunicipalityRef } from "@/lib/types/poi";
import { uniqueRegions } from "@/lib/api/reference";

export type BeachFilterState = {
  name: string;
  regionId: string;
  municipalityId: string;
  sort: string;
  sortDirection: "ASC" | "DESC";
  hasLifeguard: boolean;
  hasShower: boolean;
  beachSurface: string;
  hasSunbeds: boolean;
  hasShopNearby: boolean;
  hasRestaurantNearby: boolean;
  dogFriendly: boolean;
  hasWebcam: boolean;
};

type BeachFiltersProps = {
  municipalities: MunicipalityRef[];
  beachNames: string[];
  value: BeachFilterState;
  radiusKm: number;
  onChange: (next: BeachFilterState) => void;
  onRadiusChange: (radiusKm: number) => void;
  onApply: () => void;
  onReset: () => void;
};

const inputClass =
  "w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-ocean-deep outline-none focus-visible:ring-2 focus-visible:ring-ring";

const selectClass = `${inputClass} appearance-none pr-10`;
const suggestionsClass =
  "absolute left-0 top-[calc(100%+0.35rem)] z-30 max-h-56 w-full overflow-y-auto rounded-2xl border border-ocean-cyan/50 bg-white p-1.5 text-sm text-ocean-deep shadow-[0_18px_40px_-20px_rgba(26,46,53,0.35)]";

function optionLabel(value: string): string {
  return value ? value.charAt(0).toLocaleUpperCase() + value.slice(1) : value;
}

export function BeachFilters({
  municipalities,
  beachNames,
  value,
  radiusKm,
  onChange,
  onRadiusChange,
  onApply,
  onReset,
}: BeachFiltersProps) {
  const t = useTranslations("beaches");
  const regionInputRef = useRef<HTMLInputElement>(null);
  const municipalityInputRef = useRef<HTMLInputElement>(null);
  const regions = uniqueRegions(municipalities);
  const selectedRegion = regions.find((region) => String(region.id) === value.regionId);
  const filteredMunicipalities = value.regionId
    ? municipalities.filter(
        (m) => String(m.regionDirectionId) === value.regionId,
      )
    : municipalities;
  const selectedMunicipality = filteredMunicipalities.find(
    (municipality) => String(municipality.id) === value.municipalityId,
  );
  const [regionQuery, setRegionQuery] = useState(selectedRegion?.name ?? "");
  const [municipalityQuery, setMunicipalityQuery] = useState(
    selectedMunicipality?.name ?? "",
  );
  const [draftRadiusKm, setDraftRadiusKm] = useState(radiusKm);
  const [openNameSuggestions, setOpenNameSuggestions] = useState(false);
  const [openRegionSuggestions, setOpenRegionSuggestions] = useState(false);
  const [openMunicipalitySuggestions, setOpenMunicipalitySuggestions] =
    useState(false);
  const visibleBeachNames = useMemo(
    () =>
      value.name.length >= 1
        ? beachNames
            .filter((name) => name.toLocaleLowerCase().includes(value.name.toLocaleLowerCase()))
        : [],
    [beachNames, value.name],
  );
  const visibleRegions = useMemo(
    () =>
      regions.filter((region) =>
        region.name.toLocaleLowerCase().includes(regionQuery.toLocaleLowerCase()),
      ),
    [regionQuery, regions],
  );
  const visibleMunicipalities = useMemo(
    () =>
      filteredMunicipalities.filter((municipality) =>
        municipality.name
          .toLocaleLowerCase()
          .includes(municipalityQuery.toLocaleLowerCase()),
      ),
    [filteredMunicipalities, municipalityQuery],
  );

  useEffect(() => {
    queueMicrotask(() => {
      setRegionQuery(selectedRegion?.name ?? "");
      setMunicipalityQuery(selectedMunicipality?.name ?? "");
    });
  }, [selectedMunicipality?.name, selectedRegion?.name]);

  useEffect(() => {
    queueMicrotask(() => setDraftRadiusKm(radiusKm));
  }, [radiusKm]);

  const commitRadius = () => {
    onRadiusChange(draftRadiusKm);
  };

  return (
    <form
      className="max-w-md rounded-3xl border border-border bg-white/90 p-5 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        // Parent runs POST /api/pois/search with current filter state.
        onApply();
      }}
    >
      <div className="grid gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="sr-only">{t("searchName")}</span>
          <div className="relative">
            <input
              type="search"
              className={inputClass}
              placeholder={t("searchBeachName")}
              value={value.name}
              onBlur={() => setOpenNameSuggestions(false)}
              onChange={(e) => {
                onChange({ ...value, name: e.target.value });
                setOpenNameSuggestions(true);
              }}
              onFocus={() => setOpenNameSuggestions(true)}
            />
            {openNameSuggestions && visibleBeachNames.length > 0 && (
              <ul className={suggestionsClass}>
                {visibleBeachNames.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-ocean-foam focus-visible:bg-ocean-foam focus-visible:outline-none"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onChange({ ...value, name });
                        setOpenNameSuggestions(false);
                      }}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="sr-only">{t("region")}</span>
          <div className="relative">
            <input
              ref={regionInputRef}
              type="text"
              className={`${inputClass} pr-16 ${regionQuery ? "" : "placeholder:text-muted-foreground"}`}
              placeholder={t("chooseRegion")}
              value={regionQuery}
              onBlur={() => setOpenRegionSuggestions(false)}
              onChange={(e) => {
                const next = e.target.value;
                const region = regions.find((r) => r.name === next);
                setRegionQuery(next);
                setOpenRegionSuggestions(true);
                setMunicipalityQuery("");
                onChange({
                  ...value,
                  regionId: region ? String(region.id) : "",
                  municipalityId: "",
                });
              }}
              onFocus={() => setOpenRegionSuggestions(true)}
            />
            {regionQuery && (
              <button
                type="button"
                className="absolute right-9 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ocean-teal hover:bg-ocean-foam"
                aria-label={t("resetFilters")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setRegionQuery("");
                  setMunicipalityQuery("");
                  setOpenRegionSuggestions(false);
                  onChange({
                    ...value,
                    regionId: "",
                    municipalityId: "",
                  });
                }}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
            <button
              type="button"
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ocean-teal hover:bg-ocean-foam"
              aria-label={t("chooseRegion")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setRegionQuery("");
                setOpenRegionSuggestions(true);
                regionInputRef.current?.focus();
              }}
            >
              <ChevronDown className="size-4" aria-hidden />
            </button>
            {openRegionSuggestions && visibleRegions.length > 0 && (
              <ul className={suggestionsClass}>
                {visibleRegions.map((region) => (
                  <li key={region.id}>
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-ocean-foam focus-visible:bg-ocean-foam focus-visible:outline-none"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setRegionQuery(region.name);
                        setMunicipalityQuery("");
                        setOpenRegionSuggestions(false);
                        onChange({
                          ...value,
                          regionId: String(region.id),
                          municipalityId: "",
                        });
                      }}
                    >
                      {region.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="sr-only">{t("municipality")}</span>
          <div className="relative">
            <input
              ref={municipalityInputRef}
              type="text"
              className={`${inputClass} pr-16 ${municipalityQuery ? "" : "placeholder:text-muted-foreground"}`}
              placeholder={t("chooseMunicipality")}
              value={municipalityQuery}
              onBlur={() => setOpenMunicipalitySuggestions(false)}
              onChange={(e) => {
                const next = e.target.value;
                const municipality = filteredMunicipalities.find((m) => m.name === next);
                setMunicipalityQuery(next);
                setOpenMunicipalitySuggestions(true);
                onChange({
                  ...value,
                  municipalityId: municipality ? String(municipality.id) : "",
                });
              }}
              onFocus={() => setOpenMunicipalitySuggestions(true)}
            />
            {municipalityQuery && (
              <button
                type="button"
                className="absolute right-9 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ocean-teal hover:bg-ocean-foam"
                aria-label={t("resetFilters")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setMunicipalityQuery("");
                  setOpenMunicipalitySuggestions(false);
                  onChange({
                    ...value,
                    municipalityId: "",
                  });
                }}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
            <button
              type="button"
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-ocean-teal hover:bg-ocean-foam"
              aria-label={t("chooseMunicipality")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setMunicipalityQuery("");
                setOpenMunicipalitySuggestions(true);
                municipalityInputRef.current?.focus();
              }}
            >
              <ChevronDown className="size-4" aria-hidden />
            </button>
            {openMunicipalitySuggestions && visibleMunicipalities.length > 0 && (
              <ul className={suggestionsClass}>
                {visibleMunicipalities.map((municipality) => (
                  <li key={municipality.id}>
                    <button
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-ocean-foam focus-visible:bg-ocean-foam focus-visible:outline-none"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setMunicipalityQuery(municipality.name);
                        setOpenMunicipalitySuggestions(false);
                        onChange({
                          ...value,
                          municipalityId: String(municipality.id),
                        });
                      }}
                    >
                      {municipality.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </label>

        <div className="mx-auto w-fit max-w-full rounded-3xl border border-ocean-cyan/40 bg-ocean-foam/40 p-4">
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm text-ocean-deep">
              <input
                type="checkbox"
                checked={value.hasLifeguard}
                onChange={(e) =>
                  onChange({ ...value, hasLifeguard: e.target.checked })
                }
                className="size-4 rounded border-border accent-ocean-teal"
              />
              {t("filterLifeguard")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-deep">
              <input
                type="checkbox"
                checked={value.hasShower}
                onChange={(e) =>
                  onChange({ ...value, hasShower: e.target.checked })
                }
                className="size-4 rounded border-border accent-ocean-teal"
              />
              {t("filterShower")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-deep">
              <input
                type="checkbox"
                checked={value.hasSunbeds}
                onChange={(e) =>
                  onChange({ ...value, hasSunbeds: e.target.checked })
                }
                className="size-4 rounded border-border accent-ocean-teal"
              />
              {t("filterSunbeds")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-deep">
              <input
                type="checkbox"
                checked={value.hasShopNearby}
                onChange={(e) =>
                  onChange({ ...value, hasShopNearby: e.target.checked })
                }
                className="size-4 rounded border-border accent-ocean-teal"
              />
              {t("filterShopNearby")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-deep">
              <input
                type="checkbox"
                checked={value.hasRestaurantNearby}
                onChange={(e) =>
                  onChange({
                    ...value,
                    hasRestaurantNearby: e.target.checked,
                  })
                }
                className="size-4 rounded border-border accent-ocean-teal"
              />
              {t("filterRestaurantNearby")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-deep">
              <input
                type="checkbox"
                checked={value.dogFriendly}
                onChange={(e) =>
                  onChange({ ...value, dogFriendly: e.target.checked })
                }
                className="size-4 rounded border-border accent-ocean-teal"
              />
              {t("filterDogFriendly")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ocean-deep">
              <input
                type="checkbox"
                checked={value.hasWebcam}
                onChange={(e) =>
                  onChange({ ...value, hasWebcam: e.target.checked })
                }
                className="size-4 rounded border-border accent-ocean-teal"
              />
              {t("filterWebcam")}
            </label>
            <label className="mt-2 min-w-56 text-sm text-ocean-deep">
              <div className="relative">
                <select
                  className={`${selectClass} font-medium ${value.beachSurface ? "text-ocean-deep" : "text-muted-foreground"}`}
                  value={value.beachSurface}
                  onChange={(e) =>
                    onChange({ ...value, beachSurface: e.target.value })
                  }
                >
                  <option value="">{t("filterSurface")}</option>
                  <option value="LIGHT_SAND">
                    {optionLabel(t("surfaceLightSand"))}
                  </option>
                  <option value="VOLCANIC_SAND">
                    {optionLabel(t("surfaceVolcanicSand"))}
                  </option>
                  <option value="STONES">{optionLabel(t("surfaceStones"))}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ocean-teal" aria-hidden />
              </div>
            </label>
            <label className="mt-2 grid gap-2 text-sm text-ocean-deep">
              <span className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
                {t("distance")}
                <span className="text-ocean-teal">
                  {draftRadiusKm > 0
                    ? t("nearMeRadiusValue", { radius: draftRadiusKm })
                    : t("nearMeRadiusUnlimited")}
                </span>
              </span>
              <input
                type="range"
                min={5}
                max={105}
                step={5}
                value={draftRadiusKm > 0 ? draftRadiusKm : 105}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setDraftRadiusKm(next >= 105 ? 0 : next);
                }}
                onPointerUp={commitRadius}
                onKeyUp={commitRadius}
                className="w-full accent-ocean-teal"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button type="submit" className="rounded-full px-6">
          {t("applyFilters")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={onReset}
        >
          {t("resetFilters")}
        </Button>
      </div>
    </form>
  );
}
