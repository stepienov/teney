import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

import { TeneyLogo } from "@/components/brand/teney-logo";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col items-center text-center">
        <TeneyLogo size="hero" />
        <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-caps-wide text-muted-foreground">
          {t("badge")}
        </p>
        <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
      </div>

      <div className="mt-10 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p className="text-lg font-medium text-foreground">{t("intro")}</p>
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
      </div>
    </article>
  );
}
