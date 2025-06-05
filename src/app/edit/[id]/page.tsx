"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

export default function EditPostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const postRef = doc(firestore, "posts", id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const data = postSnap.data();

          if (data.author?.id !== user?.uid) {
            toast.error("You are not authorized to edit this post.");
            router.push("/");
            return;
          }

          setTitle(data.title);
          setContent(data.content);
          setImageUrl(data.image || null);
        } else {
          toast.error("Post not found.");
          router.push("/");
        }
      } catch (err) {
        console.error("Failed to fetch post:", err);
        toast.error("Error fetching post.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPost();
  }, [id, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const deleteFromCloudinary = async (imageUrl: string) => {
    try {
      const publicId = imageUrl.split("/").pop()?.split(".")[0];
      if (!publicId) return;

      await fetch("/api/delete-image", {
        method: "POST",
        body: JSON.stringify({ publicId }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("Failed to delete old Cloudinary image:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let newImageUrl = imageUrl;

    try {
      // Upload new image if selected
      if (selectedImage) {
        // Delete old image
        if (imageUrl) {
          await deleteFromCloudinary(imageUrl);
        }

        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("upload_preset", "unsigned_upload");
        formData.append("cloud_name", "dxprbozmm");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dxprbozmm/image/upload",
          {
            method: "POST",
            body: formData,
          },
        );
        const data = await res.json();

        if (!data.secure_url) throw new Error("Cloudinary upload failed");
        newImageUrl = data.secure_url;
      }

      await updateDoc(doc(firestore, "posts", id), {
        title,
        content,
        image: newImageUrl,
        updatedAt: new Date(),
      });

      toast.success("Post updated!");
      router.push(`/posts/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => router.push(`/posts/${id}`);

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Post ✍️</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {imageUrl && !previewUrl && (
          <img
            src={imageUrl}
            alt="Current"
            className="w-full max-h-60 object-cover rounded border"
          />
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="New preview"
            className="w-full max-h-60 object-cover rounded border"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-1/2 p-2 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600"
          disabled={submitting}
        />

        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 rounded border border-gray-300"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={submitting}
        />

        <textarea
          placeholder="Content..."
          className="w-full p-3 h-40 rounded border border-gray-300"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={submitting}
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
