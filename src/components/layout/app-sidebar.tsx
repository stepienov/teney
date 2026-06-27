"use client";

import { Home, Mountain, User, Waves } from "lucide-react";
import { useTranslations } from "next-intl";

import { AppNavLinks, type AppNavItem } from "@/components/layout/app-nav-links";
import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const APP_SIDEBAR_WIDTH_CLASS = "w-[15.5rem]";

export const appNavItems: AppNavItem[] = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/beaches", labelKey: "beaches", icon: Waves },
  { href: "/miradores", labelKey: "miradores", icon: Mountain },
  { href: "/account", labelKey: "account", icon: User },
];

export function AppSidebar() {
  const t = useTranslations("shell");
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-app-sidebar",
        APP_SIDEBAR_WIDTH_CLASS,
      )}
      aria-label={t("sidebarLabel")}
    >
      <nav className="flex flex-1 flex-col gap-0.5 p-2.5" aria-label={t("mainNav")}>
        <AppNavLinks
          items={appNavItems}
          pathname={pathname}
          getLabel={(key) => t(key)}
        />
      </nav>
    </aside>
  );
}
