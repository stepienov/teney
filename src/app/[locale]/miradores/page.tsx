import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import { MiradoresExplorer } from "@/components/miradores/miradores-explorer";

type Props = {
  params: Promise<{ locale: string }>;
};

function MiradoresFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
      …
    </div>
  );
}

export default async function MiradoresPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<MiradoresFallback />}>
      <MiradoresExplorer />
    </Suspense>
  );
}
