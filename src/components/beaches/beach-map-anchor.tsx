"use client";

import { useEffect, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import type maplibregl from "maplibre-gl";

import { cn } from "@/lib/utils";

type BeachMapAnchorProps = {
  map: maplibregl.Map;
  portalRoot: RefObject<HTMLElement | null>;
  lngLat: [number, number];
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function BeachMapAnchor({
  map,
  portalRoot,
  lngLat,
  children,
  className,
  style,
}: BeachMapAnchorProps) {
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const point = map.project(lngLat);
      const element = anchorRef.current;
      if (element == null) {
        return;
      }
      element.style.left = `${point.x}px`;
      element.style.top = `${point.y}px`;
    };

    update();
    map.on("move", update);
    map.on("zoom", update);
    map.on("resize", update);

    return () => {
      map.off("move", update);
      map.off("zoom", update);
      map.off("resize", update);
    };
  }, [lngLat, map]);

  const root = portalRoot.current;
  if (root == null) {
    return null;
  }

  return createPortal(
    <div
      ref={anchorRef}
      className={cn("absolute z-10", className)}
      style={style}
    >
      {children}
    </div>,
    root,
  );
}
