// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import VersionChecker from "./components/VersionChecker"; // ✅ Add this

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair" 
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "MANUSTRY - Ministry in Your Hand",
  description: "MANUSTRY is a free KJV Bible study tool. Study Scripture, and write devotions in every believer's hand.",
  keywords: "Bible study, KJV, devotional, sermon writing, Scripture, Christian, theology",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
        <Providers>
          <VersionChecker /> {/* ✅ Add this */}
          {children}
        </Providers>
      </body>
    </html>
  );
}