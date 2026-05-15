"use client";

import { useEffect, useState } from "react";

export type UserCoords = { lat: number; lon: number };

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
      setState({ status: "idle" });
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unsupported" });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "ready",
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setState({ status: "denied" });
          return;
        }
        setState({
          status: "error",
          message: error.message || "Geolocation failed",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 20_000,
        maximumAge: 5 * 60_000,
      },
    );
  }, [enabled]);

  return state;
}
