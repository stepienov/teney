"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BeachCard } from "@/components/beaches/beach-card";
import {
  BeachFilters,
  type BeachFilterState,
} from "@/components/beaches/beach-filters";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useRouter } from "@/i18n/routing";
import { distanceKm as calculateDistanceKm } from "@/lib/geo/distance";
import {
  DEFAULT_NEAR_ME_RADIUS_KM,
  type BeachPageWithDistances,
} from "@/lib/api/poi-search";
import {
  beachFiltersQueryOptions,
  beachSearchQueryOptions,
  type BeachSearchParams,
} from "@/lib/query/beaches";

const DEFAULT_FILTERS: BeachFilterState = {
  name: "",
  regionId: "",
  municipalityId: "",
  sort: "name",
  sortDirection: "ASC",
  hasLifeguard: false,
  hasShower: false,
  beachSurface: "",
  hasSunbeds: false,
  hasShopNearby: false,
  hasRestaurantNearby: false,
  dogFriendly: false,
  hasWebcam: false,
};

type AppliedBeachFilters = BeachFilterState & {
  page: number;
  nearMe: boolean;
  radiusKm: number;
};

function parseRadiusKm(value: string | null): number {
  if (value == null || value === "all") {
    return DEFAULT_NEAR_ME_RADIUS_KM;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_NEAR_ME_RADIUS_KM;
  }

  if (parsed <= 0) {
    return DEFAULT_NEAR_ME_RADIUS_KM;
  }

  return Math.min(100, Math.max(5, Math.round(parsed / 5) * 5));
}

function parseFiltersFromParams(params: URLSearchParams): AppliedBeachFilters {
  return {
    name: params.get("q") ?? "",
    regionId: params.get("region") ?? "",
    municipalityId: params.get("municipality") ?? "",
    sort: params.get("sort") ?? "name",
    sortDirection: (params.get("dir") === "DESC" ? "DESC" : "ASC") as
      | "ASC"
      | "DESC",
    hasLifeguard: params.get("lifeguard") === "1",
    hasShower: params.get("shower") === "1",
    beachSurface: params.get("surface") ?? "",
    hasSunbeds: params.get("sunbeds") === "1",
    hasShopNearby: params.get("shop") === "1",
    hasRestaurantNearby: params.get("restaurant") === "1",
    dogFriendly: params.get("dogs") === "1",
    hasWebcam: params.get("webcam") === "1",
    page: Math.max(0, Number(params.get("page") ?? "0") || 0),
    nearMe: params.get("near") === "1",
    radiusKm: parseRadiusKm(params.get("radius")),
  };
}

function getDraftFilters(applied: AppliedBeachFilters): BeachFilterState {
  return {
    name: applied.name,
    regionId: applied.regionId,
    municipalityId: applied.municipalityId,
    sort: applied.sort,
    sortDirection: applied.sortDirection,
    hasLifeguard: applied.hasLifeguard,
    hasShower: applied.hasShower,
    beachSurface: applied.beachSurface,
    hasSunbeds: applied.hasSunbeds,
    hasShopNearby: applied.hasShopNearby,
    hasRestaurantNearby: applied.hasRestaurantNearby,
    dogFriendly: applied.dogFriendly,
    hasWebcam: applied.hasWebcam,
  };
}

function hasVisibleFilters(applied: AppliedBeachFilters): boolean {
  return Boolean(
    applied.name ||
      applied.regionId ||
      applied.municipalityId ||
      applied.hasLifeguard ||
      applied.hasShower ||
      applied.beachSurface ||
      applied.hasSunbeds ||
      applied.hasShopNearby ||
      applied.hasRestaurantNearby ||
      applied.dogFriendly ||
      applied.hasWebcam ||
      applied.radiusKm > 0,
  );
}

