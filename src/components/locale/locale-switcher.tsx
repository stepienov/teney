"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { useNavigationRouter } from "@/components/providers/navigation-loading";
import { type AppLocale, localeLabels, usePathname } from "@/i18n/routing";
import { currentSearchQuery } from "@/lib/locale-href";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  className?: string;
  variant?: "hero" | "default";
};

export function LocaleSwitcher({
  className,
  variant = "default",
}: LocaleSwitcherProps) {
  const t = useTranslations("locale");
  const locale = useLocale() as AppLocale;
  const router = useNavigationRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const isHero = variant === "hero";

  function switchLocale(next: AppLocale) {
    const qs = currentSearchQuery();
    const href = qs ? `${pathname}?${qs}` : pathname;
    router.replace(href, { locale: next });
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={t("switch")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-9 min-w-[8.5rem] items-center justify-between gap-2 rounded-full border px-3 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isHero
            ? "border-white/45 bg-card/15 text-white backdrop-blur-sm hover:bg-card/25"
            : "border-border bg-card text-foreground shadow-sm hover:border-navy/40 hover:bg-muted",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Languages className="size-4 shrink-0 opacity-80" aria-hidden />
          <span className="truncate">{localeLabels[locale]}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 opacity-70 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("label")}
          className={cn(
            "absolute right-0 z-50 mt-2 w-full min-w-[10.5rem] overflow-hidden rounded-2xl border p-1.5 shadow-[0_16px_40px_-12px_rgba(26,46,53,0.25)]",
            isHero
              ? "border-white/20 bg-card text-foreground"
              : "border-border bg-card",
          )}
        >
          {(Object.entries(localeLabels) as [AppLocale, string][]).map(
            ([code, label]) => {
              const selected = code === locale;
              return (
                <li key={code} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => switchLocale(code)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                      selected
                        ? "bg-mint/50 font-semibold text-foreground"
                        : "text-foreground/90 hover:bg-mint/35",
                    )}
                  >
                    <span>{label}</span>
                    {selected ? (
                      <Check className="size-4 shrink-0 text-navy" aria-hidden />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            },
          )}
        </ul>
      )}
    </div>
  );
}
