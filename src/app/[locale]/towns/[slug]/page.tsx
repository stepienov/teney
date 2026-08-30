import { GenericPoiDetailsPage } from "@/components/poi-explorer/generic-poi-details-page";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function Page({ params }: Props) {
  return <GenericPoiDetailsPage params={params} basePath="/towns" />;
}
