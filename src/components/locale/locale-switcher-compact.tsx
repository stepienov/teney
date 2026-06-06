"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { LocaleFlag } from "@/components/locale/locale-flag";
import { useNavigationRouter } from "@/components/providers/navigation-loading";
import { type AppLocale, locales, usePathname } from "@/i18n/routing";
import { localeMenuLabels } from "@/i18n/locale-flags";
import { currentSearchQuery } from "@/lib/locale-href";
import { cn } from "@/lib/utils";

type LocaleSwitcherCompactProps = {
  /** Przycisk na fioletowej belce nagłówka. */
  tone?: "default" | "onBrand";
};

const triggerClass =
  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-1.5 text-xs font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LocaleSwitcherCompact({ tone = "default" }: LocaleSwitcherCompactProps) {
  const t = useTranslations("locale");
  const locale = useLocale() as AppLocale;
  const router = useNavigationRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function switchLocale(next: AppLocale) {
    if (next === locale) return;
    const qs = currentSearchQuery();
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
      <button
        type="button"
        className={cn(
          triggerClass,
          tone === "onBrand"
            ? "text-brand-foreground hover:bg-white/15"
            : "text-foreground hover:bg-muted",
        )}
        aria-label={`${t("label")}: ${localeMenuLabels[locale]}`}
        aria-haspopup="listbox"
        aria-expanded={showMenu}
      >
        <LocaleFlag locale={locale} />
        <span>{localeMenuLabels[locale]}</span>
      </button>

      <div
        className={cn(
          "absolute right-0 top-full z-50 min-w-[7rem] pt-2",
          showMenu ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <ul
          role="listbox"
          aria-label={t("label")}
          className={cn(
            "overflow-hidden rounded-lg border border-border bg-white py-0.5 shadow-md transition-opacity duration-150",
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
                  className="flex w-full cursor-pointer items-center gap-2 px-2.5 py-2 text-left text-xs font-medium tracking-wide text-foreground transition-colors hover:bg-muted"
                >
                  <LocaleFlag locale={code} />
                  <span className="min-w-0 flex-1">{localeMenuLabels[code]}</span>
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
