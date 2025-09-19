"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const VerifyEmailPage = () => {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const verifyUserEmail = async () => {
    setLoading(true);
    setError(false);
    setVerified(false);
    try {
      await axios.post("/api/users/verifyemail", { token, email });
      setVerified(true);
    } catch (error) {
      setVerified(false);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "Something went wrong");
        console.log(error.response?.data || error.message);
      } else {
        setError("Something went wrong");
        console.log(error);
      }
    }
    setLoading(false);
  };
  useEffect(() => {
    if (verified) {
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verified]);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
    setEmail(params.get("email") || "");
  }, []);

  useEffect(() => {
    if (token && email) {
      verifyUserEmail();
    }
  }, [token, email]);

  const noToken = !token || !email;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      {noToken ? (
        <p className="text-red-600">No token found.</p>
      ) : loading ? (
        <p>Verifying your email...</p>
      ) : verified ? (
        <div className="flex flex-col items-center text-green-600">
          <span className="text-4xl">✅</span>
          <p className="mt-2">Your email has been verified successfully!</p>
          <a
            href="/login"
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
          >
            Go to Login
          </a>
        </div>
      ) : error ? (
        <div className="text-red-600">
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={verifyUserEmail}
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default VerifyEmailPage;
