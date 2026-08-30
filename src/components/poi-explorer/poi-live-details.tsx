import type { ReactNode } from "react";
import { Globe, Phone, Star } from "lucide-react";

import type { PlacePopularity, PlaceQuality } from "@/lib/types/poi";
import type { OpeningHourRow } from "@/lib/poi-details/present";
import { telHref } from "@/lib/poi-details/present";
import { cn } from "@/lib/utils";

const FEATURE_TAG_CLASS =
  "inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-ink";

export function FeatureTag({
  children,
  href,
}: {
  children: ReactNode;
  href?: string;
}) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={FEATURE_TAG_CLASS}
      >
        {children}
      </a>
    );
  }
  return <span className={FEATURE_TAG_CLASS}>{children}</span>;
}

export function FactCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-coral">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-line font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

function qualityStars(value: PlaceQuality): number {
  if (value === "GREAT") return 3;
  if (value === "DECENT") return 2;
  return 1;
}

function popularityStars(value: PlacePopularity): number {
  if (value === "PACKED") return 3;
  if (value === "KNOWN") return 2;
  return 1;
}

function StarRow({ filled }: { filled: number }) {
  return (
    <span className="flex gap-1">
      {([1, 2, 3] as const).map((index) => {
        const on = index <= filled;
        return (
          <Star
            key={index}
            className={cn(
              "size-5",
              on
                ? "fill-coral text-coral"
                : "fill-transparent text-coral",
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        );
      })}
    </span>
  );
}

export function PoiRatingMeters({
  quality,
  popularity,
  ratingLabel,
  popularityLabel,
  sourceLabel,
}: {
  quality: PlaceQuality | null | undefined;
  popularity: PlacePopularity | null | undefined;
  ratingLabel: string;
  popularityLabel: string;
  sourceLabel: string;
}) {
  if (quality == null && popularity == null) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="grid w-fit grid-cols-[max-content_max-content] items-center gap-x-4 gap-y-2">
        {quality != null ? (
          <>
            <span className="text-sm font-medium text-foreground">
              {ratingLabel}
            </span>
            <span aria-label={`${ratingLabel}: ${qualityStars(quality)} / 3`}>
              <StarRow filled={qualityStars(quality)} />
            </span>
          </>
        ) : null}
        {popularity != null ? (
          <>
            <span className="text-sm font-medium text-foreground">
              {popularityLabel}
            </span>
            <span
              aria-label={`${popularityLabel}: ${popularityStars(popularity)} / 3`}
            >
              <StarRow filled={popularityStars(popularity)} />
            </span>
          </>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">{sourceLabel}</p>
    </div>
  );
}

const contactChipClass =
  "inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-muted";

export function PoiLiveContactRow({
  phone,
  website,
  websiteLabel,
}: {
  phone: string | null;
  website: string | null;
  websiteLabel: string;
}) {
  if (!phone && !website) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {phone ? (
        <a href={telHref(phone)} className={contactChipClass}>
          <Phone className="size-3.5" aria-hidden />
          {phone}
        </a>
      ) : null}
      {website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className={contactChipClass}
        >
          <Globe className="size-3.5" aria-hidden />
          {websiteLabel}
        </a>
      ) : null}
    </div>
  );
}

const mapsLinkClass =
  "inline shrink-0 text-sm font-semibold text-sky hover:underline";

export function PoiAddressRow({
  address,
  mapsUrl,
  mapsLabel,
}: {
  address: string | null;
  mapsUrl: string | null;
  mapsLabel: string;
}) {
  if (!address && !mapsUrl) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
      {mapsUrl ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={mapsLinkClass}
        >
          {mapsLabel}
        </a>
      ) : null}
      {address ? (
        <p className="min-w-0 truncate text-sm text-foreground" title={address}>
          {address}
        </p>
      ) : null}
    </div>
  );
}

export function PoiOpeningHours({
  rows,
  label,
}: {
  rows: OpeningHourRow[] | null;
  label: string;
}) {
  if (rows == null || rows.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-coral">
        {label}
      </p>
      <dl className="mt-2 grid w-fit grid-cols-[max-content_max-content] items-baseline gap-x-6 gap-y-1 text-sm text-foreground">
        {rows.map((row, index) => (
          <div key={`${row.day}-${index}`} className="contents">
            <dt className="pr-1 text-muted-foreground">{row.day}</dt>
            <dd className="tabular-nums">{row.hours}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PoiPriceLevel({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (value == null) {
    return null;
  }

  return (
    <p className="text-sm text-foreground">
      <span className="text-muted-foreground">{label}: </span>
      {value}
    </p>
  );
}
