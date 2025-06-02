"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import { ArrowLeft } from "lucide-react"; // ✅ Back arrow icon

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
  const [post, setPost] = useState<Post | null>(null);

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

  if (!post) return <div className="text-center mt-20">Loading...</div>;

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      {/* ✅ Back Button */}
      <button
        onClick={() => router.back()}
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
      <div className="mt-6 text-lg text-gray-800 whitespace-pre-wrap">
        {post.content}
      </div>
    </main>
  );
}
