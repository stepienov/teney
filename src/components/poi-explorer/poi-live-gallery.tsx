import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";

import { PoiPhotoFallback } from "@/components/poi-explorer/poi-photo-fallback";
import {
  PoiAddressRow,
  PoiLiveContactRow,
  PoiOpeningHours,
  PoiPriceLevel,
} from "@/components/poi-explorer/poi-live-details";
import { PoiPhotoGallery } from "@/components/poi-explorer/poi-photo-gallery";
import { getPoiGooglePhotosCached } from "@/lib/api/poi-google-photos-cached";
import {
  googlePhotosToGallery,
  liveContactFromGooglePhotos,
} from "@/lib/poi-details/present";

export async function PoiLiveGallery({
  poiId,
  name,
  icon: Icon,
  emptyLabel,
}: {
  poiId: number;
  name: string;
  icon?: LucideIcon;
  emptyLabel: string;
}) {
  const live = await getPoiGooglePhotosCached(poiId);
  const photos = googlePhotosToGallery(live.photos);
  if (photos.length === 0) {
    return <PoiPhotoFallback icon={Icon} label={emptyLabel} />;
  }
  return <PoiPhotoGallery photos={photos} alt={name} />;
}

export async function PoiLiveContactAndFacts({
  poiId,
  mapsUrl,
}: {
  poiId: number;
  mapsUrl: string | null;
}) {
  const [live, tDetails] = await Promise.all([
    getPoiGooglePhotosCached(poiId),
    getTranslations("poiDetails"),
  ]);
  const contact = liveContactFromGooglePhotos(live);
  const priceLevelKey =
    contact.priceLevel != null ? `priceLevels.${contact.priceLevel}` : null;
  const priceLevelDisplay =
    priceLevelKey != null && tDetails.has(priceLevelKey)
      ? tDetails(priceLevelKey)
      : contact.priceLevel?.replaceAll("_", " ") ?? null;

  return (
    <div className="space-y-4">
      <PoiLiveContactRow
        phone={contact.phone}
        website={contact.website}
        websiteLabel={tDetails("website")}
      />
      <PoiAddressRow
        address={contact.formattedAddress}
        mapsUrl={mapsUrl}
        mapsLabel={tDetails("openInMaps")}
      />
      <PoiOpeningHours
        rows={contact.openingHours}
        label={tDetails("openingHours")}
      />
      <PoiPriceLevel
        label={tDetails("priceLevel")}
        value={priceLevelDisplay}
      />
    </div>
  );
}
