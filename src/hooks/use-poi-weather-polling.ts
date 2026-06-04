"use client";

import { useEffect, useMemo, useRef } from "react";

import { fetchPoiWeatherBatch } from "@/lib/api/poi-weather";
import {
  chunkIds,
  poiWeatherStore,
} from "@/lib/poi-weather/poi-weather-store";
import type { PoiDto } from "@/lib/types/poi";

const POLL_INTERVAL_MS = 500;
const MAX_ATTEMPTS = 8;
const MAX_IDS_PER_REQUEST = 100;

export type PoiWeatherPollingOptions = {
  includeBeachWeather?: boolean;
  weatherDate?: string;
  enabled?: boolean;
};

export function usePoiWeatherPolling(
  ids: number[],
  options: PoiWeatherPollingOptions = {},
): void {
  const { includeBeachWeather = false, weatherDate, enabled = true } = options;

  const uniqueIds = useMemo(
    () => [...new Set(ids.filter((id) => id > 0))].sort((a, b) => a - b),
    [ids],
  );
  const idsKey = uniqueIds.join(",");

  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled || uniqueIds.length === 0) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    async function pollBatch(): Promise<boolean> {
      const batches = chunkIds(uniqueIds, MAX_IDS_PER_REQUEST);
      let allComplete = true;

      for (const batch of batches) {
        const response = await fetchPoiWeatherBatch({
          ids: batch,
          includeBeachWeather,
          weatherDate,
        });

        for (const entry of response.entries) {
          poiWeatherStore.mergeFromBatchEntry(entry);
        }

        if (!response.complete) {
          allComplete = false;
        }
      }

      return allComplete;
    }

    async function runPollCycle(): Promise<void> {
      if (cancelled || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      attempt += 1;

      try {
        const complete = await pollBatch();
        if (complete || attempt >= MAX_ATTEMPTS || cancelled) {
          return;
        }

        timeoutId = setTimeout(() => {
          void runPollCycle();
        }, POLL_INTERVAL_MS);
      } catch (error) {
        console.error("POI weather polling failed.", error);
        if (attempt < MAX_ATTEMPTS && !cancelled) {
          timeoutId = setTimeout(() => {
            void runPollCycle();
          }, POLL_INTERVAL_MS);
        }
      } finally {
        inFlightRef.current = false;
      }
    }

    void runPollCycle();

    return () => {
      cancelled = true;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled, idsKey, includeBeachWeather, uniqueIds, weatherDate]);
}

export function useSyncPoiWeatherFromSearch(pois: PoiDto[]): void {
  const poisKey = useMemo(
    () =>
      pois
        .map(
          (poi) =>
            `${poi.id}:${poi.weatherStatus ?? ""}:${poi.weather?.temperature ?? ""}:${poi.beachWeatherStatus ?? ""}`,
        )
        .join("|"),
    [pois],
  );

  useEffect(() => {
    for (const poi of pois) {
      poiWeatherStore.mergeFromPoi(poi);
    }
  }, [pois, poisKey]);
}

/** Merges search results into the weather store and polls the lightweight batch API. No UI. */
export function usePoiWeatherBackgroundSync(
  pois: PoiDto[],
  options: PoiWeatherPollingOptions = {},
): void {
  useSyncPoiWeatherFromSearch(pois);

  const ids = useMemo(() => pois.map((poi) => poi.id), [pois]);
  usePoiWeatherPolling(ids, options);
}
