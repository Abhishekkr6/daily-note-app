"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const SignupPage = () => {
  const router = useRouter();

  const [user, setUser] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",   // ✅ add confirmPassword inside state
  });

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    try {
      // ✅ frontend check
      if (user.password !== user.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setLoading(true);
      const response = await axios.post("/api/users/signup", user);
      console.log("Signup success", response.data);
      toast.success("Signup successful");
      router.push("/login");
    } catch (err) {
      console.log("Signup failed", err);
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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Signup</h1>
      <div className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={user.username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          className="border px-4 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          className="border px-4 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={user.confirmPassword}
          onChange={(e) =>
            setUser({ ...user, confirmPassword: e.target.value })
          }
          className="border px-4 py-2 rounded"
        />
        <button
          onClick={onSignUp}
          disabled={buttonDisabled || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
