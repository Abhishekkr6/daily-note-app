
"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { LandingPage } from "@/components/landing-page";

export default function Landing() {
  return <LandingPage />;
}
