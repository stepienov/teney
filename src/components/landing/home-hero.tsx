import { ArrowRight, Mountain, Waves, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const homeCategories = [
  {
    href: "/beaches",
    titleKey: "cardBeachesTitle",
    bodyKey: "cardBeachesBody",
    ctaKey: "ctaBeaches",
    icon: Waves,
  },
  {
    href: "/miradores",
    titleKey: "cardMiradoresTitle",
    bodyKey: "cardMiradoresBody",
    ctaKey: "ctaMiradores",
    icon: Mountain,
  },
] as const satisfies ReadonlyArray<{
  href: string;
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  icon: LucideIcon;
}>;

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {homeCategories.map((category) => {
          const Icon = category.icon;

          return (
            <article
              key={category.href}
              className="flex h-full flex-col rounded-lg border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-muted text-brand">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  {t(category.titleKey)}
                </h2>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t(category.bodyKey)}
              </p>
              <Link
                href={category.href}
                className={cn(buttonVariants(), "mt-5 w-fit gap-1.5")}
              >
                {t(category.ctaKey)}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}
