"use client";

import { useTranslations } from "next-intl";

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
  isSandy: boolean;
};

type BeachFiltersProps = {
  municipalities: MunicipalityRef[];
  value: BeachFilterState;
  nearMe?: boolean;
  onChange: (next: BeachFilterState) => void;
  onApply: () => void;
  onReset: () => void;
};

const inputClass =
  "w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-ocean-deep outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function BeachFilters({
  municipalities,
  value,
  nearMe = false,
  onChange,
  onApply,
  onReset,
}: BeachFiltersProps) {
  const t = useTranslations("beaches");
  const regions = uniqueRegions(municipalities);
  const filteredMunicipalities = value.regionId
    ? municipalities.filter(
        (m) => String(m.regionDirectionId) === value.regionId,
      )
    : municipalities;

  return (
    <form
      className="rounded-3xl border border-border bg-white/90 p-5 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        // Parent runs POST /api/pois/search with current filter state.
        onApply();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
            {t("searchName")}
          </span>
          <input
            type="search"
            className={inputClass}
            placeholder={t("searchPlaceholder")}
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
            {t("region")}
          </span>
          <select
            className={inputClass}
            value={value.regionId}
            onChange={(e) =>
              onChange({
                ...value,
                regionId: e.target.value,
                municipalityId: "",
              })
            }
          >
            <option value="">{t("allRegions")}</option>
            {regions.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
            {t("municipality")}
          </span>
          <select
            className={inputClass}
            value={value.municipalityId}
            onChange={(e) =>
              onChange({ ...value, municipalityId: e.target.value })
            }
          >
            <option value="">{t("allMunicipalities")}</option>
            {filteredMunicipalities.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        {nearMe ? (
          <p className="flex items-end text-sm text-muted-foreground sm:col-span-2">
            {t("sortDisabledNearMe")}
          </p>
        ) : (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                {t("sortBy")}
              </span>
              <select
                className={inputClass}
                value={value.sort}
                onChange={(e) => onChange({ ...value, sort: e.target.value })}
              >
                <option value="name">{t("sortName")}</option>
                <option value="municipality.name">
                  {t("sortMunicipality")}
                </option>
                <option value="region.name">{t("sortRegion")}</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
                &nbsp;
              </span>
              <select
                className={inputClass}
                value={value.sortDirection}
                onChange={(e) =>
                  onChange({
                    ...value,
                    sortDirection: e.target.value as "ASC" | "DESC",
                  })
                }
              >
                <option value="ASC">{t("directionAsc")}</option>
                <option value="DESC">{t("directionDesc")}</option>
              </select>
            </label>
          </>
        )}

        <fieldset className="flex flex-wrap gap-4 sm:col-span-2 lg:col-span-3">
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
              checked={value.isSandy}
              onChange={(e) =>
                onChange({ ...value, isSandy: e.target.checked })
              }
              className="size-4 rounded border-border accent-ocean-teal"
            />
            {t("filterSandy")}
          </label>
        </fieldset>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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
