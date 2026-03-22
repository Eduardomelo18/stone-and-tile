import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Northern Beaches Stone & Tile Care",
  description: "Business control app for Northern Beaches Stone & Tile Care",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NB Stone & Tile",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
