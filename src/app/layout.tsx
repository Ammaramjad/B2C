import type { Metadata } from "next";
import { IBM_Plex_Mono, Noto_Sans_TC, Outfit } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { LiveProvider } from "@/lib/live/engine";
import { SignalRoot } from "@/components/signal/chrome";

const sans = Outfit({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const mono = IBM_Plex_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const cjk = Noto_Sans_TC({ variable: "--font-cjk", weight: ["400", "500", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "ZOUFENG — Travel Smarter, Explore Taiwan",
  description: "Airport transfer, charter, city to city, and corporate cars across Taiwan. Company-dispatched mobility.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${cjk.variable} h-full antialiased`}>
      <body className={`${sans.className} min-h-full`}>
        <StoreProvider>
          <LiveProvider>
            <SignalRoot>{children}</SignalRoot>
          </LiveProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
