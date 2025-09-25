"use client";
import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaKey,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { userSchema } from "@/schemas/user.schema";
import { motion } from "framer-motion";
import logo from "@/../public/logo.png";
const SignupPage = () => {
  // Username validation using userSchema
  const usernameFieldSchema = userSchema.shape.username;
  const emailFieldSchema = userSchema.shape.email;
  const passwordFieldSchema = userSchema.shape.password;
  // Track if user has interacted with email/username for global blur
  const [emailInteracted, setEmailInteracted] = useState(false);
  const [usernameInteracted, setUsernameInteracted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);

  // Password and confirm password error/interacted states
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordInteracted, setPasswordInteracted] = useState(false);
  const [confirmPasswordInteracted, setConfirmPasswordInteracted] =
    useState(false);

  // Global blur handler to show error if user clicks outside after touching input
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        emailInteracted &&
        emailError &&
        !document.activeElement?.matches('input[type="email"]')
      ) {
        setEmailTouched(true);
      }
      if (
        passwordInteracted &&
        passwordError &&
        !document.activeElement?.matches('input[placeholder="Password"]')
      ) {
        setPasswordTouched(true);
      }
      if (
        confirmPasswordInteracted &&
        confirmPasswordError &&
        !document.activeElement?.matches(
          'input[placeholder="Confirm Password"]'
        )
      ) {
        setConfirmPasswordTouched(true);
      }
      if (
        usernameInteracted &&
        usernameError &&
        !document.activeElement?.matches('input[placeholder="Username"]')
      ) {
        setUsernameTouched(true);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [
    emailInteracted,
    usernameInteracted,
    emailError,
    usernameError,
    passwordInteracted,
    passwordError,
    confirmPasswordInteracted,
    confirmPasswordError,
  ]);
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
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [inputsDisabled, setInputsDisabled] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const onSignUp = async () => {
    // Final username validation before signup
    try {
      usernameFieldSchema.parse(user.username);
    } catch (err: any) {
      setUsernameError(err.errors?.[0]?.message || "Invalid username");
      setInputsDisabled(false);
      toast.error(err.errors?.[0]?.message || "Invalid username");
      return;
    }
    if (!otpVerified) {
      toast.error("Please verify your email first");
      return;
    }
    setInputsDisabled(true);
    // Do not clear usernameError here; rely on validation
    setEmailError("");
    try {
      if (user.password !== user.confirmPassword) {
        toast.error("Passwords do not match");
        setInputsDisabled(false);
        return;
      }
      setPasswordError("");
      setConfirmPasswordError("");
      if (
        !user.username ||
        !user.email ||
        !user.password ||
        !user.confirmPassword
      ) {
        toast.error("All fields are required");
        if (!user.username) setUsernameError("Username is required");
        if (!user.email) setEmailError("Email is required");
        setInputsDisabled(false);
        return;
      }
      setLoading(true);
      const response = await axios.post("/api/users/signup", {
        ...user,
        csrfToken,
      });
      toast.success("Signup successful");
      setUser({ email: "", username: "", password: "", confirmPassword: "" });
      setEmailError("");
      setUsernameError("");
      setPasswordError("");
      setConfirmPasswordError("");
      setEmailTouched(false);
      setUsernameTouched(false);
      setPasswordTouched(false);
      setConfirmPasswordTouched(false);
      setEmailInteracted(false);
      setUsernameInteracted(false);
      setPasswordInteracted(false);
      setConfirmPasswordInteracted(false);
      router.push("/login");
    } catch (err: any) {
      setInputsDisabled(false);
      if (err.response?.data?.error) {
        const errorMsg = err.response.data.error.toLowerCase();
        // Username errors
        if (errorMsg.includes("username")) {
          if (errorMsg.includes("taken") || errorMsg.includes("exists")) {
            setUsernameError("Username already exists");
            toast.error("Username already exists");
          } else if (errorMsg.includes("required")) {
            setUsernameError("Username is required");
            toast.error("Username is required");
          } else if (errorMsg.includes("minlength")) {
            setUsernameError("Username too short");
            toast.error("Username too short");
          } else if (errorMsg.includes("maxlength")) {
            setUsernameError("Username too long");
            toast.error("Username too long");
          } else {
            setUsernameError("Invalid username");
            toast.error("Invalid username");
          }
        }
        // Email errors
        else if (errorMsg.includes("email")) {
          if (errorMsg.includes("registered") || errorMsg.includes("exists")) {
            setEmailError("Email already exists");
            toast.error("Email already exists");
          } else if (errorMsg.includes("required")) {
            setEmailError("Email is required");
            toast.error("Email is required");
          } else if (errorMsg.includes("valid")) {
            setEmailError("Invalid email");
            toast.error("Invalid email");
          } else {
            setEmailError("Invalid email");
            toast.error("Invalid email");
          }
        } else {
          toast.error("Signup failed");
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
      const res = await axios.post("/api/users/emailotp/send", {
        email: user.email,
      });
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
    setOtpError("");
    if (!otp || otp.length !== 6) {
      setOtpError("Enter 6 digit OTP");
      toast.error("Enter 6 digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post("/api/users/emailotp/verify", {
        email: user.email,
        otp,
      });
      if (res.data.message) {
        toast.success("Email verified");
        setOtpVerified(true);
        setOtpError("");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to verify OTP";
      setOtpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setOtpLoading(false);
    }
  };
  useEffect(() => {
    // Realtime username validation using updated schema (special char restriction)
    if (user.username.length === 0 && usernameTouched) {
      setUsernameError("Username is required");
    } else if (user.username.length > 0) {
      try {
        usernameFieldSchema.parse(user.username);
        setUsernameError("");
      } catch (err: any) {
        if (err.errors && err.errors.length > 0) {
          setUsernameError(err.errors[0].message);
        } else {
          setUsernameError("Invalid username");
        }
      }
    }

    // Email validation
    if (user.email.length === 0 && emailTouched) {
      setEmailError("Email is required");
    } else if (user.email.length > 0) {
      try {
        emailFieldSchema.parse(user.email);
        setEmailError("");
      } catch (err: any) {
        setEmailError(err.errors?.[0]?.message || "Invalid email");
      }
    }

    // Password validation
    if (user.password.length === 0 && passwordTouched) {
      setPasswordError("Password is required");
    } else if (user.password.length > 0) {
      try {
        passwordFieldSchema.parse(user.password);
        setPasswordError("");
      } catch (err: any) {
        setPasswordError(err.errors?.[0]?.message || "Invalid password");
      }
    }

    // Confirm password validation
    if (user.confirmPassword.length === 0 && confirmPasswordTouched) {
      setConfirmPasswordError("Confirm password is required");
    } else if (user.confirmPassword.length > 0) {
      if (user.password !== user.confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }

    // Button is disabled if any field is empty or any error exists
    const hasError =
      emailError ||
      usernameError ||
      passwordError ||
      confirmPasswordError ||
      !user.email ||
      !user.username ||
      !user.password ||
      !user.confirmPassword;
    setButtonDisabled(!!hasError);
  }, [
    user,
    emailError,
    passwordError,
    confirmPasswordError,
    usernameTouched,
    emailTouched,
    passwordTouched,
    confirmPasswordTouched,
  ]);
  // Email format validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);

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
              className="h-15 mb-2 drop-shadow-lg"
            />
            <h1 className="text-3xl font-extrabold text-primary mb-1 tracking-tight">
              Create your account
            </h1>
            <p className="text-muted-foreground text-center text-base">
              Start your daily journey with a beautiful, secure account.
            </p>
          </div>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSignUp();
            }}
          >
            <div className="flex gap-2 items-center relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                <FaEnvelope />
              </span>
              <Input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => {
                  setUser({ ...user, email: e.target.value });
                  setOtpSent(false);
                  setOtpVerified(false);
                  setOtp("");
                  if (emailTouched) setEmailError("");
                  setEmailInteracted(true);
                }}
                onBlur={() => setEmailTouched(true)}
                className={`pl-10 bg-input border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150 ${
                  emailTouched && emailError
                    ? "border-red-500"
                    : "border-border"
                }`}
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
            {(emailTouched || (emailInteracted && emailError)) &&
              emailError && (
                <div
                  className="absolute left-0 w-full text-red-500 text-xs"
                  style={{ top: "100%", marginTop: "2px", lineHeight: "1" }}
                >
                  {emailError}
                </div>
              )}
            {/* OTP input below email */}
            {!otpVerified && otpSent && (
              <div className="flex gap-2 items-center relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                  <FaKey />
                </span>
                <Input
                  type="text"
                  placeholder="Enter 6 digit OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (otpError) setOtpError("");
                  }}
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
                {otpError && (
                  <div
                    className="absolute left-0 w-full text-red-500 text-xs"
                    style={{
                      top: "100%",
                      marginTop: "8px",
                      marginLeft: "10px",
                      lineHeight: "1",
                    }}
                  >
                    {otpError}
                  </div>
                )}
              </div>
            )}
            {/* Always show rest of fields, but make them nonwritable until OTP is verified */}
            <div className="relative my-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                <FaUser />
              </span>
              <Input
                type="text"
                placeholder="Username"
                value={user.username}
                onChange={(e) => {
                  setUser({ ...user, username: e.target.value });
                  setUsernameInteracted(true);
                }}
                onBlur={() => {
                  setUsernameTouched(true);
                  // Validate on blur as well
                  try {
                    usernameFieldSchema.parse(user.username);
                    setUsernameError("");
                  } catch (err: any) {
                    if (err.errors && err.errors.length > 0) {
                      setUsernameError(err.errors[0].message);
                    } else {
                      setUsernameError("Invalid username");
                    }
                  }
                }}
                className={`pl-10 bg-input border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150 ${
                  usernameTouched && usernameError
                    ? "border-red-500"
                    : "border-border"
                }`}
                required
                disabled={inputsDisabled || !otpVerified}
              />
              {(usernameTouched || user.username.length > 0) &&
                usernameError && (
                  <div
                    className="absolute left-0 w-full text-red-500 text-xs"
                    style={{
                      top: "100%",
                      marginTop: "8px",
                      marginLeft: "10px",
                      lineHeight: "1",
                    }}
                  >
                    {usernameError}
                  </div>
                )}
            </div>
            <div className="relative my-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                <FaLock />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={user.password}
                onChange={(e) => {
                  setUser({ ...user, password: e.target.value });
                  setPasswordTouched(true); // Show error as soon as user types
                }}
                onBlur={() => setPasswordTouched(true)}
                className="pl-10 pr-10 bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
                required
                disabled={inputsDisabled || !otpVerified}
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
              {(passwordTouched || (passwordInteracted && passwordError)) &&
                passwordError && (
                  <div
                    className="absolute left-0 w-full text-red-500 text-xs"
                    style={{
                      top: "100%",
                      marginTop: "10px",
                      marginLeft: "10px",
                      lineHeight: "1",
                    }}
                  >
                    {passwordError}
                  </div>
                )}
            </div>
            <div className="relative my-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">
                <FaLock />
              </span>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={user.confirmPassword}
                onChange={(e) => {
                  setUser({ ...user, confirmPassword: e.target.value });
                  if (confirmPasswordTouched) setConfirmPasswordError("");
                  setConfirmPasswordInteracted(true);
                }}
                onBlur={() => setConfirmPasswordTouched(true)}
                className={`pl-10 pr-10 bg-input border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150 ${
                  confirmPasswordTouched &&
                  (confirmPasswordError ||
                    (user.confirmPassword &&
                      user.password !== user.confirmPassword))
                    ? "border-red-500"
                    : "border-border"
                }`}
                required
                disabled={inputsDisabled || !otpVerified}
              />
              {(confirmPasswordTouched || confirmPasswordInteracted) &&
                (confirmPasswordError ||
                  (user.confirmPassword &&
                    user.password !== user.confirmPassword)) && (
                  <div
                    className="absolute left-0 w-full text-red-500 text-xs"
                    style={{
                      top: "100%",
                      marginTop: "10px",
                      marginLeft: "10px",
                      lineHeight: "1",
                    }}
                  >
                    {confirmPasswordError || "Passwords do not match"}
                  </div>
                )}
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-lg cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="cursor-pointer" />
                ) : (
                  <FaEye className="cursor-pointer" />
                )}
              </span>
            </div>
            <Button
              type="submit"
              disabled={buttonDisabled || loading || !otpVerified}
              className="w-full bg-primary text-primary-foreground rounded-xl py-2 font-semibold text-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Login
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
export default SignupPage;
