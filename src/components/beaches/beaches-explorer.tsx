"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useSearchParams } from "next/navigation";

import dynamic from "next/dynamic";

import { BeachFilterBar } from "@/components/beaches/beach-filter-bar";
import {
  type BeachFilterState,
} from "@/components/beaches/beach-filter-state";
import { BeachCard } from "@/components/beaches/beach-card";
import { BeachLoadMoreSentinel } from "@/components/beaches/beach-load-more-sentinel";
import { BeachLoadingIndicator } from "@/components/beaches/beach-loading-indicator";
import { BeachPaginationBar } from "@/components/beaches/beach-pagination-bar";
import { BeachResultsTable } from "@/components/beaches/beach-results-table";
import { PoiCategoryProvider } from "@/components/poi-explorer/poi-category-context";
import { beachesExplorerConfig } from "@/lib/poi-categories/beaches";
import { useGeolocation, type GeolocationHandle } from "@/hooks/use-geolocation";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useLocalStorageChoice } from "@/hooks/use-local-storage-flag";
import { useNavigationRouter } from "@/components/providers/navigation-loading";
import { DEFAULT_NEAR_ME_RADIUS_KM } from "@/lib/api/poi-search";
import {
  getDistancesKmFromPage,
  mergeDistancesKmFromPages,
  resolveBeachDistanceKm,
} from "@/lib/beach-distance";
import {
  DEFAULT_BEACH_PAGE_SIZE,
  parseBeachPageSize,
  type BeachPageSize,
} from "@/lib/beach-pagination";
import { BEACH_VIEW_MODES } from "@/lib/beach-view-mode";
import type { PoiCategoryExplorerConfig, PoiSearchPage } from "@/lib/poi-categories/types";
import {
  isDescDefaultCatalogSort,
  normalizeCatalogSortParam,
} from "@/lib/poi-sort";
import type { MunicipalityRef, PoiDto } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

const BeachMapView = dynamic(
  () =>
    import("@/components/beaches/beach-map-view").then(
      (module) => module.BeachMapView,
    ),
  {
    ssr: false,
    loading: () => <BeachLoadingIndicator className="min-h-[280px]" />,
  },
);

function isGeoFailed(geo: GeolocationHandle): boolean {
  return (
    geo.status === "denied" ||
    geo.status === "unsupported" ||
    geo.status === "error" ||
    geo.permission === "denied"
  );
}

function isGeoPending(geo: GeolocationHandle): boolean {
  return geo.status === "idle" || geo.status === "loading";
}

type AppliedBeachFilters = BeachFilterState & {
  page: number;
  pageSize: BeachPageSize;
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

function parseFiltersFromParams(
  params: URLSearchParams,
  config: PoiCategoryExplorerConfig,
): AppliedBeachFilters {
  const sort = normalizeCatalogSortParam(params.get("sort"), config.defaultSort);
  const dirParam = params.get("dir");
  const defaultDesc = isDescDefaultCatalogSort(sort, config.features.weather);

  return {
    name: params.get("q") ?? "",
    regionIds: parseIdList(params.get("regions"), params.get("region")),
    sort,
    sortDirection: (
      dirParam === "DESC" || (dirParam == null && defaultDesc) ? "DESC" : "ASC"
    ) as "ASC" | "DESC",
    hasLifeguard: params.get("lifeguard") === "1",
    hasShower: params.get("shower") === "1",
    beachSurfaces: parseIdList(params.get("surfaces"), params.get("surface")),
    hasSunbeds: params.get("sunbeds") === "1",
    hasShopNearby: params.get("shop") === "1",
    hasRestaurantNearby: params.get("restaurant") === "1",
    dogFriendly: params.get("dogs") === "1",
    hasWebcam: params.get("webcam") === "1",
    dryToday: params.get("dry") === "1",
    lightWind: params.get("lwind") === "1",
    clearSky: params.get("csky") === "1",
    page: Math.max(0, Number(params.get("page") ?? "0") || 0),
    pageSize: parseBeachPageSize(params.get("size")),
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
    dryToday: applied.dryToday,
    lightWind: applied.lightWind,
    clearSky: applied.clearSky,
  };
}

function filtersToSearchParams(
  filters: BeachFilterState,
  page: number,
  nearMe: boolean,
  radiusKm: number,
  pageSize: number,
  defaultSort: string,
): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.name.trim()) p.set("q", filters.name.trim());
  if (filters.regionIds.length) p.set("regions", filters.regionIds.join(","));
  if (filters.sort !== defaultSort) p.set("sort", filters.sort);
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
  if (filters.dryToday) p.set("dry", "1");
  if (filters.lightWind) p.set("lwind", "1");
  if (filters.clearSky) p.set("csky", "1");
  if (page > 0) p.set("page", String(page));
  if (pageSize !== DEFAULT_BEACH_PAGE_SIZE) p.set("size", String(pageSize));
  if (nearMe) {
    p.set("near", "1");
    if (radiusKm > 0 && radiusKm !== DEFAULT_NEAR_ME_RADIUS_KM) {
      p.set("radius", String(radiusKm));
    }
  }
  return p;
}

