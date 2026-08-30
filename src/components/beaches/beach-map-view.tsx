"use client";

import maplibregl from "maplibre-gl";
import { Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BeachCard } from "@/components/beaches/beach-card";
import { BeachMapAnchor } from "@/components/beaches/beach-map-anchor";
import { BeachMapPoiHover } from "@/components/beaches/beach-map-poi-hover";
import { BeachMapSelectionCompact } from "@/components/beaches/beach-map-selection-compact";
import { usePoiCategoryConfig } from "@/components/poi-explorer/poi-category-context";
import type { UserCoords } from "@/hooks/use-geolocation";
import { usePrefersHover } from "@/hooks/use-prefers-hover";
import { resolveBeachDistanceKm } from "@/lib/beach-distance";
import type { PoiDto } from "@/lib/types/poi";
import { cn } from "@/lib/utils";

import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const ISLAND_CENTER: [number, number] = [-16.52, 28.28];

/** ~100 km in longitude at island latitude (~28°N). */
const MAP_LON_MARGIN_DEG =
  100 / (111.32 * Math.cos((ISLAND_CENTER[1] * Math.PI) / 180));

/** ~50 km in latitude (N/S). */
const MAP_LAT_MARGIN_DEG = 50 / 111.32;

/** Island extent (Teno → Anaga, south tip → north coast). */
const TENERIFE_FIT_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-16.98, 27.96],
  [-16.04, 28.62],
];

/** Pan limits — island margin + ~100 km ocean E/W, ~50 km N/S. */
const MAP_WEST_LIMIT = -17.12 - MAP_LON_MARGIN_DEG;
const MAP_EAST_LIMIT = -15.78 + MAP_LON_MARGIN_DEG;
const MAP_LAT_SPAN = 0.98 + 2 * MAP_LAT_MARGIN_DEG;

const MAP_SELECTION_TILE_WIDTH_CLASS = "w-96 lg:w-[26rem]";

/** Beach name labels on touch devices — hidden when zoomed out. */
const MOBILE_LABEL_MIN_ZOOM = 10;

const BEACH_LABELS_LAYER_ID = "beaches-labels";
const USER_LOCATION_SOURCE_ID = "user-location";
const USER_LOCATION_ACCURACY_LAYER_ID = "user-location-accuracy";
const USER_LOCATION_DOT_LAYER_ID = "user-location-dot";
const USER_LOCATION_ZOOM = 13;

type HoverTarget = {
  beach: PoiDto;
  lngLat: [number, number];
};

type BeachMapViewProps = {
  beaches: PoiDto[];
  locale: string;
  distancesKm?: Map<number, number>;
  userCoords?: UserCoords;
  onRequestLocation?: () => void;
  className?: string;
};

function userLocationGeoJson(
  coords: UserCoords | undefined,
): GeoJSON.FeatureCollection {
  if (coords == null) {
    return { type: "FeatureCollection", features: [] };
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coords.lon, coords.lat],
        },
        properties: {
          accuracyMeters: coords.accuracyMeters,
        },
      },
    ],
  };
}

function addUserLocationLayers(
  map: maplibregl.Map,
  coords: UserCoords | undefined,
) {
  if (map.getSource(USER_LOCATION_SOURCE_ID) != null) {
    return;
  }

  map.addSource(USER_LOCATION_SOURCE_ID, {
    type: "geojson",
    data: userLocationGeoJson(coords),
  });

  map.addLayer({
    id: USER_LOCATION_ACCURACY_LAYER_ID,
    type: "circle",
    source: USER_LOCATION_SOURCE_ID,
    paint: {
      "circle-radius": 16,
      "circle-color": "#2563eb",
      "circle-opacity": 0.18,
    },
  });

  map.addLayer({
    id: USER_LOCATION_DOT_LAYER_ID,
    type: "circle",
    source: USER_LOCATION_SOURCE_ID,
    paint: {
      "circle-radius": 7,
      "circle-color": "#2563eb",
      "circle-stroke-width": 3,
      "circle-stroke-color": "#ffffff",
    },
  });
}

function updateUserLocationSource(
  map: maplibregl.Map,
  coords: UserCoords | undefined,
) {
  const source = map.getSource(USER_LOCATION_SOURCE_ID) as
    | maplibregl.GeoJSONSource
    | undefined;
  source?.setData(userLocationGeoJson(coords));
}

function beachesToGeoJson(
  beaches: PoiDto[],
  locale: string,
  poiPath: (poi: Pick<PoiDto, "id" | "name">) => string,
  selectedBeachId: number | null = null,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: beaches
      .filter((beach) => beach.coordinates != null)
      .map((beach) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            beach.coordinates!.longitude,
            beach.coordinates!.latitude,
          ],
        },
        properties: {
          id: beach.id,
          name: beach.name,
          href: `/${locale}${poiPath(beach)}`,
          labelPriority: beach.id === selectedBeachId ? 1_000 : 0,
        },
      })),
  };
}

