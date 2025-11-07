"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import logo from "@/../public/logo.png";
import { StarsBackground } from "@/components/stars-background";
import { ShootingStars } from "@/components/shooting-stars";


const LoginPage = () => {
  const [agreed, setAgreed] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-6 bg-[#171717] text-white relative">
      <StarsBackground className="z-0 pointer-events-none" />
      <ShootingStars className="z-0 pointer-events-none" />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        className="w-full max-w-md mx-auto z-10"
      >
        <Card className="rounded-3xl shadow-2xl bg-[#232323] backdrop-blur-lg p-8 flex flex-col gap-6 border border-border text-white">
          <div className="flex flex-col items-center gap-2">
            <img src={logo.src} alt="DailyNote Logo" className="h-18 mb-2 drop-shadow-lg" />
            <h1 className="text-3xl font-extrabold text-primary mb-1 tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-center text-base">Sign in with Google or GitHub to continue.</p>
          </div>


          <div className="flex flex-col gap-3">
            <Button
              type="button"
              disabled={!agreed}
              onClick={() => {
                try { sessionStorage.setItem("justLoggedIn", "true"); } catch (e) { }
                signIn("google", { callbackUrl: "/home" });
              }}
              className="w-full bg-white text-black border border-gray-300 rounded-xl py-2 font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition-all duration-150"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={22} height={22} />
              <span className="tracking-wide">Sign in with <span className="font-bold">Google</span></span>
            </Button>

            <Button
              type="button"
              disabled={!agreed}
              onClick={() => {
                try { sessionStorage.setItem("justLoggedIn", "true"); } catch (e) { }
                signIn("github", { callbackUrl: "/home" });
              }}
              className="w-full bg-white text-black border border-gray-300 rounded-xl py-2 font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition-all duration-150"
            >
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" width={22} height={22} />
              <span className="tracking-wide">Sign in with <span className="font-bold">GitHub</span></span>
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-1 mb-1 ml-1">
            <Checkbox
              id="privacy-terms-login"
              checked={agreed}
              onCheckedChange={val => setAgreed(val === true)}
            />
            <Label htmlFor="privacy-terms-login" className="text-xs text-white/80">
              I agree to the <a href="/privacy" className="underline text-primary">Privacy Policy</a> and <a href="/terms" className="underline text-primary">Terms of Service</a>
            </Label>
          </div>

          <div className="text-center text-sm text-white/70 mt-2">
            Don't have an account? <a href="/signup" className="text-primary font-medium hover:underline">Sign up</a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
