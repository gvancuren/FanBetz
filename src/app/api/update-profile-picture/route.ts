'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfileImageForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/updateprofilepicture', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      router.refresh(); // ✅ Re-fetch server-side content like profile image
    }

    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) setFile(e.target.files[0]);
        }}
        className="mb-4"
      />
      <button
        type="submit"
        disabled={uploading}
        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
      >
        {uploading ? 'Uploading...' : 'Update Photo'}
      </button>
    </form>
  );
}
