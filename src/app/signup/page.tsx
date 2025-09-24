"use client";
import React, { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/../public/logo.png";
const SignupPage = () => {
  const [csrfToken, setCsrfToken] = useState("");
  // Fetch CSRF token on mount
  useEffect(() => {
    fetch("/api/csrf-token")
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const onSignUp = async () => {
    if (!otpVerified) {
      toast.error("Please verify your email first");
      return;
    }
    setUser({ email: "", username: "", password: "", confirmPassword: "" });
    setInputsDisabled(true);
    setUsernameError("");
    try {
      if (user.password !== user.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      setLoading(true);
      const response = await axios.post("/api/users/signup", {
        ...user,
        csrfToken,
      });
      toast.success("Signup successful");
      router.push("/login");
    } catch (err: any) {
      if (err.response?.data?.error) {
        const errorMsg = err.response.data.error;
        toast.error(errorMsg);
        if (errorMsg === "Username already taken") {
          setUsernameError("Username already taken");
        }
      } else {
        toast.error("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setEmailError("");
    if (!user.email) {
      toast.error("Please enter your email");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post("/api/users/emailotp/send", { email: user.email });
      if (res.data.message) {
        toast.success("OTP sent to your email");
        setOtpSent(true);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to send OTP";
      toast.error(errorMsg);
      if (errorMsg === "Email exists") {
        setEmailError("Email already exists");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Enter 6 digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post("/api/users/emailotp/verify", { email: user.email, otp });
      if (res.data.message) {
        toast.success("Email verified");
        setOtpVerified(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  };
  useEffect(() => {
    if (
      user.email.length > 0 &&
      user.username.length > 0 &&
      user.password.length > 0 &&
      user.confirmPassword.length > 0
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);
  // Email format validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);

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
            <img src={logo.src} alt="DailyNote Logo" className="h-15 mb-2 drop-shadow-lg" />
            <h1 className="text-3xl font-extrabold text-primary mb-1 tracking-tight">Create your account</h1>
            <p className="text-muted-foreground text-center text-base">Start your daily journey with a beautiful, secure account.</p>
          </div>
          <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onSignUp(); }}>
            <div className="flex gap-2 items-center relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaEnvelope /></span>
              <Input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={e => {
                  setUser({ ...user, email: e.target.value });
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtp("");
                  setEmailError("");
                }}
                className="pl-10 bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
                required
                disabled={inputsDisabled || otpVerified}
              />
              {!otpVerified && isEmailValid && (
                <Button
                  type="button"
                  size="sm"
                  className="ml-1 px-4 py-2 text-xs h-8 min-w-0 w-auto cursor-pointer"
                  disabled={otpLoading || otpSent}
                  onClick={sendOtp}
                  style={{ fontSize: "13px", padding: "0 12px" }}
                >
                  {otpLoading ? "..." : otpSent ? "✓" : "Send OTP"}
                </Button>
              )}
            </div>
            {emailError && (
              <div className="text-red-500 text-xs m-0">{emailError}</div>
            )}
            {/* OTP input below email */}
            {!otpVerified && otpSent && (
              <div className="flex gap-2 items-center relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaKey /></span>
                <Input
                  type="text"
                  placeholder="Enter 6 digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pl-10 bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150 mt-2"
                  maxLength={6}
                  disabled={otpLoading}
                />
                <Button
                  type="button"
                  size="sm"
                  className="ml-2 px-3 py-1 text-xs cursor-pointer"
                  disabled={otpLoading || otpVerified}
                  onClick={verifyOtp}
                >
                  {otpLoading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            )}
            {/* Always show rest of fields, but make them nonwritable until OTP is verified */}
            <div className="relative my-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaUser /></span>
              <Input
                type="text"
                placeholder="Username"
                value={user.username}
                onChange={e => {
                  setUser({ ...user, username: e.target.value });
                  setUsernameError("");
                }}
                className="pl-10 bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
                required
                disabled={inputsDisabled || !otpVerified}
              />
            </div>
            {usernameError && (
              <div className="text-red-500 text-xs m-0">{usernameError}</div>
            )}
            <div className="relative my-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaLock /></span>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={user.password}
                onChange={e => setUser({ ...user, password: e.target.value })}
                className="pl-10 pr-10 bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
                required
                disabled={inputsDisabled || !otpVerified}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash className="cursor-pointer" /> : <FaEye className="cursor-pointer" />}
              </span>
            </div>
            <div className="relative my-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg"><FaLock /></span>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={user.confirmPassword}
                onChange={e => setUser({ ...user, confirmPassword: e.target.value })}
                className="pl-10 pr-10 bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
                required
                disabled={inputsDisabled || !otpVerified}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash className="cursor-pointer" /> : <FaEye className="cursor-pointer" />}
              </span>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={buttonDisabled || loading || !otpVerified}
                className="w-full bg-primary text-primary-foreground rounded-xl py-2 font-semibold text-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </motion.div>
          </form>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Already have an account?{' '}
            <a href="/login" className="text-primary font-medium hover:underline">Login</a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
export default SignupPage;
