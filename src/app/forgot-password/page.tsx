"use client";
import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/users/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Reset link sent to your email.");
        setEmailSent(true);
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      setMessage("Error sending reset link.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaEnvelope /></span>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-4 w-full cursor-pointer">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </form>
      {emailSent && (
        <Button className="mt-4 w-full cursor-pointer" onClick={() => window.location.href = "/login"}>
          Go to Login
        </Button>
      )}
    </div>
  );
}
