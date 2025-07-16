'use client';

import { useState } from 'react';
import { followUser } from '@/app/actions/followUser';

interface FollowButtonProps {
  creatorId: number;
  isFollowingInitial: boolean;
}

export default function FollowButton({ creatorId, isFollowingInitial }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    try {
      setLoading(true);
      await followUser(creatorId);
      setIsFollowing(true);
    } catch (err) {
      console.error('Failed to follow user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading || isFollowing}
      className={`px-4 py-2 rounded-full font-semibold transition ${
        isFollowing ? 'bg-gray-600 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black'
      }`}
    >
      {isFollowing ? 'Following' : loading ? 'Following...' : 'Follow'}
    </button>
  );
}
