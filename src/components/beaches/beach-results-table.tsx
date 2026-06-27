import { useTranslations } from "next-intl";

import { BeachMobileListRow } from "@/components/beaches/beach-mobile-list-row";
import { BeachTableRow } from "@/components/beaches/beach-table-row";
import type { BeachFilterState } from "@/components/beaches/beach-filter-state";
import { resolveBeachDistanceKm } from "@/lib/beach-distance";
import type { UserCoords } from "@/hooks/use-geolocation";
import { usePoiCategoryConfig } from "@/components/poi-explorer/poi-category-context";
import type { PoiDto } from "@/lib/types/poi";

type BeachResultsTableProps = {
  beaches: PoiDto[];
  distancesKm?: Map<number, number>;
  userCoords?: UserCoords;
  filterState: BeachFilterState;
  onFilterPatch: (next: BeachFilterState) => void;
};

export function BeachResultsTable({
  beaches,
  distancesKm,
  userCoords,
  filterState,
  onFilterPatch,
}: BeachResultsTableProps) {
  const { messagesNamespace, features } = usePoiCategoryConfig();
  const t = useTranslations(messagesNamespace);

  return (
    <>
      <ul className="sm:hidden">
        {beaches.map((beach, index) => (
          <BeachMobileListRow
            key={beach.id}
            beach={beach}
            distanceKm={resolveBeachDistanceKm(beach, distancesKm, userCoords)}
            showDivider={index < beaches.length - 1}
            isFirst={index === 0}
          />
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/80">
              <th className="w-[19%] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("colName")}
              </th>
              {features.weather ? (
                <th className="hidden w-[22%] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:table-cell">
                  {t("colWeather")}
                </th>
              ) : null}
              {features.beachAttributes ? (
                <th className="w-[40%] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("colAttributes")}
                </th>
              ) : null}
              <th className="w-[16%] px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("colRegion")}
              </th>
            </tr>
          </thead>
          <tbody>
            {beaches.map((beach) => (
              <BeachTableRow
                key={beach.id}
                beach={beach}
                distanceKm={resolveBeachDistanceKm(beach, distancesKm, userCoords)}
                filterState={filterState}
                onFilterPatch={onFilterPatch}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
