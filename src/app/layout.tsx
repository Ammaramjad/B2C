import type { Metadata } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/shell";
import { ThemeSync } from "@/components/theme-sync";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const noto = Noto_Sans_TC({ variable: "--font-cjk", weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  title: "ZOUDIAN — AI Mobility 2030",
  description: "Design prototype: airport, P2P, hourly, taxi, rental, live trip, ops, admin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${noto.variable} h-full antialiased`}>
      <body className="min-h-full">
        <StoreProvider>
          <ThemeSync />
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
