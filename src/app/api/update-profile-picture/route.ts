'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProfileImageForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/updateprofilepicture', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.refresh(); // ✅ refresh profile page after upload
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Unexpected error during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      const preview = URL.createObjectURL(selectedFile);
      setPreviewUrl(preview);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-24 h-24 rounded-full object-cover border-2 border-yellow-400"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-300"
      />

      <button
        type="submit"
        disabled={uploading || !file}
        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Update Photo'}
      </button>
    </form>
  );
}
