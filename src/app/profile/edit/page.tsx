"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    location: "",
    bio: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          username: data.username || "",
          location: data.location || "",
          bio: data.bio || "",
        });
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const docRef = doc(firestore, "users", user.uid);
      await updateDoc(docRef, formData);
      localStorage.setItem(
        "userProfile",
        JSON.stringify({ ...formData, email: user.email }),
      );
      toast.success("Profile updated!");
      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm hover:underline cursor-pointer"
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-1 w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-center flex-1">
          Edit Profile
        </h1>
        <div className="w-8 md:w-12 lg:w-16" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full px-4 py-2 border rounded h-24"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 cursor-pointer text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
