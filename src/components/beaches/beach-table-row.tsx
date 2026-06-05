import Image from "next/image";
import { Waves } from "lucide-react";

import { BeachListWeatherCell } from "@/components/beaches/beach-list-weather-cell";
import { BeachAttributeBadges } from "@/components/beaches/beach-attribute-badges";
import type { BeachFilterState } from "@/components/beaches/beach-filter-state";
import { Link } from "@/i18n/routing";
import { beachPath } from "@/lib/beach-slug";
import { formatRegionDisplayName } from "@/lib/region-display-name";
import type { PoiDto } from "@/lib/types/poi";

type BeachTableRowProps = {
  beach: PoiDto;
  distanceKm?: number;
  filterState: BeachFilterState;
  onFilterPatch: (next: BeachFilterState) => void;
};

export function BeachTableRow({
  beach,
  distanceKm,
  filterState,
  onFilterPatch,
}: BeachTableRowProps) {
  return (
    <tr className="group border-b border-border last:border-b-0 hover:bg-muted/60">
      <td className="px-4 py-2.5">
        <Link
          href={beachPath(beach)}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
            {beach.photoUrl ? (
              <Image
                src={beach.photoUrl}
                alt=""
                width={28}
                height={28}
                className="size-full object-cover"
                unoptimized
              />
            ) : (
              <Waves className="size-3.5 text-muted-foreground" aria-hidden />
            )}
          </span>
          <span className="truncate font-medium text-foreground group-hover:text-brand">
            {beach.name}
          </span>
        </Link>
      </td>
      <td className="hidden px-4 py-2.5 md:table-cell">
        <BeachListWeatherCell weather={beach.displayWeather} />
      </td>
      <td className="px-4 py-2.5">
        <BeachAttributeBadges
          beach={beach}
          distanceKm={distanceKm}
          interactive
          filterState={filterState}
          onFilterPatch={onFilterPatch}
        />
      </td>
      <td className="hidden px-4 py-2.5 text-sm text-muted-foreground sm:table-cell">
        {beach.region ? formatRegionDisplayName(beach.region) : "—"}
      </td>
    </tr>
  );
}
