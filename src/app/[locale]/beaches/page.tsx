import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import { BeachesExplorer } from "@/components/beaches/beaches-explorer";

type Props = {
  params: Promise<{ locale: string }>;
};

function BeachesFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
      …
    </div>
  );
}

export default async function BeachesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<BeachesFallback />}>
      <BeachesExplorer />
    </Suspense>
  );
}
