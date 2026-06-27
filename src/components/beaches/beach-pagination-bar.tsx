"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  BEACH_PAGE_SIZE_OPTIONS,
  buildPaginationRange,
  type BeachPageSize,
} from "@/lib/beach-pagination";
import { cn } from "@/lib/utils";

type BeachPaginationBarProps = {
  currentPage: number;
  totalPages: number;
  pageSize: BeachPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: BeachPageSize) => void;
  translationNamespace?: "beaches" | "miradores";
};

export function BeachPaginationBar({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  translationNamespace = "beaches",
}: BeachPaginationBarProps) {
  const t = useTranslations(translationNamespace);
  const items = buildPaginationRange(currentPage, totalPages);
  const prevDisabled = currentPage <= 0;
  const nextDisabled = currentPage >= totalPages - 1;

  return (
    <nav
      className="mt-8 hidden border-t border-border pt-6 sm:flex sm:justify-center"
      aria-label={t("paginationLabel")}
    >
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          className={cn(
            "px-2 py-1.5 text-sm transition-colors",
            prevDisabled
              ? "cursor-default text-muted-foreground/50"
              : "text-muted-foreground hover:text-foreground",
          )}
          disabled={prevDisabled}
          aria-label={t("prev")}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t("prev")}
        </button>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1.5 text-sm text-muted-foreground"
              aria-hidden
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={cn(
                "min-w-8 px-2 py-1.5 text-sm font-medium tabular-nums transition-colors",
                item === currentPage + 1
                  ? "rounded-md border border-brand/30 bg-brand-muted text-brand"
                  : "rounded-md text-foreground hover:bg-muted/50",
              )}
              aria-label={t("pageNumber", { page: item })}
              aria-current={item === currentPage + 1 ? "page" : undefined}
              onClick={() => onPageChange(item - 1)}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className={cn(
            "px-2 py-1.5 text-sm transition-colors",
            nextDisabled
              ? "cursor-default text-muted-foreground/50"
              : "text-brand hover:text-brand/80",
          )}
          disabled={nextDisabled}
          aria-label={t("next")}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t("next")}
        </button>
        </div>

        <label className="relative inline-flex shrink-0 items-center">
        <span className="sr-only">{t("perPage")}</span>
        <select
          value={pageSize}
          onChange={(event) =>
            onPageSizeChange(Number(event.target.value) as BeachPageSize)
          }
          className="h-9 min-w-[7rem] cursor-pointer appearance-none rounded-lg border border-brand/25 bg-white py-0 pr-9 pl-3 text-sm text-foreground outline-none transition-colors hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("perPage")}
        >
          {BEACH_PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t("perPageShort", { count: option })}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        </label>
      </div>
    </nav>
  );
}
