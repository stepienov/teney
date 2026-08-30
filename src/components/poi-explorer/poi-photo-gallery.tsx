"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type { GalleryPhoto } from "@/lib/poi-details/present";

export function PoiPhotoGallery({
  photos,
  alt,
}: {
  photos: GalleryPhoto[];
  alt: string;
}) {
  const t = useTranslations("poiDetails");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = photos[activeIndex] ?? photos[0];

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  if (active == null) {
    return null;
  }

  const authorName = active.authorDisplayName?.trim() || null;
  const authorUri = active.authorUri?.trim() || null;
  const mapsUri = active.googleMapsUri?.trim() || null;
  const flagUri = active.flagContentUri?.trim() || null;

  return (
    <div>
      <div className="relative aspect-[16/8] max-h-[28rem] min-h-48 w-full overflow-hidden bg-sand/40 sm:min-h-64">
        <Image
          src={active.url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 1152px"
          unoptimized
          priority
        />
        <button
          type="button"
          className="absolute inset-0"
          onClick={() => setLightboxOpen(true)}
          aria-label={alt}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs text-muted-foreground sm:px-6">
        {authorName ? (
          authorUri ? (
            <a
              href={authorUri}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              {t("photoAuthor", { name: authorName })}
            </a>
          ) : (
            <span>{t("photoAuthor", { name: authorName })}</span>
          )
        ) : null}
        {mapsUri ? (
          <a
            href={mapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sky hover:underline"
          >
            {t("photoSource")}
          </a>
        ) : (
          <span>{t("photoSource")}</span>
        )}
      </div>

      {photos.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
          {photos.map((photo, index) => (
            <li key={photo.id} className="shrink-0 py-0.5">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                data-active={index === activeIndex}
                className="photo-thumb relative block size-16 rounded-md sm:size-20"
                aria-current={index === activeIndex}
                aria-label={`${alt} ${index + 1}`}
              >
                <span className="absolute inset-0 overflow-hidden rounded-md">
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lightboxOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setLightboxOpen(false)}
            aria-label={alt}
          />
          <span className="relative z-10 block h-[min(80vh,720px)] w-[min(92vw,1100px)]">
            <Image
              src={active.url}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </span>
          <div className="relative z-10 mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/80">
            <span>{t("photoSource")}</span>
            {flagUri ? (
              <a
                href={flagUri}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
                onClick={(event) => event.stopPropagation()}
              >
                {t("reportPhoto")}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
