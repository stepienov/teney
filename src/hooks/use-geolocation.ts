"use client";

import { useCallback, useEffect, useState } from "react";

export type UserCoords = { lat: number; lon: number; accuracyMeters: number };

export type GeolocationPermission = "unknown" | "prompt" | "granted" | "denied";

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

export type GeolocationHandle = GeolocationState & {
  /** Browser permission state when Permissions API is available. */
  permission: GeolocationPermission;
  /** Calls navigator.geolocation.getCurrentPosition (may show native prompt if state is "prompt"). */
  request: () => void;
  /** Re-read permission (e.g. after user changes site settings). */
  refreshPermission: () => Promise<GeolocationPermission>;
};

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 20_000,
  maximumAge: 0,
};

function fetchGeolocation(commit: (next: GeolocationState) => void): void {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    commit({ status: "unsupported" });
    return;
  }

  commit({ status: "loading" });

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
    GEO_OPTIONS,
  );
}

export function useGeolocation({ enabled }: Options): GeolocationHandle {
  const [state, setState] = useState<GeolocationState>({ status: "idle" });
  const [permission, setPermission] = useState<GeolocationPermission>("unknown");

  const request = useCallback(() => {
    fetchGeolocation(setState);
  }, []);

  const refreshPermission = useCallback(async (): Promise<GeolocationPermission> => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return permission;
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      const next = result.state as GeolocationPermission;
      setPermission(next);
      return next;
    } catch {
      return permission;
    }
  }, [permission]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return;
    }

    let disposed = false;
    let permissionStatus: PermissionStatus | null = null;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (disposed) return;
        permissionStatus = result;
        setPermission(result.state as GeolocationPermission);
        result.onchange = () => {
          setPermission(result.state as GeolocationPermission);
        };
      })
      .catch(() => {
        /* Permissions API unavailable for geolocation in this browser */
      });

    return () => {
      disposed = true;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    fetchGeolocation((next) => {
      if (!cancelled) {
        setState(next);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { ...state, permission, request, refreshPermission };
}
