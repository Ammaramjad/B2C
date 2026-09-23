import { CityPage } from "@/views/public";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CityPage params={params} />;
}
