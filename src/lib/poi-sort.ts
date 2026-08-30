export function isDescDefaultCatalogSort(
  sort: string,
  weatherEnabled: boolean,
): boolean {
  return (
    sort === "quality" ||
    sort === "popularity" ||
    sort === "rating" ||
    sort === "reviewCount" ||
    (weatherEnabled && sort === "weather.tempMax")
  );
}

export function normalizeCatalogSortParam(
  sort: string | null,
  defaultSort: string,
): string {
  const value = sort ?? defaultSort;
  if (value === "municipality.name" || value === "region.name") {
    return "name";
  }
  if (value === "windSpeed" || value === "wind") {
    return "weather.windSpeed";
  }
  if (value === "rating") {
    return "quality";
  }
  if (value === "reviewCount") {
    return "popularity";
  }
  return value;
}