function filtersToSearchParams(
  filters: BeachFilterState,
  page: number,
  nearMe: boolean,
  radiusKm: number,
): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.name.trim()) p.set("q", filters.name.trim());
  if (filters.regionId) p.set("region", filters.regionId);
  if (filters.municipalityId) p.set("municipality", filters.municipalityId);
  if (filters.sort !== "name") p.set("sort", filters.sort);
  if (filters.sortDirection !== "ASC") p.set("dir", filters.sortDirection);
  if (filters.hasLifeguard) p.set("lifeguard", "1");
  if (filters.hasShower) p.set("shower", "1");
  if (filters.beachSurface) p.set("surface", filters.beachSurface);
  if (filters.hasSunbeds) p.set("sunbeds", "1");
  if (filters.hasShopNearby) p.set("shop", "1");
  if (filters.hasRestaurantNearby) p.set("restaurant", "1");
  if (filters.dogFriendly) p.set("dogs", "1");
  if (filters.hasWebcam) p.set("webcam", "1");
  if (page > 0) p.set("page", String(page));
  if (nearMe) {
    p.set("near", "1");
    if (radiusKm > 0 && radiusKm !== DEFAULT_NEAR_ME_RADIUS_KM) {
      p.set("radius", String(radiusKm));
    }
  }
  return p;
}

function toSearchParams(
  filters: BeachFilterState,
  page: number,
  locale: string,
  nearMe: boolean,
  radiusKm: number,
): BeachSearchParams {
  return {
    locale,
    page,
    sort: filters.sort,
    sortDirection: filters.sortDirection,
    nearMe,
    radiusKm,
    name: filters.name.trim() || undefined,
    regionId: filters.regionId ? Number(filters.regionId) : undefined,
    municipalityId: filters.municipalityId
      ? Number(filters.municipalityId)
      : undefined,
    hasLifeguard: filters.hasLifeguard || undefined,
    hasShower: filters.hasShower || undefined,
    beachSurface: filters.beachSurface || undefined,
    hasSunbeds: filters.hasSunbeds || undefined,
    hasShopNearby: filters.hasShopNearby || undefined,
    hasRestaurantNearby: filters.hasRestaurantNearby || undefined,
    dogFriendly: filters.dogFriendly || undefined,
    hasWebcam: filters.hasWebcam || undefined,
  };
}

function isBeachPageWithDistances(
  page: unknown,
): page is BeachPageWithDistances {
  return (
    page != null &&
    typeof page === "object" &&
    "distancesKm" in page &&
    page.distancesKm instanceof Map
  );
}

function BeachSortControls({
  value,
  nearMe,
  locationPending,
  onSortChange,
  onDirectionToggle,
}: {
  value: BeachFilterState;
  nearMe: boolean;
  locationPending: boolean;
  onSortChange: (sort: string) => void;
  onDirectionToggle: () => void;
}) {
  const t = useTranslations("beaches");
  const DirectionIcon = value.sortDirection === "ASC" ? ArrowDownAZ : ArrowUpAZ;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-ocean-teal">
        {t("sortBy")}
      </span>
      <label className="relative">
        <span className="sr-only">{t("sortBy")}</span>
        <select
          className="appearance-none rounded-full border border-ocean-cyan/70 bg-white px-3 py-2 pr-9 text-sm font-medium text-ocean-deep shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={nearMe ? "location" : value.sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          <option value="location">
            {locationPending ? t("nearMeLocating") : t("sortLocation")}
          </option>
          <option value="name">{t("sortName")}</option>
          <option value="municipality.name">{t("sortMunicipality")}</option>
          <option value="region.name">{t("sortRegion")}</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ocean-teal" aria-hidden />
      </label>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full border-ocean-cyan/70 bg-white text-ocean-deep shadow-sm"
        title={value.sortDirection === "ASC" ? t("directionAsc") : t("directionDesc")}
        aria-label={
          value.sortDirection === "ASC" ? t("directionAsc") : t("directionDesc")
        }
        onClick={onDirectionToggle}
      >
        <DirectionIcon className="size-4" aria-hidden />
      </Button>
    </div>
  );
}

export function BeachesExplorer() {
  const urlParams = useSearchParams();
  const applied = useMemo(
    () => parseFiltersFromParams(urlParams),
    [urlParams],
  );

  return <BeachesExplorerContent applied={applied} />;
}

