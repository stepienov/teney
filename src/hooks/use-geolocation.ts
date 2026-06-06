"use client";

import { useCallback, useEffect, useState } from "react";

import {
  readGeoCacheEntry,
  writeGeoCache,
} from "@/lib/cache/geo-cache";
import { CACHE_POLICY } from "@/lib/query/cache-policy";

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
  enableHighAccuracy: false,
  timeout: 15_000,
  maximumAge: CACHE_POLICY.geo.maxAgeMs,
};

function fetchGeolocation(commit: (next: GeolocationState) => void): void {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    commit({ status: "unsupported" });
    return;
  }

  commit({ status: "loading" });

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords: UserCoords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
      };
      writeGeoCache(coords);
      commit({
        status: "ready",
        coords,
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

function readCachedReadyState(): GeolocationState {
  const cached = readGeoCacheEntry();
  if (cached == null) {
    return { status: "idle" };
  }

  return { status: "ready", coords: cached.coords };
}

export function useGeolocation({ enabled }: Options): GeolocationHandle {
  const [state, setState] = useState<GeolocationState>(readCachedReadyState);
  const [permission, setPermission] = useState<GeolocationPermission>("unknown");

  const request = useCallback(() => {
    const cached = readGeoCacheEntry();
    if (cached != null) {
      setState({ status: "ready", coords: cached.coords });
      if (cached.fresh) {
        return;
      }
    }

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
