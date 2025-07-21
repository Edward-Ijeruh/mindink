"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as { code: unknown }).code === "string"
      ) {
        const errorCode = (err as { code: string }).code;
        if (errorCode === "auth/user-not-found") {
          setError("No account found with this email.");
        } else if (errorCode === "auth/wrong-password") {
          setError("Incorrect password.");
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
        console.error("Unexpected error:", err);
      }
      setLoading(false);
      return;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 text-center px-6">
      <h1 className="text-2xl font-bold mb-6">Login to EchoMind 🧠</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 border rounded pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setPasswordVisible((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            disabled={loading}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          className="bg-blue-600 w-full text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          disabled={loading}
          type="submit"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Sign up here
          </Link>
        </p>
        <p className="mt-2 text-sm text-center">
          <Link
            href="/forgotPassword"
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Forgot your password?
          </Link>
        </p>
      </form>
    </div>
  );
}
