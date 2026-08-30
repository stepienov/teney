"use client";

import { ChevronRight, MapPin, Navigation, Waves } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { beachPath } from "@/lib/beach-slug";
import { formatDistanceKm } from "@/lib/geo/distance";
import type { PoiDto } from "@/lib/types/poi";

type BeachListRowProps = {
  beach: PoiDto;
  distanceKm?: number;
};

export function BeachListRow({ beach, distanceKm }: BeachListRowProps) {
  const t = useTranslations("beaches");

  return (
    <li>
      <Link
        href={beachPath(beach)}
        className="group flex items-center gap-4 rounded-lg border border-border bg-card px-3 py-3 transition-colors hover:border-brand/30 hover:bg-muted/80"
      >
        <Waves className="size-4 shrink-0 text-foreground/75" aria-hidden />

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{beach.name}</p>
          {(beach.municipality || beach.region) && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {[beach.municipality, beach.region].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {distanceKm != null && (
          <span className="hidden shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground sm:inline-flex">
            <Navigation className="size-3.5" aria-hidden />
            {formatDistanceKm(distanceKm)}
          </span>
        )}

        <span className="sr-only">{t("viewDetails")}</span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </Link>
    </li>
  );
}
