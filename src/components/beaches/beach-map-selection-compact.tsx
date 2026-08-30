import { BeachCardWeatherPanel } from "@/components/beaches/beach-card-weather-panel";
import { BeachDistanceBadge } from "@/components/beaches/beach-attribute-badges";
import { usePoiCategoryConfig } from "@/components/poi-explorer/poi-category-context";
import { Link } from "@/i18n/routing";
import type { PoiDto } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

type BeachMapSelectionCompactProps = {
  beach: PoiDto;
  distanceKm?: number;
  className?: string;
};

const clickableLinkClass =
  "rounded-sm outline-none transition-[color,box-shadow,background-color] focus-visible:ring-2 focus-visible:ring-ring";

export function BeachMapSelectionCompact({
  beach,
  distanceKm,
  className,
}: BeachMapSelectionCompactProps) {
  const { poiPath, features } = usePoiCategoryConfig();
  const href = poiPath(beach);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card shadow-md",
        className,
      )}
    >
      <BeachCardWeatherPanel
        weather={features.weather ? beach.displayWeather : null}
        className="border-b-0 py-1"
      />
      <div className="flex flex-col gap-1.5 px-2 py-2">
        <Link href={href} className={clickableLinkClass}>
          <h3 className="line-clamp-2 text-sm font-semibold break-words text-foreground">
            {beach.name}
          </h3>
        </Link>
        {distanceKm != null ? (
          <BeachDistanceBadge distanceKm={distanceKm} size="md" className="w-fit" />
        ) : null}
      </div>
    </article>
  );
}
