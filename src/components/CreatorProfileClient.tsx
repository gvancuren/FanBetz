'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import FollowButton from './FollowButton';

interface CreatorProfileClientProps {
  id: number;
  name: string;
  followers: number;
  profileImage?: string | null;
  bio?: string | null;
  isOwner: boolean;
  isFollowingInitial: boolean;
  viewerId: number | null;
}

export function CreatorProfileClient({
  id,
  name,
  followers,
  profileImage,
  bio,
  isOwner,
  isFollowingInitial,
  viewerId,
}: CreatorProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageClick = () => {
    if (isOwner) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', id.toString());

    setIsUploading(true);
    try {
      const res = await fetch('/api/update-profile-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to upload profile image.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center mb-8">
      {/* Profile Image */}
      <div
        className={`relative ${isOwner ? 'group cursor-pointer' : ''} mb-4`}
        onClick={handleImageClick}
      >
        <img
          src={profileImage || '/default-profile.png'}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400"
        />
        {isOwner && (
          <>
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm">
              {isUploading ? 'Uploading...' : 'Edit'}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Creator Info */}
      <h1 className="text-4xl font-bold mb-1">{name}</h1>
      {bio && <p className="text-gray-400 text-sm mb-2 max-w-md">{bio}</p>}

      <div className="text-yellow-400 font-medium mb-4">
        Followers: {followers}
      </div>

      {/* Follow Button */}
      {!isOwner && viewerId && (
        <FollowButton
          creatorId={id}
          isFollowingInitial={isFollowingInitial}
        />
      )}
    </div>
  );
}
