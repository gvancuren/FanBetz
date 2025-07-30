'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface OwnerProfilePictureProps {
  userId: number;
  initialImage?: string;
}

export default function OwnerProfilePicture({
  userId,
  initialImage = '/default-avatar.png',
}: OwnerProfilePictureProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    handleUpload(selectedFile);
  };

  const handleUpload = async (selectedFile: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    const res = await fetch('/api/updateprofilepicture', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const { imageUrl } = await res.json();
      setPreview(imageUrl);
    }

    setUploading(false);
  };

  return (
    <div
      className="relative w-32 h-32 cursor-pointer group"
      onClick={() => fileInputRef.current?.click()}
    >
      <Image
        src={preview}
        alt="Profile"
        width={128}
        height={128}
        className="rounded-full border-4 border-yellow-400 object-cover w-32 h-32 bg-zinc-900"
      />
      <div className="absolute inset-0 rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
        <span className="text-sm text-white font-medium">Edit</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
