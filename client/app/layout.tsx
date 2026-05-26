import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

// DS: type — load DM Sans / DM Mono per design system
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
 title: "Pinesphere POS",
 description: "Restaurant Management System",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="en"
 className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
 style={
 {
 // DS: type — bind next/font to token variables
 ["--font-ui" as string]: "var(--font-dm-sans), -apple-system, sans-serif",
 ["--font-mono" as string]: "var(--font-dm-mono), 'Fira Code', monospace",
        } as CSSProperties
 }
 >
 <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
 <Providers>{children}</Providers>
 </body>
 </html>
 );
}