function BeachesExplorerContent({
  applied,
}: {
  applied: AppliedBeachFilters;
}) {
  const t = useTranslations("beaches");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [draft, setDraft] = useState<BeachFilterState>(() => {
    return getDraftFilters(applied);
  });
  const [filtersOpen, setFiltersOpen] = useState(() => hasVisibleFilters(applied));
  const locationSortDismissedRef = useRef(false);

  const geo = useGeolocation({ enabled: true });
  const userCoords = geo.status === "ready" ? geo.coords : undefined;

  const { data: filterData, isLoading: filtersLoading } = useQuery(
    beachFiltersQueryOptions(),
  );

  const searchParams = useMemo(
    () =>
      toSearchParams(
        applied,
        applied.page,
        locale,
        applied.nearMe,
        applied.radiusKm,
      ),
    [applied, locale],
  );

  const {
    data: page,
    isPending,
    isError,
    isFetching,
  } = useQuery(
    beachSearchQueryOptions(
      searchParams,
      filterData?.beachPointTypeId,
      userCoords,
    ),
  );

  const distancesKm = isBeachPageWithDistances(page)
    ? page.distancesKm
    : undefined;

  const pushFilters = useCallback(
    (
      filters: BeachFilterState,
      pageIndex: number,
      nearMe: boolean,
      radiusKm: number,
    ) => {
      const qs = filtersToSearchParams(
        filters,
        pageIndex,
        nearMe,
        radiusKm,
      ).toString();
      router.push(qs ? `/beaches?${qs}` : "/beaches");
    },
    [router],
  );

  const changeSort = useCallback(
    (sort: string) => {
      if (sort === "location") {
        locationSortDismissedRef.current = false;
        pushFilters(getDraftFilters(applied), 0, true, applied.radiusKm);
        return;
      }

      const next = {
        ...getDraftFilters(applied),
        sort,
      };
      locationSortDismissedRef.current = true;
      setDraft(next);
      pushFilters(next, 0, false, applied.radiusKm);
    },
    [applied, pushFilters],
  );

  const toggleSortDirection = useCallback(() => {
    const next = {
      ...getDraftFilters(applied),
      sortDirection: applied.sortDirection === "ASC" ? "DESC" : "ASC",
    } satisfies BeachFilterState;
    locationSortDismissedRef.current = !applied.nearMe;
    setDraft(next);
    pushFilters(next, 0, applied.nearMe, applied.radiusKm);
  }, [applied, pushFilters]);

  useEffect(() => {
    if (
      geo.status !== "ready" ||
      applied.nearMe ||
      locationSortDismissedRef.current
    ) {
      return;
    }

    pushFilters(getDraftFilters(applied), 0, true, applied.radiusKm);
  }, [applied, geo.status, pushFilters]);

  useEffect(() => {
    if (
      !applied.nearMe ||
      (geo.status !== "denied" &&
        geo.status !== "unsupported" &&
        geo.status !== "error")
    ) {
      return;
    }

    locationSortDismissedRef.current = true;
    pushFilters(getDraftFilters(applied), 0, false, applied.radiusKm);
  }, [applied, geo.status, pushFilters]);

  /** Apply → POST /api/pois/search (filters/sort/page from draft; near-me uses temp FE distance sort). */
  const applyFilters = useCallback(async () => {
    const nearMe = applied.nearMe;
    if (filterData?.beachPointTypeId == null) {
      pushFilters(draft, 0, nearMe, applied.radiusKm);
      return;
    }
    if (nearMe && geo.status !== "ready") {
      pushFilters(draft, 0, nearMe, applied.radiusKm);
      return;
    }
    const params = toSearchParams(draft, 0, locale, nearMe, applied.radiusKm);
    const coords = nearMe && geo.status === "ready" ? geo.coords : undefined;
    await queryClient.fetchQuery(
      beachSearchQueryOptions(
        params,
        filterData.beachPointTypeId,
        coords,
      ),
    );
    pushFilters(draft, 0, nearMe, applied.radiusKm);
  }, [
    applied.nearMe,
    applied.radiusKm,
    draft,
    filterData,
    geo,
    locale,
    pushFilters,
    queryClient,
  ]);

  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_18%_8%,rgba(255,244,214,0.95),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(160,231,229,0.65),transparent_30%),linear-gradient(180deg,#fff8e8_0%,#f7fbf7_34%,#dff6f4_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-6rem] top-36 h-96 w-96 rounded-full bg-ocean-cyan/35 blur-3xl"
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 w-full text-white/45"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 92c120-24 240-48 360-36s240 58 360 44 240-70 360-58 240 76 360 62v56H0V92z"
          fill="currentColor"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-[0.16em] text-ocean-deep sm:text-4xl">
          {t("title")}
        </h1>
        <Button
          type="button"
          className="mt-5 gap-2 rounded-full bg-white/85 px-5 text-ocean-deep shadow-[0_14px_35px_-22px_rgba(26,46,53,0.45)] ring-1 ring-ocean-cyan/50 backdrop-blur hover:bg-white"
          variant="outline"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal className="size-4 text-ocean-teal" aria-hidden />
          {filtersOpen ? t("hideFilters") : t("filterToggle")}
          <ChevronDown
            className={`size-4 text-ocean-teal transition-transform ${
              filtersOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </Button>
      </header>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
          filtersOpen
            ? "mt-6 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`max-w-md rounded-[2rem] border border-white/70 bg-white/35 p-3 shadow-[0_22px_70px_-45px_rgba(26,46,53,0.4)] backdrop-blur-md transition-transform duration-300 ease-out ${
              filtersOpen ? "translate-y-0" : "-translate-y-3"
            }`}
          >
            {filtersLoading ? (
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            ) : filterData ? (
              <BeachFilters
                municipalities={filterData.municipalities}
                beachNames={filterData.beachNames}
                value={draft}
                radiusKm={applied.radiusKm}
                onChange={setDraft}
                onRadiusChange={(radiusKm) => {
                  pushFilters(getDraftFilters(applied), 0, applied.nearMe, radiusKm);
                }}
                onApply={() => void applyFilters()}
                onReset={() => {
                  setDraft(DEFAULT_FILTERS);
                  locationSortDismissedRef.current = true;
                  pushFilters(DEFAULT_FILTERS, 0, false, applied.radiusKm);
                }}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {page != null
            ? t("total", { count: page.totalElements })
            : applied.nearMe && geo.status === "loading"
              ? t("nearMeLocating")
              : isFetching
                ? t("loading")
                : null}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <BeachSortControls
            value={applied}
            nearMe={applied.nearMe}
            locationPending={applied.nearMe && geo.status === "loading"}
            onSortChange={changeSort}
            onDirectionToggle={toggleSortDirection}
          />
          {page != null && page.totalPages > 0 && (
            <p className="text-sm font-medium text-ocean-deep">
              {t("page", {
                current: page.number + 1,
                total: page.totalPages,
              })}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        {isPending || (applied.nearMe && geo.status === "loading") ? (
          <p className="text-center text-muted-foreground">{t("loading")}</p>
        ) : isError ? (
          <p className="text-center text-destructive">{t("error")}</p>
        ) : page?.empty ? (
          <p className="rounded-3xl border border-dashed border-border bg-white/80 py-16 text-center text-muted-foreground">
            {applied.nearMe ? t("emptyNearMe") : t("empty")}
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page?.content.map((beach) => (
              <li key={beach.id} className="h-full">
                <BeachCard
                  beach={beach}
                  distanceKm={
                    distancesKm?.get(beach.id) ??
                    (userCoords ? calculateDistanceKm(userCoords, beach.coordinates) : undefined) ??
                    undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {page != null && page.totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-3"
          aria-label="Pagination"
        >
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={page.first}
            onClick={() => {
              pushFilters(
                getDraftFilters(applied),
                applied.page - 1,
                applied.nearMe,
                applied.radiusKm,
              );
            }}
          >
            {t("prev")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={page.last}
            onClick={() => {
              pushFilters(
                getDraftFilters(applied),
                applied.page + 1,
                applied.nearMe,
                applied.radiusKm,
              );
            }}
          >
            {t("next")}
          </Button>
        </nav>
      )}
      </div>
    </section>
  );
}
