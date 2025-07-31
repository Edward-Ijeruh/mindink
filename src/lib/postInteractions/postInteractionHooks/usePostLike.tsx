import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export const usePostLike = (postId: string, userId: string) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const likeRef = doc(firestore, "posts", postId, "likes", userId);
    const postRef = doc(firestore, "posts", postId);

    getDoc(likeRef).then((snap) => {
      setLiked(snap.exists());
    });

    const unsubCount = onSnapshot(postRef, (docSnap) => {
      setLikeCount(docSnap.data()?.likeCount || 0);
    });

    return () => {
      if (typeof unsubCount === "function") unsubCount();
    };
  }, [postId, userId]);

  return { liked, likeCount, setLiked };
};
