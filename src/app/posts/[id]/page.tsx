"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(firestore, "posts", id as string);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        setPost(postSnap.data());
      }
    };

    if (id) fetchPost();
  }, [id]);

  if (!post) return <div className="text-center mt-20">Loading...</div>;

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
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
