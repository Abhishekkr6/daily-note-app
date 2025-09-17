"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const VerifyEmailPage = () => {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const verifyUserEmail = async () => {
    setLoading(true);
    setError(false);
    setVerified(false);
    try {
      await axios.post("/api/users/verifyemail", { token, email });
      setVerified(true);
    } catch (error) {
      setError(true);
      setVerified(false);
      console.log(error.response?.data || error.message);
    }
    setLoading(false);
  };


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
        <div className="text-green-600">
          <p>Email verified successfully!</p>
          <a href="/login" className="mt-4 underline text-blue-600">Go to Login</a>
        </div>
      ) : error ? (
        <div className="text-red-600">
          <p>Email verification failed. Please check your link or try again.</p>
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
