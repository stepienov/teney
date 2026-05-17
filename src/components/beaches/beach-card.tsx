import Image from "next/image";
import { CloudSun, MapPin, Navigation, Umbrella } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { formatDistanceKm } from "@/lib/geo/distance";
import type { PoiDto } from "@/lib/types/poi";

type BeachCardProps = {
  beach: PoiDto;
  distanceKm?: number;
};

export function BeachCard({ beach, distanceKm }: BeachCardProps) {
  const t = useTranslations("beaches");

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-white shadow-[0_12px_40px_-20px_rgba(26,46,53,0.15)] transition-shadow hover:shadow-[0_20px_50px_-18px_rgba(64,179,194,0.3)]">
      <div className="relative aspect-[16/10] bg-ocean-cyan/30">
        {beach.photoUrl ? (
          <Image
            src={beach.photoUrl}
            alt={beach.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ocean-deep/50">
            <Umbrella className="size-10 stroke-[1.25]" aria-hidden />
            <span className="text-sm font-medium">{t("noPhoto")}</span>
          </div>
        )}
        {distanceKm != null && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ocean-deep/85 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <Navigation className="size-3" aria-hidden />
            {t("distanceAway", { distance: formatDistanceKm(distanceKm) })}
          </span>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-heading text-lg font-bold text-ocean-deep">
            {beach.name}
          </h3>
          {(beach.municipality || beach.region) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {[beach.municipality, beach.region].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {beach.description && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {beach.description}
          </p>
        )}

        {beach.weather && (
          <p className="flex items-center gap-1.5 rounded-2xl bg-ocean-foam px-3 py-2 text-sm text-ocean-deep">
            <CloudSun className="size-4 shrink-0" aria-hidden />
            {[
              beach.weather.temperature != null
                ? t("temperatureValue", {
                    value: Math.round(beach.weather.temperature),
                  })
                : null,
              beach.weather.conditions,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        <ul className="flex flex-wrap gap-2 text-xs font-medium">
          <li className="rounded-full bg-ocean-cyan/40 px-2.5 py-1 text-ocean-deep">
            {beach.isFree ? t("free") : t("paid")}
          </li>
          {beach.beachDetails?.beachSurface && (
            <li className="rounded-full bg-secondary px-2.5 py-1 text-ocean-deep">
              {t("surface", { value: beach.beachDetails.beachSurface })}
            </li>
          )}
          {beach.beachDetails?.hasLifeguard && (
            <li className="rounded-full bg-secondary px-2.5 py-1 text-ocean-deep">
              {t("filterLifeguard")}
            </li>
          )}
          {beach.beachDetails?.hasShower && (
            <li className="rounded-full bg-secondary px-2.5 py-1 text-ocean-deep">
              {t("filterShower")}
            </li>
          )}
        </ul>

        <Link
          href={`/beaches/${beach.id}`}
          className="inline-flex rounded-full bg-ocean-deep px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ocean-teal"
        >
          {t("viewDetails")}
        </Link>
      </div>
    </article>
  );
}
