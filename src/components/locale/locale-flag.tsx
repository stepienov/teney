import { DE, ES, GB, PL, type FlagComponent } from "country-flag-icons/react/3x2";

import { type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const flagByLocale: Record<AppLocale, FlagComponent> = {
  en: GB,
  pl: PL,
  de: DE,
  es: ES,
};

type LocaleFlagProps = {
  locale: AppLocale;
  className?: string;
};

export function LocaleFlag({ locale, className }: LocaleFlagProps) {
  const Flag = flagByLocale[locale];
  return (
    <span
      className={cn(
        "inline-flex h-4 w-6 shrink-0 overflow-hidden rounded-sm ring-1 ring-border/60",
        className,
      )}
      aria-hidden
    >
      <Flag className="h-full w-full" />
    </span>
  );
}
