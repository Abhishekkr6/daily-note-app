"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
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
      <Analytics />
    </Suspense>
  );
}
