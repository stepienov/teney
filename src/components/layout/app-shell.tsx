"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppSidebarPanel } from "@/components/layout/app-sidebar-panel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const t = useTranslations("shell");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-app-main">
      <div className="hidden h-full shrink-0 sm:flex">
        <AppSidebar />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="fixed top-3 left-3 z-40 size-9 rounded-md border-border bg-card/90 shadow-sm backdrop-blur-sm hover:bg-muted hover:text-foreground sm:hidden"
              aria-label={t("openMenu")}
            />
          }
        >
          <Menu className="size-4" />
        </SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="gap-0 border-border bg-app-sidebar p-0 data-[side=left]:w-[18.5rem] data-[side=left]:max-w-[18.5rem]"
        >
          <SheetTitle className="sr-only">{t("sidebarLabel")}</SheetTitle>
          <AppSidebarPanel onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-app-main max-sm:pt-14">
        {children}
      </div>
    </div>
  );
}
