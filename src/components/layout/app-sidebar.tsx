"use client";

import { Home, Waves } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const APP_SIDEBAR_WIDTH_CLASS = "w-[15.5rem]";

const navItems = [
  { href: "/", labelKey: "home" as const, icon: Home },
  { href: "/beaches", labelKey: "beaches" as const, icon: Waves },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
        {navItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-muted text-brand"
                  : "text-muted-foreground hover:bg-white hover:text-foreground",
              )}
            >
              <Icon
                className={cn("size-4 shrink-0", active && "text-brand")}
                aria-hidden
              />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
