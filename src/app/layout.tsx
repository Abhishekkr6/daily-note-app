"use client";
// Removed "use client"; layout must be a server component to export metadata
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
// Removed client-only imports
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react"; // ✅ Add this import

// Body font → Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
// Heading font → Montserrat
const poppins = Montserrat({
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
  )
}
