import { doc, runTransaction, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export const toggleLike = async (postId: string, userId: string) => {
  const likeRef = doc(firestore, "posts", postId, "likes", userId);
  const postRef = doc(firestore, "posts", postId);

  return await runTransaction(firestore, async (transaction) => {
    const likeDoc = await transaction.get(likeRef);
    const postDoc = await transaction.get(postRef);

    if (!postDoc.exists()) throw new Error("Post not found");

    const currentCount = postDoc.data().likeCount || 0;

    if (likeDoc.exists()) {
      transaction.delete(likeRef);
      transaction.update(postRef, { likeCount: currentCount - 1 });
      return false;
    } else {
      transaction.set(likeRef, {
        userId,
        likedAt: Timestamp.now(),
      });
      transaction.update(postRef, { likeCount: currentCount + 1 });
      return true;
    }
  });
};
