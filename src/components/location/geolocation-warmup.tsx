"use client";

import { useGeolocation } from "@/hooks/use-geolocation";

export function GeolocationWarmup() {
  useGeolocation({ enabled: true });

  return null;
}
