import { toggleLike } from "@/lib/postInteractions/postInteractionFxns/like";
import { usePostLike } from "@/lib/postInteractions/postInteractionHooks/usePostLike";
import { Heart } from "lucide-react";

export default function LikeButton({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) {
  const { liked, likeCount, setLiked } = usePostLike(postId, userId);

  const handleClick = async () => {
    const newState = await toggleLike(postId, userId);
    setLiked(newState);
  };

  return (
    <button
      className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition"
      onClick={handleClick}
    >
      <Heart fill={liked ? "currentColor" : "none"} />
      <span>{likeCount}</span>
    </button>
  );
}
