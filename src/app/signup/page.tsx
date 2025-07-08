"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

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

    if (!formData.email || !formData.password || !formData.username) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, {
        username: formData.username,
        location: formData.location,
      });
      toast.success("Account created!");
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code: unknown }).code === "string"
      ) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === "auth/email-already-in-use") {
          setError("Email is already in use.");
        } else if (errorCode === "auth/weak-password") {
          setError("Password is too weak.");
        } else {
          setError("Signup failed. Please try again.");
        }
      }
      setLoading(false);
      return;
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          disabled={loading}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          disabled={loading}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          disabled={loading}
        />

        <div className="relative">
          <input
            type={passwordVisible ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded pr-10"
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
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
        )}
      </form>

      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-600 hover:underline cursor-pointer"
        >
          Log in
        </Link>
      </p>
    </main>
  );
}
