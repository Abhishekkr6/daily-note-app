import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const poppins = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DailyNote - Daily Notes & Tasks",
  description: "A modern productivity app for daily notes and task management",
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DailyNote",
  },
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA viewport configuration for proper mobile display */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="google-site-verification" content="-ww79jU6MsojMMgBHf_mxkrcArcHBrpR6foE5AqfYDg" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
