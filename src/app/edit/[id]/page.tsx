"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { motion } from "framer-motion";
import { Edit } from "lucide-react";
import { availableTags } from "@/lib/tags";

export default function EditPostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
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
          setSelectedTags(data.tags || []);
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

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      toast.error("You can only select up to 3 tags.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let newImageUrl = imageUrl;

    try {
      if (selectedImage) {
        if (imageUrl) {
          await deleteFromCloudinary(imageUrl);
        }

        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );
        formData.append(
          "cloud_name",
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
        );
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();

        if (!data.secure_url) throw new Error("Cloudinary upload failed");
        newImageUrl = data.secure_url;
      }

      await updateDoc(doc(firestore, "posts", id), {
        title,
        content,
        image: newImageUrl,
        tags: selectedTags,
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

  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div
        className="p-6 rounded-[var(--card-radius)] shadow-lg border"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--card-border)",
          color: "var(--card-text)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <h1 className="flex items-center gap-2 text-xl md:text-3xl font-bold mb-6 text-[var(--text-primary)]">
          Edit Post <Edit className="w-6 h-6 md:w-8 md:h-8" />
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image */}
          {imageUrl && !previewUrl && (
            <img
              src={imageUrl}
              alt="Current"
              className="w-full max-h-80 max-w-80 object-cover rounded border focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
              style={{ borderColor: "var(--card-border)" }}
            />
          )}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="New preview"
              className="w-full max-h-60 object-cover rounded border"
              style={{ borderColor: "var(--text-muted)" }}
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-1/2 p-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            style={{
              borderColor: "var(--text-muted))",
              backgroundColor: "var(--bg-dark)",
            }}
            disabled={submitting}
          />

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            className="w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            style={{
              borderColor: "var(--text-muted)",
              color: "var(--text-primary)",
            }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={submitting}
          />

          {/* Content */}
          <textarea
            placeholder="Content..."
            className="w-full p-3 h-40 rounded border focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            style={{
              borderColor: "var(--text-muted)",
              color: "var(--text-primary)",
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={submitting}
          />

          {/* Tags */}
          <div>
            <label className="block mb-2 text-[var(--text-primary)] font-medium">
              Edit Tags (max 3)
            </label>
            <input
              type="text"
              placeholder="Search tags..."
              className="w-full p-2 mb-3 rounded border focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
              style={{
                borderColor: "var(--text-muted)",
                color: "var(--text-primary)",
              }}
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              disabled={submitting}
            />

            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[var(--accent-main)]/10 text-[var(--accent-main) px-2 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer"
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag} ✕
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {filteredTags.map((tag) => (
                <motion.span
                  key={tag}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTagSelect(tag)}
                  className={`px-3 py-1 rounded-full text-xs cursor-pointer ${
                    selectedTags.includes(tag)
                      ? "bg-[var(--accent-main)] text-white"
                      : "bg-[var(--accent-main)]/10 text-[var(--accent-main)] hover:bg-[var(--accent-main)]/20"
                  }`}
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-3 rounded font-medium transition cursor-pointer"
              style={{
                backgroundColor: "var(--accent-main)",
                color: "#fff",
              }}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 rounded font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--text-muted)",
                color: "#fff",
              }}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
