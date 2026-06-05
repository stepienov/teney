import { apiJson } from "@/lib/api-client";
import { searchPois } from "@/lib/api/poi-search";
import type { PoiDto } from "@/lib/types/poi";

export { searchBeaches } from "@/lib/api/beaches-search";
export type {
  BeachPageWithDistances,
  BeachSearchOptions,
} from "@/lib/api/beaches-search";

type BeachViewDetail = Pick<
  PoiDto,
  "id" | "attributes" | "beachDetails" | "visitorLimit" | "openingHours" | "address"
>;

export async function fetchBeachById(options: {
  id: number;
  locale: string;
  weatherDate?: string;
}): Promise<PoiDto | null> {
  async function fetchBeachViewDetail(): Promise<BeachViewDetail | null> {
    const beaches = await apiJson<BeachViewDetail[]>(
      `/api/beaches?ids=${options.id}`,
    );

    return beaches[0] ?? null;
  }

  async function enrichBeach(beach: PoiDto | null): Promise<PoiDto | null> {
    if (beach == null) {
      return null;
    }

    try {
      const detail = await fetchBeachViewDetail();

      if (detail == null) {
        return beach;
      }

      return {
        ...beach,
        attributes: detail.attributes ?? beach.attributes,
        beachDetails: detail.beachDetails ?? beach.beachDetails,
        visitorLimit: detail.visitorLimit ?? beach.visitorLimit,
        openingHours: detail.openingHours ?? beach.openingHours,
        address: detail.address ?? beach.address,
      };
    } catch (error) {
      console.error("Failed to enrich beach details with /api/beaches.", error);
      return beach;
    }
  }

  async function fetchMatchingBeach(includeBeachWeather: boolean) {
    const response = await searchPois({
      filters: {
        id: options.id,
      },
      locale: options.locale,
      size: 1,
      includeBeachWeather,
      weatherDate: options.weatherDate,
    });

    return response.content[0] ?? null;
  }

  try {
    return enrichBeach(await fetchMatchingBeach(true));
  } catch (error) {
    console.error(
      "Failed to load extended beach weather; falling back to basic beach details.",
      error,
    );
  }

  return enrichBeach(await fetchMatchingBeach(false));
}