export function PoiExplorer({ config }: { config: PoiCategoryExplorerConfig }) {
  return (
    <PoiCategoryProvider config={config}>
      <PoiExplorerRoutes config={config} />
    </PoiCategoryProvider>
  );
}

function PoiExplorerRoutes({ config }: { config: PoiCategoryExplorerConfig }) {
  const urlParams = useSearchParams();
  const applied = useMemo(
    () => parseFiltersFromParams(urlParams, config),
    [urlParams, config],
  );

  return <PoiExplorerContent config={config} applied={applied} />;
}

export function BeachesExplorer() {
  return <PoiExplorer config={beachesExplorerConfig} />;
}

function PoiExplorerContent({
  config,
  applied,
}: {
  config: PoiCategoryExplorerConfig;
  applied: AppliedBeachFilters;
}) {
  const t = useTranslations(config.messagesNamespace);
  const tCategories = useTranslations("poiCategories");
  const locale = useLocale();
  const router = useNavigationRouter();
  const isMobile = useIsMobile();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const wantsLocationSortRef = useRef(false);
  const geoBootstrappedRef = useRef(false);

  const [viewMode, setViewMode] = useLocalStorageChoice(
    config.viewStorageKey,
    BEACH_VIEW_MODES,
    "list",
  );

  const geo = useGeolocation({ enabled: false });
  const userCoords = geo.status === "ready" ? geo.coords : undefined;
  const locationSortActive = applied.nearMe && userCoords != null;

  const committedFilters = useMemo(
    () => getDraftFilters(applied),
    [applied],
  );

  const { data: filterData, isLoading: filtersLoading } = useQuery(
    config.filtersQueryOptions(),
  );

  const mapMode = viewMode === "map";

  const baseSearchParams = useMemo(
    () =>
      config.toSearchBaseParams(
        applied,
        locale,
        locationSortActive,
        applied.radiusKm,
      ),
    [applied, config, locale, locationSortActive],
  );

  const desktopSearchParams = useMemo(
    () => ({
      ...baseSearchParams,
      page: applied.page,
      pageSize: applied.pageSize,
    }),
    [baseSearchParams, applied.page, applied.pageSize],
  );

  const {
    data: page,
    isPending: desktopPending,
    isError: desktopError,
  } = useQuery({
    ...config.searchQueryOptions(desktopSearchParams, userCoords),
    enabled: hasMounted && !isMobile && !mapMode,
  });

  const {
    data: mapBeaches,
    isPending: mapPending,
    isError: mapError,
  } = useQuery({
    ...config.mapSearchQueryOptions(baseSearchParams, userCoords),
    enabled: hasMounted && mapMode,
  });

  const {
    data: infiniteData,
    isPending: mobilePending,
    isError: mobileError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...config.searchInfiniteQueryOptions(baseSearchParams, userCoords),
    enabled: hasMounted && isMobile && !mapMode,
  });

  const listBeaches = isMobile
    ? (infiniteData?.pages.flatMap((resultPage: PoiSearchPage) => resultPage.content) ?? [])
    : (page?.content ?? []);

  const beaches = mapMode ? (mapBeaches ?? []) : listBeaches;

  const totalPages = isMobile
    ? (infiniteData?.pages[0]?.totalPages ?? 0)
    : (page?.totalPages ?? 0);

  const distancesKm = isMobile
    ? mergeDistancesKmFromPages(infiniteData?.pages ?? [])
    : getDistancesKmFromPage(page);

  const isPending = mapMode
    ? mapPending
    : isMobile
      ? mobilePending
      : desktopPending;
  const isError = mapMode ? mapError : isMobile ? mobileError : desktopError;
  const isEmpty = mapMode
    ? mapBeaches != null && mapBeaches.length === 0
    : isMobile
      ? infiniteData != null && beaches.length === 0
      : Boolean(page?.empty);

  const pushFilters = useCallback(
    (
      filters: BeachFilterState,
      pageIndex: number,
      nearMe: boolean,
      radiusKm: number,
      pageSize: number = applied.pageSize,
    ) => {
      const qs = filtersToSearchParams(
        filters,
        pageIndex,
        nearMe,
        radiusKm,
        pageSize,
        config.defaultSort,
      ).toString();
      router.push(qs ? `${config.basePath}?${qs}` : config.basePath);
    },
    [applied.pageSize, config.basePath, config.defaultSort, router],
  );

  const applyFilters = useCallback(
    (filters: BeachFilterState) => {
      startTransition(() => {
        const nearMe = locationSortActive;
        pushFilters(filters, 0, nearMe, applied.radiusKm, applied.pageSize);
      });
    },
    [applied.pageSize, applied.radiusKm, locationSortActive, pushFilters],
  );

  const changeSort = useCallback(
    (sort: string) => {
      if (sort === "location") {
        if (userCoords != null) {
          wantsLocationSortRef.current = false;
          pushFilters(getDraftFilters(applied), 0, true, applied.radiusKm);
          return;
        }

        if (isGeoFailed(geo)) {
          wantsLocationSortRef.current = false;
          return;
        }

        wantsLocationSortRef.current = true;
        if (geo.status !== "loading") {
          geo.request();
        }
        return;
      }

      wantsLocationSortRef.current = false;
      pushFilters(
        {
          ...getDraftFilters(applied),
          sort,
          sortDirection: isDescDefaultCatalogSort(sort, config.features.weather)
              ? "DESC"
              : "ASC",
        },
        0,
        false,
        applied.radiusKm,
      );
    },
    [applied, config.features.weather, geo, pushFilters, userCoords],
  );

  const changePage = useCallback(
    (pageIndex: number) => {
      pushFilters(
        getDraftFilters(applied),
        pageIndex,
        locationSortActive,
        applied.radiusKm,
        applied.pageSize,
      );
    },
    [applied, locationSortActive, pushFilters],
  );

  const changePageSize = useCallback(
    (pageSize: BeachPageSize) => {
      pushFilters(
        getDraftFilters(applied),
        0,
        locationSortActive,
        applied.radiusKm,
        pageSize,
      );
    },
    [applied, locationSortActive, pushFilters],
  );

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (geoBootstrappedRef.current) {
      return;
    }
    geoBootstrappedRef.current = true;
    geo.request();
  }, [geo]);

  useEffect(() => {
    if (!wantsLocationSortRef.current) {
      return;
    }

    if (geo.status === "ready") {
      wantsLocationSortRef.current = false;
      if (!applied.nearMe) {
        pushFilters(getDraftFilters(applied), 0, true, applied.radiusKm);
      }
      return;
    }

    if (isGeoFailed(geo)) {
      wantsLocationSortRef.current = false;
    }
  }, [applied, geo, pushFilters]);

  useEffect(() => {
    if (!applied.nearMe || userCoords != null || isGeoPending(geo)) {
      return;
    }

    if (isGeoFailed(geo)) {
      pushFilters(getDraftFilters(applied), 0, false, applied.radiusKm);
    }
  }, [applied, geo, pushFilters, userCoords]);

  const showResultsLoading =
    !hasMounted ||
    filtersLoading ||
    !filterData ||
    (isPending && beaches.length === 0);

  const showFiltersLoading =
    !hasMounted || (!filterData && filtersLoading);

  return (
    <section
      className={cn(
        "px-4 pt-0 pb-6 sm:px-8 sm:pt-8",
        mapMode
          ? "flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden sm:h-dvh sm:pb-4"
          : "sm:pb-8",
      )}
    >
      <header className="mb-6 hidden shrink-0 sm:block">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {config.listTitleKey ? tCategories(config.listTitleKey) : t("pageTitle")}
        </h1>
      </header>

      {showFiltersLoading ? (
        <BeachLoadingIndicator className="min-h-[20rem]" />
      ) : (
        <>
          <div className={cn(mapMode && "shrink-0")}>
            <BeachFilterBar
              value={committedFilters}
              municipalities={filterData!.municipalities as MunicipalityRef[]}
              locationSortActive={locationSortActive}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onApply={applyFilters}
              onSortChange={changeSort}
            />
          </div>

          <div
            className={cn(
              mapMode ? "relative min-h-[24rem] flex-1" : "min-h-[12rem]",
            )}
          >
            {mapMode ? (
              <BeachMapView
                className="absolute inset-0"
                beaches={beaches}
                locale={locale}
                distancesKm={distancesKm}
                userCoords={userCoords}
                onRequestLocation={geo.request}
              />
            ) : showResultsLoading ? (
              <BeachLoadingIndicator className="min-h-[20rem]" />
            ) : isError ? (
              <p className="py-16 text-center text-sm text-destructive">
                {t("error")}
              </p>
            ) : isEmpty ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("empty")}
              </p>
            ) : viewMode === "list" ? (
              <BeachResultsTable
                beaches={beaches}
                distancesKm={distancesKm}
                userCoords={userCoords}
                filterState={committedFilters}
                onFilterPatch={applyFilters}
              />
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {beaches.map((beach: PoiDto) => (
                  <li key={beach.id} className="relative min-w-0">
                    <BeachCard
                      beach={beach}
                      distanceKm={resolveBeachDistanceKm(
                        beach,
                        distancesKm,
                        userCoords,
                      )}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isMobile && hasNextPage && !mapMode ? (
            <>
              <BeachLoadMoreSentinel
                onVisible={loadMore}
                disabled={isFetchingNextPage}
              />
              {isFetchingNextPage ? (
                <BeachLoadingIndicator className="min-h-0 py-6 sm:hidden" />
              ) : null}
            </>
          ) : null}

          {!isMobile && page != null && viewMode !== "map" ? (
            <BeachPaginationBar
              currentPage={page.number}
              totalPages={Math.max(1, totalPages)}
              pageSize={applied.pageSize}
              translationNamespace={config.messagesNamespace}
              onPageChange={changePage}
              onPageSizeChange={changePageSize}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
