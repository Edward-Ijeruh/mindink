"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserRoundPlus } from "lucide-react";

interface SignupFormData {
  email: string;
  password: string;
  username: string;
  location?: string;
}

export default function SignupPage() {
  const { signup } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    username: "",
    location: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { email, password, username, location } = formData;
    if (!email || !password || !username) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, { username, location });
      toast.success("Account created!");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setError("Email is already in use.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      <div className="card w-full max-w-md">
        <h1 className="flex items-center justify-center gap-2 text-xl md:text-3xl font-bold mb-6 text-center text-[var(--text-primary)]">
          Create an Account <UserRoundPlus className="w-6 h-6 md:w-8 md:h-8" />
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={formData.username}
            disabled={loading}
            className="w-full p-3 rounded-md border border-[var(--text-muted)] bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
          />

          {/* Location */}
          <input
            type="text"
            name="location"
            placeholder="Location (optional)"
            onChange={handleChange}
            value={formData.location}
            disabled={loading}
            className="w-full p-3 rounded-md border border-[var(--text-muted)] bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={formData.email}
            disabled={loading}
            className="w-full p-3 rounded-md border border-[var(--text-muted)] bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              value={formData.password}
              disabled={loading}
              className="w-full p-3 rounded-md border border-[var(--text-muted)] bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md text-white bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          {/* Login Link */}
          <p className="text-sm text-center mt-4 text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] font-medium cursor-pointer underline"
            >
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
