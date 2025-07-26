"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [timer, setTimer] = useState(0);

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div
      className="max-w-4xl mx-auto flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      <div className="card w-full max-w-md">
        <h1 className="flex items-center justify-center gap-2 text-xl md:text-3xl font-bold mb-6 text-center text-[var(--text-primary)]">
          Reset Your Password <KeyRound className="w-6 h-6 md:w-8 md:h-8" />
        </h1>

        <form onSubmit={handleReset} className="space-y-5">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded-md border border-[var(--text-muted)] bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-md text-white bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={loading || success}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Timer */}
          {emailSent && timer > 0 && (
            <p className="text-sm text-center text-[var(--text-secondary)]">
              You can resend the email in {timer} second{timer !== 1 && "s"}.
            </p>
          )}

          {/* Back to login */}
          <p className="mt-4 text-sm text-center text-[var(--text-secondary)]">
            <Link
              href="/login"
              className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] font-medium cursor-pointer underline"
            >
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
