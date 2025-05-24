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
    profileImage: "",
    bio: "",
  });

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
          profileImage: data.profileImage || "",
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

    const docRef = doc(firestore, "users", user.uid);
    await updateDoc(docRef, formData);
    localStorage.setItem(
      "userProfile",
      JSON.stringify({ ...formData, email: user.email }),
    );
    toast.success("Profile updated!");
    router.push("/profile");
  };

  return (
    <main className="max-w-md mx-auto mt-10 px-4">
      {/* Header with Back button and Title */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          Back
        </button>
        <h1 className="text-xl font-semibold text-center flex-1">
          Edit Profile
        </h1>
        <div className="w-12" /> {/* Spacer for layout balance */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="profileImage"
          placeholder="Profile Image URL"
          value={formData.profileImage}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded h-24"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
