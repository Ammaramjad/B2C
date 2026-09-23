import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Sans, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { ThemeSync } from "@/components/theme-sync";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const noto = Noto_Sans_TC({ variable: "--font-cjk", weight: ["400", "500", "600", "700"], display: "swap" });
const num = IBM_Plex_Sans({ variable: "--font-num", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  title: "ZOUFENG — International Mobility OS",
  description: "Airport, point-to-point, charter, taxi, rental, dispatch, and operations for Zoufeng.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${sans.variable} ${noto.variable} ${num.variable} h-full antialiased`}>
      <body className="min-h-full">
        <StoreProvider>
          <ThemeSync />
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
