"use client";

import { PoiExplorer } from "@/components/beaches/beaches-explorer";
import { miradoresExplorerConfig } from "@/lib/poi-categories/miradores";

export function MiradoresExplorer() {
  return <PoiExplorer config={miradoresExplorerConfig} />;
}
