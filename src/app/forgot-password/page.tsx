"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [csrfToken, setCsrfToken] = useState("");
  // Fetch CSRF token on mount
  React.useEffect(() => {
    fetch("/api/csrf-token")
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [inputsDisabled, setInputsDisabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInputsDisabled(true);
    setMessage("");
    try {
      const res = await fetch("/api/users/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, csrfToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Reset link sent to your email.");
        setEmailSent(true);
      } else {
        setMessage(data.error || "Something went wrong.");
        setInputsDisabled(false);
      }
    } catch (err) {
      setMessage("Error sending reset link.");
      setInputsDisabled(false);
    }
    setLoading(false);
  };

  return (
  <div className="max-w-md mx-auto mt-20 p-6 bg-[#171717] rounded shadow text-white">
      <h2 className="text-2xl font-bold mb-4">Forgot your Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaEnvelope /></span>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="pl-10 bg-[#232323] text-white placeholder:text-white/60 border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
            disabled={inputsDisabled}
          />
          {message && message.toLowerCase().includes('not found') && (
            <div className="absolute left-0 w-full text-red-400 text-xs font-semibold" style={{ top: '100%', marginTop: '5px', marginLeft: '8px', lineHeight: '1' }}>
              {message}
            </div>
          )}
        </div>
  <Button type="submit" disabled={loading || inputsDisabled} className="mt-10 w-full cursor-pointer">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      {emailSent && (
        <>
          <p className="mt-4 text-green-400 text-center text-sm font-semibold">Reset link sent to your email.</p>
          <Button className="mt-4 w-full cursor-pointer" onClick={() => window.location.href = "/login"}>
            Go to Login
          </Button>
        </>
      )}
    </div>
  );
}
