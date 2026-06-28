"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AppBrandLink } from "@/components/layout/app-brand-link";
import { AppNestedNav } from "@/components/layout/app-nested-nav";
import {
  APP_SIDEBAR_WIDTH_CLASS,
  AppSidebar,
} from "@/components/layout/app-sidebar";
import { LocaleSwitcherCompact } from "@/components/locale/locale-switcher-compact";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const t = useTranslations("shell");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 w-full flex-col overflow-hidden bg-app-main">
      <header className="flex h-14 shrink-0 items-center bg-brand text-brand-foreground sm:px-3">
        <div
          className={cn(
            "hidden shrink-0 items-center px-3 sm:flex",
            APP_SIDEBAR_WIDTH_CLASS,
          )}
        >
          <AppBrandLink />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 sm:px-0 sm:pr-3">
          <div className="flex min-w-0 items-center gap-2 sm:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 rounded-md border-brand-foreground/30 bg-white/10 text-brand-foreground hover:bg-white/20 hover:text-brand-foreground"
                    aria-label={t("openMenu")}
                  />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[15.5rem] border-border bg-app-sidebar p-0"
              >
                <SheetHeader className="border-b border-border bg-brand px-4 py-3.5 text-brand-foreground">
                  <SheetTitle className="text-sm font-semibold text-brand-foreground">
                    Teney
                  </SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col gap-0.5 overflow-y-auto p-2.5"
                  aria-label={t("mainNav")}
                >
                  <AppNestedNav onNavigate={() => setMobileOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
            <AppBrandLink className="min-w-0" />
          </div>

          <div className="hidden flex-1 sm:block" aria-hidden />

          <LocaleSwitcherCompact tone="onBrand" />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden h-full shrink-0 sm:flex">
          <AppSidebar />
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
