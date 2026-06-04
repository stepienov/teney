"use client";

import { Navigation } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  BEACH_SURFACE_OPTIONS,
  type BeachFilterState,
  type BeachSurfaceOption,
  toggleFilterId,
} from "@/components/beaches/beach-filter-state";
import { FilterBadgeToggle } from "@/components/beaches/filter-menu";
import {
  distanceBadgeWidthClass,
  formatDistanceKm,
} from "@/lib/geo/distance";
import type { PoiDto } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

function isTruthyAttribute(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

type BooleanFilterKey =
  | "hasLifeguard"
  | "hasShower"
  | "hasSunbeds"
  | "hasShopNearby"
  | "hasRestaurantNearby"
  | "dogFriendly"
  | "hasWebcam";

type BeachBadgeItem =
  | { kind: "static"; label: string; variant: "default" | "paid" }
  | { kind: "toggle"; label: string; variant: "default" | "paid"; key: BooleanFilterKey }
  | { kind: "surface"; label: string; surface: BeachSurfaceOption };

function surfaceLabel(
  surface: string | null | undefined,
  labels: { lightSand: string; volcanicSand: string; stones: string },
): string | null {
  switch (surface) {
    case "LIGHT_SAND":
      return labels.lightSand;
    case "VOLCANIC_SAND":
      return labels.volcanicSand;
    case "STONES":
      return labels.stones;
    default:
      return surface ?? null;
  }
}

function isBeachSurface(value: string | null | undefined): value is BeachSurfaceOption {
  return (
    value != null &&
    (BEACH_SURFACE_OPTIONS as readonly string[]).includes(value)
  );
}

type BeachAttributeBadgesProps = {
  beach: PoiDto;
  distanceKm?: number;
  size?: "sm" | "md";
  className?: string;
  /** Widok listy: kafelki atrybutów przełączają filtry (jak checkboxy). */
  interactive?: boolean;
  filterState?: BeachFilterState;
  onFilterPatch?: (next: BeachFilterState) => void;
  /** Domyślnie true; w widoku kafelków odległość jest przy nazwie. */
  showDistance?: boolean;
};

function badgeVariant(item: BeachBadgeItem): "default" | "paid" {
  if (item.kind === "static" || item.kind === "toggle") {
    return item.variant === "paid" ? "paid" : "default";
  }
  return "default";
}

function badgeClass(size: "sm" | "md", variant: "default" | "paid"): string {
  const sizeClass =
    size === "sm"
      ? "h-5 rounded px-1.5 text-[10px] font-medium"
      : "h-6 rounded-md px-2 text-xs font-medium";

  const toneClass =
    variant === "paid"
      ? "bg-brand-muted text-brand"
      : "bg-muted text-secondary-foreground";

  return cn(
    "inline-flex items-center justify-center leading-none whitespace-nowrap",
    sizeClass,
    toneClass,
  );
}

function distanceBadgeClass(size: "sm" | "md"): string {
  const sizeClass =
    size === "sm"
      ? "h-5 rounded px-1.5 text-[10px] font-medium"
      : "h-6 rounded-md px-2 text-xs font-medium";

  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1 bg-neutral-200 text-secondary-foreground tabular-nums leading-none whitespace-nowrap",
    distanceBadgeWidthClass,
    sizeClass,
  );
}

export function BeachDistanceBadge({
  distanceKm,
  size = "md",
  className,
}: {
  distanceKm: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const iconClass = size === "sm" ? "size-3 shrink-0" : "size-3.5 shrink-0";

  return (
    <span className={cn(distanceBadgeClass(size), className)}>
      <Navigation className={iconClass} aria-hidden />
      {formatDistanceKm(distanceKm)}
    </span>
  );
}

export function BeachAttributeBadges({
  beach,
  distanceKm,
  size = "md",
  className,
  interactive = false,
  filterState,
  onFilterPatch,
  showDistance = true,
}: BeachAttributeBadgesProps) {
  const t = useTranslations("beaches");

  const surface = beach.beachDetails?.beachSurface;
  const surfaceText = surfaceLabel(surface, {
    lightSand: t("surfaceLightSand"),
    volcanicSand: t("surfaceVolcanicSand"),
    stones: t("surfaceStones"),
  });

  const items: BeachBadgeItem[] = [];

  if (!beach.isFree) {
    items.push({ kind: "static", label: t("paid"), variant: "paid" });
  }
  if (surfaceText && isBeachSurface(surface)) {
    items.push({ kind: "surface", label: surfaceText, surface });
  } else if (surfaceText) {
    items.push({ kind: "static", label: surfaceText, variant: "default" });
  }
  if (beach.beachDetails?.hasLifeguard) {
    items.push({ kind: "toggle", label: t("tagLifeguard"), variant: "default", key: "hasLifeguard" });
  }
  if (beach.beachDetails?.hasShower) {
    items.push({ kind: "toggle", label: t("tagShower"), variant: "default", key: "hasShower" });
  }
  if (beach.beachDetails?.boatAccessOnly) {
    items.push({ kind: "static", label: t("tagBoatOnly"), variant: "default" });
  }
  if (isTruthyAttribute(beach.attributes?.sunbeds_boolean)) {
    items.push({ kind: "toggle", label: t("tagSunbeds"), variant: "default", key: "hasSunbeds" });
  }
  if (isTruthyAttribute(beach.attributes?.shop_nearby_boolean)) {
    items.push({
      kind: "toggle",
      label: t("tagShopNearby"),
      variant: "default",
      key: "hasShopNearby",
    });
  }
  if (isTruthyAttribute(beach.attributes?.restaurant_nearby_boolean)) {
    items.push({
      kind: "toggle",
      label: t("tagRestaurantNearby"),
      variant: "default",
      key: "hasRestaurantNearby",
    });
  }
  if (isTruthyAttribute(beach.attributes?.dog_friendly_boolean)) {
    items.push({
      kind: "toggle",
      label: t("tagDogFriendly"),
      variant: "default",
      key: "dogFriendly",
    });
  }
  if (
    typeof beach.attributes?.webcam_link === "string" &&
    beach.attributes.webcam_link
  ) {
    items.push({ kind: "toggle", label: t("filterWebcam"), variant: "default", key: "hasWebcam" });
  }

  const canToggle =
    interactive && filterState != null && onFilterPatch != null;

  const showDistanceBadge = showDistance && distanceKm != null;

  if (items.length === 0 && !showDistanceBadge) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {showDistanceBadge && (
        <BeachDistanceBadge distanceKm={distanceKm!} size={size} />
      )}
      {items.map((item) => {
        if (canToggle && item.kind === "toggle") {
          return (
            <FilterBadgeToggle
              key={item.key}
              checked={filterState![item.key]}
              label={item.label}
              variant={item.variant === "paid" ? "paid" : "default"}
              onToggle={() =>
                onFilterPatch!({
                  ...filterState!,
                  [item.key]: !filterState![item.key],
                })
              }
            />
          );
        }

        if (canToggle && item.kind === "surface") {
          const checked = filterState!.beachSurfaces.includes(item.surface);
          return (
            <FilterBadgeToggle
              key={`surface-${item.surface}`}
              checked={checked}
              label={item.label}
              onToggle={() =>
                onFilterPatch!({
                  ...filterState!,
                  beachSurfaces: toggleFilterId(
                    filterState!.beachSurfaces,
                    item.surface,
                  ),
                })
              }
            />
          );
        }

        return (
          <span key={item.label} className={badgeClass(size, badgeVariant(item))}>
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
