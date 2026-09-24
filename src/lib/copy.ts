"use client";

import { loc } from "./i18n";
import { useStore } from "./store";
import type { Locale } from "./types";

export function useCopy() {
  const { locale, setLocale } = useStore();
  return {
    locale,
    setLocale,
    L: (en: string, zh: string) => loc(locale, en, zh),
  };
}

export function corridor(locale: Locale, en: string, zh?: string) {
  return locale === "zh" && zh ? zh : en;
}
