import { apiPost } from "@/lib/api-client";
import type {
  PoiWeatherBatchRequest,
  PoiWeatherBatchResponse,
} from "@/lib/types/poi";

export async function fetchPoiWeatherBatch(
  request: PoiWeatherBatchRequest,
): Promise<PoiWeatherBatchResponse> {
  return apiPost<PoiWeatherBatchResponse>("/api/pois/weather/current", request);
}
