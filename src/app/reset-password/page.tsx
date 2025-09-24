"use client";
import React, { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [csrfToken, setCsrfToken] = useState("");
  // Fetch CSRF token on mount
  React.useEffect(() => {
    fetch("/api/csrf-token")
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    setDisabled(true);
    try {
      const res = await fetch("/api/users/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, csrfToken, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successful. Redirecting to login...");
        setResetSuccess(true);
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMessage(data.error || "Something went wrong.");
        setDisabled(false);
      }
    } catch (err) {
      setMessage("Error resetting password.");
      setDisabled(false);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaLock /></span>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="pl-10 pr-10"
            disabled={disabled}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash className="cursor-pointer" /> : <FaEye className="cursor-pointer" />}
          </span>
        </div>
        <div className="relative mt-2">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaLock /></span>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="pl-10 pr-10"
            disabled={disabled}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg cursor-pointer"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <FaEyeSlash className="cursor-pointer" /> : <FaEye className="cursor-pointer" />}
          </span>
        </div>
        <Button type="submit" disabled={loading || !token || disabled} className="mt-4 w-full cursor-pointer">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
      {resetSuccess && (
        <Button className="mt-4 w-full cursor-pointer" onClick={() => window.location.href = "/login"}>
          Go to Login
        </Button>
      )}
      {!token && <p className="mt-4 text-red-500 text-center">Invalid or missing token.</p>}
    </div>
  );
}
