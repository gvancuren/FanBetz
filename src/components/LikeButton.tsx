'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { likePost } from '@/app/actions/likePost';

interface LikeButtonProps {
  postId: number;
  userId: number;
  hasLiked: boolean;
  likeCount: number;
}

export default function LikeButton({ postId, userId, hasLiked, likeCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(hasLiked);
  const [likes, setLikes] = useState(likeCount);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (isPending) return;

    startTransition(async () => {
      await likePost(postId, userId);
      setLiked(true);
      setLikes((prev) => prev + 1);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={liked || isPending}
      className="flex items-center gap-1 text-pink-400 hover:text-pink-500 transition"
    >
      <Heart className="w-5 h-5" />
      <span>{likes}</span>
    </button>
  );
}
