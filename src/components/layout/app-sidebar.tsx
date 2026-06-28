"use client";

import { useTranslations } from "next-intl";

import { AppNestedNav } from "@/components/layout/app-nested-nav";
import { cn } from "@/lib/utils";

export const APP_SIDEBAR_WIDTH_CLASS = "w-[15.5rem]";

export function AppSidebar() {
  const t = useTranslations("shell");

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-app-sidebar",
        APP_SIDEBAR_WIDTH_CLASS,
      )}
      aria-label={t("sidebarLabel")}
    >
      <nav className="flex flex-1 flex-col overflow-y-auto p-2.5" aria-label={t("mainNav")}>
        <AppNestedNav />
      </nav>
    </aside>
  );
}
