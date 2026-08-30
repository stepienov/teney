"use client";

import { useTranslations } from "next-intl";

import { AppSidebarPanel } from "@/components/layout/app-sidebar-panel";
import { cn } from "@/lib/utils";

export const APP_SIDEBAR_WIDTH_CLASS = "w-[18.5rem]";

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
      <AppSidebarPanel />
    </aside>
  );
}
