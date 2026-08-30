"use client";

import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export function HomeAuthBanner() {
  const t = useTranslations("home");
  const { status, user } = useAuth();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!hasMounted || status === "loading") {
    return (
      <section className="mb-6 w-full max-w-md rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        {t("authLoading")}
      </section>
    );
  }

  if (status === "authenticated" && user != null) {
    return null;
  }

  return (
    <section className="mb-6 w-full max-w-md rounded-lg border border-dashed border-border bg-muted/30 px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-card text-muted-foreground">
          <LogIn className="size-4" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">{t("authGuestTitle")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("authGuestBody")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
              {t("authLogin")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              {t("authRegister")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
