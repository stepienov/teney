import {
  Building2,
  Castle,
  Droplets,
  Flower2,
  Footprints,
  Landmark,
  Leaf,
  Mountain,
  ShoppingBag,
  Store,
  Theater,
  Trees,
  Utensils,
  Waves,
  Wine,
  type LucideIcon,
} from "lucide-react";

import type { BeachFilterState } from "@/components/beaches/beach-filter-state";
import type { PoiCategoryExplorerConfig } from "@/lib/poi-categories/types";
import { poiPath } from "@/lib/poi-slug";
import { POI_CATEGORY, type PoiCategory } from "@/lib/query/keys";
import { createGenericPoiQueryFns } from "@/lib/query/generic-pois";
import { beachesExplorerConfig } from "@/lib/poi-categories/beaches";
import { miradoresExplorerConfig } from "@/lib/poi-categories/miradores";

export type PoiNavGroupId =
  | "nature"
  | "culture"
  | "food"
  | "family"
  | "shopping";

export type CatalogEntry = {
  category: PoiCategory;
  pointTypeDescription: string;
  basePath: string;
  listTitleKey: string;
  navKey: string;
  icon: LucideIcon;
  group: PoiNavGroupId;
};

export type PoiNavItem = {
  href: string;
  navKey: string;
  icon: LucideIcon;
};

export type PoiNavGroupLabelKey =
  | "natureAndLandscapes"
  | "culture"
  | "foodAndWine"
  | "family"
  | "shops";

export type PoiHomeCardKey =
  | "cardNatureTitle"
  | "cardNatureBody"
  | "ctaNature"
  | "cardCultureTitle"
  | "cardCultureBody"
  | "ctaCulture"
  | "cardFoodTitle"
  | "cardFoodBody"
  | "ctaFood"
  | "cardFamilyTitle"
  | "cardFamilyBody"
  | "ctaFamily"
  | "cardShopsTitle"
  | "cardShopsBody"
  | "ctaShops";

export type PoiNavGroup = {
  id: PoiNavGroupId;
  labelKey: PoiNavGroupLabelKey;
  homeHref: string;
  homeTitleKey: Extract<PoiHomeCardKey, `card${string}Title`>;
  homeBodyKey: Extract<PoiHomeCardKey, `card${string}Body`>;
  homeCtaKey: Extract<PoiHomeCardKey, `cta${string}`>;
  icon: LucideIcon;
  items: PoiNavItem[];
};

export const GENERIC_CATALOG: CatalogEntry[] = [
  {
    category: POI_CATEGORY.naturalPools,
    pointTypeDescription: "NATURAL_POOL",
    basePath: "/natural-pools",
    listTitleKey: "naturalPools",
    navKey: "naturalPools",
    icon: Droplets,
    group: "nature",
  },
  {
    category: POI_CATEGORY.naturalAttractions,
    pointTypeDescription: "NATURAL_ATTRACTION",
    basePath: "/natural-attractions",
    listTitleKey: "naturalAttractions",
    navKey: "naturalAttractions",
    icon: Leaf,
    group: "nature",
  },
  {
    category: POI_CATEGORY.historicalSites,
    pointTypeDescription: "HISTORICAL_SITE",
    basePath: "/historical-sites",
    listTitleKey: "historicalSites",
    navKey: "historicalSites",
    icon: Landmark,
    group: "culture",
  },
  {
    category: POI_CATEGORY.museums,
    pointTypeDescription: "MUSEUM",
    basePath: "/museums",
    listTitleKey: "museums",
    navKey: "museums",
    icon: Building2,
    group: "culture",
  },
  {
    category: POI_CATEGORY.towns,
    pointTypeDescription: "TOWN",
    basePath: "/towns",
    listTitleKey: "towns",
    navKey: "towns",
    icon: Castle,
    group: "culture",
  },
  {
    category: POI_CATEGORY.botanicalGardens,
    pointTypeDescription: "BOTANICAL_GARDEN",
    basePath: "/botanical-gardens",
    listTitleKey: "botanicalGardens",
    navKey: "botanicalGardens",
    icon: Flower2,
    group: "nature",
  },
  {
    category: POI_CATEGORY.recreationAreas,
    pointTypeDescription: "RECREATION_AREA",
    basePath: "/recreation-areas",
    listTitleKey: "recreationAreas",
    navKey: "recreationAreas",
    icon: Trees,
    group: "nature",
  },
  {
    category: POI_CATEGORY.restaurants,
    pointTypeDescription: "CANARIAN_RESTAURANT",
    basePath: "/restaurants",
    listTitleKey: "restaurants",
    navKey: "restaurants",
    icon: Utensils,
    group: "food",
  },
  {
    category: POI_CATEGORY.wineries,
    pointTypeDescription: "WINERY",
    basePath: "/wineries",
    listTitleKey: "wineries",
    navKey: "wineries",
    icon: Wine,
    group: "food",
  },
  {
    category: POI_CATEGORY.familyAttractions,
    pointTypeDescription: "FAMILY_ATTRACTION",
    basePath: "/family-attractions",
    listTitleKey: "familyAttractions",
    navKey: "familyAttractions",
    icon: Theater,
    group: "family",
  },
  {
    category: POI_CATEGORY.kidsAttractions,
    pointTypeDescription: "KIDS_ATTRACTION",
    basePath: "/kids-attractions",
    listTitleKey: "kidsAttractions",
    navKey: "kidsAttractions",
    icon: Footprints,
    group: "family",
  },
  {
    category: POI_CATEGORY.waterSports,
    pointTypeDescription: "WATER_SPORTS",
    basePath: "/water-sports",
    listTitleKey: "waterSports",
    navKey: "waterSports",
    icon: Waves,
    group: "family",
  },
  {
    category: POI_CATEGORY.shopping,
    pointTypeDescription: "SHOPPING",
    basePath: "/shopping",
    listTitleKey: "shopping",
    navKey: "shopping",
    icon: ShoppingBag,
    group: "shopping",
  },
  {
    category: POI_CATEGORY.markets,
    pointTypeDescription: "MARKET",
    basePath: "/markets",
    listTitleKey: "markets",
    navKey: "markets",
    icon: Store,
    group: "shopping",
  },
];

