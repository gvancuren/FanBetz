'use client';

import { useState } from 'react';

export default function EditProfile() {
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 3, // 🔁 Replace this with the correct logged-in user's ID
        profileImage,
        bio,
      }),
    });

    const data = await res.json();
    setMessage(data.message);

    // ✅ Redirect if update is successful
    if (data.username) {
      window.location.href = `/creator/${data.username}`;
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-sm font-medium">Profile Image URL</label>
          <input
            type="text"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 rounded text-black"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            rows={4}
            className="w-full p-2 rounded text-black"
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold"
        >
          Save Changes
        </button>

        {message && <p className="text-green-400 mt-4">{message}</p>}
      </form>
    </div>
  );
}
