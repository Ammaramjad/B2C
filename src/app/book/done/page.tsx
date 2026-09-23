"use client";
import { Suspense } from "react";
import { DoneStep } from "@/views/book-next";
export default function Page() {
  return <Suspense fallback={<div className="zf-page"><div className="zf-skel" /></div>}><DoneStep /></Suspense>;
}
