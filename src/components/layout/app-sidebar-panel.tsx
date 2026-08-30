"use client";

import { AppBrandLink } from "@/components/layout/app-brand-link";
import {
  AppAccountNav,
  AppNestedNav,
} from "@/components/layout/app-nested-nav";
import { LocaleSwitcherCompact } from "@/components/locale/locale-switcher-compact";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTranslations } from "next-intl";

type AppSidebarPanelProps = {
  onNavigate?: () => void;
};

export function AppSidebarPanel({ onNavigate }: AppSidebarPanelProps) {
  const t = useTranslations("shell");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-4 pb-5 pt-6">
        <AppBrandLink className="w-full justify-center" />
        <div
          className="mx-auto mt-5 h-0.5 w-16 rounded-full"
          style={{ backgroundImage: "var(--header-line)" }}
          aria-hidden
        />
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-3"
        aria-label={t("mainNav")}
      >
        <AppNestedNav onNavigate={onNavigate} />
      </nav>

      <div className="relative z-10 shrink-0 overflow-visible border-t border-border px-2 py-2.5">
        <AppAccountNav onNavigate={onNavigate} />
        <div className="mt-2 flex items-center justify-between gap-1">
          <ThemeToggle />
          <LocaleSwitcherCompact menuPlacement="up" />
        </div>
      </div>
    </div>
  );
}