function toSearchBaseParams(
  filters: BeachFilterState,
  locale: string,
  nearMe: boolean,
  radiusKm: number,
) {
  return {
    locale,
    sort: filters.sort,
    sortDirection: filters.sortDirection,
    nearMe,
    radiusKm,
    name: filters.name.trim() || undefined,
    regionIds: filters.regionIds.length > 0 ? filters.regionIds : undefined,
  };
}

function configFromEntry(entry: CatalogEntry): PoiCategoryExplorerConfig {
  const queries = createGenericPoiQueryFns(
    entry.category,
    entry.pointTypeDescription,
  );
  return {
    category: entry.category,
    basePath: entry.basePath,
    messagesNamespace: "miradores",
    listTitleKey: entry.listTitleKey,
    viewStorageKey: `teney-${entry.category}-view`,
    defaultSort: "name",
    features: { weather: false, beachAttributes: false },
    poiPath: (poi) => poiPath(entry.basePath, poi),
    placeholderIcon: entry.icon,
    filtersQueryOptions: queries.filtersQueryOptions,
    searchQueryOptions: queries.searchQueryOptions,
    searchInfiniteQueryOptions: queries.searchInfiniteQueryOptions,
    mapSearchQueryOptions: queries.mapSearchQueryOptions,
    toSearchBaseParams,
  };
}

const genericConfigs = Object.fromEntries(
  GENERIC_CATALOG.map((entry) => [entry.basePath, configFromEntry(entry)]),
) as Record<string, PoiCategoryExplorerConfig>;

export function explorerConfigByPath(
  basePath: string,
): PoiCategoryExplorerConfig | undefined {
  if (basePath === "/beaches") {
    return beachesExplorerConfig;
  }
  if (basePath === "/miradores") {
    return miradoresExplorerConfig;
  }
  return genericConfigs[basePath];
}

export function catalogEntryByPath(basePath: string): CatalogEntry | undefined {
  if (basePath === "/miradores") {
    return {
      category: POI_CATEGORY.miradores,
      pointTypeDescription: "VIEWPOINT",
      basePath: "/miradores",
      listTitleKey: "miradores",
      navKey: "miradores",
      icon: Mountain,
      group: "nature",
    };
  }
  return GENERIC_CATALOG.find((e) => e.basePath === basePath);
}

function itemsForGroup(group: PoiNavGroupId): PoiNavItem[] {
  return GENERIC_CATALOG.filter((entry) => entry.group === group).map(
    (entry) => ({
      href: entry.basePath,
      navKey: entry.navKey,
      icon: entry.icon,
    }),
  );
}

export const NAV_GROUPS: PoiNavGroup[] = [
  {
    id: "nature",
    labelKey: "natureAndLandscapes",
    homeHref: "/beaches",
    homeTitleKey: "cardNatureTitle",
    homeBodyKey: "cardNatureBody",
    homeCtaKey: "ctaNature",
    icon: Trees,
    items: [
      { href: "/beaches", navKey: "beaches", icon: Waves },
      { href: "/miradores", navKey: "miradores", icon: Mountain },
      ...itemsForGroup("nature"),
    ],
  },
  {
    id: "culture",
    labelKey: "culture",
    homeHref: "/museums",
    homeTitleKey: "cardCultureTitle",
    homeBodyKey: "cardCultureBody",
    homeCtaKey: "ctaCulture",
    icon: Landmark,
    items: itemsForGroup("culture"),
  },
  {
    id: "food",
    labelKey: "foodAndWine",
    homeHref: "/restaurants",
    homeTitleKey: "cardFoodTitle",
    homeBodyKey: "cardFoodBody",
    homeCtaKey: "ctaFood",
    icon: Utensils,
    items: itemsForGroup("food"),
  },
  {
    id: "family",
    labelKey: "family",
    homeHref: "/family-attractions",
    homeTitleKey: "cardFamilyTitle",
    homeBodyKey: "cardFamilyBody",
    homeCtaKey: "ctaFamily",
    icon: Theater,
    items: itemsForGroup("family"),
  },
  {
    id: "shopping",
    labelKey: "shops",
    homeHref: "/shopping",
    homeTitleKey: "cardShopsTitle",
    homeBodyKey: "cardShopsBody",
    homeCtaKey: "ctaShops",
    icon: ShoppingBag,
    items: itemsForGroup("shopping"),
  },
];

export function isPoiExplorerPath(pathname: string): boolean {
  return NAV_GROUPS.some((group) =>
    group.items.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ),
  );
}

export function navGroupForPath(pathname: string): PoiNavGroup | undefined {
  return NAV_GROUPS.find((group) =>
    group.items.some(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ),
  );
}
