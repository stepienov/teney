import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { NAV_GROUPS } from "@/lib/poi-categories/catalog";
import { cn } from "@/lib/utils";

export async function HomeHero() {
  const t = await getTranslations("home");

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {t("dashboardTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("tagline")}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {NAV_GROUPS.map((group) => {
          const Icon = group.icon;

          return (
            <article
              key={group.id}
              className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-icon-gradient text-foreground">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  {t(group.homeTitleKey)}
                </h2>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t(group.homeBodyKey)}
              </p>
              <Link
                href={group.homeHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-5 w-fit gap-1.5 rounded-full px-4",
                )}
              >
                {t(group.homeCtaKey)}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
