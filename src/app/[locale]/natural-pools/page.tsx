import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  PageHeader,
  PageRoot,
} from "@/components/layout/page-layout";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NaturalPoolsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("naturalPools");

  return (
    <PageRoot>
      <PageHeader title={t("title")} subtitle={t("comingSoon")} />
    </PageRoot>
  );
}
