"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to /login — password reset flow is removed.
    router.replace("/login");
  }, [router]);
  return null;
}
