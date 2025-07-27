"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { User2, Search } from "lucide-react";
import { availableTags } from "@/lib/tags";

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt?: { seconds: number };
  author: { name: string };
  tags?: string[];
}

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  //Gets query parameters on page mount
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag");

    setSearchTerm(q);
    setActiveTag(tag);
  }, [searchParams]);

  //Saves current filter to local storage
  useEffect(() => {
    localStorage.setItem(
      "lastFeedFilters",
      JSON.stringify({ searchTerm, activeTag })
    );
  }, [searchTerm, activeTag]);

  //Functions for search bar state using url parameters
  const updateURL = (newSearch: string, newTag: string | null) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("q", newSearch);
    if (newTag) params.set("tag", newTag);
    router.replace(`/?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    const newTag = activeTag === tag ? null : tag;
    setActiveTag(newTag);
    updateURL(searchTerm, newTag);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateURL(value, activeTag);
  };

  useEffect(() => {
    const postsRef = collection(firestore, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Post, "id">),
      }));
      setPosts(updatedPosts);
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts = useMemo(() => {
    let results = [...posts];

    if (searchTerm.trim()) {
      results = results.filter((post) =>
        post.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (activeTag) {
      results = results.filter((post) =>
        post.tags?.map((t) => t.toLowerCase()).includes(activeTag.toLowerCase())
      );
    }

    return results;
  }, [posts, searchTerm, activeTag]);

  return (
    <main className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          Welcome to EchoMind
        </h1>
        <p className="text-sm mx-4 md:text-base text-[var(--text-secondary)] mt-2">
          Discover insightful articles, explore topics you love, and join the
          conversation.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-xs md:w-lg max-w-md mx-auto mb-2">
        <input
          type="text"
          placeholder="Search by tags (e.g., AI, Health)..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] shadow-sm text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)]"
        />
        <Search
          className="absolute left-3 top-2.5 text-[var(--text-muted)]"
          size={18}
        />
      </div>

      {/* Tag Filters */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto py-2 mb-6 no-scrollbar">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap cursor-pointer transition ${
                activeTag === tag
                  ? "bg-[var(--accent-main)] text-white"
                  : "bg-[var(--accent-main)]/10 text-[var(--accent-main)] hover:bg-[var(--accent-main)]/20"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <p className="text-center text-[var(--text-muted)]">
          No posts match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/posts/${post.id}`)}
              className="p-6 cursor-pointer transition-shadow hover:shadow-md"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--card-text)",
                borderColor: "var(--card-border)",
                borderRadius: "var(--card-radius)",
                boxShadow: "var(--card-shadow)",
                borderWidth: "1px",
              }}
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-55 object-cover rounded-xl mb-3"
                />
              )}

              <div className="flex flex-col gap-2 flex-1">
                {/* Details */}
                <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] pb-2 border-b border-[var(--border-glass)]">
                  <div className="flex items-center gap-2">
                    <User2 size={15} />
                    <span>{post.author?.name || "You"}</span>
                  </div>
                  <span>
                    {post.createdAt
                      ? new Date(
                          post.createdAt.seconds * 1000
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-[var(--accent-main)]/10 text-xs text-[var(--accent-main)] px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read More */}
                <div className="text-center mt-3 cursor-pointer">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/posts/${post.id}`);
                    }}
                    className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] text-sm font-medium underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Read more
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
