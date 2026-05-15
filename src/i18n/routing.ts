import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

/** Matches DeepL translation sync in the API (`TranslationSyncServiceImpl`). */
export const locales = ["en", "pl", "de", "es"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true,
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  pl: "Polski",
  de: "Deutsch",
  es: "Español",
};
