"use client";

import { createContext, useContext, type ReactNode } from "react";

import { beachesExplorerConfig } from "@/lib/poi-categories/beaches";
import type { PoiCategoryExplorerConfig } from "@/lib/poi-categories/types";

const PoiCategoryContext =
  createContext<PoiCategoryExplorerConfig>(beachesExplorerConfig);

export function PoiCategoryProvider({
  config,
  children,
}: {
  config: PoiCategoryExplorerConfig;
  children: ReactNode;
}) {
  return (
    <PoiCategoryContext.Provider value={config}>{children}</PoiCategoryContext.Provider>
  );
}

export function usePoiCategoryConfig(): PoiCategoryExplorerConfig {
  return useContext(PoiCategoryContext);
}
