"use client";
import { Suspense } from "react";
import { DoneStep } from "@/views/book-next";
export default function Page() {
  return <Suspense fallback={<div className="zf-skel" />}><DoneStep /></Suspense>;
}
