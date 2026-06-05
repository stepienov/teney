import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="overflow-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
