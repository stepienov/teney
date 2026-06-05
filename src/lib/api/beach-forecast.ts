import { apiJson } from "@/lib/api-client";
import type { BeachForecastWeather } from "@/lib/types/beach-forecast";

export async function fetchBeachForecastWeather(
  beachId: number,
): Promise<BeachForecastWeather | null> {
  try {
    return await apiJson<BeachForecastWeather>(`/api/beaches/${beachId}/weather`);
  } catch (error) {
    console.error("Failed to load beach forecast weather.", error);
    return null;
  }
}
