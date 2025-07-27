"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { firestore } from "@/lib/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { PenLine } from "lucide-react";
import { availableTags } from "@/lib/tags";

export default function WritePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
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

    if (!user) {
      toast.error("You must be logged in to publish a post.");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag.");
      return;
    }

    setLoading(true);

    let imageUrl = "";

    if (selectedImage) {
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

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        imageUrl = data.secure_url;
      } catch (err) {
        toast.error("Image upload failed");
        console.error("Cloudinary upload error:", err);
        setLoading(false);
        return;
      }
    }

    try {
      await addDoc(collection(firestore, "posts"), {
        title,
        content,
        image: imageUrl,
        tags: selectedTags,
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
      setLoading(false);
    }
  };

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
          Write a Post <PenLine className="w-6 h-6 md:w-8 md:h-8" />
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading}
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
            disabled={loading}
          />

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="block w-1/2 p-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
            style={{
              borderColor: "var(--text-muted)",
              backgroundColor: "var(--bg-dark)",
            }}
            disabled={loading}
          />

          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm mb-1 text-[var(--text-muted)]">
                Image Preview:
              </p>
              <img
                src={previewUrl}
                alt="Selected preview"
                className="rounded-md w-full max-h-80 max-w-80 object-cover border"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>
          )}

          {/* Tag Selector */}
          <div>
            <label className="block mb-2 text-[var(--text-primary)] font-medium">
              Select Tags (max 3)
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--accent-main)",
              color: "#fff",
            }}
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}
