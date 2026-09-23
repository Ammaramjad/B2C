"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function ThemeSync() {
  const { theme } = useStore();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}
