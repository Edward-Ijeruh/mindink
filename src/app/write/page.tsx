"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { firestore } from "@/lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function WritePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to publish a post.");
      return;
    }

    let imageUrl = "";

    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
      formData.append("upload_preset", "unsigned_upload");
      formData.append("cloud_name", "dxprbozmm");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dxprbozmm/image/upload",
          {
            method: "POST",
            body: formData,
          },
        );
        const data = await res.json();
        imageUrl = data.secure_url;
      } catch (err) {
        toast.error("Image upload failed");
        console.error("Cloudinary upload error:", err);
        return;
      }
    }

    try {
      await addDoc(collection(firestore, "posts"), {
        title,
        content,
        image: imageUrl,
        createdAt: Timestamp.now(),
        author: {
          name: user.displayName || "Anonymous",
          id: user.uid,
        },
      });

      toast.success("Post published successfully!");
      router.push("/");
    } catch (err) {
      toast.error("Failed to publish post");
      console.error("Firestore post error:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Write a New Post ✍️</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 rounded border border-gray-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Content..."
          className="w-full p-3 h-40 rounded border border-gray-300"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-1/2 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-60"
        />

        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm mb-1 text-gray-600">Image Preview:</p>
            <img
              src={previewUrl}
              alt="Selected preview"
              className="rounded-md w-full max-h-60 object-cover border"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Publish
        </button>
      </form>
    </div>
  );
}
