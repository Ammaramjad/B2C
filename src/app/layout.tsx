import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans, Newsreader, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/shell";
import { ThemeSync } from "@/components/theme-sync";

const sans = Instrument_Sans({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const display = Newsreader({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });
const cjk = Noto_Sans_TC({ variable: "--font-cjk", weight: ["400", "500", "700"], display: "swap" });
const cjkSerif = Noto_Serif_TC({ variable: "--font-cjk-serif", weight: ["500", "600"], display: "swap" });

export const metadata: Metadata = {
  title: "Zoufeng — International Mobility",
  description: "Passenger travel, driver work, and the operations desk for airport, transfer, charter, taxi, and self-drive.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${sans.variable} ${display.variable} ${mono.variable} ${cjk.variable} ${cjkSerif.variable}`}>
      <body>
        <StoreProvider>
          <ThemeSync />
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
