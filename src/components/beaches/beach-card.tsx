import Image from "next/image";
import { Waves } from "lucide-react";

import { BeachCardDesktopName } from "@/components/beaches/beach-card-desktop-name";
import { BeachCardWeatherPanel } from "@/components/beaches/beach-card-weather-panel";
import { BeachDistanceBadge } from "@/components/beaches/beach-attribute-badges";
import { Link } from "@/i18n/routing";
import { beachPath } from "@/lib/beach-slug";
import type { PoiDto } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

type BeachCardProps = {
  beach: PoiDto;
  distanceKm?: number;
};

const clickableLinkClass =
  "rounded-sm outline-none transition-[color,box-shadow,background-color] focus-visible:ring-2 focus-visible:ring-ring";

/** Desktop grid card: fixed white footer for wrapped name (up to 3 lines). */
const DESKTOP_FOOTER_CLASS =
  "box-border flex h-[60px] shrink-0 items-center overflow-hidden border-t border-border bg-white px-2 py-1.5";

export function BeachCard({ beach, distanceKm }: BeachCardProps) {
  const href = beachPath(beach);

  return (
    <>
      {/* Mobile */}
      <article className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-white sm:hidden">
        <BeachCardWeatherPanel weather={beach.displayWeather} />
        <Link
          href={href}
          className={cn(
            clickableLinkClass,
            "relative block aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted",
          )}
          aria-label={beach.name}
        >
          {beach.photoUrl ? (
            <Image
              src={beach.photoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Waves className="size-5 stroke-[1.25]" aria-hidden />
            </div>
          )}
        </Link>
        <div className="flex flex-col gap-1.5 px-2 py-2">
          <Link href={href} className={clickableLinkClass}>
            <h3 className="text-sm font-semibold break-words text-foreground">
              {beach.name}
            </h3>
          </Link>
          {distanceKm != null && (
            <BeachDistanceBadge distanceKm={distanceKm} size="md" className="w-fit" />
          )}
        </div>
      </article>

      {/* Desktop — strict square: photo fills remainder, footer always 60px */}
      <article
        className={cn(
          "group/card hidden aspect-square w-full min-w-0 overflow-hidden rounded-md border border-border bg-white sm:grid",
          "grid-rows-[auto_minmax(0,1fr)_60px]",
          "has-[.beach-card-name:hover]:[&_.beach-card-photo_img]:scale-[1.03]",
          "has-[.beach-card-name:hover]:[&_.beach-card-photo_.beach-card-photo-tint]:bg-brand/12",
          "has-[.beach-card-name:hover]:[&_.beach-card-photo_.beach-card-photo-ring]:ring-2",
          "has-[.beach-card-name:hover]:[&_.beach-card-photo_.beach-card-photo-ring]:ring-brand/40",
          "has-[.beach-card-name:hover]:[&_.beach-card-photo_.beach-card-photo-placeholder]:text-foreground",
        )}
      >
        <BeachCardWeatherPanel weather={beach.displayWeather} />
        <Link
          href={href}
          className={cn(
            clickableLinkClass,
            "beach-card-photo relative block min-h-0 overflow-hidden bg-muted",
          )}
          aria-label={beach.name}
        >
          {beach.photoUrl ? (
            <Image
              src={beach.photoUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-200 group-has-[a:hover]/card:scale-[1.03] group-has-[a:focus-visible]/card:scale-[1.03]"
              sizes="20vw"
              unoptimized
            />
          ) : (
            <div className="beach-card-photo-placeholder flex h-full items-center justify-center text-muted-foreground transition-colors duration-200 group-has-[a:hover]/card:text-foreground group-has-[a:focus-visible]/card:text-foreground">
              <Waves className="size-5 stroke-[1.25]" aria-hidden />
            </div>
          )}
          <span
            className="beach-card-photo-tint pointer-events-none absolute inset-0 bg-brand/0 transition-colors duration-200 group-has-[a:hover]/card:bg-brand/12 group-has-[a:focus-visible]/card:bg-brand/12"
            aria-hidden
          />
          <span
            className="beach-card-photo-ring pointer-events-none absolute inset-0 ring-0 ring-inset ring-brand/0 transition-[box-shadow] duration-200 group-has-[a:hover]/card:ring-2 group-has-[a:hover]/card:ring-brand/40 group-has-[a:focus-visible]/card:ring-2 group-has-[a:focus-visible]/card:ring-brand/50"
            aria-hidden
          />
        </Link>

        <div className={DESKTOP_FOOTER_CLASS}>
          <BeachCardDesktopName
            href={href}
            name={beach.name}
            linkClassName={clickableLinkClass}
          />
        </div>
      </article>
    </>
  );
}
