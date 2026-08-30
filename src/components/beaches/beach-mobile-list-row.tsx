"use client";

import { BeachDistanceBadge } from "@/components/beaches/beach-attribute-badges";
import { usePoiCategoryConfig } from "@/components/poi-explorer/poi-category-context";
import { Link } from "@/i18n/routing";
import type { PoiDto } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

type BeachMobileListRowProps = {
  beach: PoiDto;
  distanceKm?: number;
  showDivider?: boolean;
  isFirst?: boolean;
};

export function BeachMobileListRow({
  beach,
  distanceKm,
  showDivider = false,
  isFirst = false,
}: BeachMobileListRowProps) {
  const { poiPath, placeholderIcon: PlaceholderIcon } = usePoiCategoryConfig();

  return (
    <li>
      <Link
        href={poiPath(beach)}
        className={cn(
          "flex items-center gap-3 pb-3.5 transition-opacity active:opacity-80",
          isFirst ? "pt-0" : "pt-3.5",
        )}
      >
        <PlaceholderIcon className="size-5 shrink-0 text-foreground/75" aria-hidden />
        <span className="min-w-0 flex-1 font-medium text-foreground">{beach.name}</span>
        {distanceKm != null && (
          <BeachDistanceBadge distanceKm={distanceKm} size="md" className="shrink-0" />
        )}
      </Link>
      {showDivider ? (
        <div className="flex justify-center" aria-hidden>
          <hr className="m-0 h-px w-1/2 border-0 bg-border" />
        </div>
      ) : null}
    </li>
  );
}
