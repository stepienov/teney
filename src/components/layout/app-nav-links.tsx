"use client";

import type { LucideIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type AppNavItem = {
  href: string;
  labelKey: "home" | "beaches" | "miradores" | "account";
  icon: LucideIcon;
};

type AppNavLinksProps = {
  items: readonly AppNavItem[];
  pathname: string;
  getLabel: (labelKey: AppNavItem["labelKey"]) => string;
  onNavigate?: () => void;
  linkClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
};

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavLinks({
  items,
  pathname,
  getLabel,
  onNavigate,
  linkClassName,
  activeClassName = "bg-brand-muted text-brand",
  inactiveClassName = "text-muted-foreground hover:bg-white hover:text-foreground",
}: AppNavLinksProps) {
  const { status, user } = useAuth();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <>
      {items.map((item) => {
        const active = isNavActive(pathname, item.href);
        const Icon = item.icon;
        const label =
          item.labelKey === "account" &&
          hasMounted &&
          status === "authenticated" &&
          user != null
            ? user.email
            : getLabel(item.labelKey);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={label}
            className={cn(
              "flex min-w-0 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              active ? activeClassName : inactiveClassName,
              linkClassName,
            )}
          >
            <Icon
              className={cn("size-4 shrink-0", active && "text-brand")}
              aria-hidden
            />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </>
  );
}
