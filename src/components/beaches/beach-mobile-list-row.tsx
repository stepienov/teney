import Image from "next/image";
import { Waves } from "lucide-react";

import { BeachDistanceBadge } from "@/components/beaches/beach-attribute-badges";
import { Link } from "@/i18n/routing";
import { beachPath } from "@/lib/beach-slug";
import type { PoiDto } from "@/lib/types/poi";

type BeachMobileListRowProps = {
  beach: PoiDto;
  distanceKm?: number;
  showDivider?: boolean;
};

export function BeachMobileListRow({
  beach,
  distanceKm,
  showDivider = false,
}: BeachMobileListRowProps) {
  return (
    <li>
      <Link
        href={beachPath(beach)}
        className="flex items-center gap-3 py-3.5 transition-opacity active:opacity-80"
      >
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
          {beach.photoUrl ? (
            <Image
              src={beach.photoUrl}
              alt=""
              width={48}
              height={48}
              className="size-full object-cover"
              unoptimized
            />
          ) : (
            <Waves className="size-5 text-muted-foreground" aria-hidden />
          )}
        </span>
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