function resolveLabelFonts(map: maplibregl.Map): string[] {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== "symbol") {
      continue;
    }

    const textFont = layer.layout?.["text-font"];
    if (
      Array.isArray(textFont) &&
      textFont.length > 0 &&
      typeof textFont[0] === "string"
    ) {
      return textFont as string[];
    }
  }

  return ["Noto Sans Regular", "Open Sans Regular", "Arial Unicode MS Regular"];
}

function addBeachLabelsLayer(
  map: maplibregl.Map,
  showOnTouchDevices: boolean,
) {
  if (map.getLayer(BEACH_LABELS_LAYER_ID) != null) {
    return;
  }

  map.addLayer({
    id: BEACH_LABELS_LAYER_ID,
    type: "symbol",
    source: "beaches",
    minzoom: MOBILE_LABEL_MIN_ZOOM,
    layout: {
      visibility: showOnTouchDevices ? "visible" : "none",
      "text-field": ["get", "name"],
      "text-font": resolveLabelFonts(map),
      "text-size": 11,
      "text-max-width": 8,
      "text-line-height": 1.25,
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-optional": true,
      "text-padding": 4,
      "text-variable-anchor": [
        "top",
        "bottom",
        "left",
        "right",
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
      "text-radial-offset": 0.85,
      "text-justify": "auto",
      "symbol-sort-key": ["get", "labelPriority"],
    },
    paint: {
      "text-color": "#27272a",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.75,
      "text-halo-blur": 0.25,
    },
  });
}

function setBeachLabelsVisibility(map: maplibregl.Map, visible: boolean) {
  if (map.getLayer(BEACH_LABELS_LAYER_ID) == null) {
    return;
  }

  map.setLayoutProperty(
    BEACH_LABELS_LAYER_ID,
    "visibility",
    visible ? "visible" : "none",
  );
}

function findBeachByFeatureId(
  beaches: PoiDto[],
  featureId: unknown,
): PoiDto | undefined {
  const id = Number(featureId);
  if (!Number.isFinite(id)) {
    return undefined;
  }
  return beaches.find((beach) => beach.id === id);
}

/** Default frame — whole coastline + sea margin. */
const FIT_PADDING_RATIO = 0.1;
/** Furthest zoom-out — full island with extra breathing room. */
const MIN_ZOOM_PADDING_RATIO = 0.18;

function tenerifeFitPadding(
  container: HTMLElement,
  ratio: number,
): maplibregl.PaddingOptions {
  const { clientWidth: width, clientHeight: height } = container;
  const pad = Math.round(Math.min(width, height) * ratio);
  return { top: pad, bottom: pad, left: pad, right: pad };
}

function computeMapMaxBounds(): maplibregl.LngLatBoundsLike {
  const [, centerLat] = ISLAND_CENTER;
  const latHalf = MAP_LAT_SPAN / 2;

  return [
    [MAP_WEST_LIMIT, centerLat - latHalf],
    [MAP_EAST_LIMIT, centerLat + latHalf],
  ];
}

function applyMapRegion(map: maplibregl.Map, container: HTMLElement) {
  const { clientWidth: width, clientHeight: height } = container;
  if (width < 48 || height < 48) {
    return;
  }

  map.resize();
  map.setMaxBounds(computeMapMaxBounds());

  const camera = map.cameraForBounds(TENERIFE_FIT_BOUNDS, {
    padding: tenerifeFitPadding(container, MIN_ZOOM_PADDING_RATIO),
    maxZoom: 14,
  });
  if (camera?.zoom != null) {
    map.setMinZoom(Math.max(6, camera.zoom - 0.5));
  }
}

function fitTenerifeInView(map: maplibregl.Map, container: HTMLElement) {
  const { clientWidth: width, clientHeight: height } = container;
  if (width < 48 || height < 48) {
    return;
  }

  map.resize();

  const camera = map.cameraForBounds(TENERIFE_FIT_BOUNDS, {
    padding: tenerifeFitPadding(container, FIT_PADDING_RATIO),
    maxZoom: 14,
  });
  if (camera?.center != null && camera.zoom != null) {
    map.jumpTo({ center: camera.center, zoom: camera.zoom, bearing: 0, pitch: 0 });
  }
}

export function BeachMapView({
  beaches,
  locale,
  distancesKm,
  userCoords,
  onRequestLocation,
  className,
}: BeachMapViewProps) {
  const { messagesNamespace, poiPath } = usePoiCategoryConfig();
  const t = useTranslations(messagesNamespace);
  const categoryLabel = t("pageTitle");
  const prefersHover = usePrefersHover();
  const prefersHoverRef = useRef(prefersHover);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRootRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const beachesRef = useRef(beaches);
  const userCoordsRef = useRef(userCoords);
  const selectedBeachIdRef = useRef<number | null>(null);
  const locatePendingRef = useRef(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [hoverTarget, setHoverTarget] = useState<HoverTarget | null>(null);
  const [selectedBeachId, setSelectedBeachId] = useState<number | null>(null);

  const flyToUserLocation = useCallback((coords: UserCoords) => {
    const map = mapRef.current;
    if (map == null) {
      return;
    }

    map.flyTo({
      center: [coords.lon, coords.lat],
      zoom: USER_LOCATION_ZOOM,
      duration: 800,
    });
  }, []);
  const flyToUserLocationRef = useRef(flyToUserLocation);

  useEffect(() => {
    flyToUserLocationRef.current = flyToUserLocation;
  }, [flyToUserLocation]);

  const handleLocateClick = useCallback(() => {
    const coords = userCoordsRef.current;
    if (coords != null) {
      flyToUserLocation(coords);
      return;
    }

    locatePendingRef.current = true;
    onRequestLocation?.();
  }, [flyToUserLocation, onRequestLocation]);

  useEffect(() => {
    beachesRef.current = beaches;
  }, [beaches]);

  useEffect(() => {
    userCoordsRef.current = userCoords;
  }, [userCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (map == null || !map.isStyleLoaded()) {
      return;
    }

    updateUserLocationSource(map, userCoords);

    if (userCoords != null && locatePendingRef.current) {
      locatePendingRef.current = false;
      flyToUserLocation(userCoords);
    }
  }, [userCoords, flyToUserLocation]);

  useEffect(() => {
    selectedBeachIdRef.current = selectedBeachId;
  }, [selectedBeachId]);

  useEffect(() => {
    prefersHoverRef.current = prefersHover;

    const map = mapRef.current;
    if (map == null || !map.isStyleLoaded()) {
      return;
    }

    setBeachLabelsVisibility(map, !prefersHover);
  }, [prefersHover]);

  useEffect(() => {
    const container = containerRef.current;
    const mapRoot = overlayRootRef.current;
    if (container == null || mapRoot == null) {
      return;
    }

    let cancelled = false;
    let isProgrammaticMove = false;
    const userAdjustedViewRef = { current: false };

    if (container.clientHeight < 48) {
      container.style.minHeight = "24rem";
    }

    const map = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: ISLAND_CENTER,
      zoom: 9,
      minZoom: 7,
      maxZoom: 14,
      trackResize: true,
    });

    map.on("error", (event) => {
      if (event.error) {
        console.warn("MapLibre error", event.error);
      }
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    mapRef.current = map;
    setMapInstance(map);

    const applyDefaultFrame = () => {
      if (cancelled || !map.isStyleLoaded()) {
        return;
      }
      isProgrammaticMove = true;
      applyMapRegion(map, container);
      fitTenerifeInView(map, container);
    };

    map.on("moveend", () => {
      isProgrammaticMove = false;
    });

    map.on("dragstart", () => {
      if (!isProgrammaticMove) {
        userAdjustedViewRef.current = true;
      }
    });

    map.on("zoomstart", (event) => {
      if (!isProgrammaticMove && event.originalEvent != null) {
        userAdjustedViewRef.current = true;
      }
    });

    const clearHover = () => {
      setHoverTarget(null);
      map.getCanvas().style.cursor = "";
    };

    let poiEventsBound = false;

    const addPoiLayers = () => {
      if (cancelled) {
        return;
      }

      if (map.getSource("beaches") == null) {
        map.addSource("beaches", {
          type: "geojson",
          data: beachesToGeoJson(
            beachesRef.current,
            locale,
            poiPath,
            selectedBeachIdRef.current,
          ),
        });

        map.addLayer({
          id: "beaches-points",
          type: "circle",
          source: "beaches",
          paint: {
            "circle-radius": 8,
            "circle-color": "#f8a28c",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        try {
          addBeachLabelsLayer(map, !prefersHoverRef.current);
        } catch (error) {
          console.warn("Beach map labels skipped", error);
        }
        addUserLocationLayers(map, userCoordsRef.current);
      }

      if (!poiEventsBound) {
        poiEventsBound = true;

        map.on("click", USER_LOCATION_DOT_LAYER_ID, () => {
          const coords = userCoordsRef.current;
          if (coords != null) {
            flyToUserLocationRef.current(coords);
          }
        });

        map.on("mouseenter", USER_LOCATION_DOT_LAYER_ID, () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", USER_LOCATION_DOT_LAYER_ID, () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("mousemove", (event) => {
          if (!prefersHoverRef.current || map.getLayer("beaches-points") == null) {
            return;
          }

          const features = map.queryRenderedFeatures(event.point, {
            layers: ["beaches-points"],
          });
          const feature = features[0];

          if (feature?.geometry?.type !== "Point") {
            setHoverTarget(null);
            map.getCanvas().style.cursor = "";
            return;
          }

          const beach = findBeachByFeatureId(
            beachesRef.current,
            feature.properties?.id,
          );
          if (beach == null) {
            setHoverTarget(null);
            map.getCanvas().style.cursor = "";
            return;
          }

          setHoverTarget({
            beach,
            lngLat: feature.geometry.coordinates as [number, number],
          });
          map.getCanvas().style.cursor = "pointer";
        });

        container.addEventListener("mouseleave", clearHover);

        map.on("click", (event) => {
          if (map.getLayer("beaches-points") == null) {
            return;
          }

          const features = map.queryRenderedFeatures(event.point, {
            layers: ["beaches-points"],
          });
          const feature = features[0];

          if (feature?.geometry?.type !== "Point") {
            setSelectedBeachId(null);
            return;
          }

          const beach = findBeachByFeatureId(
            beachesRef.current,
            feature.properties?.id,
          );
          if (beach == null) {
            setSelectedBeachId(null);
            return;
          }

          setSelectedBeachId(beach.id);
        });
      }

      applyDefaultFrame();
      window.requestAnimationFrame(applyDefaultFrame);
      map.once("idle", applyDefaultFrame);
    };

    map.on("load", addPoiLayers);

    const resizeObserver = new ResizeObserver(() => {
      if (cancelled) {
        return;
      }
      map.resize();
      applyMapRegion(map, container);
      if (userAdjustedViewRef.current) {
        return;
      }
      isProgrammaticMove = true;
      fitTenerifeInView(map, container);
    });
    resizeObserver.observe(mapRoot);

    return () => {
      cancelled = true;
      container.removeEventListener("mouseleave", clearHover);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
      setHoverTarget(null);
      setSelectedBeachId(null);
    };
  }, [locale]);

  useEffect(() => {
    const map = mapRef.current;
    if (map == null || !map.isStyleLoaded()) {
      return;
    }

    const source = map.getSource("beaches") as maplibregl.GeoJSONSource | undefined;
    source?.setData(beachesToGeoJson(beaches, locale, poiPath, selectedBeachId));
  }, [beaches, locale, poiPath, selectedBeachId]);

  const selectedBeach = useMemo(() => {
    if (selectedBeachId == null) {
      return null;
    }
    return beaches.find((beach) => beach.id === selectedBeachId) ?? null;
  }, [beaches, selectedBeachId]);

  const selectedDistanceKm =
    selectedBeach == null
      ? undefined
      : resolveBeachDistanceKm(selectedBeach, distancesKm, userCoords);

  return (
    <div
      className={cn(
        "beach-map relative min-h-[24rem] w-full overflow-hidden",
        className,
      )}
    >
      <div
        ref={overlayRootRef}
        className="absolute inset-0 overflow-visible"
      >
        <div
          ref={containerRef}
          className="beach-map absolute inset-0 overflow-hidden rounded-lg border border-border bg-muted"
        />

        <button
          type="button"
          onClick={handleLocateClick}
          className={cn(
            "absolute top-[4.75rem] right-2.5 z-10 flex size-[29px] items-center justify-center",
            "rounded border border-border bg-background text-foreground shadow-sm",
            "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label={t("mapLocateMe")}
          title={t("mapLocateMe")}
        >
          <Navigation className="size-4" aria-hidden />
        </button>

        {selectedBeach != null ? (
          <div className="pointer-events-auto absolute inset-x-0 bottom-2 z-50 flex justify-center px-2 sm:bottom-3">
            <div className={cn("min-w-0 max-w-full", MAP_SELECTION_TILE_WIDTH_CLASS)}>
              <div className="sm:hidden">
                <BeachMapSelectionCompact
                  beach={selectedBeach}
                  distanceKm={selectedDistanceKm}
                />
              </div>
              <div className="hidden sm:block">
                <BeachCard
                  beach={selectedBeach}
                  distanceKm={selectedDistanceKm}
                  mapSelection
                />
              </div>
            </div>
          </div>
        ) : null}

        {prefersHover && mapInstance != null && hoverTarget != null ? (
          <BeachMapAnchor
            map={mapInstance}
            portalRoot={overlayRootRef}
            lngLat={hoverTarget.lngLat}
            className="pointer-events-none z-[60]"
            style={{ transform: "translate(-50%, calc(-100% - 10px))" }}
          >
            <BeachMapPoiHover
              category={categoryLabel}
              name={hoverTarget.beach.name}
            />
          </BeachMapAnchor>
        ) : null}
      </div>
    </div>
  );
}
