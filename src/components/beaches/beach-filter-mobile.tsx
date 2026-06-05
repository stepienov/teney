"use client";

import { LayoutGrid, List, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { BeachFilterPanel } from "@/components/beaches/beach-filter-panel";
import { BeachWeatherFilterChips } from "@/components/beaches/beach-weather-filter-chips";
import {
  clearBeachFilters,
  hasBeachFilters,
  type BeachFilterState,
} from "@/components/beaches/beach-filter-state";
import { FilterOptionRow } from "@/components/beaches/filter-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBottomSheetSwipeDismiss } from "@/hooks/use-bottom-sheet-swipe-dismiss";
import { uniqueRegions } from "@/lib/api/reference";
import type { MunicipalityRef } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

const FILTER_APPLY_DEBOUNCE_MS = 250;

type BeachFilterMobileProps = {
  value: BeachFilterState;
  municipalities: MunicipalityRef[];
  locationSortActive: boolean;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  onApply: (next: BeachFilterState) => void;
  onSortChange: (sort: string) => void;
};

function SheetDragHandle() {
  return (
    <div className="flex justify-center pt-3 pb-1" aria-hidden>
      <div className="h-1 w-10 rounded-full bg-neutral-300" />
    </div>
  );
}

function bottomSheetMotionStyle(
  swipe: ReturnType<typeof useBottomSheetSwipeDismiss>,
): CSSProperties | undefined {
  if (swipe.offset <= 0) {
    return undefined;
  }

  return { transform: `translateY(${swipe.offset}px)` };
}

export function BeachFilterMobile({
  value,
  municipalities,
  locationSortActive,
  viewMode,
  onViewModeChange,
  onApply,
  onSortChange,
}: BeachFilterMobileProps) {
  const t = useTranslations("beaches");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sheetDraft, setSheetDraft] = useState(value);
  const sheetDraftRef = useRef(value);
  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const regions = useMemo(() => uniqueRegions(municipalities), [municipalities]);

  useEffect(() => {
    if (!filterOpen) {
      sheetDraftRef.current = value;
      setSheetDraft(value);
    }
  }, [value, filterOpen]);

  useEffect(() => {
    return () => {
      if (applyTimerRef.current != null) {
        clearTimeout(applyTimerRef.current);
      }
    };
  }, []);

  const flushApply = useCallback(
    (next: BeachFilterState) => {
      onApply(next);
    },
    [onApply],
  );

  const scheduleApply = useCallback(
    (next: BeachFilterState, immediate = false) => {
      sheetDraftRef.current = next;
      setSheetDraft(next);

      if (applyTimerRef.current != null) {
        clearTimeout(applyTimerRef.current);
        applyTimerRef.current = null;
      }

      if (immediate) {
        flushApply(next);
        return;
      }

      applyTimerRef.current = setTimeout(() => {
        applyTimerRef.current = null;
        flushApply(next);
      }, FILTER_APPLY_DEBOUNCE_MS);
    },
    [flushApply],
  );

  function patch(next: BeachFilterState, immediate = false) {
    scheduleApply(next, immediate);
  }

  function patchFromHeader(next: BeachFilterState) {
    patch(next, true);
  }

  const sortOptions = [
    { value: "weather.tempMax", label: t("sortWarmest") },
    { value: "weather.windSpeed", label: t("sortLightestWind") },
    { value: "location", label: t("sortNearest") },
    { value: "name", label: t("sortName") },
  ] as const;

  const handleFilterOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        sheetDraftRef.current = value;
        setSheetDraft(value);
        setFilterOpen(true);
        return;
      }

      if (applyTimerRef.current != null) {
        clearTimeout(applyTimerRef.current);
        applyTimerRef.current = null;
      }

      flushApply(sheetDraftRef.current);
      setFilterOpen(false);
    },
    [flushApply, value],
  );

  const filterSwipe = useBottomSheetSwipeDismiss(() => handleFilterOpenChange(false));
  const sortSwipe = useBottomSheetSwipeDismiss(() => setSortOpen(false));

  const filtersActive = hasBeachFilters(filterOpen ? sheetDraft : value);
  const sortValue = locationSortActive ? "location" : value.sort;

  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-white sm:hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h1 className="min-w-0 text-base font-bold tracking-wide text-foreground">
          {t("pageTitle")}
        </h1>
        <div
          className="flex shrink-0 items-center gap-1.5"
          role="group"
          aria-label={t("viewModeLabel")}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "size-9 shrink-0 rounded-md border-border bg-white shadow-sm",
              viewMode === "list" && "border-brand/50 bg-brand-muted text-brand",
            )}
            aria-pressed={viewMode === "list"}
            aria-label={t("viewList")}
            onClick={() => onViewModeChange("list")}
          >
            <List className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "size-9 shrink-0 rounded-md border-border bg-white shadow-sm",
              viewMode === "grid" && "border-brand/50 bg-brand-muted text-brand",
            )}
            aria-pressed={viewMode === "grid"}
            aria-label={t("viewGrid")}
            onClick={() => onViewModeChange("grid")}
          >
            <LayoutGrid className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <label className="relative block border-b border-border px-4 py-2.5">
        <span className="sr-only">{t("searchName")}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={value.name}
          onChange={(event) =>
            patchFromHeader({ ...value, name: event.target.value })
          }
          className="h-10 w-full rounded-md border border-border bg-white pr-3 pl-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      <div className="grid grid-cols-2 border-b border-border">
        <button
          type="button"
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 border-r border-border py-3 text-sm font-semibold transition-colors",
            filtersActive
              ? "bg-brand-muted/60 text-brand"
              : "text-foreground",
            filterOpen && "bg-brand-muted/40",
          )}
          onClick={() => {
            setSortOpen(false);
            handleFilterOpenChange(true);
          }}
        >
          <span>{t("filterMenu")}</span>
          {filtersActive ? (
            <span
              role="button"
              tabIndex={0}
              className="inline-flex size-6 items-center justify-center rounded-md text-brand/80 hover:bg-white/70"
              aria-label={t("clearFilters")}
              onClick={(event) => {
                event.stopPropagation();
                patchFromHeader(clearBeachFilters(value));
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  patchFromHeader(clearBeachFilters(value));
                }
              }}
            >
              <X className="size-3.5" aria-hidden />
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className={cn(
            "cursor-pointer py-3 text-sm font-semibold text-foreground transition-colors",
            sortOpen && "bg-muted/50",
          )}
          onClick={() => {
            handleFilterOpenChange(false);
            setSortOpen(true);
          }}
        >
          {t("sortMenu")}
        </button>
      </div>

      <div className="border-b border-border px-4 py-2.5">
        <BeachWeatherFilterChips
          value={value}
          onApply={patchFromHeader}
        />
      </div>

      <Sheet open={filterOpen} onOpenChange={handleFilterOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          onBackdropClick={() => handleFilterOpenChange(false)}
          backdropSwipeHandlers={filterSwipe.backdropSwipeHandlers}
          className={cn(
            "max-h-[85vh] gap-0 rounded-t-2xl p-0",
            filterSwipe.isDragging && "transition-none",
          )}
          style={bottomSheetMotionStyle(filterSwipe)}
        >
          <div
            {...filterSwipe.headerSwipeHandlers}
            className="shrink-0 touch-none select-none"
          >
            <SheetDragHandle />
            <SheetHeader className="border-b border-border px-4 py-2">
              <SheetTitle className="text-base font-semibold">
                {t("filterSheetTitle")}
              </SheetTitle>
            </SheetHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <BeachFilterPanel
              value={sheetDraft}
              regions={regions}
              onPatch={patch}
              variant="mobile"
            />
          </div>
          {filtersActive && (
            <div className="border-t border-border p-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  patch(clearBeachFilters(sheetDraft), true);
                  handleFilterOpenChange(false);
                }}
              >
                {t("clearFilters")}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={sortOpen} onOpenChange={setSortOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          onBackdropClick={() => setSortOpen(false)}
          backdropSwipeHandlers={sortSwipe.backdropSwipeHandlers}
          className={cn(
            "gap-0 rounded-t-2xl p-0",
            sortSwipe.isDragging && "transition-none",
          )}
          style={bottomSheetMotionStyle(sortSwipe)}
        >
          <div
            {...sortSwipe.headerSwipeHandlers}
            className="shrink-0 touch-none select-none"
          >
            <SheetDragHandle />
            <SheetHeader className="border-b border-border px-4 py-2">
              <SheetTitle className="text-base font-semibold">{t("sortMenu")}</SheetTitle>
            </SheetHeader>
          </div>
          <ul className="py-1" role="listbox" aria-label={t("sortMenu")}>
            {sortOptions.map((option) => (
              <li key={option.value} role="presentation">
                <FilterOptionRow
                  selected={sortValue === option.value}
                  label={option.label}
                  variant="mobile"
                  onSelect={() => {
                    onSortChange(option.value);
                    setSortOpen(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}
