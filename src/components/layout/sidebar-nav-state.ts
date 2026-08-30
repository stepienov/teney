import {
  navGroupForPath,
  type PoiNavGroupId,
} from "@/lib/poi-categories/catalog";

export type HomeTreeGroupKey = "nature" | "culture" | "food" | "family" | "shops";

export type HomeTreeState = {
  home: boolean;
} & Record<HomeTreeGroupKey, boolean>;

const GROUP_TREE_KEY: Record<PoiNavGroupId, HomeTreeGroupKey> = {
  nature: "nature",
  culture: "culture",
  food: "food",
  family: "family",
  shopping: "shops",
};

export function collapsedHomeTree(): HomeTreeState {
  return {
    home: false,
    nature: false,
    culture: false,
    food: false,
    family: false,
    shops: false,
  };
}

export function treeKeyForGroup(id: PoiNavGroupId): HomeTreeGroupKey {
  return GROUP_TREE_KEY[id];
}

/** Initial Home tree — only used on first mount. */
export function defaultHomeTree(pathname: string): HomeTreeState {
  const collapsed = collapsedHomeTree();
  if (pathname === "/") {
    return collapsed;
  }
  const group = navGroupForPath(pathname);
  if (group == null) {
    return collapsed;
  }
  return {
    ...collapsed,
    home: true,
    [treeKeyForGroup(group.id)]: true,
  };
}

export function mergeHomeTree(
  partial: Partial<HomeTreeState> | null | undefined,
): HomeTreeState {
  return { ...collapsedHomeTree(), ...partial };
}

export function toggleHomeTree(
  state: HomeTreeState,
  key: keyof HomeTreeState,
): HomeTreeState {
  const next = !state[key];
  if (key === "home" && !next) {
    return collapsedHomeTree();
  }
  return { ...state, [key]: next };
}
