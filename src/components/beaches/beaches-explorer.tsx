"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { BeachFilterBar } from "@/components/beaches/beach-filter-bar";
import {
  EMPTY_BEACH_FILTERS,
  type BeachFilterState,
} from "@/components/beaches/beach-filter-state";
import { BeachCard } from "@/components/beaches/beach-card";
import { BeachResultsTable } from "@/components/beaches/beach-results-table";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLocalStorageChoice } from "@/hooks/use-local-storage-flag";
import { useRouter } from "@/i18n/routing";
import { resolveGeoFilterNames } from "@/lib/beach-geo-filter";
import { DEFAULT_NEAR_ME_RADIUS_KM } from "@/lib/api/poi-search";
import {
  getDistancesKmFromPage,
  resolveBeachDistanceKm,
} from "@/lib/beach-distance";
import {
  beachFiltersQueryOptions,
  beachSearchQueryOptions,
  type BeachSearchParams,
} from "@/lib/query/beaches";

const VIEW_STORAGE_KEY = "teney-beach-view";

type AppliedBeachFilters = BeachFilterState & {
  page: number;
  nearMe: boolean;
  radiusKm: number;
};

function parseIdList(value: string | null, legacySingle: string | null): string[] {
  if (value?.trim()) {
    return value.split(",").map((part) => part.trim()).filter(Boolean);
  }
  if (legacySingle?.trim()) {
    return [legacySingle.trim()];
  }
  return [];
}

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

function normalizeSortParam(sort: string | null): string {
  const value = sort ?? "name";
  return value === "municipality.name" ? "name" : value;
}

function parseFiltersFromParams(params: URLSearchParams): AppliedBeachFilters {
  return {
    name: params.get("q") ?? "",
    regionIds: parseIdList(params.get("regions"), params.get("region")),
    sort: normalizeSortParam(params.get("sort")),
    sortDirection: (params.get("dir") === "DESC" ? "DESC" : "ASC") as
      | "ASC"
      | "DESC",
    hasLifeguard: params.get("lifeguard") === "1",
    hasShower: params.get("shower") === "1",
    beachSurfaces: parseIdList(params.get("surfaces"), params.get("surface")),
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
    regionIds: applied.regionIds,
    sort: applied.sort,
    sortDirection: applied.sortDirection,
    hasLifeguard: applied.hasLifeguard,
    hasShower: applied.hasShower,
    beachSurfaces: applied.beachSurfaces,
    hasSunbeds: applied.hasSunbeds,
    hasShopNearby: applied.hasShopNearby,
    hasRestaurantNearby: applied.hasRestaurantNearby,
    dogFriendly: applied.dogFriendly,
    hasWebcam: applied.hasWebcam,
  };
}

