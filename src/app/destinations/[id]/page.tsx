"use client";

import { useParams } from "next/navigation";
import { DestinationCity } from "@/screens/passenger/rest";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <DestinationCity id={id} />;
}
