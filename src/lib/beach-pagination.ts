export const DEFAULT_BEACH_PAGE_SIZE = 10;
export const MOBILE_BEACH_PAGE_SIZE = 20;
export const BEACH_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export type BeachPageSize = (typeof BEACH_PAGE_SIZE_OPTIONS)[number];

export function parseBeachPageSize(value: string | null): BeachPageSize {
  const parsed = Number(value);
  if (parsed === 20 || parsed === 50) {
    return parsed;
  }
  return DEFAULT_BEACH_PAGE_SIZE;
}

/** 1-based page numbers with ellipses, e.g. 1 2 3 4 5 … 30 */
export function buildPaginationRange(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages === 1) {
    return [1];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const current = currentPage + 1;

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (current >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    current - 1,
    current,
    current + 1,
    "ellipsis",
    totalPages,
  ];
}
