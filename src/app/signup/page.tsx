"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/useAuth";
import toast from "react-hot-toast";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Simple field validation
    if (!formData.email || !formData.password || !formData.username) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await signup(formData.email, formData.password, {
        username: formData.username,
        location: formData.location,
      });
      toast.success("Account created!");
    } catch (error: any) {
      console.error(error.message);
      toast.error(error.message || "Signup failed");
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
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
        )}
      </form>

      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
