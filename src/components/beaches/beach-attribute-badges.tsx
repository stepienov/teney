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

/** Badge only when BE sent an explicit boolean true (not null / missing). */
function isExplicitBooleanTrue(value: unknown): value is true {
  return value === true;
}

function badgeDisplayLabel(text: string): string {
  return text.toLocaleLowerCase();
}

type BooleanFilterKey =
  | "hasLifeguard"
  | "hasShower"
  | "hasSunbeds"
  | "hasShopNearby"
  | "hasRestaurantNearby"
  | "dogFriendly"
  | "hasWebcam";

export type BeachBadgeItem =
  | { kind: "static"; label: string; variant: "default" | "paid" }
  | { kind: "toggle"; label: string; variant: "default" | "paid"; key: BooleanFilterKey }
  | { kind: "surface"; label: string; surface: BeachSurfaceOption };

type BeachBadgeLabels = {
  paid: string;
  surfaceLightSand: string;
  surfaceVolcanicSand: string;
  surfaceStones: string;
  tagLifeguard: string;
  tagShower: string;
  tagBoatOnly: string;
  tagSunbeds: string;
  tagShopNearby: string;
  tagRestaurantNearby: string;
  tagDogFriendly: string;
  filterWebcam: string;
};

export function buildBeachBadgeItems(
  beach: PoiDto,
  labels: BeachBadgeLabels,
): BeachBadgeItem[] {
  const surface = beach.beachDetails?.beachSurface;
  const surfaceText = surfaceLabel(surface, {
    lightSand: labels.surfaceLightSand,
    volcanicSand: labels.surfaceVolcanicSand,
    stones: labels.surfaceStones,
  });

  const items: BeachBadgeItem[] = [];

  if (beach.isFree === false) {
    items.push({
      kind: "static",
      label: badgeDisplayLabel(labels.paid),
      variant: "paid",
    });
  }
  if (surface != null && surfaceText && isBeachSurface(surface)) {
    items.push({
      kind: "surface",
      label: badgeDisplayLabel(surfaceText),
      surface,
    });
  } else if (surface != null && surfaceText) {
    items.push({
      kind: "static",
      label: badgeDisplayLabel(surfaceText),
      variant: "default",
    });
  }
  if (beach.beachDetails?.hasLifeguard === true) {
    items.push({
      kind: "toggle",
      label: badgeDisplayLabel(labels.tagLifeguard),
      variant: "default",
      key: "hasLifeguard",
    });
  }
  if (beach.beachDetails?.hasShower === true) {
    items.push({
      kind: "toggle",
      label: badgeDisplayLabel(labels.tagShower),
      variant: "default",
      key: "hasShower",
    });
  }
  if (beach.beachDetails?.boatAccessOnly === true) {
    items.push({
      kind: "static",
      label: badgeDisplayLabel(labels.tagBoatOnly),
      variant: "default",
    });
  }
  if (isExplicitBooleanTrue(beach.attributes?.sunbeds_boolean)) {
    items.push({
      kind: "toggle",
      label: badgeDisplayLabel(labels.tagSunbeds),
      variant: "default",
      key: "hasSunbeds",
    });
  }
  if (isExplicitBooleanTrue(beach.attributes?.shop_nearby_boolean)) {
    items.push({
      kind: "toggle",
      label: badgeDisplayLabel(labels.tagShopNearby),
      variant: "default",
      key: "hasShopNearby",
    });
  }
  if (isExplicitBooleanTrue(beach.attributes?.restaurant_nearby_boolean)) {
    items.push({
      kind: "toggle",
      label: badgeDisplayLabel(labels.tagRestaurantNearby),
      variant: "default",
      key: "hasRestaurantNearby",
    });
  }
  if (isExplicitBooleanTrue(beach.attributes?.dog_friendly_boolean)) {
    items.push({
      kind: "toggle",
      label: badgeDisplayLabel(labels.tagDogFriendly),
      variant: "default",
      key: "dogFriendly",
    });
  }
  if (
    typeof beach.attributes?.webcam_link === "string" &&
    beach.attributes.webcam_link
  ) {
    items.push({
      kind: "toggle",
      label: badgeDisplayLabel(labels.filterWebcam),
      variant: "default",
      key: "hasWebcam",
    });
  }

  return items;
}

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
      ? "h-5 rounded px-1.5 text-[10px] font-semibold"
      : "h-6 rounded-md px-2 text-xs font-semibold";

  const toneClass =
    variant === "paid" ? "bg-coral text-ink" : "bg-sand text-ink";

  return cn(
    "inline-flex items-center justify-center leading-none whitespace-nowrap",
    sizeClass,
    toneClass,
  );
}

function distanceBadgeClass(size: "sm" | "md"): string {
  const sizeClass =
    size === "sm"
      ? "h-5 rounded px-1.5 text-[10px] font-semibold"
      : "h-6 rounded-md px-2 text-xs font-semibold";

  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1 bg-sand font-semibold text-ink tabular-nums leading-none whitespace-nowrap",
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

  const items = buildBeachBadgeItems(beach, {
    paid: t("paid"),
    surfaceLightSand: t("surfaceLightSand"),
    surfaceVolcanicSand: t("surfaceVolcanicSand"),
    surfaceStones: t("surfaceStones"),
    tagLifeguard: t("tagLifeguard"),
    tagShower: t("tagShower"),
    tagBoatOnly: t("tagBoatOnly"),
    tagSunbeds: t("tagSunbeds"),
    tagShopNearby: t("tagShopNearby"),
    tagRestaurantNearby: t("tagRestaurantNearby"),
    tagDogFriendly: t("tagDogFriendly"),
    filterWebcam: t("filterWebcam"),
  });

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
