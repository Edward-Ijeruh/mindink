"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setError(null); // Reset error before login attempt
      await login(email, password);
      toast.success("Logged in successfully!");
    } catch (err: any) {
      // Firebase Auth error messages
      if (err.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 text-center px-6">
      <h1 className="text-2xl font-bold mb-6">Login to MindInk 🧠</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 w-full text-white py-2 px-4 rounded hover:bg-blue-700">
          Login
        </button>

        {/* Error message */}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <p className="mt-4 text-sm text-center">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
