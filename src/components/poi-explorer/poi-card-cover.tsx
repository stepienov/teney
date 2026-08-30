"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";

import { fetchPoiGooglePhotos } from "@/lib/api/poi-google-photos";
import { resolveOwnerMediaUrl } from "@/lib/poi-media";
import { CACHE_POLICY } from "@/lib/query/cache-policy";
import { poiGooglePhotosQueryKey } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

type PoiCardCoverProps = {
  poiId: number;
  photoUrl?: string | null;
  PlaceholderIcon: LucideIcon;
  sizes: string;
  className?: string;
  imageClassName?: string;
  placeholderIconClassName?: string;
  /** Tiny Google attribution on live Place Photos. Off for 28px table thumbs. */
  showAttribution?: boolean;
};

export function PoiCardCover({
  poiId,
  photoUrl,
  PlaceholderIcon,
  sizes,
  className,
  imageClassName,
  placeholderIconClassName,
  showAttribution = true,
}: PoiCardCoverProps) {
  const stored = resolveOwnerMediaUrl(photoUrl);
  const live = useQuery({
    queryKey: poiGooglePhotosQueryKey(poiId),
    queryFn: () => fetchPoiGooglePhotos(poiId),
    enabled: stored == null,
    staleTime: 4 * 60_000,
    gcTime: CACHE_POLICY.googlePhotos.gcTime,
    refetchOnMount: false,
  });
  const liveUrl = live.data?.photos[0]?.url ?? null;
  const src = stored ?? liveUrl;

  if (src) {
    return (
      <>
        <Image
          src={src}
          alt=""
          fill
          className={cn("object-cover", imageClassName)}
          sizes={sizes}
          unoptimized
        />
        {showAttribution && stored == null && liveUrl != null ? (
          <span className="pointer-events-none absolute right-1 bottom-1 rounded bg-black/55 px-1 py-px text-[9px] font-medium leading-none text-white">
            Google
          </span>
        ) : null}
      </>
    );
  }

  if (stored == null && live.isPending) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center text-muted-foreground",
        className,
      )}
    >
      <PlaceholderIcon
        className={cn("size-10 stroke-[1.25] sm:size-12", placeholderIconClassName)}
        aria-hidden
      />
    </div>
  );
}
