"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { User2 } from "lucide-react";

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
  };
  tags?: string[];
}

export default function MyPostsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || loading) return;

    const fetchPosts = async () => {
      try {
        const q = query(
          collection(firestore, "posts"),
          where("author.id", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const postsData: Post[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Post, "id">),
        }));

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user, loading]);

  if (loading || isLoading) return <Loader />;

  return (
    <main className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/profile")}
          className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] text-sm font-medium underline underline-offset-2 cursor-pointer"
        >
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-center text-[var(--text-primary)]">
          My Posts
        </h1>
        <div className="w-12" />
      </div>

      {/* No posts */}
      {posts.length === 0 ? (
        <p className="text-center text-[var(--text-muted)]">
          You haven’t written any posts yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
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
                  className="w-full h-48 object-cover rounded-xl mb-3"
                />
              )}

              <div className="flex flex-col gap-2">
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

                {/* Read More */}
                <div className="text-center mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/posts/${post.id}`);
                    }}
                    className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] text-sm font-medium underline underline-offset-4 transition-colors"
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
