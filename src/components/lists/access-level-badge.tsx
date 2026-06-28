"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { ListAccessLevel } from "@/lib/types/user-lists";

type AccessLevelBadgeProps = {
  level: ListAccessLevel | "OWNER";
  className?: string;
};

export function AccessLevelBadge({ level, className }: AccessLevelBadgeProps) {
  const t = useTranslations("lists.accessLevel");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-brand-muted px-2 py-0.5 text-xs font-medium text-brand",
        className,
      )}
    >
      {t(level)}
    </span>
  );
}
