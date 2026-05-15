"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { BeachCard } from "@/components/beaches/beach-card";
import {
  BeachFilters,
  type BeachFilterState,
} from "@/components/beaches/beach-filters";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
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
  isSandy: false,
};

function parseFiltersFromParams(
  params: URLSearchParams,
): BeachFilterState & { page: number } {
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
    isSandy: params.get("sandy") === "1",
    page: Math.max(0, Number(params.get("page") ?? "0") || 0),
  };
}

function filtersToSearchParams(
  filters: BeachFilterState,
  page: number,
): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.name.trim()) p.set("q", filters.name.trim());
  if (filters.regionId) p.set("region", filters.regionId);
  if (filters.municipalityId) p.set("municipality", filters.municipalityId);
  if (filters.sort !== "name") p.set("sort", filters.sort);
  if (filters.sortDirection !== "ASC") p.set("dir", filters.sortDirection);
  if (filters.hasLifeguard) p.set("lifeguard", "1");
  if (filters.hasShower) p.set("shower", "1");
  if (filters.isSandy) p.set("sandy", "1");
  if (page > 0) p.set("page", String(page));
  return p;
}

function toSearchParams(
  filters: BeachFilterState,
  page: number,
  locale: string,
): BeachSearchParams {
  return {
    locale,
    page,
    sort: filters.sort,
    sortDirection: filters.sortDirection,
    name: filters.name.trim() || undefined,
    regionId: filters.regionId ? Number(filters.regionId) : undefined,
    municipalityId: filters.municipalityId
      ? Number(filters.municipalityId)
      : undefined,
    hasLifeguard: filters.hasLifeguard || undefined,
    hasShower: filters.hasShower || undefined,
    isSandy: filters.isSandy || undefined,
  };
}

export function BeachesExplorer() {
  const t = useTranslations("beaches");
  const locale = useLocale();
  const router = useRouter();
  const urlParams = useSearchParams();

  const applied = useMemo(
    () => parseFiltersFromParams(urlParams),
    [urlParams],
  );

  const [draft, setDraft] = useState<BeachFilterState>(() => {
    const { page: _p, ...rest } = applied;
    return rest;
  });

  useEffect(() => {
    const { page: _p, ...rest } = applied;
    setDraft(rest);
  }, [applied]);

  const { data: filterData, isLoading: filtersLoading } = useQuery(
    beachFiltersQueryOptions(),
  );

  const searchParams = useMemo(
    () => toSearchParams(applied, applied.page, locale),
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
    ),
  );

  const pushFilters = useCallback(
    (filters: BeachFilterState, pageIndex: number) => {
      const qs = filtersToSearchParams(filters, pageIndex).toString();
      router.push(qs ? `/beaches?${qs}` : "/beaches");
    },
    [router],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold uppercase tracking-[0.08em] text-ocean-deep sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </header>

      {filtersLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : filterData ? (
        <BeachFilters
          municipalities={filterData.municipalities}
          value={draft}
          onChange={setDraft}
          onApply={() => pushFilters(draft, 0)}
          onReset={() => {
            setDraft(DEFAULT_FILTERS);
            pushFilters(DEFAULT_FILTERS, 0);
          }}
        />
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {page != null
            ? t("total", { count: page.totalElements })
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
        {isPending ? (
          <p className="text-center text-muted-foreground">{t("loading")}</p>
        ) : isError ? (
          <p className="text-center text-destructive">{t("error")}</p>
        ) : page?.empty ? (
          <p className="rounded-3xl border border-dashed border-border bg-white/80 py-16 text-center text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {page?.content.map((beach) => (
              <li key={beach.id}>
                <BeachCard beach={beach} />
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
              const { page: _p, ...f } = applied;
              pushFilters(f, applied.page - 1);
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
              const { page: _p, ...f } = applied;
              pushFilters(f, applied.page + 1);
            }}
          >
            {t("next")}
          </Button>
        </nav>
      )}
    </div>
  );
}