function filtersToSearchParams(
  filters: BeachFilterState,
  page: number,
  nearMe: boolean,
  radiusKm: number,
): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.name.trim()) p.set("q", filters.name.trim());
  if (filters.regionIds.length) p.set("regions", filters.regionIds.join(","));
  if (filters.sort !== "name") p.set("sort", filters.sort);
  if (filters.sortDirection !== "ASC") p.set("dir", filters.sortDirection);
  if (filters.hasLifeguard) p.set("lifeguard", "1");
  if (filters.hasShower) p.set("shower", "1");
  if (filters.beachSurfaces.length) {
    p.set("surfaces", filters.beachSurfaces.join(","));
  }
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
  municipalities: { id: number; name: string; regionDirectionId: number; regionDirectionName: string }[],
): BeachSearchParams {
  const { regionNames } = resolveGeoFilterNames(
    municipalities,
    filters.regionIds,
    [],
  );

  return {
    locale,
    page,
    sort: filters.sort,
    sortDirection: filters.sortDirection,
    nearMe,
    radiusKm,
    name: filters.name.trim() || undefined,
    regionIds: filters.regionIds,
    regionNames,
    hasLifeguard: filters.hasLifeguard || undefined,
    hasShower: filters.hasShower || undefined,
    beachSurfaces:
      filters.beachSurfaces.length > 0 ? filters.beachSurfaces : undefined,
    hasSunbeds: filters.hasSunbeds || undefined,
    hasShopNearby: filters.hasShopNearby || undefined,
    hasRestaurantNearby: filters.hasRestaurantNearby || undefined,
    dogFriendly: filters.dogFriendly || undefined,
    hasWebcam: filters.hasWebcam || undefined,
  };
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

  const [viewMode, setViewMode] = useLocalStorageChoice(
    VIEW_STORAGE_KEY,
    ["grid", "list"] as const,
    "list",
  );
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
        filterData?.municipalities ?? [],
      ),
    [applied, locale, filterData?.municipalities],
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

  const distancesKm = getDistancesKmFromPage(page);

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

  const applyFilters = useCallback(
    async (filters: BeachFilterState) => {
      const nearMe = applied.nearMe;
      if (filterData?.beachPointTypeId == null) {
        pushFilters(filters, 0, nearMe, applied.radiusKm);
        return;
      }
      if (nearMe && geo.status !== "ready") {
        pushFilters(filters, 0, nearMe, applied.radiusKm);
        return;
      }
      const params = toSearchParams(
        filters,
        0,
        locale,
        nearMe,
        applied.radiusKm,
        filterData.municipalities,
      );
      const coords = nearMe && geo.status === "ready" ? geo.coords : undefined;
      await queryClient.fetchQuery(
        beachSearchQueryOptions(
          params,
          filterData.beachPointTypeId,
          coords,
        ),
      );
      pushFilters(filters, 0, nearMe, applied.radiusKm);
    },
    [
      applied.nearMe,
      applied.radiusKm,
      filterData,
      geo.status,
      locale,
      pushFilters,
      queryClient,
    ],
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

  return (
    <section className="px-4 py-6 sm:px-8 sm:py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("pageTitle")}
        </h1>
        <p className="w-full text-sm text-muted-foreground sm:w-auto sm:text-right">
          {page != null
            ? t("total", { count: page.totalElements })
            : applied.nearMe && geo.status === "loading"
              ? t("nearMeLocating")
              : isFetching
                ? t("loading")
                : null}
        </p>
      </header>

      {filtersLoading || !filterData ? (
        <div className="mb-4 h-9 animate-pulse rounded-md bg-muted/50" />
      ) : (
        <BeachFilterBar
          value={getDraftFilters(applied)}
          municipalities={filterData.municipalities}
          nearMe={applied.nearMe}
          locationPending={applied.nearMe && geo.status === "loading"}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onApply={(next) => void applyFilters(next)}
          onReset={() => {
            locationSortDismissedRef.current = true;
            pushFilters(EMPTY_BEACH_FILTERS, 0, false, applied.radiusKm);
          }}
          onSortChange={changeSort}
          onDirectionToggle={toggleSortDirection}
        />
      )}

      <div className="min-h-[12rem]">
        {isPending || (applied.nearMe && geo.status === "loading") ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("loading")}</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-destructive">{t("error")}</p>
        ) : page?.empty ? (
          <p className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            {applied.nearMe ? t("emptyNearMe") : t("empty")}
          </p>
        ) : viewMode === "list" ? (
            <BeachResultsTable
              beaches={page?.content ?? []}
              distancesKm={distancesKm}
              userCoords={userCoords}
              filterState={getDraftFilters(applied)}
              onFilterPatch={(next) => void applyFilters(next)}
            />
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {page?.content.map((beach) => (
              <li key={beach.id} className="aspect-square">
                <BeachCard
                  beach={beach}
                  distanceKm={resolveBeachDistanceKm(
                    beach,
                    distancesKm,
                    userCoords,
                  )}
                  filterState={getDraftFilters(applied)}
                  onFilterPatch={(next) => void applyFilters(next)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {page != null && page.totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6"
          aria-label="Pagination"
        >
          <p className="text-sm text-muted-foreground">
            {t("page", {
              current: page.number + 1,
              total: page.totalPages,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-md"
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
              variant="default"
              className="h-9 rounded-md"
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
          </div>
        </nav>
      )}
    </section>
  );
}
