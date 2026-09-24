import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif, Noto_Sans_TC, Noto_Serif_TC, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AtlasRoot } from "@/components/atlas/root";

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const cjk = Noto_Sans_TC({
  variable: "--font-cjk",
  weight: ["400", "500", "700"],
  display: "swap",
});

const cjkSerif = Noto_Serif_TC({
  variable: "--font-cjk-serif",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zoufeng Atlas — Mobility & Travel OS",
  description:
    "Design foundation for Zoufeng International: passenger travel commerce, driver operations, and mobility command.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${cjk.variable} ${cjkSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <StoreProvider>
          <AtlasRoot>{children}</AtlasRoot>
        </StoreProvider>
      </body>
    </html>
  );
}
