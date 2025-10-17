"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import ClickSpark from "@/components/ClickSpark";
import SonnerToaster from "@/components/sonner-toaster";

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
          <div className="relative w-full h-full">
            {children}
            <SonnerToaster />
            <div className="fixed inset-0 w-full h-full z-[99999] pointer-events-none">
              <ClickSpark
                sparkColor="#fff"
                sparkSize={10}
                sparkRadius={15}
                sparkCount={8}
                duration={400}
              />
            </div>
          </div>
        </ThemeProvider>
      </SessionProvider>
      <Analytics />
    </Suspense>
  );
}
