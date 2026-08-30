import { setRequestLocale } from "next-intl/server";

import { ListTeaserView } from "@/components/lists/list-teaser";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function ListTeaserPage({ params }: Props) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  return <ListTeaserView token={token} />;
}
