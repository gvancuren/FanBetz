'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';

type Props = {
  userId: number;
  initialImage: string;
  onImageChange?: (newUrl: string) => void;
};

export default function OwnerProfilePicture({ userId, initialImage, onImageChange }: Props) {
  const [imageUrl, setImageUrl] = useState(initialImage);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', String(userId));

    const res = await fetch('/api/update-profile-picture', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.user?.profileImage) {
        setImageUrl(data.user.profileImage); // ✅ instantly updates preview
        onImageChange?.(data.user.profileImage);
      }
    } else {
      alert('Failed to update profile image');
    }
  };

  const handleImageClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="relative group w-[120px] h-[120px]">
      <div onClick={handleImageClick} className="cursor-pointer relative">
        <Image
          src={imageUrl || '/default-avatar.png'}
          alt="Profile"
          width={120}
          height={120}
          className="rounded-full border-4 border-yellow-400 object-cover hover:opacity-80 transition"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 text-white text-sm font-semibold items-center justify-center hidden group-hover:flex rounded-full">
          Change
        </div>
      </div>
      <input
        ref={inputRef}
        id="profile-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
