import { getTranslations } from "next-intl/server";

import { TeneyLogo } from "@/components/brand/teney-logo";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
        <TeneyLogo className="w-10 stroke-ocean-deep" />
        <p className="text-[0.65rem] font-semibold uppercase tracking-caps-wide text-ocean-teal">
          {t("tagline")}
        </p>
        <p className="font-heading text-sm font-bold uppercase tracking-[0.1em] text-ocean-deep">
          Teney
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} teney.app · {t("rights")}
        </p>
      </div>
    </footer>
  );
}
