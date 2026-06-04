import { ArrowRight, Umbrella } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export async function HomeHero() {
  const t = await getTranslations("home");

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {t("dashboardTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t("tagline")}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex size-10 items-center justify-center rounded-md bg-brand-muted text-brand">
            <Umbrella className="size-5" aria-hidden />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            {t("cardBeachesTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("cardBeachesBody")}</p>
          <Button
            nativeButton={false}
            className="mt-5 gap-1.5"
            render={
              <Link href="/beaches">
                {t("ctaBeaches")}
                <ArrowRight className="size-4" />
              </Link>
            }
          />
        </article>

        <article className="rounded-lg border border-dashed border-border bg-muted/40 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("badge")}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{t("cardSoonBody")}</p>
        </article>

        <article className="rounded-lg border border-dashed border-border bg-muted/40 p-5 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("cardAboutLabel")}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{t("cardAboutBody")}</p>
          <Button
            variant="outline"
            nativeButton={false}
            className="mt-5"
            render={<Link href="/about">{t("ctaAbout")}</Link>}
          />
        </article>
      </div>
    </div>
  );
}
