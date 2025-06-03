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
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const postRef = doc(firestore, "posts", id);
      await updateDoc(postRef, {
        title,
        content,
        updatedAt: new Date(),
      });

      toast.success("Post updated!");
      router.push(`/posts/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update post.");
    }
  };

  const handleCancel = () => {
    router.push(`/posts/${id}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Post ✍️</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-3 rounded border border-gray-300 text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content..."
          className="w-full p-3 h-40 rounded border border-gray-300 text-white"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
