"use client";

import { useTranslations } from "next-intl";

type RatingAggregateProps = {
  aggregateRating: number | null;
  ratingsCount: number;
};

export function RatingAggregate({
  aggregateRating,
  ratingsCount,
}: RatingAggregateProps) {
  const t = useTranslations("lists.rating");

  if (aggregateRating == null || ratingsCount === 0) {
    return (
      <span className="text-xs text-muted-foreground">{t("noRatings")}</span>
    );
  }

  return (
    <span className="text-xs text-muted-foreground">
      {t("aggregate", {
        rating: aggregateRating.toFixed(2),
        count: ratingsCount,
      })}
    </span>
  );
}
