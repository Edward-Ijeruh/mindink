"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [timer, setTimer] = useState(0);

  //Reset email function
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      toast.success("Password reset email sent!");
      setEmailSent(true);
      setTimer(60);
    } catch (err) {
      setError("Failed to send reset email. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //Timer listener
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="max-w-md mx-auto mt-10 text-center px-6">
      <h1 className="text-2xl font-bold mb-6">Reset Your Password</h1>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || success}
        />

        <button
          className="bg-blue-600 w-full text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          type="submit"
          disabled={loading || success}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        {emailSent && timer > 0 && (
          <p className="text-sm text-gray-500">
            You can resend the email in {timer} second{timer !== 1 && "s"}.
          </p>
        )}

        <p className="mt-4 text-sm text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
