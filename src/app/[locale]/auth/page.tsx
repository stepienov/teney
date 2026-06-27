import { redirect } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function AuthPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { mode } = await searchParams;
  setRequestLocale(locale);

  redirect({
    href: mode === "register" ? "/register" : "/login",
    locale,
  });
}
