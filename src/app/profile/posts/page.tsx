"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { ArrowLeft } from "lucide-react";

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
          orderBy("createdAt", "desc"),
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
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="relative flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/profile")}
          className=" text-sm hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
        </button>
        <h1 className="text-2xl font-bold text-center">My Posts</h1>
        <div className="w-8 md:w-12 lg:w-16" />
      </div>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">
          You haven’t written any posts yet.
        </p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => router.push(`../posts/${post.id}`)}
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
                by {post.author?.name || "You"} •{" "}
                {post.createdAt
                  ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                  : "Unknown date"}
              </p>
              <p className="text-gray-300 line-clamp-3">{post.content}</p>
              <button
                onClick={() => router.push(`/post/${post.id}`)}
                className="mt-3 text-blue-600 text-sm cursor-pointer hover:underline"
              >
                Read more
              </button>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
