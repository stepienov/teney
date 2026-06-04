const GENERIC_SUFFIXES = [
  /\s+Valley\s*&\s*East Coast$/i,
  /\s+Volcanic Coast$/i,
  /\s+Eastern North Ridge$/i,
  /\s+Valley$/i,
  /\s+Coast$/i,
  /\s+Ridge$/i,
  /\s+Resorts$/i,
];

/** Short proper-name label for Tenerife regionDirection / poi.region strings from the API. */
export function formatRegionDisplayName(name: string | null | undefined): string {
  if (!name?.trim()) {
    return name ?? "";
  }

  let result = name.trim();

  const parenMatch = result.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const before = parenMatch[1].trim();
    const inside = parenMatch[2].trim();
    const insideIsDirection = /^(northwest|northeast|southwest|southeast|north|south|east|west)$/i.test(
      inside,
    );

    if (insideIsDirection) {
      result = before;
    } else if (/resorts|metropolitan/i.test(before) || inside.includes("-")) {
      result = inside;
    } else {
      result = before;
    }
  }

  const slashMatch = result.match(/^([^/]+)\s*\/\s*(.+)$/);
  if (slashMatch) {
    const before = slashMatch[1].trim();
    const after = slashMatch[2].trim();
    if (/metropolitan|greater|area/i.test(before)) {
      result = after;
    }
  }

  const ampMatch = result.match(/^([^&]+)\s*&/);
  if (ampMatch) {
    result = ampMatch[1].trim();
  }

  for (const pattern of GENERIC_SUFFIXES) {
    result = result.replace(pattern, "");
  }

  return result.trim() || name.trim();
}
