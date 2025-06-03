"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Edit, Trash2 } from "lucide-react";
import Loader from "@/components/Loader";

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt?: Timestamp;
  author: {
    name: string;
    id?: string;
  };
}

export default function PostDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(firestore, "posts", id);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const data = postSnap.data();
        const fullPost: Post = {
          id: postSnap.id,
          title: data.title,
          content: data.content,
          image: data.image,
          createdAt: data.createdAt,
          author: data.author,
        };
        setPost(fullPost);
      }
    };

    if (id) fetchPost();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firestore, "posts", id));
      toast.success("Post deleted");
      router.push("/");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = () => {
    router.push(`/edit/${post?.id}`);
  };

  if (!post) return <Loader />;

  const isOwner = user?.uid === post.author.id;

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <button
        onClick={() => router.push("/")}
        className="flex items-center text-blue-600 cursor-pointer mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 object-cover rounded"
        />
      )}

      <h1 className="text-3xl font-bold mt-4">{post.title}</h1>
      <p className="text-sm text-gray-500 mt-1">by {post.author.name}</p>

      {/* ✅ Conditional Edit/Delete Buttons */}
      {isOwner && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mt-6 text-md text-gray-600 whitespace-pre-wrap">
        {post.content}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this post?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
