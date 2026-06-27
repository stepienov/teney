import { setRequestLocale } from "next-intl/server";

import { HomeHero } from "@/components/landing/home-hero";
import { HomeAuthBanner } from "@/components/home/home-auth-banner";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="px-4 py-8 sm:px-8 sm:py-10">
      <HomeAuthBanner />
      <HomeHero />
    </div>
  );
}
