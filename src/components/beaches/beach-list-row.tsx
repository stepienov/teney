import Image from "next/image";
import { ChevronRight, MapPin, Navigation, Umbrella } from "lucide-react";
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
        className="group flex items-center gap-4 rounded-lg border border-border bg-white px-3 py-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50/80"
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
          {beach.photoUrl ? (
            <Image
              src={beach.photoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Umbrella className="size-6" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{beach.name}</p>
          {(beach.municipality || beach.region) && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {[beach.municipality, beach.region].filter(Boolean).join(" · ")}
            </p>
          )}
          {beach.description && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {beach.description}
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
