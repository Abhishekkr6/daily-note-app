"use client"; // ✅ Add this line

import type React from "react";
import type { Metadata } from "next";
import { Inter, Montserrat as Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react"; // ✅ Add this import

// Body font → Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Heading font → Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DailyNote - Daily Notes & Tasks",
  description: "A modern productivity app for daily notes and task management",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <Suspense fallback={null}>
          {/* ✅ Wrap with SessionProvider */}
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </SessionProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
