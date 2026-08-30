import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import { GenericCategoryExplorer } from "@/components/poi-explorer/generic-category-explorer";

type Props = {
  params: Promise<{ locale: string }>;
};

function Fallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
      …
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<Fallback />}>
      <GenericCategoryExplorer basePath="/historical-sites" />
    </Suspense>
  );
}
