"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Edit, Trash2, User2 } from "lucide-react";
import Loader from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt?: {
    seconds: number;
  };
  author: {
    name: string;
    id?: string;
  };
  tags?: string[];
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
          tags: data.tags || [],
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
    <main className="max-w-6xl mx-auto">
      <div className="relative bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-md text-[var(--card-text)]">
        {/* Top: Back Button & Actions */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push("/")}
            className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] text-sm font-medium underline underline-offset-2 cursor-pointer"
          >
            Back
          </button>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-3 py-2 rounded-lg border border-[var(--border-glass)] text-[var(--text-secondary)] hover:bg-[var(--accent-hover)]/10 transition cursor-pointer"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Image */}
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 md:h-80 object-cover rounded-xl mb-6"
          />
        )}

        {/* Details */}
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] mb-2 pb-2 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-2">
            <User2 size={15} />
            <span>{post.author?.name || "You"}</span>
          </div>
          <span>
            {post.createdAt
              ? new Date(post.createdAt.seconds * 1000).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )
              : "Unknown"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">
          {post.title}
        </h1>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-[var(--accent-main)]/10 text-xs text-[var(--accent-main)] px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="text-md text-[var(--text-secondary)] whitespace-pre-wrap mb-4">
          {post.content}
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--card-bg)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-2xl p-6 max-w-sm w-11/12 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-3">Confirm Deletion</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] hover:bg-[var(--accent-hover)]/10 transition text-sm text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-red-400 bg-red-100 text-red-700 hover:bg-red-200 transition text-sm cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
