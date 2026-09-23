import { AirportBook } from "@/views/book-journey";
export default async function Page({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <AirportBook mode={mode === "drop" ? "drop" : "pickup"} />;
}
