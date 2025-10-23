"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import ClickSpark from "@/components/ClickSpark";
import SonnerToaster from "@/components/sonner-toaster";

import { useEffect } from "react";
import Lenis from "lenis";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Add global task notification popup so it shows everywhere
  const TaskNotificationGlobal = require("@/components/task-notification-global").default;

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      direction: "vertical",
      gestureDirection: "vertical",
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    } as any);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

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
            <TaskNotificationGlobal />
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
