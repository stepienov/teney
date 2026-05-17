"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BeachCard } from "@/components/beaches/beach-card";
import {
  BeachFilters,
  type BeachFilterState,
} from "@/components/beaches/beach-filters";
import { NearMeControls } from "@/components/beaches/near-me-controls";
import { Button } from "@/components/ui/button";
import {
  useGeolocation,
  type GeolocationState,
} from "@/hooks/use-geolocation";
import { useRouter } from "@/i18n/routing";
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
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
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
    if (radiusKm !== DEFAULT_NEAR_ME_RADIUS_KM) {
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

function mapGeoStatus(
  geo: GeolocationState,
  nearMe: boolean,
): "idle" | "loading" | "unsupported" | "denied" | "error" | "ready" {
  if (!nearMe) return "idle";
  switch (geo.status) {
    case "ready":
      return "ready";
    case "denied":
      return "denied";
    case "unsupported":
      return "unsupported";
    case "error":
      return "error";
    case "loading":
      return "loading";
    default:
      return "loading";
  }
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

export function BeachesExplorer() {
  const urlParams = useSearchParams();
  const applied = useMemo(
    () => parseFiltersFromParams(urlParams),
    [urlParams],
  );

  return (
    <BeachesExplorerContent key={urlParams.toString()} applied={applied} />
  );
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

  const geo = useGeolocation({ enabled: applied.nearMe });
  const userCoords = geo.status === "ready" ? geo.coords : undefined;
  const geoStatus = mapGeoStatus(geo, applied.nearMe);

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

  const enableNearMe = () => {
    pushFilters(getDraftFilters(applied), 0, true, applied.radiusKm);
  };

  const disableNearMe = () => {
    pushFilters(getDraftFilters(applied), 0, false, applied.radiusKm);
  };

  const changeRadius = (radiusKm: number) => {
    pushFilters(getDraftFilters(applied), 0, true, radiusKm);
  };

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

  const showGeoBlocker =
    applied.nearMe &&
    (geo.status === "denied" ||
      geo.status === "unsupported" ||
      geo.status === "error");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-[0.08em] text-ocean-deep sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="mb-6">
        <NearMeControls
          active={applied.nearMe}
          geoStatus={geoStatus}
          radiusKm={applied.radiusKm}
          accuracyMeters={
            geo.status === "ready" ? geo.coords.accuracyMeters : undefined
          }
          onEnable={enableNearMe}
          onDisable={disableNearMe}
          onRadiusChange={changeRadius}
        />
      </div>

      {filtersLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : filterData ? (
        <BeachFilters
          municipalities={filterData.municipalities}
          value={draft}
          nearMe={applied.nearMe}
          onChange={setDraft}
          onApply={() => void applyFilters()}
          onReset={() => {
            setDraft(DEFAULT_FILTERS);
            pushFilters(DEFAULT_FILTERS, 0, applied.nearMe, applied.radiusKm);
          }}
        />
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {page != null
            ? t("total", { count: page.totalElements })
            : applied.nearMe && geo.status === "loading"
              ? t("nearMeLocating")
              : isFetching
                ? t("loading")
                : null}
        </p>
        {page != null && page.totalPages > 0 && (
          <p className="text-sm font-medium text-ocean-deep">
            {t("page", {
              current: page.number + 1,
              total: page.totalPages,
            })}
          </p>
        )}
      </div>

      <div className="mt-6">
        {showGeoBlocker ? (
          <p className="rounded-3xl border border-amber-200/80 bg-amber-50/90 px-6 py-12 text-center text-sm text-muted-foreground">
            {geo.status === "denied" && t("nearMeDenied")}
            {geo.status === "unsupported" && t("nearMeUnsupported")}
            {geo.status === "error" && t("nearMeError")}
          </p>
        ) : isPending || (applied.nearMe && geo.status === "loading") ? (
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
              <li key={beach.id}>
                <BeachCard
                  beach={beach}
                  distanceKm={distancesKm?.get(beach.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {page != null && page.totalPages > 1 && !showGeoBlocker && (
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
  );
}
