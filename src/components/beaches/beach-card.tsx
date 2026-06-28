import Image from "next/image";

import { BeachCardDesktopName } from "@/components/beaches/beach-card-desktop-name";
import { BeachCardWeatherPanel } from "@/components/beaches/beach-card-weather-panel";
import { BeachDistanceBadge } from "@/components/beaches/beach-attribute-badges";
import { BeachFavoriteButton } from "@/components/auth/beach-favorite-button";
import { AddToListButton } from "@/components/lists/add-to-list-button";
import { usePoiCategoryConfig } from "@/components/poi-explorer/poi-category-context";
import { Link } from "@/i18n/routing";
import type { PoiDto } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

type BeachCardProps = {
  beach: PoiDto;
  distanceKm?: number;
  /** Wide 2:1 banner for map POI selection (desktop). */
  mapSelection?: boolean;
};

const clickableLinkClass =
  "rounded-sm outline-none transition-[color,box-shadow,background-color] focus-visible:ring-2 focus-visible:ring-ring";

/** Desktop grid card: footer for wrapped name + optional distance badge. */
const DESKTOP_FOOTER_CLASS =
  "box-border flex min-h-[60px] shrink-0 flex-col justify-center gap-1 overflow-hidden border-t border-border bg-white px-2 py-1.5";

export function BeachCard({
  beach,
  distanceKm,
  mapSelection = false,
}: BeachCardProps) {
  const { poiPath, placeholderIcon: PlaceholderIcon, features } =
    usePoiCategoryConfig();
  const href = poiPath(beach);

  const photoLinkClass = cn(
    clickableLinkClass,
    "beach-card-photo relative block overflow-hidden bg-muted",
  );

  const photoOverlay = (
    <>
      <span
        className="beach-card-photo-tint pointer-events-none absolute inset-0 bg-brand/0 transition-colors duration-200 group-has-[a:hover]/card:bg-brand/12 group-has-[a:focus-visible]/card:bg-brand/12"
        aria-hidden
      />
      <span
        className="beach-card-photo-ring pointer-events-none absolute inset-0 ring-0 ring-inset ring-brand/0 transition-[box-shadow] duration-200 group-has-[a:hover]/card:ring-2 group-has-[a:hover]/card:ring-brand/40 group-has-[a:focus-visible]/card:ring-2 group-has-[a:focus-visible]/card:ring-brand/50"
        aria-hidden
      />
    </>
  );

  const photoContent = beach.photoUrl ? (
    <Image
      src={beach.photoUrl}
      alt=""
      fill
      className="object-cover transition-transform duration-200 group-has-[a:hover]/card:scale-[1.03] group-has-[a:focus-visible]/card:scale-[1.03]"
      sizes={mapSelection ? "384px" : "20vw"}
      unoptimized
    />
  ) : (
    <div className="beach-card-photo-placeholder flex h-full items-center justify-center text-muted-foreground transition-colors duration-200 group-has-[a:hover]/card:text-foreground group-has-[a:focus-visible]/card:text-foreground">
      <PlaceholderIcon className="size-5 stroke-[1.25]" aria-hidden />
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <article className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-white sm:hidden">
        <BeachCardWeatherPanel weather={features.weather ? beach.displayWeather : null} />
        <div className="relative aspect-[4/3] w-full shrink-0">
          <Link
            href={href}
            className={cn(
              clickableLinkClass,
              "block h-full overflow-hidden bg-muted",
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
                <PlaceholderIcon className="size-5 stroke-[1.25]" aria-hidden />
              </div>
            )}
          </Link>
          <span className="absolute top-2 right-2 z-10 flex gap-1">
            <AddToListButton poiId={beach.id} size="sm" />
            <BeachFavoriteButton poiId={beach.id} size="sm" />
          </span>
        </div>
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

      {mapSelection ? (
        <article className="group/card hidden h-48 w-full min-w-0 overflow-hidden rounded-md border border-border bg-white sm:flex">
          <div className={cn("relative h-full w-[42%] shrink-0")}>
            <Link
              href={href}
              className={cn(photoLinkClass, "h-full")}
              aria-label={beach.name}
            >
              {photoContent}
              {photoOverlay}
            </Link>
            <span className="absolute top-2 right-2 z-10 flex gap-1">
              <AddToListButton poiId={beach.id} size="sm" />
              <BeachFavoriteButton poiId={beach.id} size="sm" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <BeachCardWeatherPanel weather={features.weather ? beach.displayWeather : null} />
            <div className={cn(DESKTOP_FOOTER_CLASS, "flex-1 border-t-0")}>
              <BeachCardDesktopName
                href={href}
                name={beach.name}
                linkClassName={clickableLinkClass}
              />
              {distanceKm != null && (
                <BeachDistanceBadge
                  distanceKm={distanceKm}
                  size="sm"
                  className="w-fit"
                />
              )}
            </div>
          </div>
        </article>
      ) : (
        /* Desktop — strict square: photo fills remainder, footer for name + distance */
        <article
          className={cn(
            "group/card hidden aspect-square w-full min-w-0 overflow-hidden rounded-md border border-border bg-white sm:grid",
            "grid-rows-[auto_minmax(0,1fr)_auto]",
            "has-[.beach-card-name:hover]:[&_.beach-card-photo_img]:scale-[1.03]",
            "has-[.beach-card-name:hover]:[&_.beach-card-photo_.beach-card-photo-tint]:bg-brand/12",
            "has-[.beach-card-name:hover]:[&_.beach-card-photo_.beach-card-photo-ring]:ring-2",
            "has-[.beach-card-name:hover]:[&_.beach-card-photo_.beach-card-photo-ring]:ring-brand/40",
            "has-[.beach-card-name:hover]:[&_.beach-card-photo_.beach-card-photo-placeholder]:text-foreground",
          )}
        >
          <BeachCardWeatherPanel weather={features.weather ? beach.displayWeather : null} />
          <div className="relative min-h-0">
            <Link
              href={href}
              className={cn(photoLinkClass, "min-h-0")}
              aria-label={beach.name}
            >
              {photoContent}
              {photoOverlay}
            </Link>
            <span className="absolute top-2 right-2 z-10 flex gap-1">
              <AddToListButton poiId={beach.id} size="sm" />
              <BeachFavoriteButton poiId={beach.id} size="sm" />
            </span>
          </div>

          <div className={DESKTOP_FOOTER_CLASS}>
            <BeachCardDesktopName
              href={href}
              name={beach.name}
              linkClassName={clickableLinkClass}
            />
            {distanceKm != null && (
              <BeachDistanceBadge distanceKm={distanceKm} size="sm" className="w-fit" />
            )}
          </div>
        </article>
      )}
    </>
  );
}
