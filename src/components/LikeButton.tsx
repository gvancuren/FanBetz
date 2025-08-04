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
      try {
        await likePost(postId, userId);
        setLiked((prev) => !prev);
        setLikes((prev) => (liked ? prev - 1 : prev + 1));
        console.log(`👍 Post ${postId} ${liked ? 'unliked' : 'liked'} by user ${userId}`);
      } catch (err) {
        console.error('❌ Failed to toggle like:', err);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1 transition ${
        liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'
      }`}
    >
      <Heart className="w-5 h-5" fill={liked ? '#ec4899' : 'none'} />
      <span>{likes}</span>
    </button>
  );
}
