const NATURE_ROUTES = ["/beaches", "/miradores", "/natural-pools"] as const;

export type HomeTreeState = {
  home: boolean;
  nature: boolean;
};

export function isNaturePath(pathname: string): boolean {
  return NATURE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/** Initial Home tree — only used on first mount. */
export function defaultHomeTree(pathname: string): HomeTreeState {
  if (pathname === "/" || !isNaturePath(pathname)) {
    return { home: false, nature: false };
  }
  return { home: true, nature: true };
}

export function toggleHomeTree(
  state: HomeTreeState,
  key: keyof HomeTreeState,
): HomeTreeState {
  const next = !state[key];
  if (key === "home" && !next) {
    return { home: false, nature: false };
  }
  return { ...state, [key]: next };
}
