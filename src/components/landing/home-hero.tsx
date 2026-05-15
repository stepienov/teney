import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { TeneyLogo } from "@/components/brand/teney-logo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export async function HomeHero() {
  const t = await getTranslations("home");

  return (
    <>
      <section className="relative overflow-hidden bg-ocean-hero text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
          <svg
            className="absolute bottom-0 left-0 h-32 w-full"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M0 60c120-20 240-40 360-30s240 50 360 40 240-60 360-50 240 70 360 60 120-30 240-20 360-10v70H0V60z"
              fill="white"
              fillOpacity="0.12"
            />
          </svg>
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-24">
          <TeneyLogo className="w-[4.5rem] stroke-white" />

          <p className="mt-8 text-[0.65rem] font-medium uppercase tracking-caps-wide opacity-95 sm:text-xs">
            {t("badge")}
          </p>

          <h1 className="font-heading mt-3 text-4xl font-bold uppercase tracking-[0.14em] sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            {t("tagline")}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              nativeButton={false}
              render={
                <Link
                  href="/beaches"
                  className="h-11! gap-2 rounded-full! border-0! bg-white! px-7! text-sm! font-semibold! text-ocean-deep! shadow-lg hover:bg-ocean-mist!"
                >
                  {t("ctaBeaches")}
                  <ArrowRight className="size-4 text-ocean-teal" />
                </Link>
              }
            />
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href="/about"
                  className="h-11! rounded-full! border-2! border-white/70! bg-transparent! px-7! text-sm! font-medium! text-white! hover:bg-white/15!"
                >
                  {t("ctaAbout")}
                </Link>
              }
            />
          </div>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-ocean-foam to-transparent"
        />
      </section>
    </>
  );
}
