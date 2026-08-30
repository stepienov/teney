"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { TeneyLogo } from "@/components/brand/teney-logo";
import { LocaleSwitcher } from "@/components/locale/locale-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", labelKey: "home" as const },
  { href: "/beaches", labelKey: "beaches" as const },
  { href: "/about", labelKey: "about" as const },
];

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const variant = isHome ? "hero" : "default";

  return (
    <header
      className={cn(
        "z-40",
        isHome
          ? "absolute inset-x-0 top-0"
          : "sticky top-0 border-b border-border bg-card/90 shadow-sm backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className={cn(
            "group flex items-center gap-2.5 transition-opacity hover:opacity-90",
            isHome ? "text-white" : "text-foreground",
          )}
        >
          <TeneyLogo />
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                isHome
                  ? "text-white/90 hover:bg-card/15 hover:text-white"
                  : "text-muted-foreground hover:bg-mint/30 hover:text-foreground",
                pathname === item.href &&
                  (isHome ? "bg-card/20 text-white" : "bg-mint/40 text-foreground"),
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher variant={variant} className="hidden sm:flex" />

          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "rounded-full",
                      isHome
                        ? "border-white/50 bg-card/10 text-white"
                        : "border-border bg-card",
                    )}
                    aria-label={t("openMenu")}
                  />
                }
              >
                <Menu />
              </SheetTrigger>
              <SheetContent side="right" className="border-border bg-app-sidebar">
                <SheetHeader>
                  <SheetTitle className="font-heading uppercase tracking-wide text-foreground">
                    {t("menu")}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-2" aria-label="Mobile main">
                  {navItems.map((item) => (
                    <SheetClose
                      key={item.href}
                      render={
                        <Link
                          href={item.href}
                          className="rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-mint/40"
                        />
                      }
                    >
                      {t(item.labelKey)}
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-4 px-2 sm:hidden">
                  <LocaleSwitcher />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
