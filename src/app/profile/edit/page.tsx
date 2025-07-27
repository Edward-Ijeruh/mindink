"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Edit } from "lucide-react";

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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        JSON.stringify({ ...formData, email: user.email })
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

  const handleCancel = () => router.push(`/profile}`);

  return (
    <main className="max-w-6xl mx-auto">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] rounded-[var(--card-radius)] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="flex items-center gap-2 text-xl md:text-3xl font-bold text-[var(--text-primary)]">
            Edit Profile <Edit className="w-6 h-6 md:w-8 md:h-8" />
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-[var(--text-muted)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-[var(--text-muted)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-[var(--text-muted)] rounded-lg text-[var(--text-primary)] h-24 focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
          />

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[var(--accent-main)] text-white py-2 rounded-lg hover:bg-[var(--accent-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 rounded font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--text-muted)",
                color: "#fff",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
