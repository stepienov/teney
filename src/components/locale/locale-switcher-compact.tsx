"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { LocaleFlag } from "@/components/locale/locale-flag";
import { Button } from "@/components/ui/button";
import {
  type AppLocale,
  locales,
  usePathname,
  useRouter,
} from "@/i18n/routing";
import { localeMenuLabels } from "@/i18n/locale-flags";
import { cn } from "@/lib/utils";

type LocaleSwitcherCompactProps = {
  /** Przycisk na fioletowej belce nagłówka. */
  tone?: "default" | "onBrand";
};

function LocaleSwitcherCompactMenu({ tone = "default" }: LocaleSwitcherCompactProps) {
  const t = useTranslations("locale");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  function switchLocale(next: AppLocale) {
    if (next === locale) return;
    const qs = searchParams.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    router.replace(href, { locale: next });
    setOpen(false);
  }

  const showMenu = open;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-9 gap-2 px-2.5",
          tone === "onBrand" &&
            "border-brand-foreground/30 bg-white/10 text-brand-foreground hover:bg-white/20 hover:text-brand-foreground",
        )}
        aria-label={`${t("label")}: ${localeMenuLabels[locale]}`}
        aria-haspopup="listbox"
        aria-expanded={showMenu}
      >
        <LocaleFlag locale={locale} />
        <span className="text-xs font-medium tracking-wide">
          {localeMenuLabels[locale]}
        </span>
      </Button>

      {/* pt-2 = niewidzialny mostek — kursor między przyciskiem a listą nie zamyka menu */}
      <div
        className={cn(
          "absolute right-0 top-full z-50 min-w-[12.5rem] pt-2",
          showMenu ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <ul
          role="listbox"
          aria-label={t("label")}
          className={cn(
            "overflow-hidden rounded-lg border border-border bg-white py-1 shadow-md transition-opacity duration-150",
            showMenu ? "opacity-100" : "opacity-0",
          )}
        >
          {locales.map((code) => {
            const selected = code === locale;
            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => switchLocale(code)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <LocaleFlag locale={code} />
                  <span className="flex-1 text-xs font-medium tracking-wide text-foreground">
                    {localeMenuLabels[code]}
                  </span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-brand" aria-hidden />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function LocaleSwitcherCompact({ tone = "default" }: LocaleSwitcherCompactProps) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "h-9 w-28 animate-pulse rounded-lg",
            tone === "onBrand" ? "bg-white/15" : "bg-muted/50",
          )}
          aria-hidden
        />
      }
    >
      <LocaleSwitcherCompactMenu tone={tone} />
    </Suspense>
  );
}
