"use client";

import { useParams } from "next/navigation";
import { Driver360Page } from "@/screens/signal/ops-desk";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <Driver360Page id={id} />;
}
