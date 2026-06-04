import Image from "next/image";
import { Waves } from "lucide-react";

import {
  BeachAttributeBadges,
  BeachDistanceBadge,
} from "@/components/beaches/beach-attribute-badges";
import type { BeachFilterState } from "@/components/beaches/beach-filter-state";
import { Link } from "@/i18n/routing";
import { formatRegionDisplayName } from "@/lib/region-display-name";
import type { PoiDto } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

type BeachCardProps = {
  beach: PoiDto;
  distanceKm?: number;
  filterState: BeachFilterState;
  onFilterPatch: (next: BeachFilterState) => void;
};

const beachHref = (id: number) => `/beaches/${id}`;

const clickableLinkClass =
  "rounded-sm outline-none transition-[color,box-shadow,background-color] focus-visible:ring-2 focus-visible:ring-ring";

export function BeachCard({
  beach,
  distanceKm,
  filterState,
  onFilterPatch,
}: BeachCardProps) {
  const href = beachHref(beach.id);

  return (
    <article className="flex aspect-square h-full flex-col overflow-hidden rounded-md border border-border bg-white">
      <div className="group/card flex min-h-0 flex-1 flex-col">
        <Link
          href={href}
          className={cn(
            clickableLinkClass,
            "relative block min-h-0 flex-1 overflow-hidden bg-muted",
          )}
          aria-label={beach.name}
        >
          {beach.photoUrl ? (
            <Image
              src={beach.photoUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-200 group-has-[a:hover]/card:scale-[1.03] group-has-[a:focus-visible]/card:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, 20vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground transition-colors duration-200 group-has-[a:hover]/card:text-foreground group-has-[a:focus-visible]/card:text-foreground">
              <Waves className="size-5 stroke-[1.25]" aria-hidden />
            </div>
          )}
          <span
            className="pointer-events-none absolute inset-0 bg-brand/0 transition-colors duration-200 group-has-[a:hover]/card:bg-brand/12 group-has-[a:focus-visible]/card:bg-brand/12"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 ring-0 ring-inset ring-brand/0 transition-[box-shadow] duration-200 group-has-[a:hover]/card:ring-2 group-has-[a:hover]/card:ring-brand/40 group-has-[a:focus-visible]/card:ring-2 group-has-[a:focus-visible]/card:ring-brand/50"
            aria-hidden
          />
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 px-2 pt-1.5">
          <Link
            href={href}
            className={cn(
              clickableLinkClass,
              "inline-block min-w-0 w-fit max-w-full transition-colors duration-200",
              distanceKm != null && "max-w-[calc(100%-4.625rem)]",
            )}
          >
            <h3
              className={cn(
                "line-clamp-1 text-sm font-semibold text-foreground transition-colors duration-200",
                "group-has-[a:hover]/card:text-brand group-has-[a:focus-visible]/card:text-brand",
              )}
            >
              {beach.name}
            </h3>
          </Link>
          {distanceKm != null && (
            <BeachDistanceBadge
              distanceKm={distanceKm}
              size="md"
              className="ml-auto shrink-0"
            />
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1 px-2 pb-2">
        {beach.region && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {formatRegionDisplayName(beach.region)}
          </p>
        )}
        <BeachAttributeBadges
          beach={beach}
          distanceKm={distanceKm}
          size="md"
          showDistance={false}
          interactive
          filterState={filterState}
          onFilterPatch={onFilterPatch}
        />
      </div>
    </article>
  );
}
