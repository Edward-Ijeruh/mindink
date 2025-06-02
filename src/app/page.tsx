"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt?: Date;
  author: {
    name: string;
  };
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

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

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Blog Feed</h1>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
          >
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-56 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-sm text-gray-500 mb-2">
                by {post.author?.name || "Unknown Author"}
              </p>
              <p className="text-gray-700 line-clamp-3">{post.content}</p>
              <button
                onClick={() => router.push(`/posts/${post.id}`)}
                className="mt-3 text-blue-600 text-sm hover:underline cursor-pointer"
              >
                Read more →
              </button>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
