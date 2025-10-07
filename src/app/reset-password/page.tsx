"use client";
import React, { useState } from "react";
import { resetPasswordSchema } from "@/schemas/resetPassword.schema";
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
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setPasswordError("");
    setConfirmPasswordError("");
    // Frontend validation
    try {
      resetPasswordSchema.parse({ token: token || "", password, confirmPassword });
    } catch (err: any) {
      if (err.errors) {
        err.errors.forEach((error: any) => {
          if (error.path[0] === "password") setPasswordError(error.message);
          if (error.path[0] === "confirmPassword") setConfirmPasswordError(error.message);
        });
      }
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
        window.location.href = "/login";
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
  <div className="max-w-md mx-auto mt-20 p-6 bg-[#171717] rounded shadow text-white">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit}>
  <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaLock /></span>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            required
            className="pl-10 pr-10 bg-[#232323] text-white placeholder:text-white/60 border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
            disabled={disabled}
          />
          {passwordError && (
            <div className="absolute left-0 w-full text-red-400 text-xs font-semibold" style={{ top: '100%', marginTop: '5px', marginLeft: '8px', lineHeight: '1' }}>
              {passwordError}
            </div>
          )}
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
            onChange={e => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError("");
            }}
            required
            className="pl-10 pr-10 bg-[#232323] text-white placeholder:text-white/60 border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
            disabled={disabled}
          />
          {confirmPasswordError && (
            <div className="absolute left-0 w-full text-red-400 text-xs font-semibold" style={{ top: '100%', marginTop: '5px', marginLeft: '8px', lineHeight: '1' }}>
              {confirmPasswordError}
            </div>
          )}
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
  {message && <p className="mt-4 text-center text-sm text-white font-semibold">{message}</p>}
      {/* No Go to Login button, immediate redirect on success */}
  {!token && <p className="mt-4 text-red-400 text-center font-semibold">Invalid or missing token.</p>}
    </div>
  );
}
