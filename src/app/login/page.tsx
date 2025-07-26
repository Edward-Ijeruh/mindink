"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";
import { Eye, EyeOff, DoorOpen } from "lucide-react";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      toast.success("Logged in successfully!");
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code;
      switch (errorCode) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      <div className="card w-full max-w-md">
        <h1 className="flex items-center justify-center gap-2 text-xl md:text-3xl font-bold mb-6 text-center text-[var(--text-primary)]">
          Login <DoorOpen className="w-6 h-6 md:w-8 md:h-8" />
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-md border border-[var(--text-muted)] bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          {/* Password */}
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 rounded-md border border-[var(--text-muted)] bg-white text-[var(--text-primary)] placeholder-[var(--text-muted)] pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer py-3 rounded-md text-white bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Links */}
          <p className="text-sm text-center mt-4 mb-1 text-[var(--text-secondary)]">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] font-medium cursor-pointer underline"
            >
              Sign up here
            </Link>
          </p>

          <p className="text-sm text-center text-[var(--text-secondary)]">
            <Link
              href="/forgotPassword"
              className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] font-medium cursor-pointer underline"
            >
              Forgot your password?
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
