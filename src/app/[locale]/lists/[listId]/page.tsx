import { setRequestLocale } from "next-intl/server";

import { ListDetail } from "@/components/lists/list-detail";

type Props = {
  params: Promise<{ locale: string; listId: string }>;
};

export default async function ListDetailPage({ params }: Props) {
  const { locale, listId } = await params;
  setRequestLocale(locale);
  const id = Number(listId);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return <ListDetail listId={id} />;
}
