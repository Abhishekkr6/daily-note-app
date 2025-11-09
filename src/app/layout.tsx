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
      <head>
        {/* Force a desktop viewport width so mobile browsers render the desktop layout */}
        <meta name="viewport" content="width=1280, initial-scale=1" />
        <meta name="google-site-verification" content="-ww79jU6MsojMMgBHf_mxkrcArcHBrpR6foE5AqfYDg" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
