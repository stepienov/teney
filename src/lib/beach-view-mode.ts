export const BEACH_VIEW_MODES = ["list", "grid", "map"] as const;

export type BeachViewMode = (typeof BEACH_VIEW_MODES)[number];
