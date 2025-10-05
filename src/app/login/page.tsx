"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/schemas/login.schema";
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
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));
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
  // Error and touched states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailInteracted, setEmailInteracted] = useState(false);
  const [passwordInteracted, setPasswordInteracted] = useState(false);

  const onLogin = async () => {
    // Final validation before login
    try {
      loginSchema.shape.email.parse(user.email);
    } catch (err: any) {
      setEmailError(err.errors?.[0]?.message || "Invalid email");
      setInputsDisabled(false);
      toast.error(err.errors?.[0]?.message || "Invalid email");
      return;
    }
    try {
      loginSchema.shape.password.parse(user.password);
    } catch (err: any) {
      setPasswordError(err.errors?.[0]?.message || "Invalid password");
      setInputsDisabled(false);
      toast.error(err.errors?.[0]?.message || "Invalid password");
      return;
    }
    setInputsDisabled(true);
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", {
        ...user,
        csrfToken,
      });
  toast.success("Login successful");
  setUser({ email: "", password: "" });
  setEmailTouched(false);
  setPasswordTouched(false);
  setEmailInteracted(false);
  setPasswordInteracted(false);
  router.push("/home");
    } catch (err) {
      const errorMsg = (err as any).response?.data?.error || "Login failed";
      // Show error for correct field
      if (
        errorMsg.toLowerCase().includes("email") ||
        errorMsg.toLowerCase().includes("user does not exists") ||
        errorMsg.toLowerCase().includes("user does not exist") ||
        errorMsg.toLowerCase().includes("user")
      ) {
  setEmailError(errorMsg);
  console.log('Email error set:', errorMsg);
        setLoading(false);
      } else if (
        errorMsg.toLowerCase().includes("password") ||
        errorMsg.toLowerCase().includes("incorrect") ||
        errorMsg.toLowerCase().includes("mismatch") ||
        errorMsg.toLowerCase().includes("check your credentials")
      ) {
  setPasswordError("Wrong password");
  console.log('Password error set: Wrong password');
        setPasswordTouched(true);
        setLoading(false);
      }
      toast.error(errorMsg);
      setInputsDisabled(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    // Realtime email validation
    if (user.email.length === 0 && emailTouched) {
          setEmailError("Email is required");
    } else if (user.email.length > 0) {
      try {
        loginSchema.shape.email.parse(user.email);
            // Sirf frontend validation error clear karein, backend error ko na
            if (
              emailError === "Invalid email" ||
              emailError === "Email is required"
            ) {
              setEmailError("");
            }
      } catch (err: any) {
        setEmailError(err.errors?.[0]?.message || "Invalid email");
      }
    }
    // Realtime password validation
    if (user.password.length === 0 && passwordTouched) {
      setPasswordError("Password is required");
    } else if (user.password.length > 0) {
      try {
        loginSchema.shape.password.parse(user.password);
        // Only clear error if it's not 'Wrong password' (set by backend)
        if (passwordError !== "Wrong password") {
          setPasswordError("");
        }
      } catch (err: any) {
        setPasswordError(err.errors?.[0]?.message || "Invalid password");
      }
    }
    // Button disabled if any error or empty field
    const hasError =
      emailError || passwordError || !user.email || !user.password;
    setButtonDisabled(!!hasError);
  }, [user, emailError, passwordError, emailTouched, passwordTouched]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-2 sm:px-6"
      style={{
        background: "linear-gradient(135deg, #fefce8 0%, #f0fdf4 100%)",
        position: "relative",
      }}
    >
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
            <img
              src={logo.src}
              alt="DailyNote Logo"
              className="h-18 mb-2 drop-shadow-lg"
            />
            <h1 className="text-3xl font-extrabold text-primary mb-1 tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-center text-base">
              Log in to continue your daily journey.
            </p>
          </div>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
          >
            <Label className="text-base font-medium">Email</Label>
            <div className="relative" style={{ position: 'relative' }}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                <FaEnvelope />
              </span>
              <Input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => {
                  setUser({ ...user, email: e.target.value });
                  setEmailInteracted(true);
                  setEmailError("");
                  setLoading(false);
                }}
                onBlur={async () => {
                  setEmailTouched(true);
                  // Only check if email format is valid
                  try {
                    loginSchema.shape.email.parse(user.email);
                    // Check email existence
                    const res = await axios.post("/api/users/check-email", { email: user.email });
                    if (!res.data.exists) {
                      setEmailError("Email not found");
                    } else {
                      setEmailError("");
                    }
                  } catch (err) {
                    setEmailError("Invalid email");
                  }
                }}
                className={`pl-10 bg-input border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150 ${
                  emailTouched && emailError
                    ? "border-red-500"
                    : "border-border"
                }`}
                required
                disabled={inputsDisabled}
              />
              {emailError && (
                <div
                  className="absolute left-0 w-full text-red-500 text-xs"
                  style={{
                    top: "100%",
                    marginTop: "5px",
                    marginLeft: "8px",
                    lineHeight: "1",
                  }}
                >
                  {emailError}
                </div>
              )}
            </div>
            <Label className="text-base font-medium">Password</Label>
            <div className="relative" style={{ position: 'relative' }}>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                <FaLock />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={user.password}
                onChange={(e) => {
                  setUser({ ...user, password: e.target.value });
                  setPasswordTouched(true);
                  setPasswordInteracted(true);
                  setPasswordError("");
                  setLoading(false);
                }}
                onBlur={() => setPasswordTouched(true)}
                className={`pl-10 pr-10 bg-input border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150 ${
                  passwordTouched && passwordError
                    ? "border-red-500"
                    : "border-border"
                }`}
                required
                disabled={inputsDisabled}
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <FaEyeSlash className="cursor-pointer" />
                ) : (
                  <FaEye className="cursor-pointer" />
                )}
              </span>
              {passwordError && (
                <div
                  className="absolute left-0 w-full text-red-500 text-xs"
                  style={{
                    top: "100%",
                    marginTop: "10px",
                    marginLeft: "8px",
                    lineHeight: "1",
                  }}
                >
                  {passwordError}
                </div>
              )}
            </div>
            <div className="text-right mb-2">
              <a
                href="/forgot-password"
                className="text-primary font-medium hover:underline text-sm"
              >
                Forgot Password?
              </a>
            </div>
            <div>
              <Button
                type="submit"
                disabled={buttonDisabled || loading}
                className="w-full bg-primary text-primary-foreground rounded-xl py-2 font-semibold text-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <div className="flex flex-col gap-2 mt-6">
                <div className="flex items-center mb-2">
                  <div className="flex-grow h-px bg-gray-300" />
                  <span className="mx-3 text-gray-400 font-semibold text-sm select-none">OR</span>
                  <div className="flex-grow h-px bg-gray-300" />
                </div>
                <Button
                  type="button"
                  className="w-full bg-white text-black border border-gray-300 rounded-xl py-2 font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition-all duration-150 group cursor-pointer no-hover-bg"
                  onClick={() => signIn("google")}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={22} height={22} className="group-hover:scale-110 transition-transform duration-150" />
                  <span className="tracking-wide">Sign in with <span className="font-bold">Google</span></span>
                </Button>
                <Button
                  type="button"
                  className="w-full bg-white text-black border border-gray-300 rounded-xl py-2 font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition-all duration-150 group cursor-pointer no-hover-bg"
                  onClick={() => signIn("github")}
                >
                  <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" width={22} height={22} className="group-hover:scale-110 transition-transform duration-150" />
                  <span className="tracking-wide">Sign in with <span className="font-bold">GitHub</span></span>
                </Button>
              </div>
            </div>
          </form>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
