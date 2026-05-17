import { setRequestLocale } from "next-intl/server";

import { HomeHero } from "@/components/landing/home-hero";
import { GeolocationWarmup } from "@/components/location/geolocation-warmup";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <GeolocationWarmup />
      <HomeHero />
    </>
  );
}
