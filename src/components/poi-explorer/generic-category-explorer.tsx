"use client";

import { PoiExplorer } from "@/components/beaches/beaches-explorer";
import { explorerConfigByPath } from "@/lib/poi-categories/catalog";

export function GenericCategoryExplorer({ basePath }: { basePath: string }) {
  const config = explorerConfigByPath(basePath);
  if (!config) {
    return null;
  }
  return <PoiExplorer config={config} />;
}
