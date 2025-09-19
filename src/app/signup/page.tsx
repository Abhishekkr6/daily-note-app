"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import logo from "@/../public/logo.png";
const SignupPage = () => {
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
  const onSignUp = async () => {
    // Clear and disable inputs immediately on button click
    setUser({ email: "", username: "", password: "", confirmPassword: "" });
    setInputsDisabled(true);
    try {
      if (user.password !== user.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      setLoading(true);
      const response = await axios.post("/api/users/signup", user);
      toast.success("Signup successful");
      // Redirect instantly after success
      router.push("/login");
    } catch (err: any) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Signup failed");
      }
    } finally {
      setLoading(false);
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
            <Input
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={e => setUser({ ...user, email: e.target.value })}
              className="bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
              required
              disabled={inputsDisabled}
            />
            <Input
              type="text"
              placeholder="Username"
              value={user.username}
              onChange={e => setUser({ ...user, username: e.target.value })}
              className="bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
              required
              disabled={inputsDisabled}
            />
            <Input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={e => setUser({ ...user, password: e.target.value })}
              className="bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
              required
              disabled={inputsDisabled}
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={user.confirmPassword}
              onChange={e => setUser({ ...user, confirmPassword: e.target.value })}
              className="bg-input border border-border focus:ring-2 focus:ring-primary focus:border-primary rounded-xl transition-all duration-150"
              required
              disabled={inputsDisabled}
            />
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={buttonDisabled || loading}
                className="w-full bg-primary text-primary-foreground rounded-xl py-2 font-semibold text-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
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
