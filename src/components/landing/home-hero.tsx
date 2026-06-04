import { ArrowRight, Waves } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export async function HomeHero() {
  const t = await getTranslations("home");

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {t("dashboardTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("tagline")}</p>
      </header>

      <article className="max-w-md rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-muted text-brand">
            <Waves className="size-5" aria-hidden />
          </div>
          <h2 className="text-base font-semibold text-foreground">{t("cardBeachesTitle")}</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("cardBeachesBody")}
        </p>
        <Link
          href="/beaches"
          className={cn(buttonVariants(), "mt-5 gap-1.5")}
        >
          {t("ctaBeaches")}
          <ArrowRight className="size-4" />
        </Link>
      </article>
    </div>
  );
}
