
"use client";

import React, { useEffect, useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import logo from "@/../public/logo.png";

const LoginPage = () => {
  const [csrfToken, setCsrfToken] = useState("");
  // Fetch CSRF token on mount
  useEffect(() => {
    fetch("/api/csrf-token")
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    setInputsDisabled(true);
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", {
        ...user,
        csrfToken,
      });
      toast.success("Login successful");
      // Redirect instantly after success
      setUser({ email: "", password: "" });
      window.location.href = "/home";
    } catch (err) {
      setInputsDisabled(false);
      toast.error((err as any).response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setButtonDisabled(!(user.email && user.password));
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-6" style={{
      background: "linear-gradient(135deg, #fefce8 0%, #f0fdf4 100%)",
      position: "relative"
    }}>
      {/* Accent blob */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-0 w-72 h-72 bg-primary/30 rounded-full blur-3xl z-0"
        style={{ filter: "blur(80px)", pointerEvents: "none" }}
      />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        className="w-full max-w-md mx-auto z-10"
      >
        <Card className="rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg p-8 flex flex-col gap-6 border border-border">
          <div className="flex flex-col items-center gap-2">
            <img src={logo.src} alt="DailyNote Logo" className="h-18 mb-2 drop-shadow-lg" />
            <h1 className="text-3xl font-extrabold text-primary mb-1 tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-center text-base">Log in to continue your daily journey.</p>
          </div>
          <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onLogin(); }}>
            <Label className="text-base font-medium">Email</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaEnvelope /></span>
              <Input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={e => setUser({ ...user, email: e.target.value })}
                className="pl-10 bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
                required
                disabled={inputsDisabled}
              />
            </div>
            <Label className="text-base font-medium">Password</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaLock /></span>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={user.password}
                onChange={e => setUser({ ...user, password: e.target.value })}
                className="pl-10 pr-10 bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
                required
                disabled={inputsDisabled}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash className="cursor-pointer" /> : <FaEye className="cursor-pointer" />}
              </span>
            </div>
            <div className="text-right mb-2">
              <a href="/forgot-password" className="text-primary font-medium hover:underline text-sm">Forgot Password?</a>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={buttonDisabled || loading}
                className="w-full bg-primary text-primary-foreground rounded-xl py-2 font-semibold text-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </motion.div>
          </form>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary font-medium hover:underline">Sign up</a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
