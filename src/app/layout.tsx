import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/shell";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "走癲派車 ZOUDIAN — B2C",
  description: "台灣派車 B2C：6 服務、透明 NT$、繁中／英文、即時地圖。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} h-full antialiased`}>
      <body className="min-h-full">
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
