"use client";

import { useEffect, useState } from "react";

export type UserCoords = { lat: number; lon: number; accuracyMeters: number };

export type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "unsupported" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | { status: "ready"; coords: UserCoords };

type Options = {
  enabled: boolean;
};

export function useGeolocation({ enabled }: Options): GeolocationState {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const commit = (next: GeolocationState) => {
      if (!cancelled) {
        setState(next);
      }
    };
    const commitAsync = (next: GeolocationState) => {
      queueMicrotask(() => commit(next));
    };

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      commitAsync({ status: "unsupported" });
      return () => {
        cancelled = true;
      };
    }

    commitAsync({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        commit({
          status: "ready",
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
          },
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          commit({ status: "denied" });
          return;
        }
        commit({
          status: "error",
          message: error.message || "Geolocation failed",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 20_000,
        maximumAge: 30_000,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return enabled ? state : { status: "idle" };
}
